import Link from 'next/link';
import styles from './decision-concierge.module.css';

export default function PreviewBottomNav() {
  return (
    <nav className={styles.previewNav} aria-label="Preview内ナビゲーション">
      <div>
        <Link href="#top">はじめに</Link>
        <Link href="#decision">条件</Link>
        <Link href="#discover">発見</Link>
      </div>
    </nav>
  );
}
