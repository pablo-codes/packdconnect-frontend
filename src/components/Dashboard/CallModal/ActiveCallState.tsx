import React, { useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
  Minimize2,
  AlertCircle,
} from "lucide-react";

interface ActiveCallStateProps {
  isVideoCall: boolean;
  peerName: string;
  mediaError: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  handleToggleAudio: () => void;
  handleToggleVideo: () => void;
  hangupCall: () => void;
  setIsMinimized: (val: boolean) => void;
}

export const ActiveCallState: React.FC<ActiveCallStateProps> = ({
  isVideoCall,
  peerName,
  mediaError,
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoMuted,
  handleToggleAudio,
  handleToggleVideo,
  hangupCall,
  setIsMinimized,
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center text-white">
      {/* Main Remote Stream Display */}
      <div className="absolute inset-0 z-10 w-full h-full bg-on-surface flex items-center justify-center">
        {isVideoCall ? (
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
        ) : (
          // Audio only display
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-28 h-28 bg-secondary/10 border border-secondary rounded-full flex items-center justify-center animate-pulse">
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center text-white font-extrabold text-3xl shadow-sm">
                {peerName[0]?.toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">{peerName}</h3>
              <p className="text-secondary text-[13px] mt-1 font-semibold animate-pulse">
                Voice Call Connected
              </p>
            </div>
            {/* Audio tag for voice connection */}
            <audio ref={remoteAudioRef} autoPlay />
          </div>
        )}
      </div>

      {/* Floating Picture-In-Picture for Local Stream */}
      {isVideoCall && (
        <div className="absolute top-md right-md md:top-margin-desktop md:right-margin-desktop z-20 w-[140px] h-[180px] sm:w-[180px] sm:h-[240px] bg-on-surface border-2 border-surface-container-lowest rounded-xl overflow-hidden shadow-2xl">
          {isVideoMuted ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-surface-container-low">
              <CameraOff size={24} />
            </div>
          ) : (
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              autoPlay
              playsInline
              muted
            />
          )}
        </div>
      )}

      {/* Top Info Banner */}
      <div className="absolute top-md left-md md:top-margin-desktop md:left-margin-desktop z-20 flex items-center gap-2">
        <div className="bg-surface-container-lowest/80 backdrop-blur-md px-4 py-2 rounded-full ambient-shadow inline-flex items-center gap-2 text-on-surface font-label-md text-label-md text-sm text-[13px]">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>Call with {peerName}</span>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          aria-label="Minimize Call"
          className="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-md hover:bg-surface-container-lowest border border-surface-variant flex items-center justify-center text-on-surface hover:text-primary transition-all cursor-pointer"
          title="Minimize Call"
        >
          <Minimize2 size={16} />
        </button>
      </div>

      {/* Fallback Warning Box */}
      {mediaError && (
        <div className="absolute top-20 left-6 z-20 bg-[#ffdad6] text-[#93000a] text-[12px] font-semibold px-4 py-3 rounded-[12px] border border-[#ffb4ab] flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{mediaError}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="absolute bottom-md left-1/2 -translate-x-1/2 md:bottom-lg z-30 w-auto flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest px-6 py-3 rounded-full ambient-shadow flex items-center gap-4 border border-surface-variant">
          {/* Mute Microphone */}
          <button
            onClick={handleToggleAudio}
            aria-label={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isAudioMuted
                ? "bg-error text-white border border-error shadow-sm"
                : "bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-transparent"
            }`}
            title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Mute Video (if video call) */}
          {isVideoCall && (
            <button
              onClick={handleToggleVideo}
              aria-label={isVideoMuted ? "Turn Camera On" : "Turn Camera Off"}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isVideoMuted
                  ? "bg-error text-white border border-error shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-transparent"
              }`}
              title={isVideoMuted ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoMuted ? <CameraOff size={20} /> : <Camera size={20} />}
            </button>
          )}

          {/* End/Hang Up call */}
          <button
            onClick={hangupCall}
            aria-label="Hang Up Call"
            className="w-16 h-12 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center hover:-translate-y-0.5 custom-shadow transition-all ml-2"
            title="Hang Up"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
