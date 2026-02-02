import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { disbursementsService, ApproveDto, RejectDto } from '@/services/disbursements.service';
import { queryKeys } from './keys';
import { CreateDisbursementDto, Disbursement, DisbursementFilters, disbursementsService, UpdateDisbursementDto } from '@/src/services';
import { ApproveDto, RejectDto } from '@/src/services/disbursements.service';
// import type {
//   CreateDisbursementDto,
//   UpdateDisbursementDto,
//   Disbursement,
//   DisbursementFilters,
// } from '@/services/types';

/**
 * Hook for fetching disbursements list with pagination and filters
 */
export function useDisbursements(filters?: DisbursementFilters) {
  return useQuery({
    queryKey: queryKeys.disbursements.list(filters),
    queryFn: () => disbursementsService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single disbursement
 */
export function useDisbursement(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.disbursements.detail(id),
    queryFn: async () => {
      const response = await disbursementsService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching pending disbursements
 */
export function usePendingDisbursements(filters?: DisbursementFilters) {
  return useQuery({
    queryKey: queryKeys.disbursements.pending(),
    queryFn: () => disbursementsService.getPendingApprovals(filters),
    staleTime: 2 * 60 * 1000, // More frequent updates for pending items
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for creating a disbursement
 */
export function useCreateDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisbursementDto) => disbursementsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.dashboard() });
    },
  });
}

/**
 * Hook for updating a disbursement
 */
export function useUpdateDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDisbursementDto }) =>
      disbursementsService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.disbursements.detail(id),
      });

      const previousDisbursement = queryClient.getQueryData<Disbursement>(
        queryKeys.disbursements.detail(id)
      );

      if (previousDisbursement) {
        queryClient.setQueryData<Disbursement>(queryKeys.disbursements.detail(id), {
          ...previousDisbursement,
          ...data,
        });
      }

      return { previousDisbursement };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousDisbursement) {
        queryClient.setQueryData(
          queryKeys.disbursements.detail(id),
          context.previousDisbursement
        );
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.disbursements.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.lists() });
    },
  });
}

/**
 * Hook for deleting a disbursement
 */
export function useDeleteDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => disbursementsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.dashboard() });
    },
  });
}

/**
 * Hook for approving a disbursement
 */
export function useApproveDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveDto }) =>
      disbursementsService.approve(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.disbursements.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.dashboard() });
    },
  });
}

/**
 * Hook for rejecting a disbursement
 */
export function useRejectDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectDto }) =>
      disbursementsService.reject(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.disbursements.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Hook for cancelling a disbursement
 */
export function useCancelDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      disbursementsService.cancel(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.disbursements.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.pending() });
    },
  });
}

/**
 * Hook for force completing a disbursement (admin only)
 */
export function useForceCompleteDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      disbursementsService.forceComplete(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.disbursements.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.dashboard() });
    },
  });
}
