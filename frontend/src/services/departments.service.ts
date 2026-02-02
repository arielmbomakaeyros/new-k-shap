import { BaseService } from './base.service';
import type { QueryParams, Department, CreateDepartmentDto, UpdateDepartmentDto } from './types';

export interface DepartmentFilters extends QueryParams {
  companyId?: string;
  headId?: string;
}

class DepartmentsService extends BaseService<Department, CreateDepartmentDto, UpdateDepartmentDto, DepartmentFilters> {
  protected basePath = '/departments';
}

export const departmentsService = new DepartmentsService();
