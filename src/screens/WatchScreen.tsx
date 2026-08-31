import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import {
  LogOut,
  Moon,
  Sun,
  Share2,
  Tv,
  Users,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useSyncStore } from '../store/useSyncStore';
import { MinimalVideoPlayer } from '../components/MinimalVideoPlayer';
import { SyncStatusBadge } from '../components/SyncStatusBadge';
import { SyncHaptics } from '../utils/haptics';
import { syncService } from '../services/syncService';
import { SyncMessage } from '../types/sync';

interface Props {
  onLeaveRoom: () => void;
}

export const WatchScreen: React.FC<Props> = ({ onLeaveRoom }) => {
  const {
    roomId,
    role,
    partnerConnected,
    setPartnerConnected,
    videoUrl,
    videoTitle,
    setVideo,
    syncStatus,
    setSyncStatus,
    driftDeltaMs,
    latencyMs,
    themeMode,
    toggleTheme,
    leaveRoom,
  } = useSyncStore();

  const c = Colors[themeMode];

  useEffect(() => {
    // Listen for partner connection events across global cloud
    const unsubscribe = syncService.onMessage((msg: SyncMessage) => {
      if (msg.type === 'JOIN_REQUEST' || msg.type === 'JOIN_ACK' || msg.type === 'PEER_CONNECTED') {
        setPartnerConnected(true);
        if (msg.videoUrl && msg.videoTitle && role === 'GUEST') {
          setVideo(msg.videoUrl, msg.videoTitle);
        }
      } else if (msg.type === 'VIDEO_CHANGE' && role === 'GUEST') {
        if (msg.videoUrl && msg.videoTitle) {
          SyncHaptics.partnerJoined();
          setVideo(msg.videoUrl, msg.videoTitle);
        }
      } else if (msg.type === 'PARTNER_LEFT') {
        setPartnerConnected(false);
        setSyncStatus('DISCONNECTED');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [role, setPartnerConnected, setVideo, setSyncStatus]);

  const handleLeave = () => {
    SyncHaptics.codeKeypress();
    Alert.alert('Odadan Ayrıl', 'Senkronize izleme oturumundan çıkmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Ayrıl',
        style: 'destructive',
        onPress: () => {
          leaveRoom();
          onLeaveRoom();
        },
      },
    ]);
  };

  const handleShareCode = async () => {
    if (!roomId) return;
    SyncHaptics.codeKeypress();
    try {
      await Share.share({
        message: `SyncWatch odamıza katıl: ${roomId}`,
        title: 'SyncWatch Oda Kodu',
      });
    } catch {}
  };

  const handleDriftUpdate = (drift: number, latency: number) => {
    if (drift > 600) {
      setSyncStatus('DRIFTED', drift, latency);
    } else {
      setSyncStatus('SYNCED', drift, latency);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.surfaceBase }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: c.surfaceCard, borderBottomColor: c.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.codeTag, { backgroundColor: c.surfaceSubtle, borderColor: c.borderStrong }]}>
            <Text style={[styles.codeTagText, { color: c.contentPrimary }]}>{roomId}</Text>
          </View>
          <SyncStatusBadge
            status={syncStatus}
            role={role}
            driftMs={driftDeltaMs}
            latencyMs={latencyMs}
            partnerConnected={partnerConnected}
            themeMode={themeMode}
          />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: c.surfaceSubtle }]}
            onPress={() => {
              SyncHaptics.codeKeypress();
              toggleTheme();
            }}
          >
            {themeMode === 'dark' ? (
              <Sun size={16} color={c.contentPrimary} />
            ) : (
              <Moon size={16} color={c.contentPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.leaveBtn, { backgroundColor: c.surfaceSubtle }]}
            onPress={handleLeave}
          >
            <LogOut size={16} color={c.contentPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Video Viewport */}
      {videoUrl ? (
        <MinimalVideoPlayer
          videoUrl={videoUrl}
          videoTitle={videoTitle}
          role={role}
          roomId={roomId || ''}
          themeMode={themeMode}
          onSyncDriftUpdate={handleDriftUpdate}
        />
      ) : (
        <View style={styles.noVideoBox}>
          <Tv size={36} color={c.contentMuted} />
          <Text style={[styles.noVideoText, { color: c.contentMuted }]}>
            Video bağlantısı yükleniyor...
          </Text>
        </View>
      )}

      {/* Scrollable Information Deck */}
      <ScrollView contentContainerStyle={styles.deckContent} showsVerticalScrollIndicator={false}>
        {/* Stream Info Card */}
        <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
          <Text style={[styles.cardLabel, { color: c.contentMuted }]}>ŞU AN İZLENİYOR</Text>
          <Text style={[styles.streamTitle, { color: c.contentPrimary }]}>{videoTitle}</Text>
        </View>

        {/* Sync Status Card */}
        <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
          <View style={styles.roleHeader}>
            <Users size={16} color={c.contentPrimary} />
            <Text style={[styles.cardLabel, { color: c.contentMuted }]}>SENKRONİZASYON</Text>
          </View>

          <Text style={[styles.roleDesc, { color: c.contentMuted }]}>
            {role === 'HOST'
              ? 'Yönetici modundasınız. Oynattığınızda veya duraklattığınızda partnerinizin ekranı anında eşitlenir.'
              : 'Misafir modundasınız. Oynatıcı yöneticiyle tam senkronizedir.'}
          </Text>

          {/* Quick Share Code */}
          <TouchableOpacity
            style={[styles.shareBar, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}
            onPress={handleShareCode}
            activeOpacity={0.7}
          >
            <Share2 size={16} color={c.contentPrimary} />
            <Text style={[styles.shareBarText, { color: c.contentPrimary }]}>
              Oda Kodunu ({roomId}) Paylaş
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  codeTagText: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
  },
  leaveBtn: {
    padding: 8,
    borderRadius: 8,
  },
  noVideoBox: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  noVideoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deckContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  roleDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  shareBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  shareBarText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
