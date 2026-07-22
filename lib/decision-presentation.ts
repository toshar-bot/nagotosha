import type { DecisionAction, DecisionCandidate } from '../types/decision-candidate';
import type {
  ApprovedRelationshipDisclosure,
  CandidatePresentationModel,
  CandidatePresentationRole,
  CandidateRelationshipPresentationInput,
  DecisionPresentationBuildResult,
  DecisionPresentationPolicy,
  DecisionPresentationResult,
  PresentationAction,
  PresentationContractViolation,
} from '../types/decision-presentation';
import type {
  DecisionDataAvailabilityResult,
  EligibleDecisionCandidateSet,
} from '../types/decision-freshness';
import { DECISION_RESERVATION_NOTE } from '../data/decision-copy';
import {
  isDecisionActionDisplayable,
  isResolvedRelationshipDisplayable,
  isValidVerificationDate,
} from './decision-safety';

type PresentationInput = {
  availability: DecisionDataAvailabilityResult;
  eligibleSet: EligibleDecisionCandidateSet;
  relationshipResults: readonly CandidateRelationshipPresentationInput[];
  approvedDisclosures: readonly ApprovedRelationshipDisclosure[];
  policy: DecisionPresentationPolicy;
};

type CandidateConversionResult =
  | { ok: true; candidate: CandidatePresentationModel }
  | { ok: false; violations: readonly PresentationContractViolation[] };

type ActionConversionResult =
  | { ok: true; actions: readonly PresentationAction[] }
  | { ok: false; code: 'action-invalid' | 'action-duplicate' };

export function buildDecisionPresentation(input: PresentationInput): DecisionPresentationBuildResult {
  if (
    input.availability.evaluatedAsOf !== input.eligibleSet.evaluatedAsOf
    || input.availability.policyVersion !== input.eligibleSet.policyVersion
  ) {
    return failure([{ code: 'input-version-mismatch' }]);
  }

  if (input.availability.status === 'incomplete') {
    return success({
      status: 'incomplete',
      incompleteChoices: [...input.availability.incompleteChoices],
    });
  }

  if (input.availability.status === 'no-match') {
    return success({
      status: 'no-match',
      relaxHints: input.availability.relaxableDimensions.map((axis) => ({
        axis,
        label: input.policy.relaxHints[axis],
      })),
    });
  }

  if (input.availability.status === 'data-unavailable') {
    return success({ status: 'data-unavailable' });
  }

  const rankedCandidates = input.availability.rankedCandidates;
  if (
    rankedCandidates.length < input.policy.candidateCount.minimum
    || rankedCandidates.length > input.policy.candidateCount.maximum
  ) {
    return failure([{ code: 'candidate-count-out-of-range' }]);
  }

  const eligibleCandidates = new Map(
    input.eligibleSet.candidates.map((candidate) => [candidate.id, candidate] as const),
  );
  const eligibleIds = new Set(
    input.eligibleSet.eligibility
      .filter((result) => result.eligible)
      .map((result) => result.candidateId),
  );
  const seenCandidateIds = new Set<string>();
  const trustedRankedCandidates: Array<{
    candidate: DecisionCandidate;
    matchReasons: readonly string[];
    candidateOrder: number;
  }> = [];
  const inputViolations: PresentationContractViolation[] = [];

  rankedCandidates.forEach((ranked, index) => {
    const candidateOrder = index;
    if (seenCandidateIds.has(ranked.candidate.id)) {
      inputViolations.push({ code: 'duplicate-candidate', candidateOrder });
      return;
    }
    seenCandidateIds.add(ranked.candidate.id);

    const eligibleCandidate = eligibleCandidates.get(ranked.candidate.id);
    if (!eligibleCandidate || !eligibleIds.has(ranked.candidate.id)) {
      inputViolations.push({ code: 'candidate-not-eligible', candidateOrder });
      return;
    }

    trustedRankedCandidates.push({
      candidate: eligibleCandidate,
      matchReasons: ranked.matchReasons.map((reason) => reason.text),
      candidateOrder,
    });
  });

  if (inputViolations.length > 0) return failure(inputViolations);

  const models: CandidatePresentationModel[] = [];
  const candidateViolations: PresentationContractViolation[] = [];

  trustedRankedCandidates.forEach(({ candidate, matchReasons, candidateOrder }) => {
    const converted = convertCandidate({
      candidate,
      order: candidateOrder,
      matchReasons,
      relationshipResults: input.relationshipResults,
      approvedDisclosures: input.approvedDisclosures,
      policy: input.policy,
    });
    if (converted.ok) {
      models.push(converted.candidate);
    } else {
      candidateViolations.push(...converted.violations);
    }
  });

  return models.length > 0
    ? success({ status: 'matched', candidates: models }, candidateViolations)
    : success({ status: 'data-unavailable' }, candidateViolations);
}

function convertCandidate(input: {
  candidate: DecisionCandidate;
  order: number;
  matchReasons: readonly string[];
  relationshipResults: readonly CandidateRelationshipPresentationInput[];
  approvedDisclosures: readonly ApprovedRelationshipDisclosure[];
  policy: DecisionPresentationPolicy;
}): CandidateConversionResult {
  const { candidate, order, policy } = input;
  const violations: PresentationContractViolation[] = [];

  if (candidate.relationshipTarget.kind !== 'article') {
    return candidateFailure('article-target-required', order);
  }
  const articleId = candidate.relationshipTarget.articleId;

  const role = resolveRole(candidate, policy);
  if (!role) violations.push({ code: 'role-not-unique', candidateOrder: order });

  if (
    input.matchReasons.length > policy.maximumMatchReasons
    || input.matchReasons.some((reason) => !reason.trim())
  ) {
    violations.push({ code: 'match-reasons-invalid', candidateOrder: order });
  }

  const areaLabel = readAreaLabel(candidate.area, policy);
  if (!areaLabel) violations.push({ code: 'unapproved-area', candidateOrder: order });

  if (
    !isValidVerificationDate(candidate.statusVerifiedAt)
    || !isValidVerificationDate(candidate.openingHoursVerifiedAt)
    || !isValidVerificationDate(candidate.priceVerifiedAt)
  ) {
    violations.push({ code: 'verified-date-invalid', candidateOrder: order });
  }

  const relationshipMatches = input.relationshipResults.filter(
    (entry) => entry.candidateId === candidate.id,
  );
  const relationship = relationshipMatches.length === 1
    ? relationshipMatches[0].resolution
    : undefined;
  if (!relationship) {
    violations.push({ code: 'relationship-result-missing', candidateOrder: order });
  } else if (
    relationship.postId !== articleId
    || relationship.target.kind !== 'article'
    || relationship.target.articleId !== articleId
  ) {
    violations.push({ code: 'relationship-target-mismatch', candidateOrder: order });
  } else if (!isResolvedRelationshipDisplayable(relationship)) {
    violations.push({ code: 'relationship-not-displayable', candidateOrder: order });
  }

  const disclosure = relationship && isResolvedRelationshipDisplayable(relationship)
    ? resolveDisclosure(articleId, relationship.relationship, input.approvedDisclosures)
    : undefined;
  if (
    relationship
    && (relationship.relationship === 'pr' || relationship.relationship === 'owned')
    && disclosure === undefined
  ) {
    violations.push({ code: 'disclosure-required', candidateOrder: order });
  }

  const actions = convertActions(candidate.actions, policy);
  if (!actions.ok) violations.push({ code: actions.code, candidateOrder: order });

  if (violations.length > 0 || !role || !areaLabel || !actions.ok || disclosure === undefined) {
    return { ok: false, violations };
  }

  return {
    ok: true,
    candidate: {
      candidateId: candidate.id,
      articleId,
      displayName: candidate.displayName,
      order,
      role,
      visualTreatment: { kind: 'category-panel' },
      matchReasons: [...input.matchReasons],
      facts: {
        budgetLabel: policy.budgetLabels[candidate.budgetBand],
        areaLabel,
        openingHoursLabel: `${candidate.openingHours.opens}–${candidate.openingHours.closes}`,
        ...(candidate.openingHours.lastOrder
          ? { lastOrderLabel: `${policy.lastOrderPrefix} ${candidate.openingHours.lastOrder}` }
          : {}),
      },
      verifiedDates: formatVerifiedDates(candidate),
      disclosure,
      actions: actions.actions,
    },
  };
}

function resolveRole(
  candidate: DecisionCandidate,
  policy: DecisionPresentationPolicy,
): CandidatePresentationRole | undefined {
  const candidateTags = new Set(candidate.moodTags);
  const matches = policy.roles.filter((role) => (
    role.approvedMoodTags.some((tag) => candidateTags.has(tag))
  ));

  if (matches.length !== 1) return undefined;
  const role = matches[0];
  return { key: role.key, label: role.label, tone: role.tone };
}

function readAreaLabel(
  area: string,
  policy: DecisionPresentationPolicy,
): string | undefined {
  return Object.prototype.hasOwnProperty.call(policy.areaLabels, area)
    ? policy.areaLabels[area as keyof typeof policy.areaLabels]
    : undefined;
}

function resolveDisclosure(
  articleId: number,
  relationship: string,
  approvedDisclosures: readonly ApprovedRelationshipDisclosure[],
): CandidatePresentationModel['disclosure'] | undefined {
  if (relationship === 'editorial') return null;
  if (relationship !== 'pr' && relationship !== 'owned') return undefined;

  const matches = approvedDisclosures.filter((disclosure) => (
    disclosure.articleId === articleId
    && disclosure.kind === relationship
    && disclosure.approved === true
    && disclosure.approvedBy === 'user'
    && disclosure.text.trim().length > 0
  ));
  if (matches.length !== 1) return undefined;

  return {
    kind: relationship,
    label: relationship === 'pr' ? 'PR' : '運営関係',
    text: matches[0].text,
  };
}

function convertActions(
  actions: readonly DecisionAction[],
  policy: DecisionPresentationPolicy,
): ActionConversionResult {
  if (actions.length === 0 || !actions.every(isDecisionActionDisplayable)) {
    return { ok: false, code: 'action-invalid' };
  }

  const actionTypes = new Set<DecisionAction['type']>();
  for (const action of actions) {
    if (actionTypes.has(action.type)) return { ok: false, code: 'action-duplicate' };
    actionTypes.add(action.type);
  }

  return {
    ok: true,
    actions: actions.map((action): PresentationAction => {
      if (action.type === 'reservation') {
        return {
          type: 'reservation',
          label: policy.actionLabels.reservation,
          url: action.url,
          isAvailabilityGuarantee: false,
          note: DECISION_RESERVATION_NOTE,
        };
      }
      return {
        type: action.type,
        label: policy.actionLabels[action.type],
        url: action.url,
      };
    }),
  };
}

function formatVerifiedDates(
  candidate: DecisionCandidate,
): CandidatePresentationModel['verifiedDates'] {
  const status = formatMonthDay(candidate.statusVerifiedAt);
  const openingHours = formatMonthDay(candidate.openingHoursVerifiedAt);
  const price = formatMonthDay(candidate.priceVerifiedAt);

  if (status === openingHours && openingHours === price) {
    return { mode: 'merged', label: `表示情報確認 ${status}` };
  }

  return {
    mode: 'per-fact',
    status: `営業状況確認 ${status}`,
    openingHours: `営業時間確認 ${openingHours}`,
    price: `価格確認 ${price}`,
  };
}

function formatMonthDay(value: string): string {
  const [, month, day] = value.split('-').map(Number);
  return `${month}/${day}`;
}

function candidateFailure(
  code: PresentationContractViolation['code'],
  candidateOrder: number,
): CandidateConversionResult {
  return { ok: false, violations: [{ code, candidateOrder }] };
}

function success(
  presentation: DecisionPresentationResult,
  candidateViolations: readonly PresentationContractViolation[] = [],
): DecisionPresentationBuildResult {
  return {
    ok: true,
    presentation,
    diagnostics: { candidateViolations },
  };
}

function failure(
  violations: readonly PresentationContractViolation[],
): DecisionPresentationBuildResult {
  return { ok: false, violations };
}
