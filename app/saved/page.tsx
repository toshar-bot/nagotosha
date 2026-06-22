'use client';

import { useEffect, useState } from 'react';
import { clearSavedItems, getSavedItems, removeSavedItem } from '@/lib/saved';
import type { SavedItem } from '@/types/portal';

const TYPE_LABELS: Record<SavedItem['type'], string> = {
  article: '記事',
  store: '店舗',
  event: 'イベント',
  area: 'エリア',
};

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    setItems(getSavedItems());
  }, []);

  const handleRemove = (id: string) => {
    setItems(removeSavedItem(id));
  };

  const handleClear = () => {
    if (!window.confirm('保存した記事をすべて削除しますか？')) return;
    clearSavedItems();
    setItems([]);
  };

  return (
    <main className="min-h-dvh pb-28" style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}>
      <section className="relative overflow-hidden px-5 pt-7 pb-6">
        <div className="absolute inset-x-0 top-0 h-56" style={{ background: 'radial-gradient(circle at 18% 8%, rgba(255,255,255,0.92) 0%, transparent 36%), radial-gradient(circle at 85% 18%, rgba(10,154,154,0.14) 0%, transparent 34%)' }} />
        <div className="relative">
          <p className="text-[10px] font-black tracking-[0.22em] mb-3" style={{ color: '#0a9a9a' }}>SAVED</p>
          <h1 className="text-[28px] font-black leading-tight tracking-tight" style={{ color: '#0a2438' }}>保存した記事</h1>
          <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>
            気になる記事や行きたいお店を、あとから見返せる場所です。
          </p>
        </div>
      </section>

      <section className="px-4 pt-3">
        {items.length > 0 ? (
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[12px] font-black" style={{ color: '#416b7d' }}>
                {items.length}件を保存中
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full px-3 py-1.5 text-[11px] font-black active:scale-95 transition-transform"
                style={{
                  color: '#7a4050',
                  background: 'rgba(201,65,45,0.08)',
                  border: '1px solid rgba(201,65,45,0.14)',
                }}
              >
                保存をすべて削除
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {items.map(item => (
                <SavedCard key={item.id} item={item} onRemove={handleRemove} />
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

function SavedCard({ item, onRemove }: { item: SavedItem; onRemove: (id: string) => void }) {
  return (
    <article
      className="rounded-2xl bg-white p-4"
      style={{
        border: '1px solid rgba(29,91,115,0.10)',
        boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full px-2.5 py-1 text-[10px] font-black" style={{ color: '#1d5b73', background: 'rgba(29,91,115,0.08)' }}>
              {TYPE_LABELS[item.type]}
            </span>
            {item.area && (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ color: '#5f8392', background: '#f1f7fb' }}>
                {item.area}
              </span>
            )}
            {item.category && (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ color: '#5f8392', background: '#f1f7fb' }}>
                {item.category}
              </span>
            )}
          </div>
          <h2 className="text-[15px] font-black leading-snug" style={{ color: '#0a2438' }}>
            {item.title}
          </h2>
          <p className="mt-2 text-[10px] font-bold" style={{ color: '#8aa5b0' }}>
            保存日：{formatSavedAt(item.savedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black active:scale-95 transition-transform"
          style={{
            color: '#7a4050',
            background: 'rgba(201,65,45,0.08)',
            border: '1px solid rgba(201,65,45,0.14)',
          }}
        >
          削除
        </button>
      </div>

      {(item.articleUrl || item.mapUrl) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.articleUrl && (
            <a
              href={item.articleUrl}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-black active:scale-95 transition-transform"
              style={{ color: '#ffffff', background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)' }}
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
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl bg-white p-5 text-center" style={{ border: '1.5px solid rgba(29,91,115,0.12)', boxShadow: '0 8px 24px rgba(10,36,56,0.08)' }}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #e8f7fb, #d9f3ef)', color: '#1d5b73' }}>
        <BookmarkIcon />
      </div>
      <h2 className="mt-4 text-[17px] font-black" style={{ color: '#0a2438' }}>保存した記事はまだありません</h2>
      <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#5a7b8a' }}>
        気になるお店やイベントを保存すると、ここに表示されます。
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

function BookmarkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
