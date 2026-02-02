import { BaseService } from './base.service';
import type { QueryParams, Role, CreateRoleDto, UpdateRoleDto } from './types';

export interface RoleFilters extends QueryParams {
  companyId?: string;
  isSystemRole?: boolean;
}

class RolesService extends BaseService<Role, CreateRoleDto, UpdateRoleDto, RoleFilters> {
  protected basePath = '/roles';
}

export const rolesService = new RolesService();
