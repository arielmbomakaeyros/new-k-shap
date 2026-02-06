import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { paymentMethodsService, PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '@/src/services';
import { handleMutationError } from '@/src/lib/mutationError';

export function usePaymentMethods(filters?: { companyId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: queryKeys.paymentMethods.list(filters),
    queryFn: () => paymentMethodsService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentMethodDto) => paymentMethodsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to create payment method'),
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentMethodDto }) =>
      paymentMethodsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to update payment method'),
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentMethodsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to delete payment method'),
  });
}
