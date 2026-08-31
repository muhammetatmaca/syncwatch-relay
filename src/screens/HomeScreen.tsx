import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Sparkles,
  KeyRound,
  Play,
  Film,
  Moon,
  Sun,
  ArrowRight,
  Tv,
  Check,
  Radio,
  HardDriveDownload,
  UploadCloud,
  Globe,
  Link,
  HelpCircle,
  Wand2,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useSyncStore } from '../store/useSyncStore';
import { generateRoomCode } from '../utils/codeGenerator';
import { PRESET_VIDEOS, VideoPreset } from '../utils/presets';
import { SyncHaptics } from '../utils/haptics';
import { pickAndUploadVideo } from '../services/videoUploadService';
import { resolveVideoFromUrl } from '../services/videoLinkExtractor';
import { WebVideoBrowserModal } from '../components/WebVideoBrowserModal';
import { VideoLinkGuideModal } from '../components/VideoLinkGuideModal';

interface Props {
  onNavigateToLobby: () => void;
  onNavigateToWatch: () => void;
}

export const HomeScreen: React.FC<Props> = ({ onNavigateToLobby, onNavigateToWatch }) => {
  const { themeMode, toggleTheme, createRoom, joinRoom } = useSyncStore();
  const c = Colors[themeMode];

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [selectedPreset, setSelectedPreset] = useState<VideoPreset>(PRESET_VIDEOS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [useCustomVideo, setUseCustomVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showWebBrowser, setShowWebBrowser] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [resolveFeedback, setResolveFeedback] = useState<string | null>(null);

  const handleSelectTab = (tab: 'create' | 'join') => {
    SyncHaptics.codeKeypress();
    setActiveTab(tab);
  };

  const handleUploadFromGallery = async () => {
    SyncHaptics.playbackToggle();
    setIsUploading(true);
    setUploadStatus('Video seçiliyor...');

    const res = await pickAndUploadVideo((status) => {
      setUploadStatus(status);
    });

    setIsUploading(false);

    if (res.success && res.videoUrl) {
      SyncHaptics.partnerJoined();
      const code = generateRoomCode();
      createRoom(code, res.videoUrl, res.videoTitle || 'Yüklenen Video');
      onNavigateToLobby();
    } else if (res.error && res.error !== 'Canceled') {
      Alert.alert('Yükleme Başarısız', res.error);
    }
  };

  const handleWebVideoSelected = (url: string, title: string) => {
    setUseCustomVideo(true);
    setCustomUrl(url);
    setCustomTitle(title);
    SyncHaptics.partnerJoined();

    const code = generateRoomCode();
    createRoom(code, url, title);
    onNavigateToLobby();
  };

  const handleManualResolveLink = async () => {
    if (!customUrl.trim()) return;
    SyncHaptics.codeKeypress();
    setIsResolvingLink(true);
    setResolveFeedback('Video akışı taranıyor...');

    const result = await resolveVideoFromUrl(customUrl.trim());
    setIsResolvingLink(false);

    if (result.isExtracted) {
      SyncHaptics.partnerJoined();
      setCustomUrl(result.streamUrl);
      if (result.title && !customTitle) {
        setCustomTitle(result.title);
      }
      setResolveFeedback('✅ Doğrudan video akışı başarıyla çözüldü!');
    } else {
      setResolveFeedback('ℹ️ Link hazır.');
    }
  };

  const handleCreateRoom = async () => {
    SyncHaptics.playbackToggle();
    const code = generateRoomCode();

    if (useCustomVideo && customUrl.trim()) {
      setIsResolvingLink(true);
      const extracted = await resolveVideoFromUrl(customUrl.trim());
      setIsResolvingLink(false);

      const finalUrl = extracted.streamUrl;
      const finalTitle = customTitle.trim() || extracted.title || 'Özel Video';

      createRoom(code, finalUrl, finalTitle);
      onNavigateToLobby();
    } else {
      createRoom(code, selectedPreset.url, selectedPreset.title);
      onNavigateToLobby();
    }
  };

  const handleJoinRoom = () => {
    const formatted = joinCodeInput.trim().toUpperCase();
    if (formatted.length < 4) return;
    SyncHaptics.playbackToggle();
    joinRoom(formatted);
    onNavigateToWatch();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: c.surfaceBase }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.brandTitle, { color: c.contentPrimary }]}>SyncWatch</Text>
              <View style={[styles.dotIndicator, { backgroundColor: c.contentPrimary }]} />
              <View style={[styles.dotIndicator, { backgroundColor: c.contentPrimary }]} />
            </View>
            <Text style={[styles.brandSubtitle, { color: c.contentMuted }]}>
              İki Kişilik Senkronize Video İzleme
            </Text>
          </View>

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

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'create' && { backgroundColor: c.contentPrimary },
            ]}
            onPress={() => handleSelectTab('create')}
            activeOpacity={0.8}
          >
            <Sparkles
              size={16}
              color={activeTab === 'create' ? c.contentInverse : c.contentMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'create' ? c.contentInverse : c.contentMuted },
                activeTab === 'create' && { fontWeight: '700' },
              ]}
            >
              Oda Oluştur (Host)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'join' && { backgroundColor: c.contentPrimary },
            ]}
            onPress={() => handleSelectTab('join')}
            activeOpacity={0.8}
          >
            <KeyRound
              size={16}
              color={activeTab === 'join' ? c.contentInverse : c.contentMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'join' ? c.contentInverse : c.contentMuted },
                activeTab === 'join' && { fontWeight: '700' },
              ]}
            >
              Odaya Katıl (Guest)
            </Text>
          </TouchableOpacity>
        </View>

        {/* CREATE ROOM */}
        {activeTab === 'create' ? (
          <View style={styles.section}>
            {/* Quick Action 1: Upload from Phone Gallery */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}
              onPress={handleUploadFromGallery}
              disabled={isUploading}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconBox, { backgroundColor: c.surfaceSubtle }]}>
                {isUploading ? (
                  <ActivityIndicator size="small" color={c.contentPrimary} />
                ) : (
                  <UploadCloud size={20} color={c.contentPrimary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: c.contentPrimary }]}>
                  {isUploading ? uploadStatus : 'Galeriden Kendi Videonu Yükle'}
                </Text>
                <Text style={[styles.featureDesc, { color: c.contentMuted }]}>
                  Telefondan video seç → Buluta aktar → Anında izle
                </Text>
              </View>
              <ArrowRight size={16} color={c.contentMuted} />
            </TouchableOpacity>

            {/* Quick Action 2: Web Video Sniffer / In-App Browser */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle, marginTop: 10 }]}
              onPress={() => {
                SyncHaptics.codeKeypress();
                setShowWebBrowser(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconBox, { backgroundColor: c.surfaceSubtle }]}>
                <Globe size={20} color={c.contentPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: c.contentPrimary }]}>
                  Web Sayfasından Video Yakala
                </Text>
                <Text style={[styles.featureDesc, { color: c.contentMuted }]}>
                  Dilediğin web sitesini aç ve videoyu otomatik algılat
                </Text>
              </View>
              <ArrowRight size={16} color={c.contentMuted} />
            </TouchableOpacity>

            {/* Section: Embedded Videos */}
            <View style={styles.subSectionHeader}>
              <HardDriveDownload size={14} color={c.contentPrimary} />
              <Text style={[styles.sectionTitle, { color: c.contentPrimary }]}>
                Uygulamaya Gömülü Hazır Videolar
              </Text>
            </View>

            <View style={styles.videoList}>
              {PRESET_VIDEOS.map((item) => {
                const isSelected = !useCustomVideo && selectedPreset.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.videoOptionCard,
                      {
                        backgroundColor: c.surfaceCard,
                        borderColor: isSelected ? c.borderFocus : c.borderSubtle,
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                    onPress={() => {
                      SyncHaptics.codeKeypress();
                      setUseCustomVideo(false);
                      setSelectedPreset(item);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[styles.iconBox, { backgroundColor: c.surfaceSubtle }]}>
                        <Film size={16} color={c.contentPrimary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, { color: c.contentPrimary }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.optionDesc, { color: c.contentMuted }]}>
                          {item.description}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.optionRight}>
                      <Text style={[styles.durationText, { color: c.contentMuted }]}>
                        {item.durationLabel}
                      </Text>
                      {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: c.contentPrimary }]}>
                          <Check size={12} color={c.contentInverse} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Link Option with Guide & Auto-Extractor */}
            <TouchableOpacity
              style={[
                styles.videoOptionCard,
                {
                  backgroundColor: c.surfaceCard,
                  borderColor: useCustomVideo ? c.borderFocus : c.borderSubtle,
                  borderWidth: useCustomVideo ? 1.5 : 1,
                  marginTop: 10,
                },
              ]}
              onPress={() => {
                SyncHaptics.codeKeypress();
                setUseCustomVideo(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.surfaceSubtle }]}>
                  <Link size={16} color={c.contentPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: c.contentPrimary }]}>
                    Web Sayfası veya Video Linki Girin
                  </Text>
                  <Text style={[styles.optionDesc, { color: c.contentMuted }]}>
                    Link yapıştırın, video akışını otomatik çekelim
                  </Text>
                </View>
              </View>
              {useCustomVideo && (
                <View style={[styles.checkCircle, { backgroundColor: c.contentPrimary }]}>
                  <Check size={12} color={c.contentInverse} />
                </View>
              )}
            </TouchableOpacity>

            {/* Custom URL Inputs + How-to Guide Button & Auto Sniff */}
            {useCustomVideo && (
              <View style={[styles.customInputBox, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
                <View style={styles.inputHeaderRow}>
                  <Text style={[styles.inputLabel, { color: c.contentMuted }]}>VİDEO VEYA SAYFA BAĞLANTISI</Text>
                  <TouchableOpacity
                    style={[styles.guideHintBtn, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}
                    onPress={() => {
                      SyncHaptics.codeKeypress();
                      setShowGuideModal(true);
                    }}
                  >
                    <HelpCircle size={12} color={c.contentPrimary} />
                    <Text style={[styles.guideHintText, { color: c.contentPrimary }]}>Link Nasıl Alınır?</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.urlInputRow}>
                  <TextInput
                    style={[styles.inputFlex, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle, color: c.contentPrimary }]}
                    placeholder="https://example.com/video.mp4 veya sayfa linki"
                    placeholderTextColor={c.contentMuted}
                    value={customUrl}
                    onChangeText={(t) => {
                      setCustomUrl(t);
                      setResolveFeedback(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {customUrl.trim().length > 0 && (
                    <TouchableOpacity
                      style={[styles.sniffBtn, { backgroundColor: c.contentPrimary }]}
                      onPress={handleManualResolveLink}
                      disabled={isResolvingLink}
                    >
                      {isResolvingLink ? (
                        <ActivityIndicator size="small" color={c.contentInverse} />
                      ) : (
                        <Wand2 size={14} color={c.contentInverse} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {resolveFeedback && (
                  <Text style={[styles.feedbackText, { color: c.contentPrimary }]}>
                    {resolveFeedback}
                  </Text>
                )}

                <Text style={[styles.inputLabel, { color: c.contentMuted, marginTop: 10 }]}>BAŞLIK (İSTEĞE BAĞLI)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle, color: c.contentPrimary }]}
                  placeholder="Örn: Film / Dizi"
                  placeholderTextColor={c.contentMuted}
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />
              </View>
            )}

            {/* Create Room Button */}
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: c.contentPrimary, marginTop: 16 }]}
              onPress={handleCreateRoom}
              disabled={isResolvingLink}
              activeOpacity={0.8}
            >
              {isResolvingLink ? (
                <ActivityIndicator size="small" color={c.contentInverse} />
              ) : (
                <>
                  <Text style={[styles.primaryBtnText, { color: c.contentInverse }]}>
                    Seçili Video ile Odayı Başlat
                  </Text>
                  <ArrowRight size={18} color={c.contentInverse} />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* JOIN ROOM */
          <View style={styles.section}>
            <View style={[styles.joinBox, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
              <Text style={[styles.inputLabel, { color: c.contentMuted }]}>6 HANELİ ODA KODU</Text>
              <TextInput
                style={[
                  styles.codeInput,
                  {
                    backgroundColor: c.surfaceSubtle,
                    borderColor: c.borderStrong,
                    color: c.contentPrimary,
                  },
                ]}
                placeholder="K9-4X2"
                placeholderTextColor={c.contentMuted}
                value={joinCodeInput}
                onChangeText={(text) => {
                  SyncHaptics.codeKeypress();
                  setJoinCodeInput(text.toUpperCase());
                }}
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  {
                    backgroundColor: joinCodeInput.trim().length >= 4 ? c.contentPrimary : c.surfaceSubtle,
                    marginTop: 12,
                  },
                ]}
                disabled={joinCodeInput.trim().length < 4}
                onPress={handleJoinRoom}
                activeOpacity={0.8}
              >
                <Radio
                  size={18}
                  color={joinCodeInput.trim().length >= 4 ? c.contentInverse : c.contentMuted}
                />
                <Text
                  style={[
                    styles.primaryBtnText,
                    {
                      color: joinCodeInput.trim().length >= 4 ? c.contentInverse : c.contentMuted,
                    },
                  ]}
                >
                  Odaya Bağlan ve İzle
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* In-App Web Video Sniffer Modal */}
      <WebVideoBrowserModal
        visible={showWebBrowser}
        onClose={() => setShowWebBrowser(false)}
        onSelectVideo={handleWebVideoSelected}
        themeMode={themeMode}
      />

      {/* In-App Video Link Guide Modal */}
      <VideoLinkGuideModal
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        themeMode={themeMode}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  themeBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  videoList: {
    gap: 8,
  },
  videoOptionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 11,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Regular',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customInputBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  guideHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  guideHintText: {
    fontSize: 10,
    fontWeight: '700',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sniffBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  joinBox: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  codeInput: {
    height: 54,
    borderRadius: 10,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'SpaceMono-Regular',
    letterSpacing: 4,
    marginVertical: 10,
  },
});
