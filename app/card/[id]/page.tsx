'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import CardViewer3D from '@/components/CardViewer3D';
import TosharBubble from '@/components/TosharBubble';
import { CARDS } from '@/data/cards';
import { loadCollection, CollectionState } from '@/lib/storage';
import { RARITY_CONFIG } from '@/lib/rarity';

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
    // UR は大きく（92vw / max 420px）、他は 88vw / max 360px
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

  // card_010 は品質確認用につき所持状態に関係なく常に表示
  const owned = card.id === 'card_010' ? true : (col?.ownedCardIds.includes(card.id) ?? false);
  const cfg   = RARITY_CONFIG[card.rarity];

  const isUR = card.rarity === 'UR';

  return (
    <div
      ref={containerRef}
      className="min-h-dvh pb-24 flex flex-col"
      style={{
        background: isUR
          ? [
              'radial-gradient(ellipse 72% 28% at 50% 10%, rgba(180,120,30,0.22) 0%, transparent 100%)',
              'radial-gradient(ellipse 60% 32% at 50% 70%, rgba(220,150,40,0.14) 0%, transparent 100%)',
              'radial-gradient(ellipse 100% 60% at 80% 20%, rgba(100,30,160,0.10) 0%, transparent 100%)',
              'linear-gradient(180deg, #080610 0%, #0b0812 45%, #050309 100%)',
            ].join(', ')
          : '#09080f',
      }}
    >
      {/* ── UR 専用: 背景和柄 + 金粉 ── */}
      {isUR && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {/* 薄い青海波パターン */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
            <defs>
              <pattern id="bgSeigaiha" x="0" y="0" width="48" height="29" patternUnits="userSpaceOnUse">
                <path d="M0 24 A24 24 0 0 1 48 24" fill="none" stroke="rgba(200,160,40,1)" strokeWidth="0.8"/>
                <path d="M-24 24 A24 24 0 0 1 24 24" fill="none" stroke="rgba(200,160,40,1)" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bgSeigaiha)"/>
          </svg>
          {/* 金粉（ランダム輝点） */}
          {[
            {x:'12%',y:'18%'},{x:'82%',y:'12%'},{x:'24%',y:'58%'},{x:'88%',y:'44%'},
            {x:'68%',y:'72%'},{x:'8%',y:'82%'},{x:'55%',y:'28%'},{x:'76%',y:'60%'},
            {x:'38%',y:'88%'},{x:'92%',y:'78%'},
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: p.x, top: p.y,
              width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1,
              borderRadius: '50%',
              background: 'rgba(255,210,80,0.45)',
              boxShadow: '0 0 4px rgba(255,200,60,0.35)',
            }}/>
          ))}
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0" style={{ position: 'relative', zIndex: 1 }}>
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
      <div className="flex justify-center items-center" style={{ paddingTop: 8, paddingBottom: 4, position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative' }}>
          <CardViewer3D card={card} owned={owned} widthPx={cardWidthPx} />
          {/* 台座グロー：カード直下の接地光 */}
          {isUR && (
            <div style={{
              position: 'absolute',
              bottom: -8, left: '50%', transform: 'translateX(-50%)',
              width: '70%', height: 20,
              background: 'radial-gradient(ellipse, rgba(200,140,30,0.32) 0%, transparent 75%)',
              filter: 'blur(6px)',
              pointerEvents: 'none',
            }}/>
          )}
        </div>
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
