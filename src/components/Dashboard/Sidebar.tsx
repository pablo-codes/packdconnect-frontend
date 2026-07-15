import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { NavMenu } from "./Sidebar/NavMenu";
import { MobileNav } from "./Sidebar/MobileNav";
import { InboxList } from "./Sidebar/InboxList";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
}) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { conversations, activeRoomId } = useChat();

  const [searchQuery, setSearchQuery] = useState("");

  const path = location.pathname;
  let activeTab: "inbox" | "contacts" | "dashboard" | "history" | "settings" =
    "inbox";
  if (path.startsWith("/chat/contacts")) {
    activeTab = "contacts";
  } else if (path.startsWith("/chat/history")) {
    activeTab = "history";
  } else if (path.startsWith("/chat/overview")) {
    activeTab = "dashboard";
  } else if (path.startsWith("/chat/settings")) {
    activeTab = "settings";
  } else if (path.startsWith("/chat")) {
    activeTab = "inbox";
  }

  const totalUnreadCount = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0,
  );

  const handleLogout = async () => {
    await logout();
  };

  const showConversations = !isCollapsed && activeTab === "inbox";

  // Hide sidebar on mobile if a chat is active.
  const isMobileHidden = activeRoomId
    ? "hidden md:flex"
    : activeTab === "inbox"
      ? "flex w-full md:w-auto"
      : "flex w-0 md:w-auto border-none";
  const sidebarWidthClass = isCollapsed
    ? "md:w-[80px]"
    : showConversations
      ? "md:w-[520px]"
      : "md:w-[240px]";

  return (
    <aside
      className={`h-full shrink-0 relative z-10 select-none transition-all duration-300 ${isMobileHidden} ${sidebarWidthClass}`}
    >
      {/* Collapse/Expand Chevron Toggle Button (Hidden on Mobile) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        className="hidden md:flex absolute top-1/2 -right-3.5 transform -translate-y-1/2 w-7 h-7 bg-surface-lowest border border-surface-variant/40 rounded-full items-center justify-center cursor-pointer shadow-md text-on-surface hover:text-primary transition-all hover:scale-105 z-30"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* 1. Left Column: Navigation Sidebar */}
      <NavMenu
        isCollapsed={isCollapsed}
        activeTab={activeTab}
        totalUnreadCount={totalUnreadCount}
        handleLogout={handleLogout}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} totalUnreadCount={totalUnreadCount} />

      {/* 2. Right Column: Inbox / Conversations List */}
      {showConversations && (
        <InboxList
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
    </aside>
  );
};
