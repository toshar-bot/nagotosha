'use client';

import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';

interface Props {
  card: Card;
  size?: number;
  selected?: boolean;
}

export default function BookStickerVisual({ card, size = 88, selected }: Props) {
  const cfg = RARITY_CONFIG[card.rarity];
  const border = Math.max(3, Math.round(size * 0.05));
  const radius = Math.round(size * 0.2);

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: radius,
      border: `${border}px solid white`,
      boxShadow: [
        `0 ${Math.round(size * 0.055)}px 0 rgba(0,0,0,0.13)`,          // 底面の厚み
        `0 ${Math.round(size * 0.09)}px ${Math.round(size * 0.22)}px rgba(0,0,0,0.22)`,  // ドロップシャドウ
        selected ? `0 0 0 3px rgba(90,90,255,0.7), 0 0 0 5px rgba(90,90,255,0.25)` : '',
      ].filter(Boolean).join(', '),
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      background: card.imageUrl ? '#e8e4dc' : cfg.bgFrom,
      transition: 'box-shadow 0.12s',
    }}>
      {/* 食べ物画像 */}
      {card.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.imageUrl}
          alt={card.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: `linear-gradient(135deg, ${cfg.bgFrom}, ${cfg.bgTo})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.round(size * 0.42),
          lineHeight: 1,
        }}>
          {card.emoji}
        </div>
      )}

      {/* ツヤオーバーレイ */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.16) 38%, transparent 60%)',
      }} />
    </div>
  );
}
