import type {
  AreaChoice,
  BudgetChoice,
  CandidateSelectionResult,
  DecisionV3Candidate,
  DecisionV3CandidateProvenance,
  DecisionV3Conditions,
  DecisionV3KnownBoolean,
  DecisionV3Price,
  RefineChoice,
} from '@/types/decision-v3';

type SelectDecisionV3CandidatesInput = {
  conditions: Partial<DecisionV3Conditions>;
  preferences: RefineChoice[];
  candidates: DecisionV3Candidate[];
};

type CandidateEvaluation =
  | { kind: 'matched'; reasons: string[] }
  | { kind: 'rejected' }
  | { kind: 'unknown'; fields: string[] };

const BUDGET_LIMITS: Record<Exclude<BudgetChoice, 'any'>, number> = {
  under1000: 1000,
  under2000: 2000,
  under4000: 4000,
};

const PARTY_REASON: Record<DecisionV3Conditions['party'], string> = {
  solo: '「一人でも」で選べる',
  pair: '「デート・ふたり」で選べる',
  family: '「家族・子どもと」で選べる',
  group: '「友人・グループ」で選べる',
};

const BUDGET_REASON: Record<Exclude<BudgetChoice, 'any'>, string> = {
  under1000: '1,000円以内の予算条件に合う',
  under2000: '2,000円以内の予算条件に合う',
  under4000: '4,000円以内の予算条件に合う',
};

const MOOD_REASON: Record<DecisionV3Conditions['mood'], string> = {
  hearty: '「しっかり食べたい」の気分に合う',
  light: '「軽く楽しみたい」の気分に合う',
  relax: '「ゆっくり過ごしたい」の気分に合う',
  'new-experience': '「新しい体験」の気分に合う',
};

const AREA_REASON: Record<Exclude<AreaChoice, 'any'>, string> = {
  sakae: '栄・伏見エリアで選べる',
  meieki: '名駅・駅周辺エリアで選べる',
  osu: '大須・上前津エリアで選べる',
};

const PREFERENCE_FIELD: Partial<
  Record<
    RefineChoice,
    {
      field: keyof Pick<
        DecisionV3Candidate['selection'],
        | 'privateRoom'
        | 'tatami'
        | 'counter'
        | 'familyAndStroller'
        | 'reservation'
        | 'parking'
        | 'rainFriendly'
        | 'wifi'
        | 'powerOutlet'
        | 'terrace'
        | 'lateNight'
        | 'quiet'
        | 'longStay'
      >;
      reason: string;
    }
  >
> = {
  'private-room': { field: 'privateRoom', reason: '個室の条件に合う' },
  tatami: { field: 'tatami', reason: '座敷の条件に合う' },
  counter: { field: 'counter', reason: 'カウンター席の条件に合う' },
  'kids-ok': { field: 'familyAndStroller', reason: '子連れ・ベビーカー条件に合う' },
  reservable: { field: 'reservation', reason: '予約条件に合う' },
  parking: { field: 'parking', reason: '駐車場の条件に合う' },
  'rain-safe': { field: 'rainFriendly', reason: '雨でも安心の条件に合う' },
  wifi: { field: 'wifi', reason: 'Wi-Fiの条件に合う' },
  power: { field: 'powerOutlet', reason: '電源の条件に合う' },
  terrace: { field: 'terrace', reason: 'テラスの条件に合う' },
  'late-night': { field: 'lateNight', reason: '深夜営業の条件に合う' },
  quiet: { field: 'quiet', reason: '静かな過ごし方の条件に合う' },
  'long-stay': { field: 'longStay', reason: '長居しやすさの条件に合う' },
};

const REQUIRED_CONDITION_KEYS = ['party', 'budget', 'mood', 'area'] as const;

function evaluateKnownBoolean(
  value: DecisionV3KnownBoolean,
  field: string,
  reason: string,
): { rejected: boolean; unknownField?: string; reason?: string } {
  if (value === 'unknown') return { rejected: false, unknownField: field };
  if (!value) return { rejected: true };
  return { rejected: false, reason };
}

function evaluatePrice(
  price: DecisionV3Price,
  budget: BudgetChoice,
): { rejected: boolean; unknown?: boolean } {
  if (budget === 'any') return { rejected: false };
  if (price.kind === 'variable') return { rejected: false, unknown: true };

  const limit = BUDGET_LIMITS[budget];
  const maximum = price.kind === 'fixed' ? price.amount : price.maximum;
  return { rejected: maximum > limit };
}

function evaluateCandidate(
  candidate: DecisionV3Candidate,
  conditions: DecisionV3Conditions,
  preferences: RefineChoice[],
): CandidateEvaluation {
  const profile = candidate.selection;
  if (!profile.supportedPartyTypes.includes(conditions.party)) return { kind: 'rejected' };
  const price = evaluatePrice(profile.price, conditions.budget);
  if (price.rejected) return { kind: 'rejected' };
  if (!profile.supportedPurposes.includes(conditions.mood)) return { kind: 'rejected' };
  if (conditions.area !== 'any' && profile.area !== conditions.area) return { kind: 'rejected' };

  const reasons = [PARTY_REASON[conditions.party]];
  if (conditions.budget !== 'any') reasons.push(BUDGET_REASON[conditions.budget]);
  reasons.push(MOOD_REASON[conditions.mood]);
  if (conditions.area !== 'any') reasons.push(AREA_REASON[conditions.area]);

  const unknownFields: string[] = [];
  if (price.unknown) unknownFields.push(`${candidate.id}.price`);
  let rejected = false;

  for (const preference of preferences) {
    if (preference === 'smoking-any') continue;
    if (preference === 'smoke-free' || preference === 'smoking-ok') {
      if (profile.smokingPolicy === 'unknown') {
        unknownFields.push(`${candidate.id}.smokingPolicy`);
      } else if (profile.smokingPolicy !== preference) {
        rejected = true;
      } else {
        reasons.push(preference === 'smoke-free' ? '禁煙の条件に合う' : '喫煙可の条件に合う');
      }
      continue;
    }

    const fieldPolicy = PREFERENCE_FIELD[preference];
    if (!fieldPolicy) continue;
    const result = evaluateKnownBoolean(
      profile[fieldPolicy.field],
      `${candidate.id}.${fieldPolicy.field}`,
      fieldPolicy.reason,
    );
    if (result.rejected) rejected = true;
    if (result.unknownField) unknownFields.push(result.unknownField);
    if (result.reason) reasons.push(result.reason);
  }

  if (rejected) return { kind: 'rejected' };
  if (unknownFields.length > 0) return { kind: 'unknown', fields: unknownFields };
  return { kind: 'matched', reasons: reasons.slice(0, 3) };
}

function hasSafeMatch(
  candidates: DecisionV3Candidate[],
  conditions: DecisionV3Conditions,
  preferences: RefineChoice[],
) {
  return candidates.some(
    (candidate) => evaluateCandidate(candidate, conditions, preferences).kind === 'matched',
  );
}

function nextBudget(budget: BudgetChoice): BudgetChoice | null {
  if (budget === 'under1000') return 'under2000';
  if (budget === 'under2000') return 'under4000';
  if (budget === 'under4000') return 'any';
  return null;
}

function buildRelaxationHints(
  candidates: DecisionV3Candidate[],
  conditions: DecisionV3Conditions,
  preferences: RefineChoice[],
) {
  const hints: string[] = [];
  const relaxedBudget = nextBudget(conditions.budget);
  if (
    relaxedBudget
    && hasSafeMatch(candidates, { ...conditions, budget: relaxedBudget }, preferences)
  ) {
    hints.push('予算を1段階広げる');
  }
  if (
    conditions.area !== 'any'
    && hasSafeMatch(candidates, { ...conditions, area: 'any' }, preferences)
  ) {
    hints.push('エリアを「こだわらない」にする');
  }
  if (
    hints.length < 2
    && candidates.some((candidate) => {
      const profile = candidate.selection;
      const budgetMatches = !evaluatePrice(profile.price, conditions.budget).rejected;
      const areaMatches = conditions.area === 'any' || profile.area === conditions.area;
      return profile.supportedPartyTypes.includes(conditions.party) && budgetMatches && areaMatches;
    })
  ) {
    hints.push('気分の条件を変える');
  }
  return hints.slice(0, 2);
}

export function selectDecisionV3Candidates({
  conditions,
  preferences,
  candidates,
}: SelectDecisionV3CandidatesInput): CandidateSelectionResult {
  const missingConditions = REQUIRED_CONDITION_KEYS
    .filter((key) => !conditions[key])
    .map((key) => `condition.${key}`);
  if (missingConditions.length > 0) {
    return { kind: 'data-unavailable', missingFields: missingConditions };
  }

  const completeConditions = conditions as DecisionV3Conditions;

  const formalCandidates = candidates.filter((candidate) => !isExternalCandidate(candidate));
  const externalCandidates = candidates.filter(isExternalCandidate);
  const formalResult = selectFormalCandidates(formalCandidates, completeConditions, preferences);
  const formalMatches = formalResult.kind === 'matched' ? formalResult.candidateIds : [];

  // Reviewed candidates always take precedence. Provider candidates can fill
  // only unused result slots; their unknown party/mood facts are never treated
  // as a complete match.
  if (formalMatches.length >= 3 || externalCandidates.length === 0) return formalResult;

  const externalMatches = selectExternalCandidates(
    externalCandidates,
    completeConditions,
    3 - formalMatches.length,
  );
  if (externalMatches.candidateIds.length === 0) return formalResult;

  const candidateIds = [...formalMatches, ...externalMatches.candidateIds].slice(0, 3);
  const reasonsByCandidateId = {
    ...(formalResult.kind === 'matched' ? formalResult.reasonsByCandidateId : {}),
    ...externalMatches.reasonsByCandidateId,
  };

  return {
    kind: 'matched',
    candidateIds,
    reasonsByCandidateId: Object.fromEntries(
      candidateIds.map((candidateId) => [candidateId, reasonsByCandidateId[candidateId]]),
    ),
  };
}

function selectFormalCandidates(
  candidates: DecisionV3Candidate[],
  completeConditions: DecisionV3Conditions,
  preferences: RefineChoice[],
): CandidateSelectionResult {

  if (candidates.length === 0) {
    return {
      kind: 'data-unavailable',
      missingFields: ['candidate.formal'],
    };
  }

  const matchedCandidateIds: string[] = [];
  const reasonsByCandidateId: Record<string, string[]> = {};
  const unknownFields: string[] = [];

  for (const candidate of candidates) {
    const evaluation = evaluateCandidate(candidate, completeConditions, preferences);
    if (evaluation.kind === 'matched') {
      matchedCandidateIds.push(candidate.id);
      reasonsByCandidateId[candidate.id] = evaluation.reasons;
    } else if (evaluation.kind === 'unknown') {
      unknownFields.push(...evaluation.fields);
    }
  }

  if (matchedCandidateIds.length > 0) {
    return {
      kind: 'matched',
      candidateIds: matchedCandidateIds.slice(0, 3),
      reasonsByCandidateId,
    };
  }
  if (unknownFields.length > 0) {
    return {
      kind: 'data-unavailable',
      missingFields: Array.from(new Set(unknownFields)).sort(),
    };
  }
  return {
    kind: 'no-match',
    relaxationHints: buildRelaxationHints(candidates, completeConditions, preferences),
  };
}

function selectExternalCandidates(
  candidates: readonly DecisionV3Candidate[],
  conditions: DecisionV3Conditions,
  limit: number,
) {
  const candidateIds: string[] = [];
  const reasonsByCandidateId: Record<string, string[]> = {};

  for (const candidate of candidates) {
    if (candidateIds.length >= limit || !isExternalCandidate(candidate)) continue;
    if (candidate.provenance.businessStatus === 'closed') continue;
    if (conditions.area !== 'any' && candidate.selection.area !== conditions.area) continue;
    if (conditions.budget !== 'any') {
      // Unknown/provider-variable prices must never be inferred as inexpensive.
      if (candidate.selection.price.kind === 'variable') continue;
      if (evaluatePrice(candidate.selection.price, conditions.budget).rejected) continue;
    }

    const reasons = [candidate.provenance.reason];
    if (conditions.budget !== 'any') reasons.push(BUDGET_REASON[conditions.budget]);
    reasons.push('人数／気分の適性は未確認');
    candidateIds.push(candidate.id);
    reasonsByCandidateId[candidate.id] = reasons.slice(0, 3);
  }

  return { candidateIds, reasonsByCandidateId };
}

function isExternalCandidate(
  candidate: DecisionV3Candidate,
): candidate is DecisionV3Candidate & { provenance: DecisionV3CandidateProvenance } {
  return candidate.provenance?.kind === 'external-live-google'
    || candidate.provenance?.kind === 'external-catalog-osm';
}
