import { api } from '../lib/axios';
import type { ApiResponse, ChatMessage } from './types';

export interface ChatFilters {
  participantId?: string;
  isGroup?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
}

class ChatService {
  private basePath = '/chat';

  async list(): Promise<ApiResponse<ChatMessage[]>> {
    return api.get<ApiResponse<ChatMessage[]>>(this.basePath);
  }

  async participants(): Promise<ApiResponse<any[]>> {
    return api.get<ApiResponse<any[]>>(`${this.basePath}/participants`);
  }

  async send(message: Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt'>) {
    return api.post<ApiResponse<ChatMessage>>(this.basePath, message);
  }
}

export const chatService = new ChatService();
