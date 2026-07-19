'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';

import { resolveContentRelationship, type ContentRelationshipResolution } from '@/lib/content-relationships';
import type { HomeNewOpenStore } from '@/lib/home-new-open';
import type { FeaturedArticle } from '@/types/portal';

const THEME = {
  bg: '#F7F1E7',
  surface: '#FFFFFF',
  ink: '#1B2437',
  inkSub: '#5B6577',
  navy: '#071A4D',
  red: '#E8483F',
  gold: '#F8C861',
  green: '#1D7A4F',
  border: '#E6ECF5',
  soft: '#FBF7EF',
};

const ARCHIVE_ARTICLE_URLS = new Set(['/article/8']);
const ARCHIVE_ARTICLE_IDS = new Set(['8', 'wp-8']);
const EVENT_PATTERN = /イベント|花火|祭|まつり|フェス|開催|大会|特集|まとめ/;
const NEW_OPEN_PATTERN = /新店|オープン|NEW\s*OPEN|open/i;
const CLOSED_PATTERN = /閉店|終了|クローズ/;
const SEASON_PATTERN = /夏|雨|花火|ビアガーデン|手土産|モーニング|屋内|おでかけ|特集/;

type ArticleLike = Pick<FeaturedArticle, 'id' | 'title'> & Partial<FeaturedArticle>;
type RelationshipLabel = ContentRelationshipResolution['displayLabel'];

type HomeModel = {
  lead?: ArticleLike;
  newArticles: ArticleLike[];
  newOpen: ArticleLike[];
  features: ArticleLike[];
};

export default function PortalHomeClient({
  featuredArticles,
  newOpenStores,
}: {
  featuredArticles: FeaturedArticle[];
  gachaSourceArticles: FeaturedArticle[];
  newOpenStores: HomeNewOpenStore[];
}) {
  const model = useMemo(
    () => buildHomeModel(featuredArticles, newOpenStores),
    [featuredArticles, newOpenStores],
  );

  return (
    <div style={pageStyle}>
      <style>{HOME_CSS}</style>
      <CompactHeader />
      <main style={{ paddingBottom: 96, overflow: 'hidden' }}>
        <DecisionHero />
        {model.lead && <LeadRecommendationCard article={model.lead} />}
        <NewArticles articles={model.newArticles} />
        <NewOpen articles={model.newOpen} />
        <SeasonalFeature articles={model.features} />
        <MoodPicks />
        <CompactFooter />
      </main>
    </div>
  );
}

function buildHomeModel(
  sourceArticles: FeaturedArticle[],
  newOpenStores: HomeNewOpenStore[],
): HomeModel {
  const all = dedupeArticles(sourceArticles)
    .filter((article) => !isArchiveArticle(article))
    .map((article) => ({ ...article, articleUrl: resolveArticleHref(article) }))
    .filter(isRelationshipDisplayable);

  const used = new Set<string>();
  const lead = selectLeadRecommendation(all);
  markUsed(lead, used);

  const newOpen = newOpenStores
    .map(toVerifiedNewOpenArticle)
    .filter(isRelationshipDisplayable)
    .filter((article) => !isUsed(article, used))
    .filter(hasUsableImage)
    .slice(0, 3);
  newOpen.forEach((article) => markUsed(article, used));

  const newArticles = all
    .filter((article) => !isUsed(article, used))
    .filter(hasUsableImage)
    .sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt))
    .slice(0, 4);
  newArticles.forEach((article) => markUsed(article, used));

  const features = all
    .filter((article) => !isUsed(article, used))
    .filter(hasUsableImage)
    .filter(isSeasonalFeatureCandidate)
    .sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt))
    .slice(0, 3);

  return { lead, newArticles, newOpen, features };
}

function toVerifiedNewOpenArticle(store: HomeNewOpenStore): ArticleLike {
  return {
    id: `wp-${store.articleId}`,
    title: store.name,
    storeName: store.name,
    articleUrl: store.articleUrl,
    imageUrl: store.imageUrl,
    openDate: store.openingDate,
    placeLabel: store.placeLabel,
    tag: '新店',
    bg: THEME.surface,
    accentColor: THEME.red,
  };
}

function dedupeArticles(articles: FeaturedArticle[]): ArticleLike[] {
  const seen = new Set<string>();
  const result: ArticleLike[] = [];
  for (const article of articles) {
    const key = articleKey(article);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(article);
  }
  return result;
}

function selectLeadRecommendation(articles: ArticleLike[]): ArticleLike | undefined {
  const withImages = articles
    .filter(hasUsableImage)
    .sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt));
  const seasonal = withImages.find(isSeasonalFeatureCandidate);
  return seasonal ?? withImages[0] ?? articles[0];
}

function isRelationshipDisplayable(article: ArticleLike): boolean {
  const relationship = resolveContentRelationship(article);
  if (!relationship.displayableOnRedesignedSurfaces) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('home article excluded by relationship resolver', {
        id: article.id,
        title: article.title,
        relationship: relationship.relationship,
        validationErrors: relationship.validationErrors,
      });
    }
    return false;
  }
  return true;
}

function relationshipLabelFor(article: ArticleLike): RelationshipLabel {
  return resolveContentRelationship(article).displayLabel;
}
function hasUsableImage(article: ArticleLike): boolean {
  return typeof article.imageUrl === 'string' && /^https?:\/\//.test(article.imageUrl);
}

function isNewOpenArticle(article: ArticleLike): boolean {
  if (!article.openDate || !hasUsableImage(article)) return false;
  const haystack = textPool(article);
  if (CLOSED_PATTERN.test(haystack)) return false;
  if (EVENT_PATTERN.test(haystack)) return false;
  return NEW_OPEN_PATTERN.test(haystack) || article.isNew === true;
}

function isSeasonalFeatureCandidate(article: ArticleLike): boolean {
  const haystack = textPool(article);
  if (isNewOpenArticle(article)) return false;
  return SEASON_PATTERN.test(haystack);
}

function textPool(article: ArticleLike): string {
  return `${article.title ?? ''} ${article.tag ?? ''} ${article.description ?? ''} ${article.area ?? ''}`;
}

function articleKey(article?: ArticleLike): string | undefined {
  if (!article) return undefined;
  if (article.id) return article.id.replace(/^wp-/, '');
  const href = article.articleUrl ?? '';
  const match = href.match(/\/article\/(\d+)/);
  return match?.[1] ?? (href || undefined);
}

function isUsed(article: ArticleLike, used: Set<string>): boolean {
  const key = articleKey(article);
  return Boolean(key && used.has(key));
}

function markUsed(article: ArticleLike | undefined, used: Set<string>) {
  const key = articleKey(article);
  if (key) used.add(key);
}

function resolveArticleHref(article: ArticleLike): string {
  if (article.id?.startsWith('wp-')) return `/article/${article.id.slice(3)}`;
  const href = article.articleUrl;
  if (!href) return '/new';
  try {
    const url = new URL(href);
    const match = url.pathname.match(/\/article\/(\d+)/);
    if (match) return `/article/${match[1]}`;
  } catch {
    // Relative links are already safe to use.
  }
  return href;
}

function isArchiveArticle(article: ArticleLike) {
  const href = resolveArticleHref(article);
  return ARCHIVE_ARTICLE_URLS.has(href) || ARCHIVE_ARTICLE_IDS.has(article.id ?? '');
}

function toTime(date?: string): number {
  if (!date) return 0;
  const time = new Date(date.replace(/\./g, '-')).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatDate(date?: string): string {
  if (!date) return '';
  const normalized = date.replace(/\./g, '-');
  const d = new Date(normalized);
  if (!Number.isNaN(d.getTime())) return `${d.getMonth() + 1}/${d.getDate()}`;
  const match = date.match(/(\d{1,2})[./月](\d{1,2})/);
  if (match) return `${Number(match[1])}/${Number(match[2])}`;
  return date;
}

function mainCtaFor(article: ArticleLike): string {
  const title = article.title ?? '';
  if (title.includes('ビアガーデン')) return 'ビアガーデン記事を見る';
  if (title.includes('花火')) return '花火大会特集を見る';
  if (isNewOpenArticle(article)) return '新しいお店を見る';
  if (title.includes('雨')) return '雨の日スポットを見る';
  return '記事を読む';
}

function areaLabel(article: ArticleLike): string {
  return article.placeLabel || article.area || '名古屋';
}

function sectionCopyForHero(article: ArticleLike): string {
  if (article.description) return article.description;
  if (article.title.includes('ビアガーデン')) return '夜に行きたい候補を、写真とエリアで短く確認できます。';
  if (article.title.includes('花火')) return '開催日とエリアから、行きたい大会をすばやく選べます。';
  return '今日の候補として見やすい記事をひとつ選びました。';
}

function CompactHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  return (
    <header style={headerShellStyle}>
      <div style={headerStyle}>
        <Link href="/" aria-label="なごとしゃホーム" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, textDecoration: 'none' }}>
          <img src="/subjects/nagotosha-header-complete-tight.png" alt="なごとしゃ" style={{ width: 146, height: 42, objectFit: 'contain', objectPosition: 'left center' }} />
        </Link>
        <nav aria-label="ヘッダーメニュー" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <HeaderAction label="検索" onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }}>
            <SearchIcon />
          </HeaderAction>
          <HeaderAction label="メニュー" onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }}>
            <MenuIcon />
          </HeaderAction>
        </nav>
      </div>
      {searchOpen && (
        <form action="/new" method="get" style={headerSearchStyle}>
          <input ref={inputRef} name="tag" type="search" placeholder="店名・エリア・イベントを検索" style={headerSearchInputStyle} />
          <button type="submit" style={headerSearchButtonStyle}>検索</button>
        </form>
      )}
      {menuOpen && (
        <nav aria-label="メニュー" style={headerMenuStyle}>
          {[{ label: 'ホーム', href: '/' }, { label: '新着記事', href: '/new' }, { label: 'イベント', href: '/event' }, { label: 'エリア', href: '/area' }, { label: '保存', href: '/saved' }, { label: '掲載相談', href: '/partner' }].map((item) => (
            <Link key={item.href} href={item.href} style={headerMenuLinkStyle}>{item.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function HeaderAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} style={headerActionStyle}>
      {children}
      <span style={{ fontSize: 9.5, fontWeight: 900, lineHeight: 1 }}>{label}</span>
    </button>
  );
}

function DecisionHero() {
  return (
    <section style={decisionHeroSectionStyle}>
      <div style={decisionHeroStyle}>
        <p style={heroEyebrowStyle}>NAGOYA GUIDE</p>
        <h1 style={decisionHeroTitleStyle}>今日の名古屋、何する？</h1>
        <p style={decisionHeroCopyStyle}>行き先が決まっていなくても、気分や目的から探せます。</p>
        <form action="/new" method="get" style={decisionSearchStyle}>
          <SearchIcon />
          <input name="tag" type="search" aria-label="店名・エリア・イベントを検索" placeholder="店名・エリア・イベントを検索" style={decisionSearchInputStyle} />
          <button type="submit" style={decisionSearchButtonStyle}>検索</button>
        </form>
        <div aria-label="状況から探す" style={situationChipRowStyle}>
          <Link href="/event" style={situationChipStyle}>今週末</Link>
          <Link href="/mood/rainy" style={situationChipStyle}>雨の日</Link>
          <Link href="/new?feature=%E6%96%B0%E5%BA%97" style={situationChipStyle}>新店</Link>
        </div>
      </div>
    </section>
  );
}

function LeadRecommendationCard({ article }: { article: ArticleLike }) {
  const href = resolveArticleHref(article);
  const relationshipLabel = relationshipLabelFor(article);
  return (
    <section style={{ padding: '14px 20px 0' }}>
      <article style={leadCardStyle}>
        <div style={{ position: 'relative', aspectRatio: '3 / 2', overflow: 'hidden', borderRadius: 18, background: THEME.border }}>
          {article.imageUrl && <img src={article.imageUrl} alt="" style={coverImageStyle} fetchPriority="high" />}
          <div style={imageShadeStyle} />
          <span style={leadBadgeStyle}>季節のおすすめ</span>
          {relationshipLabel && <span style={relationshipBadgeStyle}>{relationshipLabel}</span>}
        </div>
        <div style={{ padding: '15px 2px 2px' }}>
          <h2 style={leadTitleStyle}>{article.title}</h2>
          <p style={leadCopyStyle}>{sectionCopyForHero(article)}</p>
          <div style={heroMetaStyle}>
            <span>{areaLabel(article)}</span>
            {article.tag && <span>{article.tag}</span>}
          </div>
          <Link href={href} style={primaryCtaStyle}>
            {mainCtaFor(article)}
            <ArrowIcon />
          </Link>
        </div>
      </article>
    </section>
  );
}

function NewArticles({ articles }: { articles: ArticleLike[] }) {
  if (articles.length === 0) return null;
  return (
    <section style={sectionStyle}>
      <SectionHeading title="新着記事" sub="最近公開した記事から、写真で選べるものだけを表示しています。" />
      <HorizontalRail ariaLabel="新着記事">
        {articles.map((article) => (
          <ArticleRailCard key={articleKey(article)} article={article} variant="new" />
        ))}
      </HorizontalRail>
    </section>
  );
}

function NewOpen({ articles }: { articles: ArticleLike[] }) {
  if (articles.length === 0) return null;
  return (
    <section style={sectionStyle}>
      <SectionHeading title="今月オープンしたお店" sub="開店日と場所が確認でき、使用できる写真がある新店だけ。" />
      <div style={{ display: 'grid', gap: 12 }}>
        {articles.map((article) => (
          <NewOpenCard key={articleKey(article)} article={article} />
        ))}
      </div>
    </section>
  );
}

function SeasonalFeature({ articles }: { articles: ArticleLike[] }) {
  if (articles.length === 0) return null;
  return (
    <section style={sectionStyle}>
      <SectionHeading title="季節の特集" sub="今の時期に使いやすいまとめ記事を、重複しないように選んでいます。" />
      <div style={{ display: 'grid', gap: 14 }}>
        {articles.map((article) => (
          <FeatureChapter key={articleKey(article)} article={article} />
        ))}
      </div>
    </section>
  );
}

function MoodPicks() {
  const moods = [
    { label: 'がっつり食べたい', hint: 'ごはん・麺・満足感', href: '/mood/hearty' },
    { label: 'ひとりで気軽に', hint: 'カフェ・喫茶店', href: '/mood/solo' },
    { label: 'デートで行きたい', hint: '夜景・特別感', href: '/mood/date' },
    { label: '雨の日でも楽しみたい', hint: '駅近・屋内スポット', href: '/mood/rainy' },
  ];
  return (
    <section style={sectionStyle}>
      <SectionHeading title="気分から探す" sub="目的に合わせて、次の候補へ進めます。" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {moods.map((mood) => (
          <Link key={mood.href} href={mood.href} style={moodCardStyle}>
            <span style={{ color: THEME.navy, fontSize: 13, fontWeight: 950, lineHeight: 1.3 }}>{mood.label}</span>
            <span style={{ marginTop: 5, color: THEME.inkSub, fontSize: 11, fontWeight: 800, lineHeight: 1.4 }}>{mood.hint}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CompactFooter() {
  return (
    <footer style={{ padding: '8px 20px 28px' }}>
      <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 18 }}>
        <p style={{ margin: 0, color: THEME.inkSub, fontSize: 11, fontWeight: 800, lineHeight: 1.7 }}>なごとしゃは、名古屋のおでかけ・新店・季節記事を写真から選びやすく届けます。</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          <FooterLink href="/privacy" label="プライバシー" />
          <FooterLink href="/terms" label="利用規約" />
          <FooterLink href="/partner" label="掲載相談" />
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} style={{ color: THEME.navy, fontSize: 12, fontWeight: 900, textDecoration: 'none' }}>{label}</Link>;
}

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {sub && <p style={sectionSubStyle}>{sub}</p>}
    </div>
  );
}

function HorizontalRail({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  return (
    <div className="home-v11-rail" role="list" aria-label={ariaLabel} style={railStyle}>
      {children}
    </div>
  );
}

function ArticleRailCard({ article, variant }: { article: ArticleLike; variant: 'new' | 'feature' }) {
  return (
    <Link href={resolveArticleHref(article)} role="listitem" style={railCardStyle}>
      <div style={railImageWrapStyle}>
        <img src={article.imageUrl} alt="" loading="lazy" style={coverImageStyle} />
        <span style={smallBadgeStyle}>{variant === 'new' ? '新着' : article.tag || '特集'}</span>
        <RelationshipBadge article={article} compact />
      </div>
      <div style={{ padding: '12px 12px 13px' }}>
        <h3 style={cardTitleStyle}>{article.title}</h3>
        <p style={cardMetaStyle}>{areaLabel(article)}{article.publishedAt ? ` / ${formatDate(article.publishedAt)}` : ''}</p>
      </div>
    </Link>
  );
}

function NewOpenCard({ article }: { article: ArticleLike }) {
  return (
    <Link href={resolveArticleHref(article)} style={newOpenCardStyle}>
      <div style={{ width: 116, minHeight: 116, flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: 14, background: THEME.border }}>
        <img src={article.imageUrl} alt="" loading="lazy" style={coverImageStyle} />
        <RelationshipBadge article={article} compact />
      </div>
      <div style={{ minWidth: 0, flex: 1, padding: '2px 0' }}>
        <p style={{ margin: 0, color: THEME.red, fontSize: 12, fontWeight: 950, lineHeight: 1.1 }}>{formatDate(article.openDate)} OPEN</p>
        <h3 style={{ ...cardTitleStyle, marginTop: 7 }}>{article.storeName || article.title}</h3>
        <p style={{ ...cardMetaStyle, marginTop: 8 }}>{areaLabel(article)}</p>
      </div>
    </Link>
  );
}

function FeatureChapter({ article }: { article: ArticleLike }) {
  return (
    <Link href={resolveArticleHref(article)} style={featureChapterStyle}>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 16, background: THEME.border }}>
        <img src={article.imageUrl} alt="" loading="lazy" style={coverImageStyle} />
        <RelationshipBadge article={article} />
      </div>
      <div style={{ padding: '12px 2px 0' }}>
        <p style={{ margin: 0, color: THEME.green, fontSize: 11, fontWeight: 950 }}>{article.tag || '特集'}</p>
        <h3 style={{ margin: '5px 0 0', color: THEME.navy, fontSize: 18, lineHeight: 1.36, fontWeight: 950 }}>{article.title}</h3>
        {article.description && <p style={{ margin: '7px 0 0', color: THEME.inkSub, fontSize: 12.5, lineHeight: 1.65, fontWeight: 800 }}>{article.description}</p>}
      </div>
    </Link>
  );
}

function RelationshipBadge({ article, compact = false }: { article: ArticleLike; compact?: boolean }) {
  const label = relationshipLabelFor(article);
  if (!label) return null;
  return <span style={compact ? compactRelationshipBadgeStyle : floatingRelationshipBadgeStyle}>{label}</span>;
}
function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

const HOME_CSS = `
.home-v11-rail::-webkit-scrollbar{display:none}
@media (prefers-reduced-motion: reduce){
  .home-v11-interactive{transition:none!important;transform:none!important}
}
`;

const pageStyle: CSSProperties = {
  minHeight: '100dvh',
  background: THEME.bg,
  color: THEME.ink,
  overflowX: 'hidden',
};

const headerShellStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 20,
  background: 'rgba(255,255,255,.96)',
  borderBottom: '1px solid rgba(230,236,245,.9)',
};

const headerStyle: CSSProperties = {
  minHeight: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '6px 16px',
};

const headerActionStyle: CSSProperties = {
  width: 48,
  height: 44,
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  border: `1px solid ${THEME.border}`,
  borderRadius: 13,
  background: '#fff',
  color: THEME.navy,
  cursor: 'pointer',
};

const headerSearchStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '0 16px 10px',
  background: '#fff',
};

const headerSearchInputStyle: CSSProperties = {
  minWidth: 0,
  flex: 1,
  height: 44,
  borderRadius: 999,
  border: `1px solid ${THEME.border}`,
  background: THEME.soft,
  padding: '0 14px',
  color: THEME.navy,
  fontSize: 14,
  fontWeight: 800,
  outline: 'none',
};

const headerSearchButtonStyle: CSSProperties = {
  minWidth: 66,
  height: 44,
  border: 0,
  borderRadius: 999,
  background: THEME.navy,
  color: '#fff',
  fontSize: 13,
  fontWeight: 950,
};

const headerMenuStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
  margin: '0 16px 12px',
  padding: 10,
  borderRadius: 18,
  border: `1px solid ${THEME.border}`,
  background: '#fff',
  boxShadow: '0 10px 24px rgba(7,26,77,.09)',
};

const headerMenuLinkStyle: CSSProperties = {
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 13,
  background: THEME.soft,
  color: THEME.navy,
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 950,
};

const decisionHeroSectionStyle: CSSProperties = {
  padding: '14px 20px 0',
};

const decisionHeroStyle: CSSProperties = {
  borderRadius: 22,
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)',
  padding: '20px 16px 16px',
  border: `1px solid ${THEME.border}`,
  boxShadow: '0 6px 16px rgba(7,26,77,.06)',
};

const decisionHeroTitleStyle: CSSProperties = {
  margin: '6px 0 0',
  color: THEME.navy,
  fontSize: 29,
  lineHeight: 1.18,
  fontWeight: 950,
  letterSpacing: 0,
};

const decisionHeroCopyStyle: CSSProperties = {
  margin: '10px 0 0',
  color: THEME.inkSub,
  fontSize: 13.5,
  lineHeight: 1.7,
  fontWeight: 800,
};

const decisionSearchStyle: CSSProperties = {
  minHeight: 52,
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  marginTop: 16,
  padding: '0 8px 0 14px',
  borderRadius: 14,
  background: '#fff',
  border: `1px solid ${THEME.border}`,
  boxShadow: '0 8px 18px rgba(7,26,77,.08)',
  color: THEME.navy,
};

const decisionSearchInputStyle: CSSProperties = {
  minWidth: 0,
  flex: 1,
  height: 48,
  border: 0,
  outline: 'none',
  background: 'transparent',
  color: THEME.navy,
  fontSize: 13,
  fontWeight: 850,
};

const decisionSearchButtonStyle: CSSProperties = {
  minWidth: 58,
  height: 44,
  border: 0,
  borderRadius: 12,
  background: THEME.navy,
  color: '#fff',
  fontSize: 13,
  fontWeight: 950,
};

const situationChipRowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  marginTop: 12,
  paddingBottom: 2,
  scrollbarWidth: 'none',
};

const situationChipStyle: CSSProperties = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  padding: '0 15px',
  borderRadius: 999,
  background: THEME.surface,
  border: `1px solid ${THEME.border}`,
  color: THEME.navy,
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 950,
};

const leadCardStyle: CSSProperties = {
  borderRadius: 22,
  background: THEME.surface,
  padding: 10,
  border: `1px solid ${THEME.border}`,
  boxShadow: '0 6px 16px rgba(7,26,77,.07)',
};

const leadBadgeStyle: CSSProperties = {
  position: 'absolute',
  left: 10,
  top: 10,
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 30,
  padding: '0 10px',
  borderRadius: 999,
  background: THEME.gold,
  color: THEME.navy,
  fontSize: 12,
  fontWeight: 950,
  boxShadow: '0 6px 14px rgba(7,26,77,.16)',
};

const leadTitleStyle: CSSProperties = {
  margin: 0,
  color: THEME.navy,
  fontSize: 22,
  lineHeight: 1.28,
  fontWeight: 950,
  letterSpacing: 0,
};

const leadCopyStyle: CSSProperties = {
  margin: '9px 0 0',
  color: THEME.inkSub,
  fontSize: 13,
  lineHeight: 1.68,
  fontWeight: 800,
};

const coverImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const imageShadeStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(180deg, rgba(7,26,77,0) 38%, rgba(7,26,77,.28) 100%)',
  pointerEvents: 'none',
};

const relationshipBadgeStyle: CSSProperties = {
  position: 'absolute',
  right: 10,
  top: 10,
  display: 'inline-flex',
  minHeight: 28,
  alignItems: 'center',
  padding: '0 9px',
  borderRadius: 999,
  background: 'rgba(7,26,77,.88)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 950,
};

const heroEyebrowStyle: CSSProperties = {
  margin: 0,
  color: THEME.red,
  fontSize: 12,
  fontWeight: 950,
  lineHeight: 1.4,
};

const heroMetaStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 12,
  color: THEME.inkSub,
  fontSize: 12,
  fontWeight: 900,
};

const primaryCtaStyle: CSSProperties = {
  minHeight: 52,
  marginTop: 16,
  display: 'inline-flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderRadius: 12,
  background: THEME.navy,
  color: '#fff',
  textDecoration: 'none',
  fontSize: 15,
  fontWeight: 950,
  boxShadow: '0 10px 22px rgba(7,26,77,.18)',
};

const sectionStyle: CSSProperties = {
  padding: '48px 20px 0',
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: THEME.navy,
  fontSize: 22,
  lineHeight: 1.25,
  fontWeight: 950,
  letterSpacing: 0,
};

const sectionSubStyle: CSSProperties = {
  margin: '6px 0 0',
  color: THEME.inkSub,
  fontSize: 12.5,
  lineHeight: 1.65,
  fontWeight: 800,
};

const railStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  padding: '1px 20px 6px 0',
  marginRight: -20,
  scrollbarWidth: 'none',
};

const railCardStyle: CSSProperties = {
  flex: '0 0 min(242px, calc(100vw - 96px))',
  scrollSnapAlign: 'start',
  overflow: 'hidden',
  borderRadius: 16,
  background: THEME.surface,
  color: THEME.ink,
  textDecoration: 'none',
  border: `1px solid ${THEME.border}`,
  boxShadow: '0 6px 16px rgba(7,26,77,.07)',
};

const railImageWrapStyle: CSSProperties = {
  position: 'relative',
  aspectRatio: '4 / 3',
  overflow: 'hidden',
  background: THEME.border,
};

const smallBadgeStyle: CSSProperties = {
  position: 'absolute',
  left: 9,
  top: 9,
  borderRadius: 999,
  background: THEME.surface,
  color: THEME.navy,
  padding: '5px 8px',
  fontSize: 10,
  fontWeight: 950,
  boxShadow: '0 5px 12px rgba(7,26,77,.14)',
};

const floatingRelationshipBadgeStyle: CSSProperties = {
  position: 'absolute',
  right: 9,
  bottom: 9,
  borderRadius: 999,
  background: 'rgba(7,26,77,.88)',
  color: '#fff',
  padding: '5px 8px',
  fontSize: 10,
  fontWeight: 950,
  boxShadow: '0 5px 12px rgba(7,26,77,.16)',
};

const compactRelationshipBadgeStyle: CSSProperties = {
  ...floatingRelationshipBadgeStyle,
  right: 8,
  bottom: 8,
  fontSize: 9.5,
  padding: '4px 7px',
};
const cardTitleStyle: CSSProperties = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  margin: 0,
  color: THEME.ink,
  fontSize: 14,
  lineHeight: 1.38,
  fontWeight: 950,
};

const cardMetaStyle: CSSProperties = {
  margin: '9px 0 0',
  color: THEME.inkSub,
  fontSize: 11,
  lineHeight: 1.45,
  fontWeight: 850,
};

const newOpenCardStyle: CSSProperties = {
  display: 'flex',
  gap: 13,
  minHeight: 136,
  padding: 10,
  borderRadius: 16,
  background: THEME.surface,
  color: THEME.ink,
  textDecoration: 'none',
  border: `1px solid ${THEME.border}`,
  boxShadow: '0 6px 16px rgba(7,26,77,.07)',
};

const featureChapterStyle: CSSProperties = {
  display: 'block',
  padding: 10,
  borderRadius: 16,
  background: THEME.surface,
  color: THEME.ink,
  textDecoration: 'none',
  border: `1px solid ${THEME.border}`,
  boxShadow: '0 6px 16px rgba(7,26,77,.07)',
};

const moodCardStyle: CSSProperties = {
  minHeight: 98,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: 14,
  borderRadius: 16,
  background: THEME.surface,
  color: THEME.ink,
  textDecoration: 'none',
  border: `1px solid ${THEME.border}`,
  boxShadow: '0 6px 16px rgba(7,26,77,.07)',
};
