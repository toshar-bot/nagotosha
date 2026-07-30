import Image from 'next/image';
import styles from './approved-ui.module.css';

type BrandHeaderProps = {
  readonly compact?: boolean;
  readonly priority?: boolean;
};

export function BrandHeader({ compact = false, priority = false }: BrandHeaderProps) {
  return (
    <header className={styles.brandHeader} data-compact={compact ? 'true' : 'false'}>
      <Image
        className={styles.brandLogo}
        src="/brand/nagotosha-decision-concierge-logo-display.png"
        alt="なごとしゃ 意思決定コンシェルジュ"
        width={1799}
        height={507}
        priority={priority}
      />
      <button
        type="button"
        className={styles.notificationButton}
        aria-label="通知（準備中）"
        aria-disabled="true"
        title="通知は準備中です"
        disabled
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.notificationIcon}>
          <path d="M6.8 9.2a5.2 5.2 0 0 1 10.4 0c0 6 2.3 6.5 2.3 6.5h-15S6.8 15.2 6.8 9.2Z" />
          <path d="M9.8 19a2.4 2.4 0 0 0 4.4 0" />
        </svg>
        <span className={styles.srOnly}>準備中</span>
      </button>
    </header>
  );
}
