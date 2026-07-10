'use client';

import { EventSaveButton } from '@/components/EventSaveButton';

type EventItem = {
  id: string;
  title: string;
  area: string;
  tag: string;
  description: string;
  imageUrl: string;
  startDate?: string;
  endDate?: string;
};

type PeriodLabel = {
  status: string;
  dateRange: string;
  isActive: boolean;
};

function getEventPeriodLabel(startDate?: string, endDate?: string): PeriodLabel {
  if (!startDate || !endDate) return { status: '開催中', dateRange: '', isActive: true };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const dateRange = startDate === endDate ? fmt(start) : `${fmt(start)}〜${fmt(end)}`;

  if (today > end) return { status: '終了', dateRange, isActive: false };
  if (today < start) return { status: `${fmt(start)}〜`, dateRange, isActive: false };

  // Check if overlaps with this or next weekend
  const day = today.getDay();
  const toSat = day === 0 ? 6 : 6 - day;
  const nextSat = new Date(today);
  nextSat.setDate(today.getDate() + toSat);
  const nextSun = new Date(nextSat);
  nextSun.setDate(nextSat.getDate() + 1);
  const isWeekend = start <= nextSun && end >= nextSat;

  if (isWeekend) return { status: '今週末', dateRange, isActive: true };
  return { status: '開催中', dateRange, isActive: true };
}

export function EventCardClient({ event }: { event: EventItem }) {
  const mapUrl = `https://www.google.com/maps/search/?${new URLSearchParams({
    api: '1',
    query: `名古屋 ${event.area} ${event.title}`,
  }).toString()}`;

  const period = getEventPeriodLabel(event.startDate, event.endDate);

  if (!period.isActive && period.status === '終了') return null;

  return (
    <article
      className="overflow-hidden rounded-[18px] bg-white"
      style={{
        border: '1px solid #E6ECF5',
        boxShadow: '0 8px 24px rgba(7,26,77,0.08)',
      }}
    >
      {/* 写真エリア */}
      <div
        className="relative h-[160px] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFF1ED 0%, #FFE0DD 100%)' }}
      >
        {event.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.22) 100%)' }}
        />
      </div>

      {/* テキストエリア */}
      <div className="p-4">
        <h2 className="text-[17px] font-black leading-snug" style={{ color: '#071A4D' }}>
          {event.title}
        </h2>

        <p
          className="mt-2 text-[12px] font-medium leading-6"
          style={{ color: '#667085', wordBreak: 'keep-all', overflowWrap: 'normal' }}
        >
          {event.description}
        </p>

        {/* チップ行：エリア＋開催状況＋日付＋カテゴリタグ */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ color: '#071A4D', background: 'rgba(7,26,77,0.06)' }}
          >
            <MapPinIcon />
            {event.area}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-black"
            style={{
              color: period.status === '開催中' || period.status === '今週末' ? '#E8483F' : '#071A4D',
              background: period.status === '開催中' || period.status === '今週末' ? 'rgba(232,72,63,0.08)' : 'rgba(7,26,77,0.08)',
            }}
          >
            {period.status}
          </span>
          {period.dateRange && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{ color: '#667085', background: 'rgba(7,26,77,0.04)' }}
            >
              {period.dateRange}
            </span>
          )}
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ color: '#071A4D', background: 'rgba(7,26,77,0.06)' }}
          >
            {event.tag}
          </span>
        </div>

        {/* ボタン行 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/new"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
            style={{
              color: '#ffffff',
              background: '#E8483F',
              boxShadow: '0 6px 14px rgba(232,72,63,0.25)',
            }}
          >
            詳細を見る
            <ArrowRightIcon />
          </a>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
            style={{
              color: '#071A4D',
              background: 'rgba(7,26,77,0.06)',
              border: '1px solid #E6ECF5',
            }}
          >
            地図で探す
            <MapPinIcon />
          </a>
          <EventSaveButton
            id={event.id}
            type="event"
            title={event.title}
            area={event.area}
            category={event.tag}
            articleUrl="/event"
            mapUrl={mapUrl}
            imageUrl={event.imageUrl}
          />
        </div>
      </div>
    </article>
  );
}

function MapPinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
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
