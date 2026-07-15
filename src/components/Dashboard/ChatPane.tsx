import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useCall } from "../../context/CallContext";
import { MessageSquare } from "lucide-react";

import { ChatHeader } from "./ChatPane/ChatHeader";
import { MessageFeed } from "./ChatPane/MessageFeed";
import { ChatInput } from "./ChatPane/ChatInput";

const getDateHeader = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();

  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = dToday.getTime() - dDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

export const ChatPane: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    activeRoomId,
    activeRoom,
    setActiveRoomId,
    messages,
    fetchMoreMessages,
    hasMoreMessages,
    isFetchingMessages,
    sendMessage,
    sendTyping,
    users,
  } = useChat();

  const observer = useRef<IntersectionObserver | null>(null);
  const firstMessageRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingMessages) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreMessages) {
          fetchMoreMessages();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingMessages, hasMoreMessages, fetchMoreMessages],
  );

  const { initiateCall } = useCall();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // Synchronize route param with chat context activeRoomId
  useEffect(() => {
    setActiveRoomId(roomId || null);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
  }, [roomId, setActiveRoomId]);

  const [inputVal, setInputVal] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRoomIdRef = useRef<string | null>(null);

  // Auto-scroll to bottom of chat feed when messages change
  const scrollToBottom = () => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    const isRoomSwitch = prevActiveRoomIdRef.current !== activeRoomId;
    prevActiveRoomIdRef.current = activeRoomId;

    if (isRoomSwitch) {
      scrollToBottom();
    } else if (container) {
      const { scrollHeight, scrollTop, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 150) {
        scrollToBottom();
      }
    } else {
      scrollToBottom();
    }
  }, [messages, activeRoomId]);

  // Handle typing triggers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);

    // Debounce sendTyping(true) so it doesn't flood on every keystroke
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(true);
    }

    // Debounce to send typing: false
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTyping(false);
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newRoomId = await sendMessage(inputVal.trim());
    setInputVal("");

    if (newRoomId) {
      navigate(`/chat/${newRoomId}`);
    }

    // Clear typing indicator immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    sendTyping(false);
  };

  const handleCall = (callType: "voice" | "video") => {
    if (!activeRoom || activeRoom.is_group) return;

    const targetPeer =
      activeRoom.participants.find((p) => p.id !== currentUser?.id) ||
      activeRoom.participants[0];
    if (targetPeer) {
      initiateCall(activeRoom.id, targetPeer.id, callType);
    }
  };

  const getChatTitle = () => {
    if (!activeRoom) return "";
    if (activeRoom.name) return activeRoom.name;
    if (activeRoom.is_group) return "Group Chat";
    const peer = activeRoom.participants.find((p) => p.id !== currentUser?.id);
    return peer?.username || activeRoom.participants[0]?.username || "Chat";
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!activeRoomId || !activeRoom) {
    return (
      <div className="hidden md:flex flex-grow h-full flex-col items-center justify-center bg-background z-10 p-8 select-none">
        <div className="flex flex-col items-center gap-4 text-center max-w-[360px]">
          <div className="w-16 h-16 rounded-full bg-surface-container-low border border-surface-variant flex items-center justify-center text-on-surface-variant shadow-sm">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-[18px] font-extrabold text-on-surface">
            No Active Chat
          </h2>
          <p className="text-[14px] text-on-surface-variant">
            Select a conversation from the sidebar, or start a new one to
            exchange secure messages and WebRTC calls.
          </p>
        </div>
      </div>
    );
  }

  const isDirectMessage = !activeRoom.is_group;

  const getPeerPresence = () => {
    if (!activeRoom || activeRoom.is_group) return null;
    const peer =
      activeRoom.participants.find((p) => p.id !== currentUser?.id) ||
      activeRoom.participants[0];
    if (!peer) return null;
    const sysUser = users.find((u) => u.id === peer.id);
    return sysUser?.presence || "offline";
  };

  const isPeerOnline = getPeerPresence() === "online";

  return (
    <div className="flex-grow h-full flex flex-col bg-background z-10">
      <ChatHeader
        activeRoom={activeRoom}
        currentUser={currentUser}
        chatTitle={getChatTitle()}
        isPeerOnline={isPeerOnline}
        isDirectMessage={isDirectMessage}
        handleCall={handleCall}
        setActiveRoomId={setActiveRoomId}
      />

      <MessageFeed
        messages={messages}
        isFetchingMessages={isFetchingMessages}
        currentUser={currentUser}
        activeRoom={activeRoom}
        isDirectMessage={isDirectMessage}
        firstMessageRef={firstMessageRef}
        feedEndRef={feedEndRef}
        scrollContainerRef={scrollContainerRef}
        getDateHeader={getDateHeader}
      />

      <ChatInput
        inputVal={inputVal}
        handleInputChange={handleInputChange}
        handleSend={handleSend}
      />
    </div>
  );
};
