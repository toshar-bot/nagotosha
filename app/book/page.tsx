'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CARDS } from '@/data/cards';
import { loadCollection } from '@/lib/storage';
import { loadPlaced, addPlaced, movePlaced, removePlaced, PlacedStickerData } from '@/lib/stickerBook';
import { Card } from '@/types/card';
import StickerBook, { randomRotation } from '@/components/StickerBook';
import StickerTray from '@/components/StickerTray';

export default function BookPage() {
  const [ownedCards, setOwnedCards]       = useState<Card[]>([]);
  const [placed, setPlaced]               = useState<PlacedStickerData[]>([]);
  const [pendingId, setPendingId]         = useState<string | null>(null); // トレイ選択中
  const [activeUid, setActiveUid]         = useState<string | null>(null); // ページ上選択中
  const [newUid, setNewUid]               = useState<string | null>(null);
  const [toast, setToast]                 = useState<string | null>(null);

  useEffect(() => {
    const col = loadCollection();
    setOwnedCards(CARDS.filter(c => col.ownedCardIds.includes(c.id)));
    setPlaced(loadPlaced());
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  // トレイでシール選択
  const handleTraySelect = useCallback((id: string) => {
    setActiveUid(null);  // ページ上の選択解除
    setPendingId(prev => prev === id ? null : id); // 同じ → 解除
  }, []);

  // ページタップで貼り付け
  const handlePageTap = useCallback((
    pageId: 'left' | 'right',
    cx: number,
    cy: number,
  ) => {
    if (!pendingId) return;
    const rotation = randomRotation();
    const updated = addPlaced(pendingId, pageId, cx, cy, rotation);
    const uid = updated[updated.length - 1].uid;
    setPlaced(updated);
    setNewUid(uid);
    setTimeout(() => setNewUid(null), 600);
    setPendingId(null);  // 貼ったら選択解除
  }, [pendingId]);

  // ページ上のシール選択
  const handleStickerSelect = useCallback((uid: string) => {
    setPendingId(null);  // トレイ選択は解除
    setActiveUid(uid);
  }, []);

  // 選択解除
  const handleStickerDeselect = useCallback(() => {
    setActiveUid(null);
  }, []);

  // ドラッグ後の位置保存
  const handleStickerMove = useCallback((uid: string, cx: number, cy: number) => {
    setPlaced(movePlaced(uid, cx, cy));
    setActiveUid(null);
  }, []);

  // 長押しで削除（PlacedStickerからは呼ばれないが、将来用に残す）
  const handleRemove = useCallback((uid: string) => {
    setPlaced(removePlaced(uid));
    setActiveUid(null);
    showToast('はがしたぞ');
  }, []);

  // 選択中シールをゴミ箱ボタンで削除
  function handleDeleteActive() {
    if (!activeUid) return;
    handleRemove(activeUid);
  }

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
        {/* アクティブシール削除ボタン or 枚数 */}
        {activeUid ? (
          <button
            onClick={handleDeleteActive}
            className="active:scale-90 transition-transform"
            style={{
              fontSize: 11, fontWeight: 900, color: 'rgba(200,60,60,0.75)',
              background: 'rgba(200,60,60,0.1)',
              border: '1px solid rgba(200,60,60,0.25)',
              borderRadius: 10, padding: '3px 8px',
            }}
          >
            はがす
          </button>
        ) : (
          <span style={{ fontSize: 11, color: 'rgba(120,85,35,0.45)', fontWeight: 700 }}>
            {placed.length}枚
          </span>
        )}
      </header>

      {/* トースト */}
      {toast && (
        <div
          className="animate-fade-up"
          style={{
            position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(60,40,10,0.72)', color: 'white',
            fontSize: 12, fontWeight: 900, padding: '5px 14px',
            borderRadius: 20, zIndex: 100, pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
          }}
        >
          {toast}
        </div>
      )}

      {/* シール帳本体 */}
      <StickerBook
        cards={CARDS}
        placed={placed}
        newUid={newUid}
        pendingStickerId={pendingId}
        activeUid={activeUid}
        onPageTap={handlePageTap}
        onStickerSelect={handleStickerSelect}
        onStickerDeselect={handleStickerDeselect}
        onStickerMove={handleStickerMove}
      />

      {/* シールトレイ */}
      <StickerTray
        cards={ownedCards}
        selectedId={pendingId}
        onSelect={handleTraySelect}
      />
    </div>
  );
}
