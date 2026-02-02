// import { api } from '@/lib/axios';
import { api } from '../lib/axios';
import type { ApiResponse, EmailSettings, ReminderSettings } from './types';

class SettingsService {
  private basePath = '/settings';

  /**
   * Get all settings
   */
  async getAll(): Promise<ApiResponse<Record<string, unknown>>> {
    return api.get<ApiResponse<Record<string, unknown>>>(this.basePath);
  }

  /**
   * Get a specific setting by key
   */
  async get<T = unknown>(key: string): Promise<ApiResponse<T>> {
    return api.get<ApiResponse<T>>(`${this.basePath}/${key}`);
  }

  /**
   * Update a specific setting
   */
  async update<T = unknown>(key: string, value: T): Promise<ApiResponse<T>> {
    return api.put<ApiResponse<T>>(`${this.basePath}/${key}`, { value });
  }

  /**
   * Get email settings
   */
  async getEmailSettings(): Promise<ApiResponse<EmailSettings>> {
    return api.get<ApiResponse<EmailSettings>>(`${this.basePath}/email`);
  }

  /**
   * Update email settings
   */
  async updateEmailSettings(settings: Partial<EmailSettings>): Promise<ApiResponse<EmailSettings>> {
    return api.put<ApiResponse<EmailSettings>>(`${this.basePath}/email`, settings);
  }

  /**
   * Test email settings
   */
  async testEmailSettings(email: string): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(`${this.basePath}/email/test`, { email });
  }

  /**
   * Get reminder settings
   */
  async getReminderSettings(): Promise<ApiResponse<ReminderSettings>> {
    return api.get<ApiResponse<ReminderSettings>>(`${this.basePath}/reminders`);
  }

  /**
   * Update reminder settings
   */
  async updateReminderSettings(
    settings: Partial<ReminderSettings>
  ): Promise<ApiResponse<ReminderSettings>> {
    return api.put<ApiResponse<ReminderSettings>>(`${this.basePath}/reminders`, settings);
  }
}

export const settingsService = new SettingsService();
