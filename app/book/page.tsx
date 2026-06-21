'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CARDS } from '@/data/cards';
import { loadCollection } from '@/lib/storage';
import { loadPlaced, addPlaced, removePlaced, PlacedStickerData } from '@/lib/stickerBook';
import { Card } from '@/types/card';
import StickerBook from '@/components/StickerBook';
import StickerTray from '@/components/StickerTray';

export default function BookPage() {
  const [ownedCards, setOwnedCards] = useState<Card[]>([]);
  const [placed, setPlaced]         = useState<PlacedStickerData[]>([]);
  const [newUid, setNewUid]         = useState<string | null>(null);
  const [showRemoveHint, setShowRemoveHint] = useState(false);

  useEffect(() => {
    const col = loadCollection();
    const owned = CARDS.filter(c => col.ownedCardIds.includes(c.id));
    setOwnedCards(owned);
    setPlaced(loadPlaced());
  }, []);

  const handleSelect = useCallback((stickerId: string) => {
    // ランダム配置
    // x: 0-100 (左ページ=0-50, 右ページ=50-100)
    // 左右交互になるよう現在の枚数で決める
    const currentCount = loadPlaced().length;
    const isLeft = currentCount % 2 === 0;
    const x = isLeft
      ? 5 + Math.random() * 35        // 左ページ: 5-40%
      : 55 + Math.random() * 35;      // 右ページ: 55-90%
    const y = 8 + Math.random() * 68; // 8-76%
    const rotation = (Math.random() - 0.5) * 28; // ±14°

    const updated = addPlaced(stickerId, x, y, rotation);
    const latestUid = updated[updated.length - 1].uid;
    setPlaced(updated);
    setNewUid(latestUid);
    setTimeout(() => setNewUid(null), 600);
  }, []);

  const handleRemove = useCallback((uid: string) => {
    setPlaced(removePlaced(uid));
    setShowRemoveHint(true);
    setTimeout(() => setShowRemoveHint(false), 1800);
  }, []);

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        // BottomNavの高さ分 + safe-area-bottom を確保
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
      }}
    >
      {/* ヘッダー */}
      <header
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{
          height: 44,
          background: '#c8b89a',
          borderBottom: '1px solid rgba(140,105,55,0.3)',
        }}
      >
        <Link href="/" className="text-amber-900/50 text-sm font-bold active:opacity-60 transition-opacity">
          ← HOME
        </Link>
        <p className="font-black text-amber-900/70 text-sm tracking-[0.12em]">
          名古屋メシ帳
        </p>
        <div className="text-amber-900/40 text-xs font-bold">
          {placed.length}枚
        </div>
      </header>

      {/* 削除ヒント */}
      {showRemoveHint && (
        <div
          className="absolute left-1/2 z-50 px-4 py-2 rounded-full text-xs font-black text-white animate-fade-up"
          style={{
            top: 54,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        >
          はがしたぞ
        </div>
      )}

      {/* シール帳本体 */}
      <StickerBook
        cards={CARDS}
        placed={placed}
        newUid={newUid}
        onRemove={handleRemove}
      />

      {/* シールトレイ */}
      <StickerTray cards={ownedCards} onSelect={handleSelect} />
    </div>
  );
}
