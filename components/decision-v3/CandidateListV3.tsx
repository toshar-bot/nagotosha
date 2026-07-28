import { DEMO_CANDIDATES, isCandidateActionDisplayable } from '@/data/decision-v3-demo';
import type { CandidateSelectionResult } from '@/types/decision-v3';
import { CandidatePhotoV3 } from './CandidatePhotoV3';
import styles from './decision-v3.module.css';

type Props = {
  selectionResult: CandidateSelectionResult;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onDetail: (id: string) => void;
  onCompare: () => void;
  onBack: () => void;
};

export function CandidateListV3({
  selectionResult,
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
  const title =
    selectionResult.kind === 'matched'
      ? `候補を${candidates.length}件に絞りました`
      : selectionResult.kind === 'no-match'
        ? '条件に合う候補が見つかりませんでした'
        : 'この条件は、確認できる店舗情報が不足しています';

  return (
    <section className={styles.screenStage} aria-labelledby="candidate-title">
      <header className={styles.screenHeader}>
        <button type="button" className={styles.iconButton} onClick={onBack} aria-label="条件へ戻る">
          ←
        </button>
        <div>
          <h1 id="candidate-title">{title}</h1>
          <p>
            {selectionResult.kind === 'matched'
              ? '写真と情報を確認して、比べる候補を選べます。'
              : '条件を変えて、もう一度候補を探せます。'}
          </p>
        </div>
      </header>
      <p className={styles.demoNotice}>
        写真と候補内容は操作確認用のDEMOです。営業・空席などのリアルタイム情報ではありません。
      </p>
      {selectionResult.kind === 'no-match' ? (
        <div className={styles.candidateList}>
          <article className={styles.candidateCard}>
            <div className={styles.candidateBody}>
              <h2>条件を緩める候補</h2>
              {selectionResult.relaxationHints.length > 0 ? (
                <ul>
                  {selectionResult.relaxationHints.map((hint) => <li key={hint}>{hint}</li>)}
                </ul>
              ) : (
                <p>条件画面へ戻り、選択内容を変更してください。</p>
              )}
            </div>
          </article>
        </div>
      ) : null}
      {selectionResult.kind === 'data-unavailable' ? (
        <div className={styles.candidateList}>
          <article className={styles.candidateCard}>
            <div className={styles.candidateBody}>
              <h2>候補情報を確認中です</h2>
              <p>不足している情報を推測せず、確認できた候補だけを表示します。</p>
            </div>
          </article>
        </div>
      ) : null}
      {selectionResult.kind === 'matched' ? (
        <div className={styles.candidateList}>
        {candidates.map((candidate) => {
          const selected = compareIds.includes(candidate.id);
          const atLimit = compareIds.length >= 3 && !selected;
          const reasons = selectionResult.reasonsByCandidateId[candidate.id] ?? [];
          const displayableActions = candidate.actions.filter(isCandidateActionDisplayable);
          return (
            <article key={candidate.id} className={styles.candidateCard}>
              <button
                type="button"
                className={styles.photoButton}
                onClick={() => onDetail(candidate.id)}
                aria-label={`${candidate.name}の詳細を見る`}
              >
                <CandidatePhotoV3 candidate={candidate} />
                <span className={styles.candidateLabel}>{candidate.neutralLabel}</span>
              </button>
              <div className={styles.candidateBody}>
                <h2>{candidate.name}</h2>
                <p className={styles.candidateMeta}>
                  {candidate.area} <span aria-hidden="true">｜</span> {candidate.genre}
                </p>
                <p className={styles.candidateBudget}>予算：{candidate.budget}</p>
                <div className={styles.tagRow}>
                  {candidate.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className={styles.recommendBox}>
                  <h3>この候補を表示した理由</h3>
                  <ul>
                    {reasons.map((point) => (
                      <li key={point}><span aria-hidden="true">✓</span>{point}</li>
                    ))}
                  </ul>
                </div>
                {displayableActions.length > 0 ? (
                  <div className={styles.externalActions}>
                    {displayableActions.map((action) => (
                      <a key={action.type} href={action.href} target="_blank" rel="noreferrer">
                        {action.label}
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={`${styles.primaryButton} ${selected ? styles.compareSelected : ''}`}
                    aria-pressed={selected}
                    aria-disabled={atLimit}
                    disabled={atLimit}
                    onClick={() => onToggleCompare(candidate.id)}
                  >
                    {selected ? '✓ 比較中' : '比較に入れる'}
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={() => onDetail(candidate.id)}>
                    詳細を見る
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      ) : null}
      {selectionResult.kind === 'matched' ? <div className={styles.stickyAction}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={compareIds.length === 0}
          aria-disabled={compareIds.length === 0}
          onClick={onCompare}
        >
          比較して選ぶ（{compareIds.length}件）
        </button>
      </div> : null}
    </section>
  );
}
