import type { DecisionV3Candidate } from '@/types/decision-v3';
import styles from './decision-v3.module.css';

type Props = {
  candidate: DecisionV3Candidate;
  density?: 'default' | 'compact';
};

export default function ExternalCandidateProvenanceV3({ candidate, density = 'default' }: Props) {
  const provenance = candidate.provenance;
  if (!provenance) return null;

  const { label, license } = provenance.attribution;
  const attribution = license && !label.includes(license) ? `${label} / ${license}` : label;

  return (
    <div
      className={styles.externalCandidateSource}
      data-external-provenance="true"
      data-external-provider={provenance.provider}
      data-provenance-density={density}
    >
      <strong>{provenance.label}</strong>
      <p>{provenance.reason}</p>
      <p>人数／気分の適性は未確認</p>
      <span>{attribution}</span>
      {provenance.duplicateStatus === 'unresolved' ? <p>提供元間の同一性は確認中です</p> : null}
    </div>
  );
}
