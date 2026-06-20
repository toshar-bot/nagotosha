'use client';

import { useRef, useState } from 'react';
import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';
import { DEFAULT_PACK, PackConfig } from '@/lib/packs';
import CardVisual from './CardVisual';

type Phase = 'READY' | 'CUTTING' | 'OPENING' | 'REVEAL';

interface Props {
  card: Card;
  pack?: PackConfig;
  onComplete: () => void;
}

export default function PackOpening({ card, pack = DEFAULT_PACK, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('READY');
  const [cutPct, setCutPct] = useState(0);
  const startX = useRef<number | null>(null);
  const cfg = RARITY_CONFIG[card.rarity];

  function openPack() {
    if (phase !== 'READY' && phase !== 'CUTTING') return;
    setCutPct(100);
    setPhase('OPENING');
    setTimeout(() => setPhase('REVEAL'), 900);
    setTimeout(() => onComplete(), 1850);
  }

  function handlePointerDown(clientX: number) {
    if (phase !== 'READY') return;
    startX.current = clientX;
    setPhase('CUTTING');
    setCutPct(8);
  }

  function handlePointerMove(clientX: number) {
    if (phase !== 'CUTTING' || startX.current === null) return;
    const dx = Math.max(0, clientX - startX.current);
    const pct = Math.min(100, Math.round((dx / 190) * 100));
    setCutPct(pct);
    if (pct >= 92) openPack();
  }

  function handlePointerEnd() {
    if (phase !== 'CUTTING') return;
    if (cutPct > 55) openPack();
    else {
      setPhase('READY');
      setCutPct(0);
    }
    startX.current = null;
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full gap-8 select-none">
      {(phase === 'READY' || phase === 'CUTTING' || phase === 'OPENING') && (
        <div className="relative h-[340px] w-[232px]">
          <div
            className={`booster-pack premium-pack absolute inset-0 border-2 ${phase === 'OPENING' ? 'pack-opened' : ''}`}
            style={{
              background: `linear-gradient(145deg, ${pack.bgFrom}, ${pack.bgTo})`,
              borderColor: pack.borderColor,
              boxShadow: `0 0 42px ${pack.color}66, 0 28px 58px rgba(92,62,27,0.28)`,
              ['--pack-image' as string]: `url(${pack.imageUrl})`,
            }}
            onClick={openPack}
            onMouseDown={event => handlePointerDown(event.clientX)}
            onMouseMove={event => handlePointerMove(event.clientX)}
            onMouseUp={handlePointerEnd}
            onMouseLeave={handlePointerEnd}
            onTouchStart={event => handlePointerDown(event.touches[0].clientX)}
            onTouchMove={event => handlePointerMove(event.touches[0].clientX)}
            onTouchEnd={handlePointerEnd}
          >
            <div className="absolute inset-0 pack-metal" />
            <div className="absolute inset-x-5 top-8 rounded-full border border-white/40 bg-white/22 px-3 py-1 text-center text-[10px] font-black tracking-[0.22em] text-white/90">
              NAGOTOSHA
            </div>
            <div className="absolute inset-x-4 top-20 bottom-24 overflow-hidden rounded-2xl border border-white/25 bg-black/20">
              <div className="h-full w-full pack-food-collage" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-white/20" />
            </div>
            <div className="absolute inset-x-5 bottom-8 text-center">
              <p className="text-[10px] font-black tracking-[0.22em] text-white/70">{pack.shortName.toUpperCase()} BOOSTER</p>
              <p className="mt-1 text-xl font-black leading-tight text-white drop-shadow">{pack.name}</p>
              <p className="mt-2 text-[10px] font-bold leading-snug text-white/78">{pack.catchCopy}</p>
            </div>

            <div className="pack-cut-guide">
              <span style={{ width: `${Math.max(0, cutPct)}%`, background: pack.color }} />
            </div>
            <div className="pack-top-piece" />
          </div>

          <div className={`absolute left-1/2 top-16 -translate-x-1/2 transition-all duration-700 ${phase === 'OPENING' ? 'translate-y-[-78px] opacity-100' : 'translate-y-8 opacity-0'}`}>
            <CardVisual card={card} size="md" owned />
          </div>
        </div>
      )}

      {phase === 'READY' && (
        <div className="animate-fade-up text-center space-y-1">
          <p className="text-[#2b2118] font-black text-lg">上のラインを横になぞって開封</p>
          <p className="text-[#8a7864] text-xs">タップでも開けます</p>
        </div>
      )}

      {phase === 'CUTTING' && (
        <div className="text-center">
          <p className="text-[#2b2118] font-black text-lg">そのまま右へスライド</p>
        </div>
      )}

      {phase === 'OPENING' && (
        <div className="text-center">
          <p className="text-[#2b2118] font-black text-lg animate-pulse">カード排出中...</p>
        </div>
      )}

      {phase === 'REVEAL' && (
        <div className="flex flex-col items-center gap-6 animate-card-rise">
          <CardVisual card={card} size="lg" owned />
          <div className="text-center animate-fade-up">
            <p className="font-black text-lg" style={{ color: cfg.color }}>
              {card.rarity}
            </p>
            <p className="text-[#2b2118] font-bold text-lg mt-0.5">{card.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
