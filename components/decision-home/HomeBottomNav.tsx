'use client';

import type { ReactNode } from 'react';
import styles from './home-functional.module.css';

type HomeBottomNavProps = {
  readonly onConditions: () => void;
  readonly onDiscover: () => void;
  readonly onSaved: () => void;
};

type NavItemProps = {
  readonly label: string;
  readonly active?: boolean;
  readonly state: 'active' | 'available' | 'coming-soon';
  readonly onClick?: () => void;
  readonly marker: ReactNode;
};

function NavItem({ label, active, state, onClick, marker }: NavItemProps) {
  return (
    <button
      type="button"
      className={styles.navItem}
      data-active={active ? 'true' : 'false'}
      data-state={state}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <span className={styles.navMarker} aria-hidden="true">{marker}</span>
      <span>{label}</span>
      {state === 'coming-soon' ? <small>準備中</small> : null}
    </button>
  );
}

export default function HomeBottomNav({ onConditions, onDiscover, onSaved }: HomeBottomNavProps) {
  return (
    <nav className={styles.bottomNav} aria-label="Decision Home">
      <NavItem label="ホーム" state="active" active marker="●" />
      <NavItem label="条件" state="available" onClick={onConditions} marker="—" />
      <NavItem label="発見" state="coming-soon" onClick={onDiscover} marker="○" />
      <NavItem label="保存" state="coming-soon" onClick={onSaved} marker="□" />
    </nav>
  );
}
