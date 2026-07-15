import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, Maximize2 } from 'lucide-react';

interface MinimizedCallWidgetProps {
  peerName: string;
  isRinging: boolean;
  isIncoming: boolean;
  isVideoCall: boolean;
  isAudioMuted: boolean;
  handleToggleAudio: () => void;
  answerCall: () => void;
  rejectCall: () => void;
  hangupCall: () => void;
  onMaximize: () => void;
}

export const MinimizedCallWidget: React.FC<MinimizedCallWidgetProps> = ({
  peerName,
  isRinging,
  isIncoming,
  isVideoCall,
  isAudioMuted,
  handleToggleAudio,
  answerCall,
  rejectCall,
  hangupCall,
  onMaximize,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-surface-lowest border border-surface-variant rounded-2xl shadow-tactile p-4 flex items-center justify-between w-[320px] select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-secondary-fixed-dim/40 border border-surface-variant/30 flex items-center justify-center font-bold text-on-secondary-fixed text-md shrink-0">
          {peerName[0]?.toUpperCase() || 'C'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-on-surface text-[13px] truncate">{peerName}</span>
          <span className="text-[10px] text-secondary font-semibold flex items-center gap-1 mt-0.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            {isRinging ? 'Ringing...' : `${isVideoCall ? 'Video' : 'Voice'} active`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Mute Mic */}
        {!isRinging && (
          <button 
            onClick={handleToggleAudio}
            aria-label={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              isAudioMuted 
                ? 'bg-error text-white border-error shadow-sm' 
                : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface border-transparent'
            }`}
            title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isAudioMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
        )}

        {/* Accept / Decline triggers if minimized ringing */}
        {isRinging && isIncoming ? (
          <>
            <button 
              onClick={answerCall}
              aria-label="Accept Call"
              className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/90 text-white flex items-center justify-center shadow-sm border-none cursor-pointer"
              title="Accept"
            >
              <Phone size={14} />
            </button>
            <button 
              onClick={rejectCall}
              aria-label="Decline Call"
              className="w-8 h-8 rounded-full bg-error hover:bg-error/90 text-white flex items-center justify-center shadow-sm border-none cursor-pointer"
              title="Decline"
            >
              <PhoneOff size={14} />
            </button>
          </>
        ) : (
          <>
            {/* Maximize */}
            <button 
              onClick={onMaximize}
              aria-label="Maximize Call"
              className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-surface-variant flex items-center justify-center text-on-surface hover:text-primary transition-all cursor-pointer"
              title="Maximize Call"
            >
              <Maximize2 size={14} />
            </button>

            {/* End Call */}
            <button 
              onClick={isRinging ? rejectCall : hangupCall}
              aria-label={isRinging ? 'Decline or Cancel Call' : 'Hang Up Call'}
              className="w-8 h-8 rounded-full bg-error hover:bg-error/90 text-white flex items-center justify-center shadow-sm border-none cursor-pointer"
              title={isRinging ? 'Decline/Cancel' : 'Hang Up'}
            >
              <PhoneOff size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
