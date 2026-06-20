'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import CardVisual from '@/components/CardVisual';
import TosharBubble from '@/components/TosharBubble';
import { CARDS } from '@/data/cards';
import { loadCollection, CollectionState } from '@/lib/storage';
import { RARITY_CONFIG } from '@/lib/rarity';

export default function CardDetailPage() {
  const params = useParams<{ id: string }>();
  const [col, setCol] = useState<CollectionState | null>(null);
  const card = useMemo(() => CARDS.find(item => item.id === params.id), [params.id]);

  useEffect(() => {
    setCol(loadCollection());
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
  const cfg = RARITY_CONFIG[card.rarity];

  return (
    <div className="min-h-dvh pb-24 px-4 pt-5">
      <header className="flex items-center justify-between mb-5">
        <Link href="/zukan" className="text-sm text-gray-400 font-bold active:scale-95">
          ← 図鑑
        </Link>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 font-bold">CARD DETAIL</p>
          <h1 className="text-white font-black text-lg">{owned ? card.name : '???'}</h1>
        </div>
      </header>

      <div className="flex flex-col items-center gap-5">
        <CardVisual card={card} size="lg" owned={owned} />

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
          <div className="w-full space-y-4 animate-fade-up">
            <section className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full border"
                  style={{ color: cfg.color, borderColor: cfg.borderColor }}
                >
                  {cfg.label}
                </span>
                <span className="text-xs text-gray-400">{card.area}</span>
              </div>
              <h2 className="text-xl font-black text-white mb-2">{card.name}</h2>
              <p className="text-sm text-gray-300 leading-relaxed">{card.description}</p>
            </section>

            <TosharBubble size="sm" text={card.tosharComment} />

            <section className="rounded-2xl border border-border bg-surface p-4 space-y-3">
              <h2 className="text-sm font-black tracking-wider text-white">店舗情報</h2>
              <Info label="店名" value={card.shopName} />
              <Info label="住所" value={card.address} />
              <Info label="価格帯" value={card.priceRange} />
              <a
                href={card.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3.5 rounded-xl text-center font-black text-sm text-white active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1f1f1f, #111)', border: '2px solid #333' }}
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
      <dt className="text-gray-500 font-bold">{label}</dt>
      <dd className="text-gray-200 leading-relaxed">{value}</dd>
    </div>
  );
}
