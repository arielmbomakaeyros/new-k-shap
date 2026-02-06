'use client';

import { useAuthStore } from '@/src/store/authStore';
import { useEffect } from 'react';
import axiosClient from '@/src/lib/axios';

/**
 * Attempt a silent token refresh on page reload.
 *
 * Because `token` is persisted to localStorage alongside `user`,
 * this branch only fires when the token was explicitly cleared
 * (e.g. by a failed interceptor refresh).  In the normal case
 * the axios 401 interceptor handles token renewal transparently.
 */
export function AuthInitializer() {
  useEffect(() => {
    const { user, token, setToken, setIsLoading, logout } =
      useAuthStore.getState();

    if (user && !token) {
      setIsLoading(true);
      axiosClient
        .post('/auth/refresh', {})
        .then((response) => {
          const { accessToken } = response.data?.data || response.data;
          if (accessToken) {
            setToken(accessToken);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  return null;
}
