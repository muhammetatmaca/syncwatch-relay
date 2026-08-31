export interface VideoPreset {
  id: string;
  title: string;
  url: string; // 'embedded:oceans' or https URL
  durationLabel: string;
  description: string;
  source: any; // require() local asset or { uri }
}

export const EMBEDDED_VIDEOS: Record<string, any> = {
  'embedded:oceans': require('../../assets/videos/oceans.mp4'),
  'embedded:bunny': require('../../assets/videos/bunny.mp4'),
  'embedded:sample': require('../../assets/videos/sample.mp4'),
};

export const PRESET_VIDEOS: VideoPreset[] = [
  {
    id: 'oceans',
    title: '1. Okyanus Belgeseli (HD)',
    url: 'embedded:oceans',
    durationLabel: '00:46',
    description: 'Uygulamaya gömülü, CDN kesintisinden etkilenmeyen HD video.',
    source: EMBEDDED_VIDEOS['embedded:oceans'],
  },
  {
    id: 'bunny',
    title: '2. Animasyon Filmi (HD)',
    url: 'embedded:bunny',
    durationLabel: '00:32',
    description: 'Uygulamaya gömülü eğlenceli animasyon klibi.',
    source: EMBEDDED_VIDEOS['embedded:bunny'],
  },
  {
    id: 'sample',
    title: '3. Doğa & Vahşi Yaşam (HD)',
    url: 'embedded:sample',
    durationLabel: '00:10',
    description: 'Uygulamaya gömülü hızlı test klibi.',
    source: EMBEDDED_VIDEOS['embedded:sample'],
  },
];

export const DEFAULT_TEST_VIDEO = PRESET_VIDEOS[0];

export function resolveVideoSource(url: string | null | undefined): any {
  if (!url) return EMBEDDED_VIDEOS['embedded:oceans'];
  if (url.startsWith('embedded:') && EMBEDDED_VIDEOS[url]) {
    return EMBEDDED_VIDEOS[url];
  }
  return url;
}
