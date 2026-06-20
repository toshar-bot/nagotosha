import { Rarity } from '@/types/card';

export type PackId = 'morning' | 'lunch' | 'dinner';

export interface PackConfig {
  id: PackId;
  name: string;
  shortName: string;
  catchCopy: string;
  imageUrl: string;
  color: string;
  borderColor: string;
  bgFrom: string;
  bgTo: string;
  accentFood: 'morning' | 'lunch' | 'dinner';
  weights: Record<Rarity, number>;
}

export const PACKS: PackConfig[] = [
  {
    id: 'morning',
    name: '名古屋モーニングパック',
    shortName: 'Morning',
    catchCopy: '小倉トーストや喫茶店カードが出やすい',
    imageUrl: '/packs/morning.webp',
    color: '#b8872f',
    borderColor: '#d9a441',
    bgFrom: '#fff1c9',
    bgTo: '#7a4a14',
    accentFood: 'morning',
    weights: { N: 58, R: 28, SR: 10, SSR: 3, UR: 1 },
  },
  {
    id: 'lunch',
    name: '名古屋ランチパック',
    shortName: 'Lunch',
    catchCopy: '台湾ラーメンとあんかけスパが狙いやすい',
    imageUrl: '/packs/lunch.webp',
    color: '#c9412d',
    borderColor: '#e85d3f',
    bgFrom: '#ffd2bf',
    bgTo: '#7a1f17',
    accentFood: 'lunch',
    weights: { N: 44, R: 33, SR: 16, SSR: 6, UR: 1 },
  },
  {
    id: 'dinner',
    name: '名古屋ディナーパック',
    shortName: 'Dinner',
    catchCopy: 'ひつまぶしや夜の名物に高レア期待',
    imageUrl: '/packs/dinner.webp',
    color: '#7c3aed',
    borderColor: '#a78bfa',
    bgFrom: '#eee6ff',
    bgTo: '#35145f',
    accentFood: 'dinner',
    weights: { N: 36, R: 30, SR: 21, SSR: 10, UR: 3 },
  },
];

export const DEFAULT_PACK = PACKS[0];

export function getPack(packId: PackId): PackConfig {
  return PACKS.find(pack => pack.id === packId) ?? DEFAULT_PACK;
}
