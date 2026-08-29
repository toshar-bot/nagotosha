'use client';

import { pushDecisionV3History, replaceDecisionV3History } from '@/lib/decision-v3-history';
import { saveDecisionV3Session } from '@/lib/decision-v3-session';
import type { DecisionV3Session } from '@/types/decision-v3';

export type DecisionV3HistoryWriteMode = 'none' | 'replace' | 'push';

export interface DecisionV3SideEffectResult {
  historyWritten: boolean;
  sessionSaved: boolean;
}

export function persistDecisionV3State(
  state: DecisionV3Session,
  options: {
    history: DecisionV3HistoryWriteMode;
    scroll?: boolean;
  },
): DecisionV3SideEffectResult {
  let sessionSaved = false;

  try {
    saveDecisionV3Session(state);
    sessionSaved = true;
  } catch {
    sessionSaved = false;
  }

  let historyWritten = false;
  if (options.history === 'replace') {
    historyWritten = replaceDecisionV3History(state);
  } else if (options.history === 'push') {
    historyWritten = pushDecisionV3History(state);
  }

  if (options.scroll && typeof window !== 'undefined') {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {
      // Decorative scrolling must not affect the committed decision state.
    }
  }

  return { historyWritten, sessionSaved };
}

export function deferDecisionV3Analytics(callback: () => void): void {
  const runSafely = () => {
    try {
      callback();
    } catch {
      // Analytics is observational and must never affect application state.
    }
  };

  if (typeof window === 'undefined') {
    runSafely();
    return;
  }

  try {
    window.setTimeout(runSafely, 0);
  } catch {
    runSafely();
  }
}

export interface DecisionV3TransitionGuard {
  isInFlight(): boolean;
  run<T>(operation: () => T): T | undefined;
}

export function createDecisionV3TransitionGuard(): DecisionV3TransitionGuard {
  let inFlight = false;

  return {
    isInFlight: () => inFlight,
    run: <T>(operation: () => T): T | undefined => {
      if (inFlight) return undefined;

      inFlight = true;
      try {
        return operation();
      } finally {
        inFlight = false;
      }
    },
  };
}
