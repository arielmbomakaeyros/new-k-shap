import { BaseService } from './base.service';
import type { QueryParams, Beneficiary, CreateBeneficiaryDto, UpdateBeneficiaryDto } from './types';

export interface BeneficiaryFilters extends QueryParams {
  companyId?: string;
  isActive?: boolean;
  disbursementType?: string;
}

class BeneficiariesService extends BaseService<Beneficiary, CreateBeneficiaryDto, UpdateBeneficiaryDto, BeneficiaryFilters> {
  protected basePath = '/beneficiaries';
}

export const beneficiariesService = new BeneficiariesService();
