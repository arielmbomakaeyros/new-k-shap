import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
// import { authService, LoginCredentials, LoginResponse } from '@/services/auth.service';
// import { useAuthStore } from '@/store/authStore';
import { queryKeys } from './keys';
import { useAuthStore, User } from '@/src/store/authStore';
import { authService } from '@/src/services';
import { LoginCredentials, LoginResponse, UpdateProfileDto } from '@/src/services/auth.service';
import { handleMutationError } from '@/src/lib/mutationError';
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
      const data = (response as any).data;
      const { user: rawUser, accessToken } = data as LoginResponse;

      // Map backend _id to frontend id
      const user: User = {
        ...rawUser,
        id: rawUser._id || rawUser.id,
      };

      login(user, accessToken);

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
      handleMutationError(error, 'Login failed');
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
    onError: (error) => handleMutationError(error, 'Failed to change password'),
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
    onError: (error) => handleMutationError(error, 'Failed to set password'),
  });
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authService.forgotPassword(data),
    onError: (error) => handleMutationError(error, 'Failed to send reset email'),
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
    onError: (error) => handleMutationError(error, 'Failed to reset password'),
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => authService.updateProfile(data),
    onSuccess: (response) => {
      const updated = (response as any).data;
      if (updated) {
        updateUser(updated);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
    onError: (error) => handleMutationError(error, 'Failed to update profile'),
  });
}

/**
 * Hook for updating user avatar
 */
export function useUpdateProfileAvatar() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => authService.updateProfileAvatar(file),
    onSuccess: (response) => {
      const updated = (response as any).data;
      if (updated) {
        updateUser(updated);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
    onError: (error) => handleMutationError(error, 'Failed to update avatar'),
  });
}
