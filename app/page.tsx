'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────
   静的データ
───────────────────────────────────────── */

import { CATEGORY_TABS, FEATURED_ARTICLES, HERO_SLIDES, MOOD_ITEMS, RANKING } from '@/data/portal';
import type { CategoryTab, FeaturedArticle, HeroSlide, RankingItem as PortalRankingItem } from '@/types/portal';


/* ─────────────────────────────────────────
   メインページ
───────────────────────────────────────── */

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInterval = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setHeroIndex(idx);
    intervalRef.current = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4200);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f4f8fc 24%, #f8fafc 100%)' }}
    >
      <Header />
      <CategoryTabs tabs={CATEGORY_TABS} active={activeTab} onChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* ── ヒーローカルーセル ── */}
        <HeroCarousel slides={HERO_SLIDES} index={heroIndex} onDotClick={resetInterval} />

        {/* ── 今日の気分で探す ── */}
        <section className="px-4 pt-6 pb-1">
          <SectionTitle>今日の気分で探す</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5 mt-3">
            {MOOD_ITEMS.map(item => (
              <MoodButton key={item.key} label={item.label} />
            ))}
          </div>
        </section>

        {/* ── みんなの注目記事 ── */}
        <section className="pt-6 pb-1">
          <div className="px-4">
            <SectionTitle>みんなの注目記事</SectionTitle>
          </div>
          <div
            className="flex gap-3 mt-3 px-4 overflow-x-auto"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingRight: 24 }}
          >
            {FEATURED_ARTICLES.map(art => (
              <FeaturedCard key={art.id} article={art} />
            ))}
            {/* 末尾の余白 */}
            <div style={{ width: 4, flexShrink: 0 }} />
          </div>
        </section>

        {/* ── 人気ランキング ── */}
        <section className="px-4 pt-6 pb-2">
          <SectionTitle>人気ランキング</SectionTitle>
          <div className="flex flex-col gap-2.5 mt-3">
            {RANKING.map(item => (
              <RankingItem key={item.rank} item={item} />
            ))}
          </div>
        </section>

        {/* ── カードゲーム導線 ── */}
        <div className="px-4 pt-4 pb-3">
          <Link
            href="/game"
            className="flex items-center justify-between px-5 py-4 rounded-2xl active:scale-[0.98] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1a3060 0%, #2a5298 100%)',
              boxShadow: '0 4px 18px rgba(26,48,96,0.24)',
            }}
          >
            <div>
              <p className="text-[9px] font-bold tracking-[0.18em] text-white/55 mb-0.5">NAGOTOSHA GAME</p>
              <p className="text-white font-black text-[15px]">名古屋メシ図鑑を開く</p>
              <p className="text-white/50 text-[10px] mt-0.5">毎日シールを集めて名古屋を知る</p>
            </div>
            <svg width="9" height="15" viewBox="0 0 9 16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,1 8,8 1,15" />
            </svg>
          </Link>
        </div>

        {/* ── 店舗オーナー向け収益導線 ── */}
        <OwnerBanner />

      </main>
    </div>
  );
}

/* ─────────────────────────────────────────
   ヒーローカルーセル
───────────────────────────────────────── */

function HeroCarousel({
  slides, index, onDotClick,
}: {
  slides: HeroSlide[];
  index: number;
  onDotClick: (i: number) => void;
}) {
  return (
    <section className="px-4 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl" style={{ height: 232 }}>
        {/* スライドトラック */}
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(-${index * 92}% - ${index * 10}px))`,
            transition: 'transform 0.48s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform',
          }}
        >
          {slides.map((slide, i) => {
            const isActive = i === index;
            return (
              <div
                key={slide.id}
                className="relative flex-shrink-0 rounded-3xl overflow-hidden mr-3"
                style={{
                  width: '91%',
                  background: slide.bg,
                  opacity: isActive ? 1 : 0.68,
                  transform: isActive ? 'scale(1)' : 'scale(0.965)',
                  transition: 'opacity 0.45s, transform 0.45s',
                }}
              >
                {/* 光の差し込み（右上） */}
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.62) 0%, transparent 68%)',
                  pointerEvents: 'none',
                }} />

                {/* 下部の読みやすさ用グラデ */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 50%)',
                  pointerEvents: 'none',
                }} />

                {/* コンテンツ */}
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  {/* バッジ */}
                  <div>
                    <span
                      className="inline-block text-[10px] font-black tracking-[0.16em] px-3 py-1.5 rounded-full text-white"
                      style={{
                        background: slide.badgeBg,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.22)',
                        letterSpacing: '0.12em',
                      }}
                    >
                      {slide.badge}
                    </span>
                  </div>

                  {/* タイトル */}
                  <div>
                    <p
                      className="font-black text-xl leading-tight whitespace-pre-line"
                      style={{
                        color: slide.accentColor,
                        textShadow: slide.textShadow,
                      }}
                    >
                      {slide.title}
                    </p>
                    <p
                      className="text-[11px] font-semibold mt-1.5"
                      style={{ color: `${slide.accentColor}cc` }}
                    >
                      {slide.sub}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.68)',
                          color: slide.accentColor,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {slide.area}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.68)',
                          color: slide.accentColor,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        詳しく見る
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ width: '4%', flexShrink: 0 }} />
        </div>

        {/* ドット + 自動スライド表示 */}
        <div className="absolute bottom-3.5 right-5 flex flex-col items-end gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => onDotClick(i)}
                style={{
                  width: i === index ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === index
                    ? slides[index].accentColor
                    : 'rgba(0,0,0,0.20)',
                  transition: 'width 0.32s cubic-bezier(0.4,0,0.2,1), background 0.32s',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
          <span
            className="text-[8px] font-bold tracking-[0.14em] pointer-events-none"
            style={{ color: 'rgba(0,0,0,0.28)' }}
          >
            自動でスライド中
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   ヘッダー
───────────────────────────────────────── */

function Header() {
  return (
    <header
      className="sticky top-0 z-30 flex-shrink-0"
      style={{
        background: 'rgba(238,246,255,0.95)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(29,91,115,0.10)',
      }}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        {/* ブランドマーク */}
        <div className="flex items-center gap-2.5">
          {/* ロゴマーク：名古屋のN + 地図ピン形 */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{ width: 36, height: 36 }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 背景 */}
              <rect width="36" height="36" rx="10" fill="url(#logoGrad)" />
              {/* N 文字 */}
              <path d="M10 26V10L20 24V10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {/* マップピン */}
              <circle cx="27" cy="13" r="4" fill="white" opacity="0.9" />
              <path d="M27 17L27 22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1d5b73" />
                  <stop offset="100%" stopColor="#0a3a52" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* テキスト階層 */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-black text-[17px] leading-none tracking-tight"
                style={{ color: '#0a2438', letterSpacing: '-0.01em' }}
              >
                NAGOTOSHA
              </span>
            </div>
            <span
              className="text-[9px] font-bold tracking-[0.20em] mt-0.5"
              style={{ color: '#1d5b73' }}
            >
              名古屋シティガイド
            </span>
          </div>
        </div>

        {/* 右側ボタン */}
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(29,91,115,0.16)',
              boxShadow: '0 1px 5px rgba(0,0,0,0.07)',
            }}
            aria-label="検索"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d5b73" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="17" y1="17" x2="22" y2="22" />
            </svg>
          </button>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(29,91,115,0.16)',
              boxShadow: '0 1px 5px rgba(0,0,0,0.07)',
            }}
            aria-label="メニュー"
          >
            <svg width="16" height="12" viewBox="0 0 18 13" fill="none" stroke="#1d5b73" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1.5" x2="17" y2="1.5" />
              <line x1="1" y1="6.5" x2="13" y2="6.5" />
              <line x1="1" y1="11.5" x2="17" y2="11.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* サブコピー行 */}
      <div className="px-4 pb-2.5">
        <p
          className="text-[10px] font-semibold tracking-[0.12em]"
          style={{ color: '#4a7a90' }}
        >
          名古屋情報局 とーしゃー
        </p>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────
   カテゴリタブ
───────────────────────────────────────── */

function CategoryTabs({ tabs, active, onChange }: {
  tabs: CategoryTab[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div
      className="flex gap-2 px-4 py-2.5 overflow-x-auto flex-shrink-0"
      style={{
        background: 'rgba(238,246,255,0.96)',
        borderBottom: '1px solid rgba(29,91,115,0.08)',
        scrollbarWidth: 'none',
      }}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.key}
          onClick={() => onChange(i)}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide transition-all active:scale-95"
          style={i === active ? {
            background: '#1d5b73',
            color: '#ffffff',
            boxShadow: '0 2px 10px rgba(29,91,115,0.35)',
          } : {
            background: '#ffffff',
            color: '#4a7a90',
            border: '1.5px solid rgba(29,91,115,0.15)',
          }}
        >
          {tab.label}`r`n        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   セクションタイトル
───────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-full"
        style={{ width: 4, height: 20, background: 'linear-gradient(180deg, #1d5b73, #0a9a9a)' }}
      />
      <h2 className="text-[15px] font-black text-[#0a2438] tracking-tight">{children}</h2>
    </div>
  );
}

/* ─────────────────────────────────────────
   気分ボタン
───────────────────────────────────────── */

function MoodButton({ label }: { label: string }) {
  return (
    <button
      className="rounded-xl py-3.5 text-[13px] font-bold text-center active:scale-95 transition-transform"
      style={{
        background: '#ffffff',
        border: '1.5px solid rgba(29,91,115,0.13)',
        color: '#1a3a50',
        boxShadow: '0 2px 8px rgba(0,0,0,0.055)',
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────
   注目記事カード
───────────────────────────────────────── */

function FeaturedCard({ article }: { article: FeaturedArticle }) {
  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: 174,
        scrollSnapAlign: 'start',
        background: '#ffffff',
        boxShadow: '0 3px 16px rgba(0,0,0,0.10)',
        border: '1px solid rgba(29,91,115,0.07)',
      }}
    >
      {/* ビジュアル */}
      <div className="relative" style={{ height: 108, background: article.bg }}>
        {/* 光沢 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 65% 55% at 80% 15%, rgba(255,255,255,0.52) 0%, transparent 62%)',
          pointerEvents: 'none',
        }} />

        {/* NEW! バッジ */}
        {article.isNew && (
          <div className="absolute top-0 left-0">
            <div
              className="px-3 py-1.5 rounded-br-xl text-[10px] font-black tracking-widest text-white"
              style={{
                background: 'linear-gradient(135deg, #c9412d, #e05030)',
                boxShadow: '0 2px 8px rgba(201,65,45,0.40)',
                letterSpacing: '0.10em',
              }}
            >
              NEW!
            </div>
          </div>
        )}

        {/* 注目バッジ（NEW! でない場合） */}
        {!article.isNew && (
          <div className="absolute top-2.5 left-2.5">
            <span
              className="text-[9px] font-black px-2.5 py-1 rounded-full text-white tracking-wider"
              style={{
                background: `${article.accentColor}dd`,
                boxShadow: '0 1px 6px rgba(0,0,0,0.20)',
              }}
            >
              注目
            </span>
          </div>
        )}

        {/* タグ */}
        <span
          className="absolute bottom-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.80)', color: article.accentColor, backdropFilter: 'blur(4px)' }}
        >
          {article.tag}
        </span>
      </div>

      {/* テキスト */}
      <div className="px-3 pt-2.5 pb-3">
        <p className="text-[12px] font-bold text-[#0a2438] leading-snug line-clamp-2">{article.title}</p>
        <p className="text-[10px] font-semibold mt-1.5" style={{ color: '#4a7a90' }}>{article.area}</p>
        {/* 保存・閲覧数 */}
        <div className="flex items-center gap-2.5 mt-2">
          <span className="flex items-center gap-1 text-[9px] font-bold" style={{ color: '#8aabb0' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {(article.saves ?? 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-bold" style={{ color: '#8aabb0' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {(article.views ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ランキングアイテム
───────────────────────────────────────── */

function RankingItem({ item }: { item: PortalRankingItem }) {
  const isTop = item.rank === 1;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl active:scale-[0.99] transition-transform"
      style={{
        background: isTop ? item.bg : '#ffffff',
        boxShadow: isTop
          ? '0 4px 18px rgba(201,65,45,0.16)'
          : '0 2px 10px rgba(0,0,0,0.06)',
        border: isTop
          ? '1.5px solid rgba(201,65,45,0.20)'
          : '1px solid rgba(29,91,115,0.08)',
        padding: isTop ? '14px 16px' : '12px 16px',
      }}
    >
      {/* サムネイル風 */}
      <div
        className="flex-shrink-0 rounded-xl flex items-end justify-start"
        style={{
          width: isTop ? 62 : 54,
          height: isTop ? 62 : 54,
          background: isTop ? 'transparent' : item.bg,
          padding: isTop ? '0' : '8px',
        }}
      >
        <span
          className="font-black leading-none"
          style={{
            fontSize: isTop ? 38 : 26,
            color: item.rankColor,
            WebkitTextStroke: isTop ? `1px rgba(255,255,255,0.4)` : '0.5px rgba(255,255,255,0.5)',
            lineHeight: 1,
            alignSelf: isTop ? 'center' : 'flex-end',
            marginLeft: isTop ? 8 : 0,
            textShadow: isTop ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          {item.rank}
        </span>
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <p
          className="font-bold text-[#0a2438] leading-snug line-clamp-2"
          style={{ fontSize: isTop ? 13 : 12 }}
        >
          {item.title}
        </p>
        <p className="text-[10px] mt-1 font-medium" style={{ color: '#6a8a9a' }}>{item.summary}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(29,91,115,0.08)', color: '#1d5b73' }}
          >
            {item.area}
          </span>
          <span className="text-[9px] font-medium" style={{ color: '#a0b8c0' }}>{item.date}</span>
          <span className="flex items-center gap-0.5 text-[9px] font-bold ml-auto" style={{ color: '#a0b8c0' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            {(item.views ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 矢印 */}
      <svg width="8" height="13" viewBox="0 0 8 14" fill="none" stroke={isTop ? item.rankColor : '#c0ccd8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" opacity={isTop ? 0.6 : 1}>
        <polyline points="1,1 7,7 1,13" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────
   店舗オーナー向け収益導線
───────────────────────────────────────── */

function OwnerBanner() {
  return (
    <div className="px-4 pt-2 pb-6">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f8fcff 0%, #e8f4fd 100%)',
          border: '1.5px solid rgba(29,91,115,0.14)',
          boxShadow: '0 3px 14px rgba(29,91,115,0.09)',
        }}
      >
        {/* 上部ライン */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #1d5b73, #0a9a9a)' }} />

        <div className="px-5 pt-4 pb-5">
          <p
            className="text-[10px] font-black tracking-[0.16em] mb-2"
            style={{ color: '#1d5b73' }}
          >
            STORE OWNER
          </p>
          <p className="text-[14px] font-black text-[#0a2438] leading-snug mb-1.5">
            名古屋のお店を、行きたい人へ届けませんか？
          </p>
          <p className="text-[11px] font-medium text-[#4a7a90] leading-relaxed">
            記事掲載・NEW!掲載・Googleマップ導線・SNS投稿まで<br />まとめてサポートします。
          </p>

          <Link
            href="/partner"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full font-black text-[12px] text-white active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)',
              boxShadow: '0 3px 12px rgba(29,91,115,0.30)',
            }}
          >
            掲載について相談する
            <svg width="8" height="12" viewBox="0 0 8 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,1 7,7 1,13" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
