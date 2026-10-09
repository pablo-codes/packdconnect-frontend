import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { useWebSocketContext } from './WebSocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { RingToneSynthesizer } from '../utils/audioSynthesizer';
import { evaluateDNDPolicy } from '../utils/dndPolicy';
import type { ActiveCall } from '../types';

interface CallContextType {
  activeCall: ActiveCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  mediaError: string | null;
  initiateCall: (roomId: string, targetUserId: string, callType: 'voice' | 'video') => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => void;
  hangupCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: currentUser } = useAuth();
  const { users } = useChat();
  const { sendWsMessage, registerWsHandler, unregisterWsHandler } = useWebSocketContext();

  const sendWsMessageRef = useRef(sendWsMessage);
  const currentUserRef = useRef(currentUser);
  const usersRef = useRef(users);

  useEffect(() => {
    sendWsMessageRef.current = sendWsMessage;
  }, [sendWsMessage]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const synthRef = useRef<RingToneSynthesizer | null>(null);
  const recentCallsRef = useRef<Map<string, number[]>>(new Map());
  const dialingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!synthRef.current) {
    synthRef.current = new RingToneSynthesizer();
  }

  // Request browser notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // Play dialing/ringing tones dynamically on status changes
  useEffect(() => {
    if (activeCall) {
      if (activeCall.status === 'ringing') {
        const isIncoming = activeCall.targetUserId === currentUser?.id;
        if (isIncoming) {
          const callerId = activeCall.hostId;
          const now = Date.now();
          const callerHistory = recentCallsRef.current.get(callerId) || [];
          recentCallsRef.current.set(callerId, [...callerHistory, now]);

          const { shouldRing, bypassed } = evaluateDNDPolicy(callerId, recentCallsRef.current);
          if (bypassed) {
            console.log('[CallContext] DND bypassed for repeat caller');
          }

          if (shouldRing) {
            synthRef.current?.startRinging();
            
            // Trigger browser desktop notification
            const caller = users.find((u) => u.id === activeCall.hostId)?.username || 'Someone';
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Incoming ${activeCall.callType} call`, {
                body: `${caller} is calling you on PackdConnect.`,
                requireInteraction: true,
              });
            }
          } else {
             console.log('[CallContext] Incoming call silenced by DND setting.');
          }
        } else {
          synthRef.current?.startDialing();
        }
      } else {
        synthRef.current?.stop();
      }
    } else {
      synthRef.current?.stop();
    }
  }, [activeCall, currentUser, users]);

  // Stop audio synthesizer and dialing timeout on unmount
  useEffect(() => {
    return () => {
      synthRef.current?.stop();
      if (dialingTimeoutRef.current) {
        clearTimeout(dialingTimeoutRef.current);
      }
    };
  }, []);
  const incomingOfferRef = useRef<any>(null);

  const handleCleanup = useCallback(() => {
    setActiveCall(null);
    incomingOfferRef.current = null;
  }, []);

  const handleSendWs = useCallback((msg: any) => {
    sendWsMessageRef.current(msg);
  }, []);

  const {
    localStream,
    remoteStream,
    mediaError,
    pcRef,
    pendingCandidatesRef,
    cleanupWebRTC,
    initLocalStream,
    createPeerConnection,
    drainIceCandidates
  } = useWebRTC(handleSendWs, handleCleanup);

  const cleanupCall = useCallback(() => {
    cleanupWebRTC();
    handleCleanup();
  }, [cleanupWebRTC, handleCleanup]);

  // Listen to WebSocket events forwarded from ChatContext
  useEffect(() => {
    // 1. Handle incoming call invite
    registerWsHandler('call_incoming', async (data) => {
      console.log('[CallContext] Received call_incoming from', data.hostId);

      // Evaluate DND policy
      const now = Date.now();
      if (!recentCallsRef.current.has(data.hostId)) {
        recentCallsRef.current.set(data.hostId, []);
      }
      const attempts = recentCallsRef.current.get(data.hostId)!
        .filter(t => now - t < 3 * 60 * 1000);
      attempts.push(now);
      recentCallsRef.current.set(data.hostId, attempts);

      const { shouldRing, bypassed } = evaluateDNDPolicy(data.hostId, recentCallsRef.current);
      if (!shouldRing) {
        console.log('[CallContext] Call suppressed silently by DND. Host:', data.hostId);
        sendWsMessageRef.current({
          type: 'call_reject',
          callId: data.callId,
          targetUserId: data.hostId,
        });
        return;
      }
      if (bypassed) {
        console.log('[CallContext] DND Bypassed due to repeat call attempts. Ringing call.');
      }

      incomingOfferRef.current = data.sdpOffer;
      setActiveCall({
        callId: data.callId,
        roomId: data.roomId,
        hostId: data.hostId,
        targetUserId: currentUserRef.current?.id || '',
        callType: data.callType,
        status: 'ringing',
      });
    });

    // 2. Handle call accepted by peer (answer)
    registerWsHandler('call_answered', async (data) => {
      console.log('[CallContext] Received call_answered from', data.responderId);
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdpAnswer));
        setActiveCall((prev) => (prev ? { ...prev, status: 'active' } : null));
        await drainIceCandidates();
      } catch (err) {
        console.error('[CallContext] Error setting remote description from answer:', err);
      }
    });

    // 3. Handle incoming ICE Candidate from peer
    registerWsHandler('ice_candidate', async (data) => {
      const candidateInit: RTCIceCandidateInit = data.candidate;
      if (pcRef.current && pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidateInit));
        } catch (err) {
          console.error('[CallContext] Error adding ICE candidate:', err);
        }
      } else {
        console.log('[CallContext] Queueing ICE candidate because remote description not set.');
        pendingCandidatesRef.current.push(candidateInit);
      }
    });

    // 0. Handle call initiated acknowledgment from server with true callId
    registerWsHandler('call_initiated', (data) => {
      console.log('[CallContext] Received call_initiated with persistent callId:', data.callId);
      setActiveCall((prev) => (prev ? { ...prev, callId: data.callId } : null));
    });

    // 4. Handle call rejected by peer
    registerWsHandler('call_rejected', () => {
      console.log('[CallContext] Call rejected by peer.');
      cleanupCall();
    });

    // 5. Handle call hung up by peer
    registerWsHandler('call_hungup', () => {
      console.log('[CallContext] Call completed/hung up by peer.');
      cleanupCall();
    });

    return () => {
      unregisterWsHandler('call_initiated');
      unregisterWsHandler('call_incoming');
      unregisterWsHandler('call_answered');
      unregisterWsHandler('ice_candidate');
      unregisterWsHandler('call_rejected');
      unregisterWsHandler('call_hungup');
    };
  }, [registerWsHandler, unregisterWsHandler]);

  // Client Actions

  // 1. Dials another user
  const initiateCall = async (roomId: string, targetUserId: string, callType: 'voice' | 'video') => {
    if (activeCall) return;
    console.log(`[CallContext] Dialing call (${callType}) to user:`, targetUserId);
    
    // Acquire media
    const stream = await initLocalStream(callType);
    if (!stream) return; // Media acquisition error, handled in state

    try {
      // Setup connection
      const pc = createPeerConnection(targetUserId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendWsMessageRef.current({
        type: 'call_initiate',
        roomId,
        targetUserId,
        callType,
        sdpOffer: offer,
      });

      // Temporary local call state until callId is resolved via WS or we represent it as dialing
      setActiveCall({
        callId: 'dialing-placeholder',
        roomId,
        hostId: currentUserRef.current?.id || '',
        targetUserId,
        callType,
        status: 'ringing',
      });
    } catch (err) {
      console.error('[CallContext] Error creating SDP offer:', err);
      cleanupCall();
    }
  };

  // 2. Answers an incoming call
  const answerCall = async () => {
    if (!activeCall || !incomingOfferRef.current) return;
    console.log('[CallContext] Answering incoming call ID:', activeCall.callId);

    // Acquire media
    const stream = await initLocalStream(activeCall.callType);
    if (!stream) {
      // If media access is denied, reject the call automatically
      rejectCall();
      return;
    }

    try {
      const pc = createPeerConnection(activeCall.hostId);
      // Set remote SDP description
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOfferRef.current));
      
      // Process queued candidates
      await drainIceCandidates();

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Reply back
      sendWsMessageRef.current({
        type: 'call_answer',
        callId: activeCall.callId,
        targetUserId: activeCall.hostId,
        sdpAnswer: answer,
      });

      setActiveCall((prev) => (prev ? { ...prev, status: 'active' } : null));
    } catch (err) {
      console.error('[CallContext] Error setting SDP answer:', err);
      cleanupCall();
    }
  };

  // 3. Declines an incoming call
  const rejectCall = () => {
    if (!activeCall) return;
    const isHost = activeCall.hostId === currentUserRef.current?.id;
    const targetUserId = isHost ? activeCall.targetUserId : activeCall.hostId;
    console.log(`[CallContext] Rejecting/Canceling call ID: ${activeCall.callId}, targetUserId: ${targetUserId}`);

    // Only send WS reject if callId is a real ID (avoid sending 'dialing-placeholder' which crashes Postgres)
    if (activeCall.callId && activeCall.callId !== 'dialing-placeholder') {
      sendWsMessageRef.current({
        type: 'call_reject',
        callId: activeCall.callId,
        targetUserId,
      });
    }

    cleanupCall();
  };

  // 4. Hangs up an active call
  const hangupCall = () => {
    if (!activeCall) return;
    console.log('[CallContext] Hanging up call ID:', activeCall.callId);

    const peerId = activeCall.hostId === currentUserRef.current?.id ? activeCall.targetUserId : activeCall.hostId;

    if (activeCall.callId && activeCall.callId !== 'dialing-placeholder') {
      sendWsMessageRef.current({
        type: 'call_hangup',
        callId: activeCall.callId,
        targetUserId: peerId,
      });
    }

    cleanupCall();
  };
  // Periodically prune old entries from recentCallsRef Map
  useEffect(() => {
    const pruneInterval = setInterval(() => {
      const now = Date.now();
      const threeMinutes = 3 * 60 * 1000;
      for (const [key, attempts] of recentCallsRef.current.entries()) {
        const fresh = attempts.filter(t => now - t < threeMinutes);
        if (fresh.length === 0) {
          recentCallsRef.current.delete(key);
        } else {
          recentCallsRef.current.set(key, fresh);
        }
      }
    }, 60000); // Prune every minute
    return () => clearInterval(pruneInterval);
  }, []);

  // Manage dialing timeout (30 seconds) on the client that cancels dialing if no answer
  useEffect(() => {
    if (activeCall && activeCall.status === 'ringing' && activeCall.hostId === currentUser?.id) {
      if (!dialingTimeoutRef.current) {
        console.log('[CallContext] Starting dialing timeout (30s)...');
        dialingTimeoutRef.current = setTimeout(() => {
          console.log('[CallContext] Dialing timed out. Canceling call...');
          rejectCall();
        }, 30000);
      }
    } else {
      if (dialingTimeoutRef.current) {
        clearTimeout(dialingTimeoutRef.current);
        dialingTimeoutRef.current = null;
      }
    }
  }, [activeCall, currentUser]);
  return (
    <CallContext.Provider
      value={{
        activeCall,
        localStream,
        remoteStream,
        mediaError,
        initiateCall,
        answerCall,
        rejectCall,
        hangupCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
