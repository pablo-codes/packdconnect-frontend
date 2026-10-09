import { apiClient } from './apiClient';

export const chatApi = {
  getConversations: (limit: number = 20, offset: number = 0) => 
    apiClient<any[]>('/api/chat/conversations', {
      params: { limit, offset },
    }),

  getMessages: (roomId: string, limit: number = 30, before?: string) => 
    apiClient<any[]>(`/api/chat/conversations/${roomId}/messages`, {
      params: { limit, before },
    }),

  createRoom: (participantIds: string[], isGroup: boolean, name?: string) => 
    apiClient<any>('/api/chat/rooms', {
      method: 'POST',
      body: JSON.stringify({ participantIds, isGroup, name }),
    }),
};
