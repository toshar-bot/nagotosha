'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, saveCollection, todayStr, yesterdayStr, CollectionState } from '@/lib/storage';
import { drawCard } from '@/lib/draw';
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
  { title: 'ワシはトーシャー博士じゃ！', body: 'ここは「名古屋メシ図鑑 NAGOTOSHA」。名古屋の美食カードを全部集めるんじゃ！', cta: '次へ' },
  { title: '毎日1枚引けるぞ！', body: '1日1枚カードを引いて、10枚全部コンプリートを目指すのぅ。レアカードが出るとドキドキするぞ！', cta: '次へ' },
  { title: 'さっそく引いてみよう！', body: 'パックをタップすれば開封できるんじゃ。さあ、最初の名古屋メシカードを引くんじゃ！', cta: '今すぐ引く！🎴' },
];

export default function HomePage() {
  const [col, setCol] = useState<CollectionState | null>(null);
  const [phase, setPhase] = useState<HomePhase>('idle');
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [isNewDraw, setIsNewDraw] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<PackId>(DEFAULT_PACK.id);
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
    const card = drawCard(CARDS, col.ownedCardIds, selectedPackId);
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
  }, [col, canDraw, selectedPackId]);

  const handleDevReset = () => {
    const reset = { ...col!, lastDrawDate: null, lastDrawnCardId: null };
    setCol(reset); saveCollection(reset); setPendingCard(null); setPhase('idle');
  };

  if (!col) return <div className="min-h-dvh flex items-center justify-center"><div className="text-4xl animate-toshar-float">🐻</div></div>;

  const ownedCount = col.ownedCardIds.length;
  const shareUrl = pendingCard ? buildShareUrl(pendingCard, col.streak) : '';
  const cardCfg = pendingCard ? RARITY_CONFIG[pendingCard.rarity] : null;
  const selectedPack = getPack(selectedPackId);
  const selectedPackIndex = PACKS.findIndex(pack => pack.id === selectedPackId);
  const prevPack = PACKS[(selectedPackIndex + PACKS.length - 1) % PACKS.length];
  const nextPack = PACKS[(selectedPackIndex + 1) % PACKS.length];

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
            <TosharBubble text={canDraw ? '今日はどのパックにするんじゃ？時間帯で出やすい名古屋メシが少し変わるぞ！' : '今日はもう引いたぞ！明日もまた来るんじゃ🐻'} />
            <DiscoveryBar owned={ownedCount} total={TOTAL_CARDS} />
            {canDraw ? (
              <div className="space-y-4">
                <div className="mx-auto w-fit rounded-full border border-gold/70 bg-black/35 px-5 py-2 text-center shadow-[0_0_24px_rgba(242,184,75,0.28)]">
                  <span className="text-gold text-xs font-black tracking-widest">本日のパック</span>
                  <span className="text-white font-black ml-3">1 / 1</span>
                </div>

                <div className="relative min-h-[318px] flex items-center justify-center overflow-hidden">
                  <button
                    onClick={() => setSelectedPackId(prevPack.id)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-40 rounded-2xl border opacity-55 blur-[0.2px] active:scale-95 transition-transform"
                    style={{
                      background: `linear-gradient(145deg, ${prevPack.bgFrom}, ${prevPack.bgTo})`,
                      borderColor: prevPack.borderColor,
                    }}
                    aria-label={`${prevPack.name}を選ぶ`}
                  >
                    <span className="text-3xl">{prevPack.emoji}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPackId(nextPack.id)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-40 rounded-2xl border opacity-55 blur-[0.2px] active:scale-95 transition-transform"
                    style={{
                      background: `linear-gradient(145deg, ${nextPack.bgFrom}, ${nextPack.bgTo})`,
                      borderColor: nextPack.borderColor,
                    }}
                    aria-label={`${nextPack.name}を選ぶ`}
                  >
                    <span className="text-3xl">{nextPack.emoji}</span>
                  </button>

                  <div
                    className="relative z-10 w-52 h-72 rounded-[1.4rem] border-2 overflow-hidden pack-display shadow-2xl"
                    style={{
                      background: `linear-gradient(145deg, ${selectedPack.bgFrom}, ${selectedPack.bgTo})`,
                      borderColor: selectedPack.borderColor,
                      boxShadow: `0 0 34px ${selectedPack.color}66, 0 24px 48px rgba(0,0,0,0.45)`,
                    }}
                  >
                    <div className="absolute inset-0 pack-foil" />
                    <div className="absolute inset-x-5 top-5 h-6 rounded-full bg-white/15 border border-white/20" />
                    <div className="absolute inset-x-4 top-14 bottom-20 rounded-2xl overflow-hidden border border-white/15 bg-black/25">
                      <div className="h-full w-full pack-food-collage" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-white/10" />
                    </div>
                    <div className="absolute inset-x-4 bottom-5 text-center">
                      <p className="text-5xl mb-1">{selectedPack.emoji}</p>
                      <p className="text-white font-black text-lg leading-tight">{selectedPack.name}</p>
                      <p className="text-[10px] text-white/60 font-bold mt-1">{selectedPack.catchCopy}</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleStartDraw}
                  className="relative w-full py-5 rounded-2xl font-black text-white text-xl tracking-wider overflow-hidden active:scale-95 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${selectedPack.borderColor}, ${selectedPack.bgFrom})`, boxShadow: `0 0 30px ${selectedPack.color}66` }}>
                  <span className="relative">▲ タップで開ける ▲</span>
                </button>
              </div>
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
            <PackOpening card={pendingCard} pack={selectedPack} onComplete={() => setPhase('result')} />
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
