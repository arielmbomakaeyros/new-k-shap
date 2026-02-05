import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../../database/schemas/user.schema';
import { Company } from '../../database/schemas/company.schema';
import { EmailService } from '../../email/email.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRole } from '../../database/schemas/enums';
import { PaginationParams, PaginatedResponse } from '../../common/interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private emailService: EmailService,
    private configService: ConfigService,
    private fileUploadService: FileUploadService,
  ) {}

  async create(dto: CreateUserDto, creatorUser: any): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate temporary password and activation token
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpiry = new Date();
    activationExpiry.setHours(activationExpiry.getHours() + 24);

    const user = new this.userModel({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      company: creatorUser.company,
      canLogin: false,
      mustChangePassword: true,
      activationToken,
      activationTokenExpiry: activationExpiry,
      createdBy: creatorUser._id,
      notificationPreferences: {
        email: true,
        inApp: true,
        disbursementCreated: true,
        disbursementValidated: true,
        disbursementRejected: true,
        disbursementCompleted: true,
        chatMessages: true,
        systemAlerts: true,
      },
    });

    await user.save();

    // Update company user count
    await this.companyModel.findByIdAndUpdate(creatorUser.company, {
      $inc: { currentUserCount: 1 },
    });

    // Send activation email
    const company = await this.companyModel.findById(creatorUser.company);
    const activationUrl = `${this.configService.get('FRONTEND_URL')}/activate?token=${activationToken}`;

    await this.emailService.send({
      to: user.email,
      subject: 'Welcome to K-shap - Activate Your Account',
      template: 'welcome',
      context: {
        firstName: user.firstName,
        companyName: company?.name || 'K-shap',
        email: user.email,
        activationUrl,
      },
    });

    return user;
  }

  async findAll(
    companyId: string | null,
    pagination: PaginationParams,
    filters?: { search?: string; role?: string; department?: string; isActive?: boolean },
  ): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    // If companyId is null (Kaeyros admin), show all users; otherwise filter by company
    const query: any = { isDeleted: false };
    if (companyId) {
      query.company = new Types.ObjectId(companyId);
    }

    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters?.role) {
      query.systemRoles = filters.role;
    }

    if (filters?.department) {
      query.departments = filters.department;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password -refreshToken -activationToken -passwordResetToken')
        .populate('departments')
        .populate('offices')
        .populate('roles')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string, companyId: string | null): Promise<User> {
    let query = this.userModel
      .findById(id)
      .where('isDeleted').equals(false)
      .select('-password -refreshToken -activationToken -passwordResetToken')
      .populate('departments')
      .populate('offices')
      .populate('roles');

    // If companyId is provided, filter by company; Kaeyros admins can see any user
    if (companyId) {
      query = query.where('company').equals(companyId);
    }

    const user = await query.exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    updaterUser: any,
  ): Promise<User> {
    let query = this.userModel
      .findById(id)
      .where('isDeleted').equals(false);

    // If updater has a company, filter by it; Kaeyros admins can update any user
    if (updaterUser.company) {
      query = query.where('company').equals((updaterUser.company._id || updaterUser.company).toString());
    }

    const user = await query.exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deactivating company super admin
    if (
      dto.isActive === false &&
      user.systemRoles?.includes(UserRole.COMPANY_SUPER_ADMIN)
    ) {
      throw new ForbiddenException('Cannot deactivate company super admin');
    }

    Object.assign(user, dto);
    user.updatedBy = updaterUser._id;

    await user.save();

    const companyId = updaterUser.company ? (updaterUser.company._id || updaterUser.company).toString() : null;
    return this.findById(id, companyId);
  }

  async delete(id: string, deleterUser: any): Promise<void> {
    let query = this.userModel
      .findById(id)
      .where('isDeleted').equals(false);

    // If deleter has a company, filter by it; Kaeyros admins can delete any user
    if (deleterUser.company) {
      query = query.where('company').equals((deleterUser.company._id || deleterUser.company).toString());
    }

    const user = await query.exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting company super admin
    if (user.systemRoles?.includes(UserRole.COMPANY_SUPER_ADMIN)) {
      throw new ForbiddenException('Cannot delete company super admin');
    }

    // Soft delete
    user.isDeleted = true;
    user.isActive = false;
    user.deletedAt = new Date();
    user.deletedBy = deleterUser._id;

    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() + 30);
    user.permanentDeleteScheduledFor = gracePeriodDate;

    await user.save();

    // Update company user count (use the user's company, not deleter's)
    if (user.company) {
      await this.companyModel.findByIdAndUpdate(user.company, {
        $inc: { currentUserCount: -1 },
      });
    }
  }

  async restore(id: string, restorerUser: any): Promise<User> {
    let query = this.userModel
      .findById(id)
      .where('isDeleted').equals(true);

    // If restorer has a company, filter by it; Kaeyros admins can restore any user
    if (restorerUser.company) {
      query = query.where('company').equals((restorerUser.company._id || restorerUser.company).toString());
    }

    const user = await query.exec();

    if (!user) {
      throw new NotFoundException('Deleted user not found');
    }

    user.isDeleted = false;
    user.isActive = true;
    user.deletedAt = undefined as any;
    user.deletedBy = undefined as any;
    user.permanentDeleteScheduledFor = undefined as any;

    await user.save();

    // Update company user count (use the user's company, not restorer's)
    if (user.company) {
      await this.companyModel.findByIdAndUpdate(user.company, {
        $inc: { currentUserCount: 1 },
      });
    }

    const companyId = restorerUser.company ? (restorerUser.company._id || restorerUser.company).toString() : null;
    return this.findById(id, companyId);
  }

  async resendActivation(id: string, requesterUser: any): Promise<void> {
    let query = this.userModel
      .findById(id)
      .where('isDeleted').equals(false);

    // If requester has a company, filter by it; Kaeyros admins can resend for any user
    if (requesterUser.company) {
      query = query.where('company').equals((requesterUser.company._id || requesterUser.company).toString());
    }

    const user = await query.exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.canLogin) {
      throw new BadRequestException('User is already activated');
    }

    // Generate new activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpiry = new Date();
    activationExpiry.setHours(activationExpiry.getHours() + 24);

    user.activationToken = activationToken;
    user.activationTokenExpiry = activationExpiry;
    await user.save();

    // Send activation email (use the user's company for company name)
    const company = user.company ? await this.companyModel.findById(user.company) : null;
    const activationUrl = `${this.configService.get('FRONTEND_URL')}/activate?token=${activationToken}`;

    await this.emailService.send({
      to: user.email,
      subject: 'K-shap - Activate Your Account',
      template: 'user-activation',
      context: {
        firstName: user.firstName,
        companyName: company?.name || 'K-shap',
        activationUrl,
      },
    });
  }

  async updateAvatar(id: string, file: Express.Multer.File, updaterUser: any) {
    let query = this.userModel.findById(id).where('isDeleted').equals(false);

    if (updaterUser.company) {
      query = query.where('company').equals((updaterUser.company._id || updaterUser.company).toString());
    }

    const user = await query.exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const context = {
      userId: updaterUser._id?.toString() || updaterUser.id,
      companyId: updaterUser.company ? (updaterUser.company._id || updaterUser.company).toString() : undefined,
    };

    const uploadResult = await this.fileUploadService.uploadFile(file, {
      category: 'profile_picture',
      entityType: 'user',
      entityId: user._id.toString(),
    } as any, context as any);

    user.avatar = uploadResult.url;
    await user.save();

    return user;
  }

}
