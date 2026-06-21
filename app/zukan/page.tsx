'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import StickerVisual from '@/components/StickerVisual';
import { CARDS, TOTAL_CARDS } from '@/data/cards';
import { loadCollection, CollectionState } from '@/lib/storage';
import { RARITY_CONFIG } from '@/lib/rarity';
import { Rarity } from '@/types/card';
import { loadAllMyStickers, deleteMySticker, MySticker } from '@/lib/myStickers';

type Filter = 'ALL' | Rarity;
const FILTERS: Filter[] = ['ALL', 'N', 'R', 'SR', 'SSR', 'UR'];

function ZukanInner() {
  const params = useSearchParams();
  const initialTab = params.get('tab') === 'my' ? 'my' : 'official';

  const [tab, setTab]               = useState<'official' | 'my'>(initialTab);
  const [col, setCol]               = useState<CollectionState | null>(null);
  const [filter, setFilter]         = useState<Filter>('ALL');
  const [myStickers, setMyStickers] = useState<MySticker[]>([]);
  const [myUrls, setMyUrls]         = useState<Record<string, string>>({});

  useEffect(() => { setCol(loadCollection()); }, []);

  useEffect(() => {
    if (tab !== 'my') return;
    loadAllMyStickers().then(stickers => {
      setMyStickers(stickers);
      // BlobをObject URLに変換
      const urls: Record<string, string> = {};
      stickers.forEach(s => { urls[s.id] = URL.createObjectURL(s.stickerBlob); });
      setMyUrls(urls);
    });
    return () => {
      // クリーンアップ
      Object.values(myUrls).forEach(u => URL.revokeObjectURL(u));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const discoveredIds = col?.ownedCardIds ?? [];
  const cards = useMemo(
    () => CARDS.filter(c => filter === 'ALL' || c.rarity === filter),
    [filter],
  );
  const discoveredCount = discoveredIds.length;
  const pct = Math.round((discoveredCount / TOTAL_CARDS) * 100);

  async function handleDeleteMySticker(id: string) {
    await deleteMySticker(id);
    URL.revokeObjectURL(myUrls[id]);
    setMyUrls(prev => { const n = { ...prev }; delete n[id]; return n; });
    setMyStickers(prev => prev.filter(s => s.id !== id));
  }

  if (!col) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#030108]">
        <div className="game-icon book animate-toshar-float" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#030108] pb-24"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 40% at 50% 10%, rgba(110,65,10,0.16) 0%, transparent 60%)',
      }} />

      {/* ヘッダー */}
      <header className="relative z-10 px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-white/40 text-sm font-bold active:scale-95 transition-transform">
            ← HOME
          </Link>
          <div className="text-center">
            <p className="text-[9px] tracking-[0.22em] font-bold text-white/30">NAGOTOSHA</p>
            <h1 className="text-white font-black text-xl">シール帳</h1>
          </div>
          <Link
            href="/create"
            className="flex items-center justify-center w-9 h-9 rounded-full font-black text-white text-xl active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #b8872f, #7a4a14)', boxShadow: '0 0 16px rgba(184,135,47,0.4)' }}
            aria-label="マイシール作成"
          >
            ＋
          </Link>
        </div>

        {/* 発見数バー（公式のみカウント） */}
        <div className="rounded-2xl bg-white/5 border border-white/8 px-4 py-3 mb-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[9px] tracking-widest text-white/30 font-bold">OFFICIAL STICKERS</p>
              <p className="text-white font-black text-xl leading-none">
                {discoveredCount}
                <span className="text-white/35 text-sm font-bold"> / {TOTAL_CARDS}</span>
              </p>
            </div>
            <p className="text-white/40 text-xs font-black">{pct}%</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-2">
          {(['official', 'my'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all duration-150 active:scale-95"
              style={{
                background: tab === t ? 'rgba(184,135,47,0.18)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${tab === t ? 'rgba(184,135,47,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: tab === t ? '#f2b84b' : 'rgba(255,255,255,0.35)',
                boxShadow: tab === t ? '0 0 14px rgba(184,135,47,0.25)' : 'none',
              }}
            >
              {t === 'official' ? '公式シール' : 'マイシール'}
            </button>
          ))}
        </div>
      </header>

      {/* 公式シールグリッド */}
      {tab === 'official' && (
        <>
          {/* フィルタータブ */}
          <div className="relative z-10 flex gap-2 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
            {FILTERS.map(f => {
              const active = filter === f;
              const cfg = f !== 'ALL' ? RARITY_CONFIG[f] : null;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="h-8 px-3 rounded-full border text-[11px] font-black flex-shrink-0 transition-all duration-150 active:scale-95"
                  style={{
                    background: active ? (cfg ? `${cfg.borderColor}22` : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.05)',
                    borderColor: active ? (cfg?.borderColor ?? 'rgba(255,255,255,0.4)') : 'rgba(255,255,255,0.10)',
                    color: active ? (cfg?.color ?? 'white') : 'rgba(255,255,255,0.35)',
                    boxShadow: active && cfg ? `0 0 14px ${cfg.glowColor}` : 'none',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-x-3 gap-y-5 px-4 pt-2">
            {cards.map((card, i) => {
              const discovered = discoveredIds.includes(card.id);
              const count = col.cardCounts[card.id] ?? 0;
              const isNew = discovered && count <= 1;

              return discovered ? (
                <Link
                  key={card.id}
                  href={`/card/${card.id}`}
                  className="flex justify-center active:scale-95 transition-transform"
                  style={{
                    animation: `sticker-drop 0.38s cubic-bezier(0.34,1.4,0.64,1) both`,
                    animationDelay: `${Math.min(i * 0.03, 0.5)}s`,
                  }}
                >
                  <StickerVisual card={card} size="sm" discovered tilt isNew={isNew} />
                </Link>
              ) : (
                <div key={card.id} className="flex justify-center">
                  <StickerVisual card={card} size="sm" discovered={false} tilt />
                </div>
              );
            })}
          </div>

          {discoveredCount === TOTAL_CARDS && (
            <div className="relative z-10 mx-4 mt-8 p-5 rounded-2xl text-center bg-white/5 border border-amber-400/20">
              <p className="text-amber-400 font-black text-lg mb-1">全シール発見！</p>
              <p className="text-white/50 text-sm">名古屋メシ博士を名乗っていいぞ！</p>
            </div>
          )}
        </>
      )}

      {/* マイシールグリッド */}
      {tab === 'my' && (
        <div className="relative z-10 px-4 pt-2">
          {myStickers.length === 0 ? (
            <div className="flex flex-col items-center gap-6 pt-12">
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 32 }}>📷</span>
              </div>
              <div className="text-center">
                <p className="text-white/50 font-black text-base mb-1">まだマイシールがないぞ</p>
                <p className="text-white/25 text-sm">食べたメシを撮ってシールにしよう</p>
              </div>
              <Link
                href="/create"
                className="px-8 py-4 rounded-2xl font-black text-white active:scale-95 transition-transform relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #b8872f, #7a4a14)',
                  boxShadow: '0 0 30px rgba(184,135,47,0.4)',
                }}
              >
                <span className="relative">最初のシールを作る</span>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-white/25 text-xs mb-4 text-right">{myStickers.length}枚</p>
              <div className="grid grid-cols-2 gap-4">
                {myStickers.map((sticker, i) => (
                  <div
                    key={sticker.id}
                    className="flex flex-col items-center gap-2"
                    style={{
                      animation: 'sticker-drop 0.38s cubic-bezier(0.34,1.4,0.64,1) both',
                      animationDelay: `${Math.min(i * 0.05, 0.4)}s`,
                    }}
                  >
                    <div className="relative">
                      {myUrls[sticker.id] && (
                        <img
                          src={myUrls[sticker.id]}
                          alt={sticker.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: 160,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.45))',
                          }}
                        />
                      )}
                      {/* 削除ボタン */}
                      <button
                        onClick={() => handleDeleteMySticker(sticker.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-transform active:scale-90"
                        style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-white/70 text-xs font-bold text-center leading-tight px-1">
                      {sticker.name}
                    </p>
                  </div>
                ))}

                {/* 追加ボタン */}
                <Link
                  href="/create"
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl active:scale-95 transition-transform"
                  style={{
                    minHeight: 160,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.12)',
                  }}
                >
                  <span className="text-3xl font-black text-white/20">＋</span>
                  <span className="text-white/25 text-xs font-bold">シールを追加</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function StickerBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-[#030108]">
        <div className="game-icon book" />
      </div>
    }>
      <ZukanInner />
    </Suspense>
  );
}
