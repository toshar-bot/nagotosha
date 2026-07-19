import { getFeaturedNewOpenSpots, type ShopSpot } from '@/lib/article-experience';
import type { CommercialDisclosure, ContentRelationship } from '@/types/portal';

type VerifiedHomeNewOpenRelationship = {
  relationship: Exclude<ContentRelationship, 'unknown'>;
  relationshipExplanation?: string;
  commercialDisclosure?: CommercialDisclosure;
};

export type HomeNewOpenStore = VerifiedHomeNewOpenRelationship & {
  articleId: number;
  registryId: string;
  name: string;
  articleUrl: string;
  imageUrl: string;
  openingDate: string;
  placeLabel: string;
  officialUrl: string;
  source: string;
};

const VERIFIED_HOME_NEW_OPEN_RELATIONSHIPS: Readonly<
  Record<number, VerifiedHomeNewOpenRelationship>
> = {
  92: { relationship: 'editorial' },
  32: { relationship: 'editorial' },
};

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ARTICLE_URL_PATTERN = /^\/article\/(\d+)$/;

export function isRealIsoDate(value: string): boolean {
  const match = value.match(ISO_DATE_PATTERN);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

function isHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function selectVerifiedHomeNewOpenStores(
  spots: readonly ShopSpot[],
  limit = 8,
): HomeNewOpenStore[] {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;

  return spots
    .filter((spot) => spot.type === 'new-open')
    .filter((spot) => spot.isFeatured === true)
    .filter((spot) => isRealIsoDate(spot.openDate))
    .filter((spot) => spot.source.trim().length > 0)
    .flatMap((spot) => {
      const articleMatch = spot.articleUrl.match(ARTICLE_URL_PATTERN);
      if (!articleMatch || !spot.name.trim() || !isHttpUrl(spot.officialUrl)) return [];

      const articleId = Number(articleMatch[1]);
      const relationship = VERIFIED_HOME_NEW_OPEN_RELATIONSHIPS[articleId];
      if (!relationship) return [];

      return [{
        articleId,
        registryId: spot.id,
        name: spot.name.trim(),
        articleUrl: spot.articleUrl,
        imageUrl: spot.imageUrl ?? '',
        openingDate: spot.openDate,
        placeLabel: spot.areaLabel.trim(),
        officialUrl: spot.officialUrl.trim(),
        source: spot.source.trim(),
        ...relationship,
      }];
    })
    .sort((a, b) => b.openingDate.localeCompare(a.openingDate))
    .slice(0, safeLimit);
}

export function getVerifiedHomeNewOpenStores(limit = 8): HomeNewOpenStore[] {
  return selectVerifiedHomeNewOpenStores(getFeaturedNewOpenSpots(Number.MAX_SAFE_INTEGER), limit);
}
