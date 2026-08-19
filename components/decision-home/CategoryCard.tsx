'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import * as m from 'motion/react-m';
import type { HomeCategory, RelativePosition } from '@/types/decision-home';
import styles from './home-functional.module.css';

const ROLE_BY_POSITION: Record<RelativePosition, string> = {
  [-2]: 'far-left',
  [-1]: 'near-left',
  [0]: 'center',
  [1]: 'near-right',
  [2]: 'far-right',
};

const X_BY_POSITION: Record<RelativePosition, string> = {
  [-2]: 'calc(var(--coverflow-step) * -1.72)',
  [-1]: 'calc(var(--coverflow-step) * -0.9)',
  [0]: '0px',
  [1]: 'calc(var(--coverflow-step) * 0.9)',
  [2]: 'calc(var(--coverflow-step) * 1.72)',
};

const ROTATE_BY_POSITION: Record<RelativePosition, number> = {
  [-2]: -11,
  [-1]: -6,
  [0]: 0,
  [1]: 6,
  [2]: 11,
};

const SCALE_BY_POSITION: Record<RelativePosition, number> = {
  [-2]: 0.78,
  [-1]: 0.88,
  [0]: 1,
  [1]: 0.88,
  [2]: 0.78,
};

const OPACITY_BY_POSITION: Record<RelativePosition, number> = {
  [-2]: 0.82,
  [-1]: 0.94,
  [0]: 1,
  [1]: 0.94,
  [2]: 0.82,
};

type CategoryCardProps = {
  readonly category: HomeCategory;
  readonly relativePosition: RelativePosition;
  readonly selected: boolean;
  readonly onActivate: () => void;
};

type CategoryStyle = CSSProperties & {
  '--category-surface': string;
  '--category-border': string;
  '--category-shadow': string;
  '--category-accent': string;
  '--icon-scale': number;
  '--icon-y': string;
};

export default function CategoryCard({
  category,
  relativePosition,
  selected,
  onActivate,
}: CategoryCardProps) {
  const centered = relativePosition === 0;
  const style: CategoryStyle = {
    '--category-surface': category.tone.surface,
    '--category-border': category.tone.border,
    '--category-shadow': category.tone.shadow,
    '--category-accent': category.tone.accent,
    '--icon-scale': category.visualScale,
    '--icon-y': `${category.visualTranslateY}px`,
    zIndex: centered ? 4 : Math.abs(relativePosition) === 1 ? 2 : 1,
  };

  return (
    <m.button
      id={`decision-home-category-${category.id}`}
      type="button"
      className={styles.categoryCard}
      data-category-id={category.id}
      data-coverflow-role={ROLE_BY_POSITION[relativePosition]}
      data-availability={category.availability}
      aria-label={`${category.label}${category.availability === 'coming-soon' ? '・準備中' : ''}`}
      aria-pressed={selected}
      tabIndex={centered ? 0 : -1}
      style={style}
      animate={{
        x: X_BY_POSITION[relativePosition],
        rotate: ROTATE_BY_POSITION[relativePosition],
        scale: SCALE_BY_POSITION[relativePosition],
        opacity: OPACITY_BY_POSITION[relativePosition],
      }}
      transition={{ type: 'spring', stiffness: 430, damping: 36, mass: 0.65 }}
      onClick={onActivate}
    >
      <span className={styles.categoryIconFrame} aria-hidden="true">
        <Image
          className={styles.categoryIcon}
          src={category.iconSrc}
          alt=""
          fill
          sizes="128px"
          unoptimized
          draggable={false}
        />
      </span>
      <span className={styles.categoryLabel}>{category.label}</span>
      {centered ? <span className={styles.categoryCheck} aria-hidden="true">✓</span> : null}
      {category.availability === 'coming-soon' ? (
        <span className={styles.comingSoonMark}>準備中</span>
      ) : null}
    </m.button>
  );
}
