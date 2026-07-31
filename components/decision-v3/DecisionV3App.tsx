'use client';

import { useCallback, useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { BrandHeader } from '@/components/common/BrandHeader';
import {
  pushDecisionV3History,
  readDecisionV3HistoryState,
  replaceDecisionV3History,
} from '@/lib/decision-v3-history';
import {
  scrollDecisionV3ElementIntoView,
  scrollDecisionV3WindowTo,
} from '@/lib/decision-v3-motion';
import {
  hasDecisionV3PartyHandoffParameters,
  readDecisionV3PartyHandoff,
  removeDecisionV3PartyHandoffParameters,
} from '@/lib/decision-v3-party-handoff';
import { decisionV3Reducer, hasAllRequiredConditions, createInitialDecisionV3State } from '@/lib/decision-v3-state';
import { loadDecisionV3Session, saveDecisionV3Session } from '@/lib/decision-v3-session';
import type { DecisionV3Conditions, DecisionV3Step, RefineChoice } from '@/types/decision-v3';
import { BottomNavV3 } from './BottomNavV3';
import { CandidateListV3 } from './CandidateListV3';
import { CompareV3 } from './CompareV3';
import { ConditionPanelV3 } from './ConditionPanelV3';
import { DecidedV3 } from './DecidedV3';
import { DetailV3 } from './DetailV3';
import { HeroV3 } from './HeroV3';
import styles from './decision-v3.module.css';

export default function DecisionV3App() {
  const [state, dispatch] = useReducer(decisionV3Reducer, undefined, createInitialDecisionV3State);
  const [hydrated, setHydrated] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  const [qaWidth, setQaWidth] = useState<number | null>(null);
  const [activeHomeSection, setActiveHomeSection] = useState<'home' | 'conditions'>('home');
  const conditionsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const initialSearch = window.location.search;
    const width = Number(new URLSearchParams(initialSearch).get('qaWidth'));
    if ([320, 360, 375, 390, 430].includes(width)) setQaWidth(width);
    const restoredState =
      readDecisionV3HistoryState(window.history.state)
      ?? loadDecisionV3Session();
    const partyHandoff = readDecisionV3PartyHandoff(initialSearch);
    const restored = partyHandoff
      ? decisionV3Reducer(restoredState, {
          type: 'SET_CONDITION',
          group: 'party',
          value: partyHandoff,
        })
      : restoredState;

    if (hasDecisionV3PartyHandoffParameters(initialSearch)) {
      window.history.replaceState(
        window.history.state,
        '',
        removeDecisionV3PartyHandoffParameters(window.location.href),
      );
    }

    dispatch({ type: 'RESTORE', state: restored });
    replaceDecisionV3History(restored);
    setHydrated(true);

    if (partyHandoff) {
      setActiveHomeSection('conditions');
      window.requestAnimationFrame(() => {
        conditionsRef.current = document.getElementById('decision-v3-conditions');
        scrollDecisionV3ElementIntoView(conditionsRef.current, { block: 'start' });
      });
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDecisionV3Session(state);
    replaceDecisionV3History(state);
  }, [hydrated, state]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const onPopState = (event: PopStateEvent) => {
      const restored = readDecisionV3HistoryState(event.state) ?? createInitialDecisionV3State();
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
  }, []);

  const navigate = useCallback((step: DecisionV3Step, detailId?: string | null) => {
    const nextState = decisionV3Reducer(state, { type: 'GO', step, detailId });
    replaceDecisionV3History(state);
    dispatch({ type: 'RESTORE', state: nextState });
    pushDecisionV3History(nextState);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [state]);

  const scrollToConditions = useCallback(() => {
    conditionsRef.current = document.getElementById('decision-v3-conditions');
    setActiveHomeSection('conditions');
    scrollDecisionV3ElementIntoView(conditionsRef.current, { block: 'start' });
  }, []);

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
    setActiveHomeSection(section);
    if (state.step !== 'home') {
      navigate('home');
    }
    window.setTimeout(() => {
      if (section === 'conditions') {
        conditionsRef.current = document.getElementById('decision-v3-conditions');
        scrollDecisionV3ElementIntoView(conditionsRef.current, { block: 'start' });
      } else {
        scrollDecisionV3WindowTo({ top: 0 });
      }
    }, state.step === 'home' ? 0 : 40);
  }, [navigate, state.step]);

  const conditionsReady = hasAllRequiredConditions(state.conditions);
  const candidatesReady = Boolean(state.selectionResult);
  const compareReady = state.compareIds.length > 0;
  const detailCandidateId =
    state.detailId
    ?? (state.selectionResult?.kind === 'matched' ? state.selectionResult.candidateIds[0] : null);

  return (
    <main
      className={styles.decisionV3Root}
      data-hydrated={hydrated ? 'true' : 'false'}
      style={qaWidth
        ? {
            width: qaWidth,
            maxWidth: '100%',
            marginInline: 'auto',
            '--decision-v3-width': `${qaWidth}px`,
          } as CSSProperties
        : undefined}
    >
      <BrandHeader priority />

      {state.step === 'home' ? (
        <>
          <HeroV3 onStart={scrollToConditions} />
          <ConditionPanelV3
            conditions={state.conditions}
            refine={state.refine}
            onCondition={(group: keyof DecisionV3Conditions, value: string) =>
              dispatch({ type: 'SET_CONDITION', group, value })
            }
            onRefine={(value: RefineChoice) => dispatch({ type: 'TOGGLE_REFINE', value })}
            onSubmit={() => {
              const preparedState = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES' });
              const candidateState = decisionV3Reducer(preparedState, {
                type: 'GO',
                step: 'candidates',
              });
              replaceDecisionV3History(state);
              dispatch({ type: 'RESTORE', state: candidateState });
              pushDecisionV3History(candidateState);
              window.scrollTo({ top: 0, behavior: 'auto' });
            }}
          />
        </>
      ) : null}

      {state.step === 'candidates' && state.selectionResult ? (
        <CandidateListV3
          selectionResult={state.selectionResult}
          compareIds={state.compareIds}
          onToggleCompare={(candidateId) => dispatch({ type: 'TOGGLE_COMPARE', candidateId })}
          onDetail={(candidateId) => navigate('detail', candidateId)}
          onCompare={() => navigate('compare')}
          onBack={() => navigate('home')}
        />
      ) : null}

      {state.step === 'detail' && detailCandidateId ? (
        <>
          <DetailV3
            candidateId={detailCandidateId}
            inCompare={state.compareIds.includes(detailCandidateId)}
            onBack={() => navigate('candidates')}
            onToggleCompare={(candidateId) => dispatch({ type: 'TOGGLE_COMPARE', candidateId })}
            onShare={() => {
              setShareNotice('共有機能はDEMOでは端末外へ送信しません。');
              window.setTimeout(() => setShareNotice(''), 2800);
            }}
          />
          {shareNotice ? <p className={styles.toast} role="status">{shareNotice}</p> : null}
        </>
      ) : null}

      {state.step === 'compare' ? (
        <CompareV3
          compareOrder={state.compareOrder.length ? state.compareOrder : state.compareIds}
          axes={state.axes}
          chosenId={state.chosenId}
          onBack={() => navigate('candidates')}
          onReorder={(candidateId, direction) =>
            dispatch({ type: 'REORDER_COMPARE', candidateId, direction })
          }
          onSetOrder={(ids) => dispatch({ type: 'SET_COMPARE_ORDER', ids })}
          onChoose={(candidateId) => dispatch({ type: 'CHOOSE', candidateId })}
          onToggleAxis={(axis) => dispatch({ type: 'TOGGLE_AXIS', axis })}
          onReorderAxis={(axis, direction) => dispatch({ type: 'REORDER_AXIS', axis, direction })}
          onDecide={() => navigate('decided')}
          onRestart={() => {
            const resetState = decisionV3Reducer(state, { type: 'RESET_SEARCH' });
            replaceDecisionV3History(state);
            dispatch({ type: 'RESTORE', state: resetState });
            pushDecisionV3History(resetState);
            window.scrollTo({ top: 0, behavior: 'auto' });
          }}
        />
      ) : null}

      {state.step === 'decided' && state.chosenId ? (
        <DecidedV3 candidateId={state.chosenId} onCandidates={() => navigate('candidates')} />
      ) : null}

      <BottomNavV3
        step={state.step}
        activeHomeSection={activeHomeSection}
        conditionsReady={conditionsReady && candidatesReady}
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
