// src/api/apiClient.ts

export interface ApiClientOptions extends RequestInit {
  // Custom options can go here
  _retry?: boolean;
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * A central base client for all API calls.
 * Automatically includes credentials (cookies) for authentication.
 */
export async function apiClient<T = any>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
  const mergedOptions: RequestInit = {
    ...options,
    headers: new Headers(options.headers || {}),
    credentials: 'include', // Ensures cookies are sent with every request
  };

  // Default content type to JSON if body is provided and not FormData
  if (mergedOptions.body && !(mergedOptions.body instanceof FormData)) {
    if (!mergedOptions.headers) {
        mergedOptions.headers = new Headers();
    }
    const headers = mergedOptions.headers as Headers;
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  let response = await fetch(fullUrl, mergedOptions);

  // Transparent Token Refresh Logic
  if (response.status === 401 && !url.includes('/api/auth/') && !options._retry) {
    try {
      // Attempt to refresh token
      const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Retry original request
        options._retry = true;
        response = await fetch(fullUrl, mergedOptions);
      } else {
        // Refresh failed, user is actually unauthorized
        throw new Error('Unauthorized');
      }
    } catch {
      // Dispatch a custom event on 401 Unauthorized so AuthContext can log user out
      const event = new CustomEvent('api:unauthorized');
      window.dispatchEvent(event);
      throw new Error('Unauthorized');
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }

    if (response.status === 401 && !url.includes('/api/auth/')) {
        const event = new CustomEvent('api:unauthorized');
        window.dispatchEvent(event);
    }

    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
