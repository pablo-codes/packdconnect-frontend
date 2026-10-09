import React, { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useChat } from "../../../context/ChatContext";
import type { Conversation } from "../../../types";
import {
  Search,
  Users,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";

interface InboxListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const InboxList: React.FC<InboxListProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    conversations,
    fetchMoreConversations,
    hasMoreConversations,
    isFetchingConversations,
    activeRoomId,
    setActiveRoomId,
    typingStatus,
    users,
  } = useChat();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastConversationRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingConversations) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreConversations) {
          fetchMoreConversations();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingConversations, hasMoreConversations, fetchMoreConversations],
  );

  // Helper to format room display name
  const getRoomName = (conv: Conversation) => {
    if (conv.name) return conv.name;
    if (conv.is_group) return "Group Chat";
    // Direct message: show participant name
    const peer = conv.participants.find((p) => p.id !== currentUser?.id);
    return peer?.username || conv.participants[0]?.username || "Chat";
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = getRoomName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full md:w-[280px] bg-surface-container-low border-r border-surface-variant/40 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-20">
      {/* Header */}
      <div className="h-[72px] shrink-0 border-b border-surface-variant/40 flex items-center px-4 justify-between bg-background backdrop-blur-sm">
        <h2 className="text-[20px] font-extrabold tracking-tight text-on-surface">
          Inbox
        </h2>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-surface-variant/20 backdrop-blur-sm bg-background">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-on-surface-variant/60" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-lowest border border-surface-variant/60 rounded-full py-2 pl-9 pr-4 text-[13px] text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-grow overflow-y-auto px-2 py-3 flex flex-col gap-1.5 custom-scrollbar bg-background">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-on-surface-variant text-[13px] py-12 px-4">
            {searchQuery
              ? "No matching conversations."
              : "No active conversations. Start a new chat above!"}
          </div>
        ) : (
          filteredConversations.map((conv, index) => {
            const isActive = conv.id === activeRoomId;
            const isTyping = conv.participants.some((p) => typingStatus[p.id]);
            const hasUnread = !!conv.unreadCount && conv.unreadCount > 0;
            const peer = !conv.is_group ? conv.participants?.find((p) => p.id !== currentUser?.id) || conv.participants?.[0] : null;
            const sysUser = peer ? users.find((u) => u.id === peer.id) : null;
            const isPeerOnline = peer ? (sysUser?.presence === 'online' || (peer as any).presence === 'online') : false;

            return (
              <div
                ref={
                  index === filteredConversations.length - 1
                    ? lastConversationRef
                    : null
                }
                key={conv.id}
                onClick={() => {
                  setActiveRoomId(conv.id);
                  navigate(`/chat/${conv.id}`);
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 border ${
                  isActive
                    ? "bg-surface-lowest border-surface-variant/30 "
                    : "border-transparent hover:bg-surface-lowest/40"
                }`}
              >
                {/* Conversation Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-primary/10 border border-surface-variant flex items-center justify-center text-primary font-bold">
                    {conv.is_group ? (
                      <Users size={18} />
                    ) : (
                      getRoomName(conv)[0]?.toUpperCase() || "C"
                    )}
                  </div>
                  {!conv.is_group && isPeerOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface-lowest" />
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-grow min-w-0 flex flex-col gap-0.5">
                  <div className="flex justify-between items-baseline">
                    <span
                      className={`text-[13px] truncate ${
                        isActive || hasUnread
                          ? "font-bold text-on-surface"
                          : "font-semibold text-on-surface-variant"
                      }`}
                    >
                      {getRoomName(conv)}
                    </span>
                    {conv.latest_message && (
                      <span
                        className={`text-[9px] ${
                          hasUnread
                            ? "font-bold text-primary"
                            : "text-on-surface-variant/60"
                        }`}
                      >
                        {new Date(
                          conv.latest_message.created_at,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Message preview / Typing state */}
                  <div className="flex justify-between items-center">
                    {isTyping ? (
                      <span className="text-[11px] font-bold text-primary animate-pulse">
                        typing...
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] truncate ${
                          hasUnread
                            ? "font-bold text-on-surface"
                            : "text-on-surface-variant/70"
                        }`}
                      >
                        {conv.latest_message
                          ? conv.latest_message.content
                          : "No messages yet"}
                      </span>
                    )}

                    {/* Unread badge / Read tick */}
                    {hasUnread ? (
                      <span className="bg-primary text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm shrink-0">
                        {conv.unreadCount}
                      </span>
                    ) : (
                      conv.latest_message &&
                      conv.latest_message.sender_id === currentUser?.id && (
                        <span className="text-secondary shrink-0">
                          {conv.latest_message.read_at ? (
                            <CheckCheck size={12} />
                          ) : (
                            <Check size={12} />
                          )}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isFetchingConversations && (
          <div className="flex justify-center py-4">
            <Loader2
              className="animate-spin text-primary opacity-50"
              size={16}
            />
          </div>
        )}
      </div>
    </div>
  );
};
