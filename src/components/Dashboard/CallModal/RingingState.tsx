import React from "react";
import { Phone, PhoneOff, Video, AlertCircle } from "lucide-react";

interface RingingStateProps {
  isIncoming: boolean;
  isVideoCall: boolean;
  peerName: string;
  mediaError: string | null;
  answerCall: () => void;
  rejectCall: () => void;
  hangupCall: () => void;
}

export const RingingState: React.FC<RingingStateProps> = ({
  isIncoming,
  isVideoCall,
  peerName,
  mediaError,
  answerCall,
  rejectCall,
  hangupCall,
}) => {
  return (
    <div className="relative z-50 w-full max-w-[400px] bg-surface-container-lowest border border-surface-variant rounded-lg shadow-2xl p-8 flex flex-col items-center gap-6 text-center">
      {/* Animated Pulsing Rings */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute w-20 h-20 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute w-16 h-16 bg-secondary/30 rounded-full animate-pulse"></div>
        <div className="relative w-12 h-12 bg-surface-container-lowest border border-surface-variant rounded-full flex items-center justify-center text-primary shadow-sm">
          {isVideoCall ? <Video size={20} /> : <Phone size={20} />}
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-extrabold text-on-surface">
          {isIncoming ? "Incoming Call" : "Calling..."}
        </h2>
        <p className="text-[22px] font-extrabold text-primary mt-2">
          {peerName}
        </p>
        <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
          Secure WebRTC {isVideoCall ? "video" : "voice"} Call
        </p>
      </div>

      {/* Media Permission Warnings */}
      {mediaError && (
        <div className="bg-[#ffdad6] text-[#93000a] text-[12px] font-medium p-3 rounded-[12px] border border-[#ffb4ab] flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{mediaError}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-4 w-full mt-4 justify-center">
        {isIncoming ? (
          <>
            <button
              onClick={answerCall}
              aria-label="Accept Incoming Call"
              className="btn btn-primary h-[48px] px-8 bg-secondary border-secondary hover:bg-secondary/90"
              style={{ borderRadius: "16px" }}
            >
              <Phone size={18} />
              <span>Accept</span>
            </button>
            <button
              onClick={rejectCall}
              aria-label="Decline Incoming Call"
              className="btn btn-danger h-[48px] px-8 bg-error hover:bg-error/90"
              style={{ borderRadius: "16px" }}
            >
              <PhoneOff size={18} />
              <span>Decline</span>
            </button>
          </>
        ) : (
          <button
            onClick={hangupCall}
            aria-label="Cancel Dialing"
            className="btn btn-danger h-[48px] px-8 w-full justify-center bg-error hover:bg-error/90"
            style={{ borderRadius: "16px" }}
          >
            <PhoneOff size={18} />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
};
