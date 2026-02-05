// import { api } from '@/lib/axios';
import { api } from '../lib/axios';
import type { ApiResponse, PaginatedResponse, QueryParams } from './types';

/**
 * Build query string from params object
 */
function buildQueryString(params?: QueryParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Abstract base service class for CRUD operations
 */
export abstract class BaseService<
  T,
  CreateDto,
  UpdateDto,
  Filters extends QueryParams = QueryParams
> {
  protected abstract basePath: string;

  /**
   * Get all items with pagination and filtering
   */
  async findAll(params?: Filters): Promise<PaginatedResponse<T>> {
    const queryString = buildQueryString(params);
    const response = await api.get<any>(`${this.basePath}${queryString}`);

    // Normalize nested paginated responses returned by the backend
    if (response && typeof response === 'object') {
      const maybeData = (response as any).data;
      const maybePagination = maybeData?.pagination;
      if ((response as any).success && Array.isArray(maybeData?.data) && maybePagination) {
        return {
          success: (response as any).success,
          data: maybeData.data,
          pagination: maybePagination,
          message: (response as any).message,
          errors: (response as any).errors,
        } as PaginatedResponse<T>;
      }
    }

    return response as PaginatedResponse<T>;
  }

  /**
   * Get a single item by ID
   */
  async findById(id: string): Promise<ApiResponse<T>> {
    return api.get<ApiResponse<T>>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new item
   */
  async create(data: CreateDto): Promise<ApiResponse<T>> {
    return api.post<ApiResponse<T>>(this.basePath, data);
  }

  /**
   * Update an existing item
   */
  async update(id: string, data: UpdateDto): Promise<ApiResponse<T>> {
    return api.patch<ApiResponse<T>>(`${this.basePath}/${id}`, data);
  }

  /**
   * Replace an existing item (full update)
   */
  async replace(id: string, data: CreateDto): Promise<ApiResponse<T>> {
    return api.put<ApiResponse<T>>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete an item (soft delete)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
  }
}

/**
 * Helper to create a simple service for a resource
 */
export function createService<
  T,
  CreateDto,
  UpdateDto,
  Filters extends QueryParams = QueryParams
>(basePath: string) {
  return new (class extends BaseService<T, CreateDto, UpdateDto, Filters> {
    protected basePath = basePath;
  })();
}

export { buildQueryString };
