import type {
  DecisionFreshnessPolicy,
  DecisionFreshnessPolicyKey,
} from '../types/decision-freshness';
import type { DecisionCandidateEvidence } from '../types/decision-candidate';

export const DECISION_FRESHNESS_POLICY: DecisionFreshnessPolicy = {
  version: 'phase-2a.5-v1',
  refreshAfterDays: {
    currentStatus: 14,
    openingHours: 14,
    price: 30,
    reservationChannel: 14,
    officialUrl: 90,
    location: 180,
    editorialClassification: 180,
  },
  mapActionRefreshAfterDays: 90,
};

export function getDecisionEvidencePolicyKey(
  evidence: DecisionCandidateEvidence,
): DecisionFreshnessPolicyKey | undefined {
  if (evidence.kind === 'editorial-classification') return 'editorialClassification';
  if (evidence.kind !== 'official-fact') return undefined;

  switch (evidence.field) {
    case 'currentStatus':
    case 'openingHours':
    case 'price':
    case 'reservationChannel':
    case 'officialUrl':
    case 'location':
      return evidence.field;
    default:
      return undefined;
  }
}
