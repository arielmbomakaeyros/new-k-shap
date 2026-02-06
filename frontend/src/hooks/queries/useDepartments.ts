import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { departmentsService, DepartmentFilters } from '@/services/departments.service';
import { queryKeys } from './keys';
import { DepartmentFilters, departmentsService } from '@/src/services/departments.service';
import { CreateDepartmentDto, Department, UpdateDepartmentDto } from '@/src/services';
import { handleMutationError } from '@/src/lib/mutationError';
// import type { CreateDepartmentDto, UpdateDepartmentDto, Department } from '@/services/types';

/**
 * Hook for fetching departments list
 */
export function useDepartments(filters?: DepartmentFilters) {
  return useQuery({
    queryKey: queryKeys.departments.list(filters),
    queryFn: () => departmentsService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single department
 */
export function useDepartment(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.departments.detail(id),
    queryFn: async () => {
      const response = await departmentsService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for creating a department
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentDto) => departmentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to create department'),
  });
}

/**
 * Hook for updating a department
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentDto }) =>
      departmentsService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.departments.detail(id) });
      const previousDepartment = queryClient.getQueryData<Department>(
        queryKeys.departments.detail(id)
      );
      if (previousDepartment) {
        queryClient.setQueryData<Department>(queryKeys.departments.detail(id), {
          ...previousDepartment,
          ...data,
        });
      }
      return { previousDepartment };
    },
    onError: (_err, { id }, context) => {
      handleMutationError(_err, 'Failed to update department');
      if (context?.previousDepartment) {
        queryClient.setQueryData(
          queryKeys.departments.detail(id),
          context.previousDepartment
        );
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.lists() });
    },
  });
}

/**
 * Hook for deleting a department
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to delete department'),
  });
}
