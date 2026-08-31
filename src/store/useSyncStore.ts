import { create } from 'zustand';
import { RoomState, UserRole, SyncStatus } from '../types/sync';
import { ThemeMode } from '../theme/colors';
import { syncService } from '../services/syncService';
import { SyncHaptics } from '../utils/haptics';

export interface SyncStoreState extends RoomState {
  themeMode: ThemeMode;
  toggleTheme: () => void;

  createRoom: (roomId: string, videoUrl: string, videoTitle: string) => void;
  joinRoom: (roomId: string) => void;
  setPartnerConnected: (connected: boolean) => void;
  setPlayback: (isPlaying: boolean, positionMillis: number) => void;
  setDuration: (durationMillis: number) => void;
  setSyncStatus: (status: SyncStatus, driftDeltaMs?: number, latencyMs?: number) => void;
  setVideo: (url: string, title: string) => void;
  leaveRoom: () => void;
}

export const useSyncStore = create<SyncStoreState>()((set, get) => ({
  roomId: null,
  role: null,
  partnerConnected: false,
  videoUrl: '',
  videoTitle: '',
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  driftDeltaMs: 0,
  syncStatus: 'DISCONNECTED',
  latencyMs: 0,
  themeMode: 'dark',

  toggleTheme: () => {
    set((state: SyncStoreState) => ({
      themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
    }));
  },

  createRoom: (roomId: string, videoUrl: string, videoTitle: string) => {
    set({
      roomId: roomId.toUpperCase(),
      role: 'HOST',
      partnerConnected: false,
      videoUrl,
      videoTitle,
      isPlaying: false,
      positionMillis: 0,
      syncStatus: 'CONNECTING',
    });

    syncService.connect(roomId, 'HOST');
  },

  joinRoom: (roomId: string) => {
    set({
      roomId: roomId.toUpperCase(),
      role: 'GUEST',
      partnerConnected: false,
      isPlaying: false,
      positionMillis: 0,
      syncStatus: 'CONNECTING',
    });

    syncService.connect(roomId, 'GUEST');
  },

  setPartnerConnected: (connected: boolean) => {
    const prev = get().partnerConnected;
    if (!prev && connected) {
      SyncHaptics.partnerJoined();
    }
    set({
      partnerConnected: connected,
      syncStatus: connected ? 'SYNCED' : 'BUFFERING',
    });
  },

  setPlayback: (isPlaying: boolean, positionMillis: number) => {
    set({ isPlaying, positionMillis });
  },

  setDuration: (durationMillis: number) => {
    set({ durationMillis });
  },

  setSyncStatus: (syncStatus: SyncStatus, driftDeltaMs = 0, latencyMs = 0) => {
    set({ syncStatus, driftDeltaMs, latencyMs });
  },

  setVideo: (videoUrl: string, videoTitle: string) => {
    set({ videoUrl, videoTitle });
  },

  leaveRoom: () => {
    syncService.disconnect();
    set({
      roomId: null,
      role: null,
      partnerConnected: false,
      videoUrl: '',
      videoTitle: '',
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 0,
      driftDeltaMs: 0,
      syncStatus: 'DISCONNECTED',
      latencyMs: 0,
    });
  },
}));
