import type { Metadata } from 'next';
import { FEATURED_ARTICLES } from '@/data/portal';
import { getPortalArticlesWithFallback } from '@/lib/wordpress-fetch';
import type { FeaturedArticle } from '@/types/portal';

const description = '名古屋の新着グルメ、イベント、おでかけ情報をまとめてチェックできます。';

export const metadata: Metadata = {
  title: '新着記事｜なごとしゃ',
  description,
  openGraph: {
    title: '新着記事｜なごとしゃ',
    description,
    type: 'website',
  },
};

const FILTER_TABS = [
  { label: 'すべて',   active: true  },
  { label: '新店',     active: false },
  { label: 'グルメ',   active: false },
  { label: 'イベント', active: false },
  { label: 'カフェ',   active: false },
];

export default async function NewPage() {
  const articles = await getPortalArticlesWithFallback(FEATURED_ARTICLES);

  return (
    <main
      className="min-h-dvh pb-28"
      style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}
    >
      {/* ── ヒーロー ── */}
      <section className="relative overflow-hidden px-5 pt-7 pb-6">
        <div
          className="absolute inset-x-0 top-0 h-56"
          style={{
            background:
              'radial-gradient(circle at 18% 8%, rgba(255,255,255,0.92) 0%, transparent 36%), radial-gradient(circle at 85% 18%, rgba(10,154,154,0.14) 0%, transparent 34%)',
          }}
        />
        <div className="relative">
          <p className="text-[10px] font-black tracking-[0.22em] mb-3" style={{ color: '#0a9a9a' }}>
            NEW
          </p>
          <h1 className="text-[28px] font-black leading-tight tracking-tight" style={{ color: '#0a2438' }}>
            新着・NEW!
          </h1>
          <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>
            新店オープン、話題のスポット、新しい記事をまとめてチェックできます。
          </p>
        </div>
      </section>

      {/* ── フィルタータブ（静的） ── */}
      <div className="px-4 pb-2">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
        >
          {FILTER_TABS.map(tab => (
            <span
              key={tab.label}
              className="shrink-0 rounded-full px-3.5 py-2 text-[12px] font-black"
              style={tab.active ? {
                color: '#ffffff',
                background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)',
                boxShadow: '0 2px 8px rgba(29,91,115,0.22)',
              } : {
                color: '#5f8392',
                background: '#f0f7fc',
                border: '1px solid rgba(29,91,115,0.12)',
              }}
            >
              {tab.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── 件数 ── */}
      <div className="px-5 pb-3">
        <p className="text-[11px] font-bold" style={{ color: '#8aa5b0' }}>
          {articles.length}件の記事
        </p>
      </div>

      {/* ── 記事一覧 ── */}
      <section className="px-4">
        <div className="flex flex-col gap-4">
          {articles.map(article => (
            <NewArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* ── WordPress連携注記 ── */}
      <section className="px-4 pt-8">
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(29,91,115,0.04)',
            border: '1px solid rgba(29,91,115,0.08)',
          }}
        >
          <p className="text-[11px] font-medium leading-6" style={{ color: '#8aa5b0' }}>
            WordPressの記事データと連携し、取得できない場合は編集部のおすすめ記事を表示します。
          </p>
        </div>
      </section>
    </main>
  );
}

/* ── 記事カード ── */
function NewArticleCard({ article }: { article: FeaturedArticle }) {
  const hasActions = article.articleUrl || article.mapUrl;

  return (
    <article
      className="rounded-2xl bg-white"
      style={{
        border: '1px solid rgba(29,91,115,0.10)',
        borderLeft: `3px solid ${article.accentColor}`,
        boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
      }}
    >
      <div className="p-4">
        {/* バッジ行 */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {article.isNew && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide text-white"
              style={{
                background: 'linear-gradient(135deg, #c9412d, #e05030)',
                boxShadow: '0 1px 6px rgba(201,65,45,0.35)',
              }}
            >
              NEW!
            </span>
          )}
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-black"
            style={{
              color: article.accentColor,
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {article.tag}
          </span>
          {article.isPr && (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.10em]"
              style={{
                color: '#5f8392',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.10)',
              }}
            >
              PR
            </span>
          )}
        </div>

        {/* タイトル */}
        <h2 className="text-[16px] font-black leading-snug" style={{ color: '#0a2438' }}>
          {article.title}
        </h2>

        {/* description（あれば） */}
        {article.description && (
          <p
            className="mt-2 text-[12px] font-medium leading-6"
            style={{
              color: '#5a7b8a',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }}
          >
            {article.description}
          </p>
        )}

        {/* メタ情報 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {article.area && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{ color: '#1d5b73', background: 'rgba(29,91,115,0.08)' }}
            >
              {article.area}
            </span>
          )}
          {article.publishedAt && (
            <span className="text-[10px] font-bold" style={{ color: '#a0b8c0' }}>
              {formatPublishedAt(article.publishedAt)}
            </span>
          )}
          {article.views !== undefined && article.views > 0 && (
            <span
              className="flex items-center gap-1 text-[10px] font-bold"
              style={{ color: '#a0b8c0' }}
            >
              <EyeIcon />
              {article.views.toLocaleString()}
            </span>
          )}
        </div>

        {/* sponsorName */}
        {article.isPr && article.sponsorName && (
          <p className="mt-2 text-[10px] font-bold" style={{ color: '#8aa5b0' }}>
            提供：{article.sponsorName}
          </p>
        )}

        {/* アクションボタン */}
        {hasActions && (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.articleUrl && (
              <a
                href={article.articleUrl}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-black active:scale-95 transition-transform"
                style={{ color: '#ffffff', background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)' }}
              >
                記事を見る
                <ArrowRightIcon />
              </a>
            )}
            {article.mapUrl && (
              <a
                href={article.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-black active:scale-95 transition-transform"
                style={{
                  color: '#1d5b73',
                  background: 'rgba(10,154,154,0.10)',
                  border: '1px solid rgba(10,154,154,0.22)',
                }}
              >
                地図で開く
                <MapPinIcon />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ── ヘルパー ── */
function formatPublishedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return iso;
  }
}

/* ── SVGアイコン ── */
function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
