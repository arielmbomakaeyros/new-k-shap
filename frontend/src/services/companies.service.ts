import { BaseService } from './base.service';
import type { QueryParams, Company, CreateCompanyDto, UpdateCompanyDto } from './types';

export interface CompanyFilters extends QueryParams {
  subscriptionStatus?: 'active' | 'inactive' | 'suspended' | 'expired';
  industry?: string;
  country?: string;
}

class CompaniesService extends BaseService<Company, CreateCompanyDto, UpdateCompanyDto, CompanyFilters> {
  protected basePath = '/companies';
}

export const companiesService = new CompaniesService();
