'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, saveCollection, todayStr, yesterdayStr, CollectionState } from '@/lib/storage';
import { hunt } from '@/lib/sticker';
import { Card } from '@/types/card';
import { RARITY_CONFIG } from '@/lib/rarity';
import ScanScreen from '@/components/ScanScreen';
import StickerReveal from '@/components/StickerReveal';
import StickerVisual from '@/components/StickerVisual';

type HomePhase = 'idle' | 'scanning' | 'revealing' | 'result';

export default function HomePage() {
  const [col, setCol]               = useState<CollectionState | null>(null);
  const [phase, setPhase]           = useState<HomePhase>('idle');
  const [foundCards, setFoundCards] = useState<Card[]>([]);
  const [isNewHunt, setIsNewHunt]   = useState(false);

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
      const cards = c.lastDrawnCardIds
        .map(id => CARDS.find(card => card.id === id))
        .filter(Boolean) as Card[];
      setFoundCards(cards);
      setPhase('result');
      setIsNewHunt(false);
    }
  }, []);

  const canHunt = col ? col.lastDrawDate !== todayStr() : false;

  const handleStartHunt = useCallback(() => {
    if (!col || !canHunt) return;
    const cards = hunt(CARDS, col.ownedCardIds, 5);
    const today     = todayStr();
    const yesterday = yesterdayStr();
    const newStreak = col.lastDrawDate === yesterday ? col.streak + 1 : 1;
    const ownedCardIds = Array.from(new Set([...col.ownedCardIds, ...cards.map(c => c.id)]));
    const cardCounts = { ...col.cardCounts };
    cards.forEach(c => { cardCounts[c.id] = (cardCounts[c.id] ?? 0) + 1; });

    const updated: CollectionState = {
      ...col,
      ownedCardIds,
      cardCounts,
      lastDrawDate: today,
      lastDrawnCardId: cards[cards.length - 1]?.id ?? null,
      lastDrawnCardIds: cards.map(c => c.id),
      streak: newStreak,
      bestStreak: Math.max(col.bestStreak, newStreak),
      totalDraws: (col.totalDraws ?? 0) + cards.length,
    };
    setCol(updated);
    saveCollection(updated);
    setFoundCards(cards);
    setIsNewHunt(true);
    setPhase('scanning');
  }, [col, canHunt]);

  const handleDevReset = () => {
    const reset = { ...col!, lastDrawDate: null, lastDrawnCardId: null, lastDrawnCardIds: [] };
    setCol(reset);
    saveCollection(reset);
    setFoundCards([]);
    setPhase('idle');
  };

  if (!col) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#030108]">
        <div className="toshar-avatar animate-toshar-float" />
      </div>
    );
  }

  const ownedCount = col.ownedCardIds.length;

  return (
    <div className="flex flex-col min-h-dvh bg-[#030108]">
      {phase === 'idle' && (
        <HomeScreen
          streak={col.streak}
          ownedCount={ownedCount}
          canHunt={canHunt}
          onHunt={handleStartHunt}
        />
      )}
      {phase === 'scanning' && foundCards.length > 0 && (
        <ScanScreen cards={foundCards} onComplete={() => setPhase('revealing')} />
      )}
      {phase === 'revealing' && foundCards.length > 0 && (
        <StickerReveal cards={foundCards} onComplete={() => setPhase('result')} />
      )}
      {phase === 'result' && foundCards.length > 0 && (
        <HuntResult cards={foundCards} col={col} isNew={isNewHunt} />
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 right-4 z-50">
          <button onClick={handleDevReset}
            className="text-white/20 text-[9px] underline">
            [dev] リセット
          </button>
        </div>
      )}
    </div>
  );
}

/* ── HOME画面 ── */
function HomeScreen({
  streak, ownedCount, canHunt, onHunt,
}: {
  streak: number;
  ownedCount: number;
  canHunt: boolean;
  onHunt: () => void;
}) {
  return (
    <div className="flex flex-col min-h-dvh" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* 背景の召喚陣（静的） */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 55% at 50% 38%, rgba(110,65,10,0.18) 0%, transparent 65%)',
        }} />
        {[90, 148, 206].map((r, i) => (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '42%',
            width: r * 2, height: r * 2, borderRadius: '50%',
            border: `1px solid rgba(175,125,28,${0.10 - i * 0.028})`,
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
        <div style={{
          position: 'absolute', left: '50%', top: '42%',
          width: 340, height: 340, borderRadius: '50%',
          border: '1px solid rgba(175,125,28,0.07)',
          transform: 'translate(-50%, -50%)',
          animation: 'spin-slow 32s linear infinite',
        }} />
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/8 border border-white/12">
          <span className="game-icon" />
          <span className="font-black text-sm text-white/90">{streak}日</span>
          <span className="text-xs text-white/45">連続</span>
        </div>
        <div className="text-center">
          <p className="text-[9px] tracking-[0.18em] font-bold text-white/35">今日のご飯が決まる</p>
          <p className="font-black text-sm tracking-widest text-white/85">名古屋メシ図鑑</p>
        </div>
        <div className="flex items-center gap-1 rounded-full px-3 py-1.5 bg-white/8 border border-white/12">
          <span className="font-black text-sm text-white/90">{ownedCount}</span>
          <span className="text-xs text-white/45">/ {TOTAL_CARDS}</span>
          <span className="game-icon book ml-1" />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 gap-8 pb-24 animate-fade-up">
        {/* 博士の吹き出し */}
        <div className="w-full max-w-xs">
          <div className="relative rounded-2xl px-5 py-4 bg-white/6 border border-white/10"
            style={{ backdropFilter: 'blur(8px)' }}>
            <p className="text-white/80 text-sm font-bold leading-relaxed text-center">
              {canHunt
                ? '今日の名古屋メシを\n探しに行くぞ！'
                : '今日の探索は完了じゃ。\nまた明日な！'}
            </p>
            {/* 吹き出しの矢印 */}
            <div style={{
              position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
              width: 16, height: 8,
              background: 'rgba(255,255,255,0.06)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }} />
          </div>
          {/* 博士アバター */}
          <div className="flex justify-center mt-3">
            <div className="toshar-avatar flex items-center justify-center">
              <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🧑‍🍳</span>
            </div>
          </div>
        </div>

        {/* 探索ボタン or 完了状態 */}
        {canHunt ? (
          <button
            onClick={onHunt}
            className="w-full max-w-xs py-5 rounded-2xl font-black text-white text-lg tracking-wide active:scale-95 transition-transform relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #b8872f, #7a4a14)',
              boxShadow: '0 0 40px rgba(184,135,47,0.45), 0 4px 0 rgba(0,0,0,0.35)',
            }}
          >
            {/* ボタン光沢 */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.14), transparent)',
              pointerEvents: 'none',
            }} />
            <span className="relative">今日の名古屋メシを探索する</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <p className="text-white/40 text-sm text-center">今日の探索は済んでいます</p>
            <Link
              href="/zukan"
              className="w-full py-4 rounded-2xl font-black text-white/70 text-base text-center active:scale-95 transition-transform bg-white/8 border border-white/15"
            >
              シール帳を見る
            </Link>
          </div>
        )}

        {/* シール帳への導線（探索可能時も表示） */}
        {canHunt && (
          <Link href="/zukan" className="text-white/25 text-xs tracking-widest underline underline-offset-2">
            シール帳を開く
          </Link>
        )}
      </main>
    </div>
  );
}

/* ── 探索結果 ── */
function HuntResult({ cards, col, isNew }: { cards: Card[]; col: CollectionState; isNew: boolean }) {
  const topRarity = [...cards].sort((a, b) => {
    const rank: Record<string, number> = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };
    return rank[b.rarity] - rank[a.rarity];
  })[0];
  const cfg = RARITY_CONFIG[topRarity.rarity];

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 select-none"
      style={{
        background: '#030108',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
      }}
    >
      {/* 背景グロウ */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 55% at 50% 50%, ${cfg.glowColor} 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full animate-fade-up">
        {/* タイトル */}
        <div className="text-center">
          <p className="text-[10px] tracking-[0.28em] font-bold mb-1" style={{ color: cfg.color }}>
            NAGOTOSHA MESHI FOUND
          </p>
          <p className="text-white font-black text-2xl">
            {cards.length}枚のシールを発見！
          </p>
        </div>

        {/* シールのミニ表示 */}
        <div className="flex gap-2 flex-wrap justify-center">
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                animation: 'sticker-drop 0.45s cubic-bezier(0.34,1.5,0.64,1) both',
                animationDelay: `${i * 0.09}s`,
              }}
            >
              <StickerVisual
                card={card}
                size="sm"
                discovered
                tilt
                isNew={isNew && (col.cardCounts[card.id] ?? 0) <= 1}
              />
            </div>
          ))}
        </div>

        {/* シール帳へのCTA */}
        <Link
          href="/zukan"
          className="w-full max-w-xs py-4 rounded-2xl font-black text-white text-base text-center active:scale-95 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color}66)`,
            boxShadow: `0 0 30px ${cfg.glowColor}, 0 4px 0 rgba(0,0,0,0.3)`,
          }}
        >
          シール帳で確認する
        </Link>
      </div>
    </div>
  );
}
