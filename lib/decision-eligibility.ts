import {
  DECISION_FRESHNESS_POLICY,
  getDecisionEvidencePolicyKey,
} from '../data/decision-freshness-policy';
import type {
  DecisionCandidate,
  DecisionCandidateEvidence,
  DecisionEditorialClassificationEvidence,
  DecisionEditorialClassificationField,
  DecisionOfficialFactEvidence,
  DecisionOfficialFactField,
} from '../types/decision-candidate';
import type {
  DecisionCandidateEligibility,
  DecisionDataAvailabilityResult,
  DecisionEligibilityExclusion,
  DecisionEvidenceFreshnessEvaluation,
  DecisionEvidenceFreshnessRecord,
  DecisionFreshnessPolicy,
  DecisionFreshnessValidationResult,
  EligibleDecisionCandidateSet,
  ISODate,
} from '../types/decision-freshness';
import type { DecisionChoiceCoverage, DecisionMatchQuery } from '../types/decision-match';
import {
  calculateDecisionChoiceCoverage,
  matchDecisionCandidates,
} from './decision-matching';
import {
  isDecisionActionDisplayable,
  isResolvedRelationshipDisplayable,
  isSafeExternalUrl,
  isSafeInternalUrl,
  resolveDecisionCandidateRelationship,
  resolveDecisionCandidateVisual,
} from './decision-safety';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const REQUIRED_OFFICIAL_FIELDS: readonly DecisionOfficialFactField[] = [
  'currentStatus',
  'openingHours',
  'price',
  'officialUrl',
  'location',
];

const REQUIRED_EDITORIAL_FIELDS: readonly DecisionEditorialClassificationField[] = [
  'partyTypes',
  'budgetBand',
  'moodTags',
  'reservationNeed',
];

type ParsedISODate = {
  year: number;
  month: number;
  day: number;
};

export function isValidDecisionISODate(value: string | undefined): value is ISODate {
  if (!value) return false;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return (
    year >= 1
    && month >= 1
    && month <= 12
    && day >= 1
    && day <= getDaysInMonth(year, month)
  );
}

export function addDecisionCalendarDays(
  value: ISODate,
  days: number,
): ISODate | undefined {
  const parsed = parseISODate(value);
  if (!parsed || !Number.isInteger(days) || days < 0) return undefined;

  let { year, month, day } = parsed;
  let remaining = days;
  while (remaining > 0) {
    day += 1;
    if (day > getDaysInMonth(year, month)) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    remaining -= 1;
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getDecisionEvidenceFreshness(
  evidenceId: string,
  evidenceRecords: readonly DecisionCandidateEvidence[],
  freshnessRecords: readonly DecisionEvidenceFreshnessRecord[],
  asOf: ISODate,
  policy: DecisionFreshnessPolicy = DECISION_FRESHNESS_POLICY,
): DecisionEvidenceFreshnessEvaluation {
  const evidenceMatches = evidenceRecords.filter((evidence) => evidence.id === evidenceId);
  if (evidenceMatches.length !== 1) {
    return createEvidenceEvaluation(evidenceId, asOf, [{
      class: 'missing-required-evidence',
      code: evidenceMatches.length === 0 ? 'missing-evidence' : 'duplicate-evidence',
      evidenceId,
    }]);
  }

  return evaluateEvidenceFreshness(
    evidenceMatches[0],
    evidenceRecords,
    freshnessRecords,
    asOf,
    policy,
    new Set<string>(),
  );
}

export function validateDecisionFreshnessRecords(
  candidates: readonly DecisionCandidate[],
  evidenceRecords: readonly DecisionCandidateEvidence[],
  freshnessRecords: readonly DecisionEvidenceFreshnessRecord[],
): DecisionFreshnessValidationResult {
  const errors: string[] = [];
  const evidenceIds = new Set(evidenceRecords.map((evidence) => evidence.id));
  const seenFreshnessIds = new Set<string>();

  for (const record of freshnessRecords) {
    if (!record.evidenceId.trim()) {
      errors.push('freshness evidenceId is required');
      continue;
    }
    if (seenFreshnessIds.has(record.evidenceId)) {
      errors.push(`duplicate freshness record: ${record.evidenceId}`);
    }
    seenFreshnessIds.add(record.evidenceId);
    if (!evidenceIds.has(record.evidenceId)) {
      errors.push(`${record.evidenceId}: freshness record references missing evidence`);
    }
    errors.push(...validateFreshnessRecord(record));
  }

  for (const candidate of candidates) {
    const requiredEvidence = getRequiredCandidateEvidence(candidate, evidenceRecords);
    for (const requirement of requiredEvidence) {
      if (requirement.matches.length !== 1) {
        errors.push(
          `${candidate.id}: ${requirement.field} requires exactly one evidence record`,
        );
        continue;
      }
      const evidenceId = requirement.matches[0].id;
      const metadataCount = freshnessRecords.filter(
        (record) => record.evidenceId === evidenceId,
      ).length;
      if (metadataCount !== 1) {
        errors.push(`${candidate.id}: ${evidenceId} requires exactly one freshness record`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getCandidateEligibility(
  candidate: DecisionCandidate,
  evidenceRecords: readonly DecisionCandidateEvidence[],
  freshnessRecords: readonly DecisionEvidenceFreshnessRecord[],
  asOf: ISODate,
  policy: DecisionFreshnessPolicy = DECISION_FRESHNESS_POLICY,
): DecisionCandidateEligibility {
  const exclusions: DecisionEligibilityExclusion[] = [];
  if (!isValidDecisionISODate(asOf)) {
    exclusions.push({ class: 'failed-verification', code: 'invalid-as-of' });
    return createEligibility(candidate.id, asOf, policy.version, exclusions);
  }

  const relationship = resolveDecisionCandidateRelationship(candidate);
  if (!isResolvedRelationshipDisplayable(relationship)) {
    exclusions.push({
      class: 'relationship-blocked',
      code: 'relationship-not-displayable',
    });
  }
  exclusions.push(...evaluateRelationshipReview(candidate, freshnessRecords));

  if (
    candidate.visual.kind !== 'none'
    && resolveDecisionCandidateVisual(candidate.visual).kind === 'none'
  ) {
    exclusions.push({
      class: 'failed-verification',
      code: 'visual-not-displayable',
      field: 'visual',
    });
  }

  if (candidate.currentStatus !== 'available') {
    exclusions.push({
      class: 'condition-no-match',
      code: 'status-not-available',
      field: 'currentStatus',
    });
  }

  const requiredEvidence = getRequiredCandidateEvidence(candidate, evidenceRecords);
  for (const requirement of requiredEvidence) {
    if (requirement.matches.length !== 1) {
      exclusions.push({
        class: 'missing-required-evidence',
        code: requirement.matches.length === 0 ? 'missing-evidence' : 'duplicate-evidence',
        field: requirement.field,
      });
      continue;
    }

    const evaluation = getDecisionEvidenceFreshness(
      requirement.matches[0].id,
      evidenceRecords,
      freshnessRecords,
      asOf,
      policy,
    );
    exclusions.push(...evaluation.exclusions);
  }

  exclusions.push(...evaluateActionEligibility(
    candidate,
    evidenceRecords,
    asOf,
    policy,
  ));

  return createEligibility(candidate.id, asOf, policy.version, exclusions);
}

export function getEligibleDecisionCandidates(
  candidates: readonly DecisionCandidate[],
  evidenceRecords: readonly DecisionCandidateEvidence[],
  freshnessRecords: readonly DecisionEvidenceFreshnessRecord[],
  asOf: ISODate,
  policy: DecisionFreshnessPolicy = DECISION_FRESHNESS_POLICY,
): EligibleDecisionCandidateSet {
  const eligibility = candidates.map((candidate) => getCandidateEligibility(
    candidate,
    evidenceRecords,
    freshnessRecords,
    asOf,
    policy,
  ));

  return {
    evaluatedAsOf: asOf,
    policyVersion: policy.version,
    candidates: candidates.filter((_, index) => eligibility[index].eligible),
    eligibility,
  };
}

export function getEligibleChoiceCoverage(
  eligibleSet: EligibleDecisionCandidateSet,
): DecisionChoiceCoverage {
  return calculateDecisionChoiceCoverage(eligibleSet.candidates);
}

export function getDecisionDataAvailability(
  query: DecisionMatchQuery,
  candidates: readonly DecisionCandidate[],
  evidenceRecords: readonly DecisionCandidateEvidence[],
  freshnessRecords: readonly DecisionEvidenceFreshnessRecord[],
  asOf: ISODate,
  policy: DecisionFreshnessPolicy = DECISION_FRESHNESS_POLICY,
): DecisionDataAvailabilityResult {
  const eligibleSet = getEligibleDecisionCandidates(
    candidates,
    evidenceRecords,
    freshnessRecords,
    asOf,
    policy,
  );
  const eligibleMatch = matchDecisionCandidates(query, eligibleSet.candidates, evidenceRecords);
  const rawMatch = matchDecisionCandidates(query, candidates, evidenceRecords);

  let status: DecisionDataAvailabilityResult['status'];
  let unavailableMatchCount = 0;
  if (eligibleMatch.status === 'incomplete') {
    status = 'incomplete';
  } else if (eligibleMatch.status === 'matched') {
    status = 'matched';
  } else if (rawMatch.status === 'matched') {
    status = 'data-unavailable';
    unavailableMatchCount = rawMatch.rankedCandidates.length;
  } else {
    status = 'no-match';
  }

  return {
    status,
    evaluatedAsOf: asOf,
    policyVersion: policy.version,
    rankedCandidates: status === 'matched' ? eligibleMatch.rankedCandidates : [],
    matchReasons: status === 'matched' ? eligibleMatch.matchReasons : {},
    relaxableDimensions: eligibleMatch.relaxableDimensions,
    incompleteChoices: eligibleMatch.incompleteChoices,
    choiceCoverage: getEligibleChoiceCoverage(eligibleSet),
    unavailableMatchCount,
  };
}

function evaluateEvidenceFreshness(
  evidence: DecisionCandidateEvidence,
  evidenceRecords: readonly DecisionCandidateEvidence[],
  freshnessRecords: readonly DecisionEvidenceFreshnessRecord[],
  asOf: ISODate,
  policy: DecisionFreshnessPolicy,
  visited: ReadonlySet<string>,
): DecisionEvidenceFreshnessEvaluation {
  if (!isValidDecisionISODate(asOf)) {
    return createEvidenceEvaluation(evidence.id, asOf, [{
      class: 'failed-verification',
      code: 'invalid-as-of',
      evidenceId: evidence.id,
    }]);
  }

  if (visited.has(evidence.id)) {
    return createEvidenceEvaluation(evidence.id, asOf, [{
      class: 'failed-verification',
      code: 'derived-evidence-cycle',
      evidenceId: evidence.id,
    }]);
  }

  if (evidence.kind === 'derived-fact') {
    const nextVisited = new Set(visited);
    nextVisited.add(evidence.id);
    const exclusions: DecisionEligibilityExclusion[] = [];
    let earliestStaleOn: ISODate | undefined;
    for (const sourceId of evidence.derivedFromEvidenceIds) {
      const sources = evidenceRecords.filter((source) => source.id === sourceId);
      if (sources.length !== 1) {
        exclusions.push({
          class: 'missing-required-evidence',
          code: 'derived-source-unusable',
          evidenceId: sourceId,
        });
        continue;
      }
      const sourceEvaluation = evaluateEvidenceFreshness(
        sources[0],
        evidenceRecords,
        freshnessRecords,
        asOf,
        policy,
        nextVisited,
      );
      if (!sourceEvaluation.usable) exclusions.push(...sourceEvaluation.exclusions);
      if (
        sourceEvaluation.staleOn
        && (!earliestStaleOn || sourceEvaluation.staleOn < earliestStaleOn)
      ) {
        earliestStaleOn = sourceEvaluation.staleOn;
      }
    }
    return {
      evidenceId: evidence.id,
      usable: exclusions.length === 0,
      evaluatedAsOf: asOf,
      staleOn: earliestStaleOn,
      exclusions,
    };
  }

  const freshnessMatches = freshnessRecords.filter(
    (record) => record.evidenceId === evidence.id,
  );
  if (freshnessMatches.length !== 1) {
    return createEvidenceEvaluation(evidence.id, asOf, [{
      class: 'missing-required-evidence',
      code: freshnessMatches.length === 0
        ? 'missing-freshness-record'
        : 'duplicate-freshness-record',
      evidenceId: evidence.id,
    }]);
  }

  const record = freshnessMatches[0];
  const exclusions = evaluateFreshnessRecord(record);
  if (exclusions.some((exclusion) => exclusion.code === 'invalid-refresh-days')) {
    return createEvidenceEvaluation(evidence.id, asOf, exclusions);
  }
  const policyKey = getDecisionEvidencePolicyKey(evidence);
  const refreshAfterDays = record.refreshAfterDaysOverride
    ?? (policyKey ? policy.refreshAfterDays[policyKey] : undefined);
  if (
    refreshAfterDays === undefined
    || !Number.isInteger(refreshAfterDays)
    || refreshAfterDays <= 0
  ) {
    exclusions.push({
      class: 'failed-verification',
      code: 'invalid-refresh-days',
      evidenceId: evidence.id,
    });
    return createEvidenceEvaluation(evidence.id, asOf, exclusions);
  }

  const referenceDate = evidence.kind === 'official-fact'
    ? evidence.verifiedAt
    : evidence.approvedAt;
  if (!isValidDecisionISODate(referenceDate)) {
    exclusions.push({
      class: 'failed-verification',
      code: 'invalid-evidence-date',
      evidenceId: evidence.id,
    });
    return createEvidenceEvaluation(evidence.id, asOf, exclusions, refreshAfterDays);
  }

  const staleOn = addDecisionCalendarDays(referenceDate, refreshAfterDays);
  if (!staleOn) {
    exclusions.push({
      class: 'failed-verification',
      code: 'invalid-refresh-days',
      evidenceId: evidence.id,
    });
  } else if (asOf >= staleOn) {
    exclusions.push({
      class: 'stale-data',
      code: 'evidence-stale',
      evidenceId: evidence.id,
      staleOn,
    });
  }

  return {
    evidenceId: evidence.id,
    usable: exclusions.length === 0,
    evaluatedAsOf: asOf,
    refreshAfterDays,
    staleOn,
    exclusions,
  };
}

function evaluateFreshnessRecord(
  record: DecisionEvidenceFreshnessRecord,
): DecisionEligibilityExclusion[] {
  const exclusions: DecisionEligibilityExclusion[] = [];
  if (record.refreshAfterDaysOverride !== undefined && (
    !Number.isInteger(record.refreshAfterDaysOverride)
    || record.refreshAfterDaysOverride <= 0
  )) {
    exclusions.push({
      class: 'failed-verification',
      code: 'invalid-refresh-days',
      evidenceId: record.evidenceId,
    });
  }

  if (record.reviewStatus === 'provisional') {
    exclusions.push({
      class: 'failed-verification',
      code: 'review-provisional',
      evidenceId: record.evidenceId,
    });
  } else if (record.reviewStatus === 'conflicting') {
    exclusions.push({
      class: 'conflicting-data',
      code: 'review-conflicting',
      evidenceId: record.evidenceId,
    });
  } else if (record.reviewStatus === 'failed') {
    exclusions.push({
      class: 'failed-verification',
      code: 'review-failed',
      evidenceId: record.evidenceId,
    });
  }

  for (const conflict of record.conflicts ?? []) {
    if (
      (conflict.sourceUrl !== undefined && !isSafeExternalUrl(conflict.sourceUrl))
      || (conflict.resolvedAt !== undefined && !isValidDecisionISODate(conflict.resolvedAt))
    ) {
      exclusions.push({
        class: 'failed-verification',
        code: 'invalid-conflict-metadata',
        evidenceId: record.evidenceId,
      });
    }
    if (conflict.status === 'resolved' && !conflict.resolutionReason?.trim()) {
      exclusions.push({
        class: 'conflicting-data',
        code: 'resolved-conflict-missing-reason',
        evidenceId: record.evidenceId,
      });
    }
    if (conflict.importance === 'important' && conflict.status === 'unresolved') {
      exclusions.push({
        class: 'conflicting-data',
        code: 'important-conflict-unresolved',
        evidenceId: record.evidenceId,
      });
    }
  }

  const relationshipReview = record.relationshipReview;
  if (relationshipReview) {
    if (!relationshipReview.note.trim()) {
      exclusions.push({
        class: 'relationship-blocked',
        code: 'relationship-review-invalid',
        evidenceId: record.evidenceId,
      });
    }
    if (relationshipReview.reviewStatus === 'verified' && (
      relationshipReview.confirmedBy !== 'user'
      || !isValidDecisionVerificationInstant(relationshipReview.confirmedAt)
    )) {
      exclusions.push({
        class: 'relationship-blocked',
        code: 'relationship-review-invalid',
        evidenceId: record.evidenceId,
      });
    }
  }

  return exclusions;
}

function evaluateRelationshipReview(
  candidate: DecisionCandidate,
  freshnessRecords: readonly DecisionEvidenceFreshnessRecord[],
): DecisionEligibilityExclusion[] {
  const reviews = freshnessRecords.filter((record) => (
    candidate.evidenceIds.includes(record.evidenceId)
    && record.relationshipReview !== undefined
  ));
  if (reviews.length === 0) {
    return [{
      class: 'relationship-blocked',
      code: 'relationship-review-missing',
    }];
  }
  if (reviews.length !== 1) {
    return [{
      class: 'relationship-blocked',
      code: 'relationship-review-invalid',
    }];
  }

  const review = reviews[0].relationshipReview;
  if (!review || review.reviewStatus !== 'verified') {
    return [{
      class: 'relationship-blocked',
      code: 'relationship-review-not-confirmed',
      evidenceId: reviews[0].evidenceId,
    }];
  }
  if (
    review.confirmedBy !== 'user'
    || !review.note.trim()
    || !isValidDecisionVerificationInstant(review.confirmedAt)
  ) {
    return [{
      class: 'relationship-blocked',
      code: 'relationship-review-invalid',
      evidenceId: reviews[0].evidenceId,
    }];
  }
  return [];
}

function evaluateActionEligibility(
  candidate: DecisionCandidate,
  evidenceRecords: readonly DecisionCandidateEvidence[],
  asOf: ISODate,
  policy: DecisionFreshnessPolicy,
): DecisionEligibilityExclusion[] {
  const exclusions: DecisionEligibilityExclusion[] = [];
  for (const action of candidate.actions) {
    if (!isDecisionActionDisplayable(action)) {
      exclusions.push({ class: 'failed-verification', code: 'invalid-action' });
    }
  }

  const articleActions = candidate.actions.filter((action) => action.type === 'article');
  const officialActions = candidate.actions.filter((action) => action.type === 'official');
  const reservationActions = candidate.actions.filter((action) => action.type === 'reservation');
  const mapActions = candidate.actions.filter((action) => action.type === 'map');
  const expectedArticleUrl = candidate.relationshipTarget.kind === 'article'
    ? `/article/${candidate.relationshipTarget.articleId}`
    : undefined;
  if (
    articleActions.length !== 1
    || !expectedArticleUrl
    || !isSafeInternalUrl(articleActions[0].url)
    || articleActions[0].url !== expectedArticleUrl
  ) {
    exclusions.push({ class: 'failed-verification', code: 'invalid-action', field: 'article' });
  }

  const officialEvidence = findCandidateOfficialEvidence(
    candidate,
    evidenceRecords,
    'officialUrl',
  );
  if (officialActions.length !== 1) {
    exclusions.push({ class: 'failed-verification', code: 'invalid-action', field: 'official' });
  } else if (
    officialEvidence.length !== 1
    || officialActions[0].url !== officialEvidence[0].sourceUrl
  ) {
    exclusions.push({
      class: 'failed-verification',
      code: 'action-evidence-mismatch',
      field: 'official',
    });
  }

  if (reservationActions.length > 0) {
    const reservationEvidence = findCandidateOfficialEvidence(
      candidate,
      evidenceRecords,
      'reservationChannel',
    );
    if (
      reservationActions.length !== 1
      || candidate.reservationAvailability !== 'channel-available'
      || reservationEvidence.length !== 1
      || reservationActions[0].url !== reservationEvidence[0].sourceUrl
    ) {
      exclusions.push({
        class: 'failed-verification',
        code: 'action-evidence-mismatch',
        field: 'reservation',
      });
    }
  } else if (candidate.reservationAvailability === 'channel-available') {
    exclusions.push({
      class: 'failed-verification',
      code: 'invalid-action',
      field: 'reservation',
    });
  }

  for (const mapAction of mapActions) {
    const staleOn = isValidDecisionISODate(mapAction.verifiedAt)
      ? addDecisionCalendarDays(mapAction.verifiedAt, policy.mapActionRefreshAfterDays)
      : undefined;
    if (!staleOn) {
      exclusions.push({
        class: 'failed-verification',
        code: 'invalid-action',
        field: 'map',
      });
    } else if (asOf >= staleOn) {
      exclusions.push({
        class: 'stale-data',
        code: 'map-action-stale',
        field: 'map',
        staleOn,
      });
    }
  }

  return exclusions;
}

function getRequiredCandidateEvidence(
  candidate: DecisionCandidate,
  evidenceRecords: readonly DecisionCandidateEvidence[],
): ReadonlyArray<{ field: string; matches: readonly DecisionCandidateEvidence[] }> {
  const requirements: Array<{ field: string; matches: readonly DecisionCandidateEvidence[] }> = [];
  for (const field of REQUIRED_OFFICIAL_FIELDS) {
    requirements.push({
      field,
      matches: findCandidateOfficialEvidence(candidate, evidenceRecords, field),
    });
  }
  for (const field of REQUIRED_EDITORIAL_FIELDS) {
    requirements.push({
      field,
      matches: findCandidateEditorialEvidence(candidate, evidenceRecords, field),
    });
  }
  if (candidate.actions.some((action) => action.type === 'reservation')) {
    requirements.push({
      field: 'reservationChannel',
      matches: findCandidateOfficialEvidence(candidate, evidenceRecords, 'reservationChannel'),
    });
  }
  return requirements;
}

function findCandidateOfficialEvidence(
  candidate: DecisionCandidate,
  evidenceRecords: readonly DecisionCandidateEvidence[],
  field: DecisionOfficialFactField,
): DecisionOfficialFactEvidence[] {
  return evidenceRecords.filter((evidence): evidence is DecisionOfficialFactEvidence => (
    candidate.evidenceIds.includes(evidence.id)
    && evidence.candidateId === candidate.id
    && evidence.kind === 'official-fact'
    && evidence.field === field
  ));
}

function findCandidateEditorialEvidence(
  candidate: DecisionCandidate,
  evidenceRecords: readonly DecisionCandidateEvidence[],
  field: DecisionEditorialClassificationField,
): DecisionEditorialClassificationEvidence[] {
  return evidenceRecords.filter((evidence): evidence is DecisionEditorialClassificationEvidence => (
    candidate.evidenceIds.includes(evidence.id)
    && evidence.candidateId === candidate.id
    && evidence.kind === 'editorial-classification'
    && evidence.field === field
    && evidence.approved === true
    && evidence.approvedBy === 'user'
  ));
}

function validateFreshnessRecord(record: DecisionEvidenceFreshnessRecord): string[] {
  const errors: string[] = [];
  if (record.refreshAfterDaysOverride !== undefined && (
    !Number.isInteger(record.refreshAfterDaysOverride)
    || record.refreshAfterDaysOverride <= 0
  )) {
    errors.push(`${record.evidenceId}: refreshAfterDaysOverride must be a positive integer`);
  }
  if (record.reviewStatus === 'failed' && !record.lastFailureReason?.trim()) {
    errors.push(`${record.evidenceId}: failed review requires lastFailureReason`);
  }
  if (record.reviewStatus === 'conflicting' && (record.conflicts?.length ?? 0) === 0) {
    errors.push(`${record.evidenceId}: conflicting review requires conflict metadata`);
  }
  for (const conflict of record.conflicts ?? []) {
    if (conflict.sourceUrl !== undefined && !isSafeExternalUrl(conflict.sourceUrl)) {
      errors.push(`${record.evidenceId}: conflict sourceUrl must be safe`);
    }
    if (conflict.resolvedAt !== undefined && !isValidDecisionISODate(conflict.resolvedAt)) {
      errors.push(`${record.evidenceId}: conflict resolvedAt must be a real ISO date`);
    }
    if (conflict.status === 'resolved' && !conflict.resolutionReason?.trim()) {
      errors.push(`${record.evidenceId}: resolved conflict requires resolutionReason`);
    }
  }
  const relationshipReview = record.relationshipReview;
  if (relationshipReview) {
    if (!relationshipReview.note.trim()) {
      errors.push(`${record.evidenceId}: relationship review note is required`);
    }
    if (relationshipReview.reviewStatus === 'verified' && (
      relationshipReview.confirmedBy !== 'user'
      || !isValidDecisionVerificationInstant(relationshipReview.confirmedAt)
    )) {
      errors.push(`${record.evidenceId}: verified relationship review requires a human-confirmed ISO instant`);
    }
  }
  return errors;
}

function createEligibility(
  candidateId: string,
  asOf: ISODate,
  policyVersion: string,
  exclusions: readonly DecisionEligibilityExclusion[],
): DecisionCandidateEligibility {
  return {
    candidateId,
    eligible: exclusions.length === 0,
    evaluatedAsOf: asOf,
    policyVersion,
    exclusions,
    primaryExclusion: exclusions[0],
  };
}

function createEvidenceEvaluation(
  evidenceId: string,
  asOf: ISODate,
  exclusions: readonly DecisionEligibilityExclusion[],
  refreshAfterDays?: number,
): DecisionEvidenceFreshnessEvaluation {
  return {
    evidenceId,
    usable: exclusions.length === 0,
    evaluatedAsOf: asOf,
    refreshAfterDays,
    exclusions,
  };
}

function parseISODate(value: string): ParsedISODate | undefined {
  if (!isValidDecisionISODate(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidDecisionVerificationInstant(value: string | undefined): value is string {
  if (!value) return false;
  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)Z$/.exec(value);
  return Boolean(match && isValidDecisionISODate(match[1]));
}
