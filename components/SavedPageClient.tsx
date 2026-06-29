'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearSavedItems, getSavedItems, removeSavedItem } from '@/lib/saved';
import type { SavedItem } from '@/types/portal';

const TYPE_LABELS: Record<SavedItem['type'], string> = {
  article: '記事',
  store: '店舗',
  event: 'イベント',
  area: 'エリア',
};

const POPULAR_SAVED_SPOTS = [
  {
    rank: 1,
    title: '大須スペシャルティコーヒー',
    area: '大須',
    saves: 312,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=75',
    href: '/new',
  },
  {
    rank: 2,
    title: '覚王山アパートメント秋市',
    area: '覚王山',
    saves: 204,
    imageUrl: 'https://images.unsplash.com/photo-1513125370-3460ebe3401b?auto=format&fit=crop&w=400&q=75',
    href: '/event',
  },
  {
    rank: 3,
    title: '栄 光のインスタレーション',
    area: '栄',
    saves: 128,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=75',
    href: '/event',
  },
];

const EMPTY_STATE_LINKS = [
  { href: '/new', label: '新着記事を探す' },
  { href: '/event', label: 'イベントを探す' },
  { href: '/area', label: 'エリアから探す' },
];

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
        {items.length > 0 ? (
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
                <SavedCard key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      <PopularSavedSpots savedCount={items.length} />
    </main>
  );
}

function SavedCard({ item, onRemove }: { item: SavedItem; onRemove: (id: string) => void }) {
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
            onClick={() => onRemove(item.id)}
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

function PopularSavedSpots({ savedCount }: { savedCount: number }) {
  return (
    <section className="px-4 pt-8">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
              SAVED RANKING
            </p>
            <h2 className="mt-1 text-[19px] font-black tracking-tight" style={{ color: '#071A4D' }}>
              保存されている人気スポット
            </h2>
          </div>
          {savedCount > 0 && (
            <span
              className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black"
              style={{ color: '#E8483F', background: 'rgba(232,72,63,0.08)', border: '1px solid rgba(232,72,63,0.18)' }}
            >
              あなたの保存 {savedCount}件
            </span>
          )}
        </div>
        <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
          みんながあとで見返したいお店やイベントを、今後ここに集計していきます。
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {POPULAR_SAVED_SPOTS.map((item) => (
          <a
            key={item.rank}
            href={item.href}
            className="relative overflow-hidden rounded-[18px] bg-white block active:scale-[0.98] transition-transform"
            style={{
              border: item.rank === 1 ? '1.5px solid rgba(232,72,63,0.22)' : '1px solid #E6ECF5',
              boxShadow: item.rank === 1 ? '0 10px 28px rgba(232,72,63,0.12)' : '0 6px 18px rgba(7,26,77,0.07)',
              textDecoration: 'none',
            }}
          >
            {/* 写真 */}
            <div
              className="relative h-[120px] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #FFF1ED 0%, #FFE0DD 100%)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.30) 100%)' }}
              />
              {/* 順位バッジ（SVG） */}
              <div className="absolute left-3 top-3">
                <RankBadge rank={item.rank} />
              </div>
              {/* 保存数バッジ */}
              <div className="absolute right-3 bottom-3">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black text-white"
                  style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)' }}
                >
                  <BookmarkIcon />
                  {item.saves.toLocaleString()}
                </span>
              </div>
            </div>

            {/* テキスト */}
            <div className="px-4 py-3">
              <h3 className="text-[15px] font-black leading-snug" style={{ color: '#071A4D' }}>
                {item.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold" style={{ color: '#667085' }}>
                <MapPinIcon />
                {item.area}
              </p>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-4 text-[10px] font-medium leading-5" style={{ color: '#667085' }}>
        現在はサンプル表示です。今後、実際の保存数をもとにランキング化していきます。
      </p>
    </section>
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

/* ── ランキングバッジ（SVG） ── */

const RANK_COLORS = [
  { bg: '#E8483F', text: '#fff', shadow: 'rgba(232,72,63,0.45)' },   // 1位：なごとしゃ赤
  { bg: '#8A96A8', text: '#fff', shadow: 'rgba(100,120,150,0.35)' }, // 2位：シルバー
  { bg: '#B07060', text: '#fff', shadow: 'rgba(176,112,96,0.35)' },  // 3位：ブロンズ
];

function RankBadge({ rank }: { rank: number }) {
  const c = RANK_COLORS[rank - 1];
  if (!c) {
    return (
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-black text-white"
        style={{ background: 'rgba(7,26,77,0.65)', backdropFilter: 'blur(4px)' }}
      >
        {rank}
      </span>
    );
  }
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-black"
      style={{
        background: c.bg,
        color: c.text,
        boxShadow: `0 4px 10px ${c.shadow}`,
      }}
    >
      {rank === 1 ? (
        <span className="flex flex-col items-center gap-0">
          <CrownIcon />
          <span style={{ fontSize: 9, lineHeight: 1, marginTop: -1 }}>1</span>
        </span>
      ) : rank}
    </span>
  );
}

function CrownIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 24 16" fill="currentColor">
      <path d="M2 14h20M2 14L4 4l5 6 3-8 3 8 5-6 2 10H2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="4" cy="4" r="1.5" fill="currentColor" />
      <circle cx="12" cy="1.5" r="1.5" fill="currentColor" />
      <circle cx="20" cy="4" r="1.5" fill="currentColor" />
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
