'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CardVisual from '@/components/CardVisual';
import DiscoveryBar from '@/components/DiscoveryBar';
import TosharBubble from '@/components/TosharBubble';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, CollectionState } from '@/lib/storage';
import { RARITY_CONFIG } from '@/lib/rarity';
import { Rarity } from '@/types/card';

type Filter = 'ALL' | Rarity;

const FILTERS: Filter[] = ['ALL', 'N', 'R', 'SR', 'SSR', 'UR'];

export default function ZukanPage() {
  const [col, setCol] = useState<CollectionState | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    setCol(loadCollection());
  }, []);

  const ownedIds = col?.ownedCardIds ?? [];
  const cards = useMemo(
    () => CARDS.filter(card => filter === 'ALL' || card.rarity === filter),
    [filter],
  );

  if (!col) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="game-icon book animate-toshar-float" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-24 px-4 pt-5">
      <header className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-sm text-gray-400 font-bold active:scale-95">
            ← HOME
          </Link>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.25em] text-gray-500 font-bold">NAGOTOSHA</p>
            <h1 className="text-white font-black text-xl">図鑑</h1>
          </div>
        </div>
        <DiscoveryBar owned={ownedIds.length} total={TOTAL_CARDS} />
      </header>

      <TosharBubble
        size="sm"
        text={ownedIds.length === TOTAL_CARDS
          ? 'コンプリートじゃ！名古屋メシ博士を名乗ってよいぞ。'
          : '集めたカードを確認するんじゃ。未発見の店はまだ秘密じゃぞ。'}
      />

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map(item => {
          const active = filter === item;
          const cfg = item === 'ALL' ? null : RARITY_CONFIG[item];
          return (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`h-9 px-3 rounded-full border text-xs font-black flex-shrink-0 transition-all ${
                active ? 'text-white border-accent bg-accent/20' : 'text-gray-400 border-border bg-surface'
              }`}
              style={cfg && active ? { borderColor: cfg.borderColor, color: cfg.color } : undefined}
            >
              {item === 'ALL' ? 'ALL' : item}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {cards.map(card => {
          const owned = ownedIds.includes(card.id);
          const visual = <CardVisual card={card} size="sm" owned={owned} />;

          return owned ? (
            <Link
              key={card.id}
              href={`/card/${card.id}`}
              className="block active:scale-95 transition-transform"
              aria-label={`${card.name}の詳細`}
            >
              {visual}
            </Link>
          ) : (
            <div key={card.id} className="opacity-75">
              {visual}
            </div>
          );
        })}
      </div>
    </div>
  );
}
