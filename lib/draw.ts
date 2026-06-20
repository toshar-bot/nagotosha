import { Card, Rarity } from '@/types/card';
import { RARITY_WEIGHTS } from '@/lib/rarity';

function pickRarity(): Rarity {
  const rarities: Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR'];
  const weights = [50, 30, 14, 5, 1];
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < rarities.length; i++) {
    if (rand < weights[i]) return rarities[i];
    rand -= weights[i];
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