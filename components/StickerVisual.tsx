'use client';

import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';
import { getStickerTilt } from '@/lib/sticker';

type StickerSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZES: Record<StickerSize, { w: number; nameSize: number; shopSize: number }> = {
  xs: { w: 68,  nameSize: 8,  shopSize: 7  },
  sm: { w: 100, nameSize: 10, shopSize: 8  },
  md: { w: 156, nameSize: 13, shopSize: 10 },
  lg: { w: 236, nameSize: 17, shopSize: 12 },
};

interface Props {
  card: Card;
  size?: StickerSize;
  discovered?: boolean;
  isNew?: boolean;
  tilt?: boolean;
  onClick?: () => void;
}

export default function StickerVisual({
  card,
  size = 'md',
  discovered = true,
  isNew = false,
  tilt = false,
  onClick,
}: Props) {
  const cfg  = RARITY_CONFIG[card.rarity];
  const s    = SIZES[size];
  const h    = Math.round(s.w * 1.38);
  const rot  = tilt ? getStickerTilt(card.id) : 0;
  const isHighRare = ['SSR', 'UR'].includes(card.rarity);
  const isUR = card.rarity === 'UR';

  if (!discovered) {
    return (
      <div
        onClick={onClick}
        style={{
          width: s.w, height: h,
          borderRadius: 12,
          background: 'linear-gradient(145deg, #0c080f, #18101c)',
          border: '2px solid rgba(80,55,40,0.35)',
          boxShadow: '0 5px 0 rgba(0,0,0,0.22), 0 10px 18px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4, userSelect: 'none', cursor: onClick ? 'pointer' : 'default',
          transform: `rotate(${rot}deg)`,
        }}
      >
        <span style={{ fontSize: s.w * 0.28, opacity: 0.15, color: 'white', fontWeight: 900 }}>?</span>
        <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.15)', fontWeight: 900, letterSpacing: '0.12em' }}>未発見</p>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={isUR ? 'ur-glow' : ''}
      style={{
        width: s.w, height: h,
        borderRadius: 12,
        border: `3px solid ${cfg.borderColor}`,
        boxShadow: [
          `0 5px 0 ${cfg.borderColor}55`,
          '0 10px 26px rgba(0,0,0,0.42)',
          `0 0 18px ${cfg.glowColor}`,
          isHighRare ? `0 0 50px ${cfg.glowStrong}` : '',
        ].filter(Boolean).join(', '),
        background: `linear-gradient(150deg, ${cfg.bgFrom}, ${cfg.bgTo})`,
        position: 'relative', overflow: 'hidden',
        userSelect: 'none', cursor: onClick ? 'pointer' : 'default',
        transform: `rotate(${rot}deg)`,
      }}
    >
      {/* 画像エリア */}
      <div style={{
        position: 'absolute', top: 8, left: 8, right: 8,
        bottom: Math.round(h * 0.28),
        borderRadius: 8, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(0,0,0,0.22)',
      }}>
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.06)' }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="game-icon" style={{ opacity: 0.4 }} />
          </div>
        )}
        {/* 画像グラデーション */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.48))',
        }} />
      </div>

      {/* レアリティバッジ */}
      <div style={{
        position: 'absolute', top: 5, left: 5,
        padding: '2px 6px', borderRadius: 99,
        fontSize: 7, fontWeight: 900, letterSpacing: '0.14em',
        background: `${cfg.borderColor}2a`,
        border: `1px solid ${cfg.borderColor}66`,
        color: cfg.color,
        boxShadow: `0 0 8px ${cfg.glowColor}`,
      }}>
        {card.rarity}
      </div>

      {/* NEW バッジ */}
      {isNew && (
        <div style={{
          position: 'absolute', top: 5, right: 5,
          padding: '2px 5px', borderRadius: 99,
          fontSize: 7, fontWeight: 900,
          background: '#ef4444', color: 'white',
          boxShadow: '0 0 8px rgba(239,68,68,0.6)',
        }}>
          NEW
        </div>
      )}

      {/* テキストエリア */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: `16px 7px 7px`,
        background: 'linear-gradient(to top, rgba(16,10,18,0.97), rgba(16,10,18,0.72), transparent)',
      }}>
        <p style={{
          fontSize: s.shopSize, color: cfg.color, fontWeight: 700,
          lineHeight: 1, marginBottom: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {card.shopName}
        </p>
        <p style={{
          fontSize: s.nameSize, color: 'white', fontWeight: 900,
          lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {card.name}
        </p>
      </div>

      {/* 光沢（ぷっくり感の核） */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 9, pointerEvents: 'none',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.14) 32%, transparent 58%)',
      }} />

      {/* SSR/UR シマー */}
      {isHighRare && (
        <div className="card-shimmer" style={{
          position: 'absolute', inset: 0, borderRadius: 9,
          pointerEvents: 'none', opacity: 0.6,
        }} />
      )}
    </div>
  );
}
