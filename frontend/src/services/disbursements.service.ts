// import { api } from '@/lib/axios';
import { api } from '../lib/axios';
import { BaseService, buildQueryString } from './base.service';
import type {
  ApiResponse,
  Disbursement,
  CreateDisbursementDto,
  UpdateDisbursementDto,
  DisbursementFilters,
} from './types';

export interface ApproveDto {
  notes?: string;
}

export interface RejectDto {
  reason: string;
  comment?: string;
}

class DisbursementsService extends BaseService<
  Disbursement,
  CreateDisbursementDto,
  UpdateDisbursementDto,
  DisbursementFilters
> {
  protected basePath = '/disbursements';

  /**
   * Approve a disbursement at the current approval step
   */
  async approve(id: string, data?: ApproveDto): Promise<ApiResponse<Disbursement>> {
    return api.post<ApiResponse<Disbursement>>(`${this.basePath}/${id}/approve`, data);
  }

  /**
   * Reject a disbursement
   */
  async reject(id: string, data: RejectDto): Promise<ApiResponse<Disbursement>> {
    return api.post<ApiResponse<Disbursement>>(`${this.basePath}/${id}/reject`, data);
  }

  /**
   * Cancel a disbursement (can only be done by requester or admin)
   */
  async cancel(id: string, reason?: string): Promise<ApiResponse<Disbursement>> {
    return api.post<ApiResponse<Disbursement>>(`${this.basePath}/${id}/cancel`, { reason });
  }

  /**
   * Get disbursements pending approval for current user
   */
  async getPendingApprovals(params?: DisbursementFilters) {
    return this.findAll({
      ...params,
      status: ['pending_dept_head', 'pending_validator', 'pending_cashier'],
    });
  }

  /**
   * Get disbursements by status
   */
  async getByStatus(status: string | string[], params?: DisbursementFilters) {
    return this.findAll({ ...params, status: status as DisbursementFilters['status'] });
  }

  /**
   * Get disbursements by department
   */
  async getByDepartment(departmentId: string, params?: DisbursementFilters) {
    return this.findAll({ ...params, department: departmentId });
  }

  /**
   * Get my disbursements (requested by current user)
   */
  async getMyDisbursements(params?: DisbursementFilters) {
    return api.get<ApiResponse<Disbursement[]>>(
      `${this.basePath}/my${buildQueryString(params)}`
    );
  }

  /**
   * Force complete a disbursement (admin only)
   */
  async forceComplete(id: string, reason: string): Promise<ApiResponse<Disbursement>> {
    return api.post<ApiResponse<Disbursement>>(`${this.basePath}/${id}/force-complete`, {
      reason,
    });
  }

  /**
   * Submit a draft disbursement for approval
   */
  async submit(id: string): Promise<ApiResponse<Disbursement>> {
    return api.post<ApiResponse<Disbursement>>(`${this.basePath}/${id}/submit`);
  }

  /**
   * Mark as retroactive
   */
  async markRetroactive(id: string, isRetroactive: boolean): Promise<ApiResponse<Disbursement>> {
    return api.patch<ApiResponse<Disbursement>>(`${this.basePath}/${id}`, {
      isRetroactive,
    });
  }
}

export const disbursementsService = new DisbursementsService();
