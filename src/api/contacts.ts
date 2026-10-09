import { apiClient } from './apiClient';

export interface GetContactsParams {
  page?: number;
  limit?: number;
  search?: string;
  paginate?: boolean;
}

export interface ContactItem {
  id: string;
  username: string;
  name?: string;
  email: string;
  added_at?: string;
  presence?: 'online' | 'offline';
}

export interface ContactsResponse {
  contacts: ContactItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AddContactResponse {
  message: string;
  contact: {
    id: string;
    name: string;
    email: string;
  };
}

export const contactsApi = {
  getContacts: (params?: GetContactsParams | boolean): Promise<ContactsResponse> => {
    const queryParams: Record<string, any> =
      typeof params === 'boolean'
        ? { paginate: params }
        : params || {};
    return apiClient<ContactsResponse>('/api/contacts', {
      params: queryParams,
    });
  },

  addContact: (emailOrPayload: string | { email: string }): Promise<AddContactResponse> => {
    const email = typeof emailOrPayload === 'string' ? emailOrPayload : emailOrPayload.email;
    return apiClient<AddContactResponse>('/api/contacts', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

