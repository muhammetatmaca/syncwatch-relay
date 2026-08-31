import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X,
  Search,
  Film,
  Check,
  Globe,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { SyncHaptics } from '../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectVideo: (url: string, title: string) => void;
  themeMode?: 'dark' | 'light';
}

// Injected JS to sniff video streams (.mp4, .m3u8, blob, video elements)
const VIDEO_SNIFFER_JS = `
  (function() {
    function notifyVideo(src, title) {
      if (!src || src.startsWith('blob:')) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'VIDEO_FOUND',
        url: src,
        title: title || document.title || 'Web Videosu'
      }));
    }

    // 1. Scan existing <video> & <source> tags
    function scanVideos() {
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        if (v.src) notifyVideo(v.src, v.getAttribute('title'));
        const sources = v.querySelectorAll('source');
        sources.forEach(s => {
          if (s.src) notifyVideo(s.src, v.getAttribute('title'));
        });
      });
    }

    // Run scan on load and periodically
    scanVideos();
    setInterval(scanVideos, 1500);

    // 2. Intercept dynamically created HTMLMediaElements
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function() {
      if (this.src) notifyVideo(this.src);
      return origPlay.apply(this, arguments);
    };
  })();
  true;
`;

const WebViewComponent: any = WebView;

export const WebVideoBrowserModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectVideo,
  themeMode = 'dark',
}) => {
  const c = Colors[themeMode];
  const webViewRef = useRef<any>(null);

  const [inputUrl, setInputUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [detectedVideos, setDetectedVideos] = useState<{ url: string; title: string }[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = () => {
    SyncHaptics.codeKeypress();
    let target = inputUrl.trim();
    if (!target) return;

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }
    setCurrentUrl(target);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'VIDEO_FOUND' && data.url) {
        setDetectedVideos((prev) => {
          if (prev.some((v) => v.url === data.url)) return prev;
          SyncHaptics.partnerJoined();
          return [...prev, { url: data.url, title: data.title }];
        });
      }
    } catch {}
  };

  const handleConfirmVideo = (item: { url: string; title: string }) => {
    SyncHaptics.playbackToggle();
    onSelectVideo(item.url, item.title);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={[styles.container, { backgroundColor: c.surfaceBase }]}>
        {/* Top Browser Bar */}
        <View style={[styles.topBar, { backgroundColor: c.surfaceCard, borderBottomColor: c.borderSubtle }]}>
          <TouchableOpacity style={styles.navBtn} onPress={onClose}>
            <X size={20} color={c.contentPrimary} />
          </TouchableOpacity>

          <View style={[styles.urlInputBox, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
            <Globe size={14} color={c.contentMuted} />
            <TextInput
              style={[styles.urlInput, { color: c.contentPrimary }]}
              value={inputUrl}
              onChangeText={setInputUrl}
              onSubmitEditing={handleNavigate}
              placeholder="Web sitesi adresi veya arama yapın..."
              placeholderTextColor={c.contentMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
            />
            {isLoading && <ActivityIndicator size="small" color={c.contentPrimary} />}
          </View>

          <TouchableOpacity
            style={[styles.goBtn, { backgroundColor: c.contentPrimary }]}
            onPress={handleNavigate}
          >
            <Search size={14} color={c.contentInverse} />
          </TouchableOpacity>
        </View>

        {/* Navigation Controls Bar */}
        <View style={[styles.controlBar, { backgroundColor: c.surfaceCard, borderBottomColor: c.borderSubtle }]}>
          <View style={styles.navArrows}>
            <TouchableOpacity
              style={[styles.iconBtn, !canGoBack && { opacity: 0.3 }]}
              disabled={!canGoBack}
              onPress={() => webViewRef.current?.goBack()}
            >
              <ArrowLeft size={18} color={c.contentPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, !canGoForward && { opacity: 0.3 }]}
              disabled={!canGoForward}
              onPress={() => webViewRef.current?.goForward()}
            >
              <ArrowRight size={18} color={c.contentPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => webViewRef.current?.reload()}
            >
              <RotateCw size={16} color={c.contentPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.tipText, { color: c.contentMuted }]}>
            Videoyu sayfada başlatın, otomatik algılanacaktır.
          </Text>
        </View>

        {/* WebView Viewport */}
        <View style={styles.webWrapper}>
          <WebViewComponent
            ref={webViewRef}
            source={{ uri: currentUrl }}
            injectedJavaScript={VIDEO_SNIFFER_JS}
            onMessage={handleMessage}
            onNavigationStateChange={(nav: any) => {
              setCanGoBack(nav.canGoBack);
              setCanGoForward(nav.canGoForward);
              setInputUrl(nav.url);
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            style={styles.webview}
          />
        </View>

        {/* Detected Video Floating Toast / Bottom Sheet */}
        {detectedVideos.length > 0 && (
          <View style={[styles.detectedDeck, { backgroundColor: c.surfaceCard, borderColor: c.borderStrong }]}>
            <View style={styles.detectedHeader}>
              <View style={[styles.detectedBadge, { backgroundColor: c.contentPrimary }]}>
                <Film size={12} color={c.contentInverse} />
                <Text style={[styles.detectedBadgeText, { color: c.contentInverse }]}>
                  {detectedVideos.length} Video Bulundu
                </Text>
              </View>
              <Text style={[styles.detectedTitle, { color: c.contentPrimary }]} numberOfLines={1}>
                {detectedVideos[detectedVideos.length - 1].title}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.useVideoBtn, { backgroundColor: c.contentPrimary }]}
              onPress={() => handleConfirmVideo(detectedVideos[detectedVideos.length - 1])}
            >
              <Check size={16} color={c.contentInverse} />
              <Text style={[styles.useVideoBtnText, { color: c.contentInverse }]}>
                Bu Videoyu Odaya Aktar ve İzle
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
  },
  navBtn: {
    padding: 8,
  },
  urlInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  urlInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  goBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  navArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  tipText: {
    fontSize: 11,
  },
  webWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  detectedDeck: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  detectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  detectedTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  useVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 10,
  },
  useVideoBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
