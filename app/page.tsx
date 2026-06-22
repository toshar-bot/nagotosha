'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ── 静的データ ── */

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'イベント',
    title: '覚王山アパートメント\n秋の手仕事市',
    sub: '10/19(土)・20(日) 10:00〜17:00',
    area: '覚王山',
    bg: 'linear-gradient(135deg, #e8f4fd 0%, #b8d9f0 40%, #7fb3d3 100%)',
    accent: '#1d5b73',
  },
  {
    id: 2,
    tag: '新店',
    title: 'NEW OPEN\nスペシャルティコーヒー専門店',
    sub: '大須に新たな一杯が誕生',
    area: '大須',
    bg: 'linear-gradient(135deg, #fdf6e8 0%, #f0d9a8 40%, #d4a855 100%)',
    accent: '#7a4a14',
  },
  {
    id: 3,
    tag: '話題',
    title: '名古屋港水族館\nシャチのパフォーマンス再開',
    sub: '週末は早めの来館がおすすめ',
    area: '名古屋港',
    bg: 'linear-gradient(135deg, #e8f8f0 0%, #a8dfc0 40%, #4aab7e 100%)',
    accent: '#1a6b47',
  },
];

const MOOD_ITEMS = [
  { label: '今日', key: 'today' },
  { label: '今週末', key: 'weekend' },
  { label: '雨の日', key: 'rainy' },
  { label: 'ひとりで', key: 'solo' },
  { label: 'デート', key: 'date' },
  { label: '手土産', key: 'gift' },
];

const FEATURED_ARTICLES = [
  {
    id: 'f1',
    label: '注目',
    isNew: false,
    tag: 'グルメ',
    title: '矢場とんの新メニュー、みそかつバーガーが話題に',
    area: '矢場町',
    bg: 'linear-gradient(135deg, #fde8e8 0%, #f0b8a0 100%)',
    accent: '#c9412d',
  },
  {
    id: 'f2',
    label: 'NEW!',
    isNew: true,
    tag: '新店',
    title: '錦3丁目に自家製パスタの小さな名店がオープン',
    area: '錦',
    bg: 'linear-gradient(135deg, #e8edf8 0%, #b0c0e8 100%)',
    accent: '#1d3b73',
  },
  {
    id: 'f3',
    label: '注目',
    isNew: false,
    tag: 'イベント',
    title: '栄・久屋大通で光のインスタレーション開催中',
    area: '栄',
    bg: 'linear-gradient(135deg, #f8f0e8 0%, #e8c870 100%)',
    accent: '#7a5a14',
  },
  {
    id: 'f4',
    label: 'NEW!',
    isNew: true,
    tag: 'カフェ',
    title: '覚王山に映える「白いクリームソーダ」のカフェ',
    area: '覚王山',
    bg: 'linear-gradient(135deg, #e8f8f0 0%, #a8e8c8 100%)',
    accent: '#1a5a3a',
  },
];

const RANKING = [
  {
    rank: 1,
    title: '平日でも行列！大須の台湾まぜそば新店が衝撃の旨さ',
    summary: '開店2週間で行列必至の注目店',
    area: '大須',
    date: '10/15',
    bg: 'linear-gradient(120deg, #fde8e8, #f8c0a0)',
  },
  {
    rank: 2,
    title: '名古屋城二の丸東庭園、紅葉の見頃は今週末',
    summary: '入場無料・アクセスも抜群',
    area: '名古屋城',
    date: '10/14',
    bg: 'linear-gradient(120deg, #fdf0e0, #f0d090)',
  },
  {
    rank: 3,
    title: '覚王山アパートメント秋市、出店者リスト公開',
    summary: '今年は60組以上が出店予定',
    area: '覚王山',
    date: '10/13',
    bg: 'linear-gradient(120deg, #e8f0fd, #b0c8f0)',
  },
  {
    rank: 4,
    title: '栄・コメダ珈琲創業地の限定メニューが復活',
    summary: '懐かしの味が週末限定で登場',
    area: '栄',
    date: '10/12',
    bg: 'linear-gradient(120deg, #e8fdf0, #a0e0c0)',
  },
];

const CATEGORY_TABS = ['今日', 'イベント', '新店', '週末', 'エリア'];

/* ── メインページ ── */

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (isSliding) return;
    setIsSliding(true);
    setHeroIndex(idx);
    setTimeout(() => setIsSliding(false), 400);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const resetInterval = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo(idx);
    intervalRef.current = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
  };

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #f8f9fa 30%, #ffffff 100%)' }}
    >
      {/* ── ヘッダー ── */}
      <Header />

      {/* ── カテゴリタブ ── */}
      <CategoryTabs tabs={CATEGORY_TABS} active={activeTab} onChange={setActiveTab} />

      {/* ── スクロール領域 ── */}
      <main className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* ── ヒーローカルーセル ── */}
        <section className="px-4 pt-4 pb-2">
          <div className="relative overflow-hidden rounded-2xl" style={{ height: 220 }}>
            {/* スライドトラック */}
            <div
              ref={carouselRef}
              className="flex h-full"
              style={{
                transform: `translateX(calc(-${heroIndex * 90}% - ${heroIndex * 8}px))`,
                transition: 'transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)',
                width: `${HERO_SLIDES.length * 90 + (HERO_SLIDES.length - 1) * 0.8 + 10}%`,
              }}
            >
              {HERO_SLIDES.map((slide, i) => (
                <div
                  key={slide.id}
                  className="relative flex-shrink-0 rounded-2xl overflow-hidden mr-3"
                  style={{
                    width: '90%',
                    background: slide.bg,
                    opacity: i === heroIndex ? 1 : 0.72,
                    transform: i === heroIndex ? 'scale(1)' : 'scale(0.97)',
                    transition: 'opacity 0.4s, transform 0.4s',
                  }}
                >
                  {/* グラデーション装飾 */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 80% 60% at 80% 30%, rgba(255,255,255,0.55) 0%, transparent 65%)',
                    pointerEvents: 'none',
                  }} />
                  {/* テキスト */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <span
                      className="inline-block self-start text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full mb-2"
                      style={{ background: slide.accent, color: '#fff', letterSpacing: '0.14em' }}
                    >
                      {slide.tag}
                    </span>
                    <p
                      className="font-black text-lg leading-snug whitespace-pre-line"
                      style={{ color: slide.accent }}
                    >
                      {slide.title}
                    </p>
                    <p className="text-xs mt-1.5 font-medium" style={{ color: `${slide.accent}cc` }}>
                      {slide.sub}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${slide.accent}18`, color: slide.accent }}
                      >
                        {slide.area}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {/* 次カードがちら見えするスペーサー */}
              <div style={{ width: '5%', flexShrink: 0 }} />
            </div>

            {/* ドットインジケーター + 自動スライド表示 */}
            <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none">
              <div className="flex gap-1.5">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    className="pointer-events-auto"
                    onClick={() => resetInterval(i)}
                    style={{
                      width: i === heroIndex ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === heroIndex ? HERO_SLIDES[heroIndex].accent : 'rgba(0,0,0,0.18)',
                      transition: 'width 0.3s, background 0.3s',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-bold tracking-widest" style={{ color: 'rgba(0,0,0,0.32)' }}>
                自動でスライド中
              </span>
            </div>
          </div>
        </section>

        {/* ── 今日の気分で探す ── */}
        <section className="px-4 pt-5 pb-2">
          <SectionTitle>今日の気分で探す</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5 mt-3">
            {MOOD_ITEMS.map((item) => (
              <button
                key={item.key}
                className="rounded-xl py-3.5 text-sm font-bold text-center active:scale-95 transition-transform"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e8edf5',
                  color: '#1a2b4a',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── みんなの注目記事 ── */}
        <section className="pt-5 pb-2">
          <div className="px-4">
            <SectionTitle>みんなの注目記事</SectionTitle>
          </div>
          <div
            className="flex gap-3 mt-3 px-4 overflow-x-auto"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingRight: 16 }}
          >
            {FEATURED_ARTICLES.map((art) => (
              <FeaturedCard key={art.id} article={art} />
            ))}
          </div>
        </section>

        {/* ── 人気ランキング ── */}
        <section className="px-4 pt-5 pb-4">
          <SectionTitle>人気ランキング</SectionTitle>
          <div className="flex flex-col gap-3 mt-3">
            {RANKING.map((item) => (
              <RankingItem key={item.rank} item={item} />
            ))}
          </div>
        </section>

        {/* カードゲームへの導線 */}
        <div className="px-4 pb-2">
          <Link
            href="/game"
            className="flex items-center justify-between px-5 py-4 rounded-2xl active:scale-98 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1d3b73 0%, #2a5298 100%)',
              boxShadow: '0 4px 16px rgba(29,59,115,0.22)',
            }}
          >
            <div>
              <p className="text-[10px] font-bold tracking-widest text-white/60 mb-0.5">NAGOTOSHA GAME</p>
              <p className="text-white font-black text-base">名古屋メシ図鑑を開く</p>
            </div>
            <span className="text-white/60 text-xl font-thin">›</span>
          </Link>
        </div>

      </main>
    </div>
  );
}

/* ── サブコンポーネント ── */

function Header() {
  return (
    <header
      className="sticky top-0 z-30 flex-shrink-0"
      style={{
        background: 'rgba(240,247,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* ブランド */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d5b73, #2a8298)' }}
          >
            <span className="text-white font-black text-xs tracking-tight">NT</span>
          </div>
          <div>
            <p className="font-black text-base leading-none tracking-tight text-[#0f1e2e]">NAGOTOSHA</p>
            <p className="text-[9px] font-bold tracking-widest text-[#1d5b73] leading-none mt-0.5">
              名古屋シティガイド
            </p>
          </div>
        </div>

        {/* 右ナビ */}
        <div className="flex items-center gap-2.5">
          {/* 検索 */}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: '#ffffff', border: '1.5px solid #e0e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            aria-label="検索"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a6a8a" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="17" y1="17" x2="22" y2="22" />
            </svg>
          </button>
          {/* メニュー */}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: '#ffffff', border: '1.5px solid #e0e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            aria-label="メニュー"
          >
            <svg width="16" height="13" viewBox="0 0 18 14" fill="none" stroke="#4a6a8a" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="2" x2="17" y2="2" />
              <line x1="1" y1="7" x2="17" y2="7" />
              <line x1="1" y1="12" x2="17" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* サブコピー */}
      <div className="px-4 pb-2">
        <p className="text-[10px] font-medium text-[#4a6a8a] tracking-wide">名古屋情報局 とーしゃー</p>
      </div>
    </header>
  );
}

function CategoryTabs({ tabs, active, onChange }: {
  tabs: string[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div
      className="flex gap-1 px-4 py-2.5 overflow-x-auto flex-shrink-0"
      style={{
        background: 'rgba(240,247,255,0.95)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        scrollbarWidth: 'none',
      }}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onChange(i)}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95"
          style={i === active ? {
            background: '#1d5b73',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(29,91,115,0.32)',
          } : {
            background: '#ffffff',
            color: '#4a6a8a',
            border: '1.5px solid #dce8f0',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-5 rounded-full" style={{ background: '#1d5b73' }} />
      <h2 className="text-base font-black text-[#0f1e2e] tracking-tight">{children}</h2>
    </div>
  );
}

function FeaturedCard({ article }: { article: typeof FEATURED_ARTICLES[number] }) {
  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: 168,
        scrollSnapAlign: 'start',
        boxShadow: '0 3px 14px rgba(0,0,0,0.09)',
      }}
    >
      {/* ビジュアル部分 */}
      <div
        className="relative"
        style={{ height: 100, background: article.bg }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 65%)',
        }} />
        {/* ラベル */}
        <span
          className="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider"
          style={article.isNew
            ? { background: '#c9412d', color: '#fff' }
            : { background: article.accent, color: '#fff' }
          }
        >
          {article.label}
        </span>
        {/* タグ */}
        <span
          className="absolute bottom-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.82)', color: article.accent }}
        >
          {article.tag}
        </span>
      </div>
      {/* テキスト部分 */}
      <div className="px-3 py-3" style={{ background: '#ffffff' }}>
        <p className="text-xs font-bold text-[#0f1e2e] leading-snug line-clamp-2">{article.title}</p>
        <p className="text-[10px] font-medium mt-1.5" style={{ color: '#8a9ab0' }}>{article.area}</p>
      </div>
    </div>
  );
}

function RankingItem({ item }: { item: typeof RANKING[number] }) {
  const rankColors: Record<number, string> = {
    1: '#c9412d',
    2: '#1d5b73',
    3: '#7a5a14',
    4: '#4a6a8a',
  };
  const color = rankColors[item.rank] ?? '#4a6a8a';

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 active:scale-[0.99] transition-transform"
      style={{ background: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #f0f4f8' }}
    >
      {/* サムネイル風 */}
      <div
        className="flex-shrink-0 rounded-xl flex items-end justify-start p-2"
        style={{ width: 56, height: 56, background: item.bg }}
      >
        <span
          className="font-black text-xl leading-none"
          style={{ color, WebkitTextStroke: '0.5px rgba(255,255,255,0.5)' }}
        >
          {item.rank}
        </span>
      </div>
      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0f1e2e] leading-snug line-clamp-2">{item.title}</p>
        <p className="text-[10px] mt-1 text-[#8a9ab0] font-medium">{item.summary}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#f0f4f8', color: '#4a6a8a' }}>
            {item.area}
          </span>
          <span className="text-[10px] text-[#b0bcc8]">{item.date}</span>
        </div>
      </div>
      {/* 矢印 */}
      <svg width="8" height="13" viewBox="0 0 8 14" fill="none" stroke="#c0ccd8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <polyline points="1,1 7,7 1,13" />
      </svg>
    </div>
  );
}
