import { apiClient } from './apiClient';

export const historyApi = {
  getActivityHistory: (limit: number = 20, offset: number = 0) => 
    apiClient<any[]>('/api/history', {
      params: { limit, offset },
    }),
};
