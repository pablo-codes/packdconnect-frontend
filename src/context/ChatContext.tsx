import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketContext } from './WebSocketContext';
import { useChatQueries } from '../queries/useChatQueries';
import { contactsApi } from '../api/contacts';
import type { Conversation, Message, SystemUser } from '../types';

interface ChatContextType {
  conversations: Conversation[];
  fetchMoreConversations: () => void;
  hasMoreConversations: boolean;
  isFetchingConversations: boolean;
  activeRoomId: string | null;
  activeRoom: Conversation | null;
  setActiveRoomId: (id: string | null) => void;
  messages: Message[];
  fetchMoreMessages: () => void;
  hasMoreMessages: boolean;
  isFetchingMessages: boolean;
  users: SystemUser[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  typingStatus: Record<string, boolean>; // userId -> isTyping (in active room)
  sendMessage: (content: string) => Promise<string | null>;
  sendTyping: (isTyping: boolean) => void;
  markRead: (roomId?: string | null) => void;
  createRoom: (participantIds: string[], isGroup: boolean, name?: string) => Promise<string>;
  sendWsMessage: (payload: any) => void;
  registerWsHandler: (type: string, handler: (data: any) => void) => void;
  unregisterWsHandler: (type: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  const { connectionStatus, sendWsMessage, registerWsHandler, unregisterWsHandler } = useWebSocketContext();

  const activeRoomIdRef = useRef<string | null>(null);
  const isTransitioningFromDraftRef = useRef<boolean>(false);

  // Keep ref up to date for WebSocket event handlers
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  // --- TANSTACK INFINITE QUERIES ---

  const {
    conversationsQuery: {
      data: conversationsData,
      fetchNextPage: fetchMoreConversations,
      hasNextPage: hasMoreConversations,
      isFetching: isFetchingConversations
    },
    messagesQuery: {
      data: messagesData,
      fetchNextPage: fetchMoreMessages,
      hasNextPage: hasMoreMessages,
      isFetching: isFetchingMessages
    },
    createRoomMutation
  } = useChatQueries(isAuthenticated, activeRoomId);

  const conversations = useMemo(() => {
    return conversationsData?.pages.flat() || [];
  }, [conversationsData]);

  const messages = useMemo(() => {
    if (!messagesData) return [];
    // pages[0] is the newest chunk, pages[1] is older, etc.
    // Each chunk is in chronological order. We reverse the chunks so the oldest chunk comes first.
    return [...messagesData.pages].reverse().flat() as Message[];
  }, [messagesData]);

  const activeRoom = React.useMemo(() => {
    if (!activeRoomId) return null;
    if (activeRoomId.startsWith('draft-')) {
      const peerId = activeRoomId.replace('draft-', '');
      const peer = users.find(u => u.id === peerId);
      return {
        id: activeRoomId,
        name: peer ? peer.username : 'Chat',
        is_group: false,
        created_at: new Date().toISOString(),
        participants: peer ? [{ id: peer.id, username: peer.username, email: peer.email }] : [],
        latest_message: null
      } as Conversation;
    }
    return conversations.find((c: Conversation) => c.id === activeRoomId) || null;
  }, [activeRoomId, conversations, users]);

  const fetchUsers = async () => {
    try {
      const data = await contactsApi.getContacts(false);
      const mapped = data.contacts.map((c: any) => ({
        id: c.id,
        username: c.username || c.name || '',
        email: c.email || '',
        created_at: c.added_at || c.created_at || new Date().toISOString(),
        presence: c.presence || 'offline'
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('[ChatContext] Error fetching contacts as users:', err);
    }
  };

  // Load message history effects
  useEffect(() => {
    let markReadTimeoutId: ReturnType<typeof setTimeout> | null = null;
    if (isAuthenticated && activeRoomId) {
      if (activeRoomId.startsWith('draft-')) {
        setTypingStatus({});
      } else {
        if (isTransitioningFromDraftRef.current) {
          isTransitioningFromDraftRef.current = false;
        }
        setTypingStatus({}); // Clear typing indicators on chat change
        
        // Clear unread count for this room by mutating the query cache
        queryClient.setQueryData(['conversations'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any[]) =>
              page.map((conv: any) => (conv.id === activeRoomId ? { ...conv, unreadCount: 0 } : conv))
            )
          };
        });

        // Trigger mark read
        const currentRoomId = activeRoomId;
        markReadTimeoutId = setTimeout(() => {
          markRead(currentRoomId);
        }, 300);
      }
    }
    return () => {
      if (markReadTimeoutId) {
        clearTimeout(markReadTimeoutId);
      }
    };
  }, [activeRoomId, isAuthenticated]);

  // Load initial users
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    } else {
      setUsers([]);
      setActiveRoomId(null);

    }
  }, [isAuthenticated]);

  // WebSocket event registration
  useEffect(() => {
    if (!isAuthenticated) return;

    registerWsHandler('message', (data) => {
      const newMsg: Message = data.message;
      
      // If a message arrives from someone, they are actively online
      if (newMsg.sender_id !== currentUser?.id) {
        setUsers((prev) => {
          const index = prev.findIndex((u) => u.id === newMsg.sender_id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], presence: 'online' };
            return updated;
          }
          return prev;
        });
      }

      if (activeRoomIdRef.current === newMsg.room_id) {
        queryClient.setQueryData(['messages', newMsg.room_id], (oldData: any) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          const firstPage = [...newPages[0]];
          if (!firstPage.some((m: Message) => m.id === newMsg.id)) {
            firstPage.push(newMsg);
            newPages[0] = firstPage;
          }
          return { ...oldData, pages: newPages };
        });

        if (newMsg.sender_id !== currentUser?.id) {
          sendWsMessage({ type: 'mark_read', roomId: newMsg.room_id });
        }
      }

      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return oldData;
        let found = false;
        const updatedPages = oldData.pages.map((page: any[]) => {
          return page.map((conv: Conversation) => {
            if (conv.id === newMsg.room_id) {
              found = true;
              const isUnread = activeRoomIdRef.current !== newMsg.room_id && newMsg.sender_id !== currentUser?.id;
              // Also ensure sender participant presence is marked online
              const updatedParticipants = conv.participants?.map((p: any) =>
                p.id === newMsg.sender_id ? { ...p, presence: 'online' } : p
              ) || conv.participants;
              return {
                ...conv,
                latest_message: newMsg,
                unreadCount: (conv.unreadCount || 0) + (isUnread ? 1 : 0),
                participants: updatedParticipants,
              };
            }
            return conv;
          });
        });

        if (!found) {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          return oldData;
        }
        
        const flattened = updatedPages.flat();
        flattened.sort((a: any, b: any) => {
          const dateA = a.latest_message ? new Date(a.latest_message.created_at).getTime() : new Date(a.created_at).getTime();
          const dateB = b.latest_message ? new Date(b.latest_message.created_at).getTime() : new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        const reconstructedPages = [];
        for (let i = 0; i < flattened.length; i += 20) {
          reconstructedPages.push(flattened.slice(i, i + 20));
        }

        return { ...oldData, pages: reconstructedPages };
      });
    });

    registerWsHandler('typing', (data) => {
      if (activeRoomIdRef.current === data.roomId) {
        setTypingStatus((prev) => ({
          ...prev,
          [data.userId]: data.isTyping,
        }));
      }

      if (data.isTyping && data.userId !== currentUser?.id) {
        setUsers((prev) => {
          const index = prev.findIndex((u) => u.id === data.userId);
          if (index !== -1 && prev[index].presence !== 'online') {
            const updated = [...prev];
            updated[index] = { ...updated[index], presence: 'online' };
            return updated;
          }
          return prev;
        });
      }
    });

    registerWsHandler('read_receipt', (data) => {
      if (activeRoomIdRef.current === data.roomId) {
        queryClient.setQueryData(['messages', data.roomId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any[]) =>
              page.map((msg: Message) =>
                data.messageIds.includes(msg.id)
                  ? { ...msg, read_at: new Date().toISOString() }
                  : msg
              )
            )
          };
        });
      }

      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((conv: Conversation) => {
              if (
                conv.id === data.roomId &&
                conv.latest_message &&
                data.messageIds.includes(conv.latest_message.id)
              ) {
                return {
                  ...conv,
                  latest_message: {
                    ...conv.latest_message,
                    read_at: new Date().toISOString(),
                  },
                };
              }
              return conv;
            })
          )
        };
      });
    });

    registerWsHandler('presence_change', (data) => {
      // 1. Update users state (contacts and discovered users)
      setUsers((prev) => {
        const index = prev.findIndex((u) => u.id === data.userId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], presence: data.status };
          return updated;
        }
        return [
          ...prev,
          {
            id: data.userId,
            username: '',
            email: '',
            created_at: new Date().toISOString(),
            presence: data.status,
          },
        ];
      });

      // 2. Update participant presence in conversations query cache
      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((conv: any) => {
              if (conv.participants) {
                return {
                  ...conv,
                  participants: conv.participants.map((p: any) =>
                    p.id === data.userId ? { ...p, presence: data.status } : p
                  ),
                };
              }
              return conv;
            })
          ),
        };
      });

      // 3. Update contacts query cache if active
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    });

    return () => {
      unregisterWsHandler('message');
      unregisterWsHandler('typing');
      unregisterWsHandler('read_receipt');
      unregisterWsHandler('presence_change');
    };

  }, [isAuthenticated, registerWsHandler, unregisterWsHandler, currentUser, sendWsMessage, queryClient]);

  // Client triggers
  const sendMessage = async (content: string): Promise<string | null> => {
    if (!activeRoomId) return null;

    if (activeRoomId.startsWith('draft-')) {
      const peerId = activeRoomId.replace('draft-', '');
      try {
        isTransitioningFromDraftRef.current = true;
        const newRoomId = await createRoom([peerId], false);

        sendWsMessage({
          type: 'send_message',
          roomId: newRoomId,
          content,
        });

        setActiveRoomId(newRoomId);
        return newRoomId;
      } catch (err) {
        isTransitioningFromDraftRef.current = false;
        console.error('[ChatContext] Failed to send draft message:', err);
        return null;
      }
    } else {
      sendWsMessage({
        type: 'send_message',
        roomId: activeRoomId,
        content,
      });
      return null;
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (activeRoomId && activeRoomId.startsWith('draft-')) return; 
    if (connectionStatus !== 'connected' || !activeRoomId) return;
    sendWsMessage({
      type: 'typing',
      roomId: activeRoomId,
      isTyping,
    });
  };

  const markRead = (roomId?: string | null) => {
    const id = roomId !== undefined ? roomId : activeRoomId;
    if (id && id.startsWith('draft-')) return; 
    if (connectionStatus !== 'connected' || !id) return;
    sendWsMessage({
      type: 'mark_read',
      roomId: id,
    });
  };

  const createRoom = async (participantIds: string[], isGroup: boolean, name?: string): Promise<string> => {
    const data = await createRoomMutation.mutateAsync({ participantIds, isGroup, name });
    const newRoom = data.room;

    return newRoom.id;
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        fetchMoreConversations,
        hasMoreConversations,
        isFetchingConversations,
        activeRoomId,
        activeRoom,
        setActiveRoomId,
        messages,
        fetchMoreMessages,
        hasMoreMessages,
        isFetchingMessages,
        users,
        connectionStatus,
        typingStatus,
        sendMessage,
        sendTyping,
        markRead,
        createRoom,
        sendWsMessage,
        registerWsHandler,
        unregisterWsHandler,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
