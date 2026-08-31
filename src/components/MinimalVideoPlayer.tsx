import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { UserRole, SyncMessage } from '../types/sync';
import { syncService } from '../services/syncService';
import { SyncHaptics } from '../utils/haptics';
import { formatTimecode } from '../utils/codeGenerator';
import { resolveVideoSource } from '../utils/presets';

interface Props {
  videoUrl: string;
  videoTitle: string;
  role: UserRole;
  roomId: string;
  themeMode?: 'dark' | 'light';
  onSyncDriftUpdate?: (driftMs: number, latencyMs: number) => void;
}

export const MinimalVideoPlayer: React.FC<Props> = ({
  videoUrl,
  videoTitle,
  role,
  roomId,
  themeMode = 'dark',
  onSyncDriftUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const controlsTimeoutRef = useRef<any>(null);

  const videoSource = resolveVideoSource(videoUrl);
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.muted = isMuted;
  });

  const c = Colors[themeMode];

  // Auto-hide controls after 4 seconds of active playback
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 4000);
  }, [isPlaying]);

  const toggleControls = () => {
    if (showControls && isPlaying) {
      setShowControls(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      resetControlsTimer();
    }
  };

  // Status and time polling
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      try {
        if (player) {
          const curTime = player.currentTime || 0;
          const dur = player.duration || 0;
          const playing = Boolean(player.playing);
          const muted = Boolean(player.muted);
          const status = player.status;

          setCurrentTimeSec(curTime);
          if (dur > 0) {
            setDurationSec(dur);
          }
          setIsPlaying(playing);
          setIsMuted(muted);
          setIsBuffering(status === 'loading');
        }
      } catch (err) {
        console.warn('[VideoPlayer] Polling error:', err);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [player]);

  // Host sends periodic heartbeat
  useEffect(() => {
    if (role === 'HOST') {
      syncService.startHostHeartbeat(() => ({
        positionMillis: Math.round(currentTimeSec * 1000),
        isPlaying,
        videoUrl,
        videoTitle,
      }));
    }
    return () => {
      syncService.stopHeartbeat();
    };
  }, [role, currentTimeSec, isPlaying, videoUrl, videoTitle]);

  // Handle incoming real-time sync messages from partner across global cloud
  useEffect(() => {
    const unsubscribe = syncService.onMessage(async (msg: SyncMessage) => {
      const now = Date.now();
      const latency = Math.max(0, now - msg.timestamp);

      if (role === 'GUEST') {
        const targetSec = (msg.positionMillis || 0) / 1000;

        if (msg.type === 'PLAY') {
          SyncHaptics.playbackToggle();
          if (player) {
            player.currentTime = targetSec;
            player.play();
          }
          setIsPlaying(true);
        } else if (msg.type === 'PAUSE') {
          SyncHaptics.playbackToggle();
          if (player) {
            player.pause();
            player.currentTime = targetSec;
          }
          setIsPlaying(false);
        } else if (msg.type === 'SEEK') {
          SyncHaptics.scrubTick();
          if (player) {
            player.currentTime = targetSec;
          }
        } else if (msg.type === 'HEARTBEAT') {
          const estimatedHostSec = msg.isPlaying
            ? targetSec + latency / 1000
            : targetSec;
          const driftMs = Math.abs((currentTimeSec - estimatedHostSec) * 1000);

          if (onSyncDriftUpdate) {
            onSyncDriftUpdate(driftMs, latency);
          }

          // If drift exceeds 600ms, auto-align Guest timeline
          if (driftMs > 600 && player) {
            player.currentTime = estimatedHostSec;
          }

          // Match playback state
          if (msg.isPlaying && !player?.playing) {
            player?.play();
            setIsPlaying(true);
          } else if (!msg.isPlaying && player?.playing) {
            player?.pause();
            setIsPlaying(false);
          }
        }
      } else if (role === 'HOST') {
        if (msg.type === 'JOIN_REQUEST') {
          SyncHaptics.partnerJoined();
          syncService.sendMessage({
            type: 'JOIN_ACK',
            roomId,
            senderRole: 'HOST',
            timestamp: Date.now(),
            positionMillis: Math.round(currentTimeSec * 1000),
            isPlaying,
            videoUrl,
            videoTitle,
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [role, roomId, currentTimeSec, isPlaying, videoUrl, videoTitle, player, onSyncDriftUpdate]);

  // Host Action: Toggle Play/Pause
  const handleTogglePlayPause = () => {
    if (role !== 'HOST' || !player) return;
    SyncHaptics.playbackToggle();
    resetControlsTimer();

    try {
      if (player.playing) {
        player.pause();
        syncService.sendMessage({
          type: 'PAUSE',
          roomId,
          senderRole: 'HOST',
          timestamp: Date.now(),
          positionMillis: Math.round((player.currentTime || 0) * 1000),
          isPlaying: false,
        });
        setIsPlaying(false);
      } else {
        player.play();
        syncService.sendMessage({
          type: 'PLAY',
          roomId,
          senderRole: 'HOST',
          timestamp: Date.now(),
          positionMillis: Math.round((player.currentTime || 0) * 1000),
          isPlaying: true,
        });
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('[VideoPlayer] Toggle play error:', e);
    }
  };

  // Host Action: Seek Relative (-10s / +10s)
  const handleSeekRelative = (deltaSeconds: number) => {
    if (role !== 'HOST' || !player) return;
    SyncHaptics.scrubTick();
    resetControlsTimer();
    const maxDur = durationSec > 0 ? durationSec : 3600;
    const newPos = Math.max(0, Math.min(maxDur, (player.currentTime || 0) + deltaSeconds));
    player.currentTime = newPos;
    syncService.sendMessage({
      type: 'SEEK',
      roomId,
      senderRole: 'HOST',
      timestamp: Date.now(),
      positionMillis: Math.round(newPos * 1000),
      isPlaying: player.playing,
    });
  };

  // Scrubber Click
  const handleScrubberPress = (event: any) => {
    if (role !== 'HOST' || !player) return;
    const { locationX } = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width - 40;
    const percentage = Math.max(0, Math.min(1, locationX / screenWidth));
    const targetSec = percentage * (durationSec > 0 ? durationSec : 100);

    SyncHaptics.scrubTick();
    player.currentTime = targetSec;
    syncService.sendMessage({
      type: 'SEEK',
      roomId,
      senderRole: 'HOST',
      timestamp: Date.now(),
      positionMillis: Math.round(targetSec * 1000),
      isPlaying: player.playing,
    });
  };

  // Guest Action: Force Resync
  const handleForceResync = () => {
    SyncHaptics.playbackToggle();
    syncService.sendMessage({
      type: 'JOIN_REQUEST',
      roomId,
      senderRole: 'GUEST',
      timestamp: Date.now(),
      positionMillis: 0,
      isPlaying: false,
    });
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!player) return;
    SyncHaptics.codeKeypress();
    const newMuted = !player.muted;
    player.muted = newMuted;
    setIsMuted(newMuted);
  };

  const progressPercent = durationSec > 0 ? (currentTimeSec / durationSec) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: c.surfaceBase }]}>
      <TouchableWithoutFeedback onPress={toggleControls}>
        <View style={styles.videoWrapper}>
          <VideoView
            player={player}
            style={styles.video}
            allowsPictureInPicture
            contentFit="contain"
            nativeControls={false}
          />

          {/* Buffering Indicator */}
          {isBuffering && (
            <View style={styles.bufferingBox}>
              <ActivityIndicator size="large" color={c.accent} />
            </View>
          )}

          {/* Overlay Controls */}
          {showControls && (
            <View style={styles.overlayControls}>
              {/* Header Title */}
              <View style={styles.topBar}>
                <Text style={[styles.videoTitleText, { color: c.contentPrimary }]} numberOfLines={1}>
                  {videoTitle}
                </Text>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: c.surfaceSubtle }]}
                  onPress={handleToggleMute}
                >
                  {isMuted ? (
                    <VolumeX size={18} color={c.contentPrimary} />
                  ) : (
                    <Volume2 size={18} color={c.contentPrimary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Center Play/Pause Controls */}
              <View style={styles.centerControls}>
                {role === 'HOST' ? (
                  <View style={styles.hostButtonGroup}>
                    <TouchableOpacity
                      style={[styles.circleButton, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}
                      onPress={() => handleSeekRelative(-10)}
                    >
                      <RotateCcw size={20} color={c.contentPrimary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.playButton, { backgroundColor: c.contentPrimary }]}
                      onPress={handleTogglePlayPause}
                    >
                      {isPlaying ? (
                        <Pause size={28} color={c.contentInverse} />
                      ) : (
                        <Play size={28} color={c.contentInverse} style={{ marginLeft: 3 }} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.circleButton, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}
                      onPress={() => handleSeekRelative(10)}
                    >
                      <RotateCw size={20} color={c.contentPrimary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.guestSyncBox, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
                    <ShieldCheck size={20} color={c.contentPrimary} />
                    <Text style={[styles.guestSyncText, { color: c.contentPrimary }]}>
                      Yönetici ile Senkronize
                    </Text>
                  </View>
                )}
              </View>

              {/* Bottom Controls Bar */}
              <View style={styles.bottomBar}>
                <Text style={[styles.timeText, { color: c.contentMuted }]}>
                  {formatTimecode(currentTimeSec * 1000)} / {durationSec > 0 ? formatTimecode(durationSec * 1000) : '--:--'}
                </Text>

                <View style={styles.rightBottomIcons}>
                  {role === 'GUEST' && (
                    <TouchableOpacity
                      style={[styles.resyncBtn, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}
                      onPress={handleForceResync}
                    >
                      <RefreshCw size={13} color={c.contentPrimary} />
                      <Text style={[styles.resyncText, { color: c.contentPrimary }]}>Yeniden Eşitle</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Scrubber Timeline Bar */}
      <TouchableWithoutFeedback onPress={handleScrubberPress}>
        <View style={[styles.scrubberContainer, { backgroundColor: c.surfaceSubtle }]}>
          <View
            style={[
              styles.scrubberProgress,
              { width: `${progressPercent}%`, backgroundColor: c.accent },
            ]}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  videoWrapper: {
    width: '100%',
    height: 230,
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'space-between',
    padding: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoTitleText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerControls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  guestSyncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  guestSyncText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '600',
  },
  rightBottomIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  resyncText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrubberContainer: {
    width: '100%',
    height: 6,
    position: 'relative',
  },
  scrubberProgress: {
    height: '100%',
  },
});
