'use client';

import { useRef, useState } from 'react';
import { Card } from '@/types/card';
import { DEFAULT_PACK, PackConfig } from '@/lib/packs';
import CardVisual from './CardVisual';

type Phase = 'READY' | 'CUTTING' | 'OPENING' | 'BURST';

interface Props {
  cards: Card[];
  pack?: PackConfig;
  onComplete: () => void;
}

const TEAR_Y = 19;
const PACK_W = 272;

// 5枚のファン配置 (中央からのオフセット)
const BURST = [
  { bx: -130, by: 55, br: -19, delay: 0.04 },
  { bx: -65,  by: 18, br: -9,  delay: 0.09 },
  { bx: 0,    by: 0,  br: 0,   delay: 0.14 },
  { bx: 65,   by: 18, br: 9,   delay: 0.19 },
  { bx: 130,  by: 55, br: 19,  delay: 0.24 },
];

function glowClass(rarity: string) {
  switch (rarity) {
    case 'R':   return 'glow-r';
    case 'SR':  return 'glow-sr';
    case 'SSR': return 'glow-ssr';
    case 'UR':  return 'glow-ur';
    default:    return '';
  }
}

export default function PackOpening({ cards, pack = DEFAULT_PACK, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('READY');
  const [cutPct, setCutPct] = useState(0);
  const startX = useRef<number | null>(null);

  function openPack() {
    if (phase !== 'READY' && phase !== 'CUTTING') return;
    setCutPct(100);
    setPhase('OPENING');
    setTimeout(() => setPhase('BURST'), 560);
    setTimeout(() => onComplete(), 2800);
  }

  function handlePointerDown(clientX: number) {
    if (phase !== 'READY') return;
    startX.current = clientX;
    setPhase('CUTTING');
    setCutPct(6);
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
    if (cutPct <= 12 || cutPct > 55) openPack();
    else { setPhase('READY'); setCutPct(0); }
    startX.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 36%, #2d1808 0%, #050200 100%)' }}
    >
      {/* READY / CUTTING: 没入パック表示 */}
      {(phase === 'READY' || phase === 'CUTTING') && (
        <div
          className={`relative cursor-pointer${phase === 'READY' ? ' pack-float' : ''}`}
          style={{ width: PACK_W }}
          onClick={openPack}
          onMouseDown={e => handlePointerDown(e.clientX)}
          onMouseMove={e => handlePointerMove(e.clientX)}
          onMouseUp={handlePointerEnd}
          onMouseLeave={handlePointerEnd}
          onTouchStart={e => { e.preventDefault(); handlePointerDown(e.touches[0].clientX); }}
          onTouchMove={e => { e.preventDefault(); handlePointerMove(e.touches[0].clientX); }}
          onTouchEnd={handlePointerEnd}
        >
          <img
            src={pack.imageUrl}
            alt={pack.name}
            className="w-full h-auto object-contain"
            draggable={false}
            style={{ filter: `drop-shadow(0 0 40px ${pack.color}bb) drop-shadow(0 28px 56px rgba(0,0,0,0.75))` }}
          />
          <div className="absolute left-3 right-3 z-10" style={{ top: `calc(${TEAR_Y}% - 14px)` }}>
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-white text-sm" style={{ textShadow: `0 0 8px ${pack.color}` }}>✂</span>
              <div className="flex gap-0.5">
                {[0, 1, 2, 3].map(i => (
                  <span key={i} className="text-white/80 text-[11px] font-black"
                    style={{ animation: 'arrow-pulse 1.1s ease-in-out infinite', animationDelay: `${i * 0.18}s`, textShadow: `0 0 6px ${pack.color}` }}>
                    ▶
                  </span>
                ))}
              </div>
            </div>
            <div className="pack-cut-guide" style={{ position: 'relative', left: 0, right: 0, top: 0 }}>
              <span style={{ width: `${cutPct}%`, background: pack.color }} />
            </div>
          </div>
        </div>
      )}

      {phase === 'READY' && (
        <p className="text-white/25 text-xs mt-8 tracking-widest">横になぞる ／ タップ</p>
      )}

      {/* OPENING: パックが裂ける */}
      {phase === 'OPENING' && (
        <div className="relative" style={{ width: PACK_W }}>
          <div style={{ clipPath: `polygon(0 ${TEAR_Y}%, 100% ${TEAR_Y}%, 100% 100%, 0 100%)` }}>
            <img src={pack.imageUrl} alt="" className="w-full h-auto" draggable={false}
              style={{ filter: `drop-shadow(0 0 28px ${pack.color}88)` }} />
          </div>
          <div className="absolute top-0 left-0 right-0 pack-top-fly"
            style={{ clipPath: `polygon(0 0, 100% 0, 100% ${TEAR_Y}%, 0 ${TEAR_Y}%)` }}>
            <img src={pack.imageUrl} alt="" className="w-full h-auto" draggable={false} />
          </div>
        </div>
      )}

      {/* BURST: 5枚同時に飛び出す */}
      {phase === 'BURST' && (
        <div className="relative" style={{ width: '100vw', height: '420px' }}>
          {cards.map((card, i) => {
            const pos = BURST[i] ?? BURST[2];
            return (
              <div
                key={card.id}
                className={`absolute card-burst-enter ${glowClass(card.rarity)}`}
                style={{
                  ['--bx' as string]: `${pos.bx}px`,
                  ['--by' as string]: `${pos.by}px`,
                  ['--br' as string]: `${pos.br}deg`,
                  animationDelay: `${pos.delay}s`,
                  left: '50%',
                  top: '50%',
                  zIndex: i + 1,
                  borderRadius: '0.75rem',
                } as React.CSSProperties}
              >
                <CardVisual card={card} size="sm" owned />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
