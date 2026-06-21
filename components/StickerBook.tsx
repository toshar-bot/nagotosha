'use client';

import { Card } from '@/types/card';
import { PlacedStickerData } from '@/lib/stickerBook';
import PlacedSticker from './PlacedSticker';

interface Props {
  cards: Card[];                           // 全カードデータ（ID引き当て用）
  placed: PlacedStickerData[];             // 配置済みシール
  newUid: string | null;                   // 直前に貼ったシールUID（アニメ制御）
  onRemove: (uid: string) => void;
}

export default function StickerBook({ cards, placed, newUid, onRemove }: Props) {
  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        // 見開きの外枠
        background: '#c8b89a',
        padding: '6px 4px 4px',
        boxShadow: 'inset 0 2px 8px rgba(80,50,10,0.22)',
      }}
    >
      {/* SVGペーパーグレインフィルター定義 */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended" />
            <feComponentTransfer in="blended">
              <feFuncR type="linear" slope="1.02" intercept="-0.01" />
              <feFuncG type="linear" slope="1.01" />
              <feFuncB type="linear" slope="0.98" intercept="0.01" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* 見開きページ本体 */}
      <div
        className="relative w-full h-full flex rounded-sm overflow-hidden"
        style={{ filter: 'url(#paper-grain)' }}
      >
        {/* 左ページ */}
        <Page side="left" placed={placed} cardMap={cardMap} newUid={newUid} onRemove={onRemove} />

        {/* 綴じ部（spine） */}
        <div
          className="flex-shrink-0 relative"
          style={{
            width: 12,
            background: 'linear-gradient(to right, #b8a078, #d4c0a0, #b8a078)',
            boxShadow: 'inset -2px 0 6px rgba(0,0,0,0.10), inset 2px 0 6px rgba(0,0,0,0.10)',
          }}
        >
          {/* スパイン上の穴（リング綴じ風） */}
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: '50%', transform: 'translateX(-50%)',
              top: `${12 + i * 20}%`,
              width: 8, height: 8, borderRadius: '50%',
              background: '#9a8060',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35)',
            }} />
          ))}
        </div>

        {/* 右ページ */}
        <Page side="right" placed={placed} cardMap={cardMap} newUid={newUid} onRemove={onRemove} />
      </div>
    </div>
  );
}

/* ── 1ページ分 ── */
function Page({
  side, placed, cardMap, newUid, onRemove,
}: {
  side: 'left' | 'right';
  placed: PlacedStickerData[];
  cardMap: Record<string, Card>;
  newUid: string | null;
  onRemove: (uid: string) => void;
}) {
  // 今は1ページのみ（左右両方に全シールを表示）
  // x座標で左右ページに振り分け
  const isLeft = side === 'left';

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        background: '#faf5e8',
        // 罫線（薄い横線）
        backgroundImage: [
          'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(180,155,100,0.15) 31px, rgba(180,155,100,0.15) 32px)',
        ].join(','),
        boxShadow: isLeft
          ? 'inset -3px 0 8px rgba(0,0,0,0.07)'
          : 'inset 3px 0 8px rgba(0,0,0,0.07)',
      }}
    >
      {/* ページ角の飾り（四隅に小さな丸） */}
      {(['tl','tr','bl','br'] as const).map(pos => (
        <div key={pos} style={{
          position: 'absolute',
          top:    pos.startsWith('t') ? 6 : undefined,
          bottom: pos.startsWith('b') ? 6 : undefined,
          left:   pos.endsWith('l') ? 6 : undefined,
          right:  pos.endsWith('r') ? 6 : undefined,
          width: 5, height: 5, borderRadius: '50%',
          background: 'rgba(180,155,100,0.25)',
        }} />
      ))}

      {/* ページラベル（左上隅） */}
      <p style={{
        position: 'absolute',
        top: 8,
        left: isLeft ? 10 : undefined,
        right: isLeft ? undefined : 10,
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: '0.18em',
        color: 'rgba(150,120,70,0.4)',
        userSelect: 'none',
      }}>
        {isLeft ? 'NAGOTOSHA' : 'MESHI BOOK'}
      </p>

      {/* 貼り付けられたシール */}
      {placed.map(item => {
        const card = cardMap[item.stickerId];
        if (!card) return null;
        // x が 50未満 → 左ページ、50以上 → 右ページ
        if ((item.x < 50) !== isLeft) return null;
        // ページ内での相対座標に変換
        const pageX = isLeft ? item.x * 2 : (item.x - 50) * 2;
        return (
          <PlacedSticker
            key={item.uid}
            uid={item.uid}
            card={card}
            x={pageX}
            y={item.y}
            rotation={item.rotation}
            zIndex={item.zIndex}
            isNew={item.uid === newUid}
            onLongPress={onRemove}
          />
        );
      })}
    </div>
  );
}
