import type { Metadata } from 'next';
import Link from 'next/link';
import { NewArticleCardClient } from '@/components/NewArticleCardClient';
import { FEATURED_ARTICLES } from '@/data/portal';
import { getPortalArticlesWithFallback } from '@/lib/wordpress-fetch';
import type { FeaturedArticle } from '@/types/portal';

const JP = {
  description: '\u540d\u53e4\u5c4b\u306e\u65b0\u7740\u30b0\u30eb\u30e1\u3001\u30a4\u30d9\u30f3\u30c8\u3001\u304a\u3067\u304b\u3051\u60c5\u5831\u3092\u307e\u3068\u3081\u3066\u30c1\u30a7\u30c3\u30af\u3067\u304d\u307e\u3059\u3002',
  siteName: '\u306a\u3054\u3068\u3057\u3083',
  metaTitle: '\u65b0\u7740\u8a18\u4e8b\uff5c\u306a\u3054\u3068\u3057\u3083',
  pageTitle: '\u65b0\u7740\u8a18\u4e8b',
  pageLead: '\u65b0\u5e97\u30aa\u30fc\u30d7\u30f3\u3001\u8a71\u984c\u306e\u30b9\u30dd\u30c3\u30c8\u3001\u65b0\u3057\u3044\u8a18\u4e8b\u3092\u307e\u3068\u3081\u3066\u30c1\u30a7\u30c3\u30af\u3067\u304d\u307e\u3059\u3002',
  all: '\u3059\u3079\u3066',
  newOpen: '\u65b0\u5e97',
  gourmet: '\u30b0\u30eb\u30e1',
  event: '\u30a4\u30d9\u30f3\u30c8',
  cafe: '\u30ab\u30d5\u30a7',
  articlesCount: '\u4ef6\u306e\u8a18\u4e8b',
  noArticles: '\u8a72\u5f53\u3059\u308b\u8a18\u4e8b\u304c\u3042\u308a\u307e\u305b\u3093',
  noArticlesLead: '\u6761\u4ef6\u3092\u5909\u3048\u3066\u3001\u3082\u3046\u4e00\u5ea6\u63a2\u3057\u3066\u307f\u3066\u304f\u3060\u3055\u3044\u3002',
  nextLead: '\u8a18\u4e8b\u3092\u8aad\u3093\u3060\u3089\u6b21\u306b\u63a2\u3059',
  areaLink: '\u30a8\u30ea\u30a2\u304b\u3089\u63a2\u3059',
  areaDescription: '\u6c17\u306b\u306a\u308b\u304a\u5e97\u3084\u30a4\u30d9\u30f3\u30c8\u3092\u3001\u540d\u99c5\u30fb\u6804\u30fb\u5927\u9808\u306a\u3069\u306e\u30a8\u30ea\u30a2\u5225\u306b\u63a2\u305b\u307e\u3059\u3002',
  eventLink: '\u30a4\u30d9\u30f3\u30c8\u3092\u898b\u308b',
  eventDescription: '\u4eca\u65e5\u884c\u3051\u308b\u30a4\u30d9\u30f3\u30c8\u3084\u9031\u672b\u306e\u304a\u3067\u304b\u3051\u60c5\u5831\u3092\u30c1\u30a7\u30c3\u30af\u3067\u304d\u307e\u3059\u3002',
  savedLink: '\u4fdd\u5b58\u3057\u305f\u8a18\u4e8b\u3092\u898b\u308b',
  savedDescription: '\u6c17\u306b\u306a\u308b\u8a18\u4e8b\u3084\u304a\u5e97\u3092\u4fdd\u5b58\u3057\u3066\u3001\u3042\u3068\u304b\u3089\u898b\u8fd4\u305b\u307e\u3059\u3002',
  partnerTitle: '\u65b0\u5e97\u30fb\u30a4\u30d9\u30f3\u30c8\u544a\u77e5\u3092\u3057\u305f\u3044\u304a\u5e97\u3078',
  partnerDescription: '\u65b0\u5e97\u30aa\u30fc\u30d7\u30f3\u3001\u671f\u9593\u9650\u5b9a\u30e1\u30cb\u30e5\u30fc\u3001\u9031\u672b\u30a4\u30d9\u30f3\u30c8\u306a\u3069\u3001\u540d\u53e4\u5c4b\u306e\u304a\u5e97\u5411\u3051\u306e\u63b2\u8f09\u76f8\u8ac7\u3092\u53d7\u3051\u4ed8\u3051\u3066\u3044\u307e\u3059\u3002',
  partnerCta: '\u63b2\u8f09\u306b\u3064\u3044\u3066\u76f8\u8ac7\u3059\u308b',
  articleAriaSuffix: '\u306e\u8a18\u4e8b\u3092\u898b\u308b',
  newFeatureWords: ['new', 'new-open', '\u65b0\u5e97'],
  openWords: ['\u65b0\u5e97', '\u30aa\u30fc\u30d7\u30f3'],
};

export const metadata: Metadata = {
  title: JP.metaTitle,
  description: JP.description,
  openGraph: {
    title: JP.metaTitle,
    description: JP.description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: JP.siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: JP.metaTitle,
    description: JP.description,
    images: ['/opengraph-image'],
  },
};

const FILTER_TABS = [
  { label: JP.all, href: '/new', tagParam: undefined as string | undefined },
  { label: JP.newOpen, href: `/new?feature=${encodeURIComponent(JP.newOpen)}`, featureParam: JP.newOpen },
  { label: JP.gourmet, href: `/new?tag=${encodeURIComponent(JP.gourmet)}`, tagParam: JP.gourmet },
  { label: JP.event, href: `/new?tag=${encodeURIComponent(JP.event)}`, tagParam: JP.event },
  { label: JP.cafe, href: `/new?type=${encodeURIComponent(JP.cafe)}`, typeParam: JP.cafe },
];

const NAV_LINKS = [
  {
    href: '/area',
    label: JP.areaLink,
    description: JP.areaDescription,
    icon: <NavMapIcon />,
  },
  {
    href: '/event',
    label: JP.eventLink,
    description: JP.eventDescription,
    icon: <NavCalendarIcon />,
  },
  {
    href: '/saved',
    label: JP.savedLink,
    description: JP.savedDescription,
    icon: <NavBookmarkIcon />,
  },
] as const;

type NewSearchParams = {
  tag?: string | string[];
  area?: string | string[];
  type?: string | string[];
  feature?: string | string[];
};

export default async function NewPage({
  searchParams,
}: {
  searchParams?: NewSearchParams;
}) {
  const articles = await getPortalArticlesWithFallback(FEATURED_ARTICLES);
  const filters = {
    tag: queryValue(searchParams?.tag),
    area: queryValue(searchParams?.area),
    type: queryValue(searchParams?.type),
    feature: queryValue(searchParams?.feature),
  };
  const filteredArticles = filterArticles(articles, filters);

  return (
    <main className="min-h-dvh pb-28" style={{ background: '#ffffff' }}>
      <section className="px-4 pt-8 pb-5">
        <p className="text-[10px] font-black tracking-[0.22em]" style={{ color: '#E8483F' }}>
          NEW ARTICLES
        </p>
        <h1 className="mt-1 text-[28px] font-black leading-tight tracking-tight" style={{ color: '#071A4D' }}>
          {JP.pageTitle}
        </h1>
        <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
          {JP.pageLead}
        </p>
      </section>

      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 pr-4" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
          {FILTER_TABS.map(tab => {
            const isActive = isFilterTabActive(tab, filters);
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className="flex shrink-0 items-center rounded-[16px] px-[17px] text-[13px] font-black no-underline"
                style={
                  isActive
                    ? {
                        height: 44,
                        color: '#ffffff',
                        background: '#E8483F',
                        boxShadow: '0 7px 16px rgba(232,72,63,0.22)',
                        textDecoration: 'none',
                      }
                    : {
                        height: 44,
                        color: '#071A4D',
                        background: '#ffffff',
                        border: '1px solid #F1B9B5',
                        textDecoration: 'none',
                      }
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-[11px] font-bold" style={{ color: '#667085' }}>
          {filteredArticles.length}
          {JP.articlesCount}
        </p>
      </div>

      <section className="px-4">
        {filteredArticles.length > 0 ? (
          <div className="flex flex-col gap-5">
            {filteredArticles.map((article, index) => (
              <NewArticleCardClient
                key={article.id}
                article={article}
                imageUrl={article.imageUrl ?? getFallbackArticleImageUrl(article, index)}
                hookLine={getArticleHookLine(article)}
              />
            ))}
          </div>
        ) : (
          <div
            className="rounded-[18px] bg-white px-5 py-8 text-center"
            style={{
              border: '1px solid #E6ECF5',
              boxShadow: '0 8px 24px rgba(7,26,77,0.07)',
            }}
          >
            <p className="text-[15px] font-black" style={{ color: '#071A4D' }}>
              {JP.noArticles}
            </p>
            <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
              {JP.noArticlesLead}
            </p>
          </div>
        )}
      </section>

      <section className="px-4 pt-12">
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(232,72,63,0.36)' }} />
          <span className="text-[15px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
            NEXT
          </span>
          <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(232,72,63,0.36)' }} />
        </div>
        <p className="mt-2 text-center text-[13px] font-black" style={{ color: '#071A4D' }}>
          {JP.nextLead}
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {NAV_LINKS.map(nav => (
            <Link
              key={nav.href}
              href={nav.href}
              className="flex items-center gap-3 rounded-[14px] bg-white px-4 py-4 no-underline transition-transform active:scale-[0.98]"
              style={{
                border: '1px solid #E6ECF5',
                boxShadow: '0 4px 12px rgba(7,26,77,0.07)',
                textDecoration: 'none',
              }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(232,72,63,0.08)' }}>
                {nav.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
                  {nav.label}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium leading-5" style={{ color: '#667085' }}>
                  {nav.description}
                </span>
              </span>
              <ChevronRightIcon />
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8 pb-2">
        <div
          className="rounded-[18px] px-5 py-6"
          style={{
            background: 'linear-gradient(135deg, #FFF1ED 0%, #FFE0DD 48%, #FFF4D7 100%)',
            border: '1.5px solid rgba(232,72,63,0.14)',
          }}
        >
          <p className="mb-2 text-[10px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
            PARTNER
          </p>
          <h2 className="text-[17px] font-black leading-snug" style={{ color: '#071A4D' }}>
            {JP.partnerTitle}
          </h2>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
            {JP.partnerDescription}
          </p>
          <Link
            href="/partner"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-black text-white no-underline transition-transform active:scale-[0.98]"
            style={{
              background: '#E8483F',
              boxShadow: '0 12px 24px rgba(232,72,63,0.30)',
              textDecoration: 'none',
            }}
          >
            {JP.partnerCta}
            <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}

function queryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function isFilterTabActive(
  tab: (typeof FILTER_TABS)[number],
  filters: { tag?: string; area?: string; type?: string; feature?: string },
): boolean {
  const hasAnyFilter = Boolean(filters.tag || filters.area || filters.type || filters.feature);
  if (!hasAnyFilter) return tab.href === '/new';
  return (
    ('tagParam' in tab && tab.tagParam === filters.tag) ||
    ('typeParam' in tab && tab.typeParam === filters.type) ||
    ('featureParam' in tab && tab.featureParam === filters.feature)
  );
}

function filterArticles(
  articles: FeaturedArticle[],
  filters: { tag?: string; area?: string; type?: string; feature?: string },
): FeaturedArticle[] {
  const values = Object.values(filters)
    .map(value => normalizeSearchText(value))
    .filter(Boolean);

  if (values.length === 0) return articles;

  return articles.filter(article => {
    const haystack = normalizeSearchText(
      [
        article.title,
        article.description,
        article.tag,
        article.area,
        article.category,
        article.isNew ? 'NEW new new-open \u65b0\u5e97 \u30aa\u30fc\u30d7\u30f3' : '',
        article.isPr ? 'PR pr' : '',
      ]
        .filter(Boolean)
        .join(' '),
    );

    return values.some(value => haystack.includes(value));
  });
}

function normalizeSearchText(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getFallbackArticleImageUrl(article: FeaturedArticle, index: number): string | undefined {
  const keyword = normalizeSearchText(`${article.tag} ${article.category ?? ''} ${article.title} ${article.description ?? ''}`);
  const fallback =
    pickFallbackArticle(keyword, [JP.cafe, '\u73c8\u7432', '\u30b3\u30fc\u30d2\u30fc'], index) ??
    pickFallbackArticle(keyword, ['\u30d1\u30f3', '\u30b9\u30a4\u30fc\u30c4'], index) ??
    pickFallbackArticle(keyword, [JP.gourmet, '\u6599\u7406', '\u30ec\u30b9\u30c8\u30e9\u30f3', '\u30e9\u30fc\u30e1\u30f3', '\u30e9\u30f3\u30c1'], index) ??
    pickFallbackArticle(keyword, [JP.event, '\u796d\u308a', '\u9031\u672b'], index) ??
    pickFallbackArticle(keyword, [JP.newOpen, '\u30aa\u30fc\u30d7\u30f3'], index) ??
    pickAnyFallbackArticle(article, index);

  return fallback?.imageUrl;
}

function pickFallbackArticle(keyword: string, words: string[], index: number): FeaturedArticle | undefined {
  if (!words.some(word => keyword.includes(word.toLowerCase()))) return undefined;
  const candidates = FEATURED_ARTICLES.filter(item => {
    const source = normalizeSearchText(`${item.tag} ${item.title} ${item.description ?? ''}`);
    return words.some(word => source.includes(word.toLowerCase())) && Boolean(item.imageUrl);
  });
  return pickFromCandidates(candidates, keyword || String(index));
}

function pickAnyFallbackArticle(article: FeaturedArticle, index: number): FeaturedArticle | undefined {
  const candidates = FEATURED_ARTICLES.filter(item => item.imageUrl);
  return pickFromCandidates(candidates, `${article.id}-${article.title}-${index}`);
}

function pickFromCandidates(candidates: FeaturedArticle[], seed: string): FeaturedArticle | undefined {
  if (candidates.length === 0) return undefined;
  const hash = getStableHash(seed);
  return candidates[hash % candidates.length];
}

function getArticleHookLine(article: FeaturedArticle): string {
  const source = normalizeSearchText(`${article.title} ${article.description ?? ''} ${article.tag} ${article.area ?? ''}`);
  if (article.isNew || JP.openWords.some(word => source.includes(normalizeSearchText(word)))) {
    return '\u9031\u672b\u306b\u3061\u3087\u3046\u3069\u3044\u3044\u3001\u540d\u53e4\u5c4b\u306e\u65b0\u30b9\u30dd\u30c3\u30c8\u3002';
  }
  if (source.includes(normalizeSearchText(JP.cafe)) || source.includes('\u73c8\u7432') || source.includes('\u30b3\u30fc\u30d2\u30fc')) {
    return '\u99c5\u8fd1\u3067\u3075\u3089\u3063\u3068\u5bc4\u308c\u308b\u3001\u6c17\u306b\u306a\u308b\u4e00\u8ed2\u3002';
  }
  if (source.includes(normalizeSearchText(JP.event)) || source.includes('\u9031\u672b') || source.includes('\u796d\u308a')) {
    return '\u4eca\u884c\u304d\u305f\u3044\u3001\u540d\u53e4\u5c4b\u306e\u304a\u3067\u304b\u3051\u8a71\u984c\u3002';
  }
  if (source.includes(normalizeSearchText(JP.gourmet)) || source.includes('\u30b0\u30eb\u30e1') || source.includes('\u6599\u7406')) {
    return '\u5199\u771f\u3067\u898b\u305f\u3089\u6c17\u306b\u306a\u308b\u3001\u540d\u53e4\u5c4b\u306e\u8a71\u984c\u5e97\u3002';
  }
  return '\u3053\u308c\u306f\u884c\u304d\u305f\u3044\u3002\u540d\u53e4\u5c4b\u306e\u6c17\u306b\u306a\u308b\u8a71\u984c\u3002';
}

function getStableHash(value: string): number {
  return Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4CEDD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function NavMapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8483F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function NavCalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8483F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function NavBookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8483F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
