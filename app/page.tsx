'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, saveCollection, todayStr, yesterdayStr, CollectionState } from '@/lib/storage';
import { drawPack } from '@/lib/draw';
import { RARITY_CONFIG, buildShareUrl } from '@/lib/rarity';
import { DEFAULT_PACK, PACKS, PackConfig, PackId, getPack } from '@/lib/packs';
import { Card, Rarity } from '@/types/card';
import PackOpening from '@/components/PackOpening';
import CardVisual from '@/components/CardVisual';
import TosharBubble from '@/components/TosharBubble';
import DiscoveryBar from '@/components/DiscoveryBar';

type HomePhase = 'idle' | 'tutorial' | 'drawing' | 'result';
type TutorialStep = 0 | 1 | 2;

const TUTORIAL_STEPS = [
  {
    title: 'わしはトーシャー博士じゃ！',
    body: 'ここは名古屋メシ図鑑 NAGOTOSHA。\n名古屋の美食カードを集めるのじゃ。\n集めるほど、次に行きたいお店リストが育っていくぞ。',
    cta: '次へ',
  },
  {
    title: '1日1パック開封じゃ',
    body: '1パックには5枚入り。\nかぶりもあるが、所持数が増えるのもコレクションの味じゃ。\n高レアは最後に出るから、めくる瞬間まで楽しむのじゃ。',
    cta: '次へ',
  },
  {
    title: '旅先の候補も増えるぞ',
    body: 'カードには店名とエリアも記録される。\n図鑑が埋まるほど、名古屋で食べたい一皿が見つかるのじゃ。',
    cta: '始める',
  },
];

const HIGH_RARITIES: Rarity[] = ['SR', 'SSR', 'UR'];

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
    return <div className="min-h-dvh flex items-center justify-center"><div className="toshar-avatar animate-toshar-float" /></div>;
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
            <TosharBubble text={canDraw ? '開封したいパックを選ぶのじゃ。\nどのパックにするか、吟味するのじゃぞ。' : '今日は開封済みじゃ。\n結果を見返すか、図鑑を確認するのじゃ。'} />
            <DiscoveryBar owned={ownedCount} total={TOTAL_CARDS} />
            {canDraw ? (
              <>
                <PackPicker selectedPackId={selectedPackId} onSelect={setSelectedPackId} />
                <button
                  onClick={handleStartDraw}
                  className="relative w-full py-5 rounded-2xl font-black text-white text-xl tracking-wider overflow-hidden active:scale-95 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${selectedPack.borderColor}, ${selectedPack.bgTo})`, boxShadow: `0 0 30px ${selectedPack.color}55` }}
                >
                  <span className="relative">5枚入りパックを開封する</span>
                </button>
              </>
            ) : (
              <Link href="/zukan" className="w-full py-5 rounded-2xl font-black text-[#2b2118] text-lg text-center block active:scale-95 transition-transform bg-white border border-border shadow-sm">
                図鑑を見る
              </Link>
            )}
          </div>
        )}

        {phase === 'drawing' && pendingCards.length > 0 && (
          <div className="flex-1 flex flex-col justify-center">
            <PackOpening card={featureCard} pack={selectedPack} onComplete={() => setPhase('result')} />
          </div>
        )}

        {phase === 'result' && pendingCards.length > 0 && (
          <PackResult cards={pendingCards} collection={col} isNewDraw={isNewDraw} />
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const slides = useMemo(() => [PACKS[PACKS.length - 1], ...PACKS, PACKS[0]], []);
  const realIndex = PACKS.findIndex(pack => pack.id === selectedPackId);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = 232;
    el.scrollLeft = slide * (realIndex + 1);
  }, [realIndex]);

  const normalize = (virtualIndex: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = 232;
    if (virtualIndex === 0) {
      el.scrollTo({ left: slide * PACKS.length, behavior: 'auto' });
      onSelect(PACKS[PACKS.length - 1].id);
    } else if (virtualIndex === slides.length - 1) {
      el.scrollTo({ left: slide, behavior: 'auto' });
      onSelect(PACKS[0].id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="mx-auto w-fit rounded-full border border-gold/70 bg-white/75 px-5 py-2 text-center shadow-[0_0_24px_rgba(184,135,47,0.22)]">
        <span className="text-gold text-xs font-black tracking-widest">本日のパック</span>
        <span className="text-[#2b2118] font-black ml-3">1 / 1</span>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 flex gap-6 overflow-x-auto snap-x snap-mandatory px-[calc(50%-104px)] py-5"
        onScroll={event => {
          const el = event.currentTarget;
          const slide = 232;
          const virtualIndex = Math.round(el.scrollLeft / slide);
          const normalizedIndex = (virtualIndex - 1 + PACKS.length) % PACKS.length;
          const pack = PACKS[normalizedIndex];
          if (pack && pack.id !== selectedPackId) onSelect(pack.id);
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => normalize(virtualIndex), 120);
        }}
      >
        {slides.map((pack, index) => (
          <PackSlide key={`${pack.id}-${index}`} pack={pack} active={pack.id === selectedPackId} onClick={() => onSelect(pack.id)} />
        ))}
      </div>
    </div>
  );
}

function PackSlide({ pack, active, onClick }: { pack: PackConfig; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-shrink-0 snap-center transition-all duration-300 outline-none border-0 bg-transparent p-0 ${active ? 'scale-100 opacity-100' : 'scale-88 opacity-50'}`}
      style={{
        filter: active ? `drop-shadow(0 0 22px ${pack.color}88) drop-shadow(0 18px 36px rgba(0,0,0,0.38))` : 'drop-shadow(0 8px 16px rgba(0,0,0,0.22))',
      }}
    >
      <img
        src={pack.imageUrl}
        alt={pack.name}
        className={`pack-img w-52 h-auto object-contain select-none${active ? ' pack-float' : ''}`}
        draggable={false}
      />
    </button>
  );
}

function PackResult({ cards, collection, isNewDraw }: { cards: Card[]; collection: CollectionState; isNewDraw: boolean }) {
  const [current, setCurrent] = useState(0);
  const [revealedHighRare, setRevealedHighRare] = useState<Record<number, boolean>>({});
  const touchStart = useRef<number | null>(null);
  const currentCard = cards[current];
  const currentCfg = RARITY_CONFIG[currentCard.rarity];
  const shareUrl = buildShareUrl(currentCard, collection.streak);
  const isCurrentHighRare = HIGH_RARITIES.includes(currentCard.rarity);
  const shouldCelebrate = isCurrentHighRare && !!revealedHighRare[current];

  useEffect(() => {
    if (!isCurrentHighRare || revealedHighRare[current]) return;
    const timer = window.setTimeout(() => {
      setRevealedHighRare(prev => ({ ...prev, [current]: true }));
    }, 760);
    return () => window.clearTimeout(timer);
  }, [current, isCurrentHighRare, revealedHighRare]);

  const move = (delta: number) => {
    setCurrent(index => (index + delta + cards.length) % cards.length);
  };

  return (
    <div className="flex flex-col items-center gap-5 animate-fade-up">
      <TosharBubble text="開封結果じゃ。\n左右にスワイプして、5枚を1枚ずつ確認するのじゃ。\n高レアはカードが見えた瞬間にだけ演出が走るぞ。" />

      <div className="w-full flex items-center justify-center gap-4">
        <button className="w-11 h-11 rounded-full bg-white border border-border shadow-sm font-black text-[#2b2118]" onClick={() => move(-1)}>
          &lt;
        </button>
        <span className="text-[#8a7864] text-sm font-black">{current + 1} / {cards.length}</span>
        <button className="w-11 h-11 rounded-full bg-white border border-border shadow-sm font-black text-[#2b2118]" onClick={() => move(1)}>
          &gt;
        </button>
      </div>

      <div
        className="relative h-[356px] w-full overflow-hidden"
        onTouchStart={event => {
          touchStart.current = event.touches[0].clientX;
        }}
        onTouchEnd={event => {
          if (touchStart.current === null) return;
          const dx = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
          touchStart.current = null;
        }}
      >
        {shouldCelebrate && (
          <div className="rare-reveal-burst pointer-events-none" style={{ ['--rare-color' as string]: currentCfg.color }}>
            {/* 同心リング3枚 */}
            <div className="pd-ring" style={{ width: '55vmax',  height: '55vmax',  animationDelay: '0.06s' }} />
            <div className="pd-ring" style={{ width: '95vmax',  height: '95vmax',  animationDelay: '0.16s' }} />
            <div className="pd-ring" style={{ width: '142vmax', height: '142vmax', animationDelay: '0.28s' }} />
            {/* スパーク8方向 */}
            {([
              [-152, -152, 'white'], [0, -188, currentCfg.color],
              [152, -152, 'white'],  [188, 0,   currentCfg.color],
              [152,  152, 'white'],  [0,  188,  currentCfg.color],
              [-152, 152, 'white'],  [-188, 0,  currentCfg.color],
            ] as [number, number, string][]).map(([sx, sy, bg], i) => (
              <div
                key={i}
                className="pd-spark"
                style={{
                  ['--sx' as string]: `${sx}px`,
                  ['--sy' as string]: `${sy}px`,
                  background: bg,
                  boxShadow: `0 0 12px ${currentCfg.color}, 0 0 24px ${bg}`,
                  animationDelay: `${0.09 + i * 0.022}s`,
                }}
              />
            ))}
            {/* レアリティバッジ */}
            <div className="pd-badge">{currentCard.rarity}</div>
          </div>
        )}

        {cards.map((card, index) => {
          let delta = index - current;
          if (delta > cards.length / 2) delta -= cards.length;
          if (delta < -cards.length / 2) delta += cards.length;
          const visible = Math.abs(delta) <= 2;
          const cfg = RARITY_CONFIG[card.rarity];
          const count = collection.cardCounts[card.id] ?? 0;
          const duplicate = count > 1;
          const isHighRareCard = HIGH_RARITIES.includes(card.rarity);
          const isHiddenHighRare = isHighRareCard && !revealedHighRare[index];

          return (
            <div
              key={`${card.id}-${index}`}
              className={`absolute left-1/2 top-3 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{
                transform: `translateX(calc(-50% + ${delta * 34}px)) rotate(${delta * 5}deg) scale(${delta === 0 ? 1 : 0.92})`,
                /* レア演出中はオーバーレイ(z:60)より上に出す */
                zIndex: delta === 0 && shouldCelebrate && index === current ? 65 : 20 - Math.abs(delta),
                filter: delta === 0 ? 'none' : 'brightness(0.78)',
              }}
              onClick={() => setCurrent(index)}
            >
              <div className={delta === 0 && shouldCelebrate && index === current ? 'card-rare-zoom' : ''}>
                <CardVisual
                  card={card}
                  size={delta === 0 && shouldCelebrate && index === current ? 'lg' : 'md'}
                  owned
                  isNew={isNewDraw && !duplicate}
                  rarityRevealed={!isHiddenHighRare}
                />
              </div>
              {delta === 0 && (
                <div className="mt-3 text-center">
                  {isHiddenHighRare ? (
                    <p className="text-xs font-black tracking-widest text-[#9b8261]">カード確認中...</p>
                  ) : (
                    <p className="text-xs font-black tracking-widest" style={{ color: cfg.color }}>
                      {card.rarity} / {cfg.label}
                    </p>
                  )}
                  <p className="text-[#2b2118] font-black text-base">{card.shopName}の{card.name}</p>
                  {duplicate && <p className="text-[#9b8261] text-xs">所持数 {count}枚</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 w-full">
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 rounded-2xl font-black text-[#2b2118] text-sm text-center active:scale-95 bg-white border border-border shadow-sm">
          Xでシェア
        </a>
        <Link href="/zukan" className="flex-1 py-3.5 rounded-2xl font-black text-white text-sm text-center active:scale-95" style={{ background: 'linear-gradient(135deg, #c9412d, #8f2b1f)' }}>
          図鑑を見る
        </Link>
      </div>
      <Link href={`/card/${currentCard.id}`} className="text-[#8a7864] text-xs underline underline-offset-2">
        このカードの詳細を見る
      </Link>
    </div>
  );
}
