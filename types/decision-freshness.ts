import type { DecisionCandidate } from './decision-candidate';
import type {
  DecisionChoiceCoverage,
  DecisionMatchReason,
  DecisionRelaxableDimension,
  DecisionRequiredChoice,
  RankedDecisionCandidate,
} from './decision-match';

export type ISODate = string;

export type DecisionFreshnessReviewStatus =
  | 'verified'
  | 'provisional'
  | 'conflicting'
  | 'failed';

export type DecisionEvidenceConflict = {
  importance: 'important' | 'non-important';
  status: 'resolved' | 'unresolved';
  sourceUrl?: string;
  resolutionReason?: string;
  resolvedAt?: ISODate;
};

export type DecisionCandidateRelationshipReview =
  | {
      reviewStatus: 'verified';
      confirmedBy: 'user';
      /** Human confirmation completion time. Date-only evidence cannot populate this field. */
      confirmedAt: string;
      note: string;
    }
  | {
      reviewStatus: 'provisional' | 'conflicting' | 'failed';
      note: string;
      confirmedBy?: never;
      confirmedAt?: never;
    };

export type DecisionEvidenceFreshnessRecord = {
  evidenceId: string;
  reviewStatus: DecisionFreshnessReviewStatus;
  refreshAfterDaysOverride?: number;
  lastFailureReason?: string;
  conflicts?: readonly DecisionEvidenceConflict[];
  /** Candidate-level internal relationship audit attached to one authoritative evidence record. */
  relationshipReview?: DecisionCandidateRelationshipReview;
};

export type DecisionFreshnessPolicyKey =
  | 'currentStatus'
  | 'openingHours'
  | 'price'
  | 'reservationChannel'
  | 'officialUrl'
  | 'location'
  | 'editorialClassification';

export type DecisionFreshnessPolicy = {
  version: string;
  refreshAfterDays: Readonly<Record<DecisionFreshnessPolicyKey, number>>;
  mapActionRefreshAfterDays: number;
};

export type DecisionEligibilityExclusionClass =
  | 'stale-data'
  | 'conflicting-data'
  | 'failed-verification'
  | 'relationship-blocked'
  | 'missing-required-evidence'
  | 'condition-no-match';

export type DecisionEligibilityExclusion = {
  class: DecisionEligibilityExclusionClass;
  code:
    | 'invalid-as-of'
    | 'relationship-not-displayable'
    | 'relationship-review-missing'
    | 'relationship-review-not-confirmed'
    | 'relationship-review-invalid'
    | 'status-not-available'
    | 'missing-evidence'
    | 'duplicate-evidence'
    | 'missing-freshness-record'
    | 'duplicate-freshness-record'
    | 'derived-source-unusable'
    | 'derived-evidence-cycle'
    | 'invalid-evidence-date'
    | 'invalid-refresh-days'
    | 'evidence-stale'
    | 'review-provisional'
    | 'review-conflicting'
    | 'review-failed'
    | 'important-conflict-unresolved'
    | 'resolved-conflict-missing-reason'
    | 'invalid-conflict-metadata'
    | 'invalid-action'
    | 'action-evidence-mismatch'
    | 'map-action-stale'
    | 'visual-not-displayable';
  evidenceId?: string;
  field?: string;
  staleOn?: ISODate;
};

export type DecisionCandidateEligibility = {
  candidateId: string;
  eligible: boolean;
  evaluatedAsOf: ISODate;
  policyVersion: string;
  exclusions: readonly DecisionEligibilityExclusion[];
  primaryExclusion?: DecisionEligibilityExclusion;
};

export type EligibleDecisionCandidateSet = {
  evaluatedAsOf: ISODate;
  policyVersion: string;
  candidates: readonly DecisionCandidate[];
  eligibility: readonly DecisionCandidateEligibility[];
};

export type DecisionEvidenceFreshnessEvaluation = {
  evidenceId: string;
  usable: boolean;
  evaluatedAsOf: ISODate;
  refreshAfterDays?: number;
  staleOn?: ISODate;
  exclusions: readonly DecisionEligibilityExclusion[];
};

export type DecisionDataAvailabilityStatus =
  | 'incomplete'
  | 'matched'
  | 'no-match'
  | 'data-unavailable';

/**
 * UI-safe availability result. Candidates blocked by freshness, evidence, or
 * relationship checks are represented only by a count, never by identity.
 */
export type DecisionDataAvailabilityResult = {
  status: DecisionDataAvailabilityStatus;
  evaluatedAsOf: ISODate;
  policyVersion: string;
  rankedCandidates: readonly RankedDecisionCandidate[];
  matchReasons: Readonly<Record<string, readonly DecisionMatchReason[]>>;
  relaxableDimensions: readonly DecisionRelaxableDimension[];
  incompleteChoices: readonly DecisionRequiredChoice[];
  choiceCoverage: DecisionChoiceCoverage;
  unavailableMatchCount: number;
};

export type DecisionFreshnessValidationResult = {
  valid: boolean;
  errors: readonly string[];
};
