import type {
  FeaturedArticle,
  RankingItem,
  WordPressNormalizeOptions,
  WordPressPost,
} from '@/types/portal';

/* ══════════════════════════════════════════════════════════
   HTML ユーティリティ
══════════════════════════════════════════════════════════ */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&amp;':    '&',
  '&lt;':     '<',
  '&gt;':     '>',
  '&quot;':   '"',
  '&#039;':   "'",
  '&#39;':    "'",
  '&apos;':   "'",
  '&nbsp;':   ' ',
  '&mdash;':  '—',
  '&ndash;':  '–',
  '&hellip;': '…',
  '&laquo;':  '«',
  '&raquo;':  '»',
  '&#8216;':  '‘',
  '&#8217;':  '’',
  '&#8220;':  '“',
  '&#8221;':  '”',
  '&#8211;':  '–',
  '&#8212;':  '—',
};

export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

export function decodeHtmlEntities(input: string): string {
  if (!input) return '';
  return input.replace(/&[#a-zA-Z0-9]+;/g, (entity) => {
    if (entity in HTML_ENTITY_MAP) return HTML_ENTITY_MAP[entity];
    const numeric = entity.match(/^&#(\d+);$/);
    if (numeric) return String.fromCharCode(parseInt(numeric[1], 10));
    const hex = entity.match(/^&#x([0-9a-fA-F]+);$/);
    if (hex) return String.fromCharCode(parseInt(hex[1], 16));
    return entity;
  });
}

/* ══════════════════════════════════════════════════════════
   内部ヘルパー（型安全）
══════════════════════════════════════════════════════════ */

function cleanText(html: string): string {
  return decodeHtmlEntities(stripHtml(html));
}

function safeString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function safeBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

function safeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

function getFeaturedMediaUrl(post: WordPressPost): string | undefined {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return '';
  }
}

/* ── ビジュアルフォールバック ── */
const DEFAULT_BG_FEATURED  = 'linear-gradient(145deg, #eef6ff 0%, #c8dff0 55%, #90b8d8 100%)';
const DEFAULT_BG_RANKING   = 'linear-gradient(128deg, #eef6ff 0%, #b8d4f0 60%, #88a8d8 100%)';
const DEFAULT_ACCENT_COLOR = '#1d5b73';
const DEFAULT_RANK_COLOR   = '#1d5b73';

/* ══════════════════════════════════════════════════════════
   正規化関数
══════════════════════════════════════════════════════════ */

export function normalizeWordPressPostToFeaturedArticle(
  post: WordPressPost,
  options?: WordPressNormalizeOptions,
): FeaturedArticle {
  const meta        = post.meta ?? {};
  const title       = cleanText(post.title.rendered);
  const description = cleanText(post.excerpt.rendered);
  const area        = safeString(meta.area)     ?? options?.defaultArea     ?? '名古屋';
  const tag         = safeString(meta.category) ?? options?.defaultCategory ?? '新着';
  const isPr        = safeBoolean(meta.isPr);

  return {
    id:          `wp-${post.id}`,
    title,
    description: description || undefined,
    tag,
    area,
    articleUrl:  post.link,
    imageUrl:    getFeaturedMediaUrl(post),
    publishedAt: post.date,
    isNew:       options?.markAsNew === true,
    isPr:        isPr ? true : undefined,
    sponsorName: safeString(meta.sponsorName),
    storeName:   safeString(meta.storeName),
    address:     safeString(meta.address),
    mapUrl:      safeString(meta.mapUrl),
    trackingId:  safeString(meta.trackingId),
    saves:       safeNumber(meta.saves),
    mapClicks:   safeNumber(meta.mapClicks),
    bg:          options?.defaultBg          ?? DEFAULT_BG_FEATURED,
    accentColor: options?.defaultAccentColor ?? DEFAULT_ACCENT_COLOR,
  };
}

export function normalizeWordPressPostToRankingItem(
  post: WordPressPost,
  rank: number,
  options?: WordPressNormalizeOptions,
): RankingItem {
  const meta    = post.meta ?? {};
  const title   = cleanText(post.title.rendered);
  const summary = cleanText(post.excerpt.rendered) || title;
  const area    = safeString(meta.area) ?? options?.defaultArea ?? '名古屋';
  const isPr    = safeBoolean(meta.isPr);

  return {
    id:          `wp-ranking-${post.id}`,
    rank,
    title,
    summary,
    date:        formatDate(post.date),
    area,
    views:       options?.defaultViews ?? 0,
    articleUrl:  post.link,
    imageUrl:    getFeaturedMediaUrl(post),
    isPr:        isPr ? true : undefined,
    sponsorName: safeString(meta.sponsorName),
    storeName:   safeString(meta.storeName),
    address:     safeString(meta.address),
    mapUrl:      safeString(meta.mapUrl),
    trackingId:  safeString(meta.trackingId),
    saves:       safeNumber(meta.saves),
    mapClicks:   safeNumber(meta.mapClicks),
    bg:          options?.defaultBg        ?? DEFAULT_BG_RANKING,
    rankColor:   options?.defaultRankColor ?? DEFAULT_RANK_COLOR,
  };
}

export function normalizeWordPressPostsToFeaturedArticles(
  posts: WordPressPost[],
  options?: WordPressNormalizeOptions,
): FeaturedArticle[] {
  return posts.map(post => normalizeWordPressPostToFeaturedArticle(post, options));
}

export function normalizeWordPressPostsToRankingItems(
  posts: WordPressPost[],
  options?: WordPressNormalizeOptions,
): RankingItem[] {
  return posts.map((post, i) => normalizeWordPressPostToRankingItem(post, i + 1, options));
}
