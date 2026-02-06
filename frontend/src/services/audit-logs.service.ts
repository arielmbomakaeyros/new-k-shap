// import { api } from '@/lib/axios';
import { api } from '../lib/axios';
import type { ApiResponse, PaginatedResponse, AuditLog, AuditLogFilters } from './types';

class AuditLogsService {
  private basePath = '/audit-logs';

  /**
   * Get all audit logs with filtering
   */
  async findAll(params?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<PaginatedResponse<AuditLog>>(
      `${this.basePath}${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get audit logs for a specific entity
   */
  async getByEntity(entityType: string, entityId: string, params?: AuditLogFilters) {
    return this.findAll({ ...params, resourceType: entityType, resourceId: entityId });
  }

  /**
   * Get audit logs for a specific user
   */
  async getByUser(userId: string, params?: AuditLogFilters) {
    return this.findAll({ ...params, userId });
  }

  /**
   * Get audit logs by action
   */
  async getByAction(action: string, params?: AuditLogFilters) {
    return this.findAll({ ...params, action });
  }
}

export const auditLogsService = new AuditLogsService();
