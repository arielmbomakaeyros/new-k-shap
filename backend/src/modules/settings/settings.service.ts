import { Injectable, NotFoundException } from '@nestjs/common';
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
