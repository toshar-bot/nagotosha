'use client';

import { useRef, useState } from 'react';
import { DEFAULT_PACK, PackConfig } from '@/lib/packs';

type Phase = 'READY' | 'CUTTING' | 'OPENING';

interface Props {
  pack?: PackConfig;
  onComplete: () => void;
}

const TEAR_Y = 19; // % from top where pack tears
const PACK_W = 272;
// Offset so bottom-half img shows from TEAR_Y% down
const BOTTOM_OFFSET = `${-(TEAR_Y / (100 - TEAR_Y)) * 100}%`;

export default function PackOpening({ pack = DEFAULT_PACK, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('READY');
  const [cutPct, setCutPct] = useState(0);
  const startX = useRef<number | null>(null);

  function openPack() {
    if (phase === 'OPENING') return;
    setCutPct(100);
    setPhase('OPENING');
    setTimeout(() => onComplete(), 580);
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

      {/* OPENING: overflow:hidden で透過エッジを回避 */}
      {phase === 'OPENING' && (
        <div className="relative" style={{ width: PACK_W }}>
          {/* 高さを確保するための透明スペーサー */}
          <img src={pack.imageUrl} alt="" className="w-full h-auto block" draggable={false}
            style={{ visibility: 'hidden' }} />

          {/* 下半分（残る） */}
          <div style={{
            position: 'absolute', top: `${TEAR_Y}%`, left: 0, right: 0, bottom: 0,
            overflow: 'hidden',
          }}>
            <img
              src={pack.imageUrl} alt="" draggable={false}
              style={{
                position: 'absolute', top: BOTTOM_OFFSET, left: 0, width: '100%',
                filter: `drop-shadow(0 0 28px ${pack.color}88)`,
              }}
            />
          </div>

          {/* 上半分（飛んでいく） */}
          <div className="pack-top-fly" style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: `${TEAR_Y}%`, overflow: 'hidden',
          }}>
            <img src={pack.imageUrl} alt="" draggable={false}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
