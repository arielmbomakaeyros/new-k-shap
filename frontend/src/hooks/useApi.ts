'use client';
import { API_BASE_URL } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export function useApi() {
  const { token } = useAuthStore();

  const fetchAPI = async <T,>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  };

  return { fetchAPI };
}
