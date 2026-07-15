import { apiClient } from './apiClient';

export interface LoginResponse {
  user: any;
  message?: string;
}

export const authApi = {
  login: (email: string, password: string) => 
    apiClient<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (username: string, email: string, password: string) => 
    apiClient<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  logout: () => 
    apiClient('/api/auth/logout', { method: 'POST' }),

  refresh: () => 
    apiClient<LoginResponse>('/api/auth/refresh', { method: 'POST' }),
};
