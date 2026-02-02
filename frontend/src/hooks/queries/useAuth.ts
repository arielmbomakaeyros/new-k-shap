import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
// import { authService, LoginCredentials, LoginResponse } from '@/services/auth.service';
// import { useAuthStore } from '@/store/authStore';
import { queryKeys } from './keys';
import { useAuthStore, User } from '@/src/store/authStore';
import { authService } from '@/src/services';
import { LoginCredentials, LoginResponse } from '@/src/services/auth.service';
// import type { User } from '@/services/types';

/**
 * Hook for getting current user profile
 */
export function useProfile() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      const response = await authService.getProfile();
      return response.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook for login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { login, setIsLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onMutate: () => {
      setIsLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      const data = (response as any).data ?? response;
      const { user: rawUser, accessToken, refreshToken } = data as LoginResponse;

      // Map backend _id to frontend id
      const user: User = {
        ...rawUser,
        id: rawUser._id || rawUser.id,
      };

      login(user, accessToken, refreshToken);

      // Invalidate profile query to refetch with new token
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });

      // Role-based redirect: Kaeyros platform users go to /admin, company users go to /dashboard
      if (user.isKaeyrosUser) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error: { message: string }) => {
      setError(error.message || 'Login failed');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      // Clear all cached data
      queryClient.clear();
      router.push('/auth/login');
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      logout();
      queryClient.clear();
      router.push('/auth/login');
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
  });
}

/**
 * Hook for setting password (first login)
 */
export function useSetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      authService.setPassword(data),
    onSuccess: () => {
      router.push('/auth/login');
    },
  });
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authService.forgotPassword(data),
  });
}

/**
 * Hook for reset password
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      authService.resetPassword(data),
    onSuccess: () => {
      router.push('/auth/login');
    },
  });
}
