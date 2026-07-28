import { createInitialDecisionV3State, hasAllRequiredConditions } from '@/lib/decision-v3-state';
import type {
  AreaChoice,
  BudgetChoice,
  CandidateSelectionResult,
  CompareAxis,
  DecisionV3ConditionDraft,
  DecisionV3Session,
  DecisionV3Step,
  MoodChoice,
  PartyChoice,
  RefineChoice,
} from '@/types/decision-v3';

export const DECISION_V3_SESSION_KEY = 'nago.decision.v3_1.session';

const STEPS = ['home', 'candidates', 'detail', 'compare', 'decided'] satisfies DecisionV3Step[];
const PARTIES = ['solo', 'pair', 'family', 'group'] satisfies PartyChoice[];
const BUDGETS = ['under1000', 'under2000', 'under4000', 'any'] satisfies BudgetChoice[];
const MOODS = ['hearty', 'light', 'relax', 'new-experience'] satisfies MoodChoice[];
const AREAS = ['sakae', 'meieki', 'osu', 'any'] satisfies AreaChoice[];
const REFINE = [
  'reservable',
  'wifi',
  'power',
  'private-room',
  'rain-safe',
  'long-stay',
  'smoke-free',
  'smoking-ok',
  'smoking-any',
  'tatami',
  'counter',
  'kids-ok',
  'parking',
  'terrace',
  'late-night',
  'quiet',
] satisfies RefineChoice[];
const AXES = [
  'budget',
  'area',
  'access',
  'atmosphere',
  'smoking',
  'seats',
  'private-room',
  'tatami',
  'solo',
  'kids',
  'reservation',
  'long-stay',
  'wifi',
  'power',
  'rain-safe',
  'parking',
  'terrace',
  'late-night',
  'quiet',
] satisfies CompareAxis[];
const CANDIDATE_IDS = ['demo-a', 'demo-b', 'demo-c'] as const;
const SESSION_ROOT_KEYS: ReadonlySet<string> = new Set([
  'version',
  'step',
  'conditions',
  'refine',
  'selectionResult',
  'compareIds',
  'compareOrder',
  'axes',
  'chosenId',
  'detailId',
] satisfies (keyof DecisionV3Session)[]);
const CONDITION_KEYS: ReadonlySet<string> = new Set([
  'party',
  'budget',
  'mood',
  'area',
] satisfies (keyof DecisionV3ConditionDraft)[]);

const hasOnlyUniqueValues = (values: string[]) => new Set(values).size === values.length;
const hasOnlyAllowedKeys = (
  source: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
) => Object.keys(source).every((key) => allowedKeys.has(key));
const hasExactKeys = (
  source: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
) => Object.keys(source).length === allowedKeys.size && hasOnlyAllowedKeys(source, allowedKeys);

function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

function readConditions(value: unknown): DecisionV3ConditionDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid conditions');
  const source = value as Record<string, unknown>;
  if (!hasOnlyAllowedKeys(source, CONDITION_KEYS)) throw new Error('invalid condition key');

  const conditions: DecisionV3ConditionDraft = {};
  if (source.party !== undefined) {
    if (!isOneOf(source.party, PARTIES)) throw new Error('invalid party');
    conditions.party = source.party;
  }
  if (source.budget !== undefined) {
    if (!isOneOf(source.budget, BUDGETS)) throw new Error('invalid budget');
    conditions.budget = source.budget;
  }
  if (source.mood !== undefined) {
    if (!isOneOf(source.mood, MOODS)) throw new Error('invalid mood');
    conditions.mood = source.mood;
  }
  if (source.area !== undefined) {
    if (!isOneOf(source.area, AREAS)) throw new Error('invalid area');
    conditions.area = source.area;
  }
  return conditions;
}

function readStringArray<T extends string>(
  value: unknown,
  allowed: readonly T[],
  maximum: number,
  minimum = 0,
): T[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    throw new Error('invalid array length');
  }
  if (!value.every((item) => isOneOf(item, allowed)) || !hasOnlyUniqueValues(value)) {
    throw new Error('invalid array value');
  }
  return value as T[];
}

function readPlainStringArray(value: unknown, maximum: number, minimum = 0) {
  if (
    !Array.isArray(value)
    || value.length < minimum
    || value.length > maximum
    || !value.every((item) => typeof item === 'string' && item.length > 0)
    || !hasOnlyUniqueValues(value)
  ) {
    throw new Error('invalid string array');
  }
  return value as string[];
}

function readSelectionResult(value: unknown): CandidateSelectionResult | null {
  if (value === null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('invalid selection result');
  }
  const source = value as Record<string, unknown>;
  if (source.kind === 'matched') {
    const candidateIds = readStringArray(source.candidateIds, CANDIDATE_IDS, 3, 1);
    if (
      !source.reasonsByCandidateId
      || typeof source.reasonsByCandidateId !== 'object'
      || Array.isArray(source.reasonsByCandidateId)
    ) {
      throw new Error('invalid candidate reasons');
    }
    const reasonSource = source.reasonsByCandidateId as Record<string, unknown>;
    if (
      Object.keys(reasonSource).length !== candidateIds.length
      || Object.keys(reasonSource).some((id) => !candidateIds.includes(id as (typeof CANDIDATE_IDS)[number]))
    ) {
      throw new Error('candidate reasons do not match selected candidates');
    }
    const reasonsByCandidateId: Record<string, string[]> = {};
    for (const candidateId of candidateIds) {
      reasonsByCandidateId[candidateId] = readPlainStringArray(reasonSource[candidateId], 3, 1);
    }
    return { kind: 'matched', candidateIds, reasonsByCandidateId };
  }
  if (source.kind === 'no-match') {
    return {
      kind: 'no-match',
      relaxationHints: readPlainStringArray(source.relaxationHints, 2),
    };
  }
  if (source.kind === 'data-unavailable') {
    return {
      kind: 'data-unavailable',
      missingFields: readPlainStringArray(source.missingFields, 32, 1),
    };
  }
  throw new Error('invalid selection result kind');
}

export function parseDecisionV3Session(value: unknown): DecisionV3Session | null {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid session');
    const source = value as Record<string, unknown>;
    if (!hasExactKeys(source, SESSION_ROOT_KEYS)) throw new Error('invalid session keys');
    if (source.version !== 2 || !isOneOf(source.step, STEPS)) throw new Error('invalid session');

    const conditions = readConditions(source.conditions);
    const refine = readStringArray(source.refine, REFINE, REFINE.length);
    const smokingChoiceCount = ['smoke-free', 'smoking-ok', 'smoking-any']
      .filter((choice) => refine.includes(choice as RefineChoice))
      .length;
    if (smokingChoiceCount > 1) {
      throw new Error('exclusive refinement conflict');
    }
    const selectionResult = readSelectionResult(source.selectionResult);
    const selectableCandidateIds =
      selectionResult?.kind === 'matched' ? selectionResult.candidateIds : [];
    const compareIds = readStringArray(source.compareIds, CANDIDATE_IDS, 3);
    if (compareIds.some((id) => !selectableCandidateIds.includes(id))) {
      throw new Error('compared candidate was not selected');
    }
    const compareOrderInput = readStringArray(source.compareOrder, CANDIDATE_IDS, 3);
    if (compareOrderInput.some((id) => !compareIds.includes(id))) throw new Error('invalid compare order');
    const compareOrder = [
      ...compareOrderInput,
      ...compareIds.filter((id) => !compareOrderInput.includes(id)),
    ];
    const axes = readStringArray(source.axes, AXES, 5, 1);
    const chosenId = source.chosenId === null
      ? null
      : isOneOf(source.chosenId, CANDIDATE_IDS)
        ? source.chosenId
        : (() => {
            throw new Error('invalid chosen candidate');
          })();
    const detailId = source.detailId === null
      ? null
      : isOneOf(source.detailId, CANDIDATE_IDS)
        ? source.detailId
        : (() => {
            throw new Error('invalid detail candidate');
          })();

    if (chosenId && !compareIds.includes(chosenId)) throw new Error('chosen candidate is not compared');
    if (source.step !== 'home' && !hasAllRequiredConditions(conditions)) {
      throw new Error('step requires complete conditions');
    }
    if (source.step !== 'home' && !selectionResult) {
      throw new Error('step requires a candidate selection result');
    }
    if (
      source.step === 'detail'
      && (
        !detailId
        || selectionResult?.kind !== 'matched'
        || !selectionResult.candidateIds.includes(detailId)
      )
    ) {
      throw new Error('detail step requires a selected candidate');
    }
    if (source.step === 'compare' && compareIds.length === 0) {
      throw new Error('compare step requires candidates');
    }
    if (source.step === 'decided' && !chosenId) {
      throw new Error('decided step requires a candidate');
    }

    return {
      version: 2,
      step: source.step,
      conditions,
      refine,
      selectionResult,
      compareIds,
      compareOrder,
      axes,
      chosenId,
      detailId,
    };
  } catch {
    return null;
  }
}

export function loadDecisionV3Session(): DecisionV3Session {
  if (typeof window === 'undefined') return createInitialDecisionV3State();
  try {
    const raw = window.sessionStorage.getItem(DECISION_V3_SESSION_KEY);
    if (!raw) return createInitialDecisionV3State();
    const parsed = parseDecisionV3Session(JSON.parse(raw));
    if (parsed) return parsed;
  } catch {
    // Invalid JSON is handled by removing the unusable snapshot below.
  }
  window.sessionStorage.removeItem(DECISION_V3_SESSION_KEY);
  return createInitialDecisionV3State();
}

export function saveDecisionV3Session(state: DecisionV3Session) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DECISION_V3_SESSION_KEY, JSON.stringify(state));
}
