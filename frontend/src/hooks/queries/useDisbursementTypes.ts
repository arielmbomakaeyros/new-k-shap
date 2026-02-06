import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { disbursementTypesService, DisbursementTypeFilters } from '@/src/services/disbursement-types.service';
import { DisbursementType, CreateDisbursementTypeDto, UpdateDisbursementTypeDto } from '@/src/services';
import { handleMutationError } from '@/src/lib/mutationError';

export function useDisbursementTypes(filters?: DisbursementTypeFilters) {
  return useQuery({
    queryKey: queryKeys.disbursementTypes.list(filters),
    queryFn: () => disbursementTypesService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useDisbursementType(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.disbursementTypes.detail(id),
    queryFn: async () => {
      const response = await disbursementTypesService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateDisbursementType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisbursementTypeDto) => disbursementTypesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursementTypes.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to create disbursement type'),
  });
}

export function useUpdateDisbursementType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDisbursementTypeDto }) =>
      disbursementTypesService.update(id, data),
    onError: (error) => handleMutationError(error, 'Failed to update disbursement type'),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursementTypes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursementTypes.lists() });
    },
  });
}

export function useDeleteDisbursementType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => disbursementTypesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursementTypes.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to delete disbursement type'),
  });
}
