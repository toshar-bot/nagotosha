import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWordPressPostById } from '@/lib/wordpress-fetch';
import { stripHtml, decodeHtmlEntities, getFeaturedMediaUrl } from '@/lib/wordpress';
import { ArticleSaveButton } from '@/components/ArticleSaveButton';

type Params = { id: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getWordPressPostById(params.id);
  if (!post) return { title: '記事が見つかりません | なごとしゃ' };

  const title       = decodeHtmlEntities(stripHtml(post.title.rendered));
  const description = stripHtml(post.excerpt?.rendered ?? '').slice(0, 160);
  const imageUrl    = getFeaturedMediaUrl(post);

  return {
    title: `${title} | なごとしゃ`,
    description: description || title,
    openGraph: {
      title,
      description: description || title,
      type: 'article',
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || title,
      images: imageUrl ? [imageUrl] : ['/opengraph-image'],
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const post = await getWordPressPostById(params.id);
  if (!post) notFound();

  const title    = decodeHtmlEntities(stripHtml(post.title.rendered));
  const content  = post.content?.rendered ?? '';
  const imageUrl = getFeaturedMediaUrl(post);
  const meta     = post.meta ?? {};

  const area      = typeof meta.area      === 'string' && meta.area.trim()      ? meta.area.trim()      : undefined;
  const tag       = typeof meta.category  === 'string' && meta.category.trim()  ? meta.category.trim()  : '記事';
  const mapUrl    = typeof meta.mapUrl    === 'string' && meta.mapUrl.trim()    ? meta.mapUrl.trim()    : undefined;
  const storeName = typeof meta.storeName === 'string' && meta.storeName.trim() ? meta.storeName.trim() : undefined;
  const address   = typeof meta.address   === 'string' && meta.address.trim()   ? meta.address.trim()   : undefined;

  const publishedDate = new Date(post.date);
  const dateStr = Number.isNaN(publishedDate.getTime())
    ? ''
    : `${publishedDate.getFullYear()}年${publishedDate.getMonth() + 1}月${publishedDate.getDate()}日`;

  const articleId = `wp-${post.id}`;

  return (
    <main className="min-h-dvh pb-28" style={{ background: '#ffffff' }}>

      {/* ── ヘッダー ── */}
      <div
        className="flex items-center px-4 pt-5 pb-4"
        style={{ borderBottom: '1px solid #E6ECF5' }}
      >
        <Link
          href="/new"
          className="inline-flex items-center gap-1 text-[13px] font-black transition-opacity active:opacity-60"
          style={{ color: '#E8483F' }}
        >
          <ChevronLeftIcon />
          新着一覧
        </Link>
      </div>

      {/* ── アイキャッチ画像 ── */}
      {imageUrl && (
        <div className="relative h-[240px] overflow-hidden sm:h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 50%, rgba(7,26,77,0.30) 100%)',
            }}
          />
        </div>
      )}

      <div className="px-4 pt-5">

        {/* ── タグ・エリア・日付 ── */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-black"
            style={{ background: 'rgba(232,72,63,0.09)', color: '#E8483F' }}
          >
            {tag}
          </span>
          {area && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-black"
              style={{
                background: 'rgba(7,26,77,0.06)',
                color: '#071A4D',
                border: '1px solid rgba(7,26,77,0.12)',
              }}
            >
              {area}
            </span>
          )}
          {dateStr && (
            <span className="text-[11px] font-medium" style={{ color: '#9BA3B0' }}>
              {dateStr}
            </span>
          )}
        </div>

        {/* ── タイトル ── */}
        <h1
          className="text-[22px] font-black leading-[1.4] tracking-tight"
          style={{
            color: '#071A4D',
            wordBreak: 'keep-all',
            overflowWrap: 'normal',
          }}
        >
          {title}
        </h1>

        {/* ── 店舗情報 ── */}
        {(storeName || address) && (
          <div
            className="mt-4 flex flex-col gap-1.5 rounded-[14px] px-4 py-3.5"
            style={{ background: '#F8FAFF', border: '1px solid #E6ECF5' }}
          >
            {storeName && (
              <p className="text-[13px] font-black" style={{ color: '#071A4D' }}>
                {storeName}
              </p>
            )}
            {address && (
              <p className="text-[12px] font-medium leading-5" style={{ color: '#667085' }}>
                {address}
              </p>
            )}
          </div>
        )}

        {/* ── アクションボタン ── */}
        <div className="mt-4 flex gap-2.5">
          <ArticleSaveButton
            id={articleId}
            type="article"
            title={title}
            area={area}
            imageUrl={imageUrl}
            articleUrl={`/article/${params.id}`}
            mapUrl={mapUrl ?? undefined}
          />
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13px] font-black transition-transform active:scale-[0.98]"
              style={{
                background: 'rgba(7,26,77,0.06)',
                border: '1px solid #E6ECF5',
                color: '#071A4D',
                textDecoration: 'none',
                minWidth: 120,
              }}
            >
              <MapPinIcon />
              地図で開く
            </a>
          )}
        </div>

        {/* ── 記事本文 ── */}
        <div
          className="mt-7"
          style={{ borderTop: '1px solid #E6ECF5', paddingTop: 24 }}
        >
          {content ? (
            <ArticleBody html={content} />
          ) : (
            <p className="text-[14px]" style={{ color: '#667085' }}>
              本文がありません。
            </p>
          )}
        </div>

        {/* ── 外部サイトで見る ── */}
        <div className="mt-6">
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-black transition-transform active:scale-[0.98]"
            style={{
              background: 'rgba(7,26,77,0.06)',
              border: '1px solid #E6ECF5',
              color: '#071A4D',
              textDecoration: 'none',
            }}
          >
            外部サイトで見る
            <ExternalLinkIcon />
          </a>
        </div>

        {/* ── 新着一覧へ戻る ── */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E6ECF5' }}>
          <Link
            href="/new"
            className="inline-flex items-center gap-1.5 text-[13px] font-black transition-opacity active:opacity-60"
            style={{ color: '#E8483F' }}
          >
            <ChevronLeftIcon />
            新着記事一覧へ戻る
          </Link>
        </div>

      </div>
    </main>
  );
}

/* ── 記事本文 ── */

const ARTICLE_BODY_CSS = `
  .nagotosha-article-body {
    color: #374151;
    font-size: 15px;
    line-height: 1.85;
    word-break: keep-all;
    overflow-wrap: normal;
  }
  .nagotosha-article-body p { margin: 0 0 1.1em; }
  .nagotosha-article-body h2 {
    font-size: 18px; font-weight: 900; color: #071A4D;
    margin: 1.6em 0 0.6em;
    padding-bottom: 0.35em;
    border-bottom: 2px solid #E8483F;
  }
  .nagotosha-article-body h3 {
    font-size: 16px; font-weight: 900; color: #071A4D;
    margin: 1.3em 0 0.5em;
  }
  .nagotosha-article-body ul,
  .nagotosha-article-body ol { padding-left: 1.5em; margin: 0 0 1.1em; }
  .nagotosha-article-body li { margin-bottom: 0.35em; }
  .nagotosha-article-body a { color: #E8483F; }
  .nagotosha-article-body img {
    max-width: 100%; height: auto;
    border-radius: 10px; margin: 0.8em 0;
  }
  .nagotosha-article-body strong { font-weight: 900; color: #071A4D; }
  .nagotosha-article-body blockquote {
    border-left: 3px solid #E8483F;
    padding-left: 1em; margin: 1em 0; color: #667085;
  }
  .nagotosha-article-body figure { margin: 1em 0; }
  .nagotosha-article-body figcaption {
    font-size: 12px; color: #9BA3B0;
    margin-top: 0.25em; text-align: center;
  }
`;

function ArticleBody({ html }: { html: string }) {
  return (
    <div>
      <style>{ARTICLE_BODY_CSS}</style>
      <div
        className="nagotosha-article-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/* ── SVG Icons ── */

function ChevronLeftIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
