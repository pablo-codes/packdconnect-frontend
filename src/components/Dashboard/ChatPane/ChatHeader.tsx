import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Phone, Video, Info } from "lucide-react";
import type { User, Conversation } from "../../../types";

interface ChatHeaderProps {
  activeRoom: Conversation;
  currentUser: User | null;
  chatTitle: string;
  isPeerOnline: boolean;
  isDirectMessage: boolean;
  handleCall: (callType: "voice" | "video") => void;
  setActiveRoomId: (id: string | null) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeRoom,
  chatTitle,
  isPeerOnline,
  isDirectMessage,
  handleCall,
  setActiveRoomId,
}) => {
  const navigate = useNavigate();

  return (
    <header className="h-[72px] border-b border-surface-variant px-4 md:px-6 flex items-center justify-between shrink-0 bg-surface-lowest select-none sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setActiveRoomId(null);
            navigate("/chat");
          }}
          className="md:hidden w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-secondary-container border border-surface-variant flex items-center justify-center font-bold text-[14px]">
          {chatTitle[0]?.toUpperCase() || "C"}
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-on-surface text-[14px] leading-tight">
            {chatTitle}
          </span>
          {!activeRoom.is_group ? (
            <span
              className={`text-[11px] font-semibold flex items-center gap-1.5 mt-0.5 ${
                isPeerOnline ? "text-secondary" : "text-on-surface-variant/60"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPeerOnline ? "bg-secondary" : "bg-tertiary-container"
                }`}
              ></span>
              {isPeerOnline ? "Active now" : "Offline"}
            </span>
          ) : (
            <span className="text-[11px] text-on-surface-variant/60 font-semibold mt-0.5">
              {activeRoom.participants.length + 1} members
            </span>
          )}
        </div>
      </div>

      {/* WebRTC calling triggers */}
      <div className="flex items-center gap-2">
        {isDirectMessage && (
          <>
            <button
              onClick={() => handleCall("voice")}
              aria-label="Voice Call"
              className="btn-icon w-9 h-9 bg-surface-lowest hover:bg-surface-container-low border-surface-variant/40 text-on-surface-variant hover:text-primary flex items-center justify-center shadow-sm"
              title="Voice Call"
            >
              <Phone size={16} />
            </button>
            <button
              onClick={() => handleCall("video")}
              aria-label="Video Call"
              className="btn-icon w-9 h-9 bg-surface-lowest hover:bg-surface-container-low border-surface-variant/40 text-on-surface-variant hover:text-secondary flex items-center justify-center shadow-sm"
              title="Video Call"
            >
              <Video size={16} />
            </button>
          </>
        )}
        <button
          aria-label="Conversation Details"
          className="btn-icon w-9 h-9 bg-surface-lowest hover:bg-surface-container-low border-surface-variant/40 text-on-surface-variant hover:text-on-surface flex items-center justify-center shadow-sm"
          title="Conversation Details"
        >
          <Info size={16} />
        </button>
      </div>
    </header>
  );
};
