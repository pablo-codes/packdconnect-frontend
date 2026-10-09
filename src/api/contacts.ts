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
    let query = '';
    if (typeof params === 'boolean') {
      query = `?paginate=${params}`;
    } else if (params) {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.search && params.search.trim()) searchParams.set('search', params.search.trim());
      if (params.paginate !== undefined) searchParams.set('paginate', String(params.paginate));
      const str = searchParams.toString();
      if (str) query = `?${str}`;
    }
    return apiClient<ContactsResponse>(`/api/contacts${query}`);
  },

  addContact: (emailOrPayload: string | { email: string }): Promise<AddContactResponse> => {
    const email = typeof emailOrPayload === 'string' ? emailOrPayload : emailOrPayload.email;
    return apiClient<AddContactResponse>('/api/contacts', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

