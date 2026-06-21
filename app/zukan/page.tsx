'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import StickerVisual from '@/components/StickerVisual';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, CollectionState } from '@/lib/storage';
import { RARITY_CONFIG } from '@/lib/rarity';
import { Rarity } from '@/types/card';

type Filter = 'ALL' | Rarity;
const FILTERS: Filter[] = ['ALL', 'N', 'R', 'SR', 'SSR', 'UR'];

export default function StickerBookPage() {
  const [col, setCol]       = useState<CollectionState | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => { setCol(loadCollection()); }, []);

  const discoveredIds = col?.ownedCardIds ?? [];
  const cards = useMemo(
    () => CARDS.filter(c => filter === 'ALL' || c.rarity === filter),
    [filter],
  );
  const discoveredCount = discoveredIds.length;
  const pct = Math.round((discoveredCount / TOTAL_CARDS) * 100);

  if (!col) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#030108]">
        <div className="game-icon book animate-toshar-float" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#030108] pb-24"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      {/* 背景グロウ */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 40% at 50% 10%, rgba(110,65,10,0.16) 0%, transparent 60%)',
      }} />

      {/* ヘッダー */}
      <header className="relative z-10 px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-white/40 text-sm font-bold active:scale-95 transition-transform">
            ← HOME
          </Link>
          <div className="text-center">
            <p className="text-[9px] tracking-[0.22em] font-bold text-white/30">NAGOTOSHA</p>
            <h1 className="text-white font-black text-xl">シール帳</h1>
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* 発見数バー */}
        <div className="rounded-2xl bg-white/5 border border-white/8 px-4 py-3">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[9px] tracking-widest text-white/30 font-bold">DISCOVERED</p>
              <p className="text-white font-black text-xl leading-none">
                {discoveredCount}
                <span className="text-white/35 text-sm font-bold"> / {TOTAL_CARDS}</span>
              </p>
            </div>
            <p className="text-white/40 text-xs font-black">{pct}%</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      {/* フィルタータブ */}
      <div className="relative z-10 flex gap-2 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => {
          const active = filter === f;
          const cfg = f !== 'ALL' ? RARITY_CONFIG[f] : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="h-8 px-3 rounded-full border text-[11px] font-black flex-shrink-0 transition-all duration-150 active:scale-95"
              style={{
                background: active ? (cfg ? `${cfg.borderColor}22` : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.05)',
                borderColor: active ? (cfg?.borderColor ?? 'rgba(255,255,255,0.4)') : 'rgba(255,255,255,0.10)',
                color: active ? (cfg?.color ?? 'white') : 'rgba(255,255,255,0.35)',
                boxShadow: active && cfg ? `0 0 14px ${cfg.glowColor}` : 'none',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* シールグリッド */}
      <div className="relative z-10 grid grid-cols-3 gap-x-3 gap-y-5 px-4 pt-2">
        {cards.map((card, i) => {
          const discovered = discoveredIds.includes(card.id);
          const count = col.cardCounts[card.id] ?? 0;
          const isNew = discovered && count <= 1;

          return discovered ? (
            <Link
              key={card.id}
              href={`/card/${card.id}`}
              className="flex justify-center active:scale-95 transition-transform"
              style={{
                animation: `sticker-drop 0.38s cubic-bezier(0.34,1.4,0.64,1) both`,
                animationDelay: `${Math.min(i * 0.03, 0.5)}s`,
              }}
            >
              <StickerVisual card={card} size="sm" discovered tilt isNew={isNew} />
            </Link>
          ) : (
            <div key={card.id} className="flex justify-center">
              <StickerVisual card={card} size="sm" discovered={false} tilt />
            </div>
          );
        })}
      </div>

      {/* 完全コンプリートメッセージ */}
      {discoveredCount === TOTAL_CARDS && (
        <div className="relative z-10 mx-4 mt-8 p-5 rounded-2xl text-center bg-white/5 border border-amber-400/20">
          <p className="text-amber-400 font-black text-lg mb-1">全シール発見！</p>
          <p className="text-white/50 text-sm">名古屋メシ博士を名乗っていいぞ！</p>
        </div>
      )}
    </div>
  );
}
