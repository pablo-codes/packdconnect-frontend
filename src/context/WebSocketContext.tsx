import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface WebSocketContextType {
  connectionStatus: ConnectionStatus;
  sendWsMessage: (payload: any) => void;
  registerWsHandler: (type: string, handler: (data: any) => void) => void;
  unregisterWsHandler: (type: string, handler?: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  // Multi-listener bus: eventType -> Set of handler functions
  const handlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectCountRef = useRef<number>(0);
  const [reconnectTrigger, setReconnectTrigger] = useState<number>(0);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;
    let ws: WebSocket | null = null;

    if (!isAuthenticated) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnectionStatus('disconnected');
      return;
    }

    const establishConnection = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        await fetch(`${apiBase}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch (err) {
        console.warn('[WebSocketContext] Pre-WS connect token refresh check failed:', err);
      }

      if (isCancelled) return;

      let socketUrl = import.meta.env.VITE_WS_URL;
      if (!socketUrl) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        socketUrl = `${protocol}//${window.location.host}/ws`;
      } else {
        if (socketUrl.startsWith('http://')) {
          socketUrl = socketUrl.replace('http://', 'ws://');
        } else if (socketUrl.startsWith('https://')) {
          socketUrl = socketUrl.replace('https://', 'wss://');
        }
        if (!socketUrl.endsWith('/ws')) {
          socketUrl = socketUrl.replace(/\/+$/, '') + '/ws';
        }
      }

      console.log('[WebSocketContext] Connecting to', socketUrl);
      setConnectionStatus('connecting');

      ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocketContext] WebSocket connected.');
        setConnectionStatus('connected');
        reconnectCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const listeners = handlersRef.current.get(data.type);
          if (listeners && listeners.size > 0) {
            listeners.forEach((handler) => {
              try {
                handler(data);
              } catch (handlerErr) {
                console.error(`[WebSocketContext] Error in handler for event [${data.type}]:`, handlerErr);
              }
            });
          }
        } catch (err) {
          console.error('[WebSocketContext] Error parsing incoming WS message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocketContext] WebSocket disconnected.', event.reason);
        setConnectionStatus('disconnected');

        if (isAuthenticated) {
          const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000);
          console.log(`[WebSocketContext] Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current + 1})`);
          reconnectTimeout = setTimeout(() => {
            if (wsRef.current === ws) {
              reconnectCountRef.current += 1;
              setReconnectTrigger((prev) => prev + 1);
            }
          }, delay);
        }
      };

      ws.onerror = (err) => {
        console.error('[WebSocketContext] WebSocket error:', err);
      };
    };

    establishConnection();

    return () => {
      isCancelled = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [isAuthenticated, reconnectTrigger]);

  const sendWsMessage = useCallback((payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn('[WebSocketContext] Cannot send WS message: Socket not open.', payload);
    }
  }, []);

  const registerWsHandler = useCallback((type: string, handler: (data: any) => void) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);
  }, []);

  const unregisterWsHandler = useCallback((type: string, handler?: (data: any) => void) => {
    if (!handler) {
      // Clear all handlers for this event type
      handlersRef.current.delete(type);
    } else {
      handlersRef.current.get(type)?.delete(handler);
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        connectionStatus,
        sendWsMessage,
        registerWsHandler,
        unregisterWsHandler,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
