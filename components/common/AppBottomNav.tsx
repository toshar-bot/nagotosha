'use client';

import type { CSSProperties, ReactNode } from 'react';
import styles from './approved-ui.module.css';

export type AppBottomNavItemId = 'home' | 'search' | 'interested' | 'compare' | 'history';

type AppBottomNavProps = {
  readonly activeItem: AppBottomNavItemId;
  readonly disabledItems?: readonly AppBottomNavItemId[];
  readonly maxWidth?: number | null;
  readonly onNavigate: (item: AppBottomNavItemId) => void;
};

const navItems: ReadonlyArray<{
  id: AppBottomNavItemId;
  label: string;
  icon: ReactNode;
}> = [
  {
    id: 'home',
    label: 'ホーム',
    icon: <path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3v-9.5Z" />,
  },
  {
    id: 'search',
    label: '探す',
    icon: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
  },
  {
    id: 'interested',
    label: '気になる',
    icon: <path d="M20.8 8.7c0 5.2-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />,
  },
  {
    id: 'compare',
    label: '比較',
    icon: (
      <>
        <path d="M7 4v16M17 4v16M3 8h8M13 16h8" />
        <path d="m8 5-1-1-1 1M16 19l1 1 1-1" />
      </>
    ),
  },
  {
    id: 'history',
    label: '履歴',
    icon: (
      <>
        <path d="M4.4 8A8.2 8.2 0 1 1 4 15" />
        <path d="M4.4 3.8V8h4.2M12 7.5V12l3 1.8" />
      </>
    ),
  },
];

export function AppBottomNav({
  activeItem,
  disabledItems = [],
  maxWidth,
  onNavigate,
}: AppBottomNavProps) {
  const style = maxWidth
    ? ({ '--nagotosha-bottom-nav-width': `${maxWidth}px` } as CSSProperties)
    : undefined;

  return (
    <nav className={styles.bottomNav} aria-label="なごとしゃ共通ナビゲーション" style={style}>
      {navItems.map((item) => {
        const disabled = disabledItems.includes(item.id);
        const active = item.id === activeItem;
        return (
          <button
            key={item.id}
            type="button"
            className={styles.navButton}
            data-active={active ? 'true' : 'false'}
            aria-current={active ? 'page' : undefined}
            aria-disabled={disabled ? 'true' : undefined}
            aria-label={disabled ? `${item.label}（準備中）` : item.label}
            title={disabled ? `${item.label}は準備中です` : undefined}
            disabled={disabled}
            onClick={() => onNavigate(item.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
