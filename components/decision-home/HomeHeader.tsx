import Image from 'next/image';
import styles from './home-functional.module.css';

export default function HomeHeader() {
  return (
    <header className={styles.header}>
      <Image
        className={styles.headerLogo}
        src="/subjects/nagotosha-header-complete-tight.png"
        alt="なごとしゃ 名古屋の楽しみ方を提案するシティガイド"
        width={360}
        height={94}
        priority
      />
      <span className={styles.previewBadge}>PREVIEW 0.1</span>
    </header>
  );
}
