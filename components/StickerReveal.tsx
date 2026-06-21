'use client';

import { useRef, useState } from 'react';
import { Card } from '@/types/card';
import StickerVisual from './StickerVisual';
import { RARITY_CONFIG } from '@/lib/rarity';

type CardPhase = 'waiting' | 'building' | 'flipped';

interface Props {
  cards: Card[];
  onComplete: () => void;
}

const BUILDUP_MS: Record<string, number> = {
  N: 80, R: 520, SR: 1300, SSR: 2600, UR: 4000,
};

const AMBIENT: Record<string, string> = {
  N:   'rgba(130, 90, 15, 0.16)',
  R:   'rgba(35, 80, 210, 0.30)',
  SR:  'rgba(110, 28, 170, 0.35)',
  SSR: 'rgba(195, 125, 0, 0.42)',
  UR:  'rgba(150, 45, 210, 0.45)',
};

const BACK_COLOR: Record<string, string> = {
  N: '#c89a38', R: '#5090f8', SR: '#bc68f8', SSR: '#f8c020', UR: '#ff7040',
};

const STICKER_W = 236;
const STICKER_H = Math.round(STICKER_W * 1.38);
const UR_LINE = '...名古屋の伝説が、目覚めた。';

export default function StickerReveal({ cards, onComplete }: Props) {
  const [current, setCurrent]     = useState(0);
  const [cardPhase, setCardPhase] = useState<CardPhase>('waiting');
  const [urStage, setUrStage]     = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const canAdvance  = useRef(false);
  const timers      = useRef<ReturnType<typeof setTimeout>[]>([]);

  const card      = cards[current];
  const cfg       = RARITY_CONFIG[card.rarity];
  const isBuilding = cardPhase === 'building';
  const isFlipped  = cardPhase === 'flipped';

  function push(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }
  function clearAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function startBuildup() {
    setCardPhase('building');
    clearAll();
    const ms = BUILDUP_MS[card.rarity] ?? 100;

    if (card.rarity === 'UR') {
      push(() => setUrStage(1), 250);
      push(() => setUrStage(2), 1400);
    }

    push(() => {
      if (card.rarity === 'SSR' || card.rarity === 'UR') {
        setShowFlash(true);
        push(() => setShowFlash(false), 480);
      }
      setCardPhase('flipped');
      setUrStage(0);
      push(() => { canAdvance.current = true; }, 560);
    }, ms);
  }

  function advance() {
    if (!canAdvance.current) return;
    canAdvance.current = false;
    clearAll();
    if (current < cards.length - 1) {
      setCurrent(c => c + 1);
      setCardPhase('waiting');
    } else {
      onComplete();
    }
  }

  function handleTap() {
    if (cardPhase === 'waiting') startBuildup();
    else if (cardPhase === 'flipped') advance();
  }

  const isSSR = isBuilding && card.rarity === 'SSR';
  const isURDark = isBuilding && card.rarity === 'UR' && urStage >= 1;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center select-none${isSSR ? ' animate-ssr-shake-screen' : ''}`}
      style={{ background: '#020009', touchAction: 'manipulation' }}
      onPointerUp={handleTap}
    >
      {/* 召喚陣背景 */}
      <SummoningBg
        ambient={isBuilding ? AMBIENT[card.rarity] ?? AMBIENT.N : AMBIENT.N}
        urStage={urStage}
      />

      {/* UR 暗転オーバーレイ */}
      {isURDark && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.91)' }}>
          {urStage >= 2 && (
            <p className="ur-rainbow-text font-black text-xl tracking-widest text-center px-10 leading-loose">
              {UR_LINE.split('').map((ch, i) => (
                <span key={i} style={{
                  display: 'inline-block', opacity: 0,
                  animation: 'char-appear 0.12s ease forwards',
                  animationDelay: `${i * 0.08}s`,
                }}>
                  {ch}
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {/* SSR 背景バースト */}
      {isSSR && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2,
          background: 'radial-gradient(ellipse 70% 55% at 50% 46%, rgba(195,120,0,0.28) 0%, transparent 70%)',
          animation: 'ssr-pulse 0.42s ease-in-out infinite alternate',
        }} />
      )}

      {/* ホワイトフラッシュ */}
      {showFlash && (
        <div className="fixed inset-0 animate-white-flash pointer-events-none"
          style={{ background: 'white', zIndex: 70 }} />
      )}

      {/* 進行ドット */}
      <div className="absolute flex gap-2" style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 48px)', zIndex: 10,
      }}>
        {cards.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300" style={{
            width: i === current ? 20 : 12,
            background: i < current ? 'rgba(255,255,255,0.45)' : i === current ? 'white' : 'rgba(255,255,255,0.15)',
          }} />
        ))}
      </div>

      {/* フリップエリア */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <div style={{ perspective: '1200px', width: STICKER_W, height: STICKER_H }}>
          <div
            className={`card-flip-inner ${isFlipped ? 'is-flipped' : ''} ${isBuilding && card.rarity === 'SR' ? 'animate-sr-shake' : ''} ${isBuilding && card.rarity === 'SSR' ? 'animate-ssr-buildup' : ''}`}
            style={{ width: STICKER_W, height: STICKER_H }}
          >
            {/* 裏面 */}
            <div className={`card-flip-back-face back-${card.rarity.toLowerCase()}`}>
              <StickerBack color={BACK_COLOR[card.rarity] ?? '#c89a38'} isBuilding={isBuilding} />
            </div>
            {/* 表面 */}
            <div className="card-flip-front-face flex items-center justify-center">
              <StickerVisual card={card} size="lg" discovered />
            </div>
          </div>
        </div>

        {/* フリップ後: カード情報 */}
        {isFlipped && (
          <div className="text-center px-6 animate-fade-up">
            <p className="text-xs font-black tracking-widest mb-1" style={{ color: cfg.color }}>
              {card.rarity} — {cfg.label}
            </p>
            <p className="text-white font-black text-base leading-snug">
              {card.shopName}の{card.name}
            </p>
            <p className="text-white/35 text-xs mt-0.5">{card.area}</p>
          </div>
        )}
      </div>

      {/* 下部ヒント */}
      <div className="w-full text-center" style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 24px)',
      }}>
        {cardPhase === 'waiting' && (
          <p className="text-white/22 text-[11px] tracking-widest">タップしてめくる</p>
        )}
        {isFlipped && (
          <p className="text-white/28 text-[11px] tracking-widest animate-fade-up">
            {current < cards.length - 1 ? 'タップして次へ' : 'タップして結果を見る'}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── 召喚陣背景 ── */
function SummoningBg({ ambient, urStage }: { ambient: string; urStage: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 85% 65% at 50% 46%, ${ambient} 0%, transparent 72%)`,
        transition: 'background 0.9s ease',
      }} />
      {([75, 126, 176, 226] as const).map((r, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '44%',
          width: r * 2, height: r * 2, borderRadius: '50%',
          border: `1px solid rgba(175,125,28,${0.13 - i * 0.025})`,
          transform: 'translate(-50%, -50%)',
        }} />
      ))}
      <div style={{
        position: 'absolute', left: '50%', top: '44%',
        width: 320, height: 320, borderRadius: '50%',
        border: '1px solid rgba(175,125,28,0.09)',
        transform: 'translate(-50%, -50%)',
        animation: 'spin-slow 30s linear infinite',
      }}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `calc(50% + ${Math.cos(a) * 158}px - 3px)`,
              top:  `calc(50% + ${Math.sin(a) * 158}px - 3px)`,
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(175,125,28,0.28)',
            }} />
          );
        })}
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: '44%',
        width: 200, height: 200, borderRadius: '50%',
        border: '1px solid rgba(175,125,28,0.07)',
        transform: 'translate(-50%, -50%)',
        animation: 'spin-slow-rev 22s linear infinite',
      }} />
      {urStage >= 1 && (
        <div style={{
          position: 'absolute', left: '50%', top: '44%',
          width: '200vmax', height: '200vmax', borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'ur-beam-spin 1.8s linear infinite',
          background: 'repeating-conic-gradient(rgba(140,40,255,0.20) 0deg 8deg, transparent 8deg 22deg, rgba(255,70,20,0.16) 22deg 30deg, transparent 30deg 44deg, rgba(20,120,255,0.18) 44deg 52deg, transparent 52deg 66deg)',
        }} />
      )}
    </div>
  );
}

/* ── シール裏面（CSS設計・絵文字なし） ── */
function StickerBack({ color, isBuilding }: { color: string; isBuilding: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, #04010c 0%, #0d0416 50%, #04010c 100%)',
      border: `2px solid ${color}3a`,
    }}>
      <div style={{ position: 'absolute', inset: 8, border: `1px solid ${color}22`, borderRadius: '0.5rem', pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${color}${isBuilding ? '1e' : '0c'} 0%, transparent 58%)`,
        transition: 'background 0.35s',
      }} />
      {/* 上部デコ */}
      <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, alignItems: 'center' }}>
        <div style={{ width: 22, height: 1, background: `${color}2c` }} />
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${color}55`, boxShadow: `0 0 8px ${color}88` }} />
        <div style={{ width: 22, height: 1, background: `${color}2c` }} />
      </div>
      {/* ダイヤモンド */}
      {([56, 36, 20] as const).map((size, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '50%',
          width: size, height: size,
          border: `1px solid ${color}${['3c', '28', '18'][i]}`,
          transform: 'translate(-50%, -50%) rotate(45deg)',
        }} />
      ))}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 10, height: 10, borderRadius: '50%',
        background: color, transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 18px ${color}, 0 0 42px ${color}66`,
      }} />
      {/* 下部デコ */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, alignItems: 'center' }}>
        <div style={{ width: 22, height: 1, background: `${color}2c` }} />
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${color}55`, boxShadow: `0 0 8px ${color}88` }} />
        <div style={{ width: 22, height: 1, background: `${color}2c` }} />
      </div>
      <div style={{
        position: 'absolute', bottom: 12, left: 0, right: 0,
        textAlign: 'center', fontSize: '7px', letterSpacing: '0.26em',
        color: `${color}48`, fontWeight: 900, userSelect: 'none',
      }}>
        NAGOTOSHA
      </div>
    </div>
  );
}
