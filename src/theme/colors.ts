// Monochromatic Single-Color Design System (logggos.club aesthetic)

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  surfaceBase: string;
  surfaceCard: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  borderSubtle: string;
  borderStrong: string;
  borderFocus: string;
  contentPrimary: string;
  contentSecondary: string;
  contentMuted: string;
  contentInverse: string;
  accent: string;
  accentSubtle: string;
  accentMuted: string;
  synced: string;
  buffering: string;
  drifted: string;
  disconnected: string;
}

export const Colors: Record<ThemeMode, ThemeColors> = {
  dark: {
    surfaceBase: '#0A0A0A',
    surfaceCard: '#141414',
    surfaceSubtle: 'rgba(255, 255, 255, 0.06)',
    surfaceElevated: '#1C1C1E',
    
    borderSubtle: 'rgba(255, 255, 255, 0.12)',
    borderStrong: 'rgba(255, 255, 255, 0.28)',
    borderFocus: '#FFFFFF',
    
    contentPrimary: '#EDEDED',
    contentSecondary: 'rgba(237, 237, 237, 0.70)',
    contentMuted: 'rgba(237, 237, 237, 0.45)',
    contentInverse: '#0A0A0A',
    
    accent: '#FFFFFF',
    accentSubtle: 'rgba(255, 255, 255, 0.15)',
    accentMuted: 'rgba(255, 255, 255, 0.40)',
    
    synced: '#EDEDED',
    buffering: 'rgba(237, 237, 237, 0.50)',
    drifted: '#FFFFFF',
    disconnected: 'rgba(237, 237, 237, 0.35)',
  },
  light: {
    surfaceBase: '#F8F8F6',
    surfaceCard: '#FFFFFF',
    surfaceSubtle: 'rgba(0, 0, 0, 0.04)',
    surfaceElevated: '#F0F0EE',
    
    borderSubtle: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.22)',
    borderFocus: '#111111',
    
    contentPrimary: '#111111',
    contentSecondary: 'rgba(17, 17, 17, 0.70)',
    contentMuted: 'rgba(17, 17, 17, 0.45)',
    contentInverse: '#FFFFFF',
    
    accent: '#111111',
    accentSubtle: 'rgba(0, 0, 0, 0.08)',
    accentMuted: 'rgba(0, 0, 0, 0.40)',
    
    synced: '#111111',
    buffering: 'rgba(17, 17, 17, 0.50)',
    drifted: '#111111',
    disconnected: 'rgba(17, 17, 17, 0.35)',
  },
};
