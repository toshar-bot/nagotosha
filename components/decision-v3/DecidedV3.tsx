'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { isDecisionV3ActionDisplayable } from '@/lib/decision-v3-action-gate';
import type { DecisionV3CandidateLookup } from '@/lib/decision-v3-candidate-lookup';
import { getDecisionV3ExternalProviderActions } from '@/lib/decision-v3-external-actions';
import { isExternalHref } from '@/lib/decision-v3-detail-actions';
import type { CandidateActionType } from '@/types/decision-v3';
import { CandidatePhotoV3 } from './CandidatePhotoV3';
import ExternalCandidateProvenanceV3 from './ExternalCandidateProvenanceV3';
import styles from './decision-v3.module.css';

type Props = {
  candidateId: string | null;
  candidateLookup: DecisionV3CandidateLookup;
  onCompare: () => void;
  onDetail: (candidateId: string) => void;
};

const ICON_BASE = '/decision/v3/icons/material-symbols-rounded';
const META_ICONS = {
  area: `${ICON_BASE}/location-on.svg`,
  budget: `${ICON_BASE}/payments.svg`,
  genre: `${ICON_BASE}/restaurant.svg`,
} as const;

const CONFIRMATION_ICONS = {
  atmosphere: `${ICON_BASE}/sentiment-satisfied.svg`,
  reservation: `${ICON_BASE}/refine/reservable.svg`,
  seats: `${ICON_BASE}/group.svg`,
  hours: `${ICON_BASE}/refine/long-stay.svg`,
} as const;

const ACTION_PRIORITY: Record<CandidateActionType, number> = {
  access: 0,
  phone: 1,
  reservation: 2,
  official: 3,
};

const CELEBRATION_ART = '/decision/v3/decided/decision-celebration-header.png';
const SIDE_CONFETTI_ART = '/decision/v3/decided/decision-side-confetti-overlay.png';

const CONFETTI_COLORS = ['#d63a28', '#f4c542', '#2877c7', '#54bfe8', '#42a36b', '#ef8b32'] as const;
const CONFETTI_SHAPES = [
  { width: 5, height: 14, radius: '2px' },
  { width: 8, height: 8, radius: '2px' },
  { width: 5, height: 5, radius: '50%' },
] as const;
const FALLING_CONFETTI = Array.from({ length: 54 }, (_, index) => {
  const shape = CONFETTI_SHAPES[index % CONFETTI_SHAPES.length];
  const driftDirection = index % 2 === 0 ? -1 : 1;

  return {
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    delay: `${150 + ((index * 37) % 701)}ms`,
    drift: `${driftDirection * (20 + ((index * 11) % 26))}px`,
    duration: `${2200 + (index % 7) * 100}ms`,
    height: `${shape.height}px`,
    left: `${2 + ((index * 37 + 11) % 96)}%`,
    radius: shape.radius,
    spin: `${120 + ((index * 53) % 280)}deg`,
    top: `${55 + ((index * 67) % 410)}px`,
    width: `${shape.width}px`,
  };
});

function DecidedUiIcon({ path }: { path: string }) {
  return (
    <span
      className={styles.decidedUiIcon}
      style={{ '--decided-ui-icon': `url("${path}")` } as CSSProperties}
      aria-hidden="true"
    />
  );
}

function DecidedPageHeader({ onCompare }: { onCompare: () => void }) {
  return (
    <div className={styles.decidedTopBar}>
      <button type="button" className={styles.decidedBackButton} onClick={onCompare} aria-label="比較画面へ戻る">
        <span aria-hidden="true">←</span>
      </button>
    </div>
  );
}

export function DecidedV3({ candidateId, candidateLookup, onCompare, onDetail }: Props) {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setCelebrating(true));
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  const candidate = candidateLookup.get(candidateId);

  if (!candidate) {
    return (
      <section className={`${styles.screenStage} ${styles.decidedScreen}`} aria-labelledby="decided-recovery-title">
        <DecidedPageHeader onCompare={onCompare} />
        <div className={styles.decidedRecovery} role="alert">
          <h1 id="decided-recovery-title">お店を決定できませんでした</h1>
          <p>候補の状態が変わった可能性があります。<br />比較画面からもう一度選んでください。</p>
          <button type="button" className={styles.primaryButton} onClick={onCompare}>比較画面へ戻る</button>
        </div>
      </section>
    );
  }

  const displayableActions = candidate.actions
    .filter(isDecisionV3ActionDisplayable)
    .slice()
    .sort((left, right) => ACTION_PRIORITY[left.type] - ACTION_PRIORITY[right.type]);
  const accessAction = displayableActions.find((action) => action.type === 'access');
  const supplementalExternalActions = displayableActions.filter((action) => action.type !== 'access');
  const providerActions = getDecisionV3ExternalProviderActions(candidate);
  const hours = candidate.detailInfo?.hours?.value.split('（')[0];
  const confirmationItems = [
    {
      key: 'atmosphere',
      label: '雰囲気',
      value: candidate.facts.atmosphere,
      icon: CONFIRMATION_ICONS.atmosphere,
    },
    {
      key: 'reservation',
      label: '予約',
      value: candidate.detailInfo?.reservation?.value,
      icon: CONFIRMATION_ICONS.reservation,
    },
    {
      key: 'seats',
      label: '席数',
      value: candidate.detailInfo?.seats?.value,
      icon: CONFIRMATION_ICONS.seats,
    },
    { key: 'hours', label: '営業時間', value: hours, icon: CONFIRMATION_ICONS.hours },
  ].filter((item): item is typeof item & { value: string } => Boolean(item.value));

  return (
    <section className={`${styles.screenStage} ${styles.decidedScreen}`} aria-labelledby="decided-title">
      <DecidedPageHeader onCompare={onCompare} />

      <div
        className={`${styles.decidedFallingConfetti} ${celebrating ? styles.decidedFallingConfettiActive : ''}`}
        aria-hidden="true"
      >
        {FALLING_CONFETTI.map((piece, index) => (
          <span
            key={`${piece.left}-${piece.top}-${index}`}
            style={{
              '--decided-confetti-color': piece.color,
              '--decided-confetti-delay': piece.delay,
              '--decided-confetti-drift': piece.drift,
              '--decided-confetti-duration': piece.duration,
              '--decided-confetti-height': piece.height,
              '--decided-confetti-left': piece.left,
              '--decided-confetti-radius': piece.radius,
              '--decided-confetti-spin': piece.spin,
              '--decided-confetti-top': piece.top,
              '--decided-confetti-width': piece.width,
            } as CSSProperties}
          />
        ))}
      </div>

      <header className={styles.decidedCelebration}>
        <h1 id="decided-title" className={styles.srOnly}>決定！ 今日の一軒はこちら！</h1>
        <Image
          className={styles.decidedSideConfettiArt}
          src={SIDE_CONFETTI_ART}
          alt=""
          aria-hidden="true"
          width={941}
          height={925}
          sizes="(max-width: 430px) 100vw, 430px"
        />
        <Image
          className={styles.decidedCelebrationArt}
          src={CELEBRATION_ART}
          alt=""
          aria-hidden="true"
          width={899}
          height={450}
          sizes="(max-width: 430px) 96vw, 411px"
          priority
        />
      </header>

      <article className={styles.decidedStoreCard} aria-labelledby="decided-store-name">
        <div className={styles.decidedPhotoFrame}>
          <CandidatePhotoV3 candidate={candidate} ratio="detail" />
        </div>
        <div className={styles.decidedStoreBody}>
          <h2 id="decided-store-name">{candidate.name}</h2>
          <dl className={styles.decidedMetadata}>
            <div>
              <dt><DecidedUiIcon path={META_ICONS.area} /><span className={styles.srOnly}>エリア</span></dt>
              <dd>{candidate.area}</dd>
            </div>
            <div>
              <dt><DecidedUiIcon path={META_ICONS.budget} /><span className={styles.srOnly}>価格帯</span></dt>
              <dd>{candidate.budget}</dd>
            </div>
            <div>
              <dt><DecidedUiIcon path={META_ICONS.genre} /><span className={styles.srOnly}>ジャンル</span></dt>
              <dd>{candidate.genre}</dd>
            </div>
          </dl>
          <ExternalCandidateProvenanceV3 candidate={candidate} />
        </div>

        {accessAction ? (
          <section className={styles.decidedPrimaryActionPanel} aria-label="主な操作">
            <a
              href={accessAction.href}
              className={styles.decidedActionPrimary}
              {...(accessAction.href && isExternalHref(accessAction.href)
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              <DecidedUiIcon path={META_ICONS.area} />
              Googleマップで行く
            </a>
          </section>
        ) : null}

        {confirmationItems.length > 0 ? (
          <section className={styles.decidedConfirmation} aria-labelledby="decided-confirmation-title">
            <div className={styles.decidedConfirmationHeading}>
              <span className={styles.decidedConfirmationMark} aria-hidden="true">✓</span>
              <h3 id="decided-confirmation-title">このお店の確認ポイント</h3>
            </div>
            <dl className={styles.decidedConfirmationGrid}>
              {confirmationItems.map((item) => (
                <div key={item.key}>
                  <dt><DecidedUiIcon path={item.icon} />{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section
          className={`${styles.decidedActionPanel} ${accessAction ? '' : styles.decidedActionPanelWithoutAccess}`}
          aria-label="決定後の操作"
        >
          {supplementalExternalActions.length > 0 ? (
            <div className={styles.decidedSecondaryActions}>
              {supplementalExternalActions.map((action) => {
                const external = action.href ? isExternalHref(action.href) : false;
                return (
                  <a
                    key={action.type}
                    href={action.href}
                    className={styles.decidedActionSecondary}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {action.label}
                  </a>
                );
              })}
            </div>
          ) : null}

          {providerActions.length > 0 ? (
            <div className={styles.decidedSecondaryActions}>
              {providerActions.map((action) => {
                const external = isExternalHref(action.href);
                return (
                  <a
                    key={`${action.kind}-${action.href}`}
                    href={action.href}
                    className={styles.decidedActionSecondary}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {action.label}
                  </a>
                );
              })}
            </div>
          ) : null}

          <div className={styles.decidedUtilityActions}>
            <button type="button" className={styles.decidedDetailButton} onClick={() => onDetail(candidate.id)}>
              お店の詳細
            </button>
            <button type="button" className={styles.decidedCompareButton} onClick={onCompare}>
              <span aria-hidden="true">←</span>
              比較へ戻る
            </button>
          </div>
        </section>
      </article>
    </section>
  );
}
