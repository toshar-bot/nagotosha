'use client';

import type { HomeCategory } from '@/types/decision-home';
import styles from './home-functional.module.css';

type CategoryPrimaryCtaProps = {
  readonly category: HomeCategory;
  readonly onSelect: () => void;
  readonly onReturnToFood: () => void;
};

export default function CategoryPrimaryCta({
  category,
  onSelect,
  onReturnToFood,
}: CategoryPrimaryCtaProps) {
  if (category.availability === 'coming-soon') {
    return (
      <div className={styles.comingSoonCta} data-cta-state="coming-soon">
        <button type="button" className={styles.comingSoonMain} aria-disabled="true" onClick={onSelect}>
          {category.label}は準備中
        </button>
        <span>食事なら試せます</span>
        <button type="button" className={styles.returnFoodButton} onClick={onReturnToFood}>
          食事へ戻す
        </button>
      </div>
    );
  }

  return (
    <button type="button" className={styles.primaryCta} onClick={onSelect} data-cta-state="ready">
      <span aria-hidden="true" className={styles.searchMark} />
      {category.label}で見つける
      <span aria-hidden="true" className={styles.ctaArrow}>›</span>
    </button>
  );
}
