'use client';

import { useState } from 'react';
import { Card } from '@/types/card';
import CardVisual from './CardVisual';
import { RARITY_CONFIG } from '@/lib/rarity';

type CardPhase = 'waiting' | 'building' | 'flipped';

interface Props {
  cards: Card[];
  onComplete: () => void;
}

const BUILDUP_MS: Record<string, number> = {
  N: 80, R: 400, SR: 950, SSR: 2100, UR: 3600,
};

const TOSHAR_UR_LINE = '...これは伝説の味だ。名古屋の魂が宿っている。';

export default function CardReveal({ cards, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [phases, setPhases] = useState<CardPhase[]>(cards.map(() => 'waiting'));
  const [urTextVisible, setUrTextVisible] = useState(false);

  const card = cards[current];
  const cardPhase = phases[current];
  const cfg = RARITY_CONFIG[card.rarity];
  const isBuilding = cardPhase === 'building';
  const isFlipped = cardPhase === 'flipped';

  function tapCard() {
    if (cardPhase !== 'waiting') return;
    const rarity = card.rarity;
    const buildupMs = BUILDUP_MS[rarity] ?? 80;

    setPhases(prev => { const n = [...prev]; n[current] = 'building'; return n; });

    if (rarity === 'UR') {
      setTimeout(() => setUrTextVisible(true), 1200);
    }

    setTimeout(() => {
      setPhases(prev => { const n = [...prev]; n[current] = 'flipped'; return n; });
      setUrTextVisible(false);
    }, buildupMs + 550);
  }

  function nextCard() {
    if (current < cards.length - 1) {
      setCurrent(c => c + 1);
    } else {
      onComplete();
    }
  }

  const buildupShakeClass =
    isBuilding && card.rarity === 'SR' ? 'animate-sr-shake' :
    isBuilding && card.rarity === 'SSR' ? 'animate-ssr-buildup' : '';

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 36%, #2d1808 0%, #050200 100%)' }}
    >
      {/* UR blackout overlay */}
      {isBuilding && card.rarity === 'UR' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
          style={{ background: 'rgba(0,0,0,0.94)' }}>
          {urTextVisible && (
            <p className="ur-rainbow-text text-lg font-black tracking-widest text-center px-10 animate-fade-up">
              {TOSHAR_UR_LINE}
            </p>
          )}
          {/* UR rainbow ring */}
          <div className="w-32 h-32 rounded-full back-ur" style={{ flexShrink: 0 }} />
        </div>
      )}

      {/* SSR background burst */}
      {isBuilding && card.rarity === 'SSR' && (
        <div className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #f59e0b22 0%, transparent 70%)',
            animation: 'ssr-pulse 0.42s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* SR background tint */}
      {isBuilding && card.rarity === 'SR' && (
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, #a855f718 0%, transparent 60%)' }}
        />
      )}

      {/* R flash */}
      {isBuilding && card.rarity === 'R' && (
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, #3b82f614 0%, transparent 60%)' }}
        />
      )}

      {/* Progress dots */}
      <div className="absolute top-14 flex gap-2">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < current ? 'w-3 bg-white/50' :
              i === current ? 'w-5 bg-white' :
              'w-3 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Card wrapper with shake/pulse */}
      <div
        className={`relative ${buildupShakeClass}`}
        style={{ perspective: '1000px', cursor: isFlipped ? 'default' : 'pointer' }}
        onClick={!isFlipped ? tapCard : undefined}
      >
        <div className={`card-flip-inner ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Back face */}
          <div className={`card-flip-back-face back-${card.rarity.toLowerCase()}`}>
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #130900 0%, #2e1400 50%, #130900 100%)' }}
            >
              <span className="text-5xl opacity-50">🍱</span>
              {isBuilding && (
                <span
                  className="text-xs font-black tracking-widest"
                  style={{ color: cfg.color, textShadow: `0 0 12px ${cfg.color}` }}
                >
                  {card.rarity}
                </span>
              )}
            </div>
          </div>
          {/* Front face */}
          <div className="card-flip-front-face">
            <CardVisual card={card} size="md" owned />
          </div>
        </div>

        {/* Tap hint */}
        {cardPhase === 'waiting' && (
          <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-[11px] whitespace-nowrap tracking-widest">
            タップしてめくる
          </p>
        )}
      </div>

      {/* After flip: name + next button */}
      {isFlipped && (
        <div className="absolute bottom-12 flex flex-col items-center gap-4 animate-fade-up px-6 w-full">
          <div className="text-center">
            <p className="text-xs font-black tracking-widest mb-1" style={{ color: cfg.color }}>
              {card.rarity} — {cfg.label}
            </p>
            <p className="text-white font-black text-base">{card.shopName}の{card.name}</p>
          </div>
          <button
            onClick={nextCard}
            className="w-full max-w-xs py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-transform"
            style={{
              background: current < cards.length - 1
                ? 'rgba(255,255,255,0.12)'
                : `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color}66)`,
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            {current < cards.length - 1 ? `次のカード (${current + 2} / ${cards.length})` : '結果を見る →'}
          </button>
        </div>
      )}
    </div>
  );
}
