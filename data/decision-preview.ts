import type { VerifiedImage } from '@/types/decision-candidate';

export const HERO_IMAGE: VerifiedImage = {
  src: '/areas/meieki-landmark.webp',
  alt: '名駅のJRセントラルタワーズとJRゲートタワー',
  usage: 'decorative',
  caption: '名駅の街並み',
  isHistorical: 'unknown',
  credit: 'FZHS',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nagoya_Station_JR_Central_Towers_and_JR_Gate_Tower.jpg',
  license: 'CC0 1.0',
  rightsVerified: true,
  verifiedAt: '2026-07-19',
};

export type PreviewSeasonalGuide = {
  articleId: number;
  title: string;
  description: string;
  image: VerifiedImage;
  articleUrl: string;
};

export const PREVIEW_SEASONAL_GUIDE: PreviewSeasonalGuide = {
  articleId: 214,
  title: '名古屋周辺の花火大会まとめ 2026',
  description: '開催日・会場・有料席・アクセスをまとめて確認できます。',
  image: {
    src: '/decision/okazaki-fireworks-cc0.jpg',
    alt: '岡崎の花火大会で夜空に広がる花火の過去写真',
    usage: 'decorative',
    caption: '過去の開催写真（撮影年未確認）',
    eventYear: 'unknown',
    isHistorical: true,
    credit: 'Evelyn-rose / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Okazaki_Hanabitaikai_2015_3.jpg',
    license: 'CC0',
    rightsVerified: true,
    verifiedAt: '2026-07-19',
  },
  articleUrl: '/article/214',
};

export type PreviewEditorialArticle = {
  id: number;
  title: string;
  href: string;
  category?: string;
};

// 2026-07-19に、公開中の公式WordPress REST APIでタイトル・URL・カテゴリを確認。
// 本文の評価、価格、営業情報はPreviewへ持ち込まない。
export const PREVIEW_EDITORIAL_ARTICLES: readonly PreviewEditorialArticle[] = [
  {
    id: 182,
    title: '【栄】名古屋初「サウィ食堂 名古屋栄店」がオープン。釜山発ナッコプセを錦3丁目で',
    href: '/article/182',
    category: 'グルメ',
  },
  {
    id: 178,
    title: '【栄】東海初「ポーたま 名古屋HAERA店」がHAERAにオープン。名古屋限定4メニューも',
    href: '/article/178',
    category: 'グルメ',
  },
  {
    id: 159,
    title: '【栄】カフェ・ラデュレ 名古屋ラシック店がオープン。マカロン発祥の老舗が手がける日本1号店カフェ',
    href: '/article/159',
    category: 'グルメ',
  },
];
