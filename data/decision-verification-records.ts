import type {
  DecisionIndependentReview,
  DecisionOperatorReview,
  DecisionVerificationArtifact,
  DecisionVerificationHold,
} from '../types/decision-verification-governance';

/**
 * Real records stay empty until stored originals and explicit human reviews exist.
 * Synthetic records belong only in external test fixtures.
 */
export const DECISION_VERIFICATION_ARTIFACTS: readonly DecisionVerificationArtifact[] = [];
export const DECISION_OPERATOR_REVIEWS: readonly DecisionOperatorReview[] = [];
export const DECISION_INDEPENDENT_REVIEWS: readonly DecisionIndependentReview[] = [];
export const DECISION_VERIFICATION_HOLDS: readonly DecisionVerificationHold[] = [];
