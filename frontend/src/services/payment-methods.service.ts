import { BaseService } from './base.service';
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
}

export const paymentMethodsService = new PaymentMethodsService();
