import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformSettingsService } from '@/src/services/platform-settings.service';
import { PlatformSettings } from '@/src/services';

export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const response = await platformSettingsService.get();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PlatformSettings>) => platformSettingsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });
}
