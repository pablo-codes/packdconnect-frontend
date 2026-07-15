import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chat";
import type { Conversation } from "../types";

export function useChatQueries(isAuthenticated: boolean, activeRoomId: string | null) {
  const queryClient = useQueryClient();

  const conversationsQuery = useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: async ({ pageParam = 0 }) => {
      const data = await chatApi.getConversations(20, pageParam as number);
      return data.map((conv: Conversation) => ({
        ...conv,
        unreadCount: conv.unreadCount || 0,
      }));
    },
    getNextPageParam: (lastPage: any[], allPages: any[][]) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    enabled: isAuthenticated,
    initialPageParam: 0,
  });

  const messagesQuery = useInfiniteQuery({
    queryKey: ['messages', activeRoomId],
    queryFn: async ({ pageParam }) => {
      return await chatApi.getMessages(activeRoomId as string, 30, pageParam as string | undefined);
    },
    getNextPageParam: (lastPage: any[]) => {
      if (lastPage.length < 30) return undefined;
      return new Date(lastPage[0].created_at).toISOString();
    },
    enabled: isAuthenticated && !!activeRoomId && !activeRoomId.startsWith('draft-'),
    initialPageParam: null as string | null,
  });

  const createRoomMutation = useMutation({
    mutationFn: ({ participantIds, isGroup, name }: { participantIds: string[], isGroup: boolean, name?: string }) => 
      chatApi.createRoom(participantIds, isGroup, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    conversationsQuery,
    messagesQuery,
    createRoomMutation,
  };
}
