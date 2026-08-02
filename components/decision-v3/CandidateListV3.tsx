import { DEMO_CANDIDATES, REFINE_CHOICES } from '@/data/decision-v3-demo';
import {
  DECISION_V3_PARTY_LABELS,
  formatDecisionV3PartyDisplayText,
} from '@/lib/decision-v3-party-handoff';
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
  conditions: DecisionV3ConditionDraft;
  refine: RefineChoice[];
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onDetail: (id: string) => void;
  onCompare: () => void;
  onBack: () => void;
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

function getSelectedConditionLabels(
  conditions: DecisionV3ConditionDraft,
  refine: RefineChoice[],
) {
  const labels: string[] = [];

  if (conditions.party) labels.push(CONDITION_CHIP_LABELS.party[conditions.party]);
  if (conditions.budget) labels.push(CONDITION_CHIP_LABELS.budget[conditions.budget]);
  if (conditions.area) labels.push(CONDITION_CHIP_LABELS.area[conditions.area]);
  if (conditions.mood) labels.push(CONDITION_CHIP_LABELS.mood[conditions.mood]);

  for (const refineValue of refine) {
    const option = REFINE_CHOICES.find((choice) => choice.value === refineValue);
    if (option) labels.push(option.label);
  }

  return labels;
}

export function CandidateListV3({
  selectionResult,
  conditions,
  refine,
  compareIds,
  onToggleCompare,
  onDetail,
  onCompare,
  onBack,
}: Props) {
  const candidates = selectionResult.kind === 'matched'
    ? selectionResult.candidateIds
        .map((candidateId) => DEMO_CANDIDATES.find((candidate) => candidate.id === candidateId))
        .filter((candidate): candidate is (typeof DEMO_CANDIDATES)[number] => Boolean(candidate))
    : [];
  const selectedConditionLabels = getSelectedConditionLabels(conditions, refine);
  const title =
    selectionResult.kind === 'matched'
      ? null
      : selectionResult.kind === 'no-match'
        ? '条件に合う候補が見つかりませんでした'
        : 'この条件は、確認できる店舗情報が不足しています';
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
          <p>
            {selectionResult.kind === 'matched'
              ? '選んだ条件に合うお店を、同じ優先度で並べました'
              : '条件を変えて、もう一度候補を探せます。'}
          </p>
        </div>
      </header>

      <section className={styles.candidateConditions} aria-labelledby="selected-conditions-title">
        <div className={styles.candidateConditionsHeading}>
          <h2 id="selected-conditions-title">選択中の条件</h2>
          {selectionResult.kind === 'matched' ? (
            <span className={styles.orderNote}>順位ではありません</span>
          ) : null}
        </div>
        <div className={styles.selectedConditionChips} aria-label="選択した条件">
          {selectedConditionLabels.map((label) => <span key={label}>{label}</span>)}
        </div>
        <p className={styles.candidateDataNotice}>
          候補内容と写真は操作確認用のDEMOです。営業・空席などのリアルタイム情報ではありません。
        </p>
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
          <h2>候補情報を確認中です</h2>
          <p>不足している情報を推測せず、確認できた候補だけを表示します。</p>
        </article>
      ) : null}

      {selectionResult.kind === 'matched' ? (
        <>
          <div className={styles.candidateList}>
            {candidates.map((candidate) => {
              const selected = compareIds.includes(candidate.id);
              const atLimit = compareIds.length >= 3 && !selected;
              const reasons = (selectionResult.reasonsByCandidateId[candidate.id] ?? []).slice(0, 3);

              return (
                <article key={candidate.id} className={`${styles.candidateCard} ${styles.candidateHorizontalCard}`}>
                  <div className={styles.candidateCardMain}>
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
                      <span className={styles.candidateLabel}>{candidate.neutralLabel}</span>
                    </button>
                    <div className={`${styles.candidateBody} ${styles.candidateCardBody}`}>
                      <h2>{candidate.name}</h2>
                      <dl className={styles.candidateMetadata}>
                        <div>
                          <dt>エリア</dt>
                          <dd>{candidate.area}</dd>
                        </div>
                        <div>
                          <dt>価格帯</dt>
                          <dd>{candidate.budget}</dd>
                        </div>
                        <div>
                          <dt>ジャンル</dt>
                          <dd>{candidate.genre}</dd>
                        </div>
                      </dl>
                      <section className={styles.candidateReasonBox} aria-label="条件に合う理由">
                        <h3>条件に合う理由</h3>
                        <ul>
                          {reasons.map((reason) => (
                            <li key={reason}>{formatDecisionV3PartyDisplayText(reason)}</li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </div>
                  <div className={`${styles.cardActions} ${styles.candidateCardActions}`}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => onDetail(candidate.id)}
                    >
                      詳細を見る
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
              は識別用です。条件に合う理由と違いを見比べて選べます。
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
