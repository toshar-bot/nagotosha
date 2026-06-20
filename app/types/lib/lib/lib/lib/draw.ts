import { Card, Rarity } from '@/types/card';
import { RARITY_WEIGHTS } from '@/lib/rarity';

function pickRarity(): Rarity {
  const entries = Object.entries(RARITY_WEIGHTS) as [Rarity, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let rand = Math.random() * total;
  for (const [rarity, weight] of entries) {
    if (rand < weight) return rarity;
    rand -= weight;
  }
  return 'N';
}

export function drawCard(allCards: Card[], ownedIds: string[]): Card {
  const rarity = pickRarity();
  let pool = allCards.filter(c => c.rarity === rarity);

  const unowned = pool.filter(c => !ownedIds.includes(c.id));
  if (unowned.length > 0) pool = unowned;

  if (pool.length === 0) pool = allCards.filter(c => c.rarity === 'N');
  if (pool.length === 0) pool = allCards;

  return pool[Math.floor(Math.random() * pool.length)];
}