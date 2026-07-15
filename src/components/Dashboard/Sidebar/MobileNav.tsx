import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Inbox,
  History,
  Users,
  Settings,
} from "lucide-react";

interface MobileNavProps {
  activeTab: "inbox" | "contacts" | "dashboard" | "history" | "settings";
  totalUnreadCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  totalUnreadCount,
}) => {
  const navigate = useNavigate();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-row justify-around items-center bg-surface-lowest border-t border-surface-variant/20 px-2 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <button
        onClick={() => navigate("/chat/overview")}
        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
          activeTab === "dashboard"
            ? "text-primary"
            : "text-on-surface-variant"
        }`}
      >
        <LayoutGrid size={22} />
      </button>
      <button
        onClick={() => navigate("/chat")}
        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors relative ${
          activeTab === "inbox" ? "text-primary" : "text-on-surface-variant"
        }`}
      >
        <Inbox size={22} />
        {totalUnreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-sm"></span>
        )}
      </button>
      <button
        onClick={() => navigate("/chat/history")}
        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
          activeTab === "history" ? "text-primary" : "text-on-surface-variant"
        }`}
      >
        <History size={22} />
      </button>
      <button
        onClick={() => navigate("/chat/contacts")}
        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
          activeTab === "contacts" ? "text-primary" : "text-on-surface-variant"
        }`}
      >
        <Users size={22} />
      </button>
      <button
        onClick={() => navigate("/chat/settings")}
        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
          activeTab === "settings" ? "text-primary" : "text-on-surface-variant"
        }`}
      >
        <Settings size={22} />
      </button>
    </div>
  );
};
