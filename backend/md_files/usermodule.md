  🔑 Kaeyros Super Admin:
   - Email: admin@kaeyros.com
   - Password: Kaeyros@2024!

  🔑 Kaeyros Support:
   - Email: support@kaeyros.com
   - Password: Kaeyros@2024! (same as above, based on the pattern)

  🔑 Company Super Admin (Tech Solutions):
   - Email: admin@techsolutions.com
   - Password: Admin@2024!


// ==================== src/modules/users/dto/create-user.dto.ts ====================

import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  IsArray, 
  IsOptional,
  IsMongoId,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+237670000000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ type: [String], description: 'Role IDs', required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  roles?: string[];

  @ApiProperty({ 
    type: [String], 
    enum: ['validator', 'department_head', 'cashier', 'agent', 'accountant'],
    description: 'System roles'
  })
  @IsArray()
  @IsEnum(['validator', 'department_head', 'cashier', 'agent', 'accountant'], { each: true })
  @IsOptional()
  systemRoles?: string[];

  @ApiProperty({ type: [String], description: 'Department IDs', required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  departments?: string[];

  @ApiProperty({ type: [String], description: 'Office IDs', required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  offices?: string[];

  @ApiProperty({ example: 1000000, description: 'Max amount user can approve', required: false })
  @IsOptional()
  maxApprovalAmount?: number;

  @ApiProperty({ example: 'fr', required: false })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  roles?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  systemRoles?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  departments?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  offices?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  maxApprovalAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  preferredLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  notificationPreferences?: any;
}

export class FilterUserDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  office?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isActive?: boolean;
}

// ==================== src/modules/users/users.service.ts ====================

import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '@/database/schemas/user.schema';
import { Company } from '@/database/schemas/company.schema';
import { EmailService } from '@/email/email.service';
import { AuditLogService } from '@/modules/audit-logs/audit-logs.service';
import { CreateUserDto, UpdateUserDto, FilterUserDto } from './dto';
import { buildPaginationMeta } from '@/common/dto/pagination.dto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/common/constants/error-messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
  ) {}

  // ==================== CREATE USER ====================
  
  async create(dto: CreateUserDto, currentUser: any, ipAddress: string, userAgent: string) {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({ 
      email: dto.email.toLowerCase(),
      isDeleted: false,
    });

    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.USER_EMAIL_EXISTS);
    }

    // Check company user limit
    const company = await this.companyModel.findById(currentUser.company);
    if (company.maxUsers > 0 && company.currentUserCount >= company.maxUsers) {
      throw new BadRequestException(ERROR_MESSAGES.COMPANY_MAX_USERS_REACHED);
    }

    // Generate temporary password (user will change on first login)
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Generate activation token
    const activationToken = randomBytes(32).toString('hex');
    const activationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new this.userModel({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      company: currentUser.company,
      isKaeyrosUser: false,
      canLogin: false, // CRITICAL: Set to false, can only be changed by activation
      mustChangePassword: true,
      activationToken,
      activationTokenExpiry,
      createdBy: currentUser._id,
      notificationPreferences: {
        email: true,
        inApp: true,
        disbursementCreated: true,
        disbursementValidated: true,
        disbursementRejected: true,
        disbursementCompleted: true,
      },
    });

    await user.save();

    // Update company user count
    company.currentUserCount += 1;
    await company.save();

    // Send activation email
    const activationLink = `${process.env.FRONTEND_URL}/activate?token=${activationToken}`;
    await this.emailService.sendActivationEmail(user.email, activationLink, tempPassword);

    // Audit log
    await this.auditLogService.log({
      user: currentUser._id,
      company: currentUser.company,
      action: 'USER_CREATED',
      actionDescription: `Created user ${user.email}`,
      resourceType: 'user',
      resourceId: user._id,
      metadata: { roles: dto.systemRoles },
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      data: this.sanitizeUser(user),
    };
  }

  // ==================== UPDATE USER ====================
  
  async update(id: string, dto: UpdateUserDto, currentUser: any, ipAddress: string, userAgent: string) {
    const user = await this.findById(id, currentUser);

    // CRITICAL: Remove canLogin from DTO to prevent modification
    const { canLogin, ...updateData } = dto as any;
    if ('canLogin' in dto) {
      throw new ForbiddenException('canLogin cannot be modified after account activation');
    }

    const previousValues = {
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      systemRoles: user.systemRoles,
      departments: user.departments,
      offices: user.offices,
    };

    // Update user
    Object.assign(user, updateData);
    user.updatedBy = currentUser._id;
    await user.save();

    // Audit log
    await this.auditLogService.log({
      user: currentUser._id,
      company: currentUser.company,
      action: 'USER_UPDATED',
      actionDescription: `Updated user ${user.email}`,
      resourceType: 'user',
      resourceId: user._id,
      previousValues,
      newValues: updateData,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_UPDATED,
      data: this.sanitizeUser(user),
    };
  }

  // ==================== DEACTIVATE USER (SOFT DELETE) ====================
  
  async deactivate(id: string, currentUser: any, ipAddress: string, userAgent: string) {
    const user = await this.findById(id, currentUser);

    // Cannot deactivate yourself
    if (user._id.toString() === currentUser._id.toString()) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    // Soft delete
    user.isActive = false;
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = currentUser._id;
    user.permanentDeleteScheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    // Update company user count
    const company = await this.companyModel.findById(currentUser.company);
    company.currentUserCount -= 1;
    await company.save();

    // Create deleted data registry entry
    // (Implementation in DeletedDataRegistry service)

    // Audit log
    await this.auditLogService.log({
      user: currentUser._id,
      company: currentUser.company,
      action: 'USER_DEACTIVATED',
      actionDescription: `Deactivated user ${user.email}`,
      resourceType: 'user',
      resourceId: user._id,
      ipAddress,
      userAgent,
      severity: 'warning',
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_DELETED,
    };
  }

  // ==================== RESTORE USER ====================
  
  async restore(id: string, currentUser: any, ipAddress: string, userAgent: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isDeleted) {
      throw new BadRequestException('User is not deactivated');
    }

    // Restore user
    user.isActive = true;
    user.isDeleted = false;
    user.deletedAt = null;
    user.deletedBy = null;
    user.permanentDeleteScheduledFor = null;
    await user.save();

    // Update company user count
    const company = await this.companyModel.findById(currentUser.company);
    company.currentUserCount += 1;
    await company.save();

    // Audit log
    await this.auditLogService.log({
      user: currentUser._id,
      company: currentUser.company,
      action: 'USER_RESTORED',
      actionDescription: `Restored user ${user.email}`,
      resourceType: 'user',
      resourceId: user._id,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_RESTORED,
      data: this.sanitizeUser(user),
    };
  }

  // ==================== GET USERS (PAGINATED) ====================
  
  async findAll(filters: FilterUserDto, currentUser: any) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search } = filters;

    const query: any = {
      company: currentUser.company,
      isDeleted: false,
    };

    // Apply filters
    if (filters.department) query.departments = filters.department;
    if (filters.office) query.offices = filters.office;
    if (filters.role) query.systemRoles = filters.role;
    if (typeof filters.isActive !== 'undefined') query.isActive = filters.isActive;

    // Search
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .populate('roles')
        .populate('departments')
        .populate('offices')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(query),
    ]);

    return {
      success: true,
      data: users.map(user => this.sanitizeUser(user)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  // ==================== GET USER BY ID ====================
  
  async findOne(id: string, currentUser: any) {
    const user = await this.findById(id, currentUser);
    return {
      success: true,
      data: this.sanitizeUser(user),
    };
  }

  // ==================== ASSIGN ROLES ====================
  
  async assignRoles(id: string, roleIds: string[], currentUser: any, ipAddress: string, userAgent: string) {
    const user = await this.findById(id, currentUser);

    const previousRoles = user.roles;
    user.roles = roleIds as any;
    await user.save();

    await this.auditLogService.log({
      user: currentUser._id,
      company: currentUser.company,
      action: 'ROLE_ASSIGNED',
      actionDescription: `Assigned roles to user ${user.email}`,
      resourceType: 'user',
      resourceId: user._id,
      previousValues: { roles: previousRoles },
      newValues: { roles: roleIds },
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Roles assigned successfully',
      data: this.sanitizeUser(user),
    };
  }

  // ==================== RESEND ACTIVATION EMAIL ====================
  
  async resendActivation(id: string, currentUser: any) {
    const user = await this.findById(id, currentUser);

    if (user.canLogin) {
      throw new BadRequestException('User account is already activated');
    }

    // Generate new activation token
    const activationToken = randomBytes(32).toString('hex');
    user.activationToken = activationToken;
    user.activationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const activationLink = `${process.env.FRONTEND_URL}/activate?token=${activationToken}`;
    await this.emailService.sendActivationEmail(user.email, activationLink);

    return {
      success: true,
      message: 'Activation email sent successfully',
    };
  }

  // ==================== HELPER METHODS ====================
  
  private async findById(id: string, currentUser: any): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('roles')
      .populate('departments')
      .populate('offices');

    if (!user || user.isDeleted) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Company users can only access their own company users
    if (!currentUser.isKaeyrosUser && user.company?.toString() !== currentUser.company?.toString()) {
      throw new ForbiddenException('Access denied');
    }

    return user;
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, activationToken, passwordResetToken, ...sanitized } = 
      typeof user.toObject === 'function' ? user.toObject() : user;
    return sanitized;
  }

  private generateTempPassword(): string {
    // Generate random 12-character password
    return randomBytes(8).toString('base64').slice(0, 12);
  }
}






















// ==================== src/modules/users/users.controller.ts ====================

import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { CreateUserDto, UpdateUserDto, FilterUserDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @RequirePermissions('user.create')
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.usersService.create(dto, user, req.ip, req.headers['user-agent']);
  }

  @Get()
  @RequirePermissions('user.read')
  async findAll(@Query() filters: FilterUserDto, @CurrentUser() user: any) {
    return this.usersService.findAll(filters, user);
  }

  @Get(':id')
  @RequirePermissions('user.read')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user);
  }

  @Put(':id')
  @RequirePermissions('user.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.usersService.update(id, dto, user, req.ip, req.headers['user-agent']);
  }

  @Delete(':id')
  @RequirePermissions('user.delete')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.usersService.deactivate(id, user, req.ip, req.headers['user-agent']);
  }

  @Post(':id/restore')
  @RequirePermissions('user.restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.usersService.restore(id, user, req.ip, req.headers['user-agent']);
  }

  @Post(':id/assign-roles')
  @RequirePermissions('user.update')
  async assignRoles(
    @Param('id') id: string,
    @Body('roleIds') roleIds: string[],
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.usersService.assignRoles(id, roleIds, user, req.ip, req.headers['user-agent']);
  }

  @Post(':id/resend-activation')
  @RequirePermissions('user.update')
  async resendActivation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.resendActivation(id, user);
  }
}

// ==================== src/modules/companies/dto/create-company.dto.ts ====================

import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'contact@acme.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+237670000000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'basic', enum: ['basic', 'premium', 'enterprise'] })
  @IsEnum(['basic', 'premium', 'enterprise'])
  @IsOptional()
  planType?: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsOptional()
  maxUsers?: number;

  // First user (company super admin) details
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  superAdminFirstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  superAdminLastName: string;

  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  @IsNotEmpty()
  superAdminEmail: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  superAdminPhone?: string;
}

export class UpdateCompanyDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  defaultCurrency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class ToggleFeatureDto {
  @ApiProperty({ 
    example: 'disbursements',
    enum: ['disbursements', 'collections', 'chat', 'notifications', 'emailNotifications', 'reports']
  })
  @IsString()
  @IsNotEmpty()
  feature: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  enabled: boolean;
}

// ==================== src/modules/companies/companies.service.ts ====================

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Company } from '@/database/schemas/company.schema';
import { User } from '@/database/schemas/user.schema';
import { EmailService } from '@/email/email.service';
import { AuditLogService } from '@/modules/audit-logs/audit-logs.service';
import { CreateCompanyDto, UpdateCompanyDto, ToggleFeatureDto } from './dto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/common/constants/error-messages';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
  ) {}

  // ==================== CREATE COMPANY (KAEYROS ONLY) ====================
  
  async create(dto: CreateCompanyDto, kaeyrosUser: any, ipAddress: string, userAgent: string) {
    // Check if company name/email already exists
    const existingCompany = await this.companyModel.findOne({
      $or: [
        { name: dto.name },
        { email: dto.email },
      ],
      isDeleted: false,
    });

    if (existingCompany) {
      throw new BadRequestException('Company name or email already exists');
    }

    // Generate slug from name
    const slug = this.generateSlug(dto.name);

    // Check if slug exists
    const slugExists = await this.companyModel.findOne({ slug });
    if (slugExists) {
      throw new BadRequestException(ERROR_MESSAGES.COMPANY_SLUG_EXISTS);
    }

    // Calculate subscription dates
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial

    // Create company
    const company = new this.companyModel({
      name: dto.name,
      slug,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      status: 'trial',
      subscriptionStartDate: now,
      trialEndDate,
      planType: dto.planType || 'basic',
      maxUsers: dto.maxUsers || 50,
      enabledFeatures: {
        disbursements: true,
        collections: true,
        chat: true,
        notifications: true,
        emailNotifications: true,
        reports: true,
        multiCurrency: false,
        apiAccess: false,
      },
      createdBy: kaeyrosUser._id,
      kaeyrosAccountManager: kaeyrosUser._id,
    });

    await company.save();

    // Create first user (company super admin)
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const activationToken = randomBytes(32).toString('hex');

    const superAdmin = new this.userModel({
      firstName: dto.superAdminFirstName,
      lastName: dto.superAdminLastName,
      email: dto.superAdminEmail.toLowerCase(),
      phone: dto.superAdminPhone,
      password: hashedPassword,
      company: company._id,
      systemRoles: ['company_super_admin'],
      isKaeyrosUser: false,
      canLogin: false, // Will be activated via email
      mustChangePassword: true,
      activationToken,
      activationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: kaeyrosUser._id,
    });

    await superAdmin.save();

    // Update company user count
    company.currentUserCount = 1;
    await company.save();

    // Send activation email to super admin
    const activationLink = `${process.env.FRONTEND_URL}/activate?token=${activationToken}`;
    await this.emailService.sendCompanyWelcomeEmail(
      superAdmin.email,
      company.name,
      activationLink,
      tempPassword,
    );

    // Audit log
    await this.auditLogService.log({
      user: kaeyrosUser._id,
      company: null, // Kaeyros action
      action: 'COMPANY_CREATED',
      actionDescription: `Created company ${company.name}`,
      resourceType: 'company',
      resourceId: company._id,
      metadata: { superAdminEmail: superAdmin.email },
      ipAddress,
      userAgent,
      isKaeyrosAction: true,
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.COMPANY_CREATED,
      data: {
        company: company,
        superAdmin: this.sanitizeUser(superAdmin),
      },
    };
  }

  // ==================== UPDATE COMPANY ====================
  
  async update(
    id: string,
    dto: UpdateCompanyDto,
    currentUser: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const company = await this.findById(id, currentUser);

    const previousValues = {
      name: company.name,
      email: company.email,
      phone: company.phone,
    };

    Object.assign(company, dto);
    company.updatedBy = currentUser._id;
    await company.save();

    await this.auditLogService.log({
      user: currentUser._id,
      company: currentUser.isKaeyrosUser ? null : currentUser.company,
      action: 'COMPANY_UPDATED',
      actionDescription: `Updated company ${company.name}`,
      resourceType: 'company',
      resourceId: company._id,
      previousValues,
      newValues: dto,
      ipAddress,
      userAgent,
      isKaeyrosAction: currentUser.isKaeyrosUser,
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.COMPANY_UPDATED,
      data: company,
    };
  }

  // ==================== SUSPEND/ACTIVATE COMPANY (KAEYROS ONLY) ====================
  
  async suspend(id: string, kaeyrosUser: any, reason: string, ipAddress: string, userAgent: string) {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
    }

    company.status = 'suspended';
    await company.save();

    await this.auditLogService.log({
      user: kaeyrosUser._id,
      company: null,
      action: 'COMPANY_SUSPENDED',
      actionDescription: `Suspended company ${company.name}`,
      resourceType: 'company',
      resourceId: company._id,
      metadata: { reason },
      ipAddress,
      userAgent,
      severity: 'critical',
      isKaeyrosAction: true,
    });

    // Notify company super admin
    await this.notifyCompanySuperAdmin(company._id, 'suspended', reason);

    return {
      success: true,
      message: 'Company suspended successfully',
    };
  }

  async activate(id: string, kaeyrosUser: any, ipAddress: string, userAgent: string) {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
    }

    company.status = 'active';
    await company.save();

    await this.auditLogService.log({
      user: kaeyrosUser._id,
      company: null,
      action: 'COMPANY_ACTIVATED',
      actionDescription: `Activated company ${company.name}`,
      resourceType: 'company',
      resourceId: company._id,
      ipAddress,
      userAgent,
      isKaeyrosAction: true,
    });

    await this.notifyCompanySuperAdmin(company._id, 'activated');

    return {
      success: true,
      message: 'Company activated successfully',
    };
  }

  // ==================== TOGGLE FEATURE (KAEYROS ONLY) ====================
  
  async toggleFeature(
    id: string,
    dto: ToggleFeatureDto,
    kaeyrosUser: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
    }

    const previousValue = company.enabledFeatures[dto.feature];
    company.enabledFeatures[dto.feature] = dto.enabled;
    await company.save();

    await this.auditLogService.log({
      user: kaeyrosUser._id,
      company: null,
      action: 'COMPANY_FEATURE_TOGGLED',
      actionDescription: `${dto.enabled ? 'Enabled' : 'Disabled'} ${dto.feature} for ${company.name}`,
      resourceType: 'company',
      resourceId: company._id,
      metadata: { feature: dto.feature, enabled: dto.enabled },
      ipAddress,
      userAgent,
      isKaeyrosAction: true,
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.COMPANY_FEATURE_TOGGLED,
      data: { feature: dto.feature, enabled: dto.enabled },
    };
  }

  // ==================== GET ALL COMPANIES (KAEYROS ONLY) ====================
  
  async findAll(filters: any = {}) {
    const { page = 1, limit = 20, status, search } = filters;

    const query: any = { isDeleted: false };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [companies, total] = await Promise.all([
      this.companyModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.companyModel.countDocuments(query),
    ]);

    return {
      success: true,
      data: companies,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== GET COMPANY STATS ====================
  
  async getStats(id: string, currentUser: any) {
    const company = await this.findById(id, currentUser);

    // Get user count, disbursement count, etc.
    const [userCount, disbursementCount] = await Promise.all([
      this.userModel.countDocuments({ company: id, isDeleted: false }),
      // TODO: Add disbursement count
    ]);

    return {
      success: true,
      data: {
        company,
        stats: {
          totalUsers: userCount,
          activeUsers: company.currentUserCount,
          totalDisbursements: disbursementCount,
          status: company.status,
          subscriptionEndsAt: company.subscriptionEndDate || company.trialEndDate,
        },
      },
    };
  }

  // ==================== HELPER METHODS ====================
  
  private async findById(id: string, currentUser: any): Promise<Company> {
    const company = await this.companyModel.findById(id);

    if (!company || company.isDeleted) {
      throw new NotFoundException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
    }

    // Non-Kaeyros users can only access their own company
    if (!currentUser.isKaeyrosUser && company._id.toString() !== currentUser.company?.toString()) {
      throw new ForbiddenException('Access denied');
    }

    return company;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateTempPassword(): string {
    return randomBytes(8).toString('base64').slice(0, 12);
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, activationToken, ...sanitized } = user.toObject();
    return sanitized;
  }

  private async notifyCompanySuperAdmin(companyId: string, action: string, reason?: string) {
    // Find company super admin and send notification
    const superAdmin = await this.userModel.findOne({
      company: companyId,
      systemRoles: 'company_super_admin',
    });

    if (superAdmin) {
      await this.emailService.sendCompanyStatusNotification(
        superAdmin.email,
        action,
        reason,
      );
    }
  }
}