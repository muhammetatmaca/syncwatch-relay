import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Tv,
  CheckCircle2,
  Users,
  Play,
  Moon,
  Sun,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useSyncStore } from '../store/useSyncStore';
import { CodeDisplayCard } from '../components/CodeDisplayCard';
import { SyncHaptics } from '../utils/haptics';
import { syncService } from '../services/syncService';
import { SyncMessage } from '../types/sync';

interface Props {
  onBack: () => void;
  onEnterWatchRoom: () => void;
}

export const LobbyScreen: React.FC<Props> = ({ onBack, onEnterWatchRoom }) => {
  const {
    roomId,
    videoTitle,
    videoUrl,
    partnerConnected,
    setPartnerConnected,
    themeMode,
    toggleTheme,
    leaveRoom,
  } = useSyncStore();

  const c = Colors[themeMode];

  useEffect(() => {
    // Listen for partner connection events
    const unsubscribe = syncService.onMessage((msg: SyncMessage) => {
      if (msg.type === 'JOIN_REQUEST' || msg.type === 'JOIN_ACK' || msg.type === 'PEER_CONNECTED') {
        setPartnerConnected(true);
        if (msg.type === 'JOIN_REQUEST' && roomId) {
          syncService.sendMessage({
            type: 'JOIN_ACK',
            roomId,
            senderRole: 'HOST',
            timestamp: Date.now(),
            positionMillis: 0,
            isPlaying: false,
            videoUrl,
            videoTitle,
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setPartnerConnected]);

  const handleCancel = () => {
    SyncHaptics.codeKeypress();
    leaveRoom();
    onBack();
  };

  const handleProceed = () => {
    SyncHaptics.playbackToggle();
    onEnterWatchRoom();
  };

  return (
    <View style={[styles.container, { backgroundColor: c.surfaceBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}
          onPress={handleCancel}
        >
          <ArrowLeft size={18} color={c.contentPrimary} />
          <Text style={[styles.backText, { color: c.contentPrimary }]}>Vazgeç</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}
          onPress={() => {
            SyncHaptics.codeKeypress();
            toggleTheme();
          }}
        >
          {themeMode === 'dark' ? (
            <Sun size={18} color={c.contentPrimary} />
          ) : (
            <Moon size={18} color={c.contentPrimary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: c.contentPrimary }]}>Oda Hazırlandı</Text>
          <Text style={[styles.subtitle, { color: c.contentMuted }]}>
            Partneriniz aşağıdaki kodu girdiğinde eşzamanlı izleme aktif olacaktır.
          </Text>
        </View>

        {/* Code Display Card */}
        {roomId && <CodeDisplayCard code={roomId} themeMode={themeMode} />}

        {/* Partner Connection Status Banner */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: partnerConnected ? c.contentPrimary : c.surfaceCard,
              borderColor: partnerConnected ? c.contentPrimary : c.borderSubtle,
            },
          ]}
        >
          {partnerConnected ? (
            <>
              <CheckCircle2 size={20} color={c.contentInverse} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusBannerTitle, { color: c.contentInverse }]}>
                  Partner Bağlandı!
                </Text>
                <Text style={[styles.statusBannerDesc, { color: c.contentInverse, opacity: 0.8 }]}>
                  Oynatıcılar senkronize edilmeye hazır.
                </Text>
              </View>
            </>
          ) : (
            <>
              <ActivityIndicator size="small" color={c.contentPrimary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusBannerTitle, { color: c.contentPrimary }]}>
                  Partner Bekleniyor...
                </Text>
                <Text style={[styles.statusBannerDesc, { color: c.contentMuted }]}>
                  Kodu paylaştığınız kişinin bağlanması bekleniyor.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Selected Video Card */}
        <View style={[styles.videoCard, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
          <View style={styles.videoHeader}>
            <Tv size={16} color={c.contentPrimary} />
            <Text style={[styles.videoCardLabel, { color: c.contentMuted }]}>SEÇİLİ VİDEO</Text>
          </View>
          <Text style={[styles.videoTitle, { color: c.contentPrimary }]}>{videoTitle}</Text>
          <Text style={[styles.videoUrl, { color: c.contentMuted }]} numberOfLines={1}>
            {videoUrl}
          </Text>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[styles.proceedBtn, { backgroundColor: c.contentPrimary }]}
          onPress={handleProceed}
          activeOpacity={0.8}
        >
          <Play size={18} color={c.contentInverse} />
          <Text style={[styles.proceedBtnText, { color: c.contentInverse }]}>
            {partnerConnected ? 'Senkronize Odaya Başla' : 'İzleme Odasına Geç'}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  titleSection: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBannerDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  videoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  videoCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  videoUrl: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Regular',
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 12,
  },
  proceedBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
