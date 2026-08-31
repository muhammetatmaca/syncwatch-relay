export type UserRole = 'HOST' | 'GUEST' | null;

export type SyncStatus = 'CONNECTING' | 'SYNCED' | 'BUFFERING' | 'DRIFTED' | 'DISCONNECTED';

export interface VideoPreset {
  id: string;
  title: string;
  url: string;
  durationLabel: string;
  description: string;
}

export type SyncActionType = 
  | 'REGISTER'
  | 'PLAY' 
  | 'PAUSE' 
  | 'SEEK' 
  | 'HEARTBEAT' 
  | 'JOIN_REQUEST' 
  | 'JOIN_ACK' 
  | 'PEER_CONNECTED'
  | 'VIDEO_CHANGE'
  | 'PARTNER_LEFT';

export interface SyncMessage {
  type: SyncActionType;
  roomId: string;
  senderRole: 'HOST' | 'GUEST';
  timestamp: number; // Device wall-clock time in ms
  positionMillis: number; // Playback position in video (ms)
  isPlaying: boolean;
  videoUrl?: string;
  videoTitle?: string;
}

export interface RoomState {
  roomId: string | null;
  role: UserRole;
  partnerConnected: boolean;
  partnerName?: string;
  videoUrl: string;
  videoTitle: string;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  driftDeltaMs: number;
  syncStatus: SyncStatus;
  latencyMs: number;
}
