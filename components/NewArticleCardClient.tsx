'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { FeaturedArticle } from '@/types/portal';
import { isSaved, toggleSavedItem } from '@/lib/saved';

const JP = {
  readArticle: '\u8a18\u4e8b\u3092\u898b\u308b',
  openMap: '\u5730\u56f3\u3067\u958b\u304f',
  save: '\u4fdd\u5b58',
  saved: '\u4fdd\u5b58\u6e08\u307f',
  providedBy: '\u63d0\u4f9b\uff1a',
  newLabel: 'NEW',
  pr: 'PR',
  articleAriaSuffix: '\u306e\u8a18\u4e8b\u3092\u898b\u308b',
};

type Chip = {
  label: string;
  href: string;
  variant: 'category' | 'area' | 'feature';
};

type Props = {
  article: FeaturedArticle;
  imageUrl?: string;
  hookLine: string;
};

export function NewArticleCardClient({ article, imageUrl, hookLine }: Props) {
  const articleHref = article.id.startsWith('wp-')
    ? `/article/${article.id.slice(3)}`
    : (article.articleUrl ?? '#');
  const [saved, setSaved] = useState(false);

  const chips = useMemo(() => getArticleChips(article), [article]);

  useEffect(() => {
    setSaved(isSaved({ id: article.id, type: 'article' }));
  }, [article.id]);

  const toggleSaved = () => {
    const result = toggleSavedItem({
      id: article.id,
      type: 'article',
      title: article.title,
      area: article.area,
      imageUrl: article.imageUrl ?? imageUrl,
      articleUrl: articleHref,
      mapUrl: article.mapUrl,
    });
    setSaved(result.saved);
  };

  return (
    <article
      className="relative overflow-hidden rounded-[18px] bg-white"
      style={{
        border: '1px solid #E6ECF5',
        boxShadow: '0 8px 24px rgba(7,26,77,0.09)',
      }}
    >
      <a href={articleHref} className="absolute inset-0 z-10" aria-label={`${article.title}${JP.articleAriaSuffix}`} />

      {/* 画像エリア: imageUrls(複数)があればスライダー、なければ単枚 */}
      {(article.imageUrls && article.imageUrls.length > 1) ? (
        <div
          className="relative z-20 flex h-[200px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {article.imageUrls.map((url, i) => (
            <div
              key={i}
              className="relative h-[200px] min-w-full shrink-0 overflow-hidden"
              style={{ scrollSnapAlign: 'start', background: article.bg }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 42%, rgba(0,0,0,0.28) 100%)' }} />
            </div>
          ))}
          <div className="pointer-events-none absolute bottom-2.5 left-0 right-0 z-10 flex justify-center gap-1">
            {article.imageUrls.map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/70" />
            ))}
          </div>
        </div>
      ) : (
        <div className="pointer-events-none relative h-[200px] overflow-hidden" style={{ background: article.bg }}>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 42%, rgba(0,0,0,0.28) 100%)',
            }}
          />
        </div>
      )}

        <div className="pointer-events-none px-4 pt-3">
          <h2 className="text-[17px] font-black leading-snug" style={{ color: '#0F172A' }}>
            {article.title}
          </h2>

          <p className="mt-2 text-[13px] font-black leading-5" style={{ color: '#071A4D' }}>
            {hookLine}
          </p>

          {article.description && (
            <p
              className="mt-2 text-[12px] font-medium leading-6"
              style={{
                color: '#667085',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
              }}
            >
              {article.description}
            </p>
          )}
        </div>

      <div className="relative z-20 pointer-events-auto px-4 pb-4">
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {article.publishedAt && (
            <span className="text-[10px] font-bold" style={{ color: '#9BA3B0' }}>
              {formatPublishedAt(article.publishedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={toggleSaved}
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black transition-transform active:scale-95"
            style={{
              color: saved ? '#E8483F' : '#667085',
              background: saved ? 'rgba(232,72,63,0.10)' : 'rgba(7,26,77,0.05)',
              border: saved ? '1px solid rgba(232,72,63,0.28)' : '1px solid #E6ECF5',
            }}
            aria-pressed={saved}
          >
            <BookmarkIcon filled={saved} />
            {saved ? JP.saved : JP.save}
          </button>
        </div>

        {article.isPr && article.sponsorName && (
          <p className="mt-1 text-[10px] font-bold" style={{ color: '#9BA3B0' }}>
            {JP.providedBy}
            {article.sponsorName}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <a
            href={articleHref}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-black no-underline transition-transform active:scale-95"
            style={{
              color: '#ffffff',
              background: '#E8483F',
              boxShadow: '0 6px 14px rgba(232,72,63,0.25)',
              textDecoration: 'none',
            }}
          >
            {JP.readArticle}
            <ArrowRightIcon />
          </a>
          {article.mapUrl && (
            <a
              href={article.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-black no-underline transition-transform active:scale-95"
              style={{
                color: '#071A4D',
                background: 'rgba(7,26,77,0.06)',
                border: '1px solid #E6ECF5',
                textDecoration: 'none',
              }}
            >
              {JP.openMap}
              <MapPinIcon />
            </a>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map(chip => (
            <Link
              key={`${chip.variant}-${chip.label}`}
              href={chip.href}
              className="rounded-full px-2.5 py-1 text-[10px] font-black no-underline transition-transform active:scale-95"
              style={getChipStyle(chip, article)}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

function getArticleChips(article: FeaturedArticle): Chip[] {
  return [
    {
      label: article.tag,
      href: `/new?tag=${encodeURIComponent(article.tag)}`,
      variant: 'category',
    },
    ...(article.area
      ? [
          {
            label: article.area,
            href: `/new?area=${encodeURIComponent(article.area)}`,
            variant: 'area' as const,
          },
        ]
      : []),
    ...(article.isNew && article.tag.trim().toUpperCase() !== 'NEW' && article.tag.trim() !== '\u65b0\u5e97'
      ? [{ label: JP.newLabel, href: `/new?feature=${encodeURIComponent('\u65b0\u5e97')}`, variant: 'feature' as const }]
      : []),
    ...(article.isPr ? [{ label: JP.pr, href: '/new?feature=pr', variant: 'feature' as const }] : []),
  ];
}

function getChipStyle(chip: Chip, article: FeaturedArticle): CSSProperties {
  if (chip.variant === 'feature') {
    return {
      color: '#E8483F',
      background: 'rgba(232,72,63,0.08)',
      border: '1px solid rgba(232,72,63,0.22)',
      textDecoration: 'none',
    };
  }
  if (chip.variant === 'area') {
    return {
      color: '#071A4D',
      background: 'rgba(7,26,77,0.06)',
      border: '1px solid rgba(7,26,77,0.14)',
      textDecoration: 'none',
    };
  }
  return {
    color: article.accentColor,
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.10)',
    textDecoration: 'none',
  };
}

function formatPublishedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return iso;
  }
}

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

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
