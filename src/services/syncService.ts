import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { SyncMessage, UserRole } from '../types/sync';

type MessageHandler = (message: SyncMessage) => void;
type ConnectionHandler = (connected: boolean) => void;

// Live User Supabase Realtime Cluster (Zero-Sleep, Instant 0s Connect)
const SUPABASE_URL = 'https://nddizymprqucfrijvhez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kZGl6eW1wcnF1Y2ZyaWp2aGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzI1OTQsImV4cCI6MjEwMzc0ODU5NH0.LlCKPJR4J_99RcFvjeG_HAz4ww-y13VcKxrsXdrQbIU';

// Render High-Capacity WSS Relay URL (Will be user's deployed onrender.com URL)
const RENDER_HTTP_URL = 'https://syncwatch-relay.onrender.com';
const RENDER_WSS_URL = 'wss://syncwatch-relay.onrender.com';

/**
 * Hybrid Sync Engine:
 * 1. Supabase Realtime: Instant 0s connection (handles cold start while Render wakes up).
 * 2. Render WSS Server: High-capacity relay that takes over once awake (bypasses 200 CCU limits).
 */
class HybridSyncService {
  private supabase: SupabaseClient | null = null;
  private realtimeChannel: RealtimeChannel | null = null;
  private wssSocket: WebSocket | null = null;

  private currentRoomId: string | null = null;
  private role: UserRole = null;
  private messageListeners: Set<MessageHandler> = new Set();
  private connectionListeners: Set<ConnectionHandler> = new Set();
  private heartbeatTimer: any = null;
  private isConnected: boolean = false;
  private isWssActive: boolean = false;

  constructor() {
    try {
      this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        realtime: { params: { eventsPerSecond: 20 } },
      });
    } catch (e) {
      console.warn('[SyncService] Supabase init warning:', e);
    }
  }

  public connect(roomId: string, role: 'HOST' | 'GUEST') {
    this.disconnect();
    this.currentRoomId = roomId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.role = role;

    console.log(`[HybridSync] Connecting to room ${this.currentRoomId} as ${role}...`);

    // 1. Instantly Connect via Zero-Sleep Supabase Realtime Channel
    this.connectSupabaseChannel();

    // 2. Trigger Render Backend Wake-up & Connect WSS
    this.wakeAndConnectRenderWss();
  }

  /**
   * 1. Instant 0s Supabase Realtime Channel
   */
  private connectSupabaseChannel() {
    if (!this.supabase || !this.currentRoomId) return;

    const channelName = `syncwatch_${this.currentRoomId}`;
    this.realtimeChannel = this.supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    this.realtimeChannel
      .on('broadcast', { event: 'sync_event' }, (payload) => {
        if (payload && payload.payload) {
          this.notifyMessage(payload.payload as SyncMessage);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Supabase] ✅ Instant channel subscribed: ${channelName}`);
          this.isConnected = true;
          this.notifyConnection(true);

          if (this.role === 'GUEST') {
            this.sendMessage({
              type: 'JOIN_REQUEST',
              roomId: this.currentRoomId!,
              senderRole: 'GUEST',
              timestamp: Date.now(),
              positionMillis: 0,
              isPlaying: false,
            });
          }
        }
      });
  }

  /**
   * 2. Background Wake-up Ping for Render WSS & Auto-Switch
   */
  private async wakeAndConnectRenderWss() {
    if (!this.currentRoomId) return;

    try {
      // Send HTTP wake-up ping to Render /health
      fetch(`${RENDER_HTTP_URL}/health`, { method: 'GET' })
        .then((res) => {
          if (res.ok) {
            console.log('[Render WSS] Server is awake! Establishing WSS socket...');
            this.initWssSocket();
          }
        })
        .catch(() => {
          // Render is sleeping or offline, Supabase is handling traffic
          console.log('[Render WSS] Server is waking up; Supabase handling traffic seamlessly.');
        });
    } catch (e) {
      console.log('[Render WSS] Ping failed, continuing with Supabase.');
    }
  }

  private initWssSocket() {
    if (!this.currentRoomId || this.isWssActive) return;

    try {
      this.wssSocket = new WebSocket(RENDER_WSS_URL);

      this.wssSocket.onopen = () => {
        console.log(`[Render WSS] ✅ High-capacity WSS connected for room: ${this.currentRoomId}`);
        this.isWssActive = true;
        this.wssSocket?.send(
          JSON.stringify({
            type: 'REGISTER',
            roomId: this.currentRoomId,
            role: this.role,
          })
        );

        // Disconnect from Supabase after smooth handover to free up the 200 CCU slot
        setTimeout(() => {
          if (this.isWssActive && this.realtimeChannel) {
            console.log('[Handover] ✅ Render WSS fully active. Releasing Supabase connection slot.');
            this.realtimeChannel.unsubscribe();
            this.realtimeChannel = null;
          }
        }, 2000);
      };

      this.wssSocket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.notifyMessage(msg);
        } catch {}
      };

      this.wssSocket.onerror = () => {
        console.warn('[Render WSS] Connection issue, failing over back to Supabase...');
        this.isWssActive = false;
        if (!this.realtimeChannel && this.currentRoomId) {
          this.connectSupabaseChannel();
        }
      };

      this.wssSocket.onclose = () => {
        console.log('[Render WSS] Connection closed, re-engaging Supabase channel if needed...');
        this.isWssActive = false;
        if (!this.realtimeChannel && this.currentRoomId) {
          this.connectSupabaseChannel();
        }
      };
    } catch (err) {
      this.isWssActive = false;
    }
  }

  /**
   * Send Play / Pause / Seek / Heartbeat
   * Dispatches via active channel (WSS if awake, otherwise Supabase Broadcast)
   */
  public sendMessage(message: SyncMessage) {
    // If WSS is awake and active, send through WSS
    if (this.isWssActive && this.wssSocket?.readyState === WebSocket.OPEN) {
      this.wssSocket.send(JSON.stringify(message));
      return;
    }

    // Otherwise dispatch through instant Supabase broadcast
    if (this.realtimeChannel) {
      this.realtimeChannel.send({
        type: 'broadcast',
        event: 'sync_event',
        payload: message,
      });
    }
  }

  /**
   * Periodic Host Heartbeat
   */
  public startHostHeartbeat(
    getPosition: () => {
      positionMillis: number;
      isPlaying: boolean;
      videoUrl: string;
      videoTitle: string;
    }
  ) {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (!this.currentRoomId || this.role !== 'HOST') return;
      const { positionMillis, isPlaying, videoUrl, videoTitle } = getPosition();

      this.sendMessage({
        type: 'HEARTBEAT',
        roomId: this.currentRoomId,
        senderRole: 'HOST',
        timestamp: Date.now(),
        positionMillis,
        isPlaying,
        videoUrl,
        videoTitle,
      });
    }, 1500);
  }

  public stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public onMessage(handler: MessageHandler) {
    this.messageListeners.add(handler);
    return () => this.messageListeners.delete(handler);
  }

  public onConnectionChange(handler: ConnectionHandler) {
    this.connectionListeners.add(handler);
    return () => this.connectionListeners.delete(handler);
  }

  private notifyMessage(msg: SyncMessage) {
    this.messageListeners.forEach((handler) => handler(msg));
  }

  private notifyConnection(connected: boolean) {
    this.connectionListeners.forEach((handler) => handler(connected));
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
      this.realtimeChannel = null;
    }
    if (this.wssSocket) {
      this.wssSocket.close();
      this.wssSocket = null;
    }
    this.isWssActive = false;
    this.isConnected = false;
    this.currentRoomId = null;
  }
}

export const syncService = new HybridSyncService();
