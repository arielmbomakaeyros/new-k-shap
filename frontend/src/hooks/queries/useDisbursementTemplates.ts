import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { disbursementTemplatesService } from '@/src/services/disbursement-templates.service';
import { CreateDisbursementTemplateDto, DisbursementTemplate, UpdateDisbursementTemplateDto } from '@/src/services';

export function useDisbursementTemplates() {
  return useQuery({
    queryKey: queryKeys.disbursementTemplates.list(),
    queryFn: () => disbursementTemplatesService.findAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useDisbursementTemplate(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.disbursementTemplates.detail(id),
    queryFn: async () => {
      const response = await disbursementTemplatesService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateDisbursementTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisbursementTemplateDto) => disbursementTemplatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursementTemplates.lists() });
    },
  });
}

export function useUpdateDisbursementTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDisbursementTemplateDto }) =>
      disbursementTemplatesService.update(id, data),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursementTemplates.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursementTemplates.lists() });
    },
  });
}

export function useDeleteDisbursementTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => disbursementTemplatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursementTemplates.lists() });
    },
  });
}
