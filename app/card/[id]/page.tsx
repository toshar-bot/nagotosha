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
    // カードを画面幅の 90% で表示（最大 360px）
    function measure() {
      const w = Math.min(360, Math.round(window.innerWidth * 0.90));
      setCardWidthPx(w);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (!card) {
    return (
      <div className="min-h-dvh px-4 py-8 pb-24 flex flex-col items-center justify-center text-center gap-4">
        <p className="text-5xl">?</p>
        <h1 className="text-xl font-black">カードが見つかりません</h1>
        <Link href="/zukan" className="text-accent font-black">図鑑へ戻る</Link>
      </div>
    );
  }

  const owned = col?.ownedCardIds.includes(card.id) ?? false;
  const cfg   = RARITY_CONFIG[card.rarity];

  return (
    <div
      ref={containerRef}
      className="min-h-dvh pb-24 flex flex-col"
      style={{ background: '#09080f' }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
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
      <div className="flex justify-center items-center" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <CardViewer3D card={card} owned={owned} widthPx={cardWidthPx} />
      </div>

      {/* ── Info section ── */}
      <div className="px-4 flex flex-col gap-4 mt-1">
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
