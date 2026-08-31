import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  X,
  Smartphone,
  Monitor,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { SyncHaptics } from '../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  themeMode?: 'dark' | 'light';
}

export const VideoLinkGuideModal: React.FC<Props> = ({
  visible,
  onClose,
  themeMode = 'dark',
}) => {
  const c = Colors[themeMode];
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');

  const handleSwitchTab = (tab: 'mobile' | 'desktop') => {
    SyncHaptics.codeKeypress();
    setActiveTab(tab);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: c.surfaceCard, borderColor: c.borderStrong }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <HelpCircle size={18} color={c.contentPrimary} />
              <Text style={[styles.headerTitle, { color: c.contentPrimary }]}>
                Video Linki Nasıl Alınır?
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={c.contentPrimary} />
            </TouchableOpacity>
          </View>

          {/* Platform Tab Selector */}
          <View style={[styles.tabRow, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'mobile' && { backgroundColor: c.contentPrimary },
              ]}
              onPress={() => handleSwitchTab('mobile')}
            >
              <Smartphone
                size={14}
                color={activeTab === 'mobile' ? c.contentInverse : c.contentMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'mobile' ? c.contentInverse : c.contentMuted },
                  activeTab === 'mobile' && { fontWeight: '700' },
                ]}
              >
                Telefonda (Android / iOS)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'desktop' && { backgroundColor: c.contentPrimary },
              ]}
              onPress={() => handleSwitchTab('desktop')}
            >
              <Monitor
                size={14}
                color={activeTab === 'desktop' ? c.contentInverse : c.contentMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'desktop' ? c.contentInverse : c.contentMuted },
                  activeTab === 'desktop' && { fontWeight: '700' },
                ]}
              >
                Bilgisayarda (PC / Mac)
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {activeTab === 'mobile' ? (
              /* MOBILE GUIDE */
              <View style={styles.stepsContainer}>
                <View style={[styles.stepItem, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                  <View style={[styles.stepNum, { backgroundColor: c.contentPrimary }]}>
                    <Text style={[styles.stepNumText, { color: c.contentInverse }]}>1</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: c.contentPrimary }]}>
                      Videoyu Tarayıcınızda Açın
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.contentMuted }]}>
                      Chrome, Safari veya herhangi bir mobil tarayıcıda izlemek istediğiniz videonun olduğu sayfaya gidin.
                    </Text>
                  </View>
                </View>

                <View style={[styles.stepItem, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                  <View style={[styles.stepNum, { backgroundColor: c.contentPrimary }]}>
                    <Text style={[styles.stepNumText, { color: c.contentInverse }]}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: c.contentPrimary }]}>
                      Videonun Üzerine Basılı Tutun
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.contentMuted }]}>
                      Oynatıcının üzerine 1-2 saniye parmağınızı basılı tuttuğunuzda sistem menüsü açılır.
                    </Text>
                  </View>
                </View>

                <View style={[styles.stepItem, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                  <View style={[styles.stepNum, { backgroundColor: c.contentPrimary }]}>
                    <Text style={[styles.stepNumText, { color: c.contentInverse }]}>3</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: c.contentPrimary }]}>
                      "Bağlantı Adresini Kopyala"yı Seçin
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.contentMuted }]}>
                      Menüden <Text style={{ fontWeight: '700', color: c.contentPrimary }}>"Bağlantı adresini kopyala"</Text> veya <Text style={{ fontWeight: '700', color: c.contentPrimary }}>"Video adresini kopyala"</Text> seçeneğine dokunun.
                    </Text>
                  </View>
                </View>

                <View style={[styles.stepItem, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                  <View style={[styles.stepNum, { backgroundColor: c.contentPrimary }]}>
                    <Text style={[styles.stepNumText, { color: c.contentInverse }]}>4</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: c.contentPrimary }]}>
                      SyncWatch'a Yapıştırın
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.contentMuted }]}>
                      Uygulamamıza dönüp link kutusuna yapıştırın ve odayı başlatın!
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* DESKTOP GUIDE */
              <View style={styles.stepsContainer}>
                <View style={[styles.stepItem, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                  <View style={[styles.stepNum, { backgroundColor: c.contentPrimary }]}>
                    <Text style={[styles.stepNumText, { color: c.contentInverse }]}>1</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: c.contentPrimary }]}>
                      Videoya Sağ Tıklayın
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.contentMuted }]}>
                      Bilgisayarınızda videonun tam üzerine farenizle sağ tıklayın (Right Click).
                    </Text>
                  </View>
                </View>

                <View style={[styles.stepItem, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                  <View style={[styles.stepNum, { backgroundColor: c.contentPrimary }]}>
                    <Text style={[styles.stepNumText, { color: c.contentInverse }]}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: c.contentPrimary }]}>
                      "Video Adresini Kopyala" Deyin
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.contentMuted }]}>
                      Açılan menüden <Text style={{ fontWeight: '700', color: c.contentPrimary }}>"Video adresini kopyala"</Text> (Copy Video Address) seçeneğine tıklayın.
                    </Text>
                  </View>
                </View>

                <View style={[styles.stepItem, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
                  <View style={[styles.stepNum, { backgroundColor: c.contentPrimary }]}>
                    <Text style={[styles.stepNumText, { color: c.contentInverse }]}>3</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: c.contentPrimary }]}>
                      Telefona Gönderin & Yapıştırın
                    </Text>
                    <Text style={[styles.stepDesc, { color: c.contentMuted }]}>
                      Kopyaladığınız linki WhatsApp / Telegram ile kendinize gönderip SyncWatch'a yapıştırın.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Pro Tip Box */}
            <View style={[styles.tipBox, { backgroundColor: c.surfaceSubtle, borderColor: c.borderStrong }]}>
              <Lightbulb size={16} color={c.contentPrimary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: c.contentPrimary }]}>Önemli İpucu</Text>
                <Text style={[styles.tipText, { color: c.contentMuted }]}>
                  Doğrudan oynatılabilir video linkleri genelde sonu <Text style={{ fontWeight: '700', color: c.contentPrimary }}>.mp4</Text>, <Text style={{ fontWeight: '700', color: c.contentPrimary }}>.m3u8</Text> ile biten veya doğrudan video akış bağlantılarıdır.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Close Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: c.contentPrimary }]}
            onPress={onClose}
          >
            <CheckCircle2 size={16} color={c.contentInverse} />
            <Text style={[styles.confirmBtnText, { color: c.contentInverse }]}>Anladım, Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    maxHeight: '85%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  tabRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    gap: 12,
    paddingBottom: 10,
  },
  stepsContainer: {
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 11,
    lineHeight: 16,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 10,
    marginTop: 14,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
