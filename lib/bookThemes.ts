export type ThemeId = 'meieki' | 'sakae' | 'osu' | 'fujigaoka' | 'favorite' | 'mystickers';

export interface DecoItem {
  char: string;
  x: number;      // % of page width
  y: number;      // % of page height
  size: number;   // px
  rot?: number;
  opacity?: number;
}

export interface MaskingConfig {
  color1: string;
  color2: string;
  style: 'dot' | 'stripe' | 'leaf' | 'ribbon' | 'hachimaki';
}

export interface PageTheme {
  id: ThemeId;
  label: string;           // タブ表示用短縮名
  title: string;           // ページ上の見出し
  subtitle: string;
  leftBg: string;
  rightBg: string;
  accent: string;
  accent2?: string;
  labelBg: string;
  labelColor: string;
  labelRot: number;        // degrees
  pattern: 'dot' | 'flower' | 'star-dot' | 'grid' | 'none';
  patternColor: string;
  masking: MaskingConfig;
  borderColor: string;
  cornerStyle: 'stitch' | 'round' | 'diamond' | 'none';
  decos: DecoItem[];
}

const THEMES: Record<ThemeId, PageTheme> = {
  meieki: {
    id: 'meieki',
    label: '名駅',
    title: '名駅メシ',
    subtitle: 'NAGOYA STATION',
    leftBg: '#f7edd8',
    rightBg: '#f4e8c8',
    accent: '#c8643a',
    labelBg: '#c8643a',
    labelColor: '#fff',
    labelRot: 2,
    pattern: 'dot',
    patternColor: 'rgba(200,100,58,0.11)',
    masking: { color1: '#c8643a', color2: '#f2c080', style: 'dot' },
    borderColor: 'rgba(150,80,35,0.28)',
    cornerStyle: 'stitch',
    decos: [
      { char: '☕', x: 83, y: 66, size: 14, rot: -8,  opacity: 0.22 },
      { char: '✦',  x: 9,  y: 78, size: 8,  rot: 0,   opacity: 0.30 },
      { char: '·',  x: 72, y: 20, size: 12, rot: 0,   opacity: 0.40 },
      { char: '✿',  x: 18, y: 88, size: 9,  rot: 5,   opacity: 0.20 },
      { char: 'モーニング', x: 4, y: 93, size: 7, rot: 0, opacity: 0.20 },
    ],
  },

  sakae: {
    id: 'sakae',
    label: '栄',
    title: '栄・大須メシ',
    subtitle: 'SAKAE & OSU',
    leftBg: '#fff2f5',
    rightBg: '#fce8ee',
    accent: '#d94070',
    labelBg: '#d94070',
    labelColor: '#fff',
    labelRot: -1.5,
    pattern: 'flower',
    patternColor: 'rgba(217,64,112,0.09)',
    masking: { color1: '#f0a0b8', color2: '#fce8ee', style: 'stripe' },
    borderColor: 'rgba(217,64,112,0.22)',
    cornerStyle: 'round',
    decos: [
      { char: '♥', x: 88, y: 11, size: 10, opacity: 0.28 },
      { char: '✿', x: 6,  y: 74, size: 12, opacity: 0.22 },
      { char: '♥', x: 79, y: 84, size: 8,  opacity: 0.20 },
      { char: '✦', x: 16, y: 18, size: 7,  opacity: 0.28 },
      { char: '·', x: 50, y: 92, size: 10, opacity: 0.25 },
    ],
  },

  osu: {
    id: 'osu',
    label: '大須',
    title: '★ OSUOSU ★',
    subtitle: 'RETRO POP',
    leftBg: '#fefce8',
    rightBg: '#fff9dc',
    accent: '#6633cc',
    accent2: '#e84848',
    labelBg: '#6633cc',
    labelColor: '#fff',
    labelRot: -3,
    pattern: 'star-dot',
    patternColor: 'rgba(102,51,204,0.07)',
    masking: { color1: '#f0c800', color2: '#222222', style: 'hachimaki' },
    borderColor: 'rgba(102,51,204,0.20)',
    cornerStyle: 'diamond',
    decos: [
      { char: '★', x: 85, y: 14, size: 12, rot: 15,  opacity: 0.28 },
      { char: '★', x: 8,  y: 70, size: 9,  rot: -10, opacity: 0.22 },
      { char: '⚡', x: 76, y: 77, size: 11, rot: 5,   opacity: 0.20 },
      { char: '!', x: 18, y: 16, size: 16, rot: -5,  opacity: 0.22 },
      { char: '★', x: 45, y: 90, size: 8,  rot: 20,  opacity: 0.18 },
    ],
  },

  fujigaoka: {
    id: 'fujigaoka',
    label: '藤が丘',
    title: 'Nagoya East',
    subtitle: 'FUJIGAOKA & EAST',
    leftBg: '#f2faf5',
    rightBg: '#e8f7ee',
    accent: '#5a9068',
    labelBg: '#5a9068',
    labelColor: '#fff',
    labelRot: 1,
    pattern: 'grid',
    patternColor: 'rgba(90,144,104,0.11)',
    masking: { color1: '#8cc89a', color2: '#c8e8c8', style: 'leaf' },
    borderColor: 'rgba(90,144,104,0.20)',
    cornerStyle: 'none',
    decos: [
      { char: '🌿', x: 83, y: 68, size: 13, rot: -5, opacity: 0.28 },
      { char: '·',  x: 11, y: 82, size: 10, rot: 0,  opacity: 0.35 },
      { char: '✦',  x: 74, y: 16, size: 8,  rot: 0,  opacity: 0.22 },
      { char: '○',  x: 6,  y: 28, size: 9,  rot: 0,  opacity: 0.18 },
      { char: '·',  x: 55, y: 88, size: 7,  rot: 0,  opacity: 0.30 },
    ],
  },

  favorite: {
    id: 'favorite',
    label: '推し',
    title: '✦ お気に入り ✦',
    subtitle: 'SPECIAL PICKS',
    leftBg: '#fdf9ed',
    rightBg: '#faf5e2',
    accent: '#c8952a',
    labelBg: 'transparent',
    labelColor: '#c8952a',
    labelRot: -1.5,
    pattern: 'dot',
    patternColor: 'rgba(200,149,42,0.09)',
    masking: { color1: '#c8952a', color2: '#f8e8a8', style: 'ribbon' },
    borderColor: 'rgba(200,149,42,0.32)',
    cornerStyle: 'diamond',
    decos: [
      { char: '✦', x: 88, y: 10, size: 11, rot: 0,  opacity: 0.40 },
      { char: '✦', x: 6,  y: 88, size: 9,  rot: 0,  opacity: 0.35 },
      { char: '✦', x: 80, y: 85, size: 8,  rot: 0,  opacity: 0.30 },
      { char: '✦', x: 12, y: 13, size: 10, rot: 0,  opacity: 0.38 },
      { char: '·', x: 50, y: 50, size: 6,  rot: 0,  opacity: 0.22 },
    ],
  },

  mystickers: {
    id: 'mystickers',
    label: 'マイ',
    title: 'MY PHOTOS',
    subtitle: 'FOOD DIARY',
    leftBg: '#fafaf8',
    rightBg: '#f5f5f2',
    accent: '#8a8a8a',
    labelBg: 'transparent',
    labelColor: '#aaaaaa',
    labelRot: 0,
    pattern: 'grid',
    patternColor: 'rgba(140,140,140,0.09)',
    masking: { color1: '#cccccc', color2: '#eeeeee', style: 'stripe' },
    borderColor: 'rgba(160,160,160,0.18)',
    cornerStyle: 'round',
    decos: [
      { char: '📷', x: 82, y: 74, size: 12, rot: -5, opacity: 0.20 },
      { char: '·',  x: 10, y: 80, size: 8,  rot: 0,  opacity: 0.25 },
      { char: '○',  x: 70, y: 15, size: 10, rot: 0,  opacity: 0.18 },
    ],
  },
};

export const THEME_ORDER: ThemeId[] = ['meieki', 'sakae', 'osu', 'fujigaoka', 'favorite', 'mystickers'];

export function getTheme(id: ThemeId): PageTheme { return THEMES[id]; }
export function getAllThemes(): PageTheme[] { return THEME_ORDER.map(id => THEMES[id]); }
