'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/',      label: 'HOME', icon: '🏠' },
  { href: '/zukan', label: '図鑑', icon: '📚' },
];

export default function BottomNav() {
  const path = usePathname();
  const active = path.startsWith('/card') ? '/zukan' : path === '/' ? '/' : '/zukan';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="max-w-md mx-auto">
        <div
          className="flex border-t border-[#222]"
          style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}
        >
          {TABS.map(tab => {
            const isActive = active === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all duration-150 ${isActive ? 'opacity-100' : 'opacity-40'}`}
              >
                <span className="text-2xl leading-none">{tab.icon}</span>
                <span className={`text-[10px] font-black tracking-wider ${isActive ? 'text-accent' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}