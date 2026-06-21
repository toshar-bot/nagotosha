'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'HOME', icon: 'home' },
  { href: '/book', label: 'シール帳', icon: 'book' },
];

export default function BottomNav() {
  const path = usePathname();
  const active = path.startsWith('/card') ? '/book' : path === '/' ? '/' : '/book';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="max-w-md mx-auto">
        <div
          className="flex items-center border-t shadow-[0_-12px_34px_rgba(105,72,38,0.10)]"
          style={{ background: 'rgba(5,2,12,0.94)', backdropFilter: 'blur(20px)', borderTopColor: 'rgba(255,255,255,0.08)' }}
        >
          {TABS.map(tab => {
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
