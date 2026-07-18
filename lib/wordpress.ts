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

export function getFeaturedMediaUrl(post: WordPressPost): string | undefined {
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
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractBodyField(html: string | undefined, labels: string[]): string | undefined {
  if (!html) return undefined;
  const plainText = decodeHtmlEntities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '\n'));

  for (const label of labels) {
    const escaped = escapeRegExp(label);
    const cellRe = new RegExp(
      `<(?:th|dt)[^>]*>\\s*${escaped}\\s*</(?:th|dt)>\\s*<(?:td|dd)[^>]*>([\\s\\S]*?)</(?:td|dd)>`,
      'i',
    );
    const cellMatch = html.match(cellRe);
    if (cellMatch) {
      const value = cleanText(cellMatch[1]).replace(/\s+/g, ' ').trim();
      if (value) return value;
    }

    const lineRe = new RegExp(`${escaped}\\s*[:：]\\s*([^\\n]+)`);
    const lineMatch = plainText.match(lineRe);
    if (lineMatch) {
      const value = lineMatch[1].replace(/\s+/g, ' ').trim();
      if (value) return value;
    }
  }

  return undefined;
}

function normalizeOpenDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match =
    value.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/) ??
    value.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (!match) return undefined;
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function textFromHtml(html: string | undefined): string {
  return decodeHtmlEntities(html?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '\n') ?? '');
}

function getStoreName(title: string, bodyStoreName?: string, metaStoreName?: string): string {
  if (metaStoreName) return metaStoreName;
  if (bodyStoreName) return bodyStoreName;
  const quoted = title.match(/「([^」]+)」/)?.[1];
  if (quoted) return quoted.trim();
  return title.replace(/^【[^】]+】/, '').split(/[。．.、]/)[0].trim();
}

function buildPlaceLabel(area: string, address: string | undefined, contentHtml: string | undefined, title: string): string | undefined {
  const source = `${title}\n${address ?? ''}\n${textFromHtml(contentHtml)}`;
  if (source.includes('HAERA')) {
    if (/地下\s*1階|B1F?|地下1階/.test(source)) return '栄・HAERA地下1階';
    if (/地下\s*2階|B2F?|地下2階/.test(source)) return '栄・HAERA地下2階';
    return '栄・HAERA';
  }
  if (source.includes('ザ・ランドマーク名古屋栄')) return '栄・ザ・ランドマーク名古屋栄';
  if (source.includes('たての街ビル')) return '錦3丁目・たての街ビル1階';
  if (source.includes('第三堀内ビル')) return '名駅・第三堀内ビル地下1階';
  if (source.includes('メイチカ')) return '名駅・メイチカ';
  if (source.includes('松坂屋名古屋店')) return '栄・松坂屋名古屋店';
  if (source.includes('ラシック') || source.includes('LACHIC')) return '栄・ラシック';
  return area;
}

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
  const contentHtml = post.content?.rendered;
  const bodyStoreName = extractBodyField(contentHtml, ['店名', '店舗名', 'ホテル名', '施設名']);
  const bodyAddress = extractBodyField(contentHtml, ['住所', '所在地']);
  const rawOpenDate = extractBodyField(contentHtml, ['オープン日', 'オープン予定日', 'オープン予定', '開店日', '開業日', '開業予定日', '開業予定']);
  const contentText = textFromHtml(contentHtml);
  const openDate = normalizeOpenDate(safeString(meta.openDate) ?? rawOpenDate)
    ?? normalizeOpenDate(`${title} ${description}`)
    ?? normalizeOpenDate(contentText);
  const openStatus = `${title} ${description} ${rawOpenDate ?? ''}`.includes('予定') ? 'planned' : 'opened';
  const storeName = getStoreName(title, bodyStoreName, safeString(meta.storeName));
  const address = safeString(meta.address) ?? bodyAddress;
  const placeLabel = buildPlaceLabel(area, address, contentHtml, title);

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
    storeName,
    address,
    openDate,
    openStatus,
    placeLabel,
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
