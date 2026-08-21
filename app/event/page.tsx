import type { Metadata } from 'next';
import Link from 'next/link';
import { NewArticleCardClient } from '@/components/NewArticleCardClient';
import { FEATURED_ARTICLES } from '@/data/portal';
import { getPortalArticlesWithFallback } from '@/lib/wordpress-fetch';
import type { FeaturedArticle } from '@/types/portal';

const description = '名古屋のイベント、期間限定情報、季節の特集記事をまとめて探せます。';

export const metadata: Metadata = {
  title: '名古屋のイベント・季節情報｜なごとしゃ',
  description,
  alternates: { canonical: '/event' },
  openGraph: {
    title: '名古屋のイベント・季節情報｜なごとしゃ',
    description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '名古屋のイベント・季節情報｜なごとしゃ',
    description,
    images: ['/opengraph-image'],
  },
};

const EVENT_WORDS = ['イベント', '開催', 'フェア', '祭', '花火', 'ビアガーデン', '期間限定'];
const SEASONAL_WORDS = ['夏', '雨の日', '屋内', 'ビアガーデン', '手土産', 'モーニング', 'おでかけ', '特集'];
const ENDED_WORDS = ['終了', '閉店', 'クローズ'];

export default async function EventPage() {
  const articles = await getPortalArticlesWithFallback(FEATURED_ARTICLES, { perPage: 40 });
  const liveEvents = pickArticles(articles, EVENT_WORDS).slice(0, 6);
  const liveEventIds = new Set(liveEvents.map((article) => article.id));
  const seasonalFeatures = pickArticles(articles, SEASONAL_WORDS)
    .filter((article) => !liveEventIds.has(article.id))
    .slice(0, 6);

  return (
    <main className="min-h-dvh pb-28" style={{ background: '#ffffff' }}>
      <section className="px-4 pt-8 pb-5">
        <p className="text-[10px] font-black tracking-[0.22em]" style={{ color: '#E8483F' }}>
          EVENT
        </p>
        <h1 className="mt-1 text-[28px] font-black leading-tight tracking-tight" style={{ color: '#071A4D' }}>
          名古屋のイベント・季節情報
        </h1>
        <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
          期間限定のおでかけ、季節の特集、イベントとして読める公開記事をまとめて探せます。
        </p>
      </section>

      <section className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <FilterCard label="季節の特集" text="夏のおでかけや雨の日スポットを確認" icon="sun" />
          <FilterCard label="期間限定" text="公開記事の中から期間限定情報を確認" icon="calendar" />
          <FilterCard label="家族で行きたい" text="親子のおでかけ候補を記事から探す" icon="heart" />
          <FilterCard label="近くで探す" text="気になるエリアとあわせて探せます" icon="map" />
        </div>
      </section>

      {liveEvents.length > 0 && (
        <section className="px-4 pt-7">
          <SectionTitle eyebrow="EVENT ARTICLES">開催中・近日開催</SectionTitle>
          <div className="mt-4 flex flex-col gap-5">
            {liveEvents.map((article, index) => (
              <NewArticleCardClient
                key={article.id}
                article={article}
                imageUrl={article.imageUrl}
                hookLine={getArticleHookLine(article, index)}
              />
            ))}
          </div>
        </section>
      )}

      {seasonalFeatures.length > 0 && (
        <section className="px-4 pt-8">
          <SectionTitle eyebrow="SEASONAL GUIDE">季節の特集</SectionTitle>
          <div className="mt-4 flex flex-col gap-5">
            {seasonalFeatures.map((article, index) => (
              <NewArticleCardClient
                key={article.id}
                article={article}
                imageUrl={article.imageUrl}
                hookLine={getArticleHookLine(article, index)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="px-4 pt-8">
        <div
          className="rounded-[18px] bg-white p-5"
          style={{ border: '1px solid #E6ECF5', boxShadow: '0 8px 24px rgba(7,26,77,0.07)' }}
        >
          <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
            NEXT UPDATE
          </p>
          <h2 className="mt-2 text-[18px] font-black leading-snug" style={{ color: '#071A4D' }}>
            花火大会や夏休みイベントも順次更新します
          </h2>
          <p className="mt-3 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
            なごとしゃでは、公式情報を確認できたイベントや季節のおでかけ情報から順に掲載します。新着記事やエリアページとあわせてチェックしてください。
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/new?tag=%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-black text-white no-underline active:scale-[0.98] transition-transform"
              style={{ background: '#E8483F', boxShadow: '0 10px 20px rgba(232,72,63,0.24)' }}
            >
              イベント関連記事を見る
              <ArrowRightIcon />
            </Link>
            <Link
              href="/area"
              className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-[13px] font-black no-underline active:scale-[0.98] transition-transform"
              style={{ color: '#071A4D', background: '#F8FAFC', border: '1px solid #E6ECF5' }}
            >
              エリアから探す
            </Link>
          </div>
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
            EVENT OWNER
          </p>
          <h2 className="text-[17px] font-black leading-snug" style={{ color: '#071A4D' }}>
            イベント告知を相談したい方へ
          </h2>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
            新店イベント、期間限定企画、週末集客など、名古屋のお店や主催者向けの掲載相談を受け付けています。
          </p>
          <Link
            href="/partner"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-black text-white no-underline active:scale-[0.98] transition-transform"
            style={{
              background: '#E8483F',
              boxShadow: '0 12px 24px rgba(232,72,63,0.30)',
            }}
          >
            掲載について相談する
            <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}

function pickArticles(articles: FeaturedArticle[], words: string[]): FeaturedArticle[] {
  return articles
    .filter((article) => {
      const haystack = `${article.title} ${article.description ?? ''} ${article.tag ?? ''} ${article.category ?? ''}`;
      if (ENDED_WORDS.some((word) => haystack.includes(word))) return false;
      return words.some((word) => haystack.includes(word));
    })
    .sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt));
}

function toTime(publishedAt?: string): number {
  if (!publishedAt) return 0;
  const t = new Date(publishedAt.replace(/\./g, '-')).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function getArticleHookLine(article: FeaturedArticle, index: number): string {
  if (article.description) return article.description;
  if (article.area) return `${article.area}で読める季節のおでかけ情報`;
  return index === 0 ? '名古屋で今チェックしたいおでかけ情報' : '公式情報をもとにした公開記事';
}

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[19px] font-black tracking-tight" style={{ color: '#071A4D' }}>
        {children}
      </h2>
    </div>
  );
}

function FilterCard({ label, text, icon }: { label: string; text: string; icon: string }) {
  const iconEl = (() => {
    if (icon === 'sun') return <SunIcon />;
    if (icon === 'heart') return <HeartIcon />;
    if (icon === 'map') return <MapPinLgIcon />;
    return <CalendarIcon />;
  })();

  return (
    <article
      className="rounded-[14px] p-4"
      style={{
        background: '#ffffff',
        border: '1px solid #E6ECF5',
        boxShadow: '0 4px 16px rgba(7,26,77,0.06)',
      }}
    >
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: 'rgba(232,72,63,0.08)', color: '#E8483F' }}
      >
        {iconEl}
      </div>
      <h2 className="text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
        {label}
      </h2>
      <p className="mt-2 text-[11px] font-medium leading-5" style={{ color: '#667085' }}>
        {text}
      </p>
    </article>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M8 2v5" />
      <path d="M16 2v5" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function MapPinLgIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
