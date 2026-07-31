import Image from 'next/image';
import styles from './approved-ui.module.css';

type BrandHeaderProps = {
  readonly actions?: 'notification' | 'home-shortcuts' | 'none';
  readonly compact?: boolean;
  readonly priority?: boolean;
};

export function BrandHeader({
  actions = 'notification',
  compact = false,
  priority = false,
}: BrandHeaderProps) {
  return (
    <header
      className={styles.brandHeader}
      data-actions={actions}
      data-compact={compact ? 'true' : 'false'}
    >
      <Image
        className={styles.brandLogo}
        src="/brand/nagotosha-decision-concierge-logo-display.png"
        alt="なごとしゃ 意思決定コンシェルジュ"
        width={1799}
        height={507}
        priority={priority}
      />
      {actions === 'home-shortcuts' ? (
        <>
          <button
            type="button"
            className={styles.shortcutButton}
            aria-label="気になる・準備中"
            aria-disabled="true"
            disabled
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.shortcutIcon}>
              <path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.shortcutButton}
            aria-label="履歴・準備中"
            aria-disabled="true"
            disabled
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.shortcutIcon}>
              <path d="M3.2 12a8.8 8.8 0 1 0 2.6-6.2L3.2 8.4" />
              <path d="M3.2 4.7v3.7h3.7M12 7.5V12l3.1 1.8" />
            </svg>
          </button>
        </>
      ) : actions === 'notification' ? (
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
      ) : null}
    </header>
  );
}
