import { Card, Rarity } from '@/types/card';

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  N: 50,
  R: 30,
  SR: 14,
  SSR: 5,
  UR: 1,
};

export interface RarityConfig {
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
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  N: {
    label: 'NORMAL',
    shortLabel: 'N',
    color: '#6B7280',
    borderColor: '#9CA3AF',
    bgFrom: '#f8fafc',
    bgTo: '#dbe4ef',
    glowColor: 'rgba(107,114,128,0.18)',
    glowStrong: 'rgba(107,114,128,0.42)',
    textColor: '#374151',
    tosharReaction: '定番です。こういう一枚こそ図鑑の土台になります。',
    shareEmoji: 'N',
  },
  R: {
    label: 'RARE',
    shortLabel: 'R',
    color: '#2563EB',
    borderColor: '#60A5FA',
    bgFrom: '#dbeafe',
    bgTo: '#1e3a8a',
    glowColor: 'rgba(37,99,235,0.24)',
    glowStrong: 'rgba(37,99,235,0.55)',
    textColor: '#1D4ED8',
    tosharReaction: 'いい引きです。名古屋らしさが強いカードです。',
    shareEmoji: 'R',
  },
  SR: {
    label: 'SUPER RARE',
    shortLabel: 'SR',
    color: '#9333EA',
    borderColor: '#C084FC',
    bgFrom: '#f3e8ff',
    bgTo: '#4c1d95',
    glowColor: 'rgba(147,51,234,0.30)',
    glowStrong: 'rgba(147,51,234,0.62)',
    textColor: '#7E22CE',
    tosharReaction: 'かなり良い一枚です。店名まで覚えたくなるカードですね。',
    shareEmoji: 'SR',
  },
  SSR: {
    label: 'S・S・RARE',
    shortLabel: 'SSR',
    color: '#B8872F',
    borderColor: '#F2B84B',
    bgFrom: '#fff7d6',
    bgTo: '#78350f',
    glowColor: 'rgba(184,135,47,0.34)',
    glowStrong: 'rgba(184,135,47,0.72)',
    textColor: '#92400E',
    tosharReaction: 'これはかなり貴重です。図鑑の中でも目立つ一枚になります。',
    shareEmoji: 'SSR',
  },
  UR: {
    label: 'ULTRA RARE',
    shortLabel: 'UR',
    color: '#DC2626',
    borderColor: '#F87171',
    bgFrom: '#fee2e2',
    bgTo: '#7f1d1d',
    glowColor: 'rgba(220,38,38,0.38)',
    glowStrong: 'rgba(220,38,38,0.82)',
    textColor: '#B91C1C',
    tosharReaction: '伝説級です。名古屋メシハンターとして誇れる一枚です。',
    shareEmoji: 'UR',
  },
};

export function buildShareUrl(card: Card, streak: number): string {
  const cfg = RARITY_CONFIG[card.rarity];
  const text = [
    `${cfg.shareEmoji} ${card.rarity} ${card.shopName}の${card.name}をゲット`,
    `名古屋メシ図鑑を${streak}日連続挑戦中`,
    '#NAGOTOSHA #名古屋グルメ #名古屋メシ',
    'https://nagotosha.vercel.app',
  ].join('\n');
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
