import { BaseService, buildQueryString } from './base.service';
import { api } from '../lib/axios';
import type { PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto, QueryParams } from './types';

export interface PaymentMethodFilters extends QueryParams {
  companyId?: string;
  isActive?: boolean;
}

class PaymentMethodsService extends BaseService<
  PaymentMethod,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  PaymentMethodFilters
> {
  protected basePath = '/payment-methods';

  async findAll(params?: PaymentMethodFilters): Promise<any> {
    const queryString = buildQueryString(params);
    const response = await api.get<any>(`${this.basePath}${queryString}`);
    if (Array.isArray(response?.data)) {
      return {
        success: true,
        data: response.data,
        pagination: {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        },
      };
    }
    return response;
  }
}

export const paymentMethodsService = new PaymentMethodsService();
