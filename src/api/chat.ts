import { apiClient } from './apiClient';

export const chatApi = {
  getConversations: (limit: number = 20, offset: number = 0) => 
    apiClient<any[]>(`/api/chat/conversations?limit=${limit}&offset=${offset}`),

  getMessages: (roomId: string, limit: number = 30, before?: string) => {
    let url = `/api/chat/conversations/${roomId}/messages?limit=${limit}`;
    if (before) url += `&before=${encodeURIComponent(before)}`;
    return apiClient<any[]>(url);
  },

  createRoom: (participantIds: string[], isGroup: boolean, name?: string) => 
    apiClient<any>('/api/chat/rooms', {
      method: 'POST',
      body: JSON.stringify({ participantIds, isGroup, name }),
    }),
};
