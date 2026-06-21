'use client';

import { useRef, useState } from 'react';
import { Card } from '@/types/card';
import BookStickerVisual from './BookStickerVisual';

export const PLACED_STICKER_SIZE = 88;

interface Props {
  uid: string;
  card: Card;
  cx: number;
  cy: number;
  rotation: number;
  zIndex: number;
  isNew?: boolean;
  isSelected: boolean;
  onSelect: (uid: string) => void;
  onDeselect: () => void;
  onMove: (uid: string, cx: number, cy: number) => void;
  getPageRect: () => DOMRect | null;
}

export default function PlacedSticker({
  uid, card, cx, cy, rotation, zIndex, isNew,
  isSelected, onSelect, onDeselect, onMove, getPageRect,
}: Props) {
  const [pos, setPos] = useState({ cx, cy });
  const [animating, setAnimating] = useState(!!isNew);
  const dragRef = useRef<{
    px: number; py: number; cx0: number; cy0: number;
    pageW: number; pageH: number; moved: boolean;
  } | null>(null);

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    if (!isSelected) {
      onSelect(uid);
      return;
    }
    // すでに選択済み → ドラッグ開始
    const rect = getPageRect();
    if (!rect) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      px: e.clientX, py: e.clientY,
      cx0: pos.cx, cy0: pos.cy,
      pageW: rect.width, pageH: rect.height,
      moved: false,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.px;
    const dy = e.clientY - dragRef.current.py;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;

    const half = (PLACED_STICKER_SIZE / 2);
    const minCx = (half / dragRef.current.pageW) * 100;
    const maxCx = 100 - minCx;
    const minCy = (half / dragRef.current.pageH) * 100;
    const maxCy = 100 - minCy;

    setPos({
      cx: Math.max(minCx, Math.min(maxCx, dragRef.current.cx0 + (dx / dragRef.current.pageW) * 100)),
      cy: Math.max(minCy, Math.min(maxCy, dragRef.current.cy0 + (dy / dragRef.current.pageH) * 100)),
    });
  }

  function handlePointerUp(e: React.PointerEvent) {
    e.stopPropagation();
    if (!dragRef.current) return;
    if (dragRef.current.moved) {
      onMove(uid, pos.cx, pos.cy);
    } else {
      // 動かしていない → 選択解除
      onDeselect();
    }
    dragRef.current = null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${pos.cx}%`,
        top: `${pos.cy}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: isSelected ? 999 : zIndex,
        ['--rot' as string]: `${rotation}deg`,
        touchAction: 'none',
        cursor: isSelected ? 'grab' : 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      className={animating ? 'animate-sticker-peta' : ''}
      onAnimationEnd={() => setAnimating(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <BookStickerVisual card={card} size={PLACED_STICKER_SIZE} selected={isSelected} />

      {/* 選択中の破線リング */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          inset: -8,
          border: '2px dashed rgba(90,90,255,0.45)',
          borderRadius: Math.round(PLACED_STICKER_SIZE * 0.2) + 6,
          pointerEvents: 'none',
          animation: 'spin-slow 5s linear infinite',
        }} />
      )}
    </div>
  );
}
