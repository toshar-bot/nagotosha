'use client';

import { useRef } from 'react';
import { Card } from '@/types/card';
import { PlacedStickerData } from '@/lib/stickerBook';
import PlacedSticker, { PLACED_STICKER_SIZE } from './PlacedSticker';

interface Props {
  cards: Card[];
  placed: PlacedStickerData[];
  newUid: string | null;
  pendingStickerId: string | null;     // トレイで選択中のシールID
  activeUid: string | null;            // ページ上で選択中のシールUID
  onPageTap: (pageId: 'left' | 'right', cx: number, cy: number) => void;
  onStickerSelect: (uid: string) => void;
  onStickerDeselect: () => void;
  onStickerMove: (uid: string, cx: number, cy: number) => void;
}

// ランダム角度 ±12°
export function randomRotation() {
  return (Math.random() - 0.5) * 24;
}

// ページクリック時のデフォルト座標クランプ
function clampCx(rawPct: number, pageW: number) {
  const halfPct = (PLACED_STICKER_SIZE / 2 / pageW) * 100;
  return Math.max(halfPct + 2, Math.min(100 - halfPct - 2, rawPct));
}
function clampCy(rawPct: number, pageH: number) {
  const halfPct = (PLACED_STICKER_SIZE / 2 / pageH) * 100;
  return Math.max(halfPct + 12, Math.min(100 - halfPct - 5, rawPct));
}

export default function StickerBook({
  cards, placed, newUid, pendingStickerId, activeUid,
  onPageTap, onStickerSelect, onStickerDeselect, onStickerMove,
}: Props) {
  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));
  const leftRef  = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  function handlePagePointerUp(e: React.PointerEvent, pageId: 'left' | 'right') {
    if (!pendingStickerId) return;
    // 貼り付け位置を計算
    const ref = pageId === 'left' ? leftRef : rightRef;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top)  / rect.height) * 100;
    onPageTap(pageId, clampCx(rawX, rect.width), clampCy(rawY, rect.height));
  }

  const leftPlaced  = placed.filter(p => p.pageId === 'left');
  const rightPlaced = placed.filter(p => p.pageId === 'right');

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        background: '#c4a882',
        padding: '8px 5px 5px',
        boxShadow: 'inset 0 3px 10px rgba(80,50,10,0.28), 0 2px 12px rgba(0,0,0,0.18)',
      }}
    >
      {/* 見開き本体 */}
      <div
        className="relative flex w-full h-full"
        style={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
        }}
      >
        {/* ── 左ページ ── */}
        <PageArea
          ref={leftRef}
          side="left"
          placed={leftPlaced}
          cardMap={cardMap}
          newUid={newUid}
          activeUid={activeUid}
          isPending={!!pendingStickerId}
          onPointerUp={e => handlePagePointerUp(e, 'left')}
          onStickerSelect={onStickerSelect}
          onStickerDeselect={onStickerDeselect}
          onStickerMove={onStickerMove}
          getRect={() => leftRef.current?.getBoundingClientRect() ?? null}
        />

        {/* ── 綴じ部 ── */}
        <div
          style={{
            width: 14,
            flexShrink: 0,
            background: 'linear-gradient(to right, #b09070 0%, #d4bc98 40%, #c8aa80 60%, #a88860 100%)',
            boxShadow: 'inset -3px 0 8px rgba(0,0,0,0.12), inset 3px 0 8px rgba(0,0,0,0.12)',
            position: 'relative',
          }}
        >
          {/* リング穴 */}
          {[14, 30, 46, 62, 78].map((pct, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: '50%', transform: 'translateX(-50%)',
              top: `${pct}%`,
              width: 9, height: 9, borderRadius: '50%',
              background: '#886840',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>

        {/* ── 右ページ ── */}
        <PageArea
          ref={rightRef}
          side="right"
          placed={rightPlaced}
          cardMap={cardMap}
          newUid={newUid}
          activeUid={activeUid}
          isPending={!!pendingStickerId}
          onPointerUp={e => handlePagePointerUp(e, 'right')}
          onStickerSelect={onStickerSelect}
          onStickerDeselect={onStickerDeselect}
          onStickerMove={onStickerMove}
          getRect={() => rightRef.current?.getBoundingClientRect() ?? null}
        />
      </div>
    </div>
  );
}

/* ── 1ページ ── */
import React from 'react';

interface PageAreaProps {
  side: 'left' | 'right';
  placed: PlacedStickerData[];
  cardMap: Record<string, Card>;
  newUid: string | null;
  activeUid: string | null;
  isPending: boolean;
  onPointerUp: (e: React.PointerEvent) => void;
  onStickerSelect: (uid: string) => void;
  onStickerDeselect: () => void;
  onStickerMove: (uid: string, cx: number, cy: number) => void;
  getRect: () => DOMRect | null;
}

const PAGE_COLORS = {
  left:  { bg: '#fef9f0', washiColor: 'rgba(255,195,160,0.55)', accent: 'rgba(200,150,100,0.35)' },
  right: { bg: '#f8f4ff', washiColor: 'rgba(185,175,255,0.45)', accent: 'rgba(150,130,210,0.3)' },
};

const DECO_ITEMS = ['✦', '✿', '·', '★', '○', '✦', '·', '✿'];

const PageArea = React.forwardRef<HTMLDivElement, PageAreaProps>(
  ({ side, placed, cardMap, newUid, activeUid, isPending, onPointerUp,
     onStickerSelect, onStickerDeselect, onStickerMove, getRect }, ref) => {

    const col = PAGE_COLORS[side];
    const isLeft = side === 'left';

    return (
      <div
        ref={ref}
        className="flex-1 relative overflow-hidden select-none"
        style={{
          background: col.bg,
          cursor: isPending ? 'crosshair' : 'default',
          // ドット地紋
          backgroundImage: `radial-gradient(circle, rgba(180,155,110,0.18) 1px, transparent 1px)`,
          backgroundSize: '18px 18px',
        }}
        onPointerUp={onPointerUp}
      >
        {/* マスキングテープ風デコ（上部） */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 18,
          background: `repeating-linear-gradient(
            90deg,
            ${col.washiColor} 0px,
            ${col.washiColor} 6px,
            transparent 6px,
            transparent 10px
          )`,
          opacity: 0.8,
        }} />

        {/* ページ内ドット枠線 */}
        <div style={{
          position: 'absolute',
          top: 22, left: 6, right: 6, bottom: 6,
          border: `1.5px dashed ${col.accent}`,
          borderRadius: 4,
          pointerEvents: 'none',
        }} />

        {/* 散らばったデコ文字 */}
        {DECO_ITEMS.map((ch, i) => {
          // 決定論的な位置（ランダムに見えるが固定）
          const x = [12, 78, 5, 88, 25, 65, 42, 92][i];
          const y = [8, 15, 55, 45, 85, 88, 28, 72][i];
          return (
            <span key={i} style={{
              position: 'absolute',
              left: `${x}%`, top: `${y}%`,
              fontSize: [8, 9, 6, 10, 7, 8, 9, 7][i],
              color: col.accent,
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              {ch}
            </span>
          );
        })}

        {/* ページタイトル */}
        <div style={{
          position: 'absolute',
          top: 24,
          left: isLeft ? 10 : undefined,
          right: isLeft ? undefined : 10,
          fontSize: 8,
          fontWeight: 900,
          fontStyle: 'italic',
          letterSpacing: '0.12em',
          color: col.accent,
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          {isLeft ? '名古屋メシ帳' : 'MY COLLECTION'}
        </div>

        {/* 貼り付け済みシール */}
        {placed.map(item => {
          const card = cardMap[item.stickerId];
          if (!card) return null;
          return (
            <PlacedSticker
              key={item.uid}
              uid={item.uid}
              card={card}
              cx={item.cx}
              cy={item.cy}
              rotation={item.rotation}
              zIndex={item.zIndex}
              isNew={item.uid === newUid}
              isSelected={item.uid === activeUid}
              onSelect={onStickerSelect}
              onDeselect={onStickerDeselect}
              onMove={onStickerMove}
              getPageRect={getRect}
            />
          );
        })}

        {/* 貼り付けモード時のオーバーレイ（薄いハイライト） */}
        {isPending && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(90,90,255,0.04)',
            pointerEvents: 'none',
            animation: 'scan-ring-pulse 1.5s ease-in-out infinite',
          }} />
        )}
      </div>
    );
  }
);
PageArea.displayName = 'PageArea';
