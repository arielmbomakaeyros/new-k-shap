import { BaseService } from './base.service';
import type {
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionFilters,
} from './types';

class CollectionsService extends BaseService<
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionFilters
> {
  protected basePath = '/collections';

  /**
   * Get collections by payment type
   */
  async getByPaymentType(paymentType: string | string[], params?: CollectionFilters) {
    return this.findAll({ ...params, paymentType: paymentType as CollectionFilters['paymentType'] });
  }

  /**
   * Get collections by department
   */
  async getByDepartment(departmentId: string, params?: CollectionFilters) {
    return this.findAll({ ...params, department: departmentId });
  }

  /**
   * Get collections by revenue category
   */
  async getByRevenueCategory(revenueCategory: string, params?: CollectionFilters) {
    return this.findAll({ ...params, serviceCategory: revenueCategory });
  }
}

export const collectionsService = new CollectionsService();
