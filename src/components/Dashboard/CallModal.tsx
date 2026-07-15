import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useCall } from "../../context/CallContext";
import { MinimizedCallWidget } from "./MinimizedCallWidget";
import { RingingState } from "./CallModal/RingingState";
import { ActiveCallState } from "./CallModal/ActiveCallState";

export const CallModal: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, conversations } = useChat();
  const {
    activeCall,
    localStream,
    remoteStream,
    mediaError,
    answerCall,
    rejectCall,
    hangupCall,
  } = useCall();

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    if (!activeCall) {
      setIsMinimized(false);
    }
  }, [activeCall, activeCall?.status]);

  // Resolve peer display name
  const getPeerName = () => {
    if (!activeCall) return "Unknown User";

    // Find the peer's ID (the user who is NOT currentUser)
    const peerId =
      activeCall.hostId === currentUser?.id
        ? activeCall.targetUserId
        : activeCall.hostId;

    // 1. Search in active room conversation participants
    const activeRoom = conversations.find((c) => c.id === activeCall.roomId);
    if (activeRoom) {
      const p = activeRoom.participants.find((p) => p.id === peerId);
      if (p) return p.username;
    }

    // 2. Search in system users list
    const systemUser = users.find((u) => u.id === peerId);
    if (systemUser) return systemUser.username;

    // 3. Fallback
    return `User (${peerId.substring(0, 5)})`;
  };

  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  if (!activeCall) return null;

  const isIncoming = activeCall.targetUserId === currentUser?.id;
  const isRinging = activeCall.status === "ringing";
  const isVideoCall = activeCall.callType === "video";

  if (isMinimized) {
    return (
      <MinimizedCallWidget
        peerName={getPeerName()}
        isRinging={isRinging}
        isIncoming={isIncoming}
        isVideoCall={isVideoCall}
        isAudioMuted={isAudioMuted}
        handleToggleAudio={handleToggleAudio}
        answerCall={answerCall}
        rejectCall={rejectCall}
        hangupCall={hangupCall}
        onMaximize={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/25 backdrop-blur-md p-4 overflow-hidden select-none">
      {isRinging ? (
        <RingingState
          isIncoming={isIncoming}
          isVideoCall={isVideoCall}
          peerName={getPeerName()}
          mediaError={mediaError}
          answerCall={answerCall}
          rejectCall={rejectCall}
          hangupCall={hangupCall}
        />
      ) : (
        <ActiveCallState
          isVideoCall={isVideoCall}
          peerName={getPeerName()}
          mediaError={mediaError}
          localStream={localStream}
          remoteStream={remoteStream}
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          handleToggleAudio={handleToggleAudio}
          handleToggleVideo={handleToggleVideo}
          hangupCall={hangupCall}
          setIsMinimized={setIsMinimized}
        />
      )}
    </div>
  );
};
