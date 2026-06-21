'use client';

import { useRef, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { Card } from '@/types/card';
import BookStickerVisual from './BookStickerVisual';

export const PLACED_SIZE = 88;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface Props {
  uid: string;
  card: Card;
  cx: number;
  cy: number;
  rotation: number;
  scale: number;
  zIndex: number;
  isNew?: boolean;
  onMove: (uid: string, cx: number, cy: number, rotation: number, scale: number) => void;
  onRemove: (uid: string) => void;
  getPageRect: () => DOMRect | null;
}

export default function PlacedSticker({
  uid, card, cx, cy, rotation, scale, zIndex,
  isNew, onMove, onRemove, getPageRect,
}: Props) {
  const [pos, setPos]         = useState({ cx, cy });
  const [rot, setRot]         = useState(rotation);
  const [sc, setSc]           = useState(scale);
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState(!!isNew);

  // refs for stale closure prevention
  const posRef = useRef({ cx, cy });
  const rotRef = useRef(rotation);
  const scRef  = useRef(scale);

  // Long-press timer for delete
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Page rect memo (captured at drag start)
  const pageRectRef = useRef<{ w: number; h: number }>({ w: 200, h: 300 });

  const bind = useGesture(
    {
      onDragStart: () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
        const r = getPageRect();
        pageRectRef.current = { w: r?.width ?? 200, h: r?.height ?? 300 };
        setDragging(true);
      },
      onDrag: ({ movement: [mx, my], memo }) => {
        const start = memo ?? { cx: posRef.current.cx, cy: posRef.current.cy };
        const { w, h } = pageRectRef.current;
        const half = PLACED_SIZE / 2;
        const minCx = (half / w) * 100;
        const maxCx = 100 - minCx;
        const minCy = (half / h) * 100;
        const maxCy = 100 - minCy;
        const newCx = clamp(start.cx + (mx / w) * 100, minCx, maxCx);
        const newCy = clamp(start.cy + (my / h) * 100, minCy, maxCy);
        posRef.current = { cx: newCx, cy: newCy };
        setPos({ cx: newCx, cy: newCy });
        return start;
      },
      onDragEnd: () => {
        setDragging(false);
        onMove(uid, posRef.current.cx, posRef.current.cy, rotRef.current, scRef.current);
      },
      onPinchStart: () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
      },
      onPinch: ({ offset: [s, r], memo }) => {
        const base = memo ?? { scale: scRef.current, rot: rotRef.current };
        const newSc = clamp(base.scale * s, 0.35, 2.8);
        const newRot = base.rot + r;
        scRef.current = newSc;
        rotRef.current = newRot;
        setSc(newSc);
        setRot(newRot);
        return base;
      },
      onPinchEnd: () => {
        onMove(uid, posRef.current.cx, posRef.current.cy, rotRef.current, scRef.current);
      },
      onPointerDown: () => {
        pressTimer.current = setTimeout(() => onRemove(uid), 750);
      },
      onPointerUp: () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
      },
    },
    {
      drag: { pointer: { touch: true }, filterTaps: false },
      pinch: { pointer: { touch: true } },
    },
  );

  return (
    <div
      {...bind()}
      style={{
        position: 'absolute',
        left: `${pos.cx}%`,
        top:  `${pos.cy}%`,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`,
        zIndex: dragging ? 999 : zIndex,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
        filter: dragging
          ? 'drop-shadow(0 18px 30px rgba(0,0,0,0.44))'
          : 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))',
        ['--rot' as string]: `${rot}deg`,
      }}
      className={animating ? 'animate-sticker-peta' : ''}
      onAnimationEnd={() => setAnimating(false)}
    >
      <BookStickerVisual card={card} size={PLACED_SIZE} />
    </div>
  );
}
