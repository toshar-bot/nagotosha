'use client';

import { Card } from '@/types/card';
import StickerVisual from './StickerVisual';

interface Props {
  cards: Card[];
  onSelect: (stickerId: string) => void;
}

export default function StickerTray({ cards, onSelect }: Props) {
  if (cards.length === 0) {
    return (
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          height: 108,
          background: '#f0e8d4',
          borderTop: '1px solid rgba(160,130,80,0.25)',
        }}
      >
        <p className="text-[11px] text-amber-900/40 font-bold tracking-wider">
          まだシールがないぞ — 探索してゲットしよう
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-shrink-0"
      style={{
        height: 108,
        background: 'linear-gradient(to top, #e8dfc8, #f0e8d4)',
        borderTop: '1px solid rgba(160,130,80,0.3)',
        boxShadow: 'inset 0 4px 12px rgba(120,90,40,0.10)',
      }}
    >
      {/* トレイラベル */}
      <div className="flex items-center px-3 pt-1.5 pb-0.5">
        <p className="text-[9px] tracking-[0.2em] font-black text-amber-900/35">
          STICKER TRAY — タップして貼る
        </p>
      </div>

      {/* 横スクロール */}
      <div
        className="flex items-center gap-2 px-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none', height: 80 }}
      >
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            className="flex-shrink-0 active:scale-90 transition-transform duration-100"
            style={{ touchAction: 'manipulation' }}
          >
            <StickerVisual card={card} size="xs" discovered tilt={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
