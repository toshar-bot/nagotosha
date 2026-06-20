'use client';

import { useRef, useState } from 'react';
import { Card } from '@/types/card';
import CardVisual from './CardVisual';
import { RARITY_CONFIG } from '@/lib/rarity';

type CardPhase = 'waiting' | 'building' | 'flipped';

interface Props {
  cards: Card[];
  onComplete: () => void;
}

// ビルドアップ時間 (ms)
const BUILDUP_MS: Record<string, number> = {
  N: 80, R: 520, SR: 1250, SSR: 2600, UR: 3900,
};

// 召喚陣のアンビエントカラー
const AMBIENT: Record<string, string> = {
  N:   'rgba(130, 90, 15, 0.16)',
  R:   'rgba(35, 80, 210, 0.30)',
  SR:  'rgba(110, 28, 170, 0.35)',
  SSR: 'rgba(195, 125, 0, 0.42)',
  UR:  'rgba(150, 45, 210, 0.45)',
};

// カード裏面の発光色
const BACK_COLOR: Record<string, string> = {
  N:   '#c89a38',
  R:   '#5090f8',
  SR:  '#bc68f8',
  SSR: '#f8c020',
  UR:  '#ff7040',
};

const CARD_W = 260;
const CARD_H = 373; // 260 × 1.435

const UR_LINE = '...名古屋の伝説が、目覚めた。';

export default function CardReveal({ cards, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [cardPhase, setCardPhase] = useState<CardPhase>('waiting');
  const [urStage, setUrStage] = useState(0); // 0=off 1=dark+beam 2=+text
  const [showFlash, setShowFlash] = useState(false);
  const canAdvance = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const card = cards[current];
  const cfg = RARITY_CONFIG[card.rarity];
  const isBuilding = cardPhase === 'building';
  const isFlipped  = cardPhase === 'flipped';

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function push(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  function startBuildup() {
    setCardPhase('building');
    clearTimers();
    const ms = BUILDUP_MS[card.rarity] ?? 100;

    if (card.rarity === 'UR') {
      push(() => setUrStage(1), 250);
      push(() => setUrStage(2), 1300);
    }

    push(() => {
      const needsFlash = card.rarity === 'SSR' || card.rarity === 'UR';
      if (needsFlash) {
        setShowFlash(true);
        push(() => setShowFlash(false), 480);
      }
      setCardPhase('flipped');
      setUrStage(0);
      push(() => { canAdvance.current = true; }, 550);
    }, ms);
  }

  function advance() {
    if (!canAdvance.current) return;
    canAdvance.current = false;
    clearTimers();
    if (current < cards.length - 1) {
      setCurrent(c => c + 1);
      setCardPhase('waiting');
    } else {
      onComplete();
    }
  }

  function handlePointerUp() {
    if (cardPhase === 'waiting') startBuildup();
    else if (cardPhase === 'flipped') advance();
  }

  const isSSR = isBuilding && card.rarity === 'SSR';
  const isURDark = isBuilding && card.rarity === 'UR' && urStage >= 1;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center select-none${isSSR ? ' animate-ssr-shake-screen' : ''}`}
      style={{
        background: '#020009',
        touchAction: 'manipulation',
      }}
      onPointerUp={handlePointerUp}
    >
      {/* ── 召喚陣背景 ── */}
      <SummoningBg
        ambient={AMBIENT[card.rarity] ?? AMBIENT.N}
        active={isBuilding}
        urStage={urStage}
      />

      {/* ── UR暗転 ── */}
      {(isURDark || urStage >= 1) && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.90)' }}
        >
          {urStage >= 2 && (
            <p className="ur-rainbow-text font-black text-xl tracking-widest text-center px-10 leading-loose">
              {UR_LINE.split('').map((ch, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: 0,
                    animation: 'char-appear 0.12s ease forwards',
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {/* ── SSR: 金の召喚陣フラッシュ ── */}
      {isSSR && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 55% at 50% 46%, rgba(195,120,0,0.28) 0%, transparent 70%)',
            animation: 'ssr-pulse 0.42s ease-in-out infinite alternate',
            zIndex: 2,
          }}
        />
      )}

      {/* ── ホワイトフラッシュ ── */}
      {showFlash && (
        <div
          className="fixed inset-0 pointer-events-none animate-white-flash"
          style={{ background: 'white', zIndex: 70 }}
        />
      )}

      {/* ── 進行ドット ── */}
      <div
        className="absolute flex gap-2"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 48px)',
          zIndex: 10,
        }}
      >
        {cards.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 20 : 12,
              background: i < current ? 'rgba(255,255,255,0.45)' : i === current ? 'white' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* ── カードフリップエリア ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        {/* フリップラッパー */}
        <div style={{ perspective: '1200px', width: CARD_W, height: CARD_H }}>
          <div
            className={`card-flip-inner ${isFlipped ? 'is-flipped' : ''} ${isBuilding && card.rarity === 'SR' ? 'animate-sr-shake' : ''} ${isBuilding && card.rarity === 'SSR' ? 'animate-ssr-buildup' : ''}`}
            style={{ width: CARD_W, height: CARD_H }}
          >
            {/* 裏面 */}
            <div className={`card-flip-back-face back-${card.rarity.toLowerCase()}`}>
              <CardBack color={BACK_COLOR[card.rarity] ?? '#c89a38'} isBuilding={isBuilding} />
            </div>
            {/* 表面 */}
            <div className="card-flip-front-face">
              <CardVisual card={card} size="xl" owned />
            </div>
          </div>
        </div>

        {/* カード情報（めくり後） */}
        {isFlipped && (
          <div className="text-center px-6 animate-fade-up">
            <p
              className="text-xs font-black tracking-widest mb-1"
              style={{ color: cfg.color }}
            >
              {card.rarity} — {cfg.label}
            </p>
            <p className="text-white font-black text-base leading-snug">
              {card.shopName}の{card.name}
            </p>
          </div>
        )}
      </div>

      {/* ── 下部ヒント（safe area対応） ── */}
      <div
        className="w-full text-center"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 24px)' }}
      >
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

/* ── 召喚陣背景コンポーネント ── */
function SummoningBg({
  ambient,
  active,
  urStage,
}: {
  ambient: string;
  active: boolean;
  urStage: number;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* アンビエントグロウ */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 85% 65% at 50% 46%, ${active ? ambient : 'rgba(120,80,10,0.10)'} 0%, transparent 72%)`,
          transition: 'background 0.9s ease',
        }}
      />

      {/* 同心円リング */}
      {([75, 126, 176, 226] as const).map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: '50%', top: '44%',
            width: r * 2, height: r * 2, borderRadius: '50%',
            border: `1px solid rgba(175,125,28,${0.13 - i * 0.025})`,
            transform: 'translate(-50%, -50%)',
            boxShadow: i === 0 ? '0 0 22px rgba(175,125,28,0.06)' : 'none',
          }}
        />
      ))}

      {/* ゆっくり回転する外リング（8点マーカー付き） */}
      <div
        style={{
          position: 'absolute', left: '50%', top: '44%',
          width: 320, height: 320, borderRadius: '50%',
          border: '1px solid rgba(175,125,28,0.09)',
          transform: 'translate(-50%, -50%)',
          animation: 'spin-slow 30s linear infinite',
        }}
      >
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `calc(50% + ${Math.cos(a) * 158}px - 3px)`,
                top:  `calc(50% + ${Math.sin(a) * 158}px - 3px)`,
                width: 6, height: 6, borderRadius: '50%',
                background: 'rgba(175,125,28,0.30)',
              }}
            />
          );
        })}
      </div>

      {/* 逆回転内リング */}
      <div
        style={{
          position: 'absolute', left: '50%', top: '44%',
          width: 200, height: 200, borderRadius: '50%',
          border: '1px solid rgba(175,125,28,0.07)',
          transform: 'translate(-50%, -50%)',
          animation: 'spin-slow-rev 20s linear infinite',
        }}
      />

      {/* UR 虹ビーム */}
      {urStage >= 1 && (
        <div
          style={{
            position: 'absolute', left: '50%', top: '44%',
            width: '200vmax', height: '200vmax',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'ur-beam-spin 1.8s linear infinite',
            background: [
              'repeating-conic-gradient(',
              'rgba(140,40,255,0.20) 0deg 8deg,',
              'transparent 8deg 22deg,',
              'rgba(255,70,20,0.16) 22deg 30deg,',
              'transparent 30deg 44deg,',
              'rgba(20,120,255,0.18) 44deg 52deg,',
              'transparent 52deg 66deg,',
              'rgba(255,180,0,0.14) 66deg 74deg,',
              'transparent 74deg 88deg,',
              'rgba(0,200,80,0.12) 88deg 96deg,',
              'transparent 96deg 110deg',
              ')',
            ].join(''),
          }}
        />
      )}
    </div>
  );
}

/* ── カード裏面コンポーネント（絵文字なし・CSS設計） ── */
function CardBack({ color, isBuilding }: { color: string; isBuilding: boolean }) {
  return (
    <div
      style={{
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #04010c 0%, #0d0416 50%, #04010c 100%)',
        border: `2px solid ${color}3a`,
      }}
    >
      {/* 内枠 */}
      <div style={{ position: 'absolute', inset: 8, border: `1px solid ${color}22`, borderRadius: '0.5rem', pointerEvents: 'none' }} />

      {/* 中央グロウ */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${color}${isBuilding ? '1e' : '0c'} 0%, transparent 58%)`,
          transition: 'background 0.35s',
        }}
      />

      {/* 上部デコレーション */}
      <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, alignItems: 'center' }}>
        <div style={{ width: 24, height: 1, background: `${color}2c` }} />
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${color}55`, boxShadow: `0 0 8px ${color}88` }} />
        <div style={{ width: 24, height: 1, background: `${color}2c` }} />
      </div>

      {/* ダイヤモンド紋章 */}
      {([54, 36, 20] as const).map((size, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: size, height: size,
            border: `1px solid ${color}${['3c', '28', '18'][i]}`,
            transform: 'translate(-50%, -50%) rotate(45deg)',
          }}
        />
      ))}

      {/* 中央ドット */}
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%',
          width: 10, height: 10, borderRadius: '50%',
          background: color,
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 18px ${color}, 0 0 42px ${color}66`,
        }}
      />

      {/* 下部デコレーション */}
      <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, alignItems: 'center' }}>
        <div style={{ width: 24, height: 1, background: `${color}2c` }} />
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${color}55`, boxShadow: `0 0 8px ${color}88` }} />
        <div style={{ width: 24, height: 1, background: `${color}2c` }} />
      </div>

      {/* NAGOTOSHA ロゴ */}
      <div
        style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          textAlign: 'center', fontSize: '7px', letterSpacing: '0.26em',
          color: `${color}48`, fontWeight: 900, userSelect: 'none',
        }}
      >
        NAGOTOSHA
      </div>
    </div>
  );
}
