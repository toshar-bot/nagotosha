'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PORTAL_TABS = [
  { href: '/',       label: 'ホーム',   icon: <HomeIcon /> },
  { href: '/event',  label: 'イベント', icon: <CalIcon /> },
  { href: '/new',    label: '新着',     icon: <StarIcon /> },
  { href: '/area',   label: 'エリア',   icon: <MapIcon /> },
  { href: '/saved',  label: '保存',     icon: <BookmarkIcon /> },
];

const GAME_TABS = [
  { href: '/game', label: 'HOME',    icon: 'home' },
  { href: '/book', label: 'シール帳', icon: 'book' },
];

export default function BottomNav() {
  const path = usePathname();
  const isPortal = path === '/';

  if (isPortal) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="max-w-md mx-auto">
          <div
            className="flex items-stretch border-t"
            style={{
              background: 'rgba(240,247,255,0.96)',
              backdropFilter: 'blur(20px)',
              borderTopColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.07)',
            }}
          >
            {PORTAL_TABS.map(tab => {
              const isActive = path === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-150 active:scale-90"
                >
                  <span style={{ color: isActive ? '#1d5b73' : '#8a9ab0' }}>
                    {tab.icon}
                  </span>
                  <span
                    className="text-[9px] font-bold tracking-wide"
                    style={{ color: isActive ? '#1d5b73' : '#8a9ab0' }}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: '#1d5b73' }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  /* ── ゲーム用ナビ（/game, /book, /zukan など） ── */
  const active = path.startsWith('/card') ? '/book'
    : (path === '/game') ? '/game'
    : '/book';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="max-w-md mx-auto">
        <div
          className="flex items-center border-t shadow-[0_-12px_34px_rgba(105,72,38,0.10)]"
          style={{ background: 'rgba(5,2,12,0.94)', backdropFilter: 'blur(20px)', borderTopColor: 'rgba(255,255,255,0.08)' }}
        >
          {GAME_TABS.map(tab => {
            const isActive = active === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all duration-150 ${isActive ? 'opacity-100' : 'opacity-35'}`}
              >
                <span className={`game-icon ${tab.icon}`} />
                <span className={`text-[10px] font-black tracking-wider ${isActive ? 'text-amber-400' : 'text-white/40'}`}>
                  {tab.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />}
              </Link>
            );
          })}

          {/* マイシール作成ボタン（中央FAB風） */}
          <Link
            href="/create"
            className="flex flex-col items-center justify-center py-2 gap-0.5 transition-all duration-150 active:scale-90"
            style={{ width: 64 }}
            aria-label="マイシール作成"
          >
            <div
              className="flex items-center justify-center w-11 h-11 rounded-full font-black text-white text-2xl"
              style={{
                background: 'linear-gradient(135deg, #b8872f, #7a4a14)',
                boxShadow: '0 0 18px rgba(184,135,47,0.55)',
                marginTop: -20,
              }}
            >
              ＋
            </div>
            <span className="text-[10px] font-black tracking-wider text-white/40 mt-0.5">
              作成
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── SVGアイコン ── */

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
      <rect x="9" y="14" width="6" height="7" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
