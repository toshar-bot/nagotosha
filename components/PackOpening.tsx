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
    setTimeout(() => onComplete(), 1900);
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
    else {
      setPhase('READY');
      setCutPct(0);
    }
    startX.current = null;
  }

  /* パック画像の上部20%が切り取られて飛んでいく仕組み */
  const TEAR_Y = 20; // 画像の上から何%で切るか

  return (
    <div className="relative flex flex-col items-center justify-center h-full gap-6 select-none">

      {(phase === 'READY' || phase === 'CUTTING' || phase === 'OPENING') && (
        <div className="relative" style={{ width: 220 }}>

          {/* ── パック下部（切り取り後も残る） ── */}
          <div className="relative overflow-hidden" style={{ clipPath: `polygon(0 ${TEAR_Y}%, 100% ${TEAR_Y}%, 100% 100%, 0 100%)` }}>
            <img
              src={pack.imageUrl}
              alt={pack.name}
              className="w-full h-auto object-contain"
              draggable={false}
            />
            {/* カードが出てくる */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 transition-all duration-700 ${phase === 'OPENING' ? '-top-20 opacity-100 scale-100' : 'top-4 opacity-0 scale-90'}`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1.4, 0.56, 1)', zIndex: 10 }}
            >
              <CardVisual card={card} size="md" owned />
            </div>
          </div>

          {/* ── パック上部（なぞると飛んでいく） ── */}
          <div
            className={`absolute top-0 left-0 right-0 overflow-hidden transition-all duration-500 ${phase === 'OPENING' ? 'pack-top-fly' : ''}`}
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% ${TEAR_Y}%, 0 ${TEAR_Y}%)`,
              transformOrigin: 'center top',
            }}
          >
            <img
              src={pack.imageUrl}
              alt=""
              className="w-full h-auto object-contain"
              draggable={false}
            />
          </div>

          {/* ── なぞりゲージ ── */}
          {(phase === 'READY' || phase === 'CUTTING') && (
            <div
              className="absolute left-4 right-4 z-20"
              style={{ top: `calc(${TEAR_Y}% - 3px)` }}
              onMouseDown={e => handlePointerDown(e.clientX)}
              onMouseMove={e => handlePointerMove(e.clientX)}
              onMouseUp={handlePointerEnd}
              onMouseLeave={handlePointerEnd}
              onTouchStart={e => handlePointerDown(e.touches[0].clientX)}
              onTouchMove={e => handlePointerMove(e.touches[0].clientX)}
              onTouchEnd={handlePointerEnd}
            >
              <div className="pack-cut-guide" style={{ position: 'relative', left: 0, right: 0, top: 0 }}>
                <span style={{ width: `${cutPct}%`, background: pack.color }} />
              </div>
              {/* 透明なタッチエリア */}
              <div className="absolute -inset-x-4 -inset-y-5 cursor-pointer" />
            </div>
          )}

          {/* クリックでも開封 */}
          {phase === 'READY' && (
            <div className="absolute inset-0 cursor-pointer" onClick={openPack} />
          )}
        </div>
      )}

      {(phase === 'READY' || phase === 'CUTTING') && (
        <div className="text-center space-y-1">
          <p className="text-[#2b2118] font-black text-base">
            {phase === 'CUTTING' ? 'そのまま右へスライド →' : '上の線を横になぞって開封'}
          </p>
          <p className="text-[#8a7864] text-xs">タップでも開けます</p>
        </div>
      )}

      {phase === 'OPENING' && (
        <p className="text-[#2b2118] font-black text-base animate-pulse">カード排出中...</p>
      )}

      {phase === 'REVEAL' && (
        <div className="flex flex-col items-center gap-6 animate-card-rise">
          <CardVisual card={card} size="lg" owned />
          <div className="text-center animate-fade-up">
            <p className="font-black text-lg" style={{ color: cfg.color }}>{card.rarity}</p>
            <p className="text-[#2b2118] font-bold text-lg mt-0.5">{card.shopName}の{card.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
