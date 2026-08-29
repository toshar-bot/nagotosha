'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { BrandHeader } from '@/components/common/BrandHeader';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { isDecisionV3ActionDisplayable } from '@/lib/decision-v3-action-gate';
import { createDecisionV3CandidateLookup } from '@/lib/decision-v3-candidate-lookup';
import { readDecisionV3HistoryState } from '@/lib/decision-v3-history';
import {
  scrollDecisionV3ElementIntoView,
} from '@/lib/decision-v3-motion';
import {
  hasDecisionV3PartyHandoffParameters,
  readDecisionV3PartyHandoff,
  removeDecisionV3PartyHandoffParameters,
} from '@/lib/decision-v3-party-handoff';
import {
  decisionV3Reducer,
  hasAllRequiredConditions,
  createInitialDecisionV3State,
  normalizeDecisionV3RestoredState,
  type DecisionV3CandidateSource,
} from '@/lib/decision-v3-state';
import { loadDecisionV3Session } from '@/lib/decision-v3-session';
import {
  createDecisionV3TransitionGuard,
  deferDecisionV3Analytics,
  persistDecisionV3State,
  type DecisionV3HistoryWriteMode,
} from '@/lib/decision-v3-transition';
import type {
  DecisionV3Candidate,
  DecisionV3Conditions,
  DecisionV3Step,
  RefineChoice,
} from '@/types/decision-v3';
import { BottomNavV3 } from './BottomNavV3';
import { CandidateListV3 } from './CandidateListV3';
import { CompareV3 } from './CompareV3';
import { ConditionPanelV3 } from './ConditionPanelV3';
import { DecidedV3 } from './DecidedV3';
import { DetailV3 } from './DetailV3';
import styles from './decision-v3.module.css';

type Props = {
  candidateSource?: DecisionV3CandidateSource;
  candidates?: readonly DecisionV3Candidate[];
};

export default function DecisionV3App({ candidateSource = 'formal', candidates = [] }: Props) {
  const [state, dispatch] = useReducer(decisionV3Reducer, undefined, createInitialDecisionV3State);
  const [hydrated, setHydrated] = useState(false);
  const [qaWidth, setQaWidth] = useState<number | null>(null);
  const [activeHomeSection, setActiveHomeSection] = useState<'home' | 'conditions'>('home');
  const conditionsRef = useRef<HTMLElement | null>(null);
  const transitionGuardRef = useRef(createDecisionV3TransitionGuard());
  const candidateLookup = useMemo(
    () => createDecisionV3CandidateLookup(candidateSource, candidates),
    [candidateSource, candidates],
  );

  const commitDecisionState = useCallback((
    nextState: ReturnType<typeof createInitialDecisionV3State>,
    history: DecisionV3HistoryWriteMode,
    scroll = true,
  ) => {
    flushSync(() => {
      dispatch({ type: 'RESTORE', state: nextState });
    });
    persistDecisionV3State(nextState, { history, scroll });
  }, []);

  const runTransition = useCallback((operation: () => void) => {
    transitionGuardRef.current.run(operation);
  }, []);

  useEffect(() => {
    const initialSearch = window.location.search;
    const width = Number(new URLSearchParams(initialSearch).get('qaWidth'));
    if ([320, 360, 375, 390, 430].includes(width)) setQaWidth(width);
    const restoredState =
      readDecisionV3HistoryState(window.history.state)
      ?? loadDecisionV3Session();
    const partyHandoff = readDecisionV3PartyHandoff(initialSearch);
    const restored = partyHandoff
      ? decisionV3Reducer(
          decisionV3Reducer(restoredState, {
            type: 'SET_CONDITION',
            group: 'party',
            value: partyHandoff,
          }),
          { type: 'GO', step: 'home' },
      )
      : restoredState;
    const normalizedRestored = normalizeDecisionV3RestoredState(
      restored,
      candidateSource,
      candidateLookup.candidates,
    );

    if (hasDecisionV3PartyHandoffParameters(initialSearch)) {
      try {
        window.history.replaceState(
          window.history.state,
          '',
          removeDecisionV3PartyHandoffParameters(window.location.href),
        );
      } catch {
        // The restored state below remains valid when the browser rejects a URL rewrite.
      }
    }

    dispatch({ type: 'RESTORE', state: normalizedRestored });
    persistDecisionV3State(normalizedRestored, { history: 'replace', scroll: false });
    setHydrated(true);

    if (partyHandoff) {
      setActiveHomeSection('conditions');
      window.requestAnimationFrame(() => {
        conditionsRef.current = document.getElementById('decision-v3-conditions');
        try {
          scrollDecisionV3ElementIntoView(conditionsRef.current, { block: 'start' });
        } catch {
          // A failed decorative scroll must not affect the restored handoff state.
        }
      });
    }
  }, [candidateLookup, candidateSource]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const onPopState = (event: PopStateEvent) => {
      const restored = normalizeDecisionV3RestoredState(
        readDecisionV3HistoryState(event.state) ?? createInitialDecisionV3State(),
        candidateSource,
        candidateLookup.candidates,
      );
      dispatch({ type: 'RESTORE', state: restored });
      persistDecisionV3State(restored, { history: 'none', scroll: true });
      setActiveHomeSection('home');
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [candidateLookup, candidateSource]);

  const navigate = useCallback((
    step: DecisionV3Step,
    detailId?: string | null,
    afterCommit?: () => void,
  ) => {
    const shouldTrackCompare = step === 'compare'
      && (state.step === 'candidates' || state.step === 'detail' || state.step === 'decided');

    runTransition(() => {
      const nextState = decisionV3Reducer(state, { type: 'GO', step, detailId });
      if (nextState.step === state.step && nextState.detailId === state.detailId) return;

      commitDecisionState(nextState, 'push');

      if (shouldTrackCompare) {
        deferDecisionV3Analytics(() => {
          trackAnalyticsEvent('compare_view', {
            compare_count: state.compareIds.length,
            source: state.step,
          });
        });
      }

      if (afterCommit) deferDecisionV3Analytics(afterCommit);
    });
  }, [commitDecisionState, runTransition, state]);

  useEffect(() => {
    if (state.step !== 'home') return;

    let frame = 0;
    const updateActiveHomeSection = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        conditionsRef.current = document.getElementById('decision-v3-conditions');
        const conditionsTop = conditionsRef.current?.getBoundingClientRect().top;
        const activationLine = Math.min(window.innerHeight * 0.28, 220);
        setActiveHomeSection(
          conditionsTop !== undefined && conditionsTop <= activationLine
            ? 'conditions'
            : 'home',
        );
      });
    };

    updateActiveHomeSection();
    window.addEventListener('scroll', updateActiveHomeSection, { passive: true });
    window.addEventListener('resize', updateActiveHomeSection);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateActiveHomeSection);
      window.removeEventListener('resize', updateActiveHomeSection);
    };
  }, [state.step]);

  const navigateHomeSection = useCallback((section: 'home' | 'conditions') => {
    if (section === 'home') {
      window.location.assign('/');
      return;
    }

    setActiveHomeSection(section);
    if (state.step !== 'home') {
      navigate('home');
    }
    try {
      window.setTimeout(() => {
        conditionsRef.current = document.getElementById('decision-v3-conditions');
        try {
          scrollDecisionV3ElementIntoView(conditionsRef.current, { block: 'start' });
        } catch {
          // The selected Home section remains usable without this optional scroll.
        }
      }, state.step === 'home' ? 0 : 40);
    } catch {
      // The selected Home section remains usable if scheduling a scroll fails.
    }
  }, [navigate, state.step]);

  const conditionsReady = hasAllRequiredConditions(state.conditions);
  const compareReady = state.compareIds.length > 0;
  const detailCandidateId = state.detailId;
  const trackExternalAction = useCallback((event: MouseEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a[href]');
    if (!anchor) return;

    const candidateId = state.step === 'detail'
      ? state.detailId
      : state.step === 'decided'
        ? state.chosenId
        : null;
    const surface = state.step === 'detail' || state.step === 'decided' ? state.step : null;
    if (!candidateId || !surface) return;

    const candidate = candidateLookup.get(candidateId);
    const href = anchor.getAttribute('href');
    const action = candidate?.actions.find(
      (item) => isDecisionV3ActionDisplayable(item) && item.href === href,
    );
    if (!action) return;

    if (action.type === 'access') {
      trackAnalyticsEvent('map_click', { store_id: candidateId, surface });
    } else if (action.type === 'official') {
      trackAnalyticsEvent('official_click', { store_id: candidateId, surface });
    } else if (
      action.type === 'phone'
      || (action.type === 'reservation' && action.href?.startsWith('tel:'))
    ) {
      trackAnalyticsEvent('phone_click', { store_id: candidateId, surface });
    }
  }, [candidateLookup, state.chosenId, state.detailId, state.step]);

  return (
    <main
      className={styles.decisionV3Root}
      data-hydrated={hydrated ? 'true' : 'false'}
      onClickCapture={trackExternalAction}
      style={qaWidth
        ? {
            width: qaWidth,
            maxWidth: '100%',
            marginInline: 'auto',
            '--decision-v3-width': `${qaWidth}px`,
          } as CSSProperties
        : undefined}
    >
      <BrandHeader actions="none" priority />

      {state.step === 'home' ? (
        <ConditionPanelV3
          conditions={state.conditions}
          refine={state.refine}
          onCondition={(group: keyof DecisionV3Conditions, value: string) => {
            commitDecisionState(
              decisionV3Reducer(state, { type: 'SET_CONDITION', group, value }),
              'replace',
              false,
            );
          }}
          onRefine={(value: RefineChoice) => {
            commitDecisionState(
              decisionV3Reducer(state, { type: 'TOGGLE_REFINE', value }),
              'replace',
              false,
            );
          }}
          onSubmit={() => {
            runTransition(() => {
              const preparedState = decisionV3Reducer(state, {
                type: 'PREPARE_CANDIDATES',
                candidates: candidateLookup.candidates,
              });
              const candidateState = decisionV3Reducer(preparedState, {
                type: 'GO',
                step: 'candidates',
              });
              const selectionResult = candidateState.selectionResult;

              commitDecisionState(candidateState, 'push');

              if (hasAllRequiredConditions(candidateState.conditions) && selectionResult) {
                deferDecisionV3Analytics(() => {
                  trackAnalyticsEvent('conditions_complete', {
                    party: candidateState.conditions.party,
                    area: candidateState.conditions.area,
                    budget: candidateState.conditions.budget,
                    refine_count: candidateState.refine.length,
                  });
                  trackAnalyticsEvent('candidates_view', {
                    party: candidateState.conditions.party,
                    candidate_count: selectionResult.kind === 'matched'
                      ? selectionResult.candidateIds.length
                      : 0,
                    result_status: selectionResult.kind.replace('-', '_'),
                  });
                });
              }
            });
          }}
        />
      ) : null}

      {state.step === 'candidates' && state.selectionResult ? (
        <CandidateListV3
          selectionResult={state.selectionResult}
          candidateLookup={candidateLookup}
          conditions={state.conditions}
          refine={state.refine}
          compareIds={state.compareIds}
          onToggleCompare={(candidateId) => {
            commitDecisionState(
              decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId }),
              'replace',
              false,
            );
          }}
          onDetail={(candidateId) => navigate('detail', candidateId, () => {
            trackAnalyticsEvent('candidate_detail_view', {
              store_id: candidateId,
              source: 'candidates',
            });
          })}
          onCompare={() => navigate('compare')}
          onBack={() => navigate('home')}
          onHome={() => window.location.assign('/')}
        />
      ) : null}

      {state.step === 'detail' ? (
        <DetailV3
          candidateId={detailCandidateId}
          candidateLookup={candidateLookup}
          inCompare={Boolean(detailCandidateId && state.compareIds.includes(detailCandidateId))}
          compareLimitReached={Boolean(
            detailCandidateId
            && !state.compareIds.includes(detailCandidateId)
            && state.compareIds.length >= 3
          )}
          onBack={() => navigate('candidates')}
          onToggleCompare={(candidateId) => {
            commitDecisionState(
              decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId }),
              'replace',
              false,
            );
          }}
        />
      ) : null}

      {state.step === 'compare' ? (
        <CompareV3
          compareOrder={state.compareOrder.length ? state.compareOrder : state.compareIds}
          candidateLookup={candidateLookup}
          axes={state.axes}
          onBack={() => navigate('candidates')}
          onReorder={(candidateId, direction) => {
            commitDecisionState(
              decisionV3Reducer(state, { type: 'REORDER_COMPARE', candidateId, direction }),
              'replace',
              false,
            );
          }}
          onSetOrder={(ids) => {
            commitDecisionState(
              decisionV3Reducer(state, { type: 'SET_COMPARE_ORDER', ids }),
              'replace',
              false,
            );
          }}
          onToggleAxis={(axis) => {
            commitDecisionState(
              decisionV3Reducer(state, { type: 'TOGGLE_AXIS', axis }),
              'replace',
              false,
            );
          }}
          onReorderAxis={(axis, direction) => {
            commitDecisionState(
              decisionV3Reducer(state, { type: 'REORDER_AXIS', axis, direction }),
              'replace',
              false,
            );
          }}
          onDecide={(candidateId) => {
            const chosenState = decisionV3Reducer(state, { type: 'CHOOSE', candidateId });
            if (chosenState.chosenId !== candidateId) return;
            runTransition(() => {
              const decidedState = decisionV3Reducer(chosenState, { type: 'GO', step: 'decided' });
              if (decidedState.step !== 'decided' || decidedState.chosenId !== candidateId) return;

              commitDecisionState(decidedState, 'push');
              deferDecisionV3Analytics(() => {
                trackAnalyticsEvent('store_decided', {
                  store_id: candidateId,
                  compare_count: state.compareIds.length,
                  party: chosenState.conditions.party,
                });
              });
            });
          }}
        />
      ) : null}

      {state.step === 'decided' ? (
        <DecidedV3
          candidateId={state.chosenId}
          candidateLookup={candidateLookup}
          onCompare={() => navigate('compare')}
          onDetail={(candidateId) => navigate('detail', candidateId)}
        />
      ) : null}

      <BottomNavV3
        step={state.step}
        activeHomeSection={activeHomeSection}
        compareReady={compareReady}
        previewWidth={qaWidth}
        onNavigate={(step) => {
          if (step === 'candidates' && !conditionsReady) return;
          if (step === 'compare' && !compareReady) return;
          navigate(step);
        }}
        onNavigateHomeSection={navigateHomeSection}
      />
    </main>
  );
}
