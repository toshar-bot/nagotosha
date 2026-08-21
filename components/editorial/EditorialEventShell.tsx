'use client';

import { useMemo, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import type { EventRoundupFilter, EventRoundupItem } from '@/lib/article-experience';
import styles from './editorial-event.module.css';

type DateFilter = 'month' | 'today' | 'tomorrow' | 'weekend';

type EditorialEventShellProps = {
  items: EventRoundupItem[];
  filters: EventRoundupFilter[];
};

const DATE_FILTERS: readonly { id: DateFilter; label: string }[] = [
  { id: 'today', label: '今日' },
  { id: 'tomorrow', label: '明日' },
  { id: 'weekend', label: '今週末' },
  { id: 'month', label: '対象月' },
];

export function EditorialEventShell({ items, filters }: EditorialEventShellProps) {
  const today = useMemo(getTokyoDateKey, []);
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [areaFilter, setAreaFilter] = useState('all');
  const [timingFilter, setTimingFilter] = useState('all');
  const eventListRef = useRef<HTMLElement>(null);
  const targetMonthLabel = `${Number(today.slice(5, 7))}月`;
  const areas = useMemo(() => Array.from(new Set(items.map((item) => item.area).filter(Boolean))), [items]);
  const timings = useMemo(
    () => filters.filter((filter) => ['august-early', 'obon', 'august-late'].includes(filter.id) && items.some((item) => item.filterTags?.includes(filter.id))),
    [filters, items],
  );

  const filteredItems = useMemo(() => {
    const range = getDateRange(dateFilter, today);

    return items
      .filter((item) => !eventHasEnded(item, today))
      .filter((item) => eventOverlaps(item, range.start, range.end))
      .filter((item) => areaFilter === 'all' || item.area === areaFilter)
      .filter((item) => timingFilter === 'all' || item.filterTags?.includes(timingFilter))
      .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name, 'ja'));
  }, [areaFilter, dateFilter, items, timingFilter, today]);

  const featured = useMemo(() => selectFeaturedEvent(filteredItems, today), [filteredItems, today]);
  const eventList = useMemo(
    () => featured ? filteredItems.filter((item) => item.id !== featured.id) : filteredItems,
    [featured, filteredItems],
  );
  const isFiltered = dateFilter !== 'month' || areaFilter !== 'all' || timingFilter !== 'all';

  const resetFilters = () => {
    setAreaFilter('all');
    setTimingFilter('all');
  };

  const selectArea = (area: string, event: MouseEvent<HTMLButtonElement>) => {
    setAreaFilter(area);
    const chip = event.currentTarget;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    requestAnimationFrame(() => chip.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    }));
  };

  const resetAndShowList = () => {
    resetFilters();
    requestAnimationFrame(() => eventListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const showTargetMonth = () => {
    setDateFilter('month');
    setAreaFilter('all');
    setTimingFilter('all');
    requestAnimationFrame(() => eventListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const handleBack = () => {
    const isInternalReferrer = document.referrer.startsWith(window.location.origin);
    if (isInternalReferrer && window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign('/');
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" aria-label="前の画面へ戻る" className={styles.backButton} onClick={handleBack}>
          <span aria-hidden="true">←</span>
        </button>
        <span className={styles.headerSpacer} aria-hidden="true" />
      </header>

      <div className={styles.frame}>
        <section className={styles.titleBand} aria-label="イベントの概要">
          <p className={styles.eyebrow}>EVENT GUIDE</p>
          <h1>名古屋のイベント・季節情報</h1>
          <p className={styles.lead}>
            日付や時期から、公式情報を確認できるイベントを探せます。予定に合う候補を見つけたら、開催日と会場を確認しましょう。
          </p>
        </section>

        <section className={styles.filterSection} aria-labelledby="event-filter-title">
          <h2 id="event-filter-title">いつ行く？</h2>
          <div className={styles.filterRail} role="group" aria-label="日付で絞り込む">
            {DATE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={styles.filterButton}
                aria-pressed={dateFilter === filter.id}
                onClick={() => setDateFilter(filter.id)}
              >
                {filter.id === 'month' ? targetMonthLabel : filter.label}
              </button>
            ))}
          </div>

          {areas.length > 0 && (
            <div className={styles.filterGroup}>
              <h3>エリア</h3>
              <div className={styles.filterRail} role="group" aria-label="エリアで絞り込む">
                <button type="button" className={styles.filterButton} aria-pressed={areaFilter === 'all'} onClick={(event) => selectArea('all', event)}>すべて</button>
                {areas.map((area) => (
                  <button key={area} type="button" className={styles.filterButton} aria-pressed={areaFilter === area} onClick={(event) => selectArea(area, event)}>{area}</button>
                ))}
              </div>
            </div>
          )}

          {timings.length > 0 && (
            <div className={styles.filterGroup}>
              <h3>時期</h3>
              <div className={styles.filterRail} role="group" aria-label="時期で絞り込む">
                <button type="button" className={styles.filterButton} aria-pressed={timingFilter === 'all'} onClick={() => setTimingFilter('all')}>すべて</button>
                {timings.map((filter) => (
                  <button key={filter.id} type="button" className={styles.filterButton} aria-pressed={timingFilter === filter.id} onClick={() => setTimingFilter(filter.id)}>{filter.label}</button>
                ))}
              </div>
            </div>
          )}
        </section>

        {featured && (
          <section className={styles.featuredSection} aria-labelledby="featured-event-title">
            <p className={styles.sectionEyebrow}>FEATURED EVENT</p>
            <h2 id="featured-event-title">注目イベント</h2>
            <EventFeature item={featured} today={today} />
          </section>
        )}

        {eventList.length > 0 && (
          <section className={styles.eventSection} ref={eventListRef} aria-labelledby="event-list-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sectionEyebrow}>EVENT LIST</p>
                <h2 id="event-list-title">ほかのイベント</h2>
              </div>
              <p>{eventList.length}件</p>
            </div>
            <ol className={styles.eventList}>
              {eventList.map((item) => <EventCard key={item.id} item={item} today={today} />)}
            </ol>
          </section>
        )}

        {filteredItems.length === 0 && (
          <section className={styles.noMatch} aria-live="polite">
            <h2>条件に合うイベントは見つかりませんでした</h2>
            <p>日付や条件を変えて、もう一度探してください。</p>
            <div>
              <button type="button" onClick={resetAndShowList}>条件をリセット</button>
              {dateFilter !== 'month' && <button type="button" onClick={showTargetMonth}>対象月を見る</button>}
            </div>
          </section>
        )}

        <section className={styles.officialNotice} aria-labelledby="official-notice-title">
          <p className={styles.sectionEyebrow}>OFFICIAL INFORMATION</p>
          <h2 id="official-notice-title">出かける前に、公式情報を確認</h2>
          <p>開催日・会場・料金・参加方法は変更される場合があります。参加前に各イベントの公式ページを確認してください。</p>
        </section>

        <section className={styles.relatedSection} aria-labelledby="event-related-title">
          <h2 id="event-related-title">関連イベント記事</h2>
          <Link href="/article/221">
            <span>2026年8月</span>
            <strong>名古屋イベントカレンダー</strong>
            <i aria-hidden="true">→</i>
          </Link>
        </section>

        {filteredItems.length > 0 && isFiltered && (
          <section className={styles.finalCta} aria-labelledby="event-final-cta-title">
            <h2 id="event-final-cta-title">次の一歩は、公式情報の確認</h2>
            <p>行きたいイベントが決まったら、公式ページで開催日と会場を確認しましょう。</p>
            <button type="button" className={styles.finalCtaPrimary} onClick={resetAndShowList}>
              {dateFilter !== 'month' ? `${targetMonthLabel}の全件を見る` : '条件をリセットして一覧を見る'} <span aria-hidden="true">↓</span>
            </button>
          </section>
        )}
      </div>

      <nav className={styles.pageEndNav} aria-label="なごとしゃサイトナビゲーション">
        <Link href="/"><HomeIcon /><span>ホーム</span></Link>
        <Link href="/event" aria-current="page"><CalendarIcon /><span>イベント</span></Link>
        <Link href="/new"><ArticleIcon /><span>新着記事</span></Link>
        <Link href="/area"><MapIcon /><span>エリア</span></Link>
      </nav>
    </main>
  );
}

function EventFeature({ item, today }: { item: EventRoundupItem; today: string }) {
  const hasImage = item.visual.type === 'image' && Boolean(item.visual.imageUrl);

  return (
    <article className={styles.featuredCard}>
      {hasImage && (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.visual.imageUrl} alt={item.visual.imageAlt ?? item.name} />
          {item.visual.creditText && <figcaption>{item.visual.creditText}</figcaption>}
        </figure>
      )}
      <div className={styles.featuredContent}>
        <EventStatus item={item} today={today} />
        <p className={styles.eventDate}>{item.dateLabel}</p>
        <h3>{item.name}</h3>
        <p className={styles.eventPlace}>{item.area} / {item.venue}</p>
        <p className={styles.eventDescription}>{item.shortDescription ?? item.shortCopy}</p>
        <a href={item.officialUrl} target="_blank" rel="noopener noreferrer">公式情報を見る <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  );
}

function EventCard({ item, today }: { item: EventRoundupItem; today: string }) {
  return (
    <li className={styles.eventCard}>
      <div className={styles.eventDateRow}>
        <p className={styles.eventDate}>{item.dateLabel}</p>
        <EventStatus item={item} today={today} />
      </div>
      <h3>{item.name}</h3>
      {item.visual.type === 'image' && item.visual.imageUrl && (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.visual.imageUrl} alt={item.visual.imageAlt ?? item.name} />
          {item.visual.creditText && <figcaption>{item.visual.creditText}</figcaption>}
        </figure>
      )}
      <p className={styles.eventPlace}>{item.area} / {item.venue}</p>
      <p className={styles.eventDescription}>{item.shortDescription ?? item.shortCopy}</p>
      {item.verifiedAt && <p className={styles.verifiedAt}>確認日 <time>{item.verifiedAt.replaceAll('-', '.')}</time></p>}
      <a href={item.officialUrl} target="_blank" rel="noopener noreferrer">公式情報を見る <span aria-hidden="true">↗</span></a>
    </li>
  );
}

function EventStatus({ item, today }: { item: EventRoundupItem; today: string }) {
  if (eventIsActiveOn(item, today)) return <span className={styles.eventLive}>開催中</span>;
  return null;
}

function selectFeaturedEvent(items: EventRoundupItem[], today: string): EventRoundupItem | undefined {
  return [...items].sort((a, b) => {
    const statusDifference = featureStatusRank(a, today) - featureStatusRank(b, today);
    if (statusDifference !== 0) return statusDifference;

    const imageDifference = Number(hasOfficialImage(b)) - Number(hasOfficialImage(a));
    if (imageDifference !== 0) return imageDifference;

    const officialDifference = Number(Boolean(b.officialUrl)) - Number(Boolean(a.officialUrl));
    if (officialDifference !== 0) return officialDifference;

    return a.startDate.localeCompare(b.startDate);
  })[0];
}

function featureStatusRank(item: EventRoundupItem, today: string): number {
  if (eventIsActiveOn(item, today)) return 0;
  if (item.startDate >= today) return 1;
  return 2;
}

function hasOfficialImage(item: EventRoundupItem): boolean {
  return item.visual.type === 'image' && Boolean(item.visual.imageUrl);
}

function getDateRange(filter: DateFilter, today: string): { start: string; end: string } {
  if (filter === 'today') return { start: today, end: today };
  if (filter === 'tomorrow') {
    const tomorrow = addDays(today, 1);
    return { start: tomorrow, end: tomorrow };
  }
  if (filter === 'weekend') {
    const dayOfWeek = new Date(`${today}T00:00:00Z`).getUTCDay();
    const saturday = addDays(today, (6 - dayOfWeek + 7) % 7);
    return { start: saturday, end: addDays(saturday, 1) };
  }

  const [year, month] = today.split('-').map(Number);
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const finalDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { start: firstDay, end: `${year}-${String(month).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}` };
}

function getTokyoDateKey(): string {
  const values = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => values.find((value) => value.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function eventOverlaps(item: EventRoundupItem, start: string, end: string): boolean {
  const itemEnd = item.endDate ?? item.startDate;
  return item.startDate <= end && itemEnd >= start;
}

function eventIsActiveOn(item: EventRoundupItem, date: string): boolean {
  return eventOverlaps(item, date, date);
}

function eventHasEnded(item: EventRoundupItem, date: string): boolean {
  return (item.endDate ?? item.startDate) < date;
}

function HomeIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3z" /><path d="M9 21v-7h6v7" /></svg>; }
function CalendarIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4m8-4v4" /></svg>; }
function ArticleIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" /></svg>; }
function MapIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15" /></svg>; }
