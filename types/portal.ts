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
