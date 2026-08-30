import type { CSSProperties } from 'react';
import { isDecisionV3ActionDisplayable } from '@/lib/decision-v3-action-gate';
import type { DecisionV3CandidateLookup } from '@/lib/decision-v3-candidate-lookup';
import { getDecisionV3ExternalProviderActions } from '@/lib/decision-v3-external-actions';
import { isExternalHref } from '@/lib/decision-v3-detail-actions';
import { CandidatePhotoV3 } from './CandidatePhotoV3';
import styles from './decision-v3.module.css';

type Props = {
  candidateId: string | null;
  candidateLookup: DecisionV3CandidateLookup;
  inCompare: boolean;
  compareLimitReached: boolean;
  onBack: () => void;
  onToggleCompare: (id: string) => void;
};

const DETAIL_ICON_BASE = '/decision/v3/icons/material-symbols-rounded';
const META_ICONS = {
  area: `${DETAIL_ICON_BASE}/location-on.svg`,
  budget: `${DETAIL_ICON_BASE}/payments.svg`,
  genre: `${DETAIL_ICON_BASE}/restaurant.svg`,
} as const;

const UNCONFIRMED_MARKERS = ['未確認', '確認中', '想定'];
const LOW_VALUE_NEGATIVE_FACTS = new Set(['なし', '不可', '非対応', '予約不可']);

function isConfirmedDetailValue(value: string) {
  const normalized = value.trim();
  return Boolean(normalized)
    && !UNCONFIRMED_MARKERS.some((marker) => normalized.includes(marker))
    && !LOW_VALUE_NEGATIVE_FACTS.has(normalized);
}

function DetailUiIcon({ iconPath, className }: { iconPath: string; className?: string }) {
  return (
    <span
      className={className ?? styles.detailUiIcon}
      style={{ '--detail-ui-icon': `url("${iconPath}")` } as CSSProperties}
      aria-hidden="true"
    />
  );
}

function DetailPageHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className={styles.detailPageHeader}>
      <button type="button" className={styles.detailBackButton} onClick={onBack} aria-label="候補一覧へ戻る">
        <span aria-hidden="true">←</span>
      </button>
      <div className={styles.detailPageHeading}>
        <h1 id="detail-page-title">お店の詳細</h1>
        <p>気になるお店を詳しくチェック</p>
      </div>
    </header>
  );
}

export function DetailV3({
  candidateId,
  candidateLookup,
  inCompare,
  compareLimitReached,
  onBack,
  onToggleCompare,
}: Props) {
  const candidate = candidateLookup.get(candidateId);

  if (!candidate) {
    return (
      <section className={`${styles.screenStage} ${styles.detailScreen}`} aria-labelledby="detail-page-title">
        <DetailPageHeader onBack={onBack} />
        <div className={styles.detailRecovery} role="alert">
          <h2>店舗情報を表示できませんでした</h2>
          <p>候補の状態が変わった可能性があります。候補一覧からもう一度選んでください。</p>
          <button type="button" className={styles.primaryButton} onClick={onBack}>候補一覧へ戻る</button>
        </div>
      </section>
    );
  }

  const detail = candidate.detailInfo;
  const displayableActions = candidate.actions.filter(isDecisionV3ActionDisplayable);
  const providerActions = getDecisionV3ExternalProviderActions(candidate);
  const highlights = detail?.highlights ?? [];

  // Basic information: verified/known values only. area & budget are always
  // confirmed. When there is no verified detailInfo, fall back to confirmed
  // store facts. unknown/negative values are never listed or converted.
  const basicInfo: { label: string; value: string; wide?: boolean }[] = [
    { label: 'エリア', value: candidate.area },
    ...(detail?.address ? [{ label: '住所', value: detail.address.value, wide: true }] : []),
    ...(detail?.hours ? [{ label: '営業時間', value: detail.hours.value, wide: true }] : []),
    { label: '価格帯', value: candidate.budget },
    ...(detail?.reservation ? [{ label: '予約', value: detail.reservation.value }] : []),
    ...(detail?.phone ? [{ label: '電話', value: detail.phone.value }] : []),
    ...(detail?.seats ? [{ label: '席数', value: detail.seats.value }] : []),
    ...(!detail && isConfirmedDetailValue(candidate.facts.atmosphere)
      ? [{ label: '雰囲気', value: candidate.facts.atmosphere }]
      : []),
    ...(!detail && isConfirmedDetailValue(candidate.facts.seats)
      ? [{ label: '席', value: candidate.facts.seats }]
      : []),
    ...(!detail && isConfirmedDetailValue(candidate.facts.longStay)
      ? [{ label: '過ごし方', value: candidate.facts.longStay }]
      : []),
  ];

  return (
    <section className={`${styles.screenStage} ${styles.detailScreen}`} aria-labelledby="detail-page-title">
      <DetailPageHeader onBack={onBack} />

      <article className={styles.detailStoreCard} aria-labelledby="detail-store-name">
        <div className={styles.detailPhotoFrame}>
          <CandidatePhotoV3 candidate={candidate} ratio="detail" />
        </div>
        <div className={styles.detailStoreBody}>
          <h2 id="detail-store-name">{candidate.name}</h2>
          <dl className={styles.detailMetadata}>
            <div>
              <dt><DetailUiIcon iconPath={META_ICONS.area} /><span className={styles.srOnly}>エリア</span></dt>
              <dd>{candidate.area}</dd>
            </div>
            <div>
              <dt><DetailUiIcon iconPath={META_ICONS.budget} /><span className={styles.srOnly}>価格帯</span></dt>
              <dd>{candidate.budget}</dd>
            </div>
            <div>
              <dt><DetailUiIcon iconPath={META_ICONS.genre} /><span className={styles.srOnly}>ジャンル</span></dt>
              <dd>{candidate.genre}</dd>
            </div>
          </dl>
        </div>
      </article>

      {displayableActions.length > 0 ? (
        <section className={styles.detailSection} aria-labelledby="detail-actions-title">
          <h2 id="detail-actions-title">お店へ行く・予約する</h2>
          <div className={styles.detailActions}>
            {displayableActions.map((action) => (
              <a
                key={action.type}
                className={action.type === 'access' ? styles.detailActionPrimary : styles.detailActionSecondary}
                href={action.href}
                {...(action.href && isExternalHref(action.href) ? { target: '_blank' } : {})}
                rel="noopener noreferrer"
              >
                {action.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {providerActions.length > 0 && candidate.provenance ? (
        <section className={styles.detailSection} aria-labelledby="detail-provider-actions-title">
          <h2 id="detail-provider-actions-title">提供元の情報を開く</h2>
          <p className={styles.detailPendingMessage}>
            {candidate.provenance.label}。なごとしゃ確認済みの公式情報ではありません。
          </p>
          <div className={styles.detailActions}>
            {providerActions.map((action) => (
              <a
                key={`${action.kind}-${action.href}`}
                className={action.kind === 'map' ? styles.detailActionPrimary : styles.detailActionSecondary}
                href={action.href}
                {...(isExternalHref(action.href) ? { target: '_blank' } : {})}
                rel="noopener noreferrer"
              >
                {action.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {highlights.length > 0 ? (
        <section className={styles.detailSection} aria-labelledby="detail-highlights-title">
          <h2 id="detail-highlights-title">このお店のポイント</h2>
          <ul className={styles.detailHighlights}>
            {highlights.map((highlight) => (
              <li key={highlight.title}>
                <span className={styles.detailHighlightIcon} aria-hidden="true">
                  {highlight.icon ? (
                    <span
                      className={styles.detailHighlightIconMark}
                      style={{ '--detail-ui-icon': `url("${DETAIL_ICON_BASE}/${highlight.icon}")` } as CSSProperties}
                    />
                  ) : null}
                </span>
                <div className={styles.detailHighlightText}>
                  <p className={styles.detailHighlightTitle}>{highlight.title}</p>
                  <p className={styles.detailHighlightBody}>{highlight.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.detailSection} aria-labelledby="detail-information-title">
        <h2 id="detail-information-title">基本情報</h2>
        {basicInfo.length > 0 ? (
          <dl className={styles.detailInformationList}>
            {basicInfo.map((row) => (
              <div key={row.label} className={row.wide ? styles.detailInfoWide : undefined}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className={styles.detailPendingMessage}>詳細情報は確認中です</p>
        )}
      </section>

      <div className={styles.detailChoiceActions}>
        <button
          type="button"
          className={inCompare ? styles.detailCompareSelected : styles.primaryButton}
          aria-pressed={inCompare}
          aria-describedby={compareLimitReached ? 'detail-compare-limit' : undefined}
          disabled={compareLimitReached}
          onClick={() => onToggleCompare(candidate.id)}
        >
          {inCompare ? '比較から外す' : compareLimitReached ? '比較は3件までです' : '比較に追加'}
        </button>
        {compareLimitReached ? (
          <p id="detail-compare-limit">追加済みの候補を外すと、このお店を比較できます。</p>
        ) : null}
        <button type="button" className={styles.detailCandidatesButton} onClick={onBack}>候補一覧へ戻る</button>
      </div>
    </section>
  );
}
