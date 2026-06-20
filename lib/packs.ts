import { Rarity } from '@/types/card';

export type PackId = 'morning' | 'lunch' | 'dinner';

export interface PackConfig {
  id: PackId;
  name: string;
  shortName: string;
  catchCopy: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgFrom: string;
  bgTo: string;
  weights: Record<Rarity, number>;
}

export const PACKS: PackConfig[] = [
  {
    id: 'morning',
    name: 'モーニングパック',
    shortName: 'Morning',
    catchCopy: '喫茶店と朝の名古屋メシが出やすい',
    emoji: '☕',
    color: '#f2b84b',
    borderColor: '#d99a2b',
    bgFrom: '#5a3518',
    bgTo: '#19100b',
    weights: { N: 58, R: 28, SR: 10, SSR: 3, UR: 1 },
  },
  {
    id: 'lunch',
    name: 'ランチパック',
    shortName: 'Lunch',
    catchCopy: '定番名古屋メシを集めやすい',
    emoji: '🍜',
    color: '#ef6f4d',
    borderColor: '#e85d3f',
    bgFrom: '#6f2218',
    bgTo: '#1b1010',
    weights: { N: 44, R: 33, SR: 16, SSR: 6, UR: 1 },
  },
  {
    id: 'dinner',
    name: 'ディナーパック',
    shortName: 'Dinner',
    catchCopy: '夜のごちそうと高レアに少し期待',
    emoji: '🌙',
    color: '#c084fc',
    borderColor: '#8b5cf6',
    bgFrom: '#43216d',
    bgTo: '#100b1b',
    weights: { N: 36, R: 30, SR: 21, SSR: 10, UR: 3 },
  },
];

export const DEFAULT_PACK = PACKS[0];

export function getPack(packId: PackId): PackConfig {
  return PACKS.find(pack => pack.id === packId) ?? DEFAULT_PACK;
}
