'use client';

import { useAuthStore } from '@/src/store/authStore';
import { useEffect } from 'react';

/**
 * Initialize authentication on client side
 * - Restore auth state from localStorage
 */
export function AuthInitializer() {
  useEffect(() => {
    // Restore auth from localStorage
    const { token } = useAuthStore.getState();

    // If no token in store, check localStorage
    if (!token) {
      const storedAuth = localStorage.getItem('auth-storage');
      if (storedAuth) {
        try {
          const { state } = JSON.parse(storedAuth);
          if (state?.token) {
            useAuthStore.getState().setToken(state.token);
            useAuthStore.getState().setUser(state.user);
          }
        } catch (error) {
          console.error('Failed to restore auth state:', error);
        }
      }
    }
  }, []);

  return null;
}
