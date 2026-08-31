import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Check, Share2 } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { SyncHaptics } from '../utils/haptics';

interface Props {
  code: string;
  themeMode?: 'dark' | 'light';
}

export const CodeDisplayCard: React.FC<Props> = ({ code, themeMode = 'dark' }) => {
  const [copied, setCopied] = useState(false);
  const c = Colors[themeMode];

  const handleCopy = async () => {
    SyncHaptics.codeKeypress();
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    SyncHaptics.codeKeypress();
    try {
      await Share.share({
        message: `SyncWatch ile benimle aynı anda video izle! Oda Kodu: ${code}`,
        title: 'SyncWatch Oda Daveti',
      });
    } catch {}
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.borderSubtle }]}>
      <Text style={[styles.label, { color: c.contentMuted }]}>ODA KODU</Text>
      
      {/* Monospaced Code Display */}
      <View style={[styles.codeBox, { backgroundColor: c.surfaceSubtle, borderColor: c.borderStrong }]}>
        <Text style={[styles.codeText, { color: c.contentPrimary }]}>{code}</Text>
      </View>

      <Text style={[styles.subtext, { color: c.contentMuted }]}>
        Bu kodu partnerinize gönderin. O da uygulamaya bu kodu girdiğinde ekranlarınız otomatik olarak eşleşecektir.
      </Text>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          {copied ? (
            <Check size={16} color={c.contentPrimary} />
          ) : (
            <Copy size={16} color={c.contentPrimary} />
          )}
          <Text style={[styles.btnText, { color: c.contentPrimary }]}>
            {copied ? 'Kopyalandı' : 'Kodu Kopyala'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: c.contentPrimary, borderColor: c.contentPrimary }]}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Share2 size={16} color={c.contentInverse} />
          <Text style={[styles.btnText, { color: c.contentInverse, fontWeight: '700' }]}>
            Paylaş
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  codeBox: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'SpaceMono-Regular',
    letterSpacing: 4,
  },
  subtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
