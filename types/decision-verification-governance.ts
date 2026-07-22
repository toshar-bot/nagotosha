import type { DecisionCandidate } from './decision-candidate';
import type {
  DecisionCandidateEligibility,
  EligibleDecisionCandidateSet,
} from './decision-freshness';
import type { DecisionRelationshipResolution } from '../lib/decision-safety';

export type DecisionVerificationStage =
  | 'provisional'
  | 'preview-verified'
  | 'production-verified';

export type DecisionVerificationFactKey =
  | 'currentStatus'
  | 'openingHours'
  | 'price'
  | 'officialUrl'
  | 'location'
  | 'reservationChannel'
  | 'editorialClassification'
  | 'relationship'
  | 'disclosure'
  | 'visualRights';

export type DecisionVerificationArtifactChannel =
  | 'official-email'
  | 'official-form'
  | 'official-instagram'
  | 'official-document'
  /** Internal checks for commercial, ownership, partnership, or personal interests. */
  | 'internal-ledger'
  /** Human-approved editorial classification, rationale, or disclosure copy. */
  | 'editorial-note';

export type DecisionVerificationArtifact = {
  artifactId: string;
  candidateId: string;
  factKeys: readonly DecisionVerificationFactKey[];
  channel: DecisionVerificationArtifactChannel;
  sourceIdentity: string;
  receivedAt: string;
  threadId?: string;
  sourceUrl?: string;
  sha256: string;
  originalStored: true;
  /** Exact human-approved copy; required when this artifact verifies disclosure. */
  approvedDisclosureText?: string;
};

export type DecisionOperatorReview = {
  candidateId: string;
  reviewerId: string;
  firstReviewedAt: string;
  coolingOffRecheckAt: string;
  sourceArtifactIds: readonly string[];
  factKeysReviewed: readonly DecisionVerificationFactKey[];
  /** Explicit confirmation that the stored originals, not a summary, were reread. */
  originalArtifactReread: true;
  result: 'confirmed' | 'conflicting' | 'incomplete';
  note: string;
};

export type DecisionIndependentReview = {
  candidateId: string;
  factScope: 'relationship' | 'disclosure' | 'visual-rights';
  operatorId: string;
  reviewerId: string;
  reviewedAt: string;
  /** Identifies the stored originals reviewed independently. */
  sourceArtifactIds: readonly string[];
  originalArtifactReviewed: true;
  result: 'approved' | 'rejected' | 'conflicting';
  note: string;
};

export type DecisionVerificationHoldReason =
  | 'source-conflict'
  | 'source-correction'
  | 'relationship-reclassification-pending'
  | 'evidence-missing';

export type DecisionVerificationHold = {
  holdId: string;
  candidateId: string;
  reason: DecisionVerificationHoldReason;
  recordedAt: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  note: string;
};

export type DecisionReleaseSurface = 'preview' | 'production';

export type DecisionVerificationGovernancePolicy = {
  version: string;
  freshnessPolicyVersion: string;
  minimumCoolingOffHours: number;
  requiredBaseFactKeys: readonly DecisionVerificationFactKey[];
  allowedArtifactChannelsByFact: Readonly<
    Record<DecisionVerificationFactKey, readonly DecisionVerificationArtifactChannel[]>
  >;
  prohibitedActorIds: readonly string[];
};

export type DecisionReleaseBlockerCode =
  | 'invalid-as-of'
  | 'eligibility-missing'
  | 'eligibility-mismatch'
  | 'phase-2a5-ineligible'
  | 'relationship-not-displayable'
  | 'artifact-missing'
  | 'artifact-invalid'
  | 'artifact-hash-invalid'
  | 'artifact-source-not-approved'
  | 'artifact-fact-coverage-missing'
  | 'operator-review-missing'
  | 'operator-review-ambiguous'
  | 'operator-review-invalid'
  | 'operator-review-not-confirmed'
  | 'cooling-off-incomplete'
  | 'operator-fact-coverage-missing'
  | 'governance-hold-invalid'
  | 'governance-hold-active'
  | 'reverification-required'
  | 'independent-review-missing'
  | 'independent-review-ambiguous'
  | 'independent-review-invalid'
  | 'independent-review-rejected'
  | 'independent-review-conflicting';

export type DecisionReleaseBlocker = {
  code: DecisionReleaseBlockerCode;
  factKey?: DecisionVerificationFactKey;
  factScope?: DecisionIndependentReview['factScope'];
  holdReason?: DecisionVerificationHoldReason;
};

export type DecisionCandidateReleaseReadiness = {
  candidateId: string;
  surface: DecisionReleaseSurface;
  ready: boolean;
  verificationStage: DecisionVerificationStage;
  evaluatedAsOf: string;
  blockers: readonly DecisionReleaseBlocker[];
  productionUseApproved: boolean;
};

export type DecisionRelationshipReadinessInput = {
  candidateId: string;
  resolution: DecisionRelationshipResolution;
};

export type DecisionCandidateReleaseReadinessInput = {
  candidate: DecisionCandidate;
  eligibility?: DecisionCandidateEligibility;
  artifacts: readonly DecisionVerificationArtifact[];
  operatorReviews: readonly DecisionOperatorReview[];
  independentReviews: readonly DecisionIndependentReview[];
  holds: readonly DecisionVerificationHold[];
  evaluatedAsOf: string;
  surface: DecisionReleaseSurface;
  relationshipResolution?: DecisionRelationshipResolution;
};

export type DecisionReleaseReadyCandidate = {
  candidateId: string;
  verificationStage: DecisionVerificationStage;
  productionUseApproved: boolean;
};

/** Client-safe collection: blocked candidate identity and blocker details are omitted. */
export type DecisionReleaseReadyCandidates = {
  surface: DecisionReleaseSurface;
  evaluatedAsOf: string;
  readyCandidates: readonly DecisionReleaseReadyCandidate[];
  readyCount: number;
  blockedCandidateCount: number;
};

export type DecisionReleaseReadyCandidatesInput = {
  candidates: readonly DecisionCandidate[];
  eligibleSet: EligibleDecisionCandidateSet;
  artifacts: readonly DecisionVerificationArtifact[];
  operatorReviews: readonly DecisionOperatorReview[];
  independentReviews: readonly DecisionIndependentReview[];
  holds: readonly DecisionVerificationHold[];
  evaluatedAsOf: string;
  relationshipResults?: readonly DecisionRelationshipReadinessInput[];
};
