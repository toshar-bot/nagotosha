'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'HOME', icon: 'home' },
  { href: '/zukan', label: '図鑑', icon: 'book' },
];

export default function BottomNav() {
  const path = usePathname();
  const active = path.startsWith('/card') ? '/zukan' : path === '/' ? '/' : '/zukan';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="max-w-md mx-auto">
        <div
          className="flex border-t border-border shadow-[0_-12px_34px_rgba(105,72,38,0.10)]"
          style={{ background: 'rgba(255,250,241,0.94)', backdropFilter: 'blur(20px)' }}
        >
          {TABS.map(tab => {
            const isActive = active === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all duration-150 ${isActive ? 'opacity-100' : 'opacity-45'}`}
              >
                <span className={`game-icon ${tab.icon}`} />
                <span className={`text-[10px] font-black tracking-wider ${isActive ? 'text-accent' : 'text-[#9b8261]'}`}>
                  {tab.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-accent mt-0.5" />}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
