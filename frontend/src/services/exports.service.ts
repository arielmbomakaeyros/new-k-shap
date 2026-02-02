// import { api } from '@/lib/axios';
import { api } from '../lib/axios';
import type { ApiResponse, PaginatedResponse, QueryParams, Export, CreateExportDto } from './types';

class ExportsService {
  private basePath = '/exports';

  /**
   * Get all exports
   */
  async findAll(params?: QueryParams): Promise<PaginatedResponse<Export>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<PaginatedResponse<Export>>(
      `${this.basePath}${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get export by ID
   */
  async findById(id: string): Promise<ApiResponse<Export>> {
    return api.get<ApiResponse<Export>>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new export
   */
  async create(data: CreateExportDto): Promise<ApiResponse<Export>> {
    return api.post<ApiResponse<Export>>(this.basePath, data);
  }

  /**
   * Delete an export
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
  }

  /**
   * Get download URL for an export
   */
  async getDownloadUrl(id: string): Promise<ApiResponse<{ url: string }>> {
    return api.get<ApiResponse<{ url: string }>>(`${this.basePath}/${id}/download`);
  }

  /**
   * Export disbursements
   */
  async exportDisbursements(
    format: 'csv' | 'pdf' | 'xlsx',
    filters?: Record<string, unknown>
  ): Promise<ApiResponse<Export>> {
    return this.create({ type: 'disbursements', format, filters });
  }

  /**
   * Export collections
   */
  async exportCollections(
    format: 'csv' | 'pdf' | 'xlsx',
    filters?: Record<string, unknown>
  ): Promise<ApiResponse<Export>> {
    return this.create({ type: 'collections', format, filters });
  }

  /**
   * Export users
   */
  async exportUsers(
    format: 'csv' | 'pdf' | 'xlsx',
    filters?: Record<string, unknown>
  ): Promise<ApiResponse<Export>> {
    return this.create({ type: 'users', format, filters });
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(
    format: 'csv' | 'pdf' | 'xlsx',
    filters?: Record<string, unknown>
  ): Promise<ApiResponse<Export>> {
    return this.create({ type: 'audit_logs', format, filters });
  }
}

export const exportsService = new ExportsService();
