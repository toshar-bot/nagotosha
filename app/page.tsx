'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, saveCollection, todayStr, yesterdayStr, CollectionState } from '@/lib/storage';
import { drawPack } from '@/lib/draw';
import { RARITY_CONFIG, buildShareUrl } from '@/lib/rarity';
import { DEFAULT_PACK, PACKS, PackConfig, PackId, getPack } from '@/lib/packs';
import { Card, Rarity } from '@/types/card';
import PackOpening from '@/components/PackOpening';
import CardReveal from '@/components/CardReveal';
import CardVisual from '@/components/CardVisual';

type HomePhase = 'idle' | 'drawing' | 'revealing' | 'result';

const HIGH_RARITIES: Rarity[] = ['SR', 'SSR', 'UR'];

export default function HomePage() {
  const [col, setCol] = useState<CollectionState | null>(null);
  const [phase, setPhase] = useState<HomePhase>('idle');
  const [pendingCards, setPendingCards] = useState<Card[]>([]);
  const [isNewDraw, setIsNewDraw] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<PackId>(DEFAULT_PACK.id);

  useEffect(() => {
    const c = loadCollection();
    if (!c.tutorialDone) {
      const updated = { ...c, tutorialDone: true };
      saveCollection(updated);
      setCol(updated);
    } else {
      setCol(c);
    }
    if (c.lastDrawDate === todayStr() && c.lastDrawnCardIds.length) {
      setPendingCards(c.lastDrawnCardIds.map(id => CARDS.find(card => card.id === id)).filter(Boolean) as Card[]);
      setPhase('result');
      setIsNewDraw(false);
    }
  }, []);

  const canDraw = col ? col.lastDrawDate !== todayStr() : false;

  const handleStartDraw = useCallback(() => {
    if (!col || !canDraw) return;
    const cards = drawPack(CARDS, col.ownedCardIds, selectedPackId, 5);
    const today = todayStr();
    const yesterday = yesterdayStr();
    const newStreak = col.lastDrawDate === yesterday ? col.streak + 1 : 1;
    const ownedCardIds = Array.from(new Set([...col.ownedCardIds, ...cards.map(card => card.id)]));
    const cardCounts = { ...col.cardCounts };
    cards.forEach(card => { cardCounts[card.id] = (cardCounts[card.id] ?? 0) + 1; });

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
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0c0804]">
        <div className="toshar-avatar animate-toshar-float" />
      </div>
    );
  }

  const ownedCount = col.ownedCardIds.length;
  const selectedPack = getPack(selectedPackId);

  return (
    <div className="flex flex-col min-h-dvh pb-20 bg-[#0c0804]">
      {/* ヘッダー (常に暗いテーマ) */}
      <header className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0 relative z-10">
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/10 border border-white/15">
          <span className="game-icon" />
          <span className="font-black text-sm text-white/90">{col.streak}日</span>
          <span className="text-xs text-white/50">連続</span>
        </div>
        <div className="text-center">
          <p className="text-[9px] tracking-[0.18em] font-bold text-white/40">今日のご飯が決まる</p>
          <p className="font-black text-sm tracking-widest text-white/90">名古屋メシ図鑑</p>
        </div>
        <div className="flex items-center gap-1 rounded-full px-3 py-1.5 bg-white/10 border border-white/15">
          <span className="font-black text-sm text-white/90">{ownedCount}</span>
          <span className="text-xs text-white/50">/ {TOTAL_CARDS}</span>
          <span className="game-icon book ml-1" />
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {phase === 'idle' && (
          <PackHero
            selectedPack={selectedPack}
            selectedPackId={selectedPackId}
            canDraw={canDraw}
            onSelect={setSelectedPackId}
            onOpen={handleStartDraw}
          />
        )}

        {phase === 'drawing' && (
          <PackOpening pack={selectedPack} onComplete={() => setPhase('revealing')} />
        )}

        {phase === 'revealing' && pendingCards.length > 0 && (
          <CardReveal cards={pendingCards} onComplete={() => setPhase('result')} />
        )}

        {phase === 'result' && pendingCards.length > 0 && (
          <PackResult cards={pendingCards} collection={col} isNewDraw={isNewDraw} />
        )}
      </main>

      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 pb-2 flex justify-center relative z-10">
          <button onClick={handleDevReset} className="text-white/25 text-[10px] underline">[dev] ドローリセット</button>
        </div>
      )}
    </div>
  );
}

/* ── パックヒーロー ── */

function PackHero({
  selectedPack,
  selectedPackId,
  canDraw,
  onSelect,
  onOpen,
}: {
  selectedPack: PackConfig;
  selectedPackId: PackId;
  canDraw: boolean;
  onSelect: (id: PackId) => void;
  onOpen: () => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const idx = PACKS.findIndex(p => p.id === selectedPackId);

  function handleSwipe(dx: number) {
    if (Math.abs(dx) < 44) return;
    const next = dx < 0 ? (idx + 1) % PACKS.length : (idx - 1 + PACKS.length) % PACKS.length;
    onSelect(PACKS[next].id);
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-up"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return;
        handleSwipe(e.changedTouches[0].clientX - touchStartX.current);
        touchStartX.current = null;
      }}
    >
      {/* パック名 */}
      <div className="text-center">
        <p className="text-white/35 text-[10px] font-bold tracking-[0.22em] uppercase">{selectedPack.shortName} Pack</p>
        <p className="text-white/60 text-xs mt-0.5">{selectedPack.catchCopy}</p>
      </div>

      {/* ヒーローパック画像 */}
      <div
        className="relative"
        onClick={canDraw ? onOpen : undefined}
        style={{ cursor: canDraw ? 'pointer' : 'default' }}
      >
        <img
          src={selectedPack.imageUrl}
          alt={selectedPack.name}
          className={`object-contain${canDraw ? ' pack-float' : ''}`}
          draggable={false}
          loading="eager"
          style={{
            width: 'min(72vw, 310px)',
            filter: `drop-shadow(0 0 56px ${selectedPack.color}aa) drop-shadow(0 32px 64px rgba(0,0,0,0.85))`,
            opacity: canDraw ? 1 : 0.45,
          }}
        />
        {!canDraw && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/30 text-xs font-black tracking-widest">開封済み</span>
          </div>
        )}
      </div>

      {/* パック切り替えドット */}
      <div className="flex gap-1.5">
        {PACKS.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`rounded-full transition-all duration-300 ${p.id === selectedPackId ? 'w-5 h-1.5 bg-white/70' : 'w-1.5 h-1.5 bg-white/22'}`}
          />
        ))}
      </div>

      {/* アクションヒント */}
      {canDraw ? (
        <p className="text-white/25 text-[11px] tracking-widest">タップして開封 ／ 横スワイプでパック変更</p>
      ) : (
        <Link
          href="/zukan"
          className="px-8 py-3 rounded-2xl font-black text-white/70 text-sm text-center bg-white/8 border border-white/15 active:scale-95 transition-transform"
        >
          図鑑を見る
        </Link>
      )}
    </div>
  );
}

/* ── 結果画面 ── */

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

  const move = (delta: number) => setCurrent(i => (i + delta + cards.length) % cards.length);

  return (
    <div className="flex flex-col items-center gap-5 px-4 pt-2 pb-4 animate-fade-up">
      <div className="w-full flex items-center justify-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 font-black text-white/70 text-sm" onClick={() => move(-1)}>
          ‹
        </button>
        <span className="text-white/50 text-sm font-black">{current + 1} / {cards.length}</span>
        <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 font-black text-white/70 text-sm" onClick={() => move(1)}>
          ›
        </button>
      </div>

      <div
        className="relative h-[356px] w-full overflow-hidden"
        onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touchStart.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
          touchStart.current = null;
        }}
      >
        {shouldCelebrate && (
          <div className="rare-reveal-burst pointer-events-none" style={{ ['--rare-color' as string]: currentCfg.color }}>
            <div className="pd-ring" style={{ width: '55vmax', height: '55vmax', animationDelay: '0.06s' }} />
            <div className="pd-ring" style={{ width: '95vmax', height: '95vmax', animationDelay: '0.16s' }} />
            <div className="pd-ring" style={{ width: '142vmax', height: '142vmax', animationDelay: '0.28s' }} />
            {([
              [-152, -152, 'white'], [0, -188, currentCfg.color],
              [152, -152, 'white'], [188, 0, currentCfg.color],
              [152, 152, 'white'], [0, 188, currentCfg.color],
              [-152, 152, 'white'], [-188, 0, currentCfg.color],
            ] as [number, number, string][]).map(([sx, sy, bg], i) => (
              <div key={i} className="pd-spark" style={{
                ['--sx' as string]: `${sx}px`,
                ['--sy' as string]: `${sy}px`,
                background: bg,
                boxShadow: `0 0 12px ${currentCfg.color}, 0 0 24px ${bg}`,
                animationDelay: `${0.09 + i * 0.022}s`,
              }} />
            ))}
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
                    <p className="text-xs font-black tracking-widest text-white/40">確認中...</p>
                  ) : (
                    <p className="text-xs font-black tracking-widest" style={{ color: cfg.color }}>
                      {card.rarity} / {cfg.label}
                    </p>
                  )}
                  <p className="text-white font-black text-base">{card.shopName}の{card.name}</p>
                  {duplicate && <p className="text-white/40 text-xs">所持数 {count}枚</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 w-full">
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3.5 rounded-2xl font-black text-white/70 text-sm text-center active:scale-95 bg-white/8 border border-white/15"
        >
          Xでシェア
        </a>
        <Link
          href="/zukan"
          className="flex-1 py-3.5 rounded-2xl font-black text-white text-sm text-center active:scale-95"
          style={{ background: `linear-gradient(135deg, ${RARITY_CONFIG[currentCard.rarity].color}cc, ${RARITY_CONFIG[currentCard.rarity].color}66)` }}
        >
          図鑑を見る
        </Link>
      </div>
      <Link href={`/card/${currentCard.id}`} className="text-white/30 text-xs underline underline-offset-2">
        このカードの詳細を見る
      </Link>
    </div>
  );
}
