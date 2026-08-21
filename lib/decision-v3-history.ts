import { parseDecisionV3Session } from '@/lib/decision-v3-session';
import type {
  DecisionV3HistorySnapshot,
  DecisionV3Session,
  DecisionV3Step,
} from '@/types/decision-v3';

const HISTORY_MARKER = 'nago-decision-v3';

export type DecisionV3HistoryState = {
  app: typeof HISTORY_MARKER;
  snapshot: DecisionV3HistorySnapshot;
};

function decisionV3Url(step: DecisionV3Step, detailId?: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.set('step', step);
  if (step === 'detail' && detailId) {
    url.searchParams.set('candidate', detailId);
  } else {
    url.searchParams.delete('candidate');
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function createDecisionV3HistorySnapshot(
  state: DecisionV3Session,
): DecisionV3HistorySnapshot {
  return {
    sessionVersion: state.version,
    step: state.step,
    selectedConditions: { ...state.conditions },
    selectedPreferences: [...state.refine],
    selectionResult: state.selectionResult
      ? structuredClone(state.selectionResult)
      : null,
    comparedCandidateIds: [...state.compareIds],
    compareOrder: [...state.compareOrder],
    comparisonAxes: [...state.axes],
    selectedCandidateId: state.chosenId,
    detailId: state.detailId,
    decidedCandidateId: state.step === 'decided' ? state.chosenId : null,
  };
}

export function createDecisionV3HistoryState(
  state: DecisionV3Session,
): DecisionV3HistoryState {
  return {
    app: HISTORY_MARKER,
    snapshot: createDecisionV3HistorySnapshot(state),
  };
}

export function readDecisionV3HistoryState(value: unknown): DecisionV3Session | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const historyState = value as Partial<DecisionV3HistoryState>;
  if (historyState.app !== HISTORY_MARKER || !historyState.snapshot) return null;
  const snapshot = historyState.snapshot;
  if (
    snapshot.sessionVersion !== 2
    || (snapshot.step === 'decided' && !snapshot.decidedCandidateId)
    || (
      snapshot.decidedCandidateId !== null
      && snapshot.decidedCandidateId !== snapshot.selectedCandidateId
    )
  ) {
    return null;
  }
  return parseDecisionV3Session({
    version: snapshot.sessionVersion,
    step: snapshot.step,
    conditions: snapshot.selectedConditions,
    refine: snapshot.selectedPreferences,
    selectionResult: snapshot.selectionResult,
    compareIds: snapshot.comparedCandidateIds,
    compareOrder: snapshot.compareOrder,
    axes: snapshot.comparisonAxes,
    chosenId: snapshot.selectedCandidateId,
    detailId: snapshot.detailId,
  });
}

export function replaceDecisionV3History(state: DecisionV3Session) {
  if (typeof window === 'undefined') return;
  window.history.replaceState(
    createDecisionV3HistoryState(state),
    '',
    decisionV3Url(state.step, state.detailId),
  );
}

export function pushDecisionV3History(state: DecisionV3Session) {
  if (typeof window === 'undefined') return;
  window.history.pushState(
    createDecisionV3HistoryState(state),
    '',
    decisionV3Url(state.step, state.detailId),
  );
}

export function isDecisionV3HistoryState(value: unknown): value is DecisionV3HistoryState {
  return readDecisionV3HistoryState(value) !== null;
}
