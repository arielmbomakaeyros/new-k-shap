import { api } from '../lib/axios';
import { BaseService } from './base.service';
import type { ApiResponse, DisbursementTemplate, CreateDisbursementTemplateDto, UpdateDisbursementTemplateDto } from './types';

export interface DisbursementTemplateFilters {
  isActive?: boolean;
}

class DisbursementTemplatesService extends BaseService<
  DisbursementTemplate,
  CreateDisbursementTemplateDto,
  UpdateDisbursementTemplateDto,
  DisbursementTemplateFilters
> {
  protected basePath = '/disbursement-templates';

  async toggleActive(id: string, isActive: boolean): Promise<ApiResponse<DisbursementTemplate>> {
    return api.patch<ApiResponse<DisbursementTemplate>>(`${this.basePath}/${id}`, { isActive });
  }
}

export const disbursementTemplatesService = new DisbursementTemplatesService();
