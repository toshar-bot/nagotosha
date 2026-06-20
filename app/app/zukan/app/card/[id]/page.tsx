'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CARDS } from '@/data/cards';
import { RARITY_CONFIG, buildShareUrl } from '@/lib/rarity';
import { loadCollection } from '@/lib/storage';
import CardVisual from '@/components/CardVisual';
import TosharBubble from '@/components/TosharBubble';

interface Props {
  params: { id: string };
}

export default function CardDetailPage({ params }: Props) {
  const { id } = params;
  const card = CARDS.find(c => c.id === id);
  const [owned, setOwned] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const col = loadCollection();
    setOwned(col.ownedCardIds.includes(id));
    setStreak(col.streak);
  }, [id]);

  if (!card) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-6xl">🐻</p>
        <p className="text-white font-black text-xl">カードが見つからないのぅ…</p>
        <Link href="/zukan" className="text-accent underline text-sm">図鑑に戻る</Link>
      </div>
    );
  }

  const cfg = RARITY_CONFIG[card.rarity];
  const shareUrl = buildShareUrl(card, streak);
  const isUR = card.rarity === 'UR';

  return (
    <div className="min-h-dvh pb-24">
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <Link href="/zukan" className="flex items-center gap-1.5 text-gray-400 text-sm font-bold active:opacity-60">
          ← 図鑑
        </Link>
        
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-black text-gray-400 px-3 py-1.5 rounded-full border border-[#333] active:opacity-60"
        >
          𝕏 シェア
        </a>
      </header>

      <div className="relative flex justify-center py-6">
        <div
          className="absolute inset-0 blur-3xl opacity-20 pointer-events-none"
          style={{ background: cfg.color }}
        />
        <div className={`relative ${owned ? '' : 'opacity-40'}`}>
          <CardVisual card={card} size="lg" owned={owned} isNew={false} />
        </div>
      </div>

      {!owned && (
        <div className="px-4 mb-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 text-center">
            <p className="text-gray-400 text-sm">まだ発見していないカードじゃ🐻</p>
            <Link
              href="/"
              className="inline-block mt-3 px-5 py-2.5 rounded-xl font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #e63946, #c2112a)' }}
            >
              🎴 引きに行く
            </Link>
          </div>
        </div>
      )}

      <div className="px-4 space-y-4">
        <div className="text-center space-y-1">
          <span
            className="inline-block text-xs font-black tracking-widest px-3 py-1 rounded-full"
            style={{
              background: `${cfg.borderColor}22`,
              color: cfg.color,
              border: `1px solid ${cfg.borderColor}55`,
            }}
          >
            ✦ {cfg.label} ✦
          </span>
          <h1 className="text-white font-black text-2xl">{card.name}</h1>
          <p className="text-gray-400 text-xs">{card.area}</p>
        </div>

        <div className="bg-[#141414] border border-[#222] rounded-2xl p-4">
          <p className="text-gray-300 text-sm leading-relaxed">{card.description}</p>
        </div>

        <TosharBubble text={card.tosharComment} size="sm" />

        <div className="bg-[#141414] border border-[#222] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#222]">
            <p className="text-[10px] tracking-widest text-gray-500 font-bold uppercase">店舗情報</p>
          </div>
          <div className="divide-y divide-[#1e1e1e]">
            {[
              { label: '店名', value: card.shopName },
              { label: 'エリア', value: card.area },
              { label: '住所', value: card.address },
              { label: '価格', value: card.priceRange },
            ].map(row => (
              <div key={row.label} className="flex gap-3 px-4 py-3">
                <span className="text-gray-500 text-xs w-10 flex-shrink-0 pt-0.5">{row.label}</span>
                <span className="text-white text-sm flex-1">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          
            href={card.googleMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-white text-sm active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #166534, #14532d)' }}
          >
            📍 Google マップで見る
          </a>

          {card.articleUrl && (
            
              href={card.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform"
              style={{ background: '#1f1f1f', border: '2px solid #2a2a2a', color: '#ccc' }}
            >
              📰 記事を読む
            </a>
          )}

          
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform"
            style={{ background: '#1f1f1f', border: '2px solid #2a2a2a', color: '#ccc' }}
          >
            𝕏 でシェアする
          </a>
        </div>

        {isUR && owned && (
          <div
            className="p-4 rounded-2xl text-center"
            style={{ background: 'linear-gradient(135deg, #7f1d1d22, #3b076422)', border: '1px solid #ef444455' }}
          >
            <p className="text-red-400 font-black text-sm">🔥 伝説カード保持者</p>
            <p className="text-gray-400 text-xs mt-1">このカードを持つ者は本物の名古屋メシハンターじゃ</p>
          </div>
        )}
      </div>
    </div>
  );
}