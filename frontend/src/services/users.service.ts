// import { api } from '@/lib/axios';
import axiosClient, { api } from '../lib/axios';
import { BaseService } from './base.service';
import type { ApiResponse, QueryParams, User, CreateUserDto, UpdateUserDto } from './types';
import { uploadMultipart } from './upload.service';

export interface UserFilters extends QueryParams {
  role?: string;
  companyId?: string;
  departmentId?: string;
  officeId?: string;
  isActive?: boolean;
  canLogin?: boolean;
}

class UsersService extends BaseService<User, CreateUserDto, UpdateUserDto, UserFilters> {
  protected basePath = '/users';

  /**
   * Restore a soft-deleted user
   */
  async restore(id: string): Promise<ApiResponse<User>> {
    return api.post<ApiResponse<User>>(`${this.basePath}/${id}/restore`);
  }

  /**
   * Resend activation email to user
   */
  async resendActivation(id: string): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.basePath}/${id}/resend-activation`);
  }

  /**
   * Get users by department
   */
  async getByDepartment(departmentId: string, params?: QueryParams) {
    return this.findAll({ ...params, departmentId });
  }

  /**
   * Get users by role
   */
  async getByRole(role: string, params?: QueryParams) {
    return this.findAll({ ...params, role });
  }

  /**
   * Update user permissions
   */
  async updatePermissions(id: string, permissions: string[]): Promise<ApiResponse<User>> {
    return api.patch<ApiResponse<User>>(`${this.basePath}/${id}`, { permissions });
  }


  /**
   * Upload user avatar
   */
  async updateAvatar(id: string, file: File): Promise<ApiResponse<User>> {
    return uploadMultipart<ApiResponse<User>>(`${this.basePath}/${id}/avatar`, file);
  }

  /**
   * Toggle user active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return api.patch<ApiResponse<User>>(`${this.basePath}/${id}`, { isActive });
  }

  /**
   * Download user import template
   */
  async downloadTemplate(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await axiosClient.get(`${this.basePath}/template`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Bulk import users from CSV/XLSX
   */
  async bulkImport(file: File): Promise<ApiResponse<{
    createdCount: number;
    failedCount: number;
    errors: { row: number; email?: string; message: string }[];
  }>> {
    return uploadMultipart<ApiResponse<{
      createdCount: number;
      failedCount: number;
      errors: { row: number; email?: string; message: string }[];
    }>>(`${this.basePath}/bulk-import`, file);
  }
}

export const usersService = new UsersService();
