import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Company } from '../../database/schemas/company.schema';
import { User } from '../../database/schemas/user.schema';
import { Disbursement } from '../../database/schemas/disbursement.schema';
import { Collection } from '../../database/schemas/collection.schema';
import { AuditLog } from '../../database/schemas/audit-log.schema';
import { Role } from '../../database/schemas/role.schema';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '@nestjs/config';
import { UserRole, CompanyStatus } from '../../database/schemas/enums';
import { UsersService } from '../users/users.service';
import { getEmailSubject } from '../../common/i18n/email';
import { resolveLanguage } from '../../common/i18n/language';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class KaeyrosService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Disbursement.name) private disbursementModel: Model<Disbursement>,
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private emailService: EmailService,
    private configService: ConfigService,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  private normalizePrefix(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async create(createKaeyrosDto: any) {
    const existingCompany = await this.companyModel.findOne({
      $or: [
        { name: createKaeyrosDto.name },
        { email: createKaeyrosDto.email?.toLowerCase() },
      ],
    });

    if (existingCompany) {
      throw new ConflictException('Company with this name or email already exists');
    }

    const existingAdmin = await this.userModel.findOne({
      email: createKaeyrosDto.adminEmail?.toLowerCase(),
    });

    if (existingAdmin) {
      throw new ConflictException('User with this email already exists');
    }

    const slug = createKaeyrosDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const baseFilePrefix = this.normalizePrefix(createKaeyrosDto.baseFilePrefix || slug);
    if (!baseFilePrefix) {
      throw new BadRequestException('Base file prefix is required');
    }

    const companyPayload: Record<string, any> = {
      name: createKaeyrosDto.name,
      description: createKaeyrosDto.description,
      email: createKaeyrosDto.email?.toLowerCase(),
      phone: createKaeyrosDto.phone,
      address: createKaeyrosDto.address,
      city: createKaeyrosDto.city,
      country: createKaeyrosDto.country,
      industry: createKaeyrosDto.industry,
      website: createKaeyrosDto.website,
      status: createKaeyrosDto.status || CompanyStatus.TRIAL,
      planType: createKaeyrosDto.plan,
      maxUsers: createKaeyrosDto.maxUsers || 0,
      trialEndDate: createKaeyrosDto.trialEndsAt,
      enabledFeatures: createKaeyrosDto.features || {},
      slug,
      currentUserCount: 1,
      defaultCurrency: createKaeyrosDto.defaultCurrency || 'XAF',
      baseFilePrefix,
      filePrefixes: [],
      activeFilePrefix: '',
    };

    if (createKaeyrosDto.paymentMethods) companyPayload.paymentMethods = createKaeyrosDto.paymentMethods;
    if (createKaeyrosDto.notificationChannels) companyPayload.notificationChannels = createKaeyrosDto.notificationChannels;
    if (createKaeyrosDto.emailNotificationSettings) companyPayload.emailNotificationSettings = createKaeyrosDto.emailNotificationSettings;
    if (createKaeyrosDto.workflowSettings) companyPayload.workflowSettings = createKaeyrosDto.workflowSettings;
    if (createKaeyrosDto.payoutSchedule) companyPayload.payoutSchedule = createKaeyrosDto.payoutSchedule;
    if (createKaeyrosDto.timezone) companyPayload.timezone = createKaeyrosDto.timezone;
    if (createKaeyrosDto.supportedLanguages) companyPayload.supportedLanguages = createKaeyrosDto.supportedLanguages;
    if (createKaeyrosDto.defaultLanguage) companyPayload.defaultLanguage = createKaeyrosDto.defaultLanguage;
    if (createKaeyrosDto.logoUrl) companyPayload.logoUrl = createKaeyrosDto.logoUrl;
    if (createKaeyrosDto.primaryColor) companyPayload.primaryColor = createKaeyrosDto.primaryColor;
    if (createKaeyrosDto.notes) companyPayload.notes = createKaeyrosDto.notes;

    const company = await this.companyModel.create(companyPayload);

    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpiry = new Date();
    activationExpiry.setHours(activationExpiry.getHours() + 24);

    const user = await new this.userModel({
      firstName: createKaeyrosDto.adminFirstName,
      lastName: createKaeyrosDto.adminLastName,
      email: createKaeyrosDto.adminEmail?.toLowerCase(),
      password: hashedPassword,
      company: new Types.ObjectId(company._id),
      systemRoles: [UserRole.COMPANY_SUPER_ADMIN],
      canLogin: false,
      mustChangePassword: true,
      activationToken,
      activationTokenExpiry: activationExpiry,
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
    }).save();

    await this.rolesService.createDefaultCompanyRoles(
      company._id.toString(),
      user._id.toString(),
    );

    const activationUrl = `${this.configService.get('FRONTEND_URL')}/activate?token=${activationToken}`;
    const language = resolveLanguage({ user, company });
    await this.emailService.send({
      to: user.email,
      subject: getEmailSubject('welcome', language),
      template: 'welcome',
      language,
      context: {
        firstName: user.firstName,
        companyName: company.name,
        email: user.email,
        activationUrl,
      },
    });

    return company.toObject();
  }

  async getPlatformStats() {
    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prev30 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const start6Months = new Date(startOfMonth);
    start6Months.setMonth(start6Months.getMonth() - 5);

    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalDisbursements,
      totalCollections,
      disbursementAmountAgg,
      collectionAmountAgg,
      newCompaniesLast30,
      newCompaniesPrev30,
      newUsersLast30,
      newUsersPrev30,
      disbursementLast30Agg,
      disbursementPrev30Agg,
      collectionLast30Agg,
      collectionPrev30Agg,
      disbursementMonthlyAgg,
      collectionMonthlyAgg,
      companyMonthlyAgg,
      userMonthlyAgg,
    ] = await Promise.all([
      this.companyModel.countDocuments({ isDeleted: false }),
      this.companyModel.countDocuments({ isDeleted: false, status: { $in: ['active', 'trial'] } }),
      this.userModel.countDocuments({ isDeleted: false }),
      this.disbursementModel.countDocuments({ isDeleted: false }),
      this.collectionModel.countDocuments({ isDeleted: false }),
      this.disbursementModel.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.collectionModel.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.companyModel.countDocuments({ isDeleted: false, createdAt: { $gte: last30 } }),
      this.companyModel.countDocuments({ isDeleted: false, createdAt: { $gte: prev30, $lt: last30 } }),
      this.userModel.countDocuments({ isDeleted: false, createdAt: { $gte: last30 } }),
      this.userModel.countDocuments({ isDeleted: false, createdAt: { $gte: prev30, $lt: last30 } }),
      this.disbursementModel.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: last30 } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.disbursementModel.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: prev30, $lt: last30 } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.collectionModel.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: last30 } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.collectionModel.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: prev30, $lt: last30 } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.disbursementModel.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: start6Months } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.collectionModel.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: start6Months } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.companyModel.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: start6Months } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      this.userModel.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: start6Months } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const disbursementAmount = disbursementAmountAgg?.[0]?.total || 0;
    const collectionAmount = collectionAmountAgg?.[0]?.total || 0;

    const disbLast = disbursementLast30Agg?.[0]?.total || 0;
    const disbPrev = disbursementPrev30Agg?.[0]?.total || 0;
    const collLast = collectionLast30Agg?.[0]?.total || 0;
    const collPrev = collectionPrev30Agg?.[0]?.total || 0;

    const pct = (current: number, prev: number) => {
      if (prev === 0) return current === 0 ? 0 : 100;
      return ((current - prev) / prev) * 100;
    };

    // Top companies by combined volume
    const topCompaniesAgg = await this.disbursementModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$company', disbursementsTotal: { $sum: '$amount' }, disbursementsCount: { $sum: 1 } } },
      { $sort: { disbursementsTotal: -1 } },
      { $limit: 5 },
    ]);

    const topCompanyIds = topCompaniesAgg.map((c) => c._id);
    const companies = await this.companyModel.find({ _id: { $in: topCompanyIds } }).select('name').exec();
    const companyMap = new Map(companies.map((c: any) => [c._id.toString(), c.name]));

    const topCompanies = topCompaniesAgg.map((row) => ({
      companyId: row._id?.toString(),
      name: companyMap.get(row._id?.toString()) || 'Unknown',
      disbursementsTotal: row.disbursementsTotal || 0,
      disbursementsCount: row.disbursementsCount || 0,
    }));

    const monthKeys: string[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(startOfMonth);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.push(key);
    }

    const mapAgg = (rows: any[]) => {
      const map = new Map(rows.map((row) => [row._id, row]));
      return monthKeys.map((key) => map.get(key) || { total: 0, count: 0 });
    };

    const disbSeries = mapAgg(disbursementMonthlyAgg);
    const collSeries = mapAgg(collectionMonthlyAgg);
    const companySeries = mapAgg(companyMonthlyAgg);
    const userSeries = mapAgg(userMonthlyAgg);

    const monthly = monthKeys.map((key, idx) => ({
      month: key,
      disbursements: disbSeries[idx]?.total || 0,
      collections: collSeries[idx]?.total || 0,
      newCompanies: companySeries[idx]?.count || 0,
      newUsers: userSeries[idx]?.count || 0,
    }));

    return {
      totals: {
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalDisbursements,
        totalCollections,
        disbursementAmount,
        collectionAmount,
      },
      trends: {
        disbursementChange: pct(disbLast, disbPrev),
        collectionChange: pct(collLast, collPrev),
        newCompaniesChange: pct(newCompaniesLast30, newCompaniesPrev30),
        newUsersChange: pct(newUsersLast30, newUsersPrev30),
      },
      topCompanies,
      monthly,
    };
  }

  async getCompanies(params: any) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      plan,
      isActive,
      startDate,
      endDate,
    } = params || {};

    const query: any = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (plan) query.planType = plan;
    if (isActive !== undefined) query.isActive = isActive === 'true' || isActive === true;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [companies, total] = await Promise.all([
      this.companyModel
        .find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      this.companyModel.countDocuments(query),
    ]);

    const companyIds = companies.map((c: any) => c._id);
    const requiredSystemRoles = [
      'company_super_admin',
      'validator',
      'department_head',
      'cashier',
      'agent',
    ];

    const rolesAgg = await this.roleModel.aggregate([
      { $match: { company: { $in: companyIds }, systemRoleType: { $in: requiredSystemRoles } } },
      { $group: { _id: '$company', types: { $addToSet: '$systemRoleType' } } },
    ]);
    const rolesMap = new Map(rolesAgg.map((r: any) => [r._id.toString(), r.types || []]));

    const disbAgg = await this.disbursementModel.aggregate([
      { $match: { company: { $in: companyIds }, isDeleted: false } },
      { $group: { _id: '$company', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const collAgg = await this.collectionModel.aggregate([
      { $match: { company: { $in: companyIds }, isDeleted: false } },
      { $group: { _id: '$company', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const disbMap = new Map(disbAgg.map((d: any) => [d._id.toString(), d]));
    const collMap = new Map(collAgg.map((c: any) => [c._id.toString(), c]));

    const data = companies.map((company: any) => {
      const disb = disbMap.get(company._id.toString()) || { totalAmount: 0, count: 0 };
      const coll = collMap.get(company._id.toString()) || { totalAmount: 0, count: 0 };
      const roleTypes = rolesMap.get(company._id.toString()) || [];
      const hasDefaultRoles = requiredSystemRoles.every((role) => roleTypes.includes(role));
      return {
        ...company.toObject(),
        stats: {
          disbursements: disb,
          collections: coll,
        },
        hasDefaultRoles,
      };
    });

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getAuditLogs(params: any) {
    const {
      page = 1,
      limit = 20,
      company,
      action,
      startDate,
      endDate,
    } = params || {};

    const query: any = { isDeleted: { $ne: true } };
    if (company) query.company = new Types.ObjectId(company);
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('company', 'name')
        .populate('user', 'firstName lastName email avatar')
        .exec(),
      this.auditLogModel.countDocuments(query),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    const company = await this.companyModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const [disbAgg, collAgg, userCount] = await Promise.all([
      this.disbursementModel.aggregate([
        { $match: { company: company._id, isDeleted: false } },
        { $group: { _id: '$company', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.collectionModel.aggregate([
        { $match: { company: company._id, isDeleted: false } },
        { $group: { _id: '$company', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.userModel.countDocuments({ company: new Types.ObjectId(company._id), isDeleted: false } as any),
    ]);

    const disb = disbAgg?.[0] || { totalAmount: 0, count: 0 };
    const coll = collAgg?.[0] || { totalAmount: 0, count: 0 };

    return {
      ...company.toObject(),
      stats: {
        disbursements: disb,
        collections: coll,
        userCount,
      },
    };
  }

  async update(id: string, updateKaeyrosDto: any) {
    const company = await this.companyModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (updateKaeyrosDto?.baseFilePrefix !== undefined) {
      throw new BadRequestException('Base file prefix cannot be changed after creation');
    }

    const previousStatus = company.status;
    if (updateKaeyrosDto?.status) {
      company.status = updateKaeyrosDto.status;
    }

    if (updateKaeyrosDto?.feature) {
      company.enabledFeatures = {
        ...(company.enabledFeatures || {}),
        [updateKaeyrosDto.feature]: updateKaeyrosDto.enabled,
      };
    }

    const allowedFields = [
      'name',
      'description',
      'email',
      'phone',
      'address',
      'city',
      'country',
      'industry',
      'website',
      'planType',
      'maxUsers',
      'defaultCurrency',
      'paymentMethods',
      'timezone',
      'supportedLanguages',
      'defaultLanguage',
      'logoUrl',
      'primaryColor',
      'notificationChannels',
      'emailNotificationSettings',
      'workflowSettings',
      'payoutSchedule',
      'notes',
    ];

    allowedFields.forEach((field) => {
      if (updateKaeyrosDto?.[field] !== undefined) {
        (company as Record<string, any>)[field] = updateKaeyrosDto[field];
      }
    });

    if (updateKaeyrosDto?.trialEndsAt !== undefined) {
      company.trialEndDate = updateKaeyrosDto.trialEndsAt;
    }

    if (updateKaeyrosDto?.features) {
      company.enabledFeatures = updateKaeyrosDto.features;
    }

    if (updateKaeyrosDto?.name) {
      const slug = updateKaeyrosDto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      company.slug = slug;
    }

    await company.save();

    if (updateKaeyrosDto?.status && updateKaeyrosDto.status !== previousStatus) {
      const adminUser = await this.userModel
        .findOne({
          company: company._id,
          systemRoles: UserRole.COMPANY_SUPER_ADMIN,
          isDeleted: false,
        } as any)
        .sort({ createdAt: 1 });

      if (adminUser) {
        const language = resolveLanguage({ user: adminUser, company });
        const newStatus = updateKaeyrosDto.status;
        const isDeactivated = newStatus === CompanyStatus.SUSPENDED || newStatus === CompanyStatus.DELETED;
        const isReactivated =
          (previousStatus === CompanyStatus.SUSPENDED || previousStatus === CompanyStatus.DELETED) &&
          newStatus === CompanyStatus.ACTIVE;

        if (isDeactivated) {
          await this.emailService.send({
            to: adminUser.email,
            subject: getEmailSubject('company-deactivated', language),
            template: 'company-deactivated',
            language,
            context: {
              firstName: adminUser.firstName,
              companyName: company.name || 'K-shap',
            },
          });
        }

        if (isReactivated) {
          await this.emailService.send({
            to: adminUser.email,
            subject: getEmailSubject('company-reactivated', language),
            template: 'company-reactivated',
            language,
            context: {
              firstName: adminUser.firstName,
              companyName: company.name || 'K-shap',
            },
          });
        }
      }
    }

    return company.toObject();
  }

  async seedCompanyRoles(companyId: string, actorId?: string) {
    const company = await this.companyModel.findOne({ _id: new Types.ObjectId(companyId), isDeleted: false });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    await this.rolesService.createDefaultCompanyRoles(companyId, actorId);
    return { success: true, message: 'Roles created successfully' };
  }

  async seedRolesForAllCompanies(actorId?: string) {
    const companies = await this.companyModel.find({ isDeleted: false }).select('_id').lean();
    let seededCount = 0;
    for (const company of companies) {
      await this.rolesService.createDefaultCompanyRoles(company._id.toString(), actorId);
      seededCount += 1;
    }
    return { success: true, message: 'Roles created successfully', seededCount };
  }

  async remove(id: string) {
    const company = await this.companyModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.isDeleted = true;
    company.deletedAt = new Date();
    company.status = CompanyStatus.DELETED;
    company.isActive = false;
    await company.save();

    return { success: true };
  }

  async resendCompanyAdminActivation(companyId: string, requesterUser: any) {
    const company = await this.companyModel.findOne({ _id: new Types.ObjectId(companyId), isDeleted: false });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const adminUser = await this.userModel
      .findOne({
        company: company._id,
        systemRoles: UserRole.COMPANY_SUPER_ADMIN,
        isDeleted: false,
      } as any)
      .sort({ createdAt: 1 });

    if (!adminUser) {
      throw new NotFoundException('Company admin user not found');
    }

    await this.usersService.resendActivation(adminUser._id.toString(), requesterUser);
    return { success: true };
  }
}
