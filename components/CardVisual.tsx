'use client';

import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';

interface Props {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  owned?: boolean;
  isNew?: boolean;
  rarityRevealed?: boolean;
  onClick?: () => void;
}

const SIZE = {
  sm: { w: 'w-[104px]', h: 'h-[156px]', badge: 'text-[7px] px-1.5 py-0.5', name: 'text-[10px]', shop: 'text-[8px]' },
  md: { w: 'w-[176px]', h: 'h-[252px]', badge: 'text-[9px] px-2.5 py-1', name: 'text-sm', shop: 'text-[10px]' },
  lg: { w: 'w-[232px]', h: 'h-[332px]', badge: 'text-xs px-3 py-1', name: 'text-lg', shop: 'text-xs' },
};

export default function CardVisual({ card, size = 'md', owned = true, isNew = false, rarityRevealed = true, onClick }: Props) {
  const cfg = RARITY_CONFIG[card.rarity];
  const s = SIZE[size];
  const isUR = card.rarity === 'UR';
  const isHighRare = card.rarity === 'SSR' || card.rarity === 'UR';

  const glowStyle = owned
    ? {
        boxShadow: isNew
          ? `0 0 24px ${cfg.glowStrong}, 0 0 70px ${cfg.glowColor}, 0 18px 38px rgba(0,0,0,0.42), inset 0 0 26px rgba(255,248,232,0.08)`
          : `0 12px 28px rgba(0,0,0,0.32), 0 0 16px ${cfg.glowColor}`,
      }
    : { boxShadow: '0 10px 20px rgba(0,0,0,0.25)' };

  return (
    <div
      className={`relative ${s.w} ${s.h} rounded-xl flex flex-col ${onClick ? 'cursor-pointer' : ''} ${isUR && owned ? 'ur-glow' : ''} transition-transform duration-150 active:scale-95 overflow-hidden select-none card-plate`}
      style={{
        border: `2px solid ${owned ? cfg.borderColor : '#4a3428'}`,
        ...glowStyle,
      }}
      onClick={onClick}
    >
      <div
        className={`absolute inset-0 ${isUR && owned ? 'ur-bg' : ''}`}
        style={!isUR && owned ? { background: `linear-gradient(145deg, ${cfg.bgFrom}, ${cfg.bgTo})` } : undefined}
      />
      {!owned && <div className="absolute inset-0 bg-[#211915]" />}

      {owned && card.imageUrl ? (
        <div className="absolute inset-x-2 top-10 bottom-14 rounded-lg overflow-hidden border border-white/10 bg-black/30">
          <img
            src={card.imageUrl}
            alt={`${card.shopName}の${card.name}`}
            className="h-full w-full object-cover scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/10" />
        </div>
      ) : (
        <div className="absolute inset-x-2 top-10 bottom-14 rounded-lg flex items-center justify-center bg-black/25 border border-white/10">
          <span className="game-icon opacity-60" />
        </div>
      )}

      {owned && isHighRare && rarityRevealed && <div className="absolute inset-0 card-shimmer opacity-70 pointer-events-none" />}

      {isNew && owned && (
        <div className="absolute top-2 right-2 z-20 bg-accent text-white text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wider">
          NEW
        </div>
      )}

      {owned && rarityRevealed && (
        <div className="relative z-20 flex justify-center mt-3">
          <span
            className={`${s.badge} rounded-full font-black tracking-widest uppercase backdrop-blur-sm`}
            style={{
              background: `linear-gradient(90deg, ${cfg.borderColor}44, ${cfg.borderColor}77)`,
              color: cfg.color,
              border: `1px solid ${cfg.borderColor}88`,
              boxShadow: `0 0 14px ${cfg.glowColor}`,
            }}
          >
            {cfg.label}
          </span>
        </div>
      )}

      <div
        className="relative z-20 mt-auto p-2.5 pt-8"
        style={{ background: 'linear-gradient(to top, rgba(31,20,16,0.96), rgba(31,20,16,0.72), transparent)' }}
      >
        {owned ? (
          <>
            <p className={`${s.shop} font-bold leading-tight truncate`} style={{ color: cfg.color }}>
              {card.shopName}
            </p>
            <p className={`${s.name} font-black text-white leading-tight truncate`}>
              {card.name}
            </p>
            <p className="text-[9px] mt-0.5 text-white/55 truncate">{card.area}</p>
          </>
        ) : (
          <>
            <p className={`${s.shop} font-bold text-white/30`}>未発見</p>
            <p className={`${s.name} font-black text-gray-600 tracking-widest`}>?????</p>
          </>
        )}
      </div>
    </div>
  );
}
