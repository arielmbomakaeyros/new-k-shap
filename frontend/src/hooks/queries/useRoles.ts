import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { rolesService, RoleFilters } from '@/services/roles.service';
import { queryKeys } from './keys';
// import type { CreateRoleDto, UpdateRoleDto, Role } from '@/services/types';
import { RoleFilters, rolesService } from '@/src/services/roles.service';
import { CreateRoleDto, Role, UpdateRoleDto } from '@/src/services';

/**
 * Hook for fetching roles list
 */
export function useRoles(filters?: RoleFilters) {
  return useQuery({
    queryKey: queryKeys.roles.list(filters),
    queryFn: () => rolesService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single role
 */
export function useRole(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: async () => {
      const response = await rolesService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for creating a role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => rolesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
    },
  });
}

/**
 * Hook for updating a role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      rolesService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.roles.detail(id) });
      const previousRole = queryClient.getQueryData<Role>(queryKeys.roles.detail(id));
      if (previousRole) {
        queryClient.setQueryData<Role>(queryKeys.roles.detail(id), {
          ...previousRole,
          ...data,
        });
      }
      return { previousRole };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousRole) {
        queryClient.setQueryData(queryKeys.roles.detail(id), context.previousRole);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
    },
  });
}

/**
 * Hook for deleting a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
    },
  });
}
