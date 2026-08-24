import type {
  CompareAxis,
  DecisionV3Action,
  DecisionV3Conditions,
  DecisionV3Session,
  RefineChoice,
} from '@/types/decision-v3';
import { DEMO_CANDIDATES } from '@/data/decision-v3-demo';
import { selectDemoCandidates } from '@/lib/decision-v3-selector';

export const DEFAULT_AXES: CompareAxis[] = ['budget', 'access', 'atmosphere', 'smoking', 'seats'];

export type DecisionV3CandidateSource = 'demo' | 'formal';

const REFINE_AXIS: Partial<Record<RefineChoice, CompareAxis>> = {
  reservable: 'reservation',
  wifi: 'wifi',
  power: 'power',
  'private-room': 'private-room',
  'rain-safe': 'rain-safe',
  'long-stay': 'long-stay',
  tatami: 'tatami',
  counter: 'seats',
  'kids-ok': 'kids',
  parking: 'parking',
  terrace: 'terrace',
  'late-night': 'late-night',
  'smoke-free': 'smoking',
  'smoking-ok': 'smoking',
  quiet: 'atmosphere',
};

export const createInitialDecisionV3State = (): DecisionV3Session => ({
  version: 2,
  step: 'home',
  conditions: {},
  refine: [],
  selectionResult: null,
  compareIds: [],
  compareOrder: [],
  axes: [...DEFAULT_AXES],
  chosenId: null,
  detailId: null,
});

const move = <T,>(items: T[], from: number, to: number) => {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const toggleExclusiveRefine = (current: RefineChoice[], value: RefineChoice) => {
  if (current.includes(value)) return current.filter((item) => item !== value);
  const smokingChoices: RefineChoice[] = ['smoke-free', 'smoking-ok', 'smoking-any'];
  const withoutConflict = smokingChoices.includes(value)
    ? current.filter((item) => !smokingChoices.includes(item))
    : current;
  return [...withoutConflict, value];
};

export function decisionV3Reducer(state: DecisionV3Session, action: DecisionV3Action): DecisionV3Session {
  switch (action.type) {
    case 'SET_CONDITION':
      return {
        ...state,
        conditions: { ...state.conditions, [action.group]: action.value },
        selectionResult: null,
        compareIds: [],
        compareOrder: [],
        chosenId: null,
        detailId: null,
      };
    case 'TOGGLE_REFINE':
      return {
        ...state,
        refine: toggleExclusiveRefine(state.refine, action.value),
        selectionResult: null,
        compareIds: [],
        compareOrder: [],
        chosenId: null,
        detailId: null,
      };
    case 'PREPARE_CANDIDATES': {
      const axes: CompareAxis[] = ['budget', 'access', 'atmosphere'];
      for (const refine of state.refine) {
        const axis = REFINE_AXIS[refine];
        if (axis && !axes.includes(axis) && axes.length < 5) axes.push(axis);
      }
      for (const fallback of ['smoking', 'seats'] satisfies CompareAxis[]) {
        if (!axes.includes(fallback) && axes.length < 5) axes.push(fallback);
      }
      const selectionResult = selectDemoCandidates({
        conditions: state.conditions,
        preferences: state.refine,
        // Formal candidates are intentionally not adapted into the Decision v3
        // presentation contract until their independent review is complete.
        // Production therefore fails closed with no candidates rather than
        // substituting DEMO_CANDIDATES.
        candidates: action.candidateSource === 'demo' ? DEMO_CANDIDATES : [],
      });
      return {
        ...state,
        selectionResult,
        compareIds: [],
        compareOrder: [],
        axes,
        chosenId: null,
        detailId: null,
      };
    }
    case 'GO':
      return {
        ...state,
        step: action.step,
        detailId: action.step === 'detail' ? (action.detailId ?? state.detailId) : state.detailId,
      };
    case 'TOGGLE_COMPARE': {
      if (
        state.selectionResult?.kind !== 'matched'
        || !state.selectionResult.candidateIds.includes(action.candidateId)
      ) {
        return state;
      }
      const exists = state.compareIds.includes(action.candidateId);
      if (!exists && state.compareIds.length >= 3) return state;
      const compareIds = exists
        ? state.compareIds.filter((id) => id !== action.candidateId)
        : [...state.compareIds, action.candidateId];
      const compareOrder = exists
        ? state.compareOrder.filter((id) => id !== action.candidateId)
        : [...state.compareOrder.filter((id) => compareIds.includes(id)), action.candidateId];
      return { ...state, compareIds, compareOrder, chosenId: null };
    }
    case 'REORDER_COMPARE': {
      const index = state.compareOrder.indexOf(action.candidateId);
      return { ...state, compareOrder: move(state.compareOrder, index, index + action.direction) };
    }
    case 'SET_COMPARE_ORDER':
      return { ...state, compareOrder: action.ids.filter((id) => state.compareIds.includes(id)) };
    case 'TOGGLE_AXIS': {
      const exists = state.axes.includes(action.axis);
      if (exists && state.axes.length === 1) return state;
      if (!exists && state.axes.length >= 5) return state;
      const axes = exists ? state.axes.filter((axis) => axis !== action.axis) : [...state.axes, action.axis];
      return { ...state, axes };
    }
    case 'REORDER_AXIS': {
      const index = state.axes.indexOf(action.axis);
      return { ...state, axes: move(state.axes, index, index + action.direction) };
    }
    case 'CHOOSE':
      if (!state.compareIds.includes(action.candidateId)) return state;
      return { ...state, chosenId: action.candidateId };
    case 'RESET_SEARCH':
      return {
        ...createInitialDecisionV3State(),
        conditions: state.conditions,
        refine: state.refine,
      };
    case 'RESTORE':
      return action.state;
    default:
      return state;
  }
}

export function normalizeDecisionV3RestoredState(
  state: DecisionV3Session,
  candidateSource: DecisionV3CandidateSource,
): DecisionV3Session {
  if (candidateSource === 'demo') return state;

  const base = {
    ...createInitialDecisionV3State(),
    conditions: state.conditions,
    refine: state.refine,
  };

  if (state.step === 'home' || !hasAllRequiredConditions(base.conditions)) return base;

  return {
    ...decisionV3Reducer(base, { type: 'PREPARE_CANDIDATES', candidateSource }),
    step: 'candidates',
  };
}

export const hasAllRequiredConditions = (
  conditions: Partial<DecisionV3Conditions>,
): conditions is DecisionV3Conditions =>
  Boolean(conditions.party && conditions.budget && conditions.mood && conditions.area);
