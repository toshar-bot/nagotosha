import { Card, Rarity } from '@/types/card';

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  N: 50, R: 30, SR: 14, SSR: 5, UR: 1,
};

export interface RarityConfig {
  // ── 既存フィールド（後方互換） ──
  label: string;
  shortLabel: Rarity;
  color: string;
  borderColor: string;
  bgFrom: string;
  bgTo: string;
  glowColor: string;
  glowStrong: string;
  textColor: string;
  tosharReaction: string;
  shareEmoji: string;

  // ── カードデザイン用新フィールド ──
  /** CSS gradient string used for gradient-border trick */
  frameGradient: string;
  /** Border thickness (px, used in pixel math) */
  frameWidth: number;
  /** Inner frame accent line color */
  innerLineColor: string;
  /** Card base background CSS (gradient) */
  cardBg: string;
  /** Art window border color */
  artBorderColor: string;
  /** Art window inner glow */
  artGlowColor: string;
  /** Text style for card name */
  nameStyle: 'plain' | 'silver' | 'gold' | 'rainbow';
  /** Corner ornament style (placed at art window corners) */
  cornerStyle: 'simple' | 'ornate' | 'star' | 'none';
  /** Holographic overlay type */
  holoType: 'none' | 'silver' | 'gold' | 'rainbow' | 'full';
  /** UR: photo fills entire card */
  isFullArt: boolean;
  /** Extra background particles/sparkles */
  hasSparkles: boolean;
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  N: {
    label: 'NORMAL', shortLabel: 'N',
    color: '#9ca3af', borderColor: '#c8c4be',
    bgFrom: '#f2efe8', bgTo: '#e0dcd4',
    glowColor: 'rgba(180,175,165,0.15)', glowStrong: 'rgba(180,175,165,0.35)',
    textColor: '#374151',
    tosharReaction: '定番じゃ。こういう一枚こそ図鑑の土台になるのじゃ。',
    shareEmoji: 'N',

    frameGradient: 'linear-gradient(180deg, #c8c4be 0%, #dedad4 30%, #e8e4de 50%, #c8c4be 70%, #b8b4ae 100%)',
    frameWidth: 2,
    innerLineColor: 'rgba(160,155,148,0.4)',
    cardBg: 'linear-gradient(165deg, #f2efe8 0%, #e4e0d8 60%, #d8d4cc 100%)',
    artBorderColor: 'rgba(180,175,165,0.55)',
    artGlowColor: 'rgba(160,155,148,0.0)',
    nameStyle: 'plain',
    cornerStyle: 'simple',
    holoType: 'none',
    isFullArt: false,
    hasSparkles: false,
  },

  R: {
    label: 'RARE', shortLabel: 'R',
    color: '#60a5fa', borderColor: '#93c5fd',
    bgFrom: '#1a2640', bgTo: '#0c1628',
    glowColor: 'rgba(37,99,235,0.24)', glowStrong: 'rgba(37,99,235,0.55)',
    textColor: '#1D4ED8',
    tosharReaction: 'いい引きじゃ。名古屋らしさが強いカードじゃな。',
    shareEmoji: 'R',

    frameGradient: 'linear-gradient(160deg, #8898b8 0%, #c0cce0 22%, #dde8f8 45%, #c0cce0 68%, #8898b8 100%)',
    frameWidth: 2,
    innerLineColor: 'rgba(140,160,220,0.45)',
    cardBg: 'linear-gradient(165deg, #192440 0%, #111e34 50%, #0c1628 100%)',
    artBorderColor: 'rgba(140,165,230,0.6)',
    artGlowColor: 'rgba(80,120,220,0.35)',
    nameStyle: 'silver',
    cornerStyle: 'simple',
    holoType: 'silver',
    isFullArt: false,
    hasSparkles: false,
  },

  SR: {
    label: 'SUPER RARE', shortLabel: 'SR',
    color: '#e0a030', borderColor: '#f0c850',
    bgFrom: '#1e0a38', bgTo: '#0c0520',
    glowColor: 'rgba(200,140,20,0.32)', glowStrong: 'rgba(220,160,30,0.65)',
    textColor: '#92400E',
    tosharReaction: 'かなり良い一枚じゃ。店名まで覚えたくなるカードじゃぞ。',
    shareEmoji: 'SR',

    frameGradient: 'linear-gradient(160deg, #7a5818 0%, #c89828 18%, #f0cc50 36%, #f8e070 50%, #e8c048 64%, #b08820 82%, #7a5818 100%)',
    frameWidth: 3,
    innerLineColor: 'rgba(210,160,35,0.55)',
    cardBg: 'linear-gradient(165deg, #1e0a38 0%, #160830 50%, #0c0520 100%)',
    artBorderColor: 'rgba(220,165,40,0.65)',
    artGlowColor: 'rgba(200,140,20,0.40)',
    nameStyle: 'gold',
    cornerStyle: 'ornate',
    holoType: 'gold',
    isFullArt: false,
    hasSparkles: true,
  },

  SSR: {
    label: 'S S RARE', shortLabel: 'SSR',
    color: '#e0b840', borderColor: '#f8d060',
    bgFrom: '#060510', bgTo: '#090820',
    glowColor: 'rgba(180,130,40,0.34)', glowStrong: 'rgba(220,170,50,0.72)',
    textColor: '#92400E',
    tosharReaction: 'これは貴重じゃ。図鑑の中でも目立つ一枚になるぞ。',
    shareEmoji: 'SSR',

    frameGradient: 'linear-gradient(135deg, #ff4488 0%, #ffaa00 17%, #ffff00 33%, #00ff88 50%, #0088ff 67%, #aa44ff 83%, #ff4488 100%)',
    frameWidth: 3,
    innerLineColor: 'rgba(200,150,255,0.50)',
    cardBg: 'linear-gradient(165deg, #070515 0%, #08071e 60%, #050410 100%)',
    artBorderColor: 'rgba(200,150,255,0.5)',
    artGlowColor: 'rgba(160,80,255,0.45)',
    nameStyle: 'gold',
    cornerStyle: 'star',
    holoType: 'rainbow',
    isFullArt: false,
    hasSparkles: true,
  },

  UR: {
    label: 'ULTRA RARE', shortLabel: 'UR',
    color: '#ff6688', borderColor: '#ff88aa',
    bgFrom: '#050508', bgTo: '#080510',
    glowColor: 'rgba(220,38,38,0.38)', glowStrong: 'rgba(220,38,38,0.82)',
    textColor: '#B91C1C',
    tosharReaction: '伝説級じゃ。名古屋メシハンターとして誇れる一枚じゃぞ。',
    shareEmoji: 'UR',

    frameGradient: 'linear-gradient(135deg, #ff2266 0%, #ff6600 14%, #ffdd00 28%, #00ff88 43%, #0066ff 57%, #8800ff 71%, #ff2266 86%, #ff6600 100%)',
    frameWidth: 4,
    innerLineColor: 'rgba(255,180,255,0.6)',
    cardBg: 'linear-gradient(165deg, #050408 0%, #06040e 100%)',
    artBorderColor: 'rgba(255,200,255,0.55)',
    artGlowColor: 'rgba(255,100,200,0.5)',
    nameStyle: 'rainbow',
    cornerStyle: 'star',
    holoType: 'full',
    isFullArt: true,
    hasSparkles: true,
  },
};

export function buildShareUrl(card: Card, streak: number): string {
  const cfg = RARITY_CONFIG[card.rarity];
  const text = [
    `${cfg.shareEmoji} ${card.rarity} ${card.shopName}の${card.name}をゲット`,
    `名古屋メシ図鑑を${streak}日連続で挑戦中`,
    '#NAGOTOSHA #名古屋グルメ #名古屋メシ',
    'https://nagotosha.vercel.app',
  ].join('\n');
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
