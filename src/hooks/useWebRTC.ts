import { useState, useRef, useCallback } from 'react';

const getIceServers = (): RTCConfiguration => {
  const servers: RTCIceServer[] = [];

  const stunUrl = import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302';
  servers.push({ urls: stunUrl });

  const turnUrl = import.meta.env.VITE_TURN_SERVER;
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_PASSWORD || ''
    });
  }

  return { iceServers: servers };
};

export function useWebRTC(sendWsMessage: (payload: any) => void, onDisconnect: () => void) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const cleanupWebRTC = useCallback(() => {
    console.log('[useWebRTC] Cleaning up active streams and peer connection...');
    
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setMediaError(null);
    pendingCandidatesRef.current = [];
  }, []);

  const initLocalStream = useCallback(async (callType: 'voice' | 'video'): Promise<MediaStream | null> => {
    try {
      setMediaError(null);
      const constraints = {
        audio: true,
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (err: any) {
      console.error('[useWebRTC] Error acquiring user media:', err);
      let friendlyError = 'Could not access microphone or camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyError = 'Microphone/Camera permission denied. Please enable permission in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyError = 'No audio or video input devices found.';
      }
      setMediaError(friendlyError);
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((targetUserId: string) => {
    const pc = new RTCPeerConnection(getIceServers());
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage({
          type: 'ice_candidate',
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[useWebRTC] Remote track received:', event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[useWebRTC] ICE connection state changed to:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        cleanupWebRTC();
        setMediaError('Call disconnected due to network issues.');
        onDisconnect();
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [cleanupWebRTC, sendWsMessage, onDisconnect]);

  const drainIceCandidates = useCallback(async () => {
    if (!pcRef.current || !pcRef.current.remoteDescription) return;
    console.log(`[useWebRTC] Draining ${pendingCandidatesRef.current.length} pending ICE candidates.`);
    for (const cand of pendingCandidatesRef.current) {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.error('[useWebRTC] Error adding drained ICE candidate:', err);
      }
    }
    pendingCandidatesRef.current = [];
  }, []);

  return {
    localStream,
    remoteStream,
    mediaError,
    pcRef,
    pendingCandidatesRef,
    cleanupWebRTC,
    initLocalStream,
    createPeerConnection,
    drainIceCandidates
  };
}
