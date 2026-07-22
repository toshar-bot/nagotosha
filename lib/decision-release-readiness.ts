import { DECISION_VERIFICATION_GOVERNANCE_POLICY } from '../data/decision-verification-governance-policy';
import type { DecisionCandidate } from '../types/decision-candidate';
import type { DecisionCandidateEligibility } from '../types/decision-freshness';
import type {
  DecisionCandidateReleaseReadiness,
  DecisionCandidateReleaseReadinessInput,
  DecisionIndependentReview,
  DecisionOperatorReview,
  DecisionReleaseBlocker,
  DecisionReleaseReadyCandidates,
  DecisionReleaseReadyCandidatesInput,
  DecisionReleaseSurface,
  DecisionRelationshipReadinessInput,
  DecisionVerificationArtifact,
  DecisionVerificationFactKey,
  DecisionVerificationGovernancePolicy,
  DecisionVerificationHold,
} from '../types/decision-verification-governance';
import {
  isResolvedRelationshipDisplayable,
  isSafeExternalUrl,
  resolveDecisionCandidateRelationship,
  type DecisionRelationshipResolution,
} from './decision-safety';
import { isValidDecisionISODate } from './decision-eligibility';

const ISO_INSTANT_PATTERN = /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{3})?Z$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const ARTIFACT_CHANNELS = new Set([
  'official-email',
  'official-form',
  'official-instagram',
  'official-document',
]);
const FACT_KEYS = new Set<DecisionVerificationFactKey>([
  'currentStatus',
  'openingHours',
  'price',
  'officialUrl',
  'location',
  'reservationChannel',
  'editorialClassification',
  'relationship',
  'disclosure',
  'visualRights',
]);

type PreviewEvaluation = {
  blockers: DecisionReleaseBlocker[];
  relationship: DecisionRelationshipResolution;
  validArtifacts: readonly DecisionVerificationArtifact[];
  operatorReview?: DecisionOperatorReview;
};

export function getCandidateReleaseReadiness(
  input: DecisionCandidateReleaseReadinessInput,
): DecisionCandidateReleaseReadiness {
  const policy = DECISION_VERIFICATION_GOVERNANCE_POLICY;
  const preview = evaluatePreviewReadiness(input, policy);
  const previewBlockers = uniqueBlockers(preview.blockers);
  const productionBlockers = uniqueBlockers([
    ...previewBlockers,
    ...evaluateProductionReviews(input, preview, policy),
  ]);
  const previewReady = previewBlockers.length === 0;
  const productionReady = productionBlockers.length === 0;
  const blockers = input.surface === 'preview' ? previewBlockers : productionBlockers;

  return {
    candidateId: input.candidate.id,
    surface: input.surface,
    ready: blockers.length === 0,
    verificationStage: productionReady
      ? 'production-verified'
      : previewReady
        ? 'preview-verified'
        : 'provisional',
    evaluatedAsOf: input.evaluatedAsOf,
    blockers,
    productionUseApproved: input.surface === 'production' && productionReady,
  };
}

export function getPreviewReadyCandidates(
  input: DecisionReleaseReadyCandidatesInput,
): DecisionReleaseReadyCandidates {
  return getReadyCandidates(input, 'preview');
}

export function getProductionReadyCandidates(
  input: DecisionReleaseReadyCandidatesInput,
): DecisionReleaseReadyCandidates {
  return getReadyCandidates(input, 'production');
}

function getReadyCandidates(
  input: DecisionReleaseReadyCandidatesInput,
  surface: DecisionReleaseSurface,
): DecisionReleaseReadyCandidates {
  const readyCandidates: DecisionReleaseReadyCandidates['readyCandidates'][number][] = [];

  for (const candidate of input.candidates) {
    const eligibilityMatches = input.eligibleSet.eligibility.filter(
      (entry) => entry.candidateId === candidate.id,
    );
    const relationshipMatches = (input.relationshipResults ?? []).filter(
      (entry) => entry.candidateId === candidate.id,
    );
    const readiness = getCandidateReleaseReadiness({
      candidate,
      eligibility: eligibilityMatches.length === 1 ? eligibilityMatches[0] : undefined,
      artifacts: input.artifacts,
      operatorReviews: input.operatorReviews,
      independentReviews: input.independentReviews,
      holds: input.holds,
      evaluatedAsOf: input.evaluatedAsOf,
      surface,
      relationshipResolution: resolveBatchRelationship(candidate, relationshipMatches),
    });

    if (readiness.ready) {
      readyCandidates.push({
        candidateId: readiness.candidateId,
        verificationStage: readiness.verificationStage,
        productionUseApproved: readiness.productionUseApproved,
      });
    }
  }

  return {
    surface,
    evaluatedAsOf: input.evaluatedAsOf,
    readyCandidates,
    readyCount: readyCandidates.length,
    blockedCandidateCount: input.candidates.length - readyCandidates.length,
  };
}

function evaluatePreviewReadiness(
  input: DecisionCandidateReleaseReadinessInput,
  policy: DecisionVerificationGovernancePolicy,
): PreviewEvaluation {
  const blockers: DecisionReleaseBlocker[] = [];
  const asOfTimestamp = parseISOInstant(input.evaluatedAsOf);
  const asOfDate = input.evaluatedAsOf.slice(0, 10);
  if (asOfTimestamp === undefined) {
    blockers.push({ code: 'invalid-as-of' });
  }

  blockers.push(...evaluateEligibility(
    input.candidate,
    input.eligibility,
    asOfTimestamp === undefined ? undefined : asOfDate,
    policy,
  ));

  const relationship = input.relationshipResolution
    ?? resolveDecisionCandidateRelationship(input.candidate);
  if (!relationshipMatchesCandidate(relationship, input.candidate)
    || !isResolvedRelationshipDisplayable(relationship)) {
    blockers.push({ code: 'relationship-not-displayable', factKey: 'relationship' });
  }

  const requiredFactKeys = getRequiredFactKeys(input.candidate, relationship, policy);
  const artifactEvaluation = evaluateArtifacts(
    input.candidate,
    input.artifacts,
    requiredFactKeys,
    asOfTimestamp,
  );
  blockers.push(...artifactEvaluation.blockers);

  const holdEvaluation = evaluateHolds(
    input.candidate,
    input.holds,
    asOfTimestamp,
  );
  blockers.push(...holdEvaluation.blockers);

  const operatorEvaluation = evaluateOperatorReview(
    input.candidate,
    input.operatorReviews,
    artifactEvaluation.validArtifacts,
    requiredFactKeys,
    asOfTimestamp,
    holdEvaluation.latestResolvedAt,
    policy,
  );
  blockers.push(...operatorEvaluation.blockers);

  return {
    blockers,
    relationship,
    validArtifacts: artifactEvaluation.validArtifacts,
    operatorReview: operatorEvaluation.review,
  };
}

function evaluateEligibility(
  candidate: DecisionCandidate,
  eligibility: DecisionCandidateEligibility | undefined,
  asOfDate: string | undefined,
  policy: DecisionVerificationGovernancePolicy,
): DecisionReleaseBlocker[] {
  if (!eligibility) return [{ code: 'eligibility-missing' }];
  if (
    asOfDate === undefined
    || eligibility.candidateId !== candidate.id
    || eligibility.evaluatedAsOf !== asOfDate
    || eligibility.policyVersion !== policy.freshnessPolicyVersion
  ) {
    return [{ code: 'eligibility-mismatch' }];
  }
  if (!eligibility.eligible || eligibility.exclusions.length > 0) {
    return [{ code: 'phase-2a5-ineligible' }];
  }
  return [];
}

function evaluateArtifacts(
  candidate: DecisionCandidate,
  artifacts: readonly DecisionVerificationArtifact[],
  requiredFactKeys: readonly DecisionVerificationFactKey[],
  asOfTimestamp: number | undefined,
): { blockers: DecisionReleaseBlocker[]; validArtifacts: DecisionVerificationArtifact[] } {
  const blockers: DecisionReleaseBlocker[] = [];
  const candidateArtifacts = artifacts.filter((artifact) => artifact.candidateId === candidate.id);
  const validArtifacts: DecisionVerificationArtifact[] = [];
  const seenIds = new Set<string>();

  if (candidateArtifacts.length === 0) blockers.push({ code: 'artifact-missing' });

  for (const artifact of candidateArtifacts) {
    let valid = true;
    if (!artifact.artifactId.trim() || seenIds.has(artifact.artifactId)) {
      blockers.push({ code: 'artifact-invalid' });
      valid = false;
    }
    seenIds.add(artifact.artifactId);

    if (!SHA256_PATTERN.test(artifact.sha256)) {
      blockers.push({ code: 'artifact-hash-invalid' });
      valid = false;
    }
    const receivedAt = parseISOInstant(artifact.receivedAt);
    if (
      !artifact.sourceIdentity.trim()
      || !ARTIFACT_CHANNELS.has(artifact.channel)
      || artifact.originalStored !== true
      || artifact.factKeys.length === 0
      || hasDuplicates(artifact.factKeys)
      || artifact.factKeys.some((factKey) => !FACT_KEYS.has(factKey))
      || receivedAt === undefined
      || asOfTimestamp === undefined
      || receivedAt > asOfTimestamp
      || (artifact.threadId !== undefined && !artifact.threadId.trim())
      || (artifact.sourceUrl !== undefined && !isSafeExternalUrl(artifact.sourceUrl))
    ) {
      blockers.push({ code: 'artifact-invalid' });
      valid = false;
    }
    if (valid) validArtifacts.push(artifact);
  }

  for (const factKey of requiredFactKeys) {
    if (!validArtifacts.some((artifact) => artifact.factKeys.includes(factKey))) {
      blockers.push({ code: 'artifact-fact-coverage-missing', factKey });
    }
  }

  return { blockers, validArtifacts };
}

function evaluateOperatorReview(
  candidate: DecisionCandidate,
  reviews: readonly DecisionOperatorReview[],
  validArtifacts: readonly DecisionVerificationArtifact[],
  requiredFactKeys: readonly DecisionVerificationFactKey[],
  asOfTimestamp: number | undefined,
  latestResolvedAt: number | undefined,
  policy: DecisionVerificationGovernancePolicy,
): { blockers: DecisionReleaseBlocker[]; review?: DecisionOperatorReview } {
  const blockers: DecisionReleaseBlocker[] = [];
  const candidateReviews = reviews.filter((review) => review.candidateId === candidate.id);
  if (candidateReviews.length === 0) {
    return { blockers: [{ code: 'operator-review-missing' }] };
  }

  const parsedReviews = candidateReviews.map((review) => ({
    review,
    first: parseISOInstant(review.firstReviewedAt),
    recheck: parseISOInstant(review.coolingOffRecheckAt),
  }));
  if (parsedReviews.some((entry) => entry.first === undefined || entry.recheck === undefined)) {
    blockers.push({ code: 'operator-review-invalid' });
  }
  const usableTimestamps = parsedReviews.filter(
    (entry): entry is { review: DecisionOperatorReview; first: number; recheck: number } => (
      entry.first !== undefined && entry.recheck !== undefined
    ),
  );
  if (usableTimestamps.length === 0) return { blockers };

  const latestRecheck = Math.max(...usableTimestamps.map((entry) => entry.recheck));
  const latestMatches = usableTimestamps.filter((entry) => entry.recheck === latestRecheck);
  if (latestMatches.length !== 1) {
    blockers.push({ code: 'operator-review-ambiguous' });
    return { blockers };
  }

  const { review, first, recheck } = latestMatches[0];
  if (
    !isHumanActor(review.reviewerId, policy)
    || !review.note.trim()
    || review.originalArtifactReread !== true
    || asOfTimestamp === undefined
    || first > recheck
    || recheck > asOfTimestamp
  ) {
    blockers.push({ code: 'operator-review-invalid' });
  }
  if (recheck - first < policy.minimumCoolingOffHours * MILLISECONDS_PER_HOUR) {
    blockers.push({ code: 'cooling-off-incomplete' });
  }
  if (review.result !== 'confirmed') {
    blockers.push({ code: 'operator-review-not-confirmed' });
  }
  if (latestResolvedAt !== undefined && recheck < latestResolvedAt) {
    blockers.push({ code: 'reverification-required' });
  }

  const referencedArtifacts = resolveReferencedArtifacts(
    review.sourceArtifactIds,
    validArtifacts,
  );
  if (
    review.sourceArtifactIds.length === 0
    || hasDuplicates(review.sourceArtifactIds)
    || referencedArtifacts.length !== review.sourceArtifactIds.length
    || referencedArtifacts.some((artifact) => {
      const receivedAt = parseISOInstant(artifact.receivedAt);
      return receivedAt === undefined || receivedAt > first;
    })
  ) {
    blockers.push({ code: 'operator-review-invalid' });
  }

  for (const factKey of requiredFactKeys) {
    if (!review.factKeysReviewed.includes(factKey)
      || !referencedArtifacts.some((artifact) => artifact.factKeys.includes(factKey))) {
      blockers.push({ code: 'operator-fact-coverage-missing', factKey });
    }
  }
  if (hasDuplicates(review.factKeysReviewed)) {
    blockers.push({ code: 'operator-review-invalid' });
  }

  return { blockers, review };
}

function evaluateProductionReviews(
  input: DecisionCandidateReleaseReadinessInput,
  preview: PreviewEvaluation,
  policy: DecisionVerificationGovernancePolicy,
): DecisionReleaseBlocker[] {
  const blockers: DecisionReleaseBlocker[] = [];
  const requiredScopes: DecisionIndependentReview['factScope'][] = ['relationship'];
  if (preview.relationship.relationship === 'pr' || preview.relationship.relationship === 'owned') {
    requiredScopes.push('disclosure');
  }
  if (input.candidate.visual.kind === 'photo') requiredScopes.push('visual-rights');

  const asOfTimestamp = parseISOInstant(input.evaluatedAsOf);
  for (const scope of requiredScopes) {
    blockers.push(...evaluateIndependentReview(
      input.candidate,
      scope,
      input.independentReviews,
      preview.validArtifacts,
      preview.operatorReview,
      asOfTimestamp,
      policy,
    ));
  }
  return blockers;
}

function evaluateIndependentReview(
  candidate: DecisionCandidate,
  scope: DecisionIndependentReview['factScope'],
  reviews: readonly DecisionIndependentReview[],
  validArtifacts: readonly DecisionVerificationArtifact[],
  operatorReview: DecisionOperatorReview | undefined,
  asOfTimestamp: number | undefined,
  policy: DecisionVerificationGovernancePolicy,
): DecisionReleaseBlocker[] {
  const matchingReviews = reviews.filter(
    (review) => review.candidateId === candidate.id && review.factScope === scope,
  );
  if (matchingReviews.length === 0) {
    return [{ code: 'independent-review-missing', factScope: scope }];
  }

  const parsed = matchingReviews.map((review) => ({
    review,
    reviewedAt: parseISOInstant(review.reviewedAt),
  }));
  if (parsed.some((entry) => entry.reviewedAt === undefined)) {
    return [{ code: 'independent-review-invalid', factScope: scope }];
  }
  const validTimestamps = parsed as Array<{ review: DecisionIndependentReview; reviewedAt: number }>;
  const latestTimestamp = Math.max(...validTimestamps.map((entry) => entry.reviewedAt));
  const latestMatches = validTimestamps.filter((entry) => entry.reviewedAt === latestTimestamp);
  if (latestMatches.length !== 1) {
    return [{ code: 'independent-review-ambiguous', factScope: scope }];
  }

  const { review, reviewedAt } = latestMatches[0];
  const expectedFactKey = independentScopeFactKey(scope);
  const referencedArtifacts = resolveReferencedArtifacts(
    review.sourceArtifactIds,
    validArtifacts,
  );
  if (
    !operatorReview
    || review.operatorId !== operatorReview.reviewerId
    || review.reviewerId === review.operatorId
    || !isHumanActor(review.operatorId, policy)
    || !isHumanActor(review.reviewerId, policy)
    || !review.note.trim()
    || review.originalArtifactReviewed !== true
    || asOfTimestamp === undefined
    || reviewedAt > asOfTimestamp
    || reviewedAt < (parseISOInstant(operatorReview.coolingOffRecheckAt) ?? Number.POSITIVE_INFINITY)
    || review.sourceArtifactIds.length === 0
    || hasDuplicates(review.sourceArtifactIds)
    || referencedArtifacts.length !== review.sourceArtifactIds.length
    || !referencedArtifacts.some((artifact) => artifact.factKeys.includes(expectedFactKey))
    || referencedArtifacts.some((artifact) => (
      (parseISOInstant(artifact.receivedAt) ?? Number.POSITIVE_INFINITY) > reviewedAt
    ))
  ) {
    return [{ code: 'independent-review-invalid', factScope: scope }];
  }

  if (review.result === 'rejected') {
    return [{ code: 'independent-review-rejected', factScope: scope }];
  }
  if (review.result === 'conflicting') {
    return [{ code: 'independent-review-conflicting', factScope: scope }];
  }
  return [];
}

function evaluateHolds(
  candidate: DecisionCandidate,
  holds: readonly DecisionVerificationHold[],
  asOfTimestamp: number | undefined,
): { blockers: DecisionReleaseBlocker[]; latestResolvedAt?: number } {
  const blockers: DecisionReleaseBlocker[] = [];
  const candidateHolds = holds.filter((hold) => hold.candidateId === candidate.id);
  const seenIds = new Set<string>();
  let latestResolvedAt: number | undefined;

  for (const hold of candidateHolds) {
    const recordedAt = parseISOInstant(hold.recordedAt);
    const resolvedAt = hold.resolvedAt === undefined
      ? undefined
      : parseISOInstant(hold.resolvedAt);
    if (
      !hold.holdId.trim()
      || seenIds.has(hold.holdId)
      || !hold.note.trim()
      || recordedAt === undefined
      || (hold.status === 'active' && hold.resolvedAt !== undefined)
      || (hold.status === 'resolved' && (
        resolvedAt === undefined || resolvedAt < recordedAt
      ))
    ) {
      blockers.push({ code: 'governance-hold-invalid', holdReason: hold.reason });
      continue;
    }
    seenIds.add(hold.holdId);
    if (asOfTimestamp === undefined || recordedAt > asOfTimestamp) continue;

    if (hold.status === 'active' || (resolvedAt !== undefined && resolvedAt > asOfTimestamp)) {
      blockers.push({ code: 'governance-hold-active', holdReason: hold.reason });
    } else if (resolvedAt !== undefined
      && (latestResolvedAt === undefined || resolvedAt > latestResolvedAt)) {
      latestResolvedAt = resolvedAt;
    }
  }

  return { blockers, latestResolvedAt };
}

function getRequiredFactKeys(
  candidate: DecisionCandidate,
  relationship: DecisionRelationshipResolution,
  policy: DecisionVerificationGovernancePolicy,
): DecisionVerificationFactKey[] {
  const keys = [...policy.requiredBaseFactKeys];
  if (candidate.reservationAvailability === 'channel-available'
    || candidate.actions.some((action) => action.type === 'reservation')) {
    keys.push('reservationChannel');
  }
  if (relationship.relationship === 'pr' || relationship.relationship === 'owned') {
    keys.push('disclosure');
  }
  if (candidate.visual.kind === 'photo') keys.push('visualRights');
  return Array.from(new Set(keys));
}

function resolveBatchRelationship(
  candidate: DecisionCandidate,
  matches: readonly DecisionRelationshipReadinessInput[],
): DecisionRelationshipResolution | undefined {
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0].resolution;
  const fallback = resolveDecisionCandidateRelationship(candidate);
  return {
    ...fallback,
    displayableOnRedesignedSurfaces: false,
    validationErrors: [...fallback.validationErrors, 'duplicate relationship readiness input'],
  };
}

function relationshipMatchesCandidate(
  relationship: DecisionRelationshipResolution,
  candidate: DecisionCandidate,
): boolean {
  const target = candidate.relationshipTarget;
  if (relationship.target.kind !== target.kind) return false;
  if (relationship.target.articleId !== target.articleId) return false;
  if (target.kind === 'roundup-item') {
    return relationship.target.kind === 'roundup-item'
      && relationship.target.itemId === target.itemId;
  }
  return relationship.postId === target.articleId;
}

function resolveReferencedArtifacts(
  ids: readonly string[],
  artifacts: readonly DecisionVerificationArtifact[],
): DecisionVerificationArtifact[] {
  return ids.flatMap((id) => artifacts.filter((artifact) => artifact.artifactId === id));
}

function independentScopeFactKey(
  scope: DecisionIndependentReview['factScope'],
): DecisionVerificationFactKey {
  if (scope === 'visual-rights') return 'visualRights';
  return scope;
}

function isHumanActor(
  actorId: string,
  policy: DecisionVerificationGovernancePolicy,
): boolean {
  const normalized = actorId.trim().toLowerCase();
  const tokens = normalized.split(/[:._-]+/).filter(Boolean);
  return normalized.length > 0
    && !policy.prohibitedActorIds.includes(normalized)
    && !tokens.some((token) => policy.prohibitedActorIds.includes(token));
}

function parseISOInstant(value: string): number | undefined {
  const match = ISO_INSTANT_PATTERN.exec(value);
  if (!match || !isValidDecisionISODate(match[1])) return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function hasDuplicates<T>(values: readonly T[]): boolean {
  return new Set(values).size !== values.length;
}

function uniqueBlockers(blockers: readonly DecisionReleaseBlocker[]): DecisionReleaseBlocker[] {
  const seen = new Set<string>();
  return blockers.filter((blocker) => {
    const key = [
      blocker.code,
      blocker.factKey ?? '',
      blocker.factScope ?? '',
      blocker.holdReason ?? '',
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
