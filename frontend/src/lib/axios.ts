import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '../store/authStore';

// Types
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

// Configuration - Point to Next.js API routes, which will proxy to backend
const API_URL = '/api';

// State for token refresh
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create axios instance
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from Zustand store (lazy import to avoid circular deps)
    // const { useAuthStore } = await import('@/store/authStore');
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const requestUrl = originalRequest.url || '';

      // Never retry auth endpoints – just propagate the error
      if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh')) {
        const apiError: ApiError = {
          message:
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred',
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };

        return Promise.reject(apiError);
      }

      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint directly (bypasses request interceptor so
        // the expired access token is NOT attached as Authorization header).
        // withCredentials ensures the httpOnly refresh_token cookie is sent.
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });

        const { accessToken } = response.data?.data || response.data;

        // Update access token in store
        useAuthStore.getState().setToken(accessToken);

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        // Clear auth state and redirect to login
        useAuthStore.getState().logout();

        // Only redirect if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const apiError: ApiError = {
        message: 'Too many requests. Please wait a moment and try again.',
        statusCode: 429,
      };
      return Promise.reject(apiError);
    }

    // Transform error for consistent handling
    const apiError: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

// Helper methods
export const api = {
  get: <T>(url: string, config?: Parameters<typeof axiosClient.get>[1]) =>
    axiosClient.get<T>(url, config).then((res) => normalizeResponse(res.data)),

  post: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosClient.post>[2]
  ) => axiosClient.post<T>(url, data, config).then((res) => normalizeResponse(res.data)),

  put: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosClient.put>[2]
  ) => axiosClient.put<T>(url, data, config).then((res) => normalizeResponse(res.data)),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosClient.patch>[2]
  ) => axiosClient.patch<T>(url, data, config).then((res) => normalizeResponse(res.data)),

  delete: <T>(url: string, config?: Parameters<typeof axiosClient.delete>[1]) =>
    axiosClient.delete<T>(url, config).then((res) => normalizeResponse(res.data)),
};

export default axiosClient;

function normalizeResponse<T>(payload: T): T | { success: true; data: T } {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    return payload;
  }
  return { success: true, data: payload } as any;
}
