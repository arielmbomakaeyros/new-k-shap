import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/src/services';
import { queryKeys } from './keys';
import type { CompanyInfo, WorkflowSettings, EmailNotificationSettings } from '@/src/services/types';

/**
 * Hook to fetch company settings
 */
export function useCompanySettings() {
  return useQuery({
    queryKey: queryKeys.settings.company(),
    queryFn: () => settingsService.getCompanySettings(),
  });
}

/**
 * Hook to update company information
 */
export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CompanyInfo>) => settingsService.updateCompanyInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.company() });
    },
  });
}

/**
 * Hook to update workflow settings
 */
export function useUpdateWorkflowSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WorkflowSettings>) => settingsService.updateWorkflowSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.company() });
    },
  });
}

/**
 * Hook to update email notification settings
 */
export function useUpdateEmailNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EmailNotificationSettings>) =>
      settingsService.updateEmailNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.company() });
    },
  });
}
