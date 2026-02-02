// import { api } from '@/lib/axios';
import { api } from '../lib/axios';
import type { ApiResponse, PaginatedResponse, QueryParams, Permission } from './types';

export interface PermissionFilters extends QueryParams {
  category?: string;
}

class PermissionsService {
  private basePath = '/permissions';

  /**
   * Get all permissions
   */
  async findAll(params?: PermissionFilters): Promise<PaginatedResponse<Permission>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<PaginatedResponse<Permission>>(
      `${this.basePath}${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get permission by ID
   */
  async findById(id: string): Promise<ApiResponse<Permission>> {
    return api.get<ApiResponse<Permission>>(`${this.basePath}/${id}`);
  }

  /**
   * Get permissions grouped by category
   */
  async getGroupedByCategory(): Promise<ApiResponse<Record<string, Permission[]>>> {
    return api.get<ApiResponse<Record<string, Permission[]>>>(`${this.basePath}/grouped`);
  }
}

export const permissionsService = new PermissionsService();
