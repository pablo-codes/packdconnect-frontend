export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Participant {
  id: string;
  username: string;
  email: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  participants: Participant[];
  latest_message: Message | null;
  unreadCount?: number;
}

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
  presence?: 'online' | 'offline';
}

export interface ActiveCall {
  callId: string;
  roomId: string;
  hostId: string;
  targetUserId: string;
  callType: 'voice' | 'video';
  status: 'ringing' | 'active';
}

export interface HistoryItem {
  id: string;
  name: string;
  email: string;
  type: 'incoming_call' | 'outgoing_call' | 'missed_call' | 'rejected_call' | 'incoming_video' | 'outgoing_video' | 'missed_video' | 'rejected_video' | 'message';
  detail: string;
  time: string;
  duration?: string;
  roomId?: string;
  peerId?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  tag: string;
  isActive: boolean;
}
