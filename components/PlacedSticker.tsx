'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/types/card';
import StickerVisual from './StickerVisual';

interface Props {
  uid: string;
  card: Card;
  x: number;       // % of page width
  y: number;       // % of page height
  rotation: number;
  zIndex: number;
  isNew?: boolean;
  onLongPress?: (uid: string) => void;
}

export default function PlacedSticker({ uid, card, x, y, rotation, zIndex, isNew, onLongPress }: Props) {
  const [animating, setAnimating] = useState(!!isNew);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setAnimating(false), 500);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  function handlePointerDown() {
    pressTimer.current = setTimeout(() => {
      onLongPress?.(uid);
    }, 550);
  }

  function handlePointerUp() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg)`,
        zIndex,
        // CSS変数でアニメーション内のrotateに渡す
        ['--rot' as string]: `${rotation}deg`,
        touchAction: 'manipulation',
        cursor: 'pointer',
      }}
      className={animating ? 'animate-sticker-peta' : ''}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <StickerVisual card={card} size="sm" discovered tilt={false} />
    </div>
  );
}
