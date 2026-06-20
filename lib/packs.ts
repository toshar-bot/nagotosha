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
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/%E3%83%A2%E3%83%BC%E3%83%8B%E3%83%B3%E3%82%B0%E5%90%8D%E5%8F%A4%E5%B1%8B%E3%82%BB%E3%83%83%E3%83%88%E3%81%AE%E5%B0%8F%E5%80%89%E3%83%88%E3%83%BC%E3%82%B9%E3%83%88_(8923375578).jpg?width=900',
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
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Taiwan_ramen_by_a.fujii_in_Chubu_International_Airport,_Aichi.jpg?width=900',
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
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hitsumabushi1.jpg?width=900',
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
