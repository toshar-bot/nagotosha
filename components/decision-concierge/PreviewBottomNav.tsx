'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './decision-concierge.module.css';

type PreviewTab = 'top' | 'decision' | 'discover';

export default function PreviewBottomNav() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('top');

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.slice(1);
      setActiveTab(hash === 'decision' || hash === 'discover' ? hash : 'top');
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  return (
    <nav className={styles.previewNav} aria-label="Preview内ナビゲーション">
      <div>
        <Link href="#top" className={styles.previewNavItem} data-active={activeTab === 'top'} aria-current={activeTab === 'top' ? 'page' : undefined} onClick={() => setActiveTab('top')}>
          <span className={styles.previewNavIcon}><NavIcon name="home" /></span>
          <span>はじめに</span>
        </Link>
        <Link href="#decision" className={styles.previewNavItem} data-active={activeTab === 'decision'} aria-current={activeTab === 'decision' ? 'page' : undefined} onClick={() => setActiveTab('decision')}>
          <span className={styles.previewNavIcon}><NavIcon name="sliders" /></span>
          <span>条件</span>
        </Link>
        <Link href="#discover" className={styles.previewNavItem} data-active={activeTab === 'discover'} aria-current={activeTab === 'discover' ? 'page' : undefined} onClick={() => setActiveTab('discover')}>
          <span className={styles.previewNavIcon}><NavIcon name="compass" /></span>
          <span>発見</span>
        </Link>
      </div>
    </nav>
  );
}

function NavIcon({ name }: { name: 'home' | 'sliders' | 'compass' }) {
  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3.5 10 8.5-7 8.5 7v10.5h-6v-6h-5v6h-6V10Z" />
      </svg>
    );
  }
  if (name === 'sliders') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h10M18 18h2" />
        <circle cx="13" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="16" cy="18" r="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.7 8.3-2.1 5.3-5.3 2.1 2.1-5.3 5.3-2.1Z" />
    </svg>
  );
}
