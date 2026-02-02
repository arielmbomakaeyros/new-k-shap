// ==================== src/modules/disbursements/disbursements.service.ts ====================

import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Disbursement, DisbursementActionType, DisbursementAction } from '@/database/schemas/disbursement.schema';
import { User } from '@/database/schemas/user.schema';
import { EmailService } from '@/email/email.service';
import { AuditLogService } from '@/modules/audit-logs/audit-logs.service';
import { NotificationService } from '@/modules/notifications/notifications.service';

@Injectable()
export class DisbursementsService {
  constructor(
    @InjectModel(Disbursement.name) private disbursementModel: Model<Disbursement>,
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
    private notificationService: NotificationService,
  ) {}

  // ==================== CREATE DISBURSEMENT ====================
  
  async create(dto: any, user: any, ipAddress: string, userAgent: string) {
    const referenceNumber = await this.generateReferenceNumber(user.company);

    const disbursement = new this.disbursementModel({
      ...dto,
      company: user.company,
      referenceNumber,
      status: 'pending_dept_head',
      createdBy: user._id,
      // Initialize workflow steps
      agentSubmission: {
        status: 'approved',
        isCompleted: true,
        completedAt: new Date(),
        completedBy: user._id,
        notes: dto.notes || '',
        history: [{
          action: DisbursementActionType.CREATED,
          performedBy: user._id,
          performedByName: `${user.firstName} ${user.lastName}`,
          performedByRole: user.systemRoles.join(', '),
          performedAt: new Date(),
          notes: dto.notes,
          metadata: { ipAddress, userAgent },
        }],
      },
      deptHeadValidation: { status: 'pending', history: [] },
      validatorApproval: { status: 'pending', history: [] },
      cashierExecution: { status: 'pending', history: [] },
      actionHistory: [{
        action: DisbursementActionType.CREATED,
        performedBy: user._id,
        performedByName: `${user.firstName} ${user.lastName}`,
        performedByRole: user.systemRoles.join(', '),
        performedAt: new Date(),
        notes: dto.notes,
        metadata: { ipAddress, userAgent },
      }],
      statusTimeline: {
        draft: new Date(),
        pendingDeptHead: new Date(),
      },
    });

    await disbursement.save();

    // Send notification to department head
    await this.notifyDepartmentHead(disbursement);

    // Audit log
    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: 'DISBURSEMENT_CREATED',
      actionDescription: `Created disbursement ${referenceNumber}`,
      resourceType: 'disbursement',
      resourceId: disbursement._id,
      metadata: { amount: dto.amount, beneficiary: dto.beneficiary },
      ipAddress,
      userAgent,
    });

    return disbursement;
  }

  // ==================== VALIDATE BY DEPT HEAD ====================
  
  async validateByDeptHead(
    id: string,
    dto: { notes?: string; approved: boolean },
    user: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const disbursement = await this.findById(id);
    
    // Validate user is dept head of this department
    this.validateUserIsDeptHead(user, disbursement);
    
    // Check current status
    if (disbursement.status !== 'pending_dept_head') {
      throw new BadRequestException('Disbursement is not pending department head validation');
    }

    const action: DisbursementAction = {
      action: DisbursementActionType.DEPT_HEAD_VALIDATED,
      performedBy: user._id,
      performedByName: `${user.firstName} ${user.lastName}`,
      performedByRole: user.systemRoles.join(', '),
      performedAt: new Date(),
      notes: dto.notes,
      metadata: {
        approved: dto.approved,
        ipAddress,
        userAgent,
      },
    };

    // Update workflow step
    disbursement.deptHeadValidation = {
      status: dto.approved ? 'approved' : 'rejected',
      isCompleted: dto.approved,
      completedAt: new Date(),
      completedBy: user._id,
      notes: dto.notes,
      history: [...(disbursement.deptHeadValidation.history || []), action],
      wasSkipped: false,
      wasUndone: false,
    };

    // Add to action history
    disbursement.actionHistory.push(action);

    if (dto.approved) {
      // Move to next step
      disbursement.status = 'pending_validator';
      disbursement.statusTimeline.pendingValidator = new Date();
      
      // Notify validators
      await this.notifyValidators(disbursement);
    } else {
      // Rejection
      disbursement.status = 'rejected';
      disbursement.currentRejection = {
        rejectedBy: user._id,
        rejectedAt: new Date(),
        stage: 'dept_head',
        reason: dto.notes || '',
        wasUndone: false,
      };
      disbursement.rejectionHistory.push({
        rejectedBy: user._id,
        rejectedAt: new Date(),
        stage: 'dept_head',
        reason: dto.notes || '',
      });
      
      // Notify creator
      await this.notifyRejection(disbursement, 'dept_head');
    }

    await disbursement.save();

    // Audit log
    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: dto.approved ? 'DEPT_HEAD_VALIDATED' : 'DISBURSEMENT_REJECTED',
      actionDescription: dto.approved 
        ? `Department head validated disbursement ${disbursement.referenceNumber}`
        : `Department head rejected disbursement ${disbursement.referenceNumber}`,
      resourceType: 'disbursement',
      resourceId: disbursement._id,
      metadata: { approved: dto.approved, notes: dto.notes },
      ipAddress,
      userAgent,
    });

    return disbursement;
  }

  // ==================== APPROVE BY VALIDATOR ====================
  
  async approveByValidator(
    id: string,
    dto: { notes?: string; approved: boolean },
    user: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const disbursement = await this.findById(id);
    
    // Validate user is validator
    this.validateUserIsValidator(user);
    
    // Check approval limit
    if (user.maxApprovalAmount && disbursement.amount > user.maxApprovalAmount) {
      throw new ForbiddenException(
        `Amount ${disbursement.amount} exceeds your approval limit of ${user.maxApprovalAmount}`
      );
    }
    
    // Check current status
    if (disbursement.status !== 'pending_validator') {
      throw new BadRequestException('Disbursement is not pending validator approval');
    }

    const action: DisbursementAction = {
      action: DisbursementActionType.VALIDATOR_APPROVED,
      performedBy: user._id,
      performedByName: `${user.firstName} ${user.lastName}`,
      performedByRole: user.systemRoles.join(', '),
      performedAt: new Date(),
      notes: dto.notes,
      metadata: {
        approved: dto.approved,
        approvalLimit: user.maxApprovalAmount,
        ipAddress,
        userAgent,
      },
    };

    disbursement.validatorApproval = {
      status: dto.approved ? 'approved' : 'rejected',
      isCompleted: dto.approved,
      completedAt: new Date(),
      completedBy: user._id,
      notes: dto.notes,
      history: [...(disbursement.validatorApproval.history || []), action],
      wasSkipped: false,
      wasUndone: false,
    };

    disbursement.actionHistory.push(action);

    if (dto.approved) {
      disbursement.status = 'pending_cashier';
      disbursement.statusTimeline.pendingCashier = new Date();
      await this.notifyCashiers(disbursement);
    } else {
      disbursement.status = 'rejected';
      disbursement.currentRejection = {
        rejectedBy: user._id,
        rejectedAt: new Date(),
        stage: 'validator',
        reason: dto.notes || '',
        wasUndone: false,
      };
      disbursement.rejectionHistory.push({
        rejectedBy: user._id,
        rejectedAt: new Date(),
        stage: 'validator',
        reason: dto.notes || '',
      });
      await this.notifyRejection(disbursement, 'validator');
    }

    await disbursement.save();

    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: dto.approved ? 'VALIDATOR_APPROVED' : 'DISBURSEMENT_REJECTED',
      actionDescription: dto.approved
        ? `Validator approved disbursement ${disbursement.referenceNumber}`
        : `Validator rejected disbursement ${disbursement.referenceNumber}`,
      resourceType: 'disbursement',
      resourceId: disbursement._id,
      metadata: { approved: dto.approved, notes: dto.notes },
      ipAddress,
      userAgent,
    });

    return disbursement;
  }

  // ==================== EXECUTE BY CASHIER ====================
  
  async executeByCashier(
    id: string,
    dto: { notes?: string; receiptNumber?: string },
    user: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const disbursement = await this.findById(id);
    
    this.validateUserIsCashier(user);
    
    if (disbursement.status !== 'pending_cashier') {
      throw new BadRequestException('Disbursement is not pending cashier execution');
    }

    const action: DisbursementAction = {
      action: DisbursementActionType.CASHIER_EXECUTED,
      performedBy: user._id,
      performedByName: `${user.firstName} ${user.lastName}`,
      performedByRole: user.systemRoles.join(', '),
      performedAt: new Date(),
      notes: dto.notes,
      metadata: {
        receiptNumber: dto.receiptNumber,
        ipAddress,
        userAgent,
      },
    };

    disbursement.cashierExecution = {
      status: 'approved',
      isCompleted: true,
      completedAt: new Date(),
      completedBy: user._id,
      notes: dto.notes,
      history: [...(disbursement.cashierExecution.history || []), action],
      wasSkipped: false,
      wasUndone: false,
    };

    disbursement.actionHistory.push(action);
    disbursement.status = 'completed';
    disbursement.isCompleted = true;
    disbursement.completedAt = new Date();
    disbursement.actualPaymentDate = new Date();
    disbursement.statusTimeline.completed = new Date();

    await disbursement.save();

    // Notify all involved parties
    await this.notifyCompletion(disbursement);

    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: 'CASHIER_EXECUTED',
      actionDescription: `Cashier executed disbursement ${disbursement.referenceNumber}`,
      resourceType: 'disbursement',
      resourceId: disbursement._id,
      metadata: { receiptNumber: dto.receiptNumber },
      ipAddress,
      userAgent,
    });

    return disbursement;
  }

  // ==================== FORCE COMPLETE (COMPANY SUPER ADMIN PRIMARY) ====================
  
  async forceComplete(
    id: string,
    dto: { reason: string },
    user: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const disbursement = await this.findById(id);
    
    // Primary: Company Super Admin (first user of the company)
    // Secondary: Kaeyros (only for emergency support when company can't handle)
    const isCompanySuperAdmin = user.systemRoles?.includes('company_super_admin');
    const isKaeyrosSupport = user.isKaeyrosUser;
    const belongsToCompany = user.company?.toString() === disbursement.company.toString();
    
    if (!isCompanySuperAdmin && !isKaeyrosSupport) {
      throw new ForbiddenException('Only company super administrators can force complete disbursements');
    }
    
    // If Kaeyros is doing it, must not be from this company (emergency support)
    if (isKaeyrosSupport && belongsToCompany) {
      throw new ForbiddenException('Kaeyros users should use company super admin account for company operations');
    }
    
    // Log if Kaeyros is intervening (for audit purposes)
    const isKaeyrosIntervention = isKaeyrosSupport && !belongsToCompany;

    const now = new Date();
    const action: DisbursementAction = {
      action: DisbursementActionType.FORCE_COMPLETED,
      performedBy: user._id,
      performedByName: `${user.firstName} ${user.lastName}`,
      performedByRole: user.systemRoles.join(', '),
      performedAt: now,
      reason: dto.reason,
      metadata: { ipAddress, userAgent },
    };

    // Mark all steps as skipped
    ['deptHeadValidation', 'validatorApproval', 'cashierExecution'].forEach(step => {
      if (!disbursement[step].isCompleted) {
        disbursement[step] = {
          status: 'skipped',
          isCompleted: true,
          completedAt: now,
          completedBy: user._id,
          wasSkipped: true,
          skippedBy: user._id,
          skippedAt: now,
          history: [...(disbursement[step].history || []), action],
          wasUndone: false,
        };
      }
    });

    disbursement.actionHistory.push(action);
    disbursement.forceCompleted = true;
    disbursement.forceCompletedBy = user._id;
    disbursement.forceCompletedAt = now;
    disbursement.forceCompletionReason = dto.reason;
    disbursement.status = 'completed';
    disbursement.isCompleted = true;
    disbursement.completedAt = now;
    disbursement.statusTimeline.completed = now;

    await disbursement.save();

    // Audit log with different severity based on who did it
    await this.auditLogService.log({
      user: user._id,
      company: user.company || disbursement.company,
      action: 'DISBURSEMENT_FORCE_COMPLETED',
      actionDescription: isKaeyrosIntervention
        ? `[KAEYROS INTERVENTION] Force completed disbursement ${disbursement.referenceNumber}`
        : `Force completed disbursement ${disbursement.referenceNumber}`,
      resourceType: 'disbursement',
      resourceId: disbursement._id,
      metadata: { 
        reason: dto.reason,
        isKaeyrosIntervention,
        interventionType: isKaeyrosIntervention ? 'emergency_support' : 'company_admin'
      },
      ipAddress,
      userAgent,
      severity: isKaeyrosIntervention ? 'critical' : 'warning', // Critical if Kaeyros intervened
    });
    
    // If Kaeyros intervened, notify company super admin
    if (isKaeyrosIntervention) {
      await this.notifyKaeyrosIntervention(disbursement, user, dto.reason);
    }

    return disbursement;
  }

  // ==================== UNDO DEPT HEAD VALIDATION ====================
  
  async undoDeptHeadValidation(
    id: string,
    dto: { reason: string },
    user: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const disbursement = await this.findById(id);
    
    // Check permission to undo
    // Priority: 1) Company Super Admin, 2) Kaeyros (emergency), 3) Configured roles
    if (!this.canUndoAction(user, disbursement, 'deptHeadValidation')) {
      throw new ForbiddenException('You do not have permission to undo this validation');
    }

    // Check if step was completed
    if (!disbursement.deptHeadValidation.isCompleted) {
      throw new BadRequestException('Department head validation was not completed');
    }

    // Check if already undone
    if (disbursement.deptHeadValidation.wasUndone) {
      throw new BadRequestException('This validation has already been undone');
    }

    // Get the original action being undone
    const originalAction = disbursement.deptHeadValidation.history[
      disbursement.deptHeadValidation.history.length - 1
    ];

    const undoAction: DisbursementAction = {
      action: DisbursementActionType.DEPT_HEAD_VALIDATION_UNDONE,
      performedBy: user._id,
      performedByName: `${user.firstName} ${user.lastName}`,
      performedByRole: user.systemRoles.join(', '),
      performedAt: new Date(),
      reason: dto.reason,
      metadata: {
        undoneAction: {
          actionId: originalAction._id?.toString(),
          originalAction: originalAction.action,
          originalPerformedBy: originalAction.performedBy.toString(),
          originalPerformedAt: originalAction.performedAt,
        },
        ipAddress,
        userAgent,
      },
    };

    // Update workflow step
    disbursement.deptHeadValidation.wasUndone = true;
    disbursement.deptHeadValidation.undoneBy = user._id;
    disbursement.deptHeadValidation.undoneAt = new Date();
    disbursement.deptHeadValidation.undoReason = dto.reason;
    disbursement.deptHeadValidation.isCompleted = false;
    disbursement.deptHeadValidation.status = 'undone';
    disbursement.deptHeadValidation.history.push(undoAction);

    // Add to action history
    disbursement.actionHistory.push(undoAction);

    // Revert status if needed
    if (disbursement.status === 'pending_validator' || disbursement.status === 'completed') {
      disbursement.status = 'pending_dept_head';
    }

    await disbursement.save();

    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: 'DEPT_HEAD_VALIDATION_UNDONE',
      actionDescription: `Undid department head validation for ${disbursement.referenceNumber}`,
      resourceType: 'disbursement',
      resourceId: disbursement._id,
      metadata: { reason: dto.reason, originalAction: originalAction.action },
      ipAddress,
      userAgent,
      severity: 'warning',
    });

    return disbursement;
  }

  // ==================== SIMILAR UNDO METHODS FOR OTHER STEPS ====================
  
  async undoValidatorApproval(id: string, dto: any, user: any, ip: string, ua: string) {
    // Similar implementation as undoDeptHeadValidation
    // ... (implement following same pattern)
  }

  async undoCashierExecution(id: string, dto: any, user: any, ip: string, ua: string) {
    // Similar implementation
    // ... (implement following same pattern)
  }

  async undoRejection(id: string, dto: any, user: any, ip: string, ua: string) {
    // Undo a rejection and return to previous status
    // ... (implement following same pattern)
  }

  async undoForceCompletion(id: string, dto: any, user: any, ip: string, ua: string) {
    // Undo force completion
    // ... (implement following same pattern)
  }

  // ==================== REVERT TO STATUS ====================
  
  async revertToStatus(
    id: string,
    dto: { targetStatus: string; reason: string },
    user: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const disbursement = await this.findById(id);
    
    // Only super admin or Kaeyros can revert status
    if (!user.isKaeyrosUser && !user.systemRoles?.includes('company_super_admin')) {
      throw new ForbiddenException('Only super administrators can revert status');
    }

    const previousStatus = disbursement.status;

    const action: DisbursementAction = {
      action: DisbursementActionType.STATUS_REVERTED,
      performedBy: user._id,
      performedByName: `${user.firstName} ${user.lastName}`,
      performedByRole: user.systemRoles.join(', '),
      performedAt: new Date(),
      reason: dto.reason,
      metadata: {
        previousStatus,
        newStatus: dto.targetStatus,
        ipAddress,
        userAgent,
      },
    };

    disbursement.status = dto.targetStatus as any;
    disbursement.actionHistory.push(action);

    await disbursement.save();

    await this.auditLogService.log({
      user: user._id,
      company: user.company,
      action: 'STATUS_REVERTED',
      actionDescription: `Reverted disbursement ${disbursement.referenceNumber} from ${previousStatus} to ${dto.targetStatus}`,
      resourceType: 'disbursement',
      resourceId: disbursement._id,
      metadata: { previousStatus, newStatus: dto.targetStatus, reason: dto.reason },
      ipAddress,
      userAgent,
      severity: 'critical',
    });

    return disbursement;
  }

  // ==================== HELPER METHODS ====================
  
  private async findById(id: string): Promise<Disbursement> {
    const disbursement = await this.disbursementModel.findById(id);
    if (!disbursement || disbursement.isDeleted) {
      throw new NotFoundException('Disbursement not found');
    }
    return disbursement;
  }

  private validateUserIsDeptHead(user: any, disbursement: Disbursement) {
    const isDeptHead = user.systemRoles?.includes('department_head');
    if (!isDeptHead) {
      throw new ForbiddenException('Only department heads can validate');
    }
    
    const belongsToDept = user.departments?.some(
      (dept: any) => dept.toString() === disbursement.department.toString()
    );
    if (!belongsToDept) {
      throw new ForbiddenException('You can only validate disbursements from your department');
    }
  }

  private validateUserIsValidator(user: any) {
    if (!user.systemRoles?.includes('validator')) {
      throw new ForbiddenException('Only validators can approve');
    }
  }

  private validateUserIsCashier(user: any) {
    if (!user.systemRoles?.includes('cashier')) {
      throw new ForbiddenException('Only cashiers can execute');
    }
  }

  private canUndoAction(user: any, disbursement: Disbursement, step: string): boolean {
    // 1. Company Super Admin (first user) can ALWAYS undo their company's disbursements
    const isCompanySuperAdmin = user.systemRoles?.includes('company_super_admin');
    const belongsToCompany = user.company?.toString() === disbursement.company.toString();
    
    if (isCompanySuperAdmin && belongsToCompany) {
      return true;
    }
    
    // 2. Kaeyros can undo for emergency support (any company)
    if (user.isKaeyrosUser) {
      return true; // But will be logged as critical intervention
    }

    // 3. Check step-specific permissions configured for this company
    // (Load from UndoPermissionsSettings for this company)
    // This allows companies to give undo permissions to validators, dept heads, etc.
    
    // TODO: Implement loading company-specific undo rules
    // const rules = await this.getCompanyUndoRules(disbursement.company);
    // const stepRule = rules.find(r => r.action === step);
    // if (stepRule && stepRule.allowedRoles.includes(user.role)) {
    //   return checkTimeLimit(stepRule, action);
    // }
    
    return false;
  }

  private async generateReferenceNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.disbursementModel.countDocuments({
      company: companyId,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    });
    return `DISB-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private async notifyDepartmentHead(disbursement: Disbursement) {
    // Implementation
  }

  private async notifyValidators(disbursement: Disbursement) {
    // Implementation
  }

  private async notifyCashiers(disbursement: Disbursement) {
    // Implementation
  }

  private async notifyRejection(disbursement: Disbursement, stage: string) {
    // Implementation
  }

  private async notifyCompletion(disbursement: Disbursement) {
    // Implementation
  }
  
  private async notifyKaeyrosIntervention(disbursement: Disbursement, kaeyrosUser: any, reason: string) {
    // Notify company super admin that Kaeyros intervened on their disbursement
    // This is for transparency - company should know when Kaeyros accessed their data
    // Implementation
  }
}


































// ==================== src/modules/disbursements/dto/undo-action.dto.ts ====================

import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UndoActionDto {
  @ApiProperty({ 
    description: 'Reason for undoing this action',
    example: 'Incorrect validation, need to re-review documents'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Additional notes or context',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RevertStatusDto {
  @ApiProperty({ 
    description: 'Target status to revert to',
    enum: ['draft', 'pending_dept_head', 'pending_validator', 'pending_cashier'],
  })
  @IsEnum(['draft', 'pending_dept_head', 'pending_validator', 'pending_cashier'])
  @IsNotEmpty()
  targetStatus: string;

  @ApiProperty({ 
    description: 'Reason for reverting status',
    example: 'Need to correct department assignment'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ForceCompleteDto {
  @ApiProperty({ 
    description: 'Reason for force completing',
    example: 'Urgent disbursement, all approvals obtained verbally'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Optional notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ValidateDto {
  @ApiProperty({ 
    description: 'Whether to approve or reject',
  })
  @IsNotEmpty()
  approved: boolean;

  @ApiProperty({
    description: 'Notes or comments',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ExecuteDto {
  @ApiProperty({
    description: 'Receipt or transaction number',
    required: false,
  })
  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @ApiProperty({
    description: 'Execution notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ==================== src/modules/settings/dto/undo-permissions-settings.dto.ts ====================

import { IsBoolean, IsArray, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UndoPermissionRule {
  @ApiProperty({ description: 'Action that can be undone' })
  @IsString()
  action: string; // 'dept_head_validation', 'validator_approval', 'cashier_execution', etc.

  @ApiProperty({ description: 'Can this action be undone?' })
  @IsBoolean()
  canUndo: boolean;

  @ApiProperty({ description: 'Roles that can undo this action', type: [String] })
  @IsArray()
  @IsString({ each: true })
  allowedRoles: string[]; // ['company_super_admin', 'kaeyros_admin', 'validator']

  @ApiProperty({ description: 'Time limit for undo in hours (null = no limit)', required: false })
  @IsOptional()
  timeLimitHours?: number; // e.g., 24 = can only undo within 24 hours

  @ApiProperty({ description: 'Can undo after next step is completed?', required: false })
  @IsOptional()
  @IsBoolean()
  canUndoAfterNextStep?: boolean; // If false, cannot undo dept_head if validator already approved
}

export class UpdateUndoPermissionsDto {
  @ApiProperty({ type: [UndoPermissionRule] })
  @ValidateNested({ each: true })
  @Type(() => UndoPermissionRule)
  rules: UndoPermissionRule[];
}

// ==================== src/database/schemas/undo-permissions-settings.schema.ts ====================

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseEntity } from './core-entities.schema';

@Schema({ _id: false })
export class UndoPermissionRule {
  @Prop({ required: true })
  action: string;

  @Prop({ default: false })
  canUndo: boolean;

  @Prop({ type: [String], default: [] })
  allowedRoles: string[];

  @Prop({ type: Number, default: null })
  timeLimitHours: number;

  @Prop({ default: false })
  canUndoAfterNextStep: boolean;

  @Prop({ default: false })
  requiresApproval: boolean; // Requires super admin approval to undo

  @Prop({ type: [String], default: [] })
  notifyOnUndo: string[]; // Roles to notify when undo happens
}

@Schema({ timestamps: true })
export class UndoPermissionsSettings extends BaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: MongooseSchema.Types.ObjectId;

  @Prop({ type: [UndoPermissionRule], default: [] })
  rules: UndoPermissionRule[];

  @Prop({ default: false })
  logAllUndos: boolean; // Log all undos to audit trail

  @Prop({ default: true })
  requireReasonForUndo: boolean; // Reason is mandatory

  @Prop({ type: [String], default: ['company_super_admin', 'kaeyros_admin'] })
  superUndoRoles: string[]; // Roles that can undo anything, anytime
}

export const UndoPermissionsSettingsSchema = SchemaFactory.createForClass(UndoPermissionsSettings);

// ==================== src/modules/disbursements/disbursements.controller.ts ====================

import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DisbursementsService } from './disbursements.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { 
  UndoActionDto, 
  RevertStatusDto, 
  ForceCompleteDto,
  ValidateDto,
  ExecuteDto,
} from './dto';

@Controller('disbursements')
@UseGuards(JwtAuthGuard)
export class DisbursementsController {
  constructor(private disbursementsService: DisbursementsService) {}

  // ==================== WORKFLOW ACTIONS ====================

  @Post(':id/validate')
  @RequirePermissions('disbursement.validate')
  async validate(
    @Param('id') id: string,
    @Body() dto: ValidateDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.validateByDeptHead(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/approve')
  @RequirePermissions('disbursement.approve')
  async approve(
    @Param('id') id: string,
    @Body() dto: ValidateDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.approveByValidator(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/execute')
  @RequirePermissions('disbursement.execute')
  async execute(
    @Param('id') id: string,
    @Body() dto: ExecuteDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.executeByCashier(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/force-complete')
  @RequirePermissions('disbursement.force_complete')
  async forceComplete(
    @Param('id') id: string,
    @Body() dto: ForceCompleteDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.forceComplete(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  // ==================== UNDO ACTIONS ====================

  @Post(':id/undo-dept-head-validation')
  @RequirePermissions('disbursement.undo_validation')
  async undoDeptHeadValidation(
    @Param('id') id: string,
    @Body() dto: UndoActionDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.undoDeptHeadValidation(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/undo-validator-approval')
  @RequirePermissions('disbursement.undo_approval')
  async undoValidatorApproval(
    @Param('id') id: string,
    @Body() dto: UndoActionDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.undoValidatorApproval(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/undo-cashier-execution')
  @RequirePermissions('disbursement.undo_execution')
  async undoCashierExecution(
    @Param('id') id: string,
    @Body() dto: UndoActionDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.undoCashierExecution(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/undo-rejection')
  @RequirePermissions('disbursement.undo_rejection')
  async undoRejection(
    @Param('id') id: string,
    @Body() dto: UndoActionDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.undoRejection(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/undo-force-completion')
  @RequirePermissions('disbursement.undo_force_complete')
  async undoForceCompletion(
    @Param('id') id: string,
    @Body() dto: UndoActionDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.undoForceCompletion(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  // ==================== STATUS REVERT ====================

  @Post(':id/revert-status')
  @RequirePermissions('disbursement.revert_status')
  async revertStatus(
    @Param('id') id: string,
    @Body() dto: RevertStatusDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disbursementsService.revertToStatus(
      id,
      dto,
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  // ==================== GET ACTION TIMELINE ====================

  @Post(':id/timeline')
  async getTimeline(@Param('id') id: string, @CurrentUser() user: any) {
    const disbursement = await this.disbursementsService.findById(id);
    
    return {
      success: true,
      data: {
        currentStatus: disbursement.status,
        statusTimeline: disbursement.statusTimeline,
        actionHistory: disbursement.actionHistory.map(action => ({
          action: action.action,
          performedBy: action.performedByName,
          performedByRole: action.performedByRole,
          performedAt: action.performedAt,
          notes: action.notes,
          reason: action.reason,
          metadata: action.metadata,
        })),
        workflowSteps: {
          agentSubmission: {
            status: disbursement.agentSubmission.status,
            completedAt: disbursement.agentSubmission.completedAt,
            completedBy: disbursement.agentSubmission.completedBy,
            wasUndone: disbursement.agentSubmission.wasUndone,
            history: disbursement.agentSubmission.history,
          },
          deptHeadValidation: {
            status: disbursement.deptHeadValidation.status,
            completedAt: disbursement.deptHeadValidation.completedAt,
            completedBy: disbursement.deptHeadValidation.completedBy,
            wasUndone: disbursement.deptHeadValidation.wasUndone,
            history: disbursement.deptHeadValidation.history,
          },
          validatorApproval: {
            status: disbursement.validatorApproval.status,
            completedAt: disbursement.validatorApproval.completedAt,
            completedBy: disbursement.validatorApproval.completedBy,
            wasUndone: disbursement.validatorApproval.wasUndone,
            history: disbursement.validatorApproval.history,
          },
          cashierExecution: {
            status: disbursement.cashierExecution.status,
            completedAt: disbursement.cashierExecution.completedAt,
            completedBy: disbursement.cashierExecution.completedBy,
            wasUndone: disbursement.cashierExecution.wasUndone,
            history: disbursement.cashierExecution.history,
          },
        },
      },
    };
  }
}

// ==================== DEFAULT UNDO PERMISSIONS (SEED DATA) ====================

export const DEFAULT_UNDO_PERMISSIONS = {
  rules: [
    {
      action: 'dept_head_validation',
      canUndo: true,
      allowedRoles: ['validator', 'department_head'], // Company super admin always can
      timeLimitHours: 24, // Can only undo within 24 hours
      canUndoAfterNextStep: false, // Cannot undo if validator already approved
      requiresApproval: false,
      notifyOnUndo: ['company_super_admin'],
    },
    {
      action: 'validator_approval',
      canUndo: true,
      allowedRoles: ['validator'], // Company super admin always can
      timeLimitHours: 24,
      canUndoAfterNextStep: false, // Cannot undo if cashier already executed
      requiresApproval: false,
      notifyOnUndo: ['company_super_admin'],
    },
    {
      action: 'cashier_execution',
      canUndo: false, // Only company super admin can (configured below)
      allowedRoles: [], // Empty = only company super admin
      timeLimitHours: 48,
      canUndoAfterNextStep: true, // Can undo even if completed
      requiresApproval: true, // Requires explicit approval
      notifyOnUndo: ['company_super_admin', 'validator'],
    },
    {
      action: 'rejection',
      canUndo: true,
      allowedRoles: ['validator', 'department_head'], // Company super admin always can
      timeLimitHours: null, // No time limit
      canUndoAfterNextStep: true,
      requiresApproval: false,
      notifyOnUndo: ['company_super_admin'],
    },
    {
      action: 'force_completion',
      canUndo: false, // Only company super admin can undo their own force completion
      allowedRoles: [], // Empty = only company super admin
      timeLimitHours: 72,
      canUndoAfterNextStep: true,
      requiresApproval: true,
      notifyOnUndo: ['company_super_admin'],
    },
  ],
  logAllUndos: true,
  requireReasonForUndo: true,
  // UPDATED: Company super admin is the primary super undo role
  superUndoRoles: ['company_super_admin'], // Kaeyros not in here - they're emergency only
  
  // NEW: Kaeyros intervention settings
  kaeyrosInterventionSettings: {
    logAsEmergencySupport: true, // Log Kaeyros actions as emergency support
    notifyCompanySuperAdmin: true, // Notify company when Kaeyros intervenes
    requireReason: true, // Kaeyros must provide reason for intervention
    severity: 'critical', // All Kaeyros interventions are critical severity
  },
};




















