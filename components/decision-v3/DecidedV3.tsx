'use client';

import { DEMO_CANDIDATES, isCandidateActionDisplayable } from '@/data/decision-v3-demo';
import { formatDecisionV3PartyDisplayText } from '@/lib/decision-v3-party-handoff';
import { CandidatePhotoV3 } from './CandidatePhotoV3';
import styles from './decision-v3.module.css';

type Props = {
  candidateId: string;
  onCandidates: () => void;
};

export function DecidedV3({ candidateId, onCandidates }: Props) {
  const candidate = DEMO_CANDIDATES.find((item) => item.id === candidateId) ?? DEMO_CANDIDATES[0];
  const displayableActions = candidate.actions.filter(isCandidateActionDisplayable);
  return (
    <section className={styles.decidedStage} aria-labelledby="decided-title">
      <div className={styles.confetti} aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => (
          <i key={index} style={{ '--i': index } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.medal}>
        <span className={styles.medalRibbonLeft} aria-hidden="true" />
        <span className={styles.medalRibbonRight} aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decision/v3/mascot/toshar_confirm.png" alt="" aria-hidden="true" width={1024} height={1024} />
      </div>
      <header className={styles.decidedHeader}>
        <h1 id="decided-title">今日は<br />ここにしました！</h1>
        <p>素敵な時間になりますように。</p>
      </header>
      <article className={styles.decidedCard}>
        <h2>{candidate.name}</h2>
        <p className={styles.detailMeta}>{candidate.area} ｜ {candidate.genre}　予算：{candidate.budget}</p>
        <CandidatePhotoV3 candidate={candidate} />
        <div className={styles.tagRow}>
          {candidate.tags.map((tag) => (
            <span key={tag}>{formatDecisionV3PartyDisplayText(tag)}</span>
          ))}
        </div>
        <section className={styles.recommendBox}>
          <h3>おすすめポイント</h3>
          <ul>
            {candidate.points.map((point) => (
              <li key={point}><span aria-hidden="true">✓</span>{point}</li>
            ))}
          </ul>
        </section>
      </article>
      <div className={styles.decisionActions}>
        {displayableActions.map((action, index) => (
          <a
            key={action.type}
            href={action.href}
            target="_blank"
            rel="noreferrer"
            className={index === 0 ? styles.primaryButton : styles.secondaryButton}
          >
            {action.label}
          </a>
        ))}
        <button type="button" className={styles.secondaryButton} onClick={onCandidates}>
          他の候補をもう一度見る
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.presentMascot}
        src="/decision/v3/mascot/toshar_present.png"
        alt=""
        aria-hidden="true"
        width={1024}
        height={1024}
      />
    </section>
  );
}
