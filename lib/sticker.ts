import { Card, Rarity } from '@/types/card';

/** idから決定的なシール傾き角度を返す (±3deg) */
export function getStickerTilt(id: string): number {
  const hash = id.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  return ((hash % 9) - 4) * 0.65;
}

const HUNT_WEIGHTS: Record<Rarity, number> = {
  N: 50, R: 30, SR: 14, SSR: 5, UR: 1,
};

const RARITY_RANK: Record<Rarity, number> = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };

function pickRarity(): Rarity {
  const entries = Object.entries(HUNT_WEIGHTS) as [Rarity, number][];
  const total = entries.reduce((n, [, w]) => n + w, 0);
  let rand = Math.random() * total;
  for (const [rarity, weight] of entries) {
    if (rand < weight) return rarity;
    rand -= weight;
  }
  return 'N';
}

/** 5枚のシールを抽選する（パックなし・固定確率） */
export function hunt(allCards: Card[], discoveredIds: string[], count = 5): Card[] {
  const picks = Array.from({ length: count }, () => {
    const rarity = pickRarity();
    let pool = allCards.filter(c => c.rarity === rarity);
    const fresh = pool.filter(c => !discoveredIds.includes(c.id));
    if (fresh.length > 0) pool = fresh;
    if (pool.length === 0) pool = allCards.filter(c => c.rarity === 'N');
    if (pool.length === 0) pool = allCards;
    return pool[Math.floor(Math.random() * pool.length)];
  });
  return picks.sort((a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity]);
}
