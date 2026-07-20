import type { VerifiedImage } from '@/types/decision-candidate';
import { getArticleExperience } from '@/lib/article-experience';

export type PreviewHeroPhoto = {
  kind: 'photo';
  usage: 'decorative';
  src: string;
  alt: '';
  caption: string;
  isHistorical: 'unknown';
  currentStateEvidence: false;
  photographedAt: 'unknown';
  credit: string;
  license: string;
  rightsVerified: true;
  previewUseApproved: true;
  productionUseApproved: true;
  verifiedAt: string;
  colorProfile: 'sRGB';
  sourceType: 'Canva design export';
  designName: string;
  sourceAssetName: string;
  creator: string;
  brand: string;
  contentTier: 'Canva Pro';
  obtainedAt: string;
  transformations: readonly string[];
  sourceSha256: string;
  outputSha256: string;
};

export const HERO_IMAGE: PreviewHeroPhoto = {
  kind: 'photo',
  src: '/decision/nagotosha-hero-background-v1.webp',
  alt: '',
  usage: 'decorative',
  caption: 'MIRAI TOWERと久屋大通公園',
  isHistorical: 'unknown',
  currentStateEvidence: false,
  photographedAt: 'unknown',
  credit: 'Aflo Images / アフロ',
  license: 'Canva Pro Content',
  rightsVerified: true,
  previewUseApproved: true,
  productionUseApproved: true,
  verifiedAt: '2026-07-20',
  colorProfile: 'sRGB',
  sourceType: 'Canva design export',
  designName: 'Nagotosha Hero Background v1',
  sourceAssetName: 'Nagoya - Commercial Facility on the 100-Meter Road (Hisaya-odori Park / RAYARD Hisaya-odori Park)',
  creator: 'Aflo Images',
  brand: 'アフロ',
  contentTier: 'Canva Pro',
  obtainedAt: '2026-07-20',
  transformations: [
    'Embedded an sRGB ICC profile',
    'Resized the completed Canva design export to 600 × 750 pixels',
    'Encoded as WebP at quality 89 without sharpening or color correction',
  ],
  sourceSha256: '88a42701cf93b7cf8293f78c8c18a838f0bdb7f3ebc4f0c5dd90032b488a6a94',
  outputSha256: 'cac5ce3b5733c26ae0f3311a6f6459b61dc735159fb750f4918793b28d8fab5a',
};

export type PreviewSeasonalGuide = {
  articleId: number;
  title: string;
  description: string;
  image: VerifiedImage;
  articleUrl: string;
  eventCount?: number;
};

const PREVIEW_SEASONAL_GUIDE_ARTICLE_ID = 214;
const previewSeasonalGuideEventCount = getArticleExperience(
  PREVIEW_SEASONAL_GUIDE_ARTICLE_ID,
)?.eventRoundup?.items.length;

export const PREVIEW_SEASONAL_GUIDE: PreviewSeasonalGuide = {
  articleId: PREVIEW_SEASONAL_GUIDE_ARTICLE_ID,
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
  eventCount: previewSeasonalGuideEventCount,
};

export type PreviewEditorialArticle = {
  id: number;
  title: string;
  href: string;
  category?: string;
  publishedAt?: string;
  ctaLabel: string;
};

// 2026-07-19に、公開中の公式WordPress REST APIでタイトル・URL・カテゴリを確認。
// 本文の評価、価格、営業情報はPreviewへ持ち込まない。
export const PREVIEW_EDITORIAL_ARTICLES: readonly PreviewEditorialArticle[] = [
  {
    id: 182,
    title: '【栄】名古屋初「サウィ食堂 名古屋栄店」がオープン。釜山発ナッコプセを錦3丁目で',
    href: '/article/182',
    category: 'グルメ',
    ctaLabel: 'サウィ食堂の記事を見る',
  },
  {
    id: 178,
    title: '【栄】東海初「ポーたま 名古屋HAERA店」がHAERAにオープン。名古屋限定4メニューも',
    href: '/article/178',
    category: 'グルメ',
    ctaLabel: 'ポーたまの記事を見る',
  },
  {
    id: 159,
    title: '【栄】カフェ・ラデュレ 名古屋ラシック店がオープン。マカロン発祥の老舗が手がける日本1号店カフェ',
    href: '/article/159',
    category: 'グルメ',
    ctaLabel: 'ラデュレの記事を見る',
  },
];
