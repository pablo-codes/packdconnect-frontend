import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null; // Kept as null for TS compatibility
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef<Promise<User | null> | null>(null);

  // Silent refresh implementation
  const performSilentRefresh = async (): Promise<User | null> => {
    if (isRefreshingRef.current) {
      return isRefreshingRef.current;
    }

    const refreshPromise = (async () => {
      try {
        const data = await authApi.refresh();
        setUser(data.user);
        return data.user;
      } catch (err) {
        console.error('[AuthContext] Silent refresh failed:', err);
        setUser(null);
        return null;
      } finally {
        isRefreshingRef.current = null;
      }
    })();

    isRefreshingRef.current = refreshPromise;
    return refreshPromise;
  };

  // Mount session verification
  useEffect(() => {
    const initializeAuth = async () => {
      await performSilentRefresh();
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // Interval for background refresh (runs every 14 minutes)
  useEffect(() => {
    if (user) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      refreshIntervalRef.current = setInterval(async () => {
        console.log('[AuthContext] Running background silent refresh...');
        await performSilentRefresh();
      }, 14 * 60 * 1000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user]);

  // Listen for global unauthorized events from apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('[AuthContext] Caught api:unauthorized event, logging out.');
      setUser(null);
      queryClient.clear();
    };

    window.addEventListener('api:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('api:unauthorized', handleUnauthorized);
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await authApi.register(username, email, password);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('[AuthContext] Logout call failed to complete on server', e);
    }
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
