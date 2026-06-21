'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';

type Phase = 'SCANNING' | 'DETECTING' | 'FOUND';

interface Props {
  cards: Card[];
  onComplete: () => void;
}

const RARITY_RANK: Record<string, number> = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };
const SCAN_MS   = 1500;
const DETECT_MS = 1800;
const FOUND_MS  = 900;

export default function ScanScreen({ cards, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('SCANNING');

  const topCard = [...cards].sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity])[0];
  const topCfg  = RARITY_CONFIG[topCard.rarity];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('DETECTING'), SCAN_MS);
    const t2 = setTimeout(() => setPhase('FOUND'), SCAN_MS + DETECT_MS);
    const t3 = setTimeout(() => onComplete(), SCAN_MS + DETECT_MS + FOUND_MS);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  const frameColor =
    phase === 'SCANNING'  ? '#b8872f' :
    phase === 'DETECTING' ? topCfg.borderColor :
    topCfg.color;

  const FRAME_W = 248;
  const FRAME_H = 318;

  /* コーナーブラケットのインラインスタイル */
  function corner(pos: 'tl' | 'tr' | 'bl' | 'br') {
    const isT = pos[0] === 't';
    const isL = pos[1] === 'l';
    return {
      position: 'absolute' as const,
      width: 28, height: 28,
      [isT ? 'top' : 'bottom']: 0,
      [isL ? 'left' : 'right']: 0,
      borderTopWidth:    isT ? 2 : 0,
      borderBottomWidth: isT ? 0 : 2,
      borderLeftWidth:   isL ? 2 : 0,
      borderRightWidth:  isL ? 0 : 2,
      borderStyle: 'solid' as const,
      borderColor: frameColor,
      boxShadow: `0 0 10px ${frameColor}88`,
      transition: 'border-color 0.6s ease, box-shadow 0.6s ease',
      animation: 'corner-blink 1.4s ease-in-out infinite',
    };
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center select-none"
      style={{ background: '#020008' }}
    >
      {/* アンビエントグロウ */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 72% 58% at 50% 50%, ${frameColor}1a, transparent 68%)`,
        transition: 'background 0.8s ease',
      }} />

      {/* スキャン枠 */}
      <div style={{ position: 'relative', width: FRAME_W, height: FRAME_H }}>
        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
          <div key={pos} style={corner(pos)} />
        ))}

        {/* スキャンライン */}
        {phase !== 'FOUND' && (
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 3,
            background: `linear-gradient(to bottom, transparent, ${frameColor}cc, transparent)`,
            boxShadow: `0 0 12px ${frameColor}`,
            animation: 'scan-move 1.8s ease-in-out infinite',
          }} />
        )}

        {/* 中央コンテンツ */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14,
        }}>
          {phase === 'SCANNING' && (
            <>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                border: `2px solid ${frameColor}55`,
                animation: 'scan-ring-pulse 1.2s ease-in-out infinite',
              }} />
              <p style={{
                color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.22em', textAlign: 'center',
              }}>
                名古屋メシを探索中...
              </p>
            </>
          )}

          {phase === 'DETECTING' && (
            <>
              {topCard.imageUrl && (
                <img
                  src={topCard.imageUrl}
                  alt=""
                  style={{
                    width: 110, height: 110, objectFit: 'cover',
                    borderRadius: 8,
                    filter: 'blur(14px) brightness(0.5)',
                    opacity: 0.65,
                    animation: 'detect-reveal 1.8s ease-out forwards',
                  }}
                />
              )}
              <p style={{
                color: topCfg.color, fontSize: 11, fontWeight: 900,
                letterSpacing: '0.16em', textAlign: 'center',
                textShadow: `0 0 16px ${topCfg.color}`,
              }}>
                MESHI SIGNAL DETECTED...
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: topCfg.color,
                    animation: 'scan-ring-pulse 0.65s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                    boxShadow: `0 0 8px ${topCfg.color}`,
                  }} />
                ))}
              </div>
            </>
          )}

          {phase === 'FOUND' && (
            <div style={{ textAlign: 'center', animation: 'found-pop 0.5s cubic-bezier(0.34,1.6,0.64,1) both' }}>
              <p style={{
                fontSize: 26, fontWeight: 900, letterSpacing: '0.08em',
                color: topCfg.color,
                textShadow: `0 0 32px ${topCfg.color}, 0 0 70px ${topCfg.glowColor}`,
                lineHeight: 1.1,
              }}>
                MESHI
              </p>
              <p style={{
                fontSize: 26, fontWeight: 900, letterSpacing: '0.08em',
                color: topCfg.color,
                textShadow: `0 0 32px ${topCfg.color}, 0 0 70px ${topCfg.glowColor}`,
                lineHeight: 1.1,
              }}>
                FOUND!
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8, letterSpacing: '0.2em' }}>
                名古屋メシ発見
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 下部テキスト */}
      <p style={{
        marginTop: 40, fontSize: 9,
        color: 'rgba(255,255,255,0.14)',
        letterSpacing: '0.32em', fontWeight: 900,
      }}>
        NAGOTOSHA MESHI HUNT
      </p>
    </div>
  );
}
