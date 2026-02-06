import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { notificationsService, NotificationFilters } from '@/services/notifications.service';
import { queryKeys } from './keys';
import { NotificationFilters, notificationsService } from '@/src/services/notifications.service';
import { handleMutationError } from '@/src/lib/mutationError';

/**
 * Hook for fetching notifications list
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => notificationsService.findAll(filters),
    staleTime: 2 * 60 * 1000, // Shorter stale time for notifications
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching unread notifications
 */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => notificationsService.getUnread(),
    staleTime: 1 * 60 * 1000, // Very short stale time
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
}

/**
 * Hook for fetching unread count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await notificationsService.getUnreadCount();
      return response.data.count;
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook for marking a notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onError: (error) => handleMutationError(error, 'Failed to mark notification'),
  });
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: string[]) => notificationsService.markAllAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => handleMutationError(error, 'Failed to mark notifications'),
  });
}

/**
 * Hook for deleting a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onError: (error) => handleMutationError(error, 'Failed to delete notification'),
  });
}
