import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  Sparkles,
  KeyRound,
  UploadCloud,
  Globe,
  Play,
  Pause,
  ArrowRight,
  Check,
  Film,
  Copy,
  Radio,
  Tv,
  RotateCw,
  Search,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useSyncStore } from '../store/useSyncStore';
import { SyncHaptics } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onFinish }) => {
  const { themeMode } = useSyncStore();
  const c = Colors[themeMode];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides = [
    {
      id: '1',
      badge: 'BİRLİKTE İZLEME',
      title: 'Aynı Ekran,\nAyrı Şehirler',
      description:
        'Biri İstanbul’da, biri Ankara’da olsa bile milisaniyelik hassasiyetle aynı videoyu eşzamanlı izleyin.',
      mockupType: 'sync_hud',
    },
    {
      id: '2',
      badge: 'GÜVENLİ ODALAR',
      title: '6 Haneli Kodla\nAnında Eşleşin',
      description:
        'Odanızı tek tıkla kurup kodu partnerinize gönderin. İkinci kişi odaya girdiği an oda dışarıya kilitlenir.',
      mockupType: 'room_code',
    },
    {
      id: '3',
      badge: 'GALERİDEN YÜKLEME',
      title: 'Kendi Videonu\nGaleriden Seç',
      description:
        'Telefonundaki video ve anılarını doğrudan seçip yükle; uygulama otomatik buluta aktarır ve odayı başlatır.',
      mockupType: 'uploader',
    },
    {
      id: '4',
      badge: 'WEB VİDEO DEDEKTÖRÜ',
      title: 'Web Sitelerinden\nVideo Yakala',
      description:
        'Dahili tarayıcı ile film ve dizi sitelerine girin. Sayfada video başladığında tek tıkla odaya aktarın.',
      mockupType: 'web_sniffer',
    },
    {
      id: '5',
      badge: 'ORTAK KONTROL',
      title: 'Sen Durdur,\nOnda da Dursun',
      description:
        'Oynat, duraklat veya 10 saniye ileri sar. Her kontrol iki telefonda aynı anda hissedilir.',
      mockupType: 'video_player',
    },
  ];

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slideIndex !== currentIndex && slideIndex >= 0 && slideIndex < slides.length) {
      SyncHaptics.codeKeypress();
      setCurrentIndex(slideIndex);
    }
  };

  const handleNext = () => {
    SyncHaptics.playbackToggle();
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onFinish();
    }
  };

  // Render Visual In-App Simulated Screenshots (UI Mockups)
  const renderMockup = (type: string) => {
    switch (type) {
      case 'sync_hud':
        return (
          <View style={[styles.mockupCard, { backgroundColor: c.surfaceCard, borderColor: c.borderStrong }]}>
            <View style={styles.hudRow}>
              <View style={[styles.statusPill, { backgroundColor: c.surfaceSubtle }]}>
                <View style={[styles.onlineDot, { backgroundColor: c.contentPrimary }]} />
                <Text style={[styles.statusText, { color: c.contentPrimary }]}>CANLI EŞLEŞME</Text>
              </View>
              <Text style={[styles.monoPill, { color: c.contentPrimary }]}>0 ms Gecikme</Text>
            </View>

            <View style={styles.phonesPreview}>
              <View style={[styles.miniPhone, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                <Text style={[styles.phoneCity, { color: c.contentMuted }]}>İSTANBUL</Text>
                <Tv size={28} color={c.contentPrimary} />
                <Text style={[styles.phoneStatus, { color: c.contentPrimary }]}>00:14:22</Text>
              </View>

              <View style={styles.syncWaveBox}>
                <Radio size={20} color={c.accent} />
                <Text style={[styles.syncWaveText, { color: c.contentMuted }]}>P2P</Text>
              </View>

              <View style={[styles.miniPhone, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                <Text style={[styles.phoneCity, { color: c.contentMuted }]}>ANKARA</Text>
                <Tv size={28} color={c.contentPrimary} />
                <Text style={[styles.phoneStatus, { color: c.contentPrimary }]}>00:14:22</Text>
              </View>
            </View>
          </View>
        );

      case 'room_code':
        return (
          <View style={[styles.mockupCard, { backgroundColor: c.surfaceCard, borderColor: c.borderStrong }]}>
            <Text style={[styles.mockupLabel, { color: c.contentMuted }]}>ÖZEL ODA KODU</Text>
            <View style={[styles.codeDisplayBox, { backgroundColor: c.surfaceSubtle, borderColor: c.borderStrong }]}>
              <Text style={[styles.codeText, { color: c.contentPrimary }]}>K9 - 4X2</Text>
            </View>

            <View style={styles.mockupBtnRow}>
              <View style={[styles.miniActionBtn, { backgroundColor: c.contentPrimary }]}>
                <Copy size={13} color={c.contentInverse} />
                <Text style={[styles.miniActionText, { color: c.contentInverse }]}>Kodu Kopyala</Text>
              </View>
              <View style={[styles.miniActionBtn, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle, borderWidth: 1 }]}>
                <ShieldCheck size={13} color={c.contentPrimary} />
                <Text style={[styles.miniActionText, { color: c.contentPrimary }]}>2 Kişi Kilidi</Text>
              </View>
            </View>
          </View>
        );

      case 'uploader':
        return (
          <View style={[styles.mockupCard, { backgroundColor: c.surfaceCard, borderColor: c.borderStrong }]}>
            <View style={[styles.uploaderCircle, { backgroundColor: c.surfaceSubtle }]}>
              <UploadCloud size={32} color={c.contentPrimary} />
            </View>
            <Text style={[styles.uploaderTitle, { color: c.contentPrimary }]}>tatil_videosu.mp4</Text>

            <View style={[styles.progressTrack, { backgroundColor: c.surfaceSubtle }]}>
              <View style={[styles.progressBar, { width: '100%', backgroundColor: c.contentPrimary }]} />
            </View>

            <View style={styles.uploaderStatusRow}>
              <Text style={[styles.uploaderStatusText, { color: c.contentPrimary }]}>✅ Buluta Yüklendi & Oda Hazır</Text>
            </View>
          </View>
        );

      case 'web_sniffer':
        return (
          <View style={[styles.mockupCard, { backgroundColor: c.surfaceCard, borderColor: c.borderStrong }]}>
            <View style={[styles.browserBar, { backgroundColor: c.surfaceSubtle }]}>
              <Search size={12} color={c.contentMuted} />
              <Text style={[styles.browserUrl, { color: c.contentPrimary }]}>filmdizisitesi.com/film-izle</Text>
            </View>

            <View style={[styles.videoViewportMock, { backgroundColor: '#000' }]}>
              <Film size={28} color="#fff" style={{ opacity: 0.7 }} />
            </View>

            <View style={[styles.detectedFloatingBadge, { backgroundColor: c.contentPrimary }]}>
              <Check size={14} color={c.contentInverse} />
              <Text style={[styles.detectedBadgeText, { color: c.contentInverse }]}>
                🎬 Video Bulundu: Odaya Aktar
              </Text>
            </View>
          </View>
        );

      case 'video_player':
        return (
          <View style={[styles.mockupCard, { backgroundColor: c.surfaceCard, borderColor: c.borderStrong }]}>
            <View style={[styles.playerMockScreen, { backgroundColor: '#000' }]}>
              <View style={[styles.playCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Play size={24} color="#ffffff" style={{ marginLeft: 2 }} />
              </View>

              <View style={styles.playerHudOverlay}>
                <Text style={styles.timecodeMono}>00:24 / 00:46</Text>
                <View style={[styles.liveSyncBadge, { backgroundColor: c.contentPrimary }]}>
                  <Text style={[styles.liveSyncBadgeText, { color: c.contentInverse }]}>EŞZAMANLI</Text>
                </View>
              </View>
            </View>

            <View style={[styles.scrubberMock, { backgroundColor: c.surfaceSubtle }]}>
              <View style={[styles.scrubberFill, { width: '52%', backgroundColor: c.accent }]} />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.surfaceBase }]}>
      {/* Top Header with Skip Button */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Text style={[styles.brandLogo, { color: c.contentPrimary }]}>SyncWatch</Text>
          <View style={[styles.brandDot, { backgroundColor: c.contentPrimary }]} />
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
          <Text style={[styles.skipText, { color: c.contentMuted }]}>Geç</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {/* Visual Screenshot Mockup Card */}
            <View style={styles.mockupContainer}>{renderMockup(item.mockupType)}</View>

            {/* Slide Text Content */}
            <View style={styles.textContainer}>
              <View style={[styles.badgePill, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
                <Sparkles size={11} color={c.contentPrimary} />
                <Text style={[styles.badgeText, { color: c.contentPrimary }]}>{item.badge}</Text>
              </View>

              <Text style={[styles.title, { color: c.contentPrimary }]}>{item.title}</Text>
              <Text style={[styles.description, { color: c.contentMuted }]}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls Bar */}
      <View style={styles.bottomBar}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? c.contentPrimary : c.surfaceSubtle },
                i === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: c.contentPrimary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          {currentIndex === slides.length - 1 ? (
            <>
              <Text style={[styles.nextBtnText, { color: c.contentInverse }]}>Hemen Başla</Text>
              <CheckCircle2 size={18} color={c.contentInverse} />
            </>
          ) : (
            <>
              <Text style={[styles.nextBtnText, { color: c.contentInverse }]}>İleri</Text>
              <ArrowRight size={18} color={c.contentInverse} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandLogo: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  mockupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  mockupCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignItems: 'center',
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  monoPill: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '700',
  },
  phonesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  },
  miniPhone: {
    flex: 1,
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  phoneCity: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  phoneStatus: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '600',
  },
  syncWaveBox: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  syncWaveText: {
    fontSize: 10,
    fontWeight: '800',
  },
  mockupLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeDisplayBox: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 14,
  },
  codeText: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'SpaceMono-Regular',
    letterSpacing: 4,
  },
  mockupBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  miniActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 8,
  },
  miniActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  uploaderCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
  },
  uploaderStatusRow: {
    alignItems: 'center',
  },
  uploaderStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  browserBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  browserUrl: {
    fontSize: 11,
    fontWeight: '600',
  },
  videoViewportMock: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detectedFloatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 10,
  },
  detectedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  playerMockScreen: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerHudOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timecodeMono: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '600',
  },
  liveSyncBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveSyncBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scrubberMock: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  scrubberFill: {
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
