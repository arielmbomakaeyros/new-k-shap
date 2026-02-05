import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company } from '../../database/schemas/company.schema';

export interface CompanySettingsResponse {
  companyInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    industry: string;
  };
  paymentMethods: string[];
  defaultCurrency: string;
  branding: {
    logoUrl: string;
    primaryColor: string;
  };
  notificationChannels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };
  payoutSchedule: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    dayOfMonth?: number;
    dayOfWeek?: string;
  };
  approvalLimitsByRole: Record<string, number>;
  officeSpendCaps: Record<string, number>;
  defaultBeneficiaries: string[];
  workflowSettings: {
    requireDeptHeadApproval: boolean;
    requireValidatorApproval: boolean;
    requireCashierExecution: boolean;
    maxAmountNoApproval: number;
  };
  emailNotificationSettings: {
    onNewDisbursement: boolean;
    onDisbursementApproved: boolean;
    onDisbursementRejected: boolean;
    onCollectionAdded: boolean;
    dailySummary: boolean;
  };
}

export interface UpdateCompanyInfoDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
}

export interface UpdateWorkflowSettingsDto {
  requireDeptHeadApproval?: boolean;
  requireValidatorApproval?: boolean;
  requireCashierExecution?: boolean;
  maxAmountNoApproval?: number;
}

export interface UpdateEmailNotificationSettingsDto {
  onNewDisbursement?: boolean;
  onDisbursementApproved?: boolean;
  onDisbursementRejected?: boolean;
  onCollectionAdded?: boolean;
  dailySummary?: boolean;
}

export interface UpdateCompanyPreferencesDto {
  defaultCurrency?: string;
  paymentMethods?: string[];
  logoUrl?: string;
  primaryColor?: string;
  notificationChannels?: {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
    inApp?: boolean;
  };
  payoutSchedule?: {
    frequency?: 'weekly' | 'biweekly' | 'monthly';
    dayOfMonth?: number;
    dayOfWeek?: string;
  };
  approvalLimitsByRole?: Record<string, number>;
  officeSpendCaps?: Record<string, number>;
  defaultBeneficiaries?: string[];
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
  ) {}

  async getCompanySettings(companyId: string): Promise<CompanySettingsResponse> {
    const company = await this.companyModel.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return {
      companyInfo: {
        name: company.name,
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        industry: company.industry || '',
      },
      paymentMethods: company.paymentMethods || [],
      defaultCurrency: company.defaultCurrency || 'XAF',
      branding: {
        logoUrl: company.logoUrl || '',
        primaryColor: company.primaryColor || '#1d4ed8',
      },
      notificationChannels: company.notificationChannels || {
        email: true,
        sms: false,
        whatsapp: false,
        inApp: true,
      },
      payoutSchedule: company.payoutSchedule || {
        frequency: 'monthly',
        dayOfMonth: 25,
        dayOfWeek: 'friday',
      },
      approvalLimitsByRole: company.approvalLimitsByRole || {},
      officeSpendCaps: company.officeSpendCaps || {},
      defaultBeneficiaries: (company.defaultBeneficiaries || []).map((id: any) => id.toString()),
      workflowSettings: company.workflowSettings || {
        requireDeptHeadApproval: true,
        requireValidatorApproval: true,
        requireCashierExecution: true,
        maxAmountNoApproval: 500000,
      },
      emailNotificationSettings: company.emailNotificationSettings || {
        onNewDisbursement: true,
        onDisbursementApproved: true,
        onDisbursementRejected: true,
        onCollectionAdded: true,
        dailySummary: false,
      },
    };
  }

  async updateCompanyInfo(
    companyId: string,
    updateDto: UpdateCompanyInfoDto,
  ): Promise<CompanySettingsResponse> {
    const company = await this.companyModel.findByIdAndUpdate(
      companyId,
      { $set: updateDto },
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.getCompanySettings(companyId);
  }

  async updateWorkflowSettings(
    companyId: string,
    updateDto: UpdateWorkflowSettingsDto,
  ): Promise<CompanySettingsResponse> {
    const updateFields: Record<string, any> = {};

    if (updateDto.requireDeptHeadApproval !== undefined) {
      updateFields['workflowSettings.requireDeptHeadApproval'] = updateDto.requireDeptHeadApproval;
    }
    if (updateDto.requireValidatorApproval !== undefined) {
      updateFields['workflowSettings.requireValidatorApproval'] = updateDto.requireValidatorApproval;
    }
    if (updateDto.requireCashierExecution !== undefined) {
      updateFields['workflowSettings.requireCashierExecution'] = updateDto.requireCashierExecution;
    }
    if (updateDto.maxAmountNoApproval !== undefined) {
      updateFields['workflowSettings.maxAmountNoApproval'] = updateDto.maxAmountNoApproval;
    }

    const company = await this.companyModel.findByIdAndUpdate(
      companyId,
      { $set: updateFields },
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.getCompanySettings(companyId);
  }

  async updateEmailNotificationSettings(
    companyId: string,
    updateDto: UpdateEmailNotificationSettingsDto,
  ): Promise<CompanySettingsResponse> {
    const updateFields: Record<string, any> = {};

    if (updateDto.onNewDisbursement !== undefined) {
      updateFields['emailNotificationSettings.onNewDisbursement'] = updateDto.onNewDisbursement;
    }
    if (updateDto.onDisbursementApproved !== undefined) {
      updateFields['emailNotificationSettings.onDisbursementApproved'] = updateDto.onDisbursementApproved;
    }
    if (updateDto.onDisbursementRejected !== undefined) {
      updateFields['emailNotificationSettings.onDisbursementRejected'] = updateDto.onDisbursementRejected;
    }
    if (updateDto.onCollectionAdded !== undefined) {
      updateFields['emailNotificationSettings.onCollectionAdded'] = updateDto.onCollectionAdded;
    }
    if (updateDto.dailySummary !== undefined) {
      updateFields['emailNotificationSettings.dailySummary'] = updateDto.dailySummary;
    }

    const company = await this.companyModel.findByIdAndUpdate(
      companyId,
      { $set: updateFields },
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.getCompanySettings(companyId);
  }

  async updateCompanyPreferences(
    companyId: string,
    updateDto: UpdateCompanyPreferencesDto,
  ): Promise<CompanySettingsResponse> {
    const updateFields: Record<string, any> = {};

    if (updateDto.defaultCurrency !== undefined) {
      updateFields.defaultCurrency = updateDto.defaultCurrency;
    }
    if (updateDto.paymentMethods !== undefined) {
      if (updateDto.paymentMethods.length === 0) {
        throw new BadRequestException('At least one payment method is required');
      }
      updateFields.paymentMethods = updateDto.paymentMethods;
    }
    if (updateDto.logoUrl !== undefined) {
      updateFields.logoUrl = updateDto.logoUrl;
    }
    if (updateDto.primaryColor !== undefined) {
      updateFields.primaryColor = updateDto.primaryColor;
    }
    if (updateDto.notificationChannels) {
      Object.entries(updateDto.notificationChannels).forEach(([key, value]) => {
        updateFields[`notificationChannels.${key}`] = value;
      });
    }
    if (updateDto.payoutSchedule) {
      Object.entries(updateDto.payoutSchedule).forEach(([key, value]) => {
        updateFields[`payoutSchedule.${key}`] = value;
      });
    }
    if (updateDto.approvalLimitsByRole !== undefined) {
      updateFields.approvalLimitsByRole = updateDto.approvalLimitsByRole;
    }
    if (updateDto.officeSpendCaps !== undefined) {
      updateFields.officeSpendCaps = updateDto.officeSpendCaps;
    }
    if (updateDto.defaultBeneficiaries !== undefined) {
      updateFields.defaultBeneficiaries = updateDto.defaultBeneficiaries.map((id) => new Types.ObjectId(id));
    }

    const company = await this.companyModel.findByIdAndUpdate(
      companyId,
      { $set: updateFields },
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.getCompanySettings(companyId);
  }

  // Legacy methods for backward compatibility
  async create(createSettingDto: any) {
    return createSettingDto;
  }

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return {};
  }

  async update(id: string, updateSettingDto: any) {
    return updateSettingDto;
  }

  async remove(id: string) {
    return {};
  }
}
