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
import { getEmailSubject } from '../../common/i18n/email';
import { resolveLanguage } from '../../common/i18n/language';
import * as ExcelJS from 'exceljs';

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
    const language = resolveLanguage({ user, company });

    await this.emailService.send({
      to: user.email,
      subject: getEmailSubject('welcome', language),
      template: 'welcome',
      language,
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

    const wasActive = user.isActive;
    const updateFields: Record<string, any> = { ...dto, updatedBy: updaterUser._id };

    await this.userModel.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true },
    );

    if (wasActive && dto.isActive === false) {
      const company = user.company
        ? await this.companyModel.findById(user.company)
        : null;
      const language = resolveLanguage({ user, company });
      await this.emailService.send({
        to: user.email,
        subject: getEmailSubject('account-deactivated', language),
        template: 'account-deactivated',
        language,
        context: {
          firstName: user.firstName,
          companyName: company?.name || 'K-shap',
        },
      });
    }

    if (!wasActive && dto.isActive === true) {
      const company = user.company
        ? await this.companyModel.findById(user.company)
        : null;
      const language = resolveLanguage({ user, company });
      await this.emailService.send({
        to: user.email,
        subject: getEmailSubject('account-reactivated', language),
        template: 'account-reactivated',
        language,
        context: {
          firstName: user.firstName,
          companyName: company?.name || 'K-shap',
        },
      });
    }

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
    const language = resolveLanguage({ user, company });

    await this.emailService.send({
      to: user.email,
      subject: getEmailSubject('user-activation', language),
      template: 'user-activation',
      language,
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

  private normalizeList(value?: string): string[] {
    if (!value) return [];
    return value
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private parseCsv(buffer: Buffer): Array<Record<string, string>> {
    const content = buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = this.parseCsvLine(lines[0]).map((header) => header.trim());
    return lines.slice(1).map((line) => {
      const values = this.parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ?? '';
      });
      return row;
    });
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  private async parseXlsx(buffer: Buffer): Promise<Array<Record<string, string>>> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];
    if (!sheet) return [];
    const headerRow = sheet.getRow(1);
    const headers = (Array.isArray(headerRow.values) ? headerRow.values : [])
      .slice(1)
      .map((value) => String(value || '').trim());
    const rows: Array<Record<string, string>> = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData: Record<string, string> = {};
      headers.forEach((header, idx) => {
        const cellValue = row.getCell(idx + 1).value;
        rowData[header] = cellValue ? String(cellValue).trim() : '';
      });
      if (Object.values(rowData).some((value) => value !== '')) {
        rows.push(rowData);
      }
    });
    return rows;
  }

  async bulkImport(file: Express.Multer.File, creatorUser: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const isCsv = file.mimetype.includes('csv') || file.originalname.endsWith('.csv');
    const isXlsx = file.mimetype.includes('sheet') || file.originalname.endsWith('.xlsx');

    if (!isCsv && !isXlsx) {
      throw new BadRequestException('Unsupported file type. Use CSV or XLSX.');
    }

    const rows = isCsv ? this.parseCsv(file.buffer) : await this.parseXlsx(file.buffer);
    if (rows.length === 0) {
      throw new BadRequestException('No rows found in file.');
    }

    const results = {
      createdCount: 0,
      failedCount: 0,
      errors: [] as { row: number; email?: string; message: string }[],
    };

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const email = row.email?.toLowerCase().trim();
      const firstName = row.firstName?.trim();
      const lastName = row.lastName?.trim();
      const systemRoles = this.normalizeList(row.systemRoles || row.systemRole);

      if (!email || !firstName || !lastName || systemRoles.length === 0) {
        results.failedCount += 1;
        results.errors.push({
          row: index + 2,
          email,
          message: 'Missing required fields: email, firstName, lastName, systemRoles',
        });
        continue;
      }

      const dto: CreateUserDto = {
        email,
        firstName,
        lastName,
        phone: row.phone?.trim() || undefined,
        systemRoles,
        roles: this.normalizeList(row.roles),
        departments: this.normalizeList(row.departments),
        offices: this.normalizeList(row.offices),
      };

      try {
        await this.create(dto, creatorUser);
        results.createdCount += 1;
      } catch (error) {
        results.failedCount += 1;
        results.errors.push({
          row: index + 2,
          email,
          message: (error as any)?.message || 'Failed to import user',
        });
      }
    }

    return results;
  }

}
