import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/src/services';
import { queryKeys } from './keys';

export function useChatMessages() {
  return useQuery({
    queryKey: queryKeys.chat.all(),
    queryFn: async () => {
      const response = await chatService.list();
      return response.data || [];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useChatParticipants() {
  return useQuery({
    queryKey: queryKeys.chat.participants(),
    queryFn: async () => {
      const response = await chatService.participants();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
