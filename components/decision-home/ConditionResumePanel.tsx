'use client';

import type { ConditionSummary } from '@/types/decision-home';
import styles from './home-functional.module.css';

type ConditionResumePanelProps = {
  readonly conditionSummary: ConditionSummary;
  readonly demo: boolean;
  readonly onEdit: () => void;
  readonly onContinue: () => void;
};

export default function ConditionResumePanel({
  conditionSummary,
  demo,
  onEdit,
  onContinue,
}: ConditionResumePanelProps) {
  return (
    <section className={styles.conditionResume} aria-labelledby="condition-resume-title">
      <div className={styles.resumeHeading}>
        <h2 id="condition-resume-title">選んでいる条件</h2>
        {demo ? <span className={styles.demoBadge}>DEMO</span> : null}
      </div>
      <ul className={styles.conditionList}>
        <li>{conditionSummary.party}</li>
        <li>{conditionSummary.budget}</li>
        <li>{conditionSummary.mood}</li>
        <li>{conditionSummary.area}</li>
      </ul>
      <div className={styles.resumeActions}>
        <button type="button" onClick={onEdit}>条件を変える</button>
        <button type="button" className={styles.resumePrimary} onClick={onContinue}>
          この条件で続ける
        </button>
      </div>
    </section>
  );
}
