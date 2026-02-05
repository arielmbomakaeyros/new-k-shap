import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kaeyrosService } from '@/src/services/kaeyros.service';

export function useKaeyrosStats() {
  return useQuery({
    queryKey: ['kaeyros', 'stats'],
    queryFn: async () => {
      const response = await kaeyrosService.getStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useKaeyrosCompanies(filters?: { page?: number; limit?: number; search?: string; status?: string; plan?: string; isActive?: boolean; }) {
  return useQuery({
    queryKey: ['kaeyros', 'companies', filters],
    queryFn: () => kaeyrosService.getCompanies(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useKaeyrosAuditLogs(filters?: { page?: number; limit?: number; company?: string; action?: string; startDate?: string; endDate?: string; }) {
  return useQuery({
    queryKey: ['kaeyros', 'audit-logs', filters],
    queryFn: () => kaeyrosService.getAuditLogs(filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateKaeyrosCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof kaeyrosService.createCompany>[0]) =>
      kaeyrosService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaeyros', 'companies'] });
    },
  });
}

export function useUpdateKaeyrosCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      kaeyrosService.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaeyros', 'companies'] });
    },
  });
}

export function useUpdateKaeyrosCompanyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      kaeyrosService.updateCompanyStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaeyros', 'companies'] });
    },
  });
}

export function useResendKaeyrosCompanyActivation() {
  return useMutation({
    mutationFn: (id: string) => kaeyrosService.resendCompanyActivation(id),
  });
}

export function useDeleteKaeyrosCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kaeyrosService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaeyros', 'companies'] });
    },
  });
}
