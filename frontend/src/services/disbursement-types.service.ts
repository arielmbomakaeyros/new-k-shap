import { BaseService } from './base.service';
import type {
  QueryParams,
  DisbursementType,
  CreateDisbursementTypeDto,
  UpdateDisbursementTypeDto,
} from './types';

export interface DisbursementTypeFilters extends QueryParams {
  companyId?: string;
  isActive?: boolean;
}

class DisbursementTypesService extends BaseService<
  DisbursementType,
  CreateDisbursementTypeDto,
  UpdateDisbursementTypeDto,
  DisbursementTypeFilters
> {
  protected basePath = '/disbursement-types';
}

export const disbursementTypesService = new DisbursementTypesService();
