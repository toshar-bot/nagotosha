'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearSavedItems, getSavedItems, removeSavedItem, SAVED_ITEMS_UPDATED_EVENT } from '@/lib/saved';
import type { SavedItem } from '@/types/portal';

const TYPE_LABELS: Record<SavedItem['type'], string> = {
  article: '記事',
  store: '店舗',
  event: 'イベント',
  area: 'エリア',
};

const EMPTY_STATE_LINKS = [
  { href: '/new', label: '新着記事を探す' },
  { href: '/event', label: 'イベントを探す' },
  { href: '/area', label: 'エリアから探す' },
];

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[] | null>(null);

  useEffect(() => {
    const syncItems = () => setItems(getSavedItems());
    syncItems();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncItems();
    };

    window.addEventListener(SAVED_ITEMS_UPDATED_EVENT, syncItems);
    window.addEventListener('focus', syncItems);
    window.addEventListener('storage', syncItems);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(SAVED_ITEMS_UPDATED_EVENT, syncItems);
      window.removeEventListener('focus', syncItems);
      window.removeEventListener('storage', syncItems);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleRemove = (item: SavedItem) => {
    setItems(removeSavedItem(item));
  };

  const handleClear = () => {
    if (!window.confirm('保存した記事をすべて削除しますか？')) return;
    clearSavedItems();
    setItems([]);
  };

  return (
    <main className="min-h-dvh pb-28" style={{ background: '#ffffff' }}>

      {/* ── ページヘッダー ── */}
      <section className="px-4 pt-8 pb-5">
        <p className="text-[10px] font-black tracking-[0.22em]" style={{ color: '#E8483F' }}>
          SAVED
        </p>
        <h1 className="mt-1 text-[28px] font-black leading-tight tracking-tight" style={{ color: '#071A4D' }}>
          保存した記事
        </h1>
        <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
          気になる記事や行きたいお店を、あとから見返せる場所です。
        </p>
      </section>

      {/* ── 保存リスト ── */}
      <section className="px-4 pt-3">
        {items === null ? (
          <LoadingState />
        ) : items.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[12px] font-black" style={{ color: '#071A4D' }}>
                {items.length}件を保存中
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full px-3 py-1.5 text-[11px] font-black active:scale-95 transition-transform"
                style={{
                  color: '#E8483F',
                  background: 'rgba(232,72,63,0.08)',
                  border: '1px solid rgba(232,72,63,0.22)',
                }}
              >
                すべて削除
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {items.map(item => (
                <SavedCard key={`${item.type}-${item.id}`} item={item} onRemove={handleRemove} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

    </main>
  );
}

function SavedCard({ item, onRemove }: { item: SavedItem; onRemove: (item: SavedItem) => void }) {
  const dest = item.articleUrl || '/new';
  return (
    <article
      className="relative overflow-hidden rounded-[18px] bg-white"
      style={{ border: '1px solid #E6ECF5', boxShadow: '0 8px 24px rgba(7,26,77,0.08)' }}
    >
      {/* 全体タップ用オーバーレイ */}
      <a href={dest} className="absolute inset-0 z-10" aria-label={`${item.title}を見る`} />

      {/* 写真エリア（imageUrlがなくてもフォールバック表示） */}
      <div
        className="relative h-[120px] overflow-hidden"
        style={{ background: FALLBACK_BG[item.type] }}
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: FALLBACK_ICON_COLOR[item.type], opacity: 0.35 }}>
            <FallbackIcon type={item.type} />
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.18) 100%)' }}
        />
      </div>

      {/* テキストエリア */}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-black"
            style={{ color: '#071A4D', background: 'rgba(7,26,77,0.08)' }}
          >
            {TYPE_LABELS[item.type]}
          </span>
          {item.area && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{ color: '#667085', background: '#F8FAFC' }}
            >
              <MapPinIcon />
              {item.area}
            </span>
          )}
          {item.category && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{ color: '#667085', background: '#F8FAFC' }}
            >
              {item.category}
            </span>
          )}
        </div>

        <h2 className="mt-2 text-[15px] font-black leading-snug" style={{ color: '#071A4D' }}>
          {item.title}
        </h2>
        <p className="mt-1.5 text-[10px] font-bold" style={{ color: '#9BA3B0' }}>
          保存日：{formatSavedAt(item.savedAt)}
        </p>

        {/* ボタン行（z-20 で overlay より上） */}
        <div className="relative z-20 mt-4 flex flex-wrap gap-2">
          {item.articleUrl && (
            <a
              href={item.articleUrl}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-black active:scale-95 transition-transform"
              style={{ color: '#ffffff', background: '#E8483F', boxShadow: '0 6px 14px rgba(232,72,63,0.25)' }}
            >
              記事を見る
              <ArrowRightIcon />
            </a>
          )}
          {item.mapUrl && (
            <a
              href={item.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-black active:scale-95 transition-transform"
              style={{ color: '#071A4D', background: 'rgba(7,26,77,0.06)', border: '1px solid #E6ECF5' }}
            >
              地図で開く
              <MapPinIcon />
            </a>
          )}
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-black active:scale-95 transition-transform"
            style={{ color: '#E8483F', background: 'rgba(232,72,63,0.08)', border: '1px solid rgba(232,72,63,0.18)' }}
          >
            削除
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-[18px] bg-white p-5 text-center"
      style={{ border: '1px solid #E6ECF5', boxShadow: '0 8px 24px rgba(7,26,77,0.08)' }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(232,72,63,0.08)', color: '#E8483F' }}
      >
        <BookmarkIcon large />
      </div>
      <h2 className="mt-4 text-[17px] font-black" style={{ color: '#071A4D' }}>
        保存した記事はまだありません
      </h2>
      <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
        気になるお店やイベントを保存すると、ここに表示されます。
      </p>
      <p className="mt-5 text-[12px] font-black" style={{ color: '#071A4D' }}>
        まずは、気になる情報を探しに行きましょう。
      </p>
      <div className="mt-4 grid gap-2">
        {EMPTY_STATE_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-[14px] px-4 py-3 text-[13px] font-black active:scale-[0.98] transition-transform"
            style={{ color: '#071A4D', background: '#F8FAFC', border: '1px solid #E6ECF5' }}
          >
            {link.label}
            <ArrowRightIcon />
          </Link>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="rounded-[18px] bg-white p-5 text-center"
      style={{ border: '1px solid #E6ECF5', boxShadow: '0 8px 24px rgba(7,26,77,0.08)' }}
    >
      <p className="text-[13px] font-black" style={{ color: '#071A4D' }}>
        保存した記事を読み込んでいます
      </p>
    </div>
  );
}

function formatSavedAt(savedAt: string) {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return savedAt;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/* ── フォールバック用定数 ── */

const FALLBACK_BG: Record<string, string> = {
  event: 'linear-gradient(135deg, #FFF1ED 0%, #FFE0DD 100%)',
  article: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
  store: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
  area: 'linear-gradient(135deg, #F0FDF4 0%, #BBF7D0 100%)',
};

const FALLBACK_ICON_COLOR: Record<string, string> = {
  event: '#E8483F',
  article: '#3B82F6',
  store: '#EA580C',
  area: '#16A34A',
};

function FallbackIcon({ type }: { type: string }) {
  if (type === 'event') return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" /><path d="M8 2v5" /><path d="M16 2v5" />
    </svg>
  );
  if (type === 'store') return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h16l-1.5-6h-13L4 10z" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" />
    </svg>
  );
  if (type === 'area') return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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

function BookmarkIcon({ large = false }: { large?: boolean }) {
  const size = large ? 22 : 11;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
