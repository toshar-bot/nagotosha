export type PortalCategory =
  | 'gourmet'
  | 'event'
  | 'new-open'
  | 'cafe'
  | 'area'
  | 'game'
  | string;

export interface PortalCommercialFields {
  isPr?: boolean;
  sponsorName?: string;
  mapUrl?: string;
  mapLabel?: string;
  articleUrl?: string;
  imageUrl?: string;
  views?: number;
  saves?: number;
  mapClicks?: number;
  trackingId?: string;
  storeName?: string;
  address?: string;
  isNew?: boolean;
  publishedAt?: string;
  area?: string;
  category?: PortalCategory;
  description?: string;
}

export interface HeroSlide extends PortalCommercialFields {
  id: number | string;
  badge: string;
  title: string;
  sub: string;
  bg: string;
  accentColor: string;
  badgeBg: string;
  textShadow: string;
}

export interface FeaturedArticle extends PortalCommercialFields {
  id: string;
  tag: string;
  title: string;
  bg: string;
  accentColor: string;
}

export interface RankingItem extends PortalCommercialFields {
  id: string;
  rank: number;
  title: string;
  summary: string;
  date: string;
  bg: string;
  rankColor: string;
}

export interface MoodItem extends PortalCommercialFields {
  key: string;
  label: string;
}

export interface CategoryTab extends PortalCommercialFields {
  key: string;
  label: string;
}

export type SavedItemType = 'article' | 'store' | 'event' | 'area';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  area?: string;
  category?: PortalCategory;
  articleUrl?: string;
  mapUrl?: string;
  imageUrl?: string;
  savedAt: string;
}

/* ══════════════════════════════════════════════════════════
   WordPress REST API 由来の型
   fetch は lib/wordpress.ts でのみ行い、UI はこの型だけを使う
══════════════════════════════════════════════════════════ */

export interface WordPressRenderedField {
  rendered: string;
  protected?: boolean;
}

export interface WordPressEmbeddedMedia {
  source_url?: string;
  media_type?: string;
  mime_type?: string;
  alt_text?: string;
  width?: number;
  height?: number;
}

export interface WordPressPostMeta {
  area?: unknown;
  category?: unknown;
  storeName?: unknown;
  address?: unknown;
  mapUrl?: unknown;
  isPr?: unknown;
  sponsorName?: unknown;
  trackingId?: unknown;
  saves?: unknown;
  mapClicks?: unknown;
  [key: string]: unknown;
}

export interface WordPressPost {
  id: number;
  date: string;
  modified?: string;
  slug: string;
  link: string;
  title: WordPressRenderedField;
  excerpt: WordPressRenderedField;
  content?: WordPressRenderedField;
  meta?: WordPressPostMeta;
  _embedded?: {
    'wp:featuredmedia'?: WordPressEmbeddedMedia[];
    'wp:term'?: unknown[][];
    [key: string]: unknown;
  };
}

export interface WordPressNormalizeOptions {
  defaultArea?: string;
  defaultCategory?: string;
  defaultViews?: number;
  markAsNew?: boolean;
  defaultBg?: string;
  defaultAccentColor?: string;
  defaultRankColor?: string;
}
