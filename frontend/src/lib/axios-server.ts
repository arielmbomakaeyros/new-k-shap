import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { headers } from 'next/headers';

// Backend API URL (not the Next.js API routes)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api/v1';

// Create server-side axios instance
const axiosServer: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface BackendResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BackendError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

/**
 * Get the authorization header from the incoming request
 */
export async function getAuthHeader(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('authorization');
}

/**
 * Forward a request to the backend with authentication
 */
export async function forwardRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  data?: unknown,
  customHeaders?: Record<string, string>
): Promise<BackendResponse<T>> {
  const authHeader = await getAuthHeader();

  const config = {
    method,
    url: path,
    ...(data && { data }),
    headers: {
      ...(authHeader && { Authorization: authHeader }),
      ...customHeaders,
    },
  };

  try {
    const response: AxiosResponse<BackendResponse<T>> = await axiosServer(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<BackendError>;
      const backendError: BackendError = {
        message: axiosError.response?.data?.message || axiosError.message || 'Backend error',
        statusCode: axiosError.response?.status || 500,
        errors: axiosError.response?.data?.errors,
      };
      throw backendError;
    }
    throw error;
  }
}

/**
 * Helper methods for common HTTP operations
 */
export const serverApi = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    forwardRequest<T>('GET', path, undefined, headers),

  post: <T>(path: string, data?: unknown, headers?: Record<string, string>) =>
    forwardRequest<T>('POST', path, data, headers),

  put: <T>(path: string, data?: unknown, headers?: Record<string, string>) =>
    forwardRequest<T>('PUT', path, data, headers),

  patch: <T>(path: string, data?: unknown, headers?: Record<string, string>) =>
    forwardRequest<T>('PATCH', path, data, headers),

  delete: <T>(path: string, headers?: Record<string, string>) =>
    forwardRequest<T>('DELETE', path, undefined, headers),
};

export default axiosServer;
