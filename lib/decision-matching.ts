import {
  BUDGET_CHOICE_LABEL,
  CANDIDATE_BUDGET_LIMIT,
  DECISION_MOOD_POLICY,
  MOOD_CHOICE_LABEL,
  PARTY_CHOICE_LABEL,
  QUERY_BUDGET_LIMIT,
} from '../data/decision-match-policy';
import type {
  DecisionCandidate,
  DecisionCandidateEvidence,
  DecisionEditorialClassificationEvidence,
  DecisionEditorialClassificationField,
  DecisionMoodTag,
} from '../types/decision-candidate';
import type {
  DecisionBudgetChoice,
  DecisionChoiceCoverage,
  DecisionHardFilterDimension,
  DecisionHardFilterReason,
  DecisionMatchQuery,
  DecisionMatchReason,
  DecisionMatchResult,
  DecisionMoodChoice,
  DecisionMoodPolicyEntry,
  DecisionRelaxableDimension,
  DecisionRequiredChoice,
  RankedDecisionCandidate,
  RejectedDecisionCandidate,
} from '../types/decision-match';

const REQUIRED_CLASSIFICATION_FIELDS: readonly DecisionEditorialClassificationField[] = [
  'partyTypes',
  'budgetBand',
  'moodTags',
];

type CompleteDecisionQuery = Required<Pick<DecisionMatchQuery, 'partyType' | 'budget' | 'mood'>>
  & Pick<DecisionMatchQuery, 'area'>;

type MoodEvaluation = {
  score: number;
  exact: boolean;
  policyEntry?: DecisionMoodPolicyEntry;
};

type CandidateEvaluation = {
  candidate: DecisionCandidate;
  registryIndex: number;
  hardFilterReasons: DecisionHardFilterReason[];
  mood: MoodEvaluation;
};

export function calculateDecisionChoiceCoverage(
  candidates: readonly DecisionCandidate[],
): DecisionChoiceCoverage {
  const eligibleCandidates = candidates.filter((candidate) => (
    candidate.decisionMode === 'food'
    && candidate.entityType === 'place'
    && candidate.currentStatus === 'available'
  ));

  return {
    partyType: {
      solo: countWhere(eligibleCandidates, (candidate) => candidate.partyTypes.includes('solo')),
      couple: countWhere(eligibleCandidates, (candidate) => candidate.partyTypes.includes('couple')),
      family: countWhere(eligibleCandidates, (candidate) => candidate.partyTypes.includes('family')),
      group: countWhere(eligibleCandidates, (candidate) => candidate.partyTypes.includes('group')),
    },
    budget: {
      under1000: countWhere(
        eligibleCandidates,
        (candidate) => isCandidateWithinBudget(candidate, 'under1000'),
      ),
      under2000: countWhere(
        eligibleCandidates,
        (candidate) => isCandidateWithinBudget(candidate, 'under2000'),
      ),
      under4000: countWhere(
        eligibleCandidates,
        (candidate) => isCandidateWithinBudget(candidate, 'under4000'),
      ),
    },
    mood: {
      hearty: countWhere(
        eligibleCandidates,
        (candidate) => evaluateMood('hearty', candidate.moodTags).score > 0,
      ),
      light: countWhere(
        eligibleCandidates,
        (candidate) => evaluateMood('light', candidate.moodTags).score > 0,
      ),
      relax: countWhere(
        eligibleCandidates,
        (candidate) => evaluateMood('relax', candidate.moodTags).score > 0,
      ),
      newExperience: countWhere(
        eligibleCandidates,
        (candidate) => evaluateMood('newExperience', candidate.moodTags).score > 0,
      ),
    },
    area: {
      sakae: countWhere(eligibleCandidates, (candidate) => candidate.area === 'sakae'),
      meieki: countWhere(eligibleCandidates, (candidate) => candidate.area === 'meieki'),
      osu: countWhere(eligibleCandidates, (candidate) => candidate.area === 'osu'),
    },
  };
}

export function matchDecisionCandidates(
  query: DecisionMatchQuery,
  candidates: readonly DecisionCandidate[],
  evidenceRecords: readonly DecisionCandidateEvidence[],
): DecisionMatchResult {
  const choiceCoverage = calculateDecisionChoiceCoverage(candidates);
  const incompleteChoices = getIncompleteChoices(query);
  if (incompleteChoices.length > 0) {
    return {
      status: 'incomplete',
      rankedCandidates: [],
      rejectedCandidates: [],
      hardFilterReasons: {},
      matchReasons: {},
      exactMatchCount: {},
      moodScore: {},
      relaxableDimensions: [],
      choiceCoverage,
      incompleteChoices,
    };
  }

  const completeQuery = query as CompleteDecisionQuery;
  const evidenceById = new Map(evidenceRecords.map((evidence) => [evidence.id, evidence]));
  const evaluations = candidates.map((candidate, registryIndex): CandidateEvaluation => ({
    candidate,
    registryIndex,
    hardFilterReasons: evaluateHardFilters(candidate, completeQuery, evidenceById),
    mood: evaluateMood(completeQuery.mood, candidate.moodTags),
  }));
  const hardMatched = evaluations.filter((evaluation) => evaluation.hardFilterReasons.length === 0);
  const moodMatched = hardMatched.filter((evaluation) => evaluation.mood.score > 0);
  const hardFilterReasons = createHardFilterReasonRecord(evaluations);
  const moodScore = Object.fromEntries(
    evaluations.map((evaluation) => [evaluation.candidate.id, evaluation.mood.score]),
  );

  if (moodMatched.length === 0) {
    const relaxableDimensions = hardMatched.length > 0
      ? ['mood'] as const
      : findRelaxableHardDimensions(completeQuery, candidates, evidenceById);

    return {
      status: 'no-match',
      rankedCandidates: [],
      rejectedCandidates: evaluations.map(toRejectedCandidate),
      hardFilterReasons,
      matchReasons: {},
      exactMatchCount: {},
      moodScore,
      relaxableDimensions,
      choiceCoverage,
      incompleteChoices: [],
    };
  }

  const rankedCandidates = moodMatched
    .map((evaluation) => toRankedCandidate(evaluation, completeQuery, evidenceById))
    .sort((left, right) => (
      right.moodScore - left.moodScore
      || right.exactMatchCount - left.exactMatchCount
      || left.registryIndex - right.registryIndex
    ));
  const rankedIds = new Set(rankedCandidates.map((ranked) => ranked.candidate.id));
  const rejectedCandidates = evaluations
    .filter((evaluation) => !rankedIds.has(evaluation.candidate.id))
    .map(toRejectedCandidate);

  return {
    status: 'matched',
    rankedCandidates,
    rejectedCandidates,
    hardFilterReasons,
    matchReasons: Object.fromEntries(
      rankedCandidates.map((ranked) => [ranked.candidate.id, ranked.matchReasons]),
    ),
    exactMatchCount: Object.fromEntries(
      rankedCandidates.map((ranked) => [ranked.candidate.id, ranked.exactMatchCount]),
    ),
    moodScore,
    relaxableDimensions: [],
    choiceCoverage,
    incompleteChoices: [],
  };
}

function countWhere(
  candidates: readonly DecisionCandidate[],
  predicate: (candidate: DecisionCandidate) => boolean,
): number {
  return candidates.reduce((count, candidate) => count + Number(predicate(candidate)), 0);
}

function getIncompleteChoices(query: DecisionMatchQuery): DecisionRequiredChoice[] {
  const missing: DecisionRequiredChoice[] = [];
  if (!query.partyType) missing.push('partyType');
  if (!query.budget) missing.push('budget');
  if (!query.mood) missing.push('mood');
  return missing;
}

function isCandidateWithinBudget(
  candidate: DecisionCandidate,
  budget: DecisionBudgetChoice | undefined,
): boolean {
  if (!budget || budget === 'any') return true;
  const candidateLimit = CANDIDATE_BUDGET_LIMIT[candidate.budgetBand];
  return candidateLimit !== null && candidateLimit <= QUERY_BUDGET_LIMIT[budget];
}

function evaluateMood(
  mood: DecisionMoodChoice,
  candidateTags: readonly DecisionMoodTag[],
): MoodEvaluation {
  const matchingEntries = DECISION_MOOD_POLICY[mood].filter(
    (entry) => candidateTags.includes(entry.candidateTag),
  );
  const policyEntry = matchingEntries.reduce<DecisionMoodPolicyEntry | undefined>(
    (best, entry) => (!best || entry.score > best.score ? entry : best),
    undefined,
  );

  return {
    score: policyEntry?.score ?? 0,
    exact: policyEntry?.matchKind === 'exact',
    policyEntry,
  };
}

function evaluateHardFilters(
  candidate: DecisionCandidate,
  query: CompleteDecisionQuery,
  evidenceById: ReadonlyMap<string, DecisionCandidateEvidence>,
  ignoredDimension?: DecisionHardFilterDimension,
): DecisionHardFilterReason[] {
  const reasons: DecisionHardFilterReason[] = [];
  if (ignoredDimension !== 'candidate' && !isCandidateMatchable(candidate, evidenceById)) {
    reasons.push({ dimension: 'candidate', code: 'candidate-not-matchable' });
  }
  if (
    ignoredDimension !== 'partyType'
    && !candidate.partyTypes.includes(query.partyType)
  ) {
    reasons.push({
      dimension: 'partyType',
      code: 'party-not-supported',
      selectedValue: query.partyType,
      candidateValue: candidate.partyTypes,
    });
  }
  if (ignoredDimension !== 'budget' && !isCandidateWithinBudget(candidate, query.budget)) {
    reasons.push({
      dimension: 'budget',
      code: candidate.budgetBand === 'open'
        ? 'open-budget-requires-any'
        : 'budget-over-limit',
      selectedValue: query.budget,
      candidateValue: candidate.budgetBand,
    });
  }
  if (
    ignoredDimension !== 'area'
    && query.area
    && query.area !== 'any'
    && candidate.area !== query.area
  ) {
    reasons.push({
      dimension: 'area',
      code: 'area-mismatch',
      selectedValue: query.area,
      candidateValue: candidate.area,
    });
  }
  return reasons;
}

function isCandidateMatchable(
  candidate: DecisionCandidate,
  evidenceById: ReadonlyMap<string, DecisionCandidateEvidence>,
): boolean {
  return (
    candidate.decisionMode === 'food'
    && candidate.entityType === 'place'
    && candidate.currentStatus === 'available'
    && REQUIRED_CLASSIFICATION_FIELDS.every((field) => (
      getApprovedClassificationEvidence(candidate, field, evidenceById) !== undefined
    ))
  );
}

function getApprovedClassificationEvidence(
  candidate: DecisionCandidate,
  field: DecisionEditorialClassificationField,
  evidenceById: ReadonlyMap<string, DecisionCandidateEvidence>,
): DecisionEditorialClassificationEvidence | undefined {
  for (const evidenceId of candidate.evidenceIds) {
    const evidence = evidenceById.get(evidenceId);
    if (
      evidence?.kind === 'editorial-classification'
      && evidence.candidateId === candidate.id
      && evidence.field === field
      && evidence.approved === true
      && evidence.approvedBy === 'user'
    ) {
      return evidence;
    }
  }
  return undefined;
}

function toRankedCandidate(
  evaluation: CandidateEvaluation,
  query: CompleteDecisionQuery,
  evidenceById: ReadonlyMap<string, DecisionCandidateEvidence>,
): RankedDecisionCandidate {
  return {
    candidate: evaluation.candidate,
    registryIndex: evaluation.registryIndex,
    moodScore: evaluation.mood.score,
    exactMatchCount: getExactMatchCount(evaluation, query),
    matchReasons: generateMatchReasons(evaluation, query, evidenceById),
  };
}

function toRejectedCandidate(evaluation: CandidateEvaluation): RejectedDecisionCandidate {
  return {
    candidate: evaluation.candidate,
    registryIndex: evaluation.registryIndex,
    hardFilterReasons: evaluation.hardFilterReasons,
    moodMatched: evaluation.mood.score > 0,
  };
}

function getExactMatchCount(
  evaluation: CandidateEvaluation,
  query: CompleteDecisionQuery,
): number {
  let count = Number(evaluation.candidate.partyTypes.includes(query.partyType));
  if (query.area && query.area !== 'any') {
    count += Number(evaluation.candidate.area === query.area);
  }
  count += Number(evaluation.mood.exact);
  return count;
}

function generateMatchReasons(
  evaluation: CandidateEvaluation,
  query: CompleteDecisionQuery,
  evidenceById: ReadonlyMap<string, DecisionCandidateEvidence>,
): DecisionMatchReason[] {
  const reasons: DecisionMatchReason[] = [];
  const candidate = evaluation.candidate;
  const partyEvidence = getApprovedClassificationEvidence(candidate, 'partyTypes', evidenceById);
  if (partyEvidence && candidate.partyTypes.includes(query.partyType)) {
    reasons.push({
      dimension: 'partyType',
      code: 'approved-party',
      text: `承認済み分類で「${PARTY_CHOICE_LABEL[query.partyType]}」向けです`,
      evidenceId: partyEvidence.id,
    });
  }

  if (query.budget !== 'any') {
    const budgetEvidence = getApprovedClassificationEvidence(candidate, 'budgetBand', evidenceById);
    if (budgetEvidence && isCandidateWithinBudget(candidate, query.budget)) {
      reasons.push({
        dimension: 'budget',
        code: 'approved-budget',
        text: `承認済み分類で予算「${BUDGET_CHOICE_LABEL[query.budget]}」の範囲です`,
        evidenceId: budgetEvidence.id,
      });
    }
  }

  const moodEvidence = getApprovedClassificationEvidence(candidate, 'moodTags', evidenceById);
  if (moodEvidence && evaluation.mood.policyEntry) {
    reasons.push({
      dimension: 'mood',
      code: evaluation.mood.exact ? 'approved-mood-exact' : 'approved-mood-related',
      text: evaluation.mood.exact
        ? `承認済み分類が「${MOOD_CHOICE_LABEL[query.mood]}」に一致します`
        : `承認済み分類が「${MOOD_CHOICE_LABEL[query.mood]}」に関連します`,
      evidenceId: moodEvidence.id,
    });
  }

  return reasons.slice(0, 3);
}

function createHardFilterReasonRecord(
  evaluations: readonly CandidateEvaluation[],
): Record<string, readonly DecisionHardFilterReason[]> {
  return Object.fromEntries(
    evaluations.map((evaluation) => [evaluation.candidate.id, evaluation.hardFilterReasons]),
  );
}

function findRelaxableHardDimensions(
  query: CompleteDecisionQuery,
  candidates: readonly DecisionCandidate[],
  evidenceById: ReadonlyMap<string, DecisionCandidateEvidence>,
): DecisionRelaxableDimension[] {
  const dimensions: readonly Exclude<DecisionRelaxableDimension, 'mood'>[] = ['budget', 'area'];
  return dimensions.filter((dimension) => candidates.some((candidate) => (
    evaluateHardFilters(candidate, query, evidenceById, dimension).length === 0
    && evaluateMood(query.mood, candidate.moodTags).score > 0
  )));
}
