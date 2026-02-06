import { useQuery } from '@tanstack/react-query';
// import { reportsService, ReportFilters } from '@/services/reports.service';
import { queryKeys } from './keys';
import { ReportFilters, reportsService } from '@/src/services/reports.service';
import { useAuthStore } from '@/src/store/authStore';

/**
 * Hook for fetching dashboard report
 */
export function useDashboardReport(filters?: ReportFilters) {
  const { token, isLoading } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.reports.dashboard(filters),
    queryFn: async () => {
      const response = await reportsService.getDashboard(filters);
      if (!response?.data) {
        throw new Error('Failed to load dashboard report');
      }
      return response.data;
    },
    enabled: !!token && !isLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching disbursements summary report
 */
export function useDisbursementsSummary(filters?: ReportFilters) {
  const { token, isLoading } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.reports.disbursementsSummary(filters),
    queryFn: async () => {
      const response = await reportsService.getDisbursementsSummary(filters);
      if (!response?.data) {
        throw new Error('Failed to load disbursements summary');
      }
      return response.data;
    },
    enabled: !!token && !isLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching collections summary report
 */
export function useCollectionsSummary(filters?: ReportFilters) {
  const { token, isLoading } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.reports.collectionsSummary(filters),
    queryFn: async () => {
      const response = await reportsService.getCollectionsSummary(filters);
      if (!response?.data) {
        throw new Error('Failed to load collections summary');
      }
      return response.data;
    },
    enabled: !!token && !isLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
