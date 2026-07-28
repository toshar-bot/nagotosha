'use client';

import { useEffect, useRef } from 'react';
import styles from './home-functional.module.css';

type ComingSoonSheetProps = {
  readonly title: string;
  readonly description: string;
  readonly onClose: () => void;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
};

export default function ComingSoonSheet({
  title,
  description,
  onClose,
  actionLabel,
  onAction,
}: ComingSoonSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className={styles.sheetBackdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-sheet-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className={styles.sheetHandle} aria-hidden="true" />
        <h2 id="coming-soon-sheet-title">{title}</h2>
        <p>{description}</p>
        {actionLabel && onAction ? (
          <button type="button" className={styles.sheetPrimary} onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
        <button ref={closeRef} type="button" className={styles.sheetClose} onClick={onClose}>
          閉じる
        </button>
      </section>
    </div>
  );
}
