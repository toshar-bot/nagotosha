'use client';

import { useState } from 'react';
import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';
import { DEFAULT_PACK, PackConfig } from '@/lib/packs';
import CardVisual from './CardVisual';

type Phase = 'READY' | 'SHAKING' | 'FLASH' | 'REVEAL';

interface Props {
  card: Card;
  pack?: PackConfig;
  onComplete: () => void;
}

export default function PackOpening({ card, pack = DEFAULT_PACK, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('READY');
  const cfg = RARITY_CONFIG[card.rarity];
  const isHighRare = card.rarity === 'SSR' || card.rarity === 'UR';

  function handlePackTap() {
    if (phase !== 'READY') return;
    setPhase('SHAKING');
    setTimeout(() => setPhase('FLASH'), 900);
    setTimeout(() => setPhase('REVEAL'), 1200);
    setTimeout(() => onComplete(), 2400);
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full gap-8 select-none">
      {phase === 'FLASH' && (
        <div
          className="fixed inset-0 z-50 pointer-events-none animate-flash"
          style={{ background: isHighRare ? cfg.color : pack.color, opacity: 0 }}
        />
      )}

      {(phase === 'READY' || phase === 'SHAKING' || phase === 'FLASH') && (
        <div
          className={`
            relative flex flex-col items-center justify-center
            w-48 h-64 rounded-2xl cursor-pointer overflow-hidden
            ${phase === 'SHAKING' ? 'animate-shake' : ''}
            ${phase === 'FLASH' ? 'animate-pack-burst' : ''}
          `}
          style={{
            background: `linear-gradient(145deg, ${pack.bgFrom}, ${pack.bgTo})`,
            border: `3px solid ${pack.borderColor}`,
            boxShadow: phase === 'READY'
              ? `0 0 30px ${pack.color}55, 0 0 60px ${cfg.glowColor}`
              : `0 0 50px ${cfg.glowStrong}, 0 0 100px ${pack.color}55`,
          }}
          onClick={handlePackTap}
        >
          <div
            className="absolute inset-[6px] rounded-xl opacity-35"
            style={{ border: `1px solid ${pack.borderColor}` }}
          />

          <div className="absolute inset-0 pack-foil pointer-events-none" />
          <div
            className={`absolute left-5 right-5 top-1/2 h-[2px] rounded-full transition-all duration-500 ${
              phase === 'READY' ? 'opacity-50 scale-x-75' : 'opacity-100 scale-x-125'
            }`}
            style={{
              background: `linear-gradient(90deg, transparent, ${pack.color}, transparent)`,
              boxShadow: `0 0 18px ${pack.color}`,
            }}
          />

          {phase !== 'READY' && (
            <div className="absolute inset-0 pointer-events-none">
              <span className="spark spark-a" style={{ background: cfg.color }} />
              <span className="spark spark-b" style={{ background: pack.borderColor }} />
              <span className="spark spark-c" style={{ background: '#ffffff' }} />
            </div>
          )}

          <div className="absolute inset-x-5 top-12 bottom-20 rounded-2xl overflow-hidden border border-white/15 bg-black/25 z-10">
            <div className="h-full w-full pack-food-collage" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-white/10" />
          </div>

          <div className="absolute inset-x-3 bottom-6 text-center space-y-1 z-20 px-4">
            <p className="text-[10px] tracking-[0.3em] font-black" style={{ color: pack.color }}>
              NAGOTOSHA
            </p>
            <p className="text-sm text-white font-black mt-2">{pack.name}</p>
            <p className="text-[10px] text-white/55 font-bold">{pack.shortName} Pack</p>
          </div>

          <div
            className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center text-base font-black text-white"
            style={{ background: pack.borderColor }}
          >
            <span className="game-icon" />
          </div>

          {phase === 'READY' && (
            <div
              className="absolute -inset-3 rounded-2xl animate-pulse-border pointer-events-none"
              style={{ border: `1px solid ${pack.borderColor}77` }}
            />
          )}
        </div>
      )}

      {phase === 'READY' && (
        <div className="animate-fade-up text-center space-y-1">
          <p className="text-white font-black text-lg">タップして開封</p>
          <p className="text-gray-500 text-xs">{pack.catchCopy}</p>
        </div>
      )}

      {phase === 'SHAKING' && (
        <div className="text-center">
          <p className="text-white font-black text-lg animate-pulse">開封中...</p>
        </div>
      )}

      {phase === 'REVEAL' && (
        <div className="flex flex-col items-center gap-6 animate-card-rise">
          {isHighRare && (
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{ background: `radial-gradient(ellipse at center, ${cfg.color} 0%, transparent 70%)` }}
            />
          )}
          <CardVisual card={card} size="lg" owned isNew />
          <div className="text-center animate-fade-up">
            <p className="font-black text-2xl" style={{ color: cfg.color }}>
              {cfg.shareEmoji} {card.rarity} {cfg.shareEmoji}
            </p>
            <p className="text-white font-bold text-lg mt-0.5">{card.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
