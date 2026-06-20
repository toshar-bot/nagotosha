'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, saveCollection, todayStr, yesterdayStr, CollectionState } from '@/lib/storage';
import { drawPack } from '@/lib/draw';
import { RARITY_CONFIG, buildShareUrl } from '@/lib/rarity';
import { DEFAULT_PACK, PACKS, PackId, getPack } from '@/lib/packs';
import { Card } from '@/types/card';
import PackOpening from '@/components/PackOpening';
import CardVisual from '@/components/CardVisual';
import TosharBubble from '@/components/TosharBubble';
import DiscoveryBar from '@/components/DiscoveryBar';

type HomePhase = 'idle' | 'tutorial' | 'drawing' | 'result';
type TutorialStep = 0 | 1 | 2;

const TUTORIAL_STEPS = [
  { title: 'トーシャー博士です', body: 'ここは名古屋メシ図鑑 NAGOTOSHA。名古屋の美食カードを集めていきます。', cta: '次へ' },
  { title: '1日1パック開封', body: '1パックには5枚のカードが入っています。かぶりもありますが、未発見カードを集める楽しさがあります。', cta: '次へ' },
  { title: 'パックを選ぼう', body: 'パックをスライドして選び、開封します。高レアカードは最後に出ます。', cta: '始める' },
];

export default function HomePage() {
  const [col, setCol] = useState<CollectionState | null>(null);
  const [phase, setPhase] = useState<HomePhase>('idle');
  const [pendingCards, setPendingCards] = useState<Card[]>([]);
  const [isNewDraw, setIsNewDraw] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<PackId>(DEFAULT_PACK.id);
  const [tutStep, setTutStep] = useState<TutorialStep>(0);

  useEffect(() => {
    const c = loadCollection();
    setCol(c);
    if (!c.tutorialDone) {
      setPhase('tutorial');
      return;
    }
    if (c.lastDrawDate === todayStr() && c.lastDrawnCardIds.length) {
      setPendingCards(c.lastDrawnCardIds.map(id => CARDS.find(card => card.id === id)).filter(Boolean) as Card[]);
      setPhase('result');
      setIsNewDraw(false);
    }
  }, []);

  const canDraw = col ? col.lastDrawDate !== todayStr() : false;

  const handleTutorialNext = () => {
    if (tutStep < 2) {
      setTutStep((tutStep + 1) as TutorialStep);
      return;
    }
    const updated = { ...col!, tutorialDone: true };
    setCol(updated);
    saveCollection(updated);
    setPhase('idle');
  };

  const handleStartDraw = useCallback(() => {
    if (!col || !canDraw) return;
    const cards = drawPack(CARDS, col.ownedCardIds, selectedPackId, 5);
    const today = todayStr();
    const yesterday = yesterdayStr();
    const newStreak = col.lastDrawDate === yesterday ? col.streak + 1 : 1;
    const ownedCardIds = Array.from(new Set([...col.ownedCardIds, ...cards.map(card => card.id)]));
    const cardCounts = { ...col.cardCounts };
    cards.forEach(card => {
      cardCounts[card.id] = (cardCounts[card.id] ?? 0) + 1;
    });

    const updated: CollectionState = {
      ...col,
      ownedCardIds,
      cardCounts,
      lastDrawDate: today,
      lastDrawnCardId: cards[cards.length - 1]?.id ?? null,
      lastDrawnCardIds: cards.map(card => card.id),
      streak: newStreak,
      bestStreak: Math.max(col.bestStreak, newStreak),
      totalDraws: (col.totalDraws ?? 0) + cards.length,
    };

    setCol(updated);
    saveCollection(updated);
    setPendingCards(cards);
    setIsNewDraw(true);
    setPhase('drawing');
  }, [col, canDraw, selectedPackId]);

  const handleDevReset = () => {
    const reset = { ...col!, lastDrawDate: null, lastDrawnCardId: null, lastDrawnCardIds: [] };
    setCol(reset);
    saveCollection(reset);
    setPendingCards([]);
    setPhase('idle');
  };

  if (!col) {
    return <div className="min-h-dvh flex items-center justify-center"><div className="game-icon animate-toshar-float" /></div>;
  }

  const ownedCount = col.ownedCardIds.length;
  const selectedPack = getPack(selectedPackId);
  const featureCard = pendingCards[pendingCards.length - 1] ?? CARDS[0];

  return (
    <div className="flex flex-col min-h-dvh pb-20">
      <header className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-white/80 border border-border rounded-full px-3 py-1.5 shadow-sm">
          <span className="game-icon" />
          <span className="text-[#2b2118] font-black text-sm">{col.streak}日</span>
          <span className="text-[#8a7864] text-xs">連続</span>
        </div>
        <div className="text-center">
          <p className="text-[10px] tracking-[0.25em] text-[#9b8261] font-bold uppercase">名古屋メシ図鑑</p>
          <p className="text-[#2b2118] font-black text-base tracking-widest">NAGOTOSHA</p>
        </div>
        <div className="flex items-center gap-1 bg-white/80 border border-border rounded-full px-3 py-1.5 shadow-sm">
          <span className="text-[#2b2118] font-black text-sm">{ownedCount}</span>
          <span className="text-[#8a7864] text-xs">/ {TOTAL_CARDS}</span>
          <span className="game-icon book ml-1" />
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-4 gap-6">
        {phase === 'tutorial' && (
          <div className="flex flex-col gap-6 animate-fade-up">
            <TosharBubble text={`【${tutStep + 1}/3】 ${TUTORIAL_STEPS[tutStep].title}\n${TUTORIAL_STEPS[tutStep].body}`} />
            <div className="flex justify-end">
              <button
                onClick={handleTutorialNext}
                className="bg-accent text-white font-black px-8 py-3 rounded-2xl text-base active:scale-95 transition-transform"
                style={{ boxShadow: '0 0 20px rgba(201,65,45,0.28)' }}
              >
                {TUTORIAL_STEPS[tutStep].cta}
              </button>
            </div>
          </div>
        )}

        {phase === 'idle' && (
          <div className="flex flex-col gap-6 animate-fade-up">
            <TosharBubble text={canDraw ? 'パックを横にスライドして選びましょう。開封すると5枚のカードが出ます。' : '今日は開封済みです。結果を見返すか、図鑑を確認できます。'} />
            <DiscoveryBar owned={ownedCount} total={TOTAL_CARDS} />
            {canDraw ? (
              <PackPicker selectedPackId={selectedPackId} onSelect={setSelectedPackId} />
            ) : (
              <Link href="/zukan" className="w-full py-5 rounded-2xl font-black text-[#2b2118] text-lg text-center block active:scale-95 transition-transform bg-white border border-border shadow-sm">
                図鑑を見る
              </Link>
            )}
            {canDraw && (
              <button
                onClick={handleStartDraw}
                className="relative w-full py-5 rounded-2xl font-black text-white text-xl tracking-wider overflow-hidden active:scale-95 transition-transform"
                style={{ background: `linear-gradient(135deg, ${selectedPack.borderColor}, ${selectedPack.bgFrom})`, boxShadow: `0 0 30px ${selectedPack.color}66` }}
              >
                <span className="relative">5枚入りパックを開封する</span>
              </button>
            )}
          </div>
        )}

        {phase === 'drawing' && pendingCards.length > 0 && (
          <div className="flex-1 flex flex-col justify-center">
            <PackOpening card={featureCard} pack={selectedPack} onComplete={() => setPhase('result')} />
          </div>
        )}

        {phase === 'result' && pendingCards.length > 0 && (
          <PackResult
            cards={pendingCards}
            collection={col}
            isNewDraw={isNewDraw}
          />
        )}
      </main>

      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 pb-2 flex justify-center">
          <button onClick={handleDevReset} className="text-[#9b8261] text-[10px] underline">[dev] ドローリセット</button>
        </div>
      )}
    </div>
  );
}

function PackPicker({ selectedPackId, onSelect }: { selectedPackId: PackId; onSelect: (id: PackId) => void }) {
  return (
    <div className="space-y-3">
      <div className="mx-auto w-fit rounded-full border border-gold/70 bg-white/75 px-5 py-2 text-center shadow-[0_0_24px_rgba(184,135,47,0.22)]">
        <span className="text-gold text-xs font-black tracking-widest">本日のパック</span>
        <span className="text-[#2b2118] font-black ml-3">1 / 1</span>
      </div>

      <div
        className="-mx-4 flex gap-5 overflow-x-auto snap-x snap-mandatory px-[calc(50%-104px)] py-3"
        onScroll={event => {
          const el = event.currentTarget;
          const packWidth = 208 + 20;
          const index = Math.round(el.scrollLeft / packWidth);
          const pack = PACKS[Math.max(0, Math.min(PACKS.length - 1, index))];
          if (pack && pack.id !== selectedPackId) onSelect(pack.id);
        }}
      >
        {PACKS.map(pack => {
          const active = selectedPackId === pack.id;
          return (
            <button
              key={pack.id}
              onClick={() => onSelect(pack.id)}
              className={`booster-pack relative h-[316px] w-52 flex-shrink-0 snap-center border-2 text-left transition-all duration-300 ${active ? 'scale-100 opacity-100' : 'scale-90 opacity-55'}`}
              style={{
                background: `linear-gradient(145deg, ${pack.bgFrom}, ${pack.bgTo})`,
                borderColor: pack.borderColor,
                boxShadow: active ? `0 0 38px ${pack.color}66, 0 24px 48px rgba(92,62,27,0.28)` : '0 12px 22px rgba(92,62,27,0.12)',
              }}
            >
              <div className="absolute inset-0 pack-metal" />
              <div className="absolute inset-x-5 top-9 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-center text-[10px] font-black tracking-[0.22em] text-white/85">
                NAGOTOSHA
              </div>
              <div className="absolute inset-x-4 top-20 bottom-24 overflow-hidden rounded-2xl border border-white/25 bg-black/20">
                <div className="h-full w-full pack-food-collage" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/20" />
              </div>
              <div className="absolute inset-x-5 bottom-8 text-center">
                <p className="text-[10px] font-black tracking-[0.22em] text-white/65">{pack.shortName.toUpperCase()} BOOSTER</p>
                <p className="mt-1 text-xl font-black leading-tight text-white drop-shadow">{pack.name}</p>
                <p className="mt-2 text-[10px] font-bold leading-snug text-white/72">{pack.catchCopy}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PackResult({ cards, collection, isNewDraw }: { cards: Card[]; collection: CollectionState; isNewDraw: boolean }) {
  const bestCard = cards[cards.length - 1];
  const bestCfg = RARITY_CONFIG[bestCard.rarity];
  const shareUrl = buildShareUrl(bestCard, collection.streak);

  return (
    <div className="flex flex-col items-center gap-5 animate-fade-up">
      <TosharBubble text="開封結果です。横にスライドして5枚を確認できます。高レアは最後に並びます。" />
      <div className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto snap-x snap-mandatory px-[calc(50%-88px)] py-3">
        <div className="flex gap-5">
          {cards.map((card, index) => {
            const count = collection.cardCounts[card.id] ?? 0;
            const duplicate = count > 1;
            return (
              <div key={`${card.id}-${index}`} className="snap-center flex-shrink-0 flex flex-col items-center gap-3">
                <CardVisual card={card} size="md" owned isNew={isNewDraw && !duplicate} />
                <div className="text-center">
                  <p className="text-xs font-black tracking-widest" style={{ color: RARITY_CONFIG[card.rarity].color }}>
                    {index + 1} / {cards.length} ・ {card.rarity}
                  </p>
                  <p className="text-[#2b2118] font-black text-base">{card.shopName}の{card.name}</p>
                  {duplicate && <p className="text-[#9b8261] text-xs">所持数 {count}枚</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs font-black tracking-widest" style={{ color: bestCfg.color }}>BEST PULL ・ {bestCfg.label}</p>
        <p className="text-[#2b2118] font-black text-xl">{bestCard.name}</p>
      </div>

      <div className="flex gap-3 w-full">
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 rounded-2xl font-black text-[#2b2118] text-sm text-center active:scale-95 bg-white border border-border shadow-sm">
          Xでシェア
        </a>
        <Link href="/zukan" className="flex-1 py-3.5 rounded-2xl font-black text-white text-sm text-center active:scale-95" style={{ background: 'linear-gradient(135deg, #c9412d, #8f2b1f)' }}>
          図鑑を見る
        </Link>
      </div>
      <Link href={`/card/${bestCard.id}`} className="text-[#8a7864] text-xs underline underline-offset-2">
        ベストカード詳細を見る
      </Link>
    </div>
  );
}
