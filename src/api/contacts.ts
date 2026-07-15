import { apiClient } from './apiClient';

export const contactsApi = {
  getContacts: (paginate: boolean = true) => 
    apiClient<any>(`/api/contacts?paginate=${paginate}`),

  addContact: (identifier: string) => 
    apiClient<any>('/api/contacts', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),
};
