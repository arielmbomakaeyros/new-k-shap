// import { api } from '@/lib/axios';
import { api } from '../lib/axios';
import type { ApiResponse, PaginatedResponse, QueryParams, Notification } from './types';

export interface NotificationFilters extends QueryParams {
  read?: boolean;
  type?: string | string[];
}

class NotificationsService {
  private basePath = '/notifications';

  /**
   * Get all notifications for current user
   */
  async findAll(params?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<PaginatedResponse<Notification>>(
      `${this.basePath}${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get a single notification
   */
  async findById(id: string): Promise<ApiResponse<Notification>> {
    return api.get<ApiResponse<Notification>>(`${this.basePath}/${id}`);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return api.patch<ApiResponse<Notification>>(`${this.basePath}/${id}`, { read: true });
  }

  /**
   * Mark multiple notifications as read
   */
  async markAllAsRead(ids?: string[]): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.basePath}/mark-read`, { ids });
  }

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return api.get<ApiResponse<{ count: number }>>(`${this.basePath}/unread-count`);
  }

  /**
   * Get unread notifications only
   */
  async getUnread(params?: QueryParams) {
    return this.findAll({ ...params, read: false });
  }
}

export const notificationsService = new NotificationsService();
