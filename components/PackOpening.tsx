'use client';

import { useRef, useState } from 'react';
import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';
import { DEFAULT_PACK, PackConfig } from '@/lib/packs';
import CardVisual from './CardVisual';

type Phase = 'READY' | 'CUTTING' | 'OPENING' | 'HOLD' | 'REVEAL';

interface Props {
  card: Card;
  pack?: PackConfig;
  onComplete: () => void;
}

const TEAR_Y = 19;   // パック上から何%で切るか
const PACK_W = 272;  // パック表示幅(px)

export default function PackOpening({ card, pack = DEFAULT_PACK, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('READY');
  const [cutPct, setCutPct] = useState(0);
  const startX = useRef<number | null>(null);
  const cfg = RARITY_CONFIG[card.rarity];

  function openPack() {
    if (phase !== 'READY' && phase !== 'CUTTING') return;
    setCutPct(100);
    setPhase('OPENING');
    setTimeout(() => setPhase('HOLD'),   920);
    setTimeout(() => setPhase('REVEAL'), 2100);
    setTimeout(() => onComplete(),       3200);
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

  /* ── READY / CUTTING: パック全体を1枚で表示 ── */
  if (phase === 'READY' || phase === 'CUTTING') {
    return (
      <div className="flex flex-col items-center justify-center h-full select-none">
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
            className="pack-img w-full h-auto object-contain"
            draggable={false}
          />

          {/* 切り取りガイド（パックの上に重ねる） */}
          <div
            className="absolute left-3 right-3 z-10"
            style={{ top: `calc(${TEAR_Y}% - 14px)` }}
          >
            {/* 矢印 */}
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-white text-sm" style={{ textShadow: `0 0 8px ${pack.color}` }}>✂</span>
              <div className="flex gap-0.5">
                {[0, 1, 2, 3].map(i => (
                  <span
                    key={i}
                    className="text-white/85 text-[11px] font-black"
                    style={{
                      animation: 'arrow-pulse 1.1s ease-in-out infinite',
                      animationDelay: `${i * 0.18}s`,
                      textShadow: `0 0 6px ${pack.color}`,
                    }}
                  >▶</span>
                ))}
              </div>
            </div>
            {/* ミシン目バー */}
            <div className="pack-cut-guide" style={{ position: 'relative', left: 0, right: 0, top: 0 }}>
              <span style={{ width: `${cutPct}%`, background: pack.color }} />
            </div>
          </div>
        </div>

        {/* 最小限の説明 */}
        {phase === 'READY' && (
          <p className="text-[#8a7864] text-xs mt-5 tracking-wide">横になぞる ／ タップ</p>
        )}
      </div>
    );
  }

  /* ── OPENING / HOLD: パックを上下分割して開封演出 ── */
  if (phase === 'OPENING' || phase === 'HOLD') {
    return (
      <div className="flex flex-col items-center justify-center h-full select-none">
        <div className="relative" style={{ width: PACK_W }}>

          {/* 下部（残る） */}
          <div style={{ clipPath: `polygon(0 ${TEAR_Y}%, 100% ${TEAR_Y}%, 100% 100%, 0 100%)` }}>
            <img src={pack.imageUrl} alt="" className="pack-img w-full h-auto object-contain" draggable={false} />
          </div>

          {/* 上部（飛んでいく） */}
          <div
            className="absolute top-0 left-0 right-0 pack-top-fly"
            style={{ clipPath: `polygon(0 0, 100% 0, 100% ${TEAR_Y}%, 0 ${TEAR_Y}%)` }}
          >
            <img src={pack.imageUrl} alt="" className="pack-img w-full h-auto object-contain" draggable={false} />
          </div>

          {/* カードが切り口から飛び出す */}
          <div
            className={`absolute left-1/2 z-30 ${phase === 'HOLD' ? 'card-hover-hold' : 'card-blast-from-tear'}`}
            style={{ top: `${TEAR_Y}%` }}
          >
            <CardVisual card={card} size="md" owned />
          </div>
        </div>

        {phase === 'HOLD' && (
          <p className="font-black text-xl mt-5 animate-pulse" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
        )}
      </div>
    );
  }

  /* ── REVEAL: フルカード表示 ── */
  return (
    <div className="flex flex-col items-center gap-5 animate-card-rise select-none">
      <CardVisual card={card} size="lg" owned />
      <div className="text-center animate-fade-up">
        <p className="font-black text-xl" style={{ color: cfg.color }}>{card.rarity}</p>
        <p className="text-[#2b2118] font-bold text-lg mt-0.5">{card.shopName}の{card.name}</p>
      </div>
    </div>
  );
}
