import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useWebSocket() {
  const { isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  
  // To allow multiple handlers for the same event type, we use an array of handlers,
  // or just stick to single handlers if we prefer, but since we are extracting,
  // a Set or array per event type might be safer. For now, we'll keep it as a record 
  // of type -> handler, but if ChatContext and WebRTC both listen to same events, it might conflict.
  // Actually, WebRTC listens to 'call_*' and Chat listens to 'message', 'typing', etc. 
  const wsHandlersRef = useRef<Record<string, (data: any) => void>>({});
  
  const reconnectCountRef = useRef(0);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;
    let ws: WebSocket | null = null;

    if (!isAuthenticated) {
      if (wsRef.current) {
        wsRef.current.close();
      }
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
        console.warn('[useWebSocket] Pre-WS connect token refresh check failed:', err);
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
      console.log('[useWebSocket] Establishing WebSocket connection to', socketUrl);
      setConnectionStatus('connecting');

      ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[useWebSocket] WebSocket connected.');
        setConnectionStatus('connected');
        reconnectCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // console.log('[useWebSocket] WS Event received:', data.type);

          if (wsHandlersRef.current[data.type]) {
            wsHandlersRef.current[data.type](data);
          } else {
             // console.warn(`[useWebSocket] No handler registered for WS event type: ${data.type}`);
          }
        } catch (err) {
          console.error('[useWebSocket] Error handling WS message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[useWebSocket] WebSocket disconnected.', event.reason);
        setConnectionStatus('disconnected');
        
        if (isAuthenticated) {
          const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000);
          console.log(`[useWebSocket] Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current + 1})`);
          reconnectTimeout = setTimeout(() => {
            if (wsRef.current === ws) {
              reconnectCountRef.current += 1;
              setReconnectTrigger((prev) => prev + 1);
            }
          }, delay);
        }
      };

      ws.onerror = (err) => {
        console.error('[useWebSocket] WebSocket error:', err);
      };
    };

    establishConnection();

    return () => {
      isCancelled = true;
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isAuthenticated, reconnectTrigger]);

  const sendWsMessage = useCallback((payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn('[useWebSocket] Cannot send WS message: Socket not open.');
    }
  }, []);

  const registerWsHandler = useCallback((type: string, handler: (data: any) => void) => {
    wsHandlersRef.current[type] = handler;
  }, []);

  const unregisterWsHandler = useCallback((type: string) => {
    delete wsHandlersRef.current[type];
  }, []);

  return {
    connectionStatus,
    sendWsMessage,
    registerWsHandler,
    unregisterWsHandler,
    wsRef
  };
}
