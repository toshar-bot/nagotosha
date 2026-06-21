'use client';

import { useDrag } from '@use-gesture/react';
import { Card } from '@/types/card';
import BookStickerVisual from './BookStickerVisual';
import Link from 'next/link';

interface TrayDragCallbacks {
  onDragStart: (stickerId: string) => void;
  onDragMove:  (x: number, y: number) => void;
  onDragEnd:   (stickerId: string, x: number, y: number) => void;
}

interface Props {
  cards: Card[];
  callbacks: TrayDragCallbacks;
}

export default function StickerTray({ cards, callbacks }: Props) {
  return (
    <div
      className="flex-shrink-0"
      style={{
        height: 112,
        background: 'linear-gradient(to top, #e0d2ba, #ebe0cc)',
        borderTop: '2px solid rgba(175,140,85,0.35)',
        boxShadow: 'inset 0 5px 16px rgba(130,95,35,0.12)',
      }}
    >
      <div className="flex items-center justify-between px-3 pt-1.5 pb-0">
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: 'rgba(110,75,28,0.5)' }}>
          STICKER TRAY — 長押し＆ドラッグしてページへ
        </p>
        {cards.length === 0 && (
          <Link href="/" style={{ fontSize: 9, color: 'rgba(110,75,28,0.4)', fontWeight: 700, textDecoration: 'underline' }}>
            探索する
          </Link>
        )}
      </div>

      <div
        className="flex items-center gap-3 px-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none', height: 88 }}
      >
        {cards.length === 0 ? (
          <p style={{ fontSize: 11, color: 'rgba(110,75,28,0.38)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            探索してシールをゲットしよう
          </p>
        ) : (
          cards.map(card => (
            <TraySticker key={card.id} card={card} callbacks={callbacks} />
          ))
        )}
      </div>
    </div>
  );
}

function TraySticker({ card, callbacks }: { card: Card; callbacks: TrayDragCallbacks }) {
  const bind = useDrag(({ first, active, last, xy: [x, y] }) => {
    if (first) callbacks.onDragStart(card.id);
    if (active && !first) callbacks.onDragMove(x, y);
    if (last) callbacks.onDragEnd(card.id, x, y);
  }, {
    pointer: { touch: true },
    threshold: 6,  // 6px 動いてからドラッグ開始
  });

  return (
    <div
      {...bind()}
      style={{
        flexShrink: 0,
        touchAction: 'none',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      className="active:scale-95 transition-transform duration-75"
    >
      <BookStickerVisual card={card} size={64} />
    </div>
  );
}
