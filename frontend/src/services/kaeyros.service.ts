import { api } from '../lib/axios';
import type { ApiResponse, PaginatedResponse, Company, PlatformStats } from './types';

export interface KaeyrosCompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

class KaeyrosService {
  async getStats(): Promise<ApiResponse<PlatformStats>> {
    return api.get<ApiResponse<PlatformStats>>('/kaeyros/stats');
  }

  async getCompanies(filters?: KaeyrosCompanyFilters): Promise<PaginatedResponse<Company & { stats?: any }>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    const response = await api.get<any>(`/kaeyros/companies${query ? `?${query}` : ''}`);

    if (response && typeof response === 'object') {
      const maybeData = response.data;
      const maybePagination = maybeData?.pagination;
      if (response.success && Array.isArray(maybeData?.data) && maybePagination) {
        return {
          success: response.success,
          data: maybeData.data,
          pagination: maybePagination,
        } as PaginatedResponse<Company & { stats?: any }>;
      }
    }

    return response as PaginatedResponse<Company & { stats?: any }>;
  }

  async createCompany(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    industry?: string;
    website?: string;
    baseFilePrefix: string;
    status?: string;
    plan?: string;
    maxUsers?: number;
    trialEndsAt?: string;
    defaultCurrency?: string;
    paymentMethods?: string[];
    timezone?: string;
    supportedLanguages?: string[];
    defaultLanguage?: string;
    logoUrl?: string;
    primaryColor?: string;
    notificationChannels?: Record<string, boolean>;
    emailNotificationSettings?: Record<string, boolean>;
    workflowSettings?: Record<string, boolean | number>;
    payoutSchedule?: { frequency?: string; dayOfMonth?: number; dayOfWeek?: string };
    features?: Record<string, boolean>;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
  }): Promise<ApiResponse<Company>> {
    return api.post<ApiResponse<Company>>('/kaeyros/companies', data);
  }

  async updateCompany(id: string, data: Record<string, any>): Promise<ApiResponse<Company>> {
    return api.patch<ApiResponse<Company>>(`/kaeyros/companies/${id}`, data);
  }

  async updateCompanyStatus(id: string, status: string, reason?: string): Promise<ApiResponse<Company>> {
    return api.patch<ApiResponse<Company>>(`/kaeyros/companies/${id}/status`, { status, reason });
  }

  async resendCompanyActivation(id: string): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`/kaeyros/companies/${id}/resend-activation`);
  }

  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/kaeyros/companies/${id}`);
  }

  async getAuditLogs(filters?: { page?: number; limit?: number; company?: string; action?: string; startDate?: string; endDate?: string; }): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    const response = await api.get<any>(`/kaeyros/audit-logs${query ? `?${query}` : ''}`);

    if (response && typeof response === 'object') {
      const maybeData = response.data;
      const maybePagination = maybeData?.pagination;
      if (response.success && Array.isArray(maybeData?.data) && maybePagination) {
        return {
          success: response.success,
          data: maybeData.data,
          pagination: maybePagination,
          message: response.message,
          errors: response.errors,
        } as PaginatedResponse<any>;
      }
    }

    return response as PaginatedResponse<any>;
  }
}

export const kaeyrosService = new KaeyrosService();
