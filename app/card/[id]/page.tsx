'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import CardViewer3D from '@/components/CardViewer3D';
import TosharBubble from '@/components/TosharBubble';
import { CARDS } from '@/data/cards';
import { loadCollection, CollectionState } from '@/lib/storage';
import { RARITY_CONFIG } from '@/lib/rarity';

/* ── 金粉の配置（固定ランダム、SSR-safe） ── */
const GOLD_DUST = [
  { x: '6%',  y: '8%',  s: 2, b: true  },
  { x: '88%', y: '6%',  s: 1, b: false },
  { x: '15%', y: '22%', s: 1, b: false },
  { x: '78%', y: '18%', s: 2, b: true  },
  { x: '32%', y: '38%', s: 1, b: false },
  { x: '92%', y: '35%', s: 1, b: true  },
  { x: '8%',  y: '52%', s: 1, b: false },
  { x: '68%', y: '48%', s: 2, b: false },
  { x: '22%', y: '65%', s: 1, b: true  },
  { x: '84%', y: '62%', s: 1, b: false },
  { x: '48%', y: '75%', s: 2, b: false },
  { x: '12%', y: '82%', s: 1, b: true  },
  { x: '72%', y: '80%', s: 1, b: false },
  { x: '58%', y: '14%', s: 1, b: false },
  { x: '40%', y: '92%', s: 2, b: true  },
  { x: '95%', y: '88%', s: 1, b: false },
];

export default function CardDetailPage() {
  const params = useParams<{ id: string }>();
  const [col, setCol] = useState<CollectionState | null>(null);
  const [cardWidthPx, setCardWidthPx] = useState(280);
  const containerRef = useRef<HTMLDivElement>(null);

  const card = useMemo(() => CARDS.find(item => item.id === params.id), [params.id]);

  useEffect(() => {
    setCol(loadCollection());
  }, []);

  useEffect(() => {
    function measure() {
      const isUR = card?.rarity === 'UR';
      const vw = isUR ? 0.92 : 0.88;
      const max = isUR ? 420 : 360;
      const w = Math.min(max, Math.round(window.innerWidth * vw));
      setCardWidthPx(w);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.rarity]);

  if (!card) {
    return (
      <div className="min-h-dvh px-4 py-8 pb-24 flex flex-col items-center justify-center text-center gap-4">
        <p className="text-5xl">?</p>
        <h1 className="text-xl font-black">カードが見つかりません</h1>
        <Link href="/zukan" className="text-accent font-black">図鑑へ戻る</Link>
      </div>
    );
  }

  const owned = card.id === 'card_010' ? true : (col?.ownedCardIds.includes(card.id) ?? false);
  const cfg   = RARITY_CONFIG[card.rarity];
  const isUR  = card.rarity === 'UR';

  return (
    <div
      ref={containerRef}
      className="min-h-dvh pb-24 flex flex-col"
      style={{
        /* 漆黒 × 深紺 × 金の展示空間 */
        background: isUR
          ? [
              'radial-gradient(ellipse 90% 38% at 50% 0%,   rgba(160,110,20,0.18) 0%, transparent 100%)',
              'radial-gradient(ellipse 60% 30% at 50% 68%,  rgba(180,120,18,0.13) 0%, transparent 100%)',
              'radial-gradient(ellipse 80% 50% at 85% 25%,  rgba(80,20,140,0.09)  0%, transparent 100%)',
              'radial-gradient(ellipse 80% 50% at 15% 75%,  rgba(100,30,20,0.07)  0%, transparent 100%)',
              'linear-gradient(180deg, #070510 0%, #0a0713 50%, #050308 100%)',
            ].join(', ')
          : '#09080f',
      }}
    >
      {/* ━━━━━━━━━━━━━━━ UR専用: 和風展示空間 固定背景 ━━━━━━━━━━━━━━━ */}
      {isUR && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>

          {/* ── 和柄 SVG レイヤー（見えるレベルに強化） ── */}
          <svg
            width="100%" height="100%"
            style={{ position: 'absolute', inset: 0 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* 青海波（大きめ） */}
              <pattern id="seigaiha" x="0" y="0" width="64" height="38" patternUnits="userSpaceOnUse">
                <path d="M0 32 A32 32 0 0 1 64 32"   fill="none" stroke="rgba(195,152,30,1)" strokeWidth="0.9"/>
                <path d="M-32 32 A32 32 0 0 1 32 32" fill="none" stroke="rgba(195,152,30,1)" strokeWidth="0.9"/>
              </pattern>
              {/* 七宝つなぎ */}
              <pattern id="shippo" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="0"  cy="0"  r="16" fill="none" stroke="rgba(195,152,30,1)" strokeWidth="0.7"/>
                <circle cx="32" cy="0"  r="16" fill="none" stroke="rgba(195,152,30,1)" strokeWidth="0.7"/>
                <circle cx="0"  cy="32" r="16" fill="none" stroke="rgba(195,152,30,1)" strokeWidth="0.7"/>
                <circle cx="32" cy="32" r="16" fill="none" stroke="rgba(195,152,30,1)" strokeWidth="0.7"/>
                <circle cx="16" cy="16" r="16" fill="none" stroke="rgba(195,152,30,1)" strokeWidth="0.7"/>
              </pattern>
            </defs>

            {/* 上部 青海波（天井の和柄） */}
            <rect width="100%" height="52%" fill="url(#seigaiha)" opacity="0.13"/>

            {/* 下部 七宝つなぎ（床面） */}
            <rect y="52%" width="100%" height="48%" fill="url(#shippo)" opacity="0.10"/>

            {/* 展示照明: 上からの細い光 */}
            <line x1="20%" y1="0" x2="16%" y2="100%" stroke="rgba(210,165,35,0.06)" strokeWidth="28"/>
            <line x1="80%" y1="0" x2="84%" y2="100%" stroke="rgba(210,165,35,0.05)" strokeWidth="22"/>
            {/* 中央スポット */}
            <line x1="50%" y1="0" x2="50%" y2="45%" stroke="rgba(230,180,42,0.06)" strokeWidth="50"/>

            {/* ── 金鯱シルエット（右上、認識できるレベル） ── */}
            <g transform="translate(68%, 1%) scale(0.28) rotate(10)" opacity="0.11" fill="rgba(205,160,35,1)">
              <path d="M55,160 C38,128 18,108 10,72 C2,38 18,10 42,6 C60,3 76,18 80,38
                        C88,16 108,5 126,18 C148,34 142,68 124,86
                        C144,76 158,94 148,116 C138,138 116,142 102,128
                        C96,148 82,162 68,156 Z"/>
              <path d="M70,45 C78,28 96,18 108,32 C96,14 78,8 64,20 Z"/>
              <path d="M42,130 C30,148 22,162 38,168 C50,172 58,162 52,148 Z"/>
              <path d="M68,138 C62,158 58,174 74,176 C86,178 90,164 80,150 Z"/>
            </g>

            {/* ── 名古屋城シルエット（左下、認識できるレベル） ── */}
            <g transform="translate(0%, 55%) scale(0.09)" opacity="0.09" fill="rgba(205,160,35,1)">
              <rect x="80"  y="180" width="240" height="230"/>
              <rect x="115" y="115" width="170" height="75"/>
              <rect x="145" y="62"  width="110" height="62"/>
              <rect x="168" y="22"  width="64"  height="48"/>
              <polygon points="200,0 272,72 128,72"/>
              <polygon points="200,28 252,72 148,72"/>
              {/* 窓 */}
              <rect x="130" y="200" width="30" height="30" fill="rgba(0,0,0,0.3)"/>
              <rect x="185" y="200" width="30" height="30" fill="rgba(0,0,0,0.3)"/>
              <rect x="240" y="200" width="30" height="30" fill="rgba(0,0,0,0.3)"/>
            </g>
          </svg>

          {/* ── 金粉（増量・明るく） ── */}
          {GOLD_DUST.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: p.x, top: p.y,
              width: p.s + 1, height: p.s + 1,
              borderRadius: '50%',
              background: p.b ? 'rgba(255,220,60,0.72)' : 'rgba(205,158,32,0.50)',
              boxShadow: p.b
                ? '0 0 7px rgba(255,212,50,0.65)'
                : '0 0 4px rgba(190,145,22,0.40)',
            }}/>
          ))}

          {/* ── 天井照明グロー（暖色スポット） ── */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '80%', height: '35%',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(200,142,28,0.20) 0%, transparent 72%)',
          }}/>

          {/* 左右壁面グロー */}
          <div style={{
            position: 'absolute', inset: 0,
            background: [
              'radial-gradient(ellipse 28% 65% at 0% 50%, rgba(165,115,18,0.09) 0%, transparent 100%)',
              'radial-gradient(ellipse 28% 65% at 100% 50%, rgba(165,115,18,0.09) 0%, transparent 100%)',
            ].join(', '),
          }}/>

          {/* 下部床反射 */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '75%', height: '24%',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(175,122,22,0.14) 0%, transparent 72%)',
          }}/>
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0"
        style={{ position: 'relative', zIndex: 1 }}>
        <Link
          href="/zukan"
          className="active:opacity-60 transition-opacity"
          style={{ fontSize: 13, fontWeight: 900, color: 'rgba(200,180,255,0.45)' }}
        >
          ← 図鑑
        </Link>
        <div className="text-right">
          <p style={{ fontSize: 9, letterSpacing: '0.28em', color: 'rgba(200,180,255,0.28)', fontWeight: 700 }}>
            CARD DETAIL
          </p>
          <h1 style={{ fontWeight: 900, fontSize: 15, color: '#fff', letterSpacing: '0.02em' }}>
            {owned ? card.name : '???'}
          </h1>
        </div>
      </header>

      {/* ── 3Dカード（メイン） ── */}
      <div className="flex justify-center items-center"
        style={{ paddingTop: 4, paddingBottom: 4, position: 'relative', zIndex: 1 }}>
        <CardViewer3D card={card} owned={owned} widthPx={cardWidthPx} />
      </div>

      {/* ── Info section ── */}
      <div className="px-4 flex flex-col gap-4 mt-1" style={{ position: 'relative', zIndex: 1 }}>
        {!owned ? (
          <>
            <TosharBubble size="sm" text="このカードはまだ未発見じゃ。今日の1枚で引き当てるんじゃ！" />
            <Link
              href="/"
              className="w-full py-4 rounded-2xl text-center font-black text-white active:scale-95"
              style={{ background: 'linear-gradient(135deg, #e63946, #c2112a)' }}
            >
              今日の1枚へ
            </Link>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Rarity + area */}
            <div className="flex items-center gap-3">
              <span
                style={{
                  fontSize: 11, fontWeight: 900,
                  letterSpacing: '0.14em',
                  color: cfg.color,
                  border: `1px solid ${cfg.borderColor}55`,
                  borderRadius: 20,
                  padding: '3px 10px',
                  background: 'rgba(0,0,0,0.4)',
                }}
              >
                {cfg.label}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(200,180,255,0.50)', fontWeight: 700 }}>
                {card.area}
              </span>
            </div>

            {/* Description */}
            <section
              className="rounded-2xl p-4"
              style={{ border: '1px solid rgba(200,180,255,0.10)', background: 'rgba(255,255,255,0.04)' }}
            >
              <h2 className="text-white font-black text-base mb-2">
                {card.shopName}の{card.name}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(200,190,220,0.75)', lineHeight: 1.7 }}>
                {card.description}
              </p>
            </section>

            <TosharBubble size="sm" text={card.tosharComment} />

            {/* Store info */}
            <section
              className="rounded-2xl p-4"
              style={{ border: '1px solid rgba(200,180,255,0.10)', background: 'rgba(255,255,255,0.04)' }}
            >
              <h2 style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', color: 'rgba(200,180,255,0.45)', marginBottom: 12 }}>
                店舗情報
              </h2>
              <div className="flex flex-col gap-2">
                <Info label="店名"   value={card.shopName} />
                <Info label="住所"   value={card.address} />
                <Info label="価格帯" value={card.priceRange} />
              </div>
              <a
                href={card.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3.5 rounded-xl text-center font-black text-sm text-white active:scale-95 mt-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,20,50,0.9), rgba(10,8,20,0.9))',
                  border: '1px solid rgba(200,180,255,0.15)',
                }}
              >
                Googleマップで見る
              </a>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-3 text-sm">
      <dt style={{ color: 'rgba(200,180,255,0.38)', fontWeight: 700 }}>{label}</dt>
      <dd style={{ color: 'rgba(220,210,240,0.80)', lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
