'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import { TOSHAR_GACHA_LINES } from '@/data/toshar-gacha-lines';
import { trackGa4Event } from '@/lib/ga4';
import type { GachaArticle } from '@/lib/gacha-pool';

const LAST_ARTICLE_KEY = 'nagotosha:gacha:last-article-id';

type DrawKind = 'draw' | 'redraw';

type GachaExperienceProps = {
  articles: GachaArticle[];
  location: 'home' | 'game';
};

export function GachaExperience({ articles, location }: GachaExperienceProps) {
  const [result, setResult] = useState<GachaArticle | null>(null);
  const [line, setLine] = useState<string>(TOSHAR_GACHA_LINES[0]);
  const [isOpening, setIsOpening] = useState(false);
  const lastArticleIdRef = useRef<string | null>(null);
  const openingTimerRef = useRef<number | null>(null);

  const validArticles = useMemo(
    () => articles.filter((article) => article.articleUrl.startsWith('/article/')),
    [articles],
  );
  const hasMultiple = validArticles.length > 1;

  useEffect(() => {
    lastArticleIdRef.current = readLastArticleId();
    return () => {
      if (openingTimerRef.current !== null) window.clearTimeout(openingTimerRef.current);
    };
  }, []);

  if (validArticles.length === 0) {
    if (location === 'home') return null;
    return (
      <section className="rounded-[24px] border border-[#E6ECF5] bg-white px-5 py-8 text-center shadow-[0_16px_34px_rgba(7,26,77,0.08)]">
        <h2 className="text-[22px] font-black text-[#071A4D]">今日の一軒ガチャ</h2>
        <p className="mt-3 text-[14px] font-bold leading-relaxed text-[#667085]">
          いま引ける記事を準備しています。
        </p>
        <Link
          href="/new"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#E8483F] px-5 text-[14px] font-black text-white no-underline shadow-[0_10px_22px_rgba(232,72,63,0.18)]"
        >
          新着記事から探す
        </Link>
      </section>
    );
  }

  const drawArticle = (kind: DrawKind) => {
    if (openingTimerRef.current !== null) window.clearTimeout(openingTimerRef.current);

    const picked = pickArticle(validArticles, lastArticleIdRef.current);
    const pickedLine = TOSHAR_GACHA_LINES[Math.floor(Math.random() * TOSHAR_GACHA_LINES.length)];
    const showResult = () => {
      setResult(picked);
      setLine(pickedLine);
      lastArticleIdRef.current = picked.id;
      writeLastArticleId(picked.id);
      trackGa4Event(kind === 'draw' ? 'gacha_draw' : 'gacha_redraw', {
        article_id: picked.id,
        location,
      });
    };

    if (hasMultiple) {
      setIsOpening(true);
      openingTimerRef.current = window.setTimeout(() => {
        setIsOpening(false);
        openingTimerRef.current = null;
        showResult();
      }, 680);
      return;
    }

    setIsOpening(false);
    showResult();
  };

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-[#F4D9CD] bg-[linear-gradient(180deg,#fffaf3_0%,#fff7f7_100%)] px-4 py-5 shadow-[0_16px_38px_rgba(232,72,63,0.10)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,231,166,.62),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(232,72,63,.10),transparent_25%)]" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[0.22em] text-[#E8483F]">TODAY PICK</p>
            <h2 className="mt-1 text-[23px] font-black leading-tight text-[#071A4D]">今日の一軒ガチャ</h2>
          </div>
          <div className="rounded-full border border-[#F1D4C9] bg-white px-3 py-1 text-[11px] font-black text-[#E8483F]">
            {validArticles.length}件
          </div>
        </div>

        <div className="mt-3 rounded-[18px] bg-white px-4 py-3 text-[13px] font-black leading-relaxed text-[#071A4D] shadow-[0_10px_22px_rgba(7,26,77,0.07)]">
          選ぶのが面倒な日は、わしに任せてみて。
        </div>

        {!result && (
          <div className="mt-4 flex items-center gap-2">
            {validArticles.slice(0, 2).map((article) => (
              <div key={article.id} className="h-[74px] flex-1 overflow-hidden rounded-[16px] border border-white bg-white shadow-[0_8px_18px_rgba(7,26,77,0.08)]">
                <img src={article.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        {isOpening && (
          <div className="mt-4 grid min-h-[154px] place-items-center rounded-[20px] border border-[#F3DDD3] bg-white/86">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[conic-gradient(from_30deg,#E8483F,#FFD68A,#5FAF84,#E8483F)] p-1 shadow-[0_0_28px_rgba(232,72,63,.22)]">
              <div className="h-full w-full rounded-full bg-white" />
            </div>
          </div>
        )}

        {!isOpening && result && (
          <GachaResultCard article={result} line={line} location={location} />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!result && (
            <button
              type="button"
              onClick={() => drawArticle('draw')}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#E8483F] px-5 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(232,72,63,0.20)] active:scale-[0.98]"
            >
              {hasMultiple ? '今日の一軒をひく' : '今日の一軒を見る'}
            </button>
          )}
          {result && hasMultiple && (
            <button
              type="button"
              onClick={() => drawArticle('redraw')}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[#E8483F] bg-white px-5 text-[14px] font-black text-[#E8483F] shadow-[0_8px_18px_rgba(7,26,77,0.07)] active:scale-[0.98]"
            >
              もう一回ひく
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function GachaResultCard({
  article,
  line,
  location,
}: {
  article: GachaArticle;
  line: string;
  location: 'home' | 'game';
}) {
  return (
    <Link
      href={article.articleUrl}
      onClick={() => {
        trackGa4Event('gacha_result_click', {
          article_id: article.id,
          location,
        });
      }}
      className="mt-4 block overflow-hidden rounded-[20px] border border-[#E6ECF5] bg-white text-left text-[#0F172A] no-underline shadow-[0_12px_26px_rgba(7,26,77,0.10)] active:scale-[0.99]"
    >
      <div className="relative h-[136px] overflow-hidden">
        <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" loading="lazy" />
        {(article.tag || article.area) && (
          <span className="absolute left-3 top-3 rounded-full bg-white/94 px-3 py-1 text-[11px] font-black text-[#071A4D] shadow-[0_6px_14px_rgba(7,26,77,0.14)]">
            {article.tag || article.area}
          </span>
        )}
      </div>
      <div className="px-4 py-3">
        <h3 className="line-clamp-2 text-[16px] font-black leading-snug text-[#071A4D]">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-[12px] font-bold leading-relaxed text-[#667085]">
          {article.description}
        </p>
        <p className="mt-3 rounded-[14px] bg-[#FFF7ED] px-3 py-2 text-[12px] font-black leading-relaxed text-[#7A3E12]">
          {line}
        </p>
      </div>
    </Link>
  );
}

function pickArticle(articles: GachaArticle[], lastArticleId: string | null) {
  const candidates =
    articles.length > 1 && lastArticleId
      ? articles.filter((article) => article.id !== lastArticleId)
      : articles;
  const pool = candidates.length > 0 ? candidates : articles;
  return pool[Math.floor(Math.random() * pool.length)];
}

function readLastArticleId() {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(LAST_ARTICLE_KEY);
  } catch {
    return null;
  }
}

function writeLastArticleId(articleId: string) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LAST_ARTICLE_KEY, articleId);
  } catch {
    // localStorage may be unavailable; the in-memory ref still prevents repeats.
  }
}
