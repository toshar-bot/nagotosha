'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, CollectionState } from '@/lib/storage';
import { Rarity, RARITY_CONFIG } from '@/lib/rarity';
import { Card } from '@/types/card';
import CardVisual from '@/components/CardVisual';
import DiscoveryBar from '@/components/DiscoveryBar';

type Filter = 'ALL' | Rarity;

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'すべて' },
  { key: 'N',   label: 'N' },
  { key: 'R',   label: 'R' },
  { key: 'SR',  label: 'SR' },
  { key: 'SSR', label: 'SSR' },
  { key: 'UR',  label: 'UR' },
];

export default function ZukanPage() {
  const [col, setCol] = useState<CollectionState | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    setCol(loadCollection());
  }, []);

  if (!col) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-4xl animate-toshar-float">🐻</div>
      </div>
    );
  }

  const ownedSet = new Set(col.ownedCardIds);
  const ownedCount = ownedSet.size;

  const filteredCards: Card[] = filter === 'ALL'
    ? CARDS
    : CARDS.filter(c => c.rarity === filter);

  const filteredOwned = filteredCards.filter(c => ownedSet.has(c.id)).length;

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      <header className="sticky top-0 z-30 px-4 pt-5 pb-3 space-y-3"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between">
          <h1 className="font-black text-lg tracking-wider text-white">📚 名古屋メシ図鑑</h1>
          <p className="text-xs text-gray-400">
            <span className="text-white font-black">{ownedCount}</span>
            <span> / {TOTAL_CARDS} 発見</span>
          </p>
        </div>
        <DiscoveryBar owned={ownedCount} total={TOTAL_CARDS} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map(tab => {
            const isActive = filter === tab.key;
            const cfg = tab.key !== 'ALL' ? RARITY_CONFIG[tab.key as Rarity] : null;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all active:scale-95"
                style={
                  isActive
                    ? {
                        background: cfg ? cfg.borderColor : '#e63946',
                        color: '#ffffff',
                        boxShadow: cfg ? `0 0 10px ${cfg.glowColor}` : '0 0 10px rgba(230,57,70,0.4)',
                      }
                    : {
                        background: '#1f1f1f',
                        color: cfg ? cfg.color : '#aaa',
                        border: `1px solid ${cfg ? cfg.borderColor + '44' : '#333'}`,
                      }
                }
              >
                {tab.label}
                {tab.key !== 'ALL' && (
                  <span className="ml-1 opacity-60">
                    ({CARDS.filter(c => c.rarity === tab.key && ownedSet.has(c.id)).length}/
                     {CARDS.filter(c => c.rarity === tab.key).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 px-4 pt-4">
        <p className="text-xs text-gray-500 mb-3">
          {filter === 'ALL' ? '' : `${RARITY_CONFIG[filter as Rarity].label} · `}
          <span className="text-gray-300 font-bold">{filteredOwned}</span>
          <span> / {filteredCards.length} 発見</span>
        </p>

        <div className="grid grid-cols-3 gap-3">
          {filteredCards.map(card => {
            const owned = ownedSet.has(card.id);
            return (
              <div key={card.id} className="flex flex-col items-center gap-1.5">
                {owned ? (
                  <Link href={`/card/${card.id}`} className="block">
                    <CardVisual card={card} size="sm" owned />
                  </Link>
                ) : (
                  <CardVisual card={card} size="sm" owned={false} />
                )}
              </div>
            );
          })}
        </div>

        {ownedCount === TOTAL_CARDS && (
          <div className="mt-8 text-center p-6 rounded-2xl border border-gold/30"
            style={{ background: 'linear-gradient(135deg, #1a1000, #0a0a0a)' }}>
            <p className="text-4xl mb-2">🏆</p>
            <p className="text-gold font-black text-lg">全{TOTAL_CARDS}枚コンプリート！</p>
            <p className="text-gray-400 text-sm mt-1">さすが名古屋メシの神じゃ！🐻</p>
          </div>
        )}

        {ownedCount === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">まだカードが見つかっていないのぅ…</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-3 rounded-2xl font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #e63946, #c2112a)' }}
            >
              🎴 今すぐ引きに行く！
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}