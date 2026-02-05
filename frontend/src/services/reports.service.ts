// import { api } from '@/lib/axios';
import { api } from '../lib/axios';
import type {
  ApiResponse,
  DashboardReport,
  DisbursementSummary,
  CollectionSummary,
  DateRange,
} from './types';

export interface ReportFilters extends DateRange {
  department?: string;
  office?: string;
  companyId?: string;
}

class ReportsService {
  private basePath = '/reports';

  /**
   * Get dashboard report
   */
  async getDashboard(filters?: ReportFilters): Promise<ApiResponse<DashboardReport>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<DashboardReport>>(
      `${this.basePath}/dashboard${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get disbursements summary report
   */
  async getDisbursementsSummary(
    filters?: ReportFilters
  ): Promise<ApiResponse<DisbursementSummary>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<DisbursementSummary>>(
      `${this.basePath}/disbursements/summary${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get collections summary report
   */
  async getCollectionsSummary(
    filters?: ReportFilters
  ): Promise<ApiResponse<CollectionSummary>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<CollectionSummary>>(
      `${this.basePath}/collections/summary${queryString ? `?${queryString}` : ''}`
    );
  }
}

export const reportsService = new ReportsService();
