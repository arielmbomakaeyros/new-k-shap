import { useQuery } from '@tanstack/react-query';
// import { reportsService, ReportFilters } from '@/services/reports.service';
import { queryKeys } from './keys';
import { ReportFilters, reportsService } from '@/src/services/reports.service';

/**
 * Hook for fetching dashboard report
 */
export function useDashboardReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.reports.dashboard(filters),
    queryFn: async () => {
      const response = await reportsService.getDashboard(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching disbursements summary report
 */
export function useDisbursementsSummary(filters?: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.reports.disbursementsSummary(filters),
    queryFn: async () => {
      const response = await reportsService.getDisbursementsSummary(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching collections summary report
 */
export function useCollectionsSummary(filters?: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.reports.collectionsSummary(filters),
    queryFn: async () => {
      const response = await reportsService.getCollectionsSummary(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
