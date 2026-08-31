import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const SyncHaptics = {
  // Keypress in room code input
  codeKeypress: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  },

  // Play / Pause toggle
  playbackToggle: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
  },

  // Partner enters the room
  partnerJoined: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  },

  // Partner paused or buffering
  partnerBuffering: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }
  },

  // Scrubbing tick
  scrubTick: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  },

  // Sync locked
  syncLocked: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
  },
};
