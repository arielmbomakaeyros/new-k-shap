// import { api } from '@/lib/axios';
// import axiosClient from '@/lib/axios';
import axiosClient, { api } from '../lib/axios';
import type { ApiResponse, PaginatedResponse, QueryParams, FileUpload } from './types';

export interface FileUploadFilters extends QueryParams {
  entityType?: string;
  entityId?: string;
  mimeType?: string;
}

export type FileUploadCategory =
  | 'invoice'
  | 'receipt'
  | 'contract'
  | 'attachment'
  | 'profile_picture'
  | 'company_logo'
  | 'report'
  | 'other';

class FileUploadService {
  private basePath = '/file-upload';

  /**
   * Get all uploaded files
   */
  async findAll(params?: FileUploadFilters): Promise<PaginatedResponse<FileUpload>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<PaginatedResponse<FileUpload>>(
      `${this.basePath}${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get file by ID
   */
  async findById(id: string): Promise<ApiResponse<FileUpload>> {
    return api.get<ApiResponse<FileUpload>>(`${this.basePath}/${id}`);
  }

  /**
   * Upload a file
   */
  async upload(
    file: File,
    options?: {
      category?: FileUploadCategory;
      entityType?: string;
      entityId?: string;
      description?: string;
      tags?: string[];
      onProgress?: (progress: number) => void;
    }
  ): Promise<ApiResponse<FileUpload>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', options?.category || 'attachment');

    if (options?.entityType) {
      formData.append('entityType', options.entityType);
    }
    if (options?.entityId) {
      formData.append('entityId', options.entityId);
    }
    if (options?.description) {
      formData.append('description', options.description);
    }
    if (options?.tags?.length) {
      formData.append('tags', options.tags.join(','));
    }

    const response = await axiosClient.post<ApiResponse<FileUpload>>(
      `${this.basePath}/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (options?.onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            options.onProgress(progress);
          }
        },
      }
    );

    return response.data;
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    options?: {
      category?: FileUploadCategory;
      entityType?: string;
      entityId?: string;
      description?: string;
      tags?: string[];
      onProgress?: (progress: number) => void;
    }
  ): Promise<ApiResponse<FileUpload[]>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('category', options?.category || 'attachment');

    if (options?.entityType) {
      formData.append('entityType', options.entityType);
    }
    if (options?.entityId) {
      formData.append('entityId', options.entityId);
    }
    if (options?.description) {
      formData.append('description', options.description);
    }
    if (options?.tags?.length) {
      formData.append('tags', options.tags.join(','));
    }

    const response = await axiosClient.post<ApiResponse<FileUpload[]>>(
      `${this.basePath}/upload-multiple`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (options?.onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            options.onProgress(progress);
          }
        },
      }
    );

    return response.data;
  }

  /**
   * Delete a file
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
  }

  /**
   * Get download URL
   */
  async getDownloadUrl(id: string): Promise<ApiResponse<{ url: string }>> {
    return api.get<ApiResponse<{ url: string }>>(`${this.basePath}/${id}/download`);
  }

  /**
   * Download file directly
   */
  async download(id: string): Promise<Blob> {
    const response = await axiosClient.get(`${this.basePath}/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const fileUploadService = new FileUploadService();
