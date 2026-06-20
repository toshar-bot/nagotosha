'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, saveCollection, todayStr, yesterdayStr, CollectionState } from '@/lib/storage';
import { drawCard } from '@/lib/draw';
import { RARITY_CONFIG, buildShareUrl } from '@/lib/rarity';
import { Card } from '@/types/card';
import PackOpening from '@/components/PackOpening';
import CardVisual from '@/components/CardVisual';
import TosharBubble from '@/components/TosharBubble';
import DiscoveryBar from '@/components/DiscoveryBar';

type HomePhase = 'idle' | 'tutorial' | 'drawing' | 'result';
type TutorialStep = 0 | 1 | 2;

const TUTORIAL_STEPS = [
  { title: 'ワシはトーシャー博士じゃ！', body: 'ここは「名古屋メシ図鑑 NAGOTOSHA」。名古屋の美食カードを全部集めるんじゃ！', cta: '次へ' },
  { title: '毎日1枚引けるぞ！', body: '1日1枚カードを引いて、10枚全部コンプリートを目指すのぅ。レアカードが出るとドキドキするぞ！', cta: '次へ' },
  { title: 'さっそく引いてみよう！', body: 'パックをタップすれば開封できるんじゃ。さあ、最初の名古屋メシカードを引くんじゃ！', cta: '今すぐ引く！🎴' },
];

export default function HomePage() {
  const [col, setCol] = useState<CollectionState | null>(null);
  const [phase, setPhase] = useState<HomePhase>('idle');
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [isNewDraw, setIsNewDraw] = useState(false);
  const [tutStep, setTutStep] = useState<TutorialStep>(0);

  useEffect(() => {
    const c = loadCollection();
    setCol(c);
    if (!c.tutorialDone) { setPhase('tutorial'); return; }
    if (c.lastDrawDate === todayStr() && c.lastDrawnCardId) {
      const card = CARDS.find(x => x.id === c.lastDrawnCardId) ?? null;
      setPendingCard(card);
      setPhase('result');
      setIsNewDraw(false);
    }
  }, []);

  const canDraw = col ? col.lastDrawDate !== todayStr() : false;

  const handleTutorialNext = () => {
    if (tutStep < 2) { setTutStep((tutStep + 1) as TutorialStep); }
    else {
      const updated = { ...col!, tutorialDone: true };
      setCol(updated); saveCollection(updated); setPhase('idle');
    }
  };

  const handleStartDraw = useCallback(() => {
    if (!col || !canDraw) return;
    const card = drawCard(CARDS, col.ownedCardIds);
    const today = todayStr();
    const yesterday = yesterdayStr();
    const newStreak = col.lastDrawDate === yesterday ? col.streak + 1 : 1;
    const updated: CollectionState = {
      ...col,
      ownedCardIds: col.ownedCardIds.includes(card.id) ? col.ownedCardIds : [...col.ownedCardIds, card.id],
      lastDrawDate: today, lastDrawnCardId: card.id,
      streak: newStreak, bestStreak: Math.max(col.bestStreak, newStreak),
      totalDraws: (col.totalDraws ?? 0) + 1,
    };
    setCol(updated); saveCollection(updated);
    setPendingCard(card); setIsNewDraw(true); setPhase('drawing');
  }, [col, canDraw]);

  const handleDevReset = () => {
    const reset = { ...col!, lastDrawDate: null, lastDrawnCardId: null };
    setCol(reset); saveCollection(reset); setPendingCard(null); setPhase('idle');
  };

  if (!col) return <div className="min-h-dvh flex items-center justify-center"><div className="text-4xl animate-toshar-float">🐻</div></div>;

  const ownedCount = col.ownedCardIds.length;
  const shareUrl = pendingCard ? buildShareUrl(pendingCard, col.streak) : '';
  const cardCfg = pendingCard ? RARITY_CONFIG[pendingCard.rarity] : null;

  return (
    <div className="flex flex-col min-h-dvh pb-20">
      <header className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1.5">
          <span className="text-base">🔥</span>
          <span className="text-white font-black text-sm">{col.streak}日</span>
          <span className="text-gray-500 text-xs">連続</span>
        </div>
        <div className="text-center">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 font-bold uppercase">名古屋メシ図鑑</p>
          <p className="text-white font-black text-base tracking-widest">NAGOTOSHA</p>
        </div>
        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1.5">
          <span className="text-white font-black text-sm">{ownedCount}</span>
          <span className="text-gray-500 text-xs">/ {TOTAL_CARDS}</span>
          <span className="text-xs ml-0.5">📚</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-4 gap-6">
        {phase === 'tutorial' && (
          <div className="flex flex-col gap-6 animate-fade-up">
            <TosharBubble text={`【${tutStep + 1}/3】 ${TUTORIAL_STEPS[tutStep].title}\n${TUTORIAL_STEPS[tutStep].body}`} />
            <div className="flex justify-end">
              <button onClick={handleTutorialNext}
                className="bg-accent text-white font-black px-8 py-3 rounded-2xl text-base active:scale-95 transition-transform"
                style={{ boxShadow: '0 0 20px rgba(230,57,70,0.4)' }}>
                {TUTORIAL_STEPS[tutStep].cta}
              </button>
            </div>
          </div>
        )}

        {phase === 'idle' && (
          <div className="flex flex-col gap-6 animate-fade-up">
            <TosharBubble text={canDraw ? '今日の1枚を引くんじゃ！パックをタップして開封！🎴' : '今日はもう引いたぞ！明日もまた来るんじゃ🐻'} />
            <DiscoveryBar owned={ownedCount} total={TOTAL_CARDS} />
            {canDraw ? (
              <button onClick={handleStartDraw}
                className="relative w-full py-5 rounded-2xl font-black text-white text-xl tracking-wider overflow-hidden active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #e63946, #c2112a)', boxShadow: '0 0 30px rgba(230,57,70,0.5)' }}>
                <span className="relative">🎴 今日の1枚を引く！</span>
              </button>
            ) : (
              <Link href="/zukan"
                className="w-full py-5 rounded-2xl font-black text-white text-lg text-center block active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #1f1f1f, #141414)', border: '2px solid #333' }}>
                📚 図鑑を見る
              </Link>
            )}
          </div>
        )}

        {phase === 'drawing' && pendingCard && (
          <div className="flex-1 flex flex-col justify-center">
            <PackOpening card={pendingCard} onComplete={() => setPhase('result')} />
          </div>
        )}

        {phase === 'result' && pendingCard && cardCfg && (
          <div className="flex flex-col items-center gap-5 animate-fade-up">
            <TosharBubble text={cardCfg.tosharReaction} />
            <div className="relative">
              {isNewDraw && (
                <div className="absolute -inset-8 rounded-full blur-3xl opacity-30 animate-glow-breathe pointer-events-none"
                  style={{ background: cardCfg.color }} />
              )}
              <CardVisual card={pendingCard} size="md" owned isNew={isNewDraw} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-black tracking-widest" style={{ color: cardCfg.color }}>✦ {cardCfg.label} ✦</p>
              <p className="text-white font-black text-xl">{pendingCard.name}</p>
              {!isNewDraw && <p className="text-gray-500 text-xs">今日はすでに引いたカードじゃ🐻</p>}
            </div>
            <div className="flex gap-3 w-full">
              <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3.5 rounded-2xl font-black text-white text-sm text-center active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1a1a1a, #111)', border: '2px solid #333' }}>
                𝕏 でシェア
              </a>
              <Link href="/zukan"
                className="flex-1 py-3.5 rounded-2xl font-black text-white text-sm text-center active:scale-95"
                style={{ background: 'linear-gradient(135deg, #e63946, #c2112a)' }}>
                📚 図鑑を見る
              </Link>
            </div>
            <Link href={`/card/${pendingCard.id}`} className="text-gray-500 text-xs underline underline-offset-2">
              カード詳細を見る →
            </Link>
          </div>
        )}
      </main>

      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 pb-2 flex justify-center">
          <button onClick={handleDevReset} className="text-gray-700 text-[10px] underline">[dev] ドローリセット</button>
        </div>
      )}
    </div>
  );
}