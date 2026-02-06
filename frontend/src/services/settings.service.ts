import { api } from '../lib/axios';
import type {
  ApiResponse,
  EmailSettings,
  ReminderSettings,
  CompanySettings,
  CompanyInfo,
  WorkflowSettings,
  EmailNotificationSettings,
} from './types';

class SettingsService {
  private basePath = '/settings';

  /**
   * Get company settings (company info, workflow settings, notification settings)
   */
  async getCompanySettings(): Promise<CompanySettings> {
    const response = await api.get<any>(`${this.basePath}/company`);
    if (response && typeof response === 'object' && 'success' in response) {
      return (response as any).data as CompanySettings;
    }
    return response as CompanySettings;
  }

  /**
   * Update company information
   */
  async updateCompanyInfo(data: Partial<CompanyInfo>): Promise<CompanySettings> {
    const response = await api.patch<CompanySettings>(`${this.basePath}/company/info`, data);
    return response;
  }

  /**
   * Update workflow settings
   */
  async updateWorkflowSettings(data: Partial<WorkflowSettings>): Promise<CompanySettings> {
    const response = await api.patch<CompanySettings>(`${this.basePath}/company/workflow`, data);
    return response;
  }

  /**
   * Update email notification settings
   */
  async updateEmailNotificationSettings(
    data: Partial<EmailNotificationSettings>
  ): Promise<CompanySettings> {
    const response = await api.patch<CompanySettings>(
      `${this.basePath}/company/notifications`,
      data
    );
    return response;
  }

  /**
   * Update company preferences (currency, payment methods, branding, channels)
   */
  async updateCompanyPreferences(data: Partial<CompanySettings>): Promise<CompanySettings> {
    const response = await api.patch<CompanySettings>(`${this.basePath}/company/preferences`, data);
    return response;
  }

  // Workflow Templates
  async getWorkflowTemplates() {
    return api.get<any>(`${this.basePath}/workflow-templates`);
  }

  async activateWorkflowTemplate(id: string) {
    return api.patch<any>(`${this.basePath}/workflow-templates/${id}/activate`, {});
  }

  async createWorkflowTemplate(data: { name: string; description?: string; steps: any[] }) {
    return api.post<any>(`${this.basePath}/workflow-templates`, data);
  }

  async deleteWorkflowTemplate(id: string) {
    return api.delete<any>(`${this.basePath}/workflow-templates/${id}`);
  }

  /**
   * Get all settings (legacy)
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
