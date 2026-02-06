import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/src/services';
import { queryKeys } from './keys';
import type { CompanyInfo, WorkflowSettings, EmailNotificationSettings } from '@/src/services/types';
import { handleMutationError } from '@/src/lib/mutationError';

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
    onError: (error) => handleMutationError(error, 'Failed to update company info'),
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
    onError: (error) => handleMutationError(error, 'Failed to update workflow settings'),
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
    onError: (error) => handleMutationError(error, 'Failed to update email settings'),
  });
}

/**
 * Hook to update company preferences (currency, payment methods, branding, channels)
 */
export function useUpdateCompanyPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => settingsService.updateCompanyPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.company() });
    },
    onError: (error) => handleMutationError(error, 'Failed to update preferences'),
  });
}

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: queryKeys.settings.key('workflow-templates'),
    queryFn: async () => {
      const response = await settingsService.getWorkflowTemplates();
      return response.data || response;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useActivateWorkflowTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.activateWorkflowTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.key('workflow-templates') });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.company() });
    },
    onError: (error) => handleMutationError(error, 'Failed to activate workflow template'),
  });
}

export function useCreateWorkflowTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; steps: any[] }) =>
      settingsService.createWorkflowTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.key('workflow-templates') });
    },
    onError: (error) => handleMutationError(error, 'Failed to create workflow template'),
  });
}

export function useDeleteWorkflowTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteWorkflowTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.key('workflow-templates') });
    },
    onError: (error) => handleMutationError(error, 'Failed to delete workflow template'),
  });
}
