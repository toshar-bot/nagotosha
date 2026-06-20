import { Rarity } from '@/types/card';

export type PackId = 'morning' | 'lunch' | 'dinner';

export interface PackConfig {
  id: PackId;
  name: string;
  shortName: string;
  catchCopy: string;
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
    color: '#b8872f',
    borderColor: '#d9a441',
    bgFrom: '#fff4d7',
    bgTo: '#8a5a1f',
    weights: { N: 58, R: 28, SR: 10, SSR: 3, UR: 1 },
  },
  {
    id: 'lunch',
    name: 'ランチパック',
    shortName: 'Lunch',
    catchCopy: '定番名古屋メシを集めやすい',
    color: '#c9412d',
    borderColor: '#e85d3f',
    bgFrom: '#ffd9ca',
    bgTo: '#7a1f17',
    weights: { N: 44, R: 33, SR: 16, SSR: 6, UR: 1 },
  },
  {
    id: 'dinner',
    name: 'ディナーパック',
    shortName: 'Dinner',
    catchCopy: '夜のごちそうと高レアに少し期待',
    color: '#7c3aed',
    borderColor: '#a78bfa',
    bgFrom: '#eee6ff',
    bgTo: '#35145f',
    weights: { N: 36, R: 30, SR: 21, SSR: 10, UR: 3 },
  },
];

export const DEFAULT_PACK = PACKS[0];

export function getPack(packId: PackId): PackConfig {
  return PACKS.find(pack => pack.id === packId) ?? DEFAULT_PACK;
}
