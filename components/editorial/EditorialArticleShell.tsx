'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ArticleRelated, EventRoundupItem, ShopInfoItem } from '@/lib/article-experience';
import type { ContentRelationshipResolution } from '@/lib/content-relationships';
import styles from './editorial-article.module.css';

type EditorialArticleShellProps = {
  title: string;
  lead: string;
  category?: string;
  dateStr?: string;
  relationship?: ContentRelationshipResolution;
  imageUrl?: string;
  imageAlt: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  quickPoints: string[];
  bodyContent?: string;
  sourceContent?: string;
  shopInfo: ShopInfoItem[];
  shopSource?: string;
  related: ArticleRelated[];
  mapUrl?: string;
  officialUrl?: string;
  eventItems?: EventRoundupItem[];
  onMapClick?: () => void;
};

/**
 * Article-only implementation of the reusable Editorial Shell.
 * Event routes will opt in separately; this component never invents a
 * decision handoff when the article has no verified relationship to a
 * Decision-ready candidate.
 */
export function EditorialArticleShell({
  title,
  lead,
  category,
  dateStr,
  relationship,
  imageUrl,
  imageAlt,
  imageCredit,
  imageSourceUrl,
  quickPoints,
  bodyContent,
  sourceContent,
  shopInfo,
  shopSource,
  related,
  mapUrl,
  officialUrl,
  eventItems = [],
  onMapClick,
}: EditorialArticleShellProps) {
  const usableQuickPoints = quickPoints.filter((point) => point.trim().length > 0).slice(0, 3);
  const hasSources = Boolean(sourceContent || (imageCredit && imageSourceUrl) || shopSource);
  const attribution = relationship?.relationship === 'editorial'
    ? 'なごとしゃ編集部'
    : relationship?.displayLabel;
  const handleBack = () => {
    const isInternalReferrer = document.referrer.startsWith(window.location.origin);
    if (isInternalReferrer && window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign('/new');
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" aria-label="前の画面へ戻る" className={styles.backButton} onClick={handleBack}>
          <span aria-hidden="true">←</span>
        </button>
        <Link href="/" aria-label="なごとしゃ ホーム" className={styles.logoLink}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/subjects/nagotosha-header-complete-tight.png"
              alt="なごとしゃ 名古屋情報局 トーシャー"
              className={styles.logo}
            />
        </Link>
        <span className={styles.headerSpacer} aria-hidden="true" />
      </header>

      <div className={styles.frame}>
        <section className={styles.titleBand} aria-label="記事の概要">
          <nav aria-label="パンくず" className={styles.breadcrumb}>
            <Link href="/">ホーム</Link>
            <span aria-hidden="true">/</span>
            <Link href="/new">新着記事</Link>
            {category && <><span aria-hidden="true">/</span><span>{category}</span></>}
          </nav>

          <header className={styles.articleHeader}>
            {category && <p className={styles.eyebrow}>{category}</p>}
            <h1>{title}</h1>
            {lead && <p className={styles.lead}>{lead}</p>}
            {(dateStr || attribution) && (
              <div className={styles.meta}>
                {dateStr && <time className={styles.numeric}>{dateStr} 更新</time>}
                {attribution && <span>{attribution}</span>}
              </div>
            )}
          </header>
        </section>

        {imageUrl && imageCredit && imageSourceUrl && (
          <EditorialHero
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            imageCredit={imageCredit}
            imageSourceUrl={imageSourceUrl}
          />
        )}

        <article className={styles.articleContent}>
          {usableQuickPoints.length > 0 && (
            <section className={styles.summary} aria-labelledby="article-summary-title">
              <h2 id="article-summary-title">まず3行でわかる</h2>
              <ol>
                {usableQuickPoints.map((point) => <li key={point}>{point}</li>)}
              </ol>
            </section>
          )}

          {/* The optional Decision handoff slot intentionally has no DOM here.
              No verified article-to-candidate mapping exists in the current data. */}

          {bodyContent && (
            <section className={styles.bodySection} aria-label="記事本文">
              <div className={styles.body} dangerouslySetInnerHTML={{ __html: bodyContent }} />
            </section>
          )}

          {eventItems.length > 0 && (
            <section className={styles.eventList} aria-labelledby="event-list-title">
              <h2 id="event-list-title">掲載イベント</h2>
              <p>掲載時点の公式情報をもとにした8月のイベント一覧です。参加前に各イベントの公式情報をご確認ください。</p>
              <ol>
                {eventItems.map((item) => (
                  <li key={item.id}>
                    <p className={styles.eventDate}>{item.dateLabel}</p>
                    <h3>{item.name}</h3>
                    <p>{[item.area, item.venue].filter(Boolean).join(' / ')}</p>
                    {item.shortDescription && <p>{item.shortDescription}</p>}
                    <a href={item.officialUrl} target="_blank" rel="noopener noreferrer">公式情報を見る <span aria-hidden="true">↗</span></a>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {shopInfo.length > 0 && (
            <section className={styles.storeInfo} aria-labelledby="store-info-title">
              <h2 id="store-info-title">店舗・候補情報</h2>
              <dl>
                {shopInfo.map((item) => (
                  <div key={`${item.label}-${item.value}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              {(mapUrl || officialUrl) && (
                <div className={styles.verifiedActions}>
                  {mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={onMapClick}>地図を見る <span aria-hidden="true">↗</span></a>}
                  {officialUrl && <a href={officialUrl} target="_blank" rel="noopener noreferrer">公式情報を見る <span aria-hidden="true">↗</span></a>}
                </div>
              )}
            </section>
          )}

          {hasSources && (
            <section className={styles.sources} aria-labelledby="article-sources-title">
              <h2 id="article-sources-title">出典</h2>
              {sourceContent && <div className={styles.sourceBody} dangerouslySetInnerHTML={{ __html: sourceContent }} />}
              {imageCredit && imageSourceUrl && <p>画像出典: <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer">{imageCredit}</a></p>}
              {shopSource && <p>情報出典: {shopSource}</p>}
            </section>
          )}

          {related.length > 0 && (
            <section className={styles.related} aria-labelledby="related-articles-title">
              <h2 id="related-articles-title">関連記事</h2>
              <ul>
                {related.slice(0, 3).map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      {item.label && <span>{item.label}</span>}
                      <strong>{item.title}</strong>
                      <i aria-hidden="true">→</i>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {eventItems.length > 0 ? (
            <footer className={styles.articleFooter}>
              <section className={styles.finalCta} aria-labelledby="event-final-cta-title">
                <h2 id="event-final-cta-title">次の一歩は、公式情報の確認</h2>
                <p>予定に合う候補を見つけたら、開催日・会場・料金を公式情報で確認しましょう。</p>
                <Link href="/event" className={styles.finalCtaPrimary}>イベント一覧を見る <span aria-hidden="true">→</span></Link>
              </section>
            </footer>
          ) : officialUrl ? (
            <footer className={styles.articleFooter}>
              <section className={styles.finalCta} aria-labelledby="store-final-cta-title">
                <h2 id="store-final-cta-title">店舗の最新情報を確認</h2>
                <p>営業時間や予約方法は変更される場合があります。来店前に公式情報を確認しましょう。</p>
                <a href={officialUrl} target="_blank" rel="noopener noreferrer" className={styles.finalCtaPrimary}>公式情報を見る <span aria-hidden="true">↗</span></a>
                {mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={onMapClick} className={styles.finalCtaSecondary}>地図を見る <span aria-hidden="true">↗</span></a>}
              </section>
            </footer>
          ) : null}
        </article>
      </div>

      <nav className={styles.pageEndNav} aria-label="なごとしゃサイトナビゲーション">
        <Link href="/"><HomeIcon /><span>ホーム</span></Link>
        <Link href="/event"><CalendarIcon /><span>イベント</span></Link>
        <Link href="/new" aria-current="page"><ArticleIcon /><span>新着記事</span></Link>
        <Link href="/area"><MapIcon /><span>エリア</span></Link>
      </nav>
    </main>
  );
}

function EditorialHero({ imageUrl, imageAlt, imageCredit, imageSourceUrl }: Required<Pick<EditorialArticleShellProps, 'imageUrl' | 'imageAlt' | 'imageCredit' | 'imageSourceUrl'>>) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure className={styles.hero}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={imageAlt} onError={() => setFailed(true)} />
      <figcaption>画像出典: <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer">{imageCredit}</a></figcaption>
    </figure>
  );
}

function HomeIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3z" /><path d="M9 21v-7h6v7" /></svg>; }
function CalendarIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4m8-4v4" /></svg>; }
function ArticleIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" /></svg>; }
function MapIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15" /></svg>; }
