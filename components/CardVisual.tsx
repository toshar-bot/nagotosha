'use client';
import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';

interface Props {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  owned?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

const SIZE = {
  sm: { w: 'w-[104px]', h: 'h-[148px]', emoji: 'text-4xl', name: 'text-[10px]', badge: 'text-[8px] px-1.5 py-0.5', pad: 'p-2' },
  md: { w: 'w-[168px]', h: 'h-[236px]', emoji: 'text-6xl', name: 'text-sm',     badge: 'text-[10px] px-2 py-0.5', pad: 'p-3' },
  lg: { w: 'w-[220px]', h: 'h-[308px]', emoji: 'text-7xl', name: 'text-base',   badge: 'text-xs px-2.5 py-1',     pad: 'p-4' },
};

export default function CardVisual({ card, size = 'md', owned = true, isNew = false, onClick }: Props) {
  const cfg = RARITY_CONFIG[card.rarity];
  const s = SIZE[size];
  const isUR = card.rarity === 'UR';
  const isHighRare = card.rarity === 'SSR' || card.rarity === 'UR';

  const glowStyle = owned
    ? {
        boxShadow: isNew
          ? `0 0 24px ${cfg.glowStrong}, 0 0 60px ${cfg.glowColor}, 0 16px 34px rgba(0,0,0,0.35), inset 0 0 24px rgba(255,248,232,0.08)`
          : `0 10px 24px rgba(0,0,0,0.28), 0 0 12px ${cfg.glowColor}`,
      }
    : { boxShadow: 'none' };

  const borderStyle = { border: `2px solid ${owned ? cfg.borderColor : '#4a3428'}` };

  return (
    <div
      className={`
        relative ${s.w} ${s.h} rounded-xl flex flex-col
        ${onClick ? 'cursor-pointer' : ''}
        ${isUR && owned ? 'ur-glow' : ''}
        transition-transform duration-150 active:scale-95
        overflow-hidden select-none card-plate
      `}
      style={{ ...borderStyle, ...glowStyle }}
      onClick={onClick}
    >
      {owned ? (
        <div
          className={`absolute inset-0 ${isUR ? 'ur-bg' : ''}`}
          style={!isUR ? { background: `linear-gradient(145deg, ${cfg.bgFrom}, ${cfg.bgTo})` } : undefined}
        />
      ) : (
        <div className="absolute inset-0 bg-[#211915]" />
      )}

      {isHighRare && owned && (
        <div className="absolute inset-0 card-shimmer opacity-60 pointer-events-none" />
      )}

      {isNew && owned && (
        <div className="absolute top-2 right-2 z-10 bg-accent text-white text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wider">
          NEW
        </div>
      )}

      {owned && (
        <div className={`relative z-10 flex justify-center mt-3 ${s.pad}`}>
          <span
            className={`${s.badge} rounded-full font-black tracking-widest uppercase`}
            style={{
              background: `linear-gradient(90deg, ${cfg.borderColor}33, ${cfg.borderColor}55)`,
              color: cfg.color,
              border: `1px solid ${cfg.borderColor}66`,
            }}
          >
            ✦ {cfg.label} ✦
          </span>
        </div>
      )}

      <div className={`relative z-10 flex-1 flex items-center justify-center ${s.emoji}`}>
        {owned ? card.emoji : (
          <span className="text-4xl opacity-20">？</span>
        )}
      </div>

      <div
        className={`relative z-10 ${s.pad} pb-3`}
        style={{ background: 'linear-gradient(to top, rgba(36,24,18,0.92), rgba(36,24,18,0.08))' }}
      >
        {owned ? (
          <>
            <p className={`${s.name} font-black text-white leading-tight truncate`}>
              {card.name}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: cfg.color }}>
              {card.area}
            </p>
          </>
        ) : (
          <p className={`${s.name} font-black text-gray-600 tracking-widest`}>
            ？？？？？
          </p>
        )}
      </div>
    </div>
  );
}
