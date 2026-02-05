import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { beneficiariesService, BeneficiaryFilters } from '@/src/services/beneficiaries.service';
import { Beneficiary, CreateBeneficiaryDto, UpdateBeneficiaryDto } from '@/src/services';

export function useBeneficiaries(filters?: BeneficiaryFilters) {
  return useQuery({
    queryKey: queryKeys.beneficiaries.list(filters),
    queryFn: () => beneficiariesService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBeneficiary(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.beneficiaries.detail(id),
    queryFn: async () => {
      const response = await beneficiariesService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBeneficiaryDto) => beneficiariesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.lists() });
    },
  });
}

export function useUpdateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBeneficiaryDto }) =>
      beneficiariesService.update(id, data),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.lists() });
    },
  });
}

export function useDeleteBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => beneficiariesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.lists() });
    },
  });
}
