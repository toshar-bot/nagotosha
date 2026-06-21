'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CARDS } from '@/data/cards';
import { loadCollection } from '@/lib/storage';
import {
  loadPlaced, addPlaced, movePlaced, removePlaced,
  PlacedStickerData,
} from '@/lib/stickerBook';
import { Card } from '@/types/card';
import { getAllThemes, PageTheme } from '@/lib/bookThemes';
import StickerBook, { randomRotation } from '@/components/StickerBook';
import StickerTray from '@/components/StickerTray';
import BookStickerVisual from '@/components/BookStickerVisual';

export default function BookPage() {
  const [ownedCards, setOwnedCards]     = useState<Card[]>([]);
  const [placed, setPlaced]             = useState<PlacedStickerData[]>([]);
  const [newUid, setNewUid]             = useState<string | null>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [toast, setToast]               = useState<string | null>(null);

  // Ghost drag state — only null when no drag is active
  const [ghostDrag, setGhostDrag]       = useState<{ stickerId: string; x: number; y: number } | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  const leftPageRef  = useRef<HTMLDivElement>(null);
  const rightPageRef = useRef<HTMLDivElement>(null);

  const themes = getAllThemes();
  const theme  = themes[activePageIndex];

  // Build cardMap once
  const cardMap: Record<string, Card> = {};
  for (const c of CARDS) cardMap[c.id] = c;

  useEffect(() => {
    const col = loadCollection();
    setOwnedCards(CARDS.filter(c => col.ownedCardIds.includes(c.id)));
    setPlaced(loadPlaced());
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  // ── Ghost drag helpers ──
  function getDropTarget(x: number, y: number): { pageId: 'left' | 'right'; cx: number; cy: number } | null {
    for (const [ref, pageId] of [
      [leftPageRef,  'left'],
      [rightPageRef, 'right'],
    ] as [React.RefObject<HTMLDivElement>, 'left' | 'right'][]) {
      const r = ref.current?.getBoundingClientRect();
      if (!r) continue;
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return {
          pageId,
          cx: ((x - r.left) / r.width)  * 100,
          cy: ((y - r.top)  / r.height) * 100,
        };
      }
    }
    return null;
  }

  const handleDragStart = useCallback((stickerId: string) => {
    setGhostDrag({ stickerId, x: -999, y: -999 });
  }, []);

  const handleDragMove = useCallback((x: number, y: number) => {
    // Direct DOM update for 60fps — avoid React re-render on every move
    if (ghostRef.current) {
      ghostRef.current.style.left = `${x}px`;
      ghostRef.current.style.top  = `${y}px`;
    }
    // Keep sticker ID in ref so onDragEnd can read it without stale closure
    setGhostDrag(prev => prev ? { ...prev, x, y } : null);
  }, []);

  const handleDragEnd = useCallback((stickerId: string, x: number, y: number) => {
    setGhostDrag(null);
    const target = getDropTarget(x, y);
    if (!target) return;
    const rotation = randomRotation();
    const updated  = addPlaced(stickerId, activePageIndex, target.pageId, target.cx, target.cy, rotation);
    const uid      = updated[updated.length - 1].uid;
    setPlaced(updated);
    setNewUid(uid);
    setTimeout(() => setNewUid(null), 600);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageIndex]);

  const handleStickerMove = useCallback((uid: string, cx: number, cy: number, rotation: number, scale: number) => {
    setPlaced(movePlaced(uid, cx, cy, rotation, scale));
  }, []);

  const handleStickerRemove = useCallback((uid: string) => {
    setPlaced(removePlaced(uid));
    showToast('はがした');
  }, []);

  // Current page's stickers only
  const pagePlaced = placed.filter(p => p.pageIndex === activePageIndex);

  // Ghost sticker card
  const ghostCard = ghostDrag ? cardMap[ghostDrag.stickerId] : null;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
        background: '#c4a882',
      }}
    >
      {/* ヘッダー */}
      <header
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{
          height: 44,
          background: '#ede3ce',
          borderBottom: '1.5px solid rgba(160,120,60,0.3)',
        }}
      >
        <Link
          href="/"
          className="active:opacity-60 transition-opacity"
          style={{ fontSize: 13, fontWeight: 900, color: 'rgba(120,85,35,0.6)' }}
        >
          ← HOME
        </Link>
        <p style={{ fontWeight: 900, fontSize: 14, letterSpacing: '0.06em', color: 'rgba(100,70,25,0.75)', fontStyle: 'italic' }}>
          名古屋メシ帳
        </p>
        <span style={{ fontSize: 11, color: 'rgba(120,85,35,0.45)', fontWeight: 700 }}>
          {placed.length}枚
        </span>
      </header>

      {/* テーマタブ */}
      <ThemeTabs themes={themes} active={activePageIndex} onChange={setActivePageIndex} />

      {/* トースト */}
      {toast && (
        <div style={{
          position: 'fixed', top: 90, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(60,40,10,0.72)', color: 'white',
          fontSize: 12, fontWeight: 900, padding: '5px 14px',
          borderRadius: 20, zIndex: 200, pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
        }}>
          {toast}
        </div>
      )}

      {/* シール帳本体 */}
      <StickerBook
        theme={theme}
        placed={pagePlaced}
        cardMap={cardMap}
        newUid={newUid}
        leftPageRef={leftPageRef}
        rightPageRef={rightPageRef}
        onStickerMove={handleStickerMove}
        onStickerRemove={handleStickerRemove}
      />

      {/* シールトレイ */}
      <StickerTray
        cards={ownedCards}
        callbacks={{ onDragStart: handleDragStart, onDragMove: handleDragMove, onDragEnd: handleDragEnd }}
      />

      {/* ゴーストシール（ドラッグ中） */}
      {ghostDrag && ghostCard && (
        <div
          ref={ghostRef}
          style={{
            position: 'fixed',
            left: ghostDrag.x,
            top:  ghostDrag.y,
            transform: 'translate(-50%, -50%) rotate(-6deg) scale(1.15)',
            pointerEvents: 'none',
            zIndex: 500,
            opacity: 0.85,
            filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.40))',
            transition: 'none',
          }}
        >
          <BookStickerVisual card={ghostCard} size={80} />
        </div>
      )}
    </div>
  );
}

/* ── テーマタブ ── */
interface ThemeTabsProps {
  themes: PageTheme[];
  active: number;
  onChange: (i: number) => void;
}

function ThemeTabs({ themes, active, onChange }: ThemeTabsProps) {
  return (
    <div
      className="flex items-center justify-between flex-shrink-0 px-3"
      style={{
        height: 38,
        background: '#e4d4b4',
        borderBottom: '1px solid rgba(160,120,60,0.2)',
        gap: 4,
      }}
    >
      {themes.map((t, i) => {
        const isActive = i === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(i)}
            className="active:scale-90 transition-all duration-150"
            style={{
              flex: 1,
              height: 26,
              borderRadius: 20,
              background: isActive ? t.accent : 'rgba(0,0,0,0.06)',
              color: isActive ? '#fff' : 'rgba(100,70,25,0.55)',
              fontWeight: 900,
              fontSize: 9,
              letterSpacing: '0.05em',
              border: isActive ? 'none' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isActive ? `0 2px 8px ${t.accent}55` : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
