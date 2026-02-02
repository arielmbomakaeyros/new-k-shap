import { BaseService } from './base.service';
import type { QueryParams, Beneficiary, CreateBeneficiaryDto, UpdateBeneficiaryDto } from './types';

export interface BeneficiaryFilters extends QueryParams {
  companyId?: string;
  type?: 'individual' | 'company';
}

class BeneficiariesService extends BaseService<Beneficiary, CreateBeneficiaryDto, UpdateBeneficiaryDto, BeneficiaryFilters> {
  protected basePath = '/beneficiaries';
}

export const beneficiariesService = new BeneficiariesService();
