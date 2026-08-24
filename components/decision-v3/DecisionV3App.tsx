'use client';

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { BrandHeader } from '@/components/common/BrandHeader';
import { DEMO_CANDIDATES, isCandidateActionDisplayable } from '@/data/decision-v3-demo';
import { trackAnalyticsEvent } from '@/lib/analytics';
import {
  pushDecisionV3History,
  readDecisionV3HistoryState,
  replaceDecisionV3History,
} from '@/lib/decision-v3-history';
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
import { loadDecisionV3Session, saveDecisionV3Session } from '@/lib/decision-v3-session';
import type { DecisionV3Conditions, DecisionV3Step, RefineChoice } from '@/types/decision-v3';
import { BottomNavV3 } from './BottomNavV3';
import { CandidateListV3 } from './CandidateListV3';
import { CompareV3 } from './CompareV3';
import { ConditionPanelV3 } from './ConditionPanelV3';
import { DecidedV3 } from './DecidedV3';
import { DetailV3 } from './DetailV3';
import styles from './decision-v3.module.css';

type Props = {
  candidateSource?: DecisionV3CandidateSource;
};

export default function DecisionV3App({ candidateSource = 'demo' }: Props) {
  const [state, dispatch] = useReducer(decisionV3Reducer, undefined, createInitialDecisionV3State);
  const [hydrated, setHydrated] = useState(false);
  const [qaWidth, setQaWidth] = useState<number | null>(null);
  const [activeHomeSection, setActiveHomeSection] = useState<'home' | 'conditions'>('home');
  const conditionsRef = useRef<HTMLElement | null>(null);
  const transitionInFlightRef = useRef<DecisionV3Step | null>(null);

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
    const normalizedRestored = normalizeDecisionV3RestoredState(restored, candidateSource);

    if (hasDecisionV3PartyHandoffParameters(initialSearch)) {
      window.history.replaceState(
        window.history.state,
        '',
        removeDecisionV3PartyHandoffParameters(window.location.href),
      );
    }

    dispatch({ type: 'RESTORE', state: normalizedRestored });
    replaceDecisionV3History(normalizedRestored);
    setHydrated(true);

    if (partyHandoff) {
      setActiveHomeSection('conditions');
      window.requestAnimationFrame(() => {
        conditionsRef.current = document.getElementById('decision-v3-conditions');
        scrollDecisionV3ElementIntoView(conditionsRef.current, { block: 'start' });
      });
    }
  }, [candidateSource]);

  useEffect(() => {
    if (!hydrated) return;
    saveDecisionV3Session(state);
    replaceDecisionV3History(state);
  }, [hydrated, state]);

  useEffect(() => {
    transitionInFlightRef.current = null;
  }, [state.step]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const onPopState = (event: PopStateEvent) => {
      const restored = normalizeDecisionV3RestoredState(
        readDecisionV3HistoryState(event.state) ?? createInitialDecisionV3State(),
        candidateSource,
      );
      dispatch({ type: 'RESTORE', state: restored });
      setActiveHomeSection('home');
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [candidateSource]);

  const beginTransition = useCallback((step: DecisionV3Step) => {
    if (transitionInFlightRef.current === step) return false;
    transitionInFlightRef.current = step;
    return true;
  }, []);

  const navigate = useCallback((step: DecisionV3Step, detailId?: string | null) => {
    if (
      step === 'compare'
      && (state.step === 'candidates' || state.step === 'detail' || state.step === 'decided')
    ) {
      if (!beginTransition('compare')) return;
      trackAnalyticsEvent('compare_view', {
        compare_count: state.compareIds.length,
        source: state.step,
      });
    }

    const nextState = decisionV3Reducer(state, { type: 'GO', step, detailId });
    replaceDecisionV3History(state);
    dispatch({ type: 'RESTORE', state: nextState });
    pushDecisionV3History(nextState);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [beginTransition, state]);

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
    window.setTimeout(() => {
      conditionsRef.current = document.getElementById('decision-v3-conditions');
      scrollDecisionV3ElementIntoView(conditionsRef.current, { block: 'start' });
    }, state.step === 'home' ? 0 : 40);
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

    const candidate = DEMO_CANDIDATES.find((item) => item.id === candidateId);
    const href = anchor.getAttribute('href');
    const action = candidate?.actions.find(
      (item) => isCandidateActionDisplayable(item) && item.href === href,
    );
    if (!action) return;

    if (action.type === 'access') {
      trackAnalyticsEvent('map_click', { store_id: candidateId, surface });
    } else if (action.type === 'official') {
      trackAnalyticsEvent('official_click', { store_id: candidateId, surface });
    } else if (action.type === 'reservation' && action.href?.startsWith('tel:')) {
      trackAnalyticsEvent('phone_click', { store_id: candidateId, surface });
    }
  }, [state.chosenId, state.detailId, state.step]);

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
          onCondition={(group: keyof DecisionV3Conditions, value: string) =>
            dispatch({ type: 'SET_CONDITION', group, value })
          }
          onRefine={(value: RefineChoice) => dispatch({ type: 'TOGGLE_REFINE', value })}
          onSubmit={() => {
            if (!beginTransition('candidates')) return;
            const preparedState = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidateSource });
            const candidateState = decisionV3Reducer(preparedState, {
              type: 'GO',
              step: 'candidates',
            });
            const selectionResult = candidateState.selectionResult;
            if (hasAllRequiredConditions(candidateState.conditions) && selectionResult) {
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
            }
            replaceDecisionV3History(state);
            dispatch({ type: 'RESTORE', state: candidateState });
            pushDecisionV3History(candidateState);
            window.scrollTo({ top: 0, behavior: 'auto' });
          }}
        />
      ) : null}

      {state.step === 'candidates' && state.selectionResult ? (
        <CandidateListV3
          selectionResult={state.selectionResult}
          conditions={state.conditions}
          refine={state.refine}
          compareIds={state.compareIds}
          onToggleCompare={(candidateId) => dispatch({ type: 'TOGGLE_COMPARE', candidateId })}
          onDetail={(candidateId) => {
            if (!beginTransition('detail')) return;
            trackAnalyticsEvent('candidate_detail_view', {
              store_id: candidateId,
              source: 'candidates',
            });
            navigate('detail', candidateId);
          }}
          onCompare={() => navigate('compare')}
          onBack={() => navigate('home')}
          onHome={() => window.location.assign('/')}
        />
      ) : null}

      {state.step === 'detail' ? (
        <DetailV3
          candidateId={detailCandidateId}
          inCompare={Boolean(detailCandidateId && state.compareIds.includes(detailCandidateId))}
          compareLimitReached={Boolean(
            detailCandidateId
            && !state.compareIds.includes(detailCandidateId)
            && state.compareIds.length >= 3
          )}
          onBack={() => navigate('candidates')}
          onToggleCompare={(candidateId) => dispatch({ type: 'TOGGLE_COMPARE', candidateId })}
        />
      ) : null}

      {state.step === 'compare' ? (
        <CompareV3
          compareOrder={state.compareOrder.length ? state.compareOrder : state.compareIds}
          axes={state.axes}
          onBack={() => navigate('candidates')}
          onReorder={(candidateId, direction) =>
            dispatch({ type: 'REORDER_COMPARE', candidateId, direction })
          }
          onSetOrder={(ids) => dispatch({ type: 'SET_COMPARE_ORDER', ids })}
          onToggleAxis={(axis) => dispatch({ type: 'TOGGLE_AXIS', axis })}
          onReorderAxis={(axis, direction) => dispatch({ type: 'REORDER_AXIS', axis, direction })}
          onDecide={(candidateId) => {
            const chosenState = decisionV3Reducer(state, { type: 'CHOOSE', candidateId });
            if (chosenState.chosenId !== candidateId) return;
            if (!beginTransition('decided')) return;
            trackAnalyticsEvent('store_decided', {
              store_id: candidateId,
              compare_count: state.compareIds.length,
              party: chosenState.conditions.party,
            });
            const decidedState = decisionV3Reducer(chosenState, { type: 'GO', step: 'decided' });
            replaceDecisionV3History(state);
            dispatch({ type: 'RESTORE', state: decidedState });
            pushDecisionV3History(decidedState);
            window.scrollTo({ top: 0, behavior: 'auto' });
          }}
        />
      ) : null}

      {state.step === 'decided' ? (
        <DecidedV3
          candidateId={state.chosenId}
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
