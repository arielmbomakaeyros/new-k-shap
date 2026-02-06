import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { Disbursement } from '../../database/schemas/disbursement.schema';
import {
  DisbursementStatus,
  DisbursementActionType,
  UserRole,
} from '../../database/schemas/enums';
import { Company } from '../../database/schemas/company.schema';
import { WorkflowTemplate } from '../../database/schemas/workflow-template.schema';
import { User } from '../../database/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import {
  NotificationChannel,
  NotificationType,
} from '../notifications/dto/create-notification.dto';

interface FindAllOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  department?: string;
  office?: string;
  beneficiary?: string;
  disbursementType?: string;
  createdBy?: string;
  paymentMethod?: string;
  priority?: string;
  isUrgent?: string;
  isRetroactive?: string;
  isCompleted?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  tags?: string;
}

@Injectable()
export class DisbursementsService {
  constructor(
    @InjectModel(Disbursement.name)
    private disbursementModel: Model<Disbursement>,
    @InjectModel(Company.name)
    private companyModel: Model<Company>,
    @InjectModel(WorkflowTemplate.name)
    private workflowTemplateModel: Model<WorkflowTemplate>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private notificationsService: NotificationsService,
  ) {}

  private generateReferenceNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `DISB-${datePart}-${randomPart}`;
  }

  private parseObjectIdList(value: string | undefined, fieldName: string) {
    if (!value) return [];
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const ids = items.map((item) => {
      if (!Types.ObjectId.isValid(item)) {
        throw new BadRequestException(`Invalid ${fieldName} id`);
      }
      return new Types.ObjectId(item);
    });
    return ids;
  }

  private getSystemRoles(user?: any): string[] {
    return user?.systemRoles || [];
  }

  private hasRole(user: any, role: UserRole) {
    return this.getSystemRoles(user).includes(role);
  }

  private isElevatedUser(user?: any) {
    if (!user) return false;
    if (user.isKaeyrosUser) return true;
    return (
      this.hasRole(user, UserRole.COMPANY_SUPER_ADMIN) ||
      this.hasRole(user, UserRole.VALIDATOR) ||
      this.hasRole(user, UserRole.CASHIER)
    );
  }

  private getUserId(user?: any): string | null {
    const id = user?._id || user?.id;
    return id ? id.toString() : null;
  }

  private getDepartmentIds(user?: any): string[] {
    return (user?.departments || [])
      .map((d: any) => (d?._id || d)?.toString())
      .filter(Boolean);
  }

  private buildAccessFilter(user?: any) {
    if (!user || this.isElevatedUser(user)) return {};

    if (this.hasRole(user, UserRole.DEPARTMENT_HEAD)) {
      const deptIds = this.getDepartmentIds(user);
      return {
        department: deptIds.length
          ? { $in: deptIds.map((id) => new Types.ObjectId(id)) }
          : new Types.ObjectId('000000000000000000000000'),
      };
    }

    const userId = this.getUserId(user);
    return userId ? { createdBy: new Types.ObjectId(userId) } : {};
  }

  private ensureUserCanAccessDisbursement(
    user: any,
    disbursement: Disbursement,
  ) {
    if (!user || this.isElevatedUser(user)) return;

    if (this.hasRole(user, UserRole.DEPARTMENT_HEAD)) {
      const deptIds = this.getDepartmentIds(user);
      const deptId = disbursement.department?.toString();
      if (!deptId || !deptIds.includes(deptId)) {
        throw new ForbiddenException(
          'You do not have access to this disbursement',
        );
      }
      return;
    }

    const userId = this.getUserId(user);
    const createdBy = disbursement.createdBy?.toString();
    if (!userId || !createdBy || userId !== createdBy) {
      throw new ForbiddenException(
        'You do not have access to this disbursement',
      );
    }
  }

  private roleToStatus(role: string): DisbursementStatus | null {
    switch (role) {
      case UserRole.DEPARTMENT_HEAD:
        return DisbursementStatus.PENDING_DEPT_HEAD;
      case UserRole.VALIDATOR:
        return DisbursementStatus.PENDING_VALIDATOR;
      case UserRole.CASHIER:
        return DisbursementStatus.PENDING_CASHIER;
      default:
        return null;
    }
  }

  private statusToRole(status: DisbursementStatus): UserRole | null {
    switch (status) {
      case DisbursementStatus.PENDING_DEPT_HEAD:
        return UserRole.DEPARTMENT_HEAD;
      case DisbursementStatus.PENDING_VALIDATOR:
        return UserRole.VALIDATOR;
      case DisbursementStatus.PENDING_CASHIER:
        return UserRole.CASHIER;
      default:
        return null;
    }
  }

  private getStepKey(
    role: UserRole,
  ): 'deptHeadValidation' | 'validatorApproval' | 'cashierExecution' | null {
    switch (role) {
      case UserRole.DEPARTMENT_HEAD:
        return 'deptHeadValidation';
      case UserRole.VALIDATOR:
        return 'validatorApproval';
      case UserRole.CASHIER:
        return 'cashierExecution';
      default:
        return null;
    }
  }

  private setStatusTimeline(
    disbursement: Disbursement,
    status: DisbursementStatus,
    at: Date,
  ) {
    const timeline = disbursement.statusTimeline || {};
    switch (status) {
      case DisbursementStatus.PENDING_DEPT_HEAD:
        timeline.pendingDeptHead = at;
        break;
      case DisbursementStatus.PENDING_VALIDATOR:
        timeline.pendingValidator = at;
        break;
      case DisbursementStatus.PENDING_CASHIER:
        timeline.pendingCashier = at;
        break;
      case DisbursementStatus.COMPLETED:
        timeline.completed = at;
        break;
      case DisbursementStatus.REJECTED:
        timeline.rejected = at;
        break;
      case DisbursementStatus.CANCELLED:
        timeline.cancelled = at;
        break;
      default:
        break;
    }
    disbursement.statusTimeline = timeline;
  }

  private markStepApproved(
    disbursement: Disbursement,
    role: UserRole,
    userId: string,
    notes?: string,
  ) {
    const key = this.getStepKey(role);
    if (!key) return;
    const now = new Date();
    (disbursement as any)[key] = {
      ...(disbursement as any)[key],
      status: 'approved',
      isCompleted: true,
      completedAt: now,
      completedBy: userId as any,
      notes: notes || '',
    };
  }

  private markStepSkipped(
    disbursement: Disbursement,
    role: UserRole,
    userId?: string | null,
  ) {
    const key = this.getStepKey(role);
    if (!key) return;
    const existing = (disbursement as any)[key];
    if (existing?.isCompleted && existing?.status === 'approved') {
      return;
    }
    const now = new Date();
    (disbursement as any)[key] = {
      ...existing,
      status: 'skipped',
      isCompleted: true,
      wasSkipped: true,
      skippedAt: now,
      skippedBy: userId ? (userId as any) : null,
    };
  }

  private async resolveWorkflow(companyId: string, amount?: number) {
    const company = await this.companyModel.findById(companyId).lean();
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    let steps: string[] = [];

    if (company.activeWorkflowTemplate) {
      const template = await this.workflowTemplateModel
        .findById(company.activeWorkflowTemplate)
        .lean();
      if (template?.steps?.length) {
        steps = [...template.steps]
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((step: any) => step.roleRequired)
          .filter(Boolean);
      }
    }

    if (!steps.length) {
      const workflowSettings: any = company.workflowSettings || {};
      if (workflowSettings.requireDeptHeadApproval) {
        steps.push(UserRole.DEPARTMENT_HEAD);
      }
      if (workflowSettings.requireValidatorApproval) {
        steps.push(UserRole.VALIDATOR);
      }
      if (workflowSettings.requireCashierExecution) {
        steps.push(UserRole.CASHIER);
      }
    }

    if (
      typeof amount === 'number' &&
      company.workflowSettings?.maxAmountNoApproval !== undefined &&
      amount <= company.workflowSettings.maxAmountNoApproval
    ) {
      steps = steps.filter((role) => role === UserRole.CASHIER);
    }

    return { company, steps };
  }

  private async notifyRoleUsers(
    companyId: string,
    role: UserRole,
    disbursement: Disbursement,
  ) {
    const userFilter: any = {
      company: new Types.ObjectId(companyId),
      isDeleted: false,
      isActive: true,
      systemRoles: role,
    };

    if (role === UserRole.DEPARTMENT_HEAD) {
      userFilter.departments = new Types.ObjectId(
        disbursement.department as any,
      );
    }

    const recipients = await this.userModel
      .find(userFilter)
      .select('_id firstName lastName email')
      .lean();

    if (!recipients.length) return;

    const title = 'Disbursement approval required';
    const content = `Disbursement ${disbursement.referenceNumber} requires your approval.`;

    await Promise.all(
      recipients.map((recipient: any) =>
        this.notificationsService.create(
          {
            title,
            content,
            type: NotificationType.INFO,
            channel: NotificationChannel.IN_APP,
            recipientId: recipient._id.toString(),
            metadata: {
              disbursementId: disbursement._id?.toString(),
              referenceNumber: disbursement.referenceNumber,
              status: disbursement.status,
            },
          },
          companyId,
        ),
      ),
    );
  }

  async create(
    createDisbursementDto: any,
    userId?: string,
    companyId?: string,
  ) {
    const maxRetries = 5;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const referenceNumber =
        createDisbursementDto.referenceNumber || this.generateReferenceNumber();
      const disbursementData = {
        ...createDisbursementDto,
        referenceNumber,
        createdBy: userId,
        company: companyId ? new Types.ObjectId(companyId) : undefined,
        status: DisbursementStatus.DRAFT,
        statusTimeline: {
          draft: new Date(),
        },
      };
      try {
        const createdDisbursement = new this.disbursementModel(
          disbursementData,
        );
        return await createdDisbursement.save();
      } catch (err: any) {
        // Retry only on duplicate key error for auto-generated reference numbers
        const isDuplicateRef =
          err?.code === 11000 &&
          err?.keyPattern?.referenceNumber &&
          !createDisbursementDto.referenceNumber;
        if (!isDuplicateRef || attempt === maxRetries - 1) {
          throw err;
        }
      }
    }
    throw new BadRequestException(
      'Failed to generate unique disbursement reference number',
    );
  }

  async findAll(companyId?: string, options?: FindAllOptions) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      createdBy,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    } = options || {};

    const query: any = { isDeleted: false };

    if (companyId) {
      query.company = new Types.ObjectId(companyId);
    }

    if (search) {
      query.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      const statuses = status
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      query.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
    }

    if (department) {
      const ids = this.parseObjectIdList(department, 'department');
      query.department = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (office) {
      const ids = this.parseObjectIdList(office, 'office');
      query.office = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (beneficiary) {
      const ids = this.parseObjectIdList(beneficiary, 'beneficiary');
      query.beneficiary = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (disbursementType) {
      const ids = this.parseObjectIdList(disbursementType, 'disbursementType');
      query.disbursementType = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (createdBy) {
      const ids = this.parseObjectIdList(createdBy, 'createdBy');
      query.createdBy = ids.length > 1 ? { $in: ids } : ids[0];
    }

    if (paymentMethod) {
      const methods = paymentMethod
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
      query.paymentMethod = methods.length > 1 ? { $in: methods } : methods[0];
    }

    if (priority) {
      const priorities = priority
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      query.priority =
        priorities.length > 1 ? { $in: priorities } : priorities[0];
    }

    if (isUrgent !== undefined) {
      query.isUrgent = isUrgent === 'true';
    }

    if (isRetroactive !== undefined) {
      query.isRetroactive = isRetroactive === 'true';
    }

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true';
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = Number(minAmount);
      if (maxAmount !== undefined) query.amount.$lte = Number(maxAmount);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (tags) {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length) {
        query.tags = { $in: tagList };
      }
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.disbursementModel
        .find(query as any)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('beneficiary')
        .populate('department')
        .populate('office')
        .populate('disbursementType')
        .populate('createdBy', 'firstName lastName email')
        .exec(),
      this.disbursementModel.countDocuments(query as any),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportCsv(companyId?: string, options?: FindAllOptions) {
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    } = options || {};

    const { data } = await this.findAll(companyId, {
      page: 1,
      limit: 100000,
      sortBy,
      sortOrder,
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    });

    const headers = [
      'Reference Number',
      'Description',
      'Amount',
      'Currency',
      'Status',
      'Payment Method',
      'Priority',
      'Beneficiary',
      'Disbursement Type',
      'Department',
      'Office',
      'Created At',
    ];

    const rows = (data || []).map((item: any) => [
      item.referenceNumber || item._id,
      item.description || '',
      item.amount ?? '',
      item.currency || '',
      item.status || '',
      item.paymentMethod || '',
      item.priority || '',
      item.beneficiary?.name || item.beneficiary?.email || '',
      item.disbursementType?.name || '',
      item.department?.name || '',
      item.office?.name || '',
      item.createdAt ? new Date(item.createdAt).toISOString() : '',
    ]);

    const escape = (value: any) => {
      const str = value === null || value === undefined ? '' : String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ];

    return csvLines.join('\n');
  }

  async exportXlsx(companyId?: string, options?: FindAllOptions) {
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    } = options || {};

    const { data } = await this.findAll(companyId, {
      page: 1,
      limit: 100000,
      sortBy,
      sortOrder,
      search,
      status,
      department,
      office,
      beneficiary,
      disbursementType,
      paymentMethod,
      priority,
      isUrgent,
      isRetroactive,
      isCompleted,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Disbursements');

    sheet.columns = [
      { header: 'Reference Number', key: 'referenceNumber', width: 20 },
      { header: 'Description', key: 'description', width: 32 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Beneficiary', key: 'beneficiary', width: 24 },
      { header: 'Disbursement Type', key: 'disbursementType', width: 24 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Office', key: 'office', width: 18 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    (data || []).forEach((item: any) => {
      sheet.addRow({
        referenceNumber: item.referenceNumber || item._id,
        description: item.description || '',
        amount: item.amount ?? '',
        currency: item.currency || '',
        status: item.status || '',
        paymentMethod: item.paymentMethod || '',
        priority: item.priority || '',
        beneficiary: item.beneficiary?.name || item.beneficiary?.email || '',
        disbursementType: item.disbursementType?.name || '',
        department: item.department?.name || '',
        office: item.office?.name || '',
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : '',
      });
    });

    sheet.getRow(1).font = { bold: true };
    return workbook.xlsx.writeBuffer();
  }

  async findOne(id: string, companyId?: string, user?: any) {
    const accessFilter = this.buildAccessFilter(user);
    const disbursement = await this.disbursementModel
      .findOne({
        _id: new Types.ObjectId(id),
        ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
        ...accessFilter,
        isDeleted: false,
      } as any)
      .populate('beneficiary')
      .populate('department')
      .populate('office')
      .populate('disbursementType')
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    return disbursement;
  }

  async update(
    id: string,
    updateDisbursementDto: any,
    userId?: string,
    companyId?: string,
    user?: any,
  ) {
    const existing = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      isDeleted: false,
    } as any);

    if (!existing) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    this.ensureUserCanAccessDisbursement(user, existing);

    const updateData = {
      ...updateDisbursementDto,
      updatedBy: userId,
    };

    const disbursement = await this.disbursementModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
        isDeleted: false,
      } as any,
      updateData,
      { new: true },
    );

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    return disbursement;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: string, userId?: string, companyId?: string, user?: any) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      isDeleted: false,
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    this.ensureUserCanAccessDisbursement(user, disbursement);

    if (!this.isElevatedUser(user)) {
      const createdBy = disbursement.createdBy?.toString();
      if (!createdBy || createdBy !== userId) {
        throw new ForbiddenException('You cannot delete this disbursement');
      }
    }

    await this.disbursementModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      isDeleted: false,
    } as any);

    return { success: true, message: 'Disbursement deleted successfully' };
  }

  async submit(id: string, userId?: string, companyId?: string, user?: any) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      isDeleted: false,
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    this.ensureUserCanAccessDisbursement(user, disbursement);

    if (!this.isElevatedUser(user)) {
      const createdBy = disbursement.createdBy?.toString();
      if (!createdBy || createdBy !== userId) {
        throw new ForbiddenException('You cannot submit this disbursement');
      }
    }

    if (disbursement.status !== DisbursementStatus.DRAFT) {
      throw new BadRequestException(
        'Disbursement can only be submitted from draft status',
      );
    }

    const now = new Date();
    const effectiveCompanyId = companyId || disbursement.company?.toString();
    const { steps } = effectiveCompanyId
      ? await this.resolveWorkflow(effectiveCompanyId, disbursement.amount)
      : { steps: [] };
    const approvalSteps = (steps || [])
      .map((role) => role as UserRole)
      .filter((role) => this.roleToStatus(role));

    const firstRole = approvalSteps[0];
    const firstStatus = firstRole ? this.roleToStatus(firstRole) : null;

    if (firstStatus) {
      disbursement.status = firstStatus;
      this.setStatusTimeline(disbursement, firstStatus, now);
    } else {
      disbursement.status = DisbursementStatus.COMPLETED;
      disbursement.isCompleted = true;
      disbursement.completedAt = now;
      this.setStatusTimeline(disbursement, DisbursementStatus.COMPLETED, now);
    }

    const allRoles: UserRole[] = [
      UserRole.DEPARTMENT_HEAD,
      UserRole.VALIDATOR,
      UserRole.CASHIER,
    ];
    allRoles.forEach((role) => {
      if (!approvalSteps.includes(role)) {
        this.markStepSkipped(disbursement, role, userId || null);
      }
    });

    disbursement.agentSubmission = {
      ...disbursement.agentSubmission,
      status: 'approved',
      isCompleted: true,
      completedAt: now,
      completedBy: userId as any,
    };

    disbursement.actionHistory.push({
      action: DisbursementActionType.SUBMIT,
      performedBy: userId as any,
      performedAt: now,
      metadata: {
        previousStatus: DisbursementStatus.DRAFT,
        newStatus: disbursement.status,
      },
    } as any);

    const saved = await disbursement.save();

    if (effectiveCompanyId && firstRole) {
      await this.notifyRoleUsers(effectiveCompanyId, firstRole, saved);
    }

    return saved;
  }

  async approve(
    id: string,
    userId?: string,
    notes?: string,
    companyId?: string,
    user?: any,
  ) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      isDeleted: false,
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    const now = new Date();
    const previousStatus = disbursement.status;
    const currentRole = this.statusToRole(disbursement.status);

    if (!currentRole) {
      throw new BadRequestException(
        'Disbursement cannot be approved in current status',
      );
    }

    if (!this.isElevatedUser(user)) {
      if (currentRole === UserRole.DEPARTMENT_HEAD) {
        if (!this.hasRole(user, UserRole.DEPARTMENT_HEAD)) {
          throw new ForbiddenException(
            'Only a department head can approve this disbursement',
          );
        }
        const deptIds = this.getDepartmentIds(user);
        const deptId = disbursement.department?.toString();
        if (!deptId || !deptIds.includes(deptId)) {
          throw new ForbiddenException(
            'You cannot approve disbursements from other departments',
          );
        }
      } else if (currentRole === UserRole.VALIDATOR) {
        if (!this.hasRole(user, UserRole.VALIDATOR)) {
          throw new ForbiddenException(
            'Only a validator can approve this disbursement',
          );
        }
      } else if (currentRole === UserRole.CASHIER) {
        if (!this.hasRole(user, UserRole.CASHIER)) {
          throw new ForbiddenException(
            'Only a cashier can execute this disbursement',
          );
        }
      }
    }

    let newStatus: DisbursementStatus = DisbursementStatus.COMPLETED;
    let nextRole: UserRole | null = null;
    const effectiveCompanyId = companyId || disbursement.company?.toString();

    if (effectiveCompanyId) {
      const { steps } = await this.resolveWorkflow(
        effectiveCompanyId,
        disbursement.amount,
      );
      const approvalSteps = (steps || [])
        .map((role) => role as UserRole)
        .filter((role) => this.roleToStatus(role));
      const currentIndex = approvalSteps.indexOf(currentRole);
      if (currentIndex >= 0) {
        nextRole = approvalSteps[currentIndex + 1] || null;
        const nextStatus = nextRole ? this.roleToStatus(nextRole) : null;
        newStatus = nextStatus || DisbursementStatus.COMPLETED;
      } else {
        switch (disbursement.status) {
          case DisbursementStatus.PENDING_DEPT_HEAD:
            newStatus = DisbursementStatus.PENDING_VALIDATOR;
            break;
          case DisbursementStatus.PENDING_VALIDATOR:
            newStatus = DisbursementStatus.PENDING_CASHIER;
            break;
          case DisbursementStatus.PENDING_CASHIER:
          default:
            newStatus = DisbursementStatus.COMPLETED;
            break;
        }
      }
    }

    this.markStepApproved(disbursement, currentRole, userId as string, notes);

    if (newStatus === DisbursementStatus.COMPLETED) {
      disbursement.isCompleted = true;
      disbursement.completedAt = now;
    }

    this.setStatusTimeline(disbursement, newStatus, now);

    disbursement.status = newStatus;

    let actionType: DisbursementActionType = DisbursementActionType.APPROVE;
    if (currentRole === UserRole.DEPARTMENT_HEAD) {
      actionType = DisbursementActionType.DEPT_HEAD_VALIDATED;
    } else if (currentRole === UserRole.VALIDATOR) {
      actionType = DisbursementActionType.VALIDATOR_APPROVED;
    } else if (currentRole === UserRole.CASHIER) {
      actionType = DisbursementActionType.CASHIER_EXECUTED;
    }

    disbursement.actionHistory.push({
      action: actionType,
      performedBy: userId as any,
      performedAt: now,
      notes,
      metadata: {
        previousStatus,
        newStatus,
      },
    } as any);

    const saved = await disbursement.save();

    if (
      effectiveCompanyId &&
      nextRole &&
      newStatus !== DisbursementStatus.COMPLETED
    ) {
      await this.notifyRoleUsers(effectiveCompanyId, nextRole, saved);
    }

    return saved;
  }

  async forceComplete(
    id: string,
    userId?: string,
    reason?: string,
    companyId?: string,
    user?: any,
  ) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      isDeleted: false,
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    if (!this.isElevatedUser(user) && !this.hasRole(user, UserRole.VALIDATOR)) {
      throw new ForbiddenException(
        'You do not have permission to force complete disbursements',
      );
    }

    if (disbursement.status === DisbursementStatus.COMPLETED) {
      throw new BadRequestException('Disbursement is already completed');
    }

    if (disbursement.status === DisbursementStatus.DRAFT) {
      throw new BadRequestException(
        'Draft disbursements cannot be force completed',
      );
    }

    const now = new Date();
    const previousStatus = disbursement.status;

    // Skip any unfinished steps and mark cashier execution as completed
    this.markStepSkipped(
      disbursement,
      UserRole.DEPARTMENT_HEAD,
      userId || null,
    );
    this.markStepSkipped(disbursement, UserRole.VALIDATOR, userId || null);
    this.markStepApproved(
      disbursement,
      UserRole.CASHIER,
      userId as string,
      reason,
    );

    disbursement.status = DisbursementStatus.COMPLETED;
    disbursement.isCompleted = true;
    disbursement.completedAt = now;
    disbursement.forceCompleted = true;
    disbursement.forceCompletedBy = userId as any;
    disbursement.forceCompletedAt = now;
    disbursement.forceCompletionReason = reason || '';
    disbursement.forceCompletionUndone = false;

    this.setStatusTimeline(disbursement, DisbursementStatus.COMPLETED, now);

    disbursement.actionHistory.push({
      action: DisbursementActionType.FORCE_COMPLETED,
      performedBy: userId as any,
      performedAt: now,
      reason,
      metadata: {
        previousStatus,
        newStatus: DisbursementStatus.COMPLETED,
      },
    } as any);

    return disbursement.save();
  }

  async reject(
    id: string,
    userId?: string,
    reason?: string,
    companyId?: string,
    user?: any,
  ) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      isDeleted: false,
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    const currentRole = this.statusToRole(disbursement.status);
    if (!currentRole) {
      throw new BadRequestException(
        'Disbursement cannot be rejected in current status',
      );
    }

    if (!this.isElevatedUser(user)) {
      if (currentRole === UserRole.DEPARTMENT_HEAD) {
        if (!this.hasRole(user, UserRole.DEPARTMENT_HEAD)) {
          throw new ForbiddenException(
            'Only a department head can reject this disbursement',
          );
        }
        const deptIds = this.getDepartmentIds(user);
        const deptId = disbursement.department?.toString();
        if (!deptId || !deptIds.includes(deptId)) {
          throw new ForbiddenException(
            'You cannot reject disbursements from other departments',
          );
        }
      } else if (currentRole === UserRole.VALIDATOR) {
        if (!this.hasRole(user, UserRole.VALIDATOR)) {
          throw new ForbiddenException(
            'Only a validator can reject this disbursement',
          );
        }
      } else if (currentRole === UserRole.CASHIER) {
        if (!this.hasRole(user, UserRole.CASHIER)) {
          throw new ForbiddenException(
            'Only a cashier can reject this disbursement',
          );
        }
      }
    }

    const now = new Date();
    const previousStatus = disbursement.status;

    disbursement.status = DisbursementStatus.REJECTED;
    disbursement.currentRejection = {
      rejectedBy: userId as any,
      rejectedAt: now,
      stage: previousStatus,
      reason: reason || '',
      wasUndone: false,
    };
    disbursement.rejectionHistory.push({
      rejectedBy: userId as any,
      rejectedAt: now,
      stage: previousStatus,
      reason: reason || '',
    });
    disbursement.statusTimeline = {
      ...disbursement.statusTimeline,
      rejected: now,
    };
    disbursement.actionHistory.push({
      action: DisbursementActionType.REJECTED,
      performedBy: userId as any,
      performedAt: now,
      reason,
      metadata: {
        previousStatus,
        newStatus: DisbursementStatus.REJECTED,
      },
    } as any);

    return disbursement.save();
  }

  async cancel(
    id: string,
    userId?: string,
    reason?: string,
    companyId?: string,
    user?: any,
  ) {
    const disbursement = await this.disbursementModel.findOne({
      _id: new Types.ObjectId(id),
      ...(companyId ? { company: new Types.ObjectId(companyId) } : {}),
      isDeleted: false,
    } as any);

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    this.ensureUserCanAccessDisbursement(user, disbursement);

    if (!this.isElevatedUser(user)) {
      const createdBy = disbursement.createdBy?.toString();
      if (!createdBy || createdBy !== userId) {
        throw new ForbiddenException('You cannot cancel this disbursement');
      }
    }

    if (disbursement.status === DisbursementStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed disbursements cannot be cancelled',
      );
    }

    const now = new Date();
    const previousStatus = disbursement.status;

    disbursement.status = DisbursementStatus.CANCELLED;
    disbursement.statusTimeline = {
      ...disbursement.statusTimeline,
      cancelled: now,
    };
    disbursement.actionHistory.push({
      action: DisbursementActionType.CANCEL,
      performedBy: userId as any,
      performedAt: now,
      reason,
      metadata: {
        previousStatus,
        newStatus: DisbursementStatus.CANCELLED,
      },
    } as any);

    return disbursement.save();
  }
}
