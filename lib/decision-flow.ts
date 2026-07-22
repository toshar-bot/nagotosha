import type {
  CandidateDecision,
  DecisionFlowEvent,
  DecisionFlowState,
  DecisionFlowTransition,
  PresentSession,
} from '../types/decision-presentation';

export const INITIAL_DECISION_FLOW_STATE: DecisionFlowState = { phase: 'incomplete' };

export function reduceDecisionFlow(
  state: DecisionFlowState,
  event: DecisionFlowEvent,
): DecisionFlowTransition {
  if (event.type === 'RESET') {
    return accepted({ phase: 'incomplete' });
  }

  if (event.type === 'START_MATCHED') {
    return startMatched(state, event.candidateIds);
  }

  if (event.type === 'START_NO_MATCH') {
    return accepted({ phase: 'no-match', relaxHints: [...event.relaxHints] });
  }

  if (event.type === 'START_DATA_UNAVAILABLE') {
    return accepted({ phase: 'data-unavailable' });
  }

  if (event.type === 'REQUEST_RELAXATION') {
    if (state.phase !== 'no-match') return rejected(state, 'event-not-allowed');
    return {
      state,
      accepted: true,
      effect: { type: 'request-relaxation', axis: event.axis },
    };
  }

  if (event.type === 'MARK_INTERESTED' || event.type === 'MARK_REJECTED') {
    if (state.phase !== 'presenting') return rejected(state, 'event-not-allowed');
    return advanceSession(
      state.session,
      event.type === 'MARK_INTERESTED' ? 'interested' : 'rejected',
    );
  }

  if (event.type === 'BACK') {
    if (state.phase !== 'presenting') return rejected(state, 'event-not-allowed');
    const previousCursor = state.session.history.at(-1);
    if (previousCursor === undefined) return rejected(state, 'event-not-allowed');
    return accepted({
      phase: 'presenting',
      session: {
        ...state.session,
        cursor: previousCursor,
        history: state.session.history.slice(0, -1),
        decisionsByCandidateId: { ...state.session.decisionsByCandidateId },
      },
    });
  }

  if (event.type === 'RETURN_TO_PRESENTING') {
    if (state.phase !== 'comparing') return rejected(state, 'event-not-allowed');
    return accepted({
      phase: 'presenting',
      session: {
        ...state.session,
        cursor: state.session.candidateIds.length - 1,
        candidateIds: [...state.session.candidateIds],
        history: [...state.session.history],
        decisionsByCandidateId: { ...state.session.decisionsByCandidateId },
      },
    });
  }

  if (event.type === 'DECIDE') {
    if (state.phase !== 'comparing') return rejected(state, 'event-not-allowed');
    if (state.session.decisionsByCandidateId[event.candidateId] !== 'interested') {
      return rejected(state, 'candidate-not-interested');
    }
    return accepted({ phase: 'decided', candidateId: event.candidateId });
  }

  return rejected(state, 'event-not-allowed');
}

function startMatched(
  currentState: DecisionFlowState,
  candidateIds: readonly string[],
): DecisionFlowTransition {
  const uniqueIds = new Set(candidateIds);
  if (candidateIds.length < 1 || candidateIds.length > 3) {
    return rejected(currentState, 'candidate-count-out-of-range');
  }
  if (uniqueIds.size !== candidateIds.length || candidateIds.some((id) => !id.trim())) {
    return rejected(currentState, 'candidate-id-invalid');
  }

  const decisionsByCandidateId: Record<string, CandidateDecision> = {};
  candidateIds.forEach((candidateId) => {
    decisionsByCandidateId[candidateId] = 'undecided';
  });

  return accepted({
    phase: 'presenting',
    session: {
      candidateIds: [...candidateIds],
      cursor: 0,
      decisionsByCandidateId,
      history: [],
    },
  });
}

function advanceSession(
  session: PresentSession,
  decision: Exclude<CandidateDecision, 'undecided'>,
): DecisionFlowTransition {
  const candidateId = session.candidateIds[session.cursor];
  if (!candidateId) return rejected({ phase: 'presenting', session }, 'event-not-allowed');

  const nextDecisions = {
    ...session.decisionsByCandidateId,
    [candidateId]: decision,
  };
  const nextCursor = session.cursor + 1;

  if (nextCursor < session.candidateIds.length) {
    return accepted({
      phase: 'presenting',
      session: {
        candidateIds: [...session.candidateIds],
        cursor: nextCursor,
        decisionsByCandidateId: nextDecisions,
        history: [...session.history, session.cursor],
      },
    });
  }

  const interestedIds = session.candidateIds.filter(
    (id) => nextDecisions[id] === 'interested',
  );
  if (interestedIds.length === 0) return accepted({ phase: 'no-remaining' });
  if (interestedIds.length === 1) {
    return accepted({ phase: 'decided', candidateId: interestedIds[0] });
  }

  const completedSession: PresentSession = {
    candidateIds: [...session.candidateIds],
    cursor: session.candidateIds.length - 1,
    decisionsByCandidateId: nextDecisions,
    history: [...session.history],
  };
  return accepted({
    phase: 'comparing',
    candidateIds: interestedIds,
    session: completedSession,
  });
}

function accepted(state: DecisionFlowState): DecisionFlowTransition {
  return { state, accepted: true };
}

function rejected(
  state: DecisionFlowState,
  violation: DecisionFlowTransition['violation'],
): DecisionFlowTransition {
  return { state, accepted: false, violation };
}
