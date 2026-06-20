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

/* パック画像の上から何%で切るか */
const TEAR_Y = 19;

export default function PackOpening({ card, pack = DEFAULT_PACK, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('READY');
  const [cutPct, setCutPct] = useState(0);
  const startX = useRef<number | null>(null);
  const cfg = RARITY_CONFIG[card.rarity];

  function openPack() {
    if (phase !== 'READY' && phase !== 'CUTTING') return;
    setCutPct(100);
    setPhase('OPENING');
    // カードが飛び出して停止する溜め
    setTimeout(() => setPhase('HOLD'), 950);
    // 溜めの後にフルREVEAL
    setTimeout(() => setPhase('REVEAL'), 2100);
    // 結果画面へ
    setTimeout(() => onComplete(), 3200);
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

  const isPackVisible = phase === 'READY' || phase === 'CUTTING' || phase === 'OPENING' || phase === 'HOLD';

  return (
    <div className="relative flex flex-col items-center justify-center h-full gap-5 select-none">

      {isPackVisible && (
        <div className="relative" style={{ width: 224 }}>

          {/* ── パック下部（残る） ── */}
          <div style={{ clipPath: `polygon(0 ${TEAR_Y}%, 100% ${TEAR_Y}%, 100% 100%, 0 100%)` }}>
            <img
              src={pack.imageUrl}
              alt={pack.name}
              className={`pack-img w-full h-auto object-contain${phase === 'READY' ? ' pack-float' : ''}`}
              draggable={false}
            />
          </div>

          {/* ── パック上部（切れて飛ぶ） ── */}
          <div
            className={`absolute top-0 left-0 right-0 overflow-visible${phase === 'OPENING' || phase === 'HOLD' ? ' pack-top-fly' : ''}`}
            style={{ clipPath: `polygon(0 0, 100% 0, 100% ${TEAR_Y}%, 0 ${TEAR_Y}%)` }}
          >
            <img
              src={pack.imageUrl}
              alt=""
              className="pack-img w-full h-auto object-contain"
              draggable={false}
            />
          </div>

          {/* ── カードが切り口から飛び出す ── */}
          {(phase === 'OPENING' || phase === 'HOLD') && (
            <div
              className={`absolute left-1/2 z-30 ${phase === 'HOLD' ? 'card-hover-hold' : 'card-blast-from-tear'}`}
              style={{ top: `${TEAR_Y}%` }}
            >
              <CardVisual card={card} size="md" owned />
            </div>
          )}

          {/* ── 切り取りガイド（READY / CUTTING のみ） ── */}
          {(phase === 'READY' || phase === 'CUTTING') && (
            <div
              className="absolute left-0 right-0 z-20"
              style={{ top: `calc(${TEAR_Y}% - 16px)` }}
              onMouseDown={e => handlePointerDown(e.clientX)}
              onMouseMove={e => handlePointerMove(e.clientX)}
              onMouseUp={handlePointerEnd}
              onMouseLeave={handlePointerEnd}
              onTouchStart={e => handlePointerDown(e.touches[0].clientX)}
              onTouchMove={e => handlePointerMove(e.touches[0].clientX)}
              onTouchEnd={handlePointerEnd}
            >
              {/* 矢印インジケーター */}
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-white text-sm leading-none" style={{ textShadow: `0 0 8px ${pack.color}` }}>✂</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <span
                      key={i}
                      className="text-white/80 text-[10px] font-black"
                      style={{
                        animationDelay: `${i * 0.18}s`,
                        animation: 'arrow-pulse 1.1s ease-in-out infinite',
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
              {/* タッチ広い範囲 */}
              <div className="absolute -inset-x-4 -inset-y-6 cursor-pointer" />
            </div>
          )}

          {/* タップでも開封 */}
          {phase === 'READY' && (
            <div className="absolute inset-0 cursor-pointer" onClick={openPack} />
          )}
        </div>
      )}

      {/* ── テキスト ── */}
      {phase === 'READY' && (
        <div className="text-center space-y-1">
          <p className="text-[#2b2118] font-black text-base">横になぞって開封</p>
          <p className="text-[#8a7864] text-xs">タップでも開けます</p>
        </div>
      )}
      {phase === 'CUTTING' && (
        <p className="text-[#2b2118] font-black text-base">そのまま右へ →</p>
      )}
      {phase === 'HOLD' && (
        <p className="font-black text-base animate-pulse" style={{ color: cfg.color }}>
          {card.rarity}
        </p>
      )}

      {/* ── フルREVEAL ── */}
      {phase === 'REVEAL' && (
        <div className="flex flex-col items-center gap-5 animate-card-rise">
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
