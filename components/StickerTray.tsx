'use client';

import { Card } from '@/types/card';
import BookStickerVisual from './BookStickerVisual';
import Link from 'next/link';

interface Props {
  cards: Card[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function StickerTray({ cards, selectedId, onSelect }: Props) {
  return (
    <div
      className="flex-shrink-0"
      style={{
        height: 110,
        background: 'linear-gradient(to top, #e2d5be, #ede3ce)',
        borderTop: '2px solid rgba(180,145,90,0.35)',
        boxShadow: 'inset 0 4px 14px rgba(140,100,40,0.12)',
      }}
    >
      {/* ラベル */}
      <div className="flex items-center justify-between px-3 pt-1.5 pb-0">
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: 'rgba(120,85,35,0.5)' }}>
          {selectedId ? '▼ ページをタップして貼る' : 'STICKER TRAY — タップして選ぶ'}
        </p>
        {cards.length === 0 && (
          <Link href="/" style={{ fontSize: 9, color: 'rgba(120,85,35,0.4)', fontWeight: 700, textDecoration: 'underline' }}>
            探索する
          </Link>
        )}
      </div>

      {/* トレイ横スクロール */}
      <div
        className="flex items-center gap-3 px-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none', height: 86 }}
      >
        {cards.length === 0 ? (
          <p style={{ fontSize: 11, color: 'rgba(120,85,35,0.38)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            まずは探索してシールをゲットしよう
          </p>
        ) : (
          cards.map(card => {
            const isSel = selectedId === card.id;
            return (
              <button
                key={card.id}
                onClick={() => onSelect(card.id)}
                style={{ touchAction: 'manipulation', flexShrink: 0, position: 'relative' }}
                className={`transition-transform duration-100 ${isSel ? 'scale-110' : 'active:scale-90'}`}
              >
                <BookStickerVisual card={card} size={62} selected={isSel} />
                {/* 選択時の吹き出し */}
                {isSel && (
                  <div style={{
                    position: 'absolute',
                    top: -18, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(90,90,255,0.85)',
                    color: 'white',
                    fontSize: 8, fontWeight: 900, letterSpacing: '0.05em',
                    padding: '2px 6px', borderRadius: 6,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}>
                    選択中
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
