import type { CSSProperties } from 'react';
import { REFINE_CHOICES } from '@/data/decision-v3-demo';
import type { DecisionV3CandidateLookup } from '@/lib/decision-v3-candidate-lookup';
import { DECISION_V3_PARTY_LABELS } from '@/lib/decision-v3-party-handoff';
import type {
  CandidateSelectionResult,
  DecisionV3ConditionDraft,
  DecisionV3Conditions,
  RefineChoice,
} from '@/types/decision-v3';
import { CandidatePhotoV3 } from './CandidatePhotoV3';
import styles from './decision-v3.module.css';

type Props = {
  selectionResult: CandidateSelectionResult;
  candidateLookup: DecisionV3CandidateLookup;
  conditions: DecisionV3ConditionDraft;
  refine: RefineChoice[];
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onDetail: (id: string) => void;
  onCompare: () => void;
  onBack: () => void;
  onHome: () => void;
};

const CONDITION_CHIP_LABELS = {
  party: {
    ...DECISION_V3_PARTY_LABELS,
  },
  budget: {
    under1000: '〜1,000円',
    under2000: '〜2,000円',
    under4000: '〜4,000円',
    any: '予算は気にしない',
  },
  area: {
    sakae: '栄・伏見',
    meieki: '名駅・駅周辺',
    osu: '大須・上前津',
    any: 'エリアはこだわらない',
  },
  mood: {
    hearty: 'しっかり食べたい',
    light: '軽く楽しみたい',
    relax: 'ゆっくり過ごしたい',
    'new-experience': '新しい体験',
  },
} satisfies {
  [Group in keyof DecisionV3Conditions]: Record<DecisionV3Conditions[Group], string>;
};

const CANDIDATE_ICON_PATHS = {
  party: '/decision/v3/icons/material-symbols-rounded/group.svg',
  budget: '/decision/v3/icons/material-symbols-rounded/payments.svg',
  area: '/decision/v3/icons/material-symbols-rounded/location-on.svg',
  mood: '/decision/v3/icons/material-symbols-rounded/sentiment-satisfied.svg',
  refine: '/decision/v3/icons/material-symbols-rounded/tune.svg',
  genre: '/decision/v3/icons/material-symbols-rounded/restaurant.svg',
} as const;

type SelectedConditionChip = {
  key: string;
  label: string;
  iconPath: string;
};

function CandidateUiIcon({ iconPath, className = '' }: { iconPath: string; className?: string }) {
  return (
    <span
      className={`${styles.candidateUiIcon} ${className}`}
      style={{ '--candidate-ui-icon': `url("${iconPath}")` } as CSSProperties}
      aria-hidden="true"
    />
  );
}

function getSelectedConditionChips(
  conditions: DecisionV3ConditionDraft,
  refine: RefineChoice[],
) {
  const chips: SelectedConditionChip[] = [];

  if (conditions.party) {
    chips.push({ key: 'party', label: CONDITION_CHIP_LABELS.party[conditions.party], iconPath: CANDIDATE_ICON_PATHS.party });
  }
  if (conditions.budget) {
    chips.push({ key: 'budget', label: CONDITION_CHIP_LABELS.budget[conditions.budget], iconPath: CANDIDATE_ICON_PATHS.budget });
  }
  if (conditions.area) {
    chips.push({ key: 'area', label: CONDITION_CHIP_LABELS.area[conditions.area], iconPath: CANDIDATE_ICON_PATHS.area });
  }
  if (conditions.mood) {
    chips.push({ key: 'mood', label: CONDITION_CHIP_LABELS.mood[conditions.mood], iconPath: CANDIDATE_ICON_PATHS.mood });
  }

  for (const refineValue of refine) {
    const option = REFINE_CHOICES.find((choice) => choice.value === refineValue);
    if (option) {
      chips.push({ key: `refine:${refineValue}`, label: option.label, iconPath: CANDIDATE_ICON_PATHS.refine });
    }
  }

  return chips;
}

export function CandidateListV3({
  selectionResult,
  candidateLookup,
  conditions,
  refine,
  compareIds,
  onToggleCompare,
  onDetail,
  onCompare,
  onBack,
  onHome,
}: Props) {
  const candidates = selectionResult.kind === 'matched'
    ? selectionResult.candidateIds
        .map((candidateId) => candidateLookup.get(candidateId))
        .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    : [];
  const selectedConditionChips = getSelectedConditionChips(conditions, refine);
  const title =
    selectionResult.kind === 'matched'
      ? null
      : selectionResult.kind === 'no-match'
        ? '条件に合う候補が見つかりませんでした'
        : '現在、候補情報を準備しています';
  const comparisonLabel = compareIds.length === 0
    ? '比較する店を選んでください'
    : `選んだ${compareIds.length}件を比較する`;

  return (
    <section
      className={`${styles.screenStage} ${styles.candidateStage}`}
      aria-labelledby="candidate-title"
    >
      <header className={`${styles.screenHeader} ${styles.candidateScreenHeader}`}>
        <button type="button" className={styles.iconButton} onClick={onBack} aria-label="条件へ戻る">
          ←
        </button>
        <div>
          <h1 id="candidate-title">
            {selectionResult.kind === 'matched' ? (
              <>あなたにおすすめの<span>{candidates.length}件</span></>
            ) : title}
          </h1>
          {selectionResult.kind !== 'data-unavailable' ? (
            <p>
              {selectionResult.kind === 'matched'
                ? '選んだ条件に合うお店を、同じ優先度で並べました'
                : '条件を変えて、もう一度候補を探せます。'}
            </p>
          ) : null}
        </div>
      </header>

      <section className={styles.candidateConditions} aria-labelledby="selected-conditions-title">
        <div className={styles.candidateConditionsHeading}>
          <h2 id="selected-conditions-title">選択中の条件</h2>
        </div>
        <div className={styles.selectedConditionChips} aria-label="選択した条件">
          {selectedConditionChips.map((chip) => (
            <span key={chip.key}>
              <CandidateUiIcon iconPath={chip.iconPath} />
              <span>{chip.label}</span>
            </span>
          ))}
        </div>
      </section>

      {selectionResult.kind === 'no-match' ? (
        <article className={styles.candidateStateCard}>
          <h2>条件を緩める候補</h2>
          {selectionResult.relaxationHints.length > 0 ? (
            <ul>
              {selectionResult.relaxationHints.map((hint) => <li key={hint}>{hint}</li>)}
            </ul>
          ) : (
            <p>条件画面へ戻り、選択内容を変更してください。</p>
          )}
        </article>
      ) : null}

      {selectionResult.kind === 'data-unavailable' ? (
        <article className={styles.candidateStateCard}>
          <p>確認済みの店舗情報が揃い次第、条件に合う候補をご案内します。</p>
          <div className={styles.cardActions}>
            <button type="button" className={styles.secondaryButton} onClick={onBack}>条件を見直す</button>
            <button type="button" className={styles.primaryButton} onClick={onHome}>Homeへ戻る</button>
          </div>
        </article>
      ) : null}

      {selectionResult.kind === 'matched' ? (
        <>
          <div className={styles.candidateList}>
            {candidates.map((candidate) => {
              const selected = compareIds.includes(candidate.id);
              const atLimit = compareIds.length >= 3 && !selected;

              return (
                <article key={candidate.id} className={`${styles.candidateCard} ${styles.candidateHorizontalCard}`}>
                  <div className={styles.candidateCardMain}>
                    <div className={styles.candidateMedia}>
                      <span className={styles.candidateLabel}>{candidate.neutralLabel}</span>
                      <button
                        type="button"
                        className={`${styles.photoButton} ${styles.candidatePhotoButton}`}
                        onClick={() => onDetail(candidate.id)}
                        aria-label={`${candidate.name}の詳細を見る`}
                      >
                        <CandidatePhotoV3
                          candidate={candidate}
                          ratio="thumb"
                          fallbackMessage="写真はまだ登録されていません"
                        />
                      </button>
                    </div>
                    <div className={`${styles.candidateBody} ${styles.candidateCardBody}`}>
                      <h2>{candidate.name}</h2>
                      {candidate.provenance ? (
                        <div className={styles.externalCandidateSource}>
                          <span>{candidate.provenance.label}</span>
                          <p>{candidate.provenance.reason}・人数／気分の適性は未確認</p>
                          <a
                            href={candidate.provenance.attribution.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {candidate.provenance.attribution.label}
                          </a>
                        </div>
                      ) : null}
                      <dl className={styles.candidateMetadata}>
                        <div>
                          <dt>
                            <CandidateUiIcon iconPath={CANDIDATE_ICON_PATHS.area} className={styles.candidateMetaIcon} />
                            <span className={styles.srOnly}>エリア</span>
                          </dt>
                          <dd>{candidate.area}</dd>
                        </div>
                        <div>
                          <dt>
                            <CandidateUiIcon iconPath={CANDIDATE_ICON_PATHS.budget} className={styles.candidateMetaIcon} />
                            <span className={styles.srOnly}>価格帯</span>
                          </dt>
                          <dd>{candidate.budget}</dd>
                        </div>
                        <div>
                          <dt>
                            <CandidateUiIcon iconPath={CANDIDATE_ICON_PATHS.genre} className={styles.candidateMetaIcon} />
                            <span className={styles.srOnly}>ジャンル</span>
                          </dt>
                          <dd>{candidate.genre}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  <div className={`${styles.cardActions} ${styles.candidateCardActions}`}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => onDetail(candidate.id)}
                    >
                      お店の詳細
                    </button>
                    <button
                      type="button"
                      className={`${styles.primaryButton} ${selected ? styles.compareSelected : ''}`}
                      aria-pressed={selected}
                      aria-disabled={atLimit}
                      disabled={atLimit}
                      onClick={() => onToggleCompare(candidate.id)}
                    >
                      {selected ? '比較から外す' : '比較に追加'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className={styles.samePriorityNote} aria-label="候補の順序について">
            <strong>{candidates.length}件は同じ優先度です</strong>
            <p>
              {candidates.map((candidate) => candidate.neutralLabel).join('／')}
              は識別用です。店舗ごとの特徴と違いを見比べて選べます。
            </p>
          </aside>

          <div className={`${styles.stickyAction} ${styles.candidateCompareAction}`}>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={compareIds.length === 0}
              aria-disabled={compareIds.length === 0}
              onClick={onCompare}
            >
              <span>{comparisonLabel}</span>
              <span className={styles.comparisonCount}>選択 {compareIds.length} / {candidates.length}</span>
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
