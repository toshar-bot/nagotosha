import { Card, Rarity } from '@/types/card';
import { DEFAULT_PACK, getPack, PackId } from '@/lib/packs';

function pickRarity(packId: PackId = DEFAULT_PACK.id): Rarity {
  const pack = getPack(packId);
  const rarities: Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR'];
  const weights = rarities.map(rarity => pack.weights[rarity]);
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < rarities.length; i++) {
    if (rand < weights[i]) return rarities[i];
    rand -= weights[i];
  }
  return 'N';
}

export function drawCard(allCards: Card[], ownedIds: string[], packId: PackId = DEFAULT_PACK.id): Card {
  const rarity = pickRarity(packId);
  let pool = allCards.filter(c => c.rarity === rarity);
  const unowned = pool.filter(c => !ownedIds.includes(c.id));
  if (unowned.length > 0) pool = unowned;
  if (pool.length === 0) pool = allCards.filter(c => c.rarity === 'N');
  if (pool.length === 0) pool = allCards;
  return pool[Math.floor(Math.random() * pool.length)];
}

const RARITY_RANK: Record<Rarity, number> = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };

export function drawPack(allCards: Card[], ownedIds: string[], packId: PackId = DEFAULT_PACK.id, count = 5): Card[] {
  const cards = Array.from({ length: count }, () => drawCard(allCards, ownedIds, packId));
  return cards.sort((a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity]);
}
