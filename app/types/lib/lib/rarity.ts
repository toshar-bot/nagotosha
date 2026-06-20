import { Card, Rarity } from '@/types/card';

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  N: 50, R: 30, SR: 14, SSR: 5, UR: 1,
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
    label: 'NORMAL', shortLabel: 'N',
    color: '#9CA3AF', borderColor: '#6B7280',
    bgFrom: '#1f2937', bgTo: '#111827',
    glowColor: 'rgba(156,163,175,0.2)', glowStrong: 'rgba(156,163,175,0.45)',
    textColor: '#D1D5DB',
    tosharReaction: '定番じゃな！これが一番大事な名古屋の味じゃ🐻',
    shareEmoji: '⬜',
  },
  R: {
    label: 'RARE', shortLabel: 'R',
    color: '#60A5FA', borderColor: '#3B82F6',
    bgFrom: '#1e3a8a', bgTo: '#0f172a',
    glowColor: 'rgba(59,130,246,0.3)', glowStrong: 'rgba(59,130,246,0.6)',
    textColor: '#93C5FD',
    tosharReaction: 'おおっ！レアカードじゃぞ！名古屋の人気者をゲットしたのぅ💙',
    shareEmoji: '💙',
  },
  SR: {
    label: 'SUPER RARE', shortLabel: 'SR',
    color: '#C084FC', borderColor: '#A855F7',
    bgFrom: '#4c1d95', bgTo: '#0f0a1a',
    glowColor: 'rgba(168,85,247,0.35)', glowStrong: 'rgba(168,85,247,0.65)',
    textColor: '#E9D5FF',
    tosharReaction: 'すごいじゃないか！これは名店カードじゃ！行ったことあるか？💜',
    shareEmoji: '💜',
  },
  SSR: {
    label: 'S・S・RARE', shortLabel: 'SSR',
    color: '#FCD34D', borderColor: '#F59E0B',
    bgFrom: '#78350f', bgTo: '#1a0a00',
    glowColor: 'rgba(245,158,11,0.4)', glowStrong: 'rgba(245,158,11,0.75)',
    textColor: '#FDE68A',
    tosharReaction: 'これは...信じられん！このカードは博士でも滅多に見ないぞ！⭐⭐⭐',
    shareEmoji: '⭐',
  },
  UR: {
    label: 'ULTRA RARE', shortLabel: 'UR',
    color: '#F87171', borderColor: '#EF4444',
    bgFrom: '#7f1d1d', bgTo: '#050002',
    glowColor: 'rgba(239,68,68,0.45)', glowStrong: 'rgba(239,68,68,0.85)',
    textColor: '#FCA5A5',
    tosharReaction: '伝説じゃああああ！！！今すぐXに投稿するんじゃ！！🔥🔥🔥',
    shareEmoji: '🔥',
  },
};

export function buildShareUrl(card: Card, streak: number): string {
  const cfg = RARITY_CONFIG[card.rarity];
  const text = [
    `${cfg.shareEmoji}【${card.rarity}】${card.name} をゲット！`,
    `名古屋メシ図鑑を${streak}日連続挑戦中🐻`,
    '#NAGOTOSHA #名古屋グルメ #名古屋メシ',
    'https://nagotosha.com',
  ].join('\n');
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}