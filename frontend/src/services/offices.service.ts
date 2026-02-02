import { BaseService } from './base.service';
import type { QueryParams, Office, CreateOfficeDto, UpdateOfficeDto } from './types';

export interface OfficeFilters extends QueryParams {
  companyId?: string;
  location?: string;
}

class OfficesService extends BaseService<Office, CreateOfficeDto, UpdateOfficeDto, OfficeFilters> {
  protected basePath = '/offices';
}

export const officesService = new OfficesService();
