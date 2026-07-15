import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useChat } from "../../../context/ChatContext";
import {
  LogOut,
  LayoutGrid,
  Inbox,
  Users,
  History,
  Settings,
} from "lucide-react";

interface NavMenuProps {
  isCollapsed: boolean;
  activeTab: "inbox" | "contacts" | "dashboard" | "history" | "settings";
  totalUnreadCount: number;
  handleLogout: () => void;
}

export const NavMenu: React.FC<NavMenuProps> = ({
  isCollapsed,
  activeTab,
  totalUnreadCount,
  handleLogout,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { activeRoomId, connectionStatus } = useChat();

  return (
    <div
      className={`hidden md:flex flex-col justify-between h-full bg-surface-container-low transition-all duration-300 ${
        isCollapsed ? "w-[80px] p-3" : "w-[240px] p-4"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Logo Branding */}
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <img
            src="/logo.png"
            alt="PackdConnect"
            className="h-8 w-auto object-contain"
          />
          {!isCollapsed && (
            <span className="font-extrabold text-[15px] tracking-tight text-on-surface">
              PackdConnect
            </span>
          )}
        </div>

        {/* Core Navigation Actions */}
        <div className={`w-full mt-8 flex flex-col gap-2`}>
          {/* Dashboard */}
          <button
            onClick={() => navigate("/chat/overview")}
            aria-label="Dashboard"
            className={`flex items-center transition-colors cursor-pointer border-none outline-none  text-left ${
              isCollapsed
                ? "justify-center w-12 h-12 rounded-full mx-auto"
                : "gap-3 px-4 py-3 rounded-full w-full font-bold text-[14px]"
            } ${
              activeTab === "dashboard"
                ? "bg-secondary-container  ambient-shadow"
                : "hover:bg-surface-lowest/50 text-on-surface-variant"
            }`}
            title="Dashboard"
          >
            <LayoutGrid size={18} />
            {!isCollapsed && <span>Dashboard</span>}
          </button>

          {/* Inbox */}
          <button
            onClick={() =>
              navigate(activeRoomId ? `/chat/${activeRoomId}` : "/chat")
            }
            aria-label="Inbox"
            className={`relative flex items-center transition-colors cursor-pointer border-none outline-none  text-left ${
              isCollapsed
                ? "justify-center w-12 h-12 rounded-full mx-auto"
                : "justify-between px-4 py-3 rounded-full w-full font-bold text-[14px]"
            } ${
              activeTab === "inbox"
                ? "bg-secondary-container ambient-shadow"
                : "hover:bg-surface-lowest/50 text-on-surface-variant"
            }`}
            title="Inbox"
          >
            <div className="flex items-center gap-3">
              <Inbox size={18} />
              {!isCollapsed && <span>Inbox</span>}
            </div>
            {totalUnreadCount > 0 &&
              (isCollapsed ? (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary shadow-sm"></span>
              ) : (
                <span className="bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  {totalUnreadCount}
                </span>
              ))}
          </button>

          {/* Contacts */}
          <button
            onClick={() => navigate("/chat/contacts")}
            aria-label="Contacts"
            className={`flex items-center transition-colors cursor-pointer border-none outline-none text-left ${
              isCollapsed
                ? "justify-center w-12 h-12 rounded-full mx-auto"
                : "gap-3 px-4 py-3 rounded-full w-full font-bold text-[14px]"
            } ${
              activeTab === "contacts"
                ? "bg-secondary-container  ambient-shadow"
                : "hover:bg-surface-lowest/50  text-on-surface-variant"
            }`}
            title="Contacts"
          >
            <Users size={18} />
            {!isCollapsed && <span>Contacts</span>}
          </button>

          {/* History */}
          <button
            onClick={() => navigate("/chat/history")}
            aria-label="History"
            className={`flex items-center transition-colors cursor-pointer border-none outline-none text-left ${
              isCollapsed
                ? "justify-center w-12 h-12 rounded-full mx-auto"
                : "gap-3 px-4 py-3 rounded-full w-full font-bold text-[14px]"
            } ${
              activeTab === "history"
                ? "bg-secondary-container  ambient-shadow"
                : "hover:bg-surface-lowest/50  text-on-surface-variant"
            }`}
            title="History"
          >
            <History size={18} />
            {!isCollapsed && <span>History</span>}
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate("/chat/settings")}
            aria-label="Settings"
            className={`flex items-center transition-colors cursor-pointer border-none outline-none  text-left ${
              isCollapsed
                ? "justify-center w-12 h-12 rounded-full mx-auto"
                : "gap-3 px-4 py-3 rounded-full w-full font-bold text-[14px]"
            } ${
              activeTab === "settings"
                ? "bg-secondary-container  ambient-shadow"
                : "hover:bg-surface-lowest/30  text-on-surface-variant"
            }`}
            title="Settings"
          >
            <Settings size={18} />
            {!isCollapsed && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Bottom Profile Card */}
      {isCollapsed ? (
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full mx-auto relative group hover:bg-surface-container-high/30 cursor-pointer transition-colors"
          title="Profile & Sign Out"
        >
          <div className="w-10 h-10 rounded-full bg-secondary-container border border-surface-variant flex items-center justify-center text-on-secondary-container font-bold text-md shadow-sm">
            {currentUser?.username[0]?.toUpperCase() || "U"}
          </div>
          <div
            className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-surface-container-low ${
              connectionStatus === "connected"
                ? "bg-secondary"
                : connectionStatus === "connecting"
                  ? "bg-primary animate-pulse"
                  : "bg-gray-400"
            }`}
          ></div>
          <button
            onClick={handleLogout}
            aria-label="Sign Out"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 btn-icon w-10 h-10 rounded-full bg-surface-container-lowest border-surface-variant transition-opacity flex items-center justify-center shadow-md text-on-surface hover:text-primary z-30"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-surface-container-high/30 cursor-pointer relative group transition-colors">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-secondary-container border border-surface-variant flex items-center justify-center text-on-secondary-container font-bold text-md shadow-sm">
              {currentUser?.username[0]?.toUpperCase() || "U"}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-container-low ${
                connectionStatus === "connected"
                  ? "bg-secondary"
                  : connectionStatus === "connecting"
                    ? "bg-primary animate-pulse"
                    : "bg-gray-400"
              }`}
              title={`WebSocket: ${connectionStatus}`}
            ></div>
          </div>
          <div className="flex flex-col min-w-0 flex-grow">
            <span className="font-bold text-on-surface text-[13px] truncate">
              {currentUser?.username}
            </span>
            <span
              className={`text-[10px] font-semibold ${
                connectionStatus === "connected"
                  ? "text-secondary"
                  : "text-on-surface-variant/60"
              }`}
            >
              {connectionStatus === "connected"
                ? "Active Now"
                : connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Offline"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            aria-label="Sign Out"
            className="absolute right-2 opacity-0 group-hover:opacity-100 btn-icon w-8 h-8 bg-surface-container-lowest hover:bg-surface-container-high border-surface-variant transition-opacity flex items-center justify-center shadow-sm"
            title="Sign Out"
          >
            <LogOut size={14} className="text-on-surface-variant" />
          </button>
        </div>
      )}
    </div>
  );
};
