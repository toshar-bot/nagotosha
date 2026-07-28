import { DEMO_CANDIDATES, isCandidateActionDisplayable } from '@/data/decision-v3-demo';
import { CandidatePhotoV3 } from './CandidatePhotoV3';
import { MapFallbackV3 } from './MapFallbackV3';
import styles from './decision-v3.module.css';

type Props = {
  candidateId: string;
  inCompare: boolean;
  onBack: () => void;
  onToggleCompare: (id: string) => void;
  onShare: () => void;
};

export function DetailV3({ candidateId, inCompare, onBack, onToggleCompare, onShare }: Props) {
  const candidate = DEMO_CANDIDATES.find((item) => item.id === candidateId) ?? DEMO_CANDIDATES[0];
  const displayableActions = candidate.actions.filter(isCandidateActionDisplayable);
  return (
    <section className={styles.screenStage} aria-labelledby="detail-title">
      <header className={styles.detailHeader}>
        <button type="button" className={styles.iconButton} onClick={onBack} aria-label="候補一覧へ戻る">←</button>
        <button type="button" className={styles.iconButton} onClick={onShare} aria-label="この候補を共有する">↗</button>
      </header>
      <div className={styles.detailHero}>
        <CandidatePhotoV3 candidate={candidate} ratio="detail" />
        <span className={styles.candidateLabel}>{candidate.neutralLabel}</span>
      </div>
      <div className={styles.detailBody}>
        <h1 id="detail-title">{candidate.name}</h1>
        <p className={styles.detailMeta}>{candidate.area} ｜ {candidate.genre}　予算：{candidate.budget}</p>
        <div className={styles.tagRow}>
          {candidate.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <section className={styles.recommendBox}>
          <h2>おすすめポイント</h2>
          <ul>
            {candidate.points.map((point) => (
              <li key={point}><span aria-hidden="true">✓</span>{point}</li>
            ))}
          </ul>
        </section>
        <section className={styles.infoSection}>
          <h2>基本情報</h2>
          <dl className={styles.infoTable}>
            <div><dt>エリア</dt><dd>{candidate.area}</dd></div>
            <div><dt>アクセス</dt><dd>{candidate.facts.access}</dd></div>
            <div><dt>雰囲気</dt><dd>{candidate.facts.atmosphere}</dd></div>
            <div><dt>禁煙・喫煙</dt><dd>{candidate.facts.smoking}</dd></div>
            <div><dt>席</dt><dd>{candidate.facts.seats}</dd></div>
            <div><dt>予約</dt><dd>{candidate.facts.reservation}</dd></div>
          </dl>
        </section>
        <section className={styles.mapFallbackDetail} aria-labelledby="map-title">
          <h2 id="map-title">アクセス</h2>
          <MapFallbackV3 compact />
        </section>
        {displayableActions.length > 0 ? (
          <div className={styles.externalActions}>
            {displayableActions.map((action) => (
              <a key={action.type} href={action.href} target="_blank" rel="noreferrer">
                {action.label}
              </a>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          className={`${styles.primaryButton} ${inCompare ? styles.compareSelected : ''}`}
          aria-pressed={inCompare}
          onClick={() => onToggleCompare(candidate.id)}
        >
          {inCompare ? '✓ 比較中' : '比較に入れる'}
        </button>
        <section className={styles.deepFacts}>
          <h2>選ぶ前に確認したいこと</h2>
          <p>向いている人：{candidate.facts.solo}。{candidate.facts.longStay}。</p>
          <p>未確認項目はDEMO上でも断定せず、確認状態をそのまま表示しています。</p>
        </section>
      </div>
    </section>
  );
}
