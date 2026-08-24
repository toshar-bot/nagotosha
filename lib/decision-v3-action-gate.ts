import type { CandidateAction } from '@/types/decision-v3';

/** A Decision V3 action is rendered only with an explicit verified URL/source. */
export function isDecisionV3ActionDisplayable(action: CandidateAction): boolean {
  return (
    action.availability === 'verified'
    && Boolean(action.href?.trim())
    && Boolean(action.verifiedAt?.trim())
    && Boolean(action.source?.trim())
  );
}
