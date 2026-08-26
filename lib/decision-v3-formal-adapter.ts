import { DECISION_CANDIDATE_EVIDENCE } from '@/data/decision-candidate-evidence';
import { DECISION_CANDIDATE_FRESHNESS } from '@/data/decision-candidate-freshness';
import {
  B2_APPROVED_FORMAL_DECISION_V3_DEFINITIONS,
  INITIAL_FORMAL_DECISION_V3_DEFINITIONS,
} from '@/data/decision-candidate-proposals';
import { DECISION_CANDIDATES } from '@/data/decision-candidates';
import {
  DECISION_INDEPENDENT_REVIEWS,
  DECISION_OPERATOR_REVIEWS,
  DECISION_VERIFICATION_ARTIFACTS,
  DECISION_VERIFICATION_HOLDS,
} from '@/data/decision-verification-records';
import { getEligibleDecisionCandidates } from '@/lib/decision-eligibility';
import { getProductionReadyCandidates } from '@/lib/decision-release-readiness';
import {
  isDecisionActionDisplayable,
  isSafeExternalUrl,
  isValidVerificationDate,
  resolveDecisionCandidateVisual,
} from '@/lib/decision-safety';
import type {
  DecisionAction,
  DecisionCandidate,
  DecisionCandidateEvidence,
  DecisionOfficialFactEvidence,
} from '@/types/decision-candidate';
import type { DecisionCandidateEligibility, ISODate } from '@/types/decision-freshness';
import type {
  DecisionEditorialFastTrackContext,
  DecisionIndependentReview,
  DecisionOperatorReview,
  DecisionReleaseReadyCandidates,
  DecisionVerificationArtifact,
  DecisionVerificationHold,
} from '@/types/decision-verification-governance';
import type {
  AreaChoice,
  CandidateAction,
  DecisionV3Candidate,
  DecisionV3CandidatePhoto,
  DecisionV3Price,
  DecisionV3SelectionProfile,
} from '@/types/decision-v3';

export type FormalDecisionV3CandidateDefinition = {
  candidateId: string;
  /** This is an approved Catalog-to-V3 area mapping. It is never inferred from display text. */
  area: Exclude<AreaChoice, 'any'>;
  /** Editorial-neutral category text supplied only with a reviewed formal record. */
  genre: string;
  /** Keeps fixed, range, and variable pricing distinct through the V3 selector and UI. */
  price: DecisionV3Price;
};

export type FormalDecisionV3AdapterInput = {
  candidates: readonly DecisionCandidate[];
  evidence: readonly DecisionCandidateEvidence[];
  eligibility: readonly DecisionCandidateEligibility[];
  releaseReady: DecisionReleaseReadyCandidates;
  definitions: readonly FormalDecisionV3CandidateDefinition[];
};

export type FormalDecisionV3ActivationInput = {
  evaluatedAsOf: ISODate;
  evaluatedAt: string;
  candidates?: readonly DecisionCandidate[];
  evidence?: readonly DecisionCandidateEvidence[];
  freshness?: typeof DECISION_CANDIDATE_FRESHNESS;
  artifacts?: readonly DecisionVerificationArtifact[];
  operatorReviews?: readonly DecisionOperatorReview[];
  independentReviews?: readonly DecisionIndependentReview[];
  holds?: readonly DecisionVerificationHold[];
  definitions?: readonly FormalDecisionV3CandidateDefinition[];
};

/**
 * Definitions may be prepared before review, but the adapter admits a
 * candidate only after both eligibility and production-readiness gates pass.
 * S2's three definitions therefore do not change the current zero-candidate
 * production result.
 */
export const FORMAL_DECISION_V3_DEFINITIONS: readonly FormalDecisionV3CandidateDefinition[] =
  [
    ...INITIAL_FORMAL_DECISION_V3_DEFINITIONS,
    ...B2_APPROVED_FORMAL_DECISION_V3_DEFINITIONS,
  ];

const EMPTY_REFINEMENT_PROFILE: Pick<
  DecisionV3SelectionProfile,
  | 'smokingPolicy'
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
> = {
  smokingPolicy: 'unknown',
  privateRoom: 'unknown',
  tatami: 'unknown',
  counter: 'unknown',
  familyAndStroller: 'unknown',
  reservation: 'unknown',
  parking: 'unknown',
  rainFriendly: 'unknown',
  wifi: 'unknown',
  powerOutlet: 'unknown',
  terrace: 'unknown',
  lateNight: 'unknown',
  quiet: 'unknown',
  longStay: 'unknown',
};

/**
 * Resolves the current production-safe presentation candidates. Both the
 * eligibility gate and the release-readiness gate must pass before a candidate
 * can be adapted. Standard candidates retain their independent-review Gate;
 * qualifying editorial-fast-track candidates are evaluated by its narrower
 * policy. An empty registry intentionally returns [].
 */
export function getActiveFormalDecisionV3Candidates(
  input: FormalDecisionV3ActivationInput,
): readonly DecisionV3Candidate[] {
  const candidates = input.candidates ?? DECISION_CANDIDATES;
  const evidence = input.evidence ?? DECISION_CANDIDATE_EVIDENCE;
  const freshness = input.freshness ?? DECISION_CANDIDATE_FRESHNESS;
  const definitions = input.definitions ?? FORMAL_DECISION_V3_DEFINITIONS;
  const eligibleSet = getEligibleDecisionCandidates(
    candidates,
    evidence,
    freshness,
    input.evaluatedAsOf,
  );
  const releaseReady = getProductionReadyCandidates({
    candidates,
    eligibleSet,
    artifacts: input.artifacts ?? DECISION_VERIFICATION_ARTIFACTS,
    operatorReviews: input.operatorReviews ?? DECISION_OPERATOR_REVIEWS,
    independentReviews: input.independentReviews ?? DECISION_INDEPENDENT_REVIEWS,
    holds: input.holds ?? DECISION_VERIFICATION_HOLDS,
    evaluatedAsOf: input.evaluatedAt,
    editorialFastTrackContexts: toEditorialFastTrackContexts(definitions),
  });

  return adaptFormalDecisionV3Candidates({
    candidates,
    evidence,
    eligibility: eligibleSet.eligibility,
    releaseReady,
    definitions,
  });
}

function toEditorialFastTrackContexts(
  definitions: readonly FormalDecisionV3CandidateDefinition[],
): readonly DecisionEditorialFastTrackContext[] {
  return definitions.map((definition) => ({
    candidateId: definition.candidateId,
    area: definition.area,
    priceKind: definition.price.kind,
  }));
}

/**
 * Pure adapter used by the runtime registry and isolated fixtures. It never
 * promotes a candidate: the caller must provide exactly one eligible and
 * production-ready result for each candidate.
 */
export function adaptFormalDecisionV3Candidates(
  input: FormalDecisionV3AdapterInput,
): readonly DecisionV3Candidate[] {
  const definitionsById = uniqueDefinitions(input.definitions);
  const eligibleIds = new Set(
    input.eligibility.filter((entry) => entry.eligible).map((entry) => entry.candidateId),
  );
  const releaseReadyIds = new Set(
    input.releaseReady.readyCandidates
      .filter((entry) => entry.productionUseApproved)
      .map((entry) => entry.candidateId),
  );
  const candidateIds = new Set<string>();
  const adapted: DecisionV3Candidate[] = [];

  for (const candidate of input.candidates) {
    if (candidateIds.has(candidate.id)) continue;
    candidateIds.add(candidate.id);
    if (!eligibleIds.has(candidate.id) || !releaseReadyIds.has(candidate.id)) continue;

    const definition = definitionsById.get(candidate.id);
    if (!definition) continue;
    const presentation = adaptCandidate(candidate, definition, input.evidence, adapted.length);
    if (presentation) adapted.push(presentation);
  }

  return adapted;
}

function adaptCandidate(
  candidate: DecisionCandidate,
  definition: FormalDecisionV3CandidateDefinition,
  evidence: readonly DecisionCandidateEvidence[],
  order: number,
): DecisionV3Candidate | undefined {
  if (!candidate.displayName.trim() || !definition.genre.trim() || !isValidPrice(definition.price)) {
    return undefined;
  }

  const supportedPartyTypes = Array.from(new Set(
    candidate.partyTypes.map(toV3Party),
  ));
  const supportedPurposes = Array.from(new Set(
    candidate.moodTags
      .map(toV3Mood)
      .filter((value): value is NonNullable<typeof value> => value !== undefined),
  ));
  if (supportedPartyTypes.length === 0 || supportedPurposes.length === 0) return undefined;

  return {
    id: candidate.id,
    neutralLabel: `候補${String.fromCharCode(65 + order)}`,
    name: candidate.displayName,
    area: areaLabel(definition.area),
    budget: definition.price.label,
    genre: definition.genre,
    tags: [],
    points: [],
    facts: {
      access: candidate.nearestStation,
      atmosphere: '確認中',
      smoking: '確認中',
      seats: '確認中',
      privateRoom: '確認中',
      tatami: '確認中',
      solo: candidate.partyTypes.includes('solo') ? '一人利用の分類を確認済み' : '確認中',
      kids: candidate.partyTypes.includes('family') ? '家族利用の分類を確認済み' : '確認中',
      reservation: candidate.reservationAvailability === 'channel-available'
        ? '予約導線を確認済み'
        : '確認中',
      longStay: '確認中',
    },
    actions: candidate.actions.flatMap(toV3Action),
    photo: toV3Photo(candidate),
    detailInfo: toV3DetailInfo(candidate, evidence),
    selection: {
      supportedPartyTypes,
      supportedPurposes,
      area: definition.area,
      price: definition.price,
      ...EMPTY_REFINEMENT_PROFILE,
    },
  };
}

function uniqueDefinitions(
  definitions: readonly FormalDecisionV3CandidateDefinition[],
): ReadonlyMap<string, FormalDecisionV3CandidateDefinition> {
  const duplicated = new Set<string>();
  const values = new Map<string, FormalDecisionV3CandidateDefinition>();
  for (const definition of definitions) {
    if (values.has(definition.candidateId)) duplicated.add(definition.candidateId);
    else values.set(definition.candidateId, definition);
  }
  duplicated.forEach((candidateId) => values.delete(candidateId));
  return values;
}

function toV3Party(
  value: DecisionCandidate['partyTypes'][number],
): DecisionV3SelectionProfile['supportedPartyTypes'][number] {
  if (value === 'couple') return 'pair' as const;
  return value;
}

function toV3Mood(value: DecisionCandidate['moodTags'][number]) {
  if (value === 'newExperience') return 'new-experience' as const;
  if (value === 'hearty' || value === 'light' || value === 'relax') return value;
  return undefined;
}

function areaLabel(area: Exclude<AreaChoice, 'any'>): string {
  return {
    sakae: '栄・伏見',
    meieki: '名駅・駅周辺',
    osu: '大須・上前津',
  }[area];
}

function isValidPrice(price: DecisionV3Price): boolean {
  if (!price.label.trim()) return false;
  if (price.kind === 'fixed') return Number.isFinite(price.amount) && price.amount >= 0;
  if (price.kind === 'range') {
    return Number.isFinite(price.minimum)
      && Number.isFinite(price.maximum)
      && price.minimum >= 0
      && price.maximum >= price.minimum;
  }
  return price.note.trim().length > 0;
}

function toV3Action(action: DecisionAction): CandidateAction[] {
  if (!isDecisionActionDisplayable(action)) return [];
  if (action.type === 'map') {
    return [{
      type: 'access',
      label: action.label,
      href: action.url,
      availability: 'verified',
      verifiedAt: action.verifiedAt,
      source: action.url,
    }];
  }
  if (action.type === 'official') {
    return [{
      type: 'official',
      label: action.label,
      href: action.url,
      availability: 'verified',
      verifiedAt: action.verifiedAt,
      source: action.url,
    }];
  }
  if (action.type === 'phone') {
    return [{
      type: 'phone',
      label: action.label,
      href: action.url,
      availability: 'verified',
      verifiedAt: action.verifiedAt,
      source: action.url,
    }];
  }
  if (action.type === 'reservation') {
    return [{
      type: action.url.startsWith('tel:') ? 'phone' : 'reservation',
      label: action.label,
      href: action.url,
      availability: 'verified',
      verifiedAt: action.verifiedAt,
      source: action.url,
    }];
  }
  return [];
}

function toV3Photo(candidate: DecisionCandidate): DecisionV3CandidatePhoto {
  const visual = resolveDecisionCandidateVisual(candidate.visual);
  if (visual.kind !== 'photo') {
    return {
      alt: `${candidate.displayName}の写真は確認中です`,
      availability: 'unregistered',
      rightsStatus: 'unverified',
    };
  }
  return {
    src: visual.image.src,
    alt: visual.image.alt,
    availability: 'available',
    rightsStatus: 'verified',
  };
}

function toV3DetailInfo(
  candidate: DecisionCandidate,
  evidence: readonly DecisionCandidateEvidence[],
): DecisionV3Candidate['detailInfo'] {
  const details: NonNullable<DecisionV3Candidate['detailInfo']> = {};
  const locationEvidence = findOfficialFact(candidate, evidence, 'location');
  const hoursEvidence = findOfficialFact(candidate, evidence, 'openingHours');
  if (candidate.location?.trim() && locationEvidence) {
    details.address = toVerifiedDetail(candidate.location, locationEvidence);
  }
  if (hoursEvidence) {
    const lastOrder = candidate.openingHours.lastOrder ? `（L.O. ${candidate.openingHours.lastOrder}）` : '';
    details.hours = toVerifiedDetail(
      `${candidate.openingHours.opens}〜${candidate.openingHours.closes}${lastOrder}`,
      hoursEvidence,
    );
  }
  return Object.keys(details).length > 0 ? details : undefined;
}

function findOfficialFact(
  candidate: DecisionCandidate,
  evidenceRecords: readonly DecisionCandidateEvidence[],
  field: DecisionOfficialFactEvidence['field'],
): DecisionOfficialFactEvidence | undefined {
  const matches = evidenceRecords.filter((evidence): evidence is DecisionOfficialFactEvidence => (
    evidence.candidateId === candidate.id
    && evidence.kind === 'official-fact'
    && evidence.field === field
  ));
  return matches.length === 1 ? matches[0] : undefined;
}

function toVerifiedDetail(
  value: string,
  evidence: DecisionOfficialFactEvidence,
): { value: string; verifiedAt: string; source: string } | undefined {
  if (!value.trim() || !isValidVerificationDate(evidence.verifiedAt) || !isSafeExternalUrl(evidence.sourceUrl)) {
    return undefined;
  }
  return { value, verifiedAt: evidence.verifiedAt, source: evidence.sourceUrl };
}
