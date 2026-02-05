import { api } from '../lib/axios';
import type { ApiResponse, PlatformSettings } from './types';

class PlatformSettingsService {
  private basePath = '/kaeyros/settings';

  async get(): Promise<ApiResponse<PlatformSettings>> {
    return api.get<ApiResponse<PlatformSettings>>(this.basePath);
  }

  async update(data: Partial<PlatformSettings>): Promise<ApiResponse<PlatformSettings>> {
    return api.patch<ApiResponse<PlatformSettings>>(this.basePath, data);
  }
}

export const platformSettingsService = new PlatformSettingsService();
