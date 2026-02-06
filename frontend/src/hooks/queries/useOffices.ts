import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { officesService, OfficeFilters } from '@/services/offices.service';
import { queryKeys } from './keys';
// import type { CreateOfficeDto, UpdateOfficeDto, Office } from '@/services/types';
import { OfficeFilters, officesService } from '@/src/services/offices.service';
import { CreateOfficeDto, Office, UpdateOfficeDto } from '@/src/services';
import { handleMutationError } from '@/src/lib/mutationError';

/**
 * Hook for fetching offices list
 */
export function useOffices(filters?: OfficeFilters) {
  return useQuery({
    queryKey: queryKeys.offices.list(filters),
    queryFn: () => officesService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single office
 */
export function useOffice(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.offices.detail(id),
    queryFn: async () => {
      const response = await officesService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for creating an office
 */
export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfficeDto) => officesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offices.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to create office'),
  });
}

/**
 * Hook for updating an office
 */
export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfficeDto }) =>
      officesService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.offices.detail(id) });
      const previousOffice = queryClient.getQueryData<Office>(
        queryKeys.offices.detail(id)
      );
      if (previousOffice) {
        queryClient.setQueryData<Office>(queryKeys.offices.detail(id), {
          ...previousOffice,
          ...data,
        });
      }
      return { previousOffice };
    },
    onError: (_err, { id }, context) => {
      handleMutationError(_err, 'Failed to update office');
      if (context?.previousOffice) {
        queryClient.setQueryData(queryKeys.offices.detail(id), context.previousOffice);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offices.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.offices.lists() });
    },
  });
}

/**
 * Hook for deleting an office
 */
export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => officesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offices.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to delete office'),
  });
}
