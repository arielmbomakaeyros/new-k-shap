import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { PermissionFilters, permissionsService } from '@/src/services/permissions.service';

/**
 * Hook for fetching permissions list
 */
export function usePermissions(filters?: PermissionFilters) {
  return useQuery({
    queryKey: queryKeys.permissions.list(filters),
    queryFn: () => permissionsService.findAll(filters),
    staleTime: 10 * 60 * 1000, // Permissions rarely change
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single permission
 */
export function usePermission(id: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.permissions.all, 'detail', id],
    queryFn: async () => {
      const response = await permissionsService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for fetching permissions grouped by category
 */
export function usePermissionsGrouped() {
  return useQuery({
    queryKey: queryKeys.permissions.grouped(),
    queryFn: () => permissionsService.getGroupedByCategory(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
