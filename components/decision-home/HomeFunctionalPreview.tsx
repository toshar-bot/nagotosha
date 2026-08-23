'use client';

import { LazyMotion, MotionConfig } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { logDecisionHomeEvent } from '@/lib/decision-home-analytics';
import {
  readDecisionHomeFocusSession,
  readDecisionHomeSession,
} from '@/lib/decision-home-session';
import { DECISION_V3_PARTY_LABELS } from '@/lib/decision-v3-party-handoff';
import type { HomeState } from '@/types/decision-home';
import type { PartyChoice } from '@/types/decision-v3';
import HomeHeader from './HomeHeader';
import HomeHero from './HomeHero';
import TrendingNagoyaSection from './TrendingNagoyaSection';
import styles from './home-functional.module.css';

const loadFeatures = () => import('./motion-features').then((module) => module.default);

const PARTY_OPTIONS: ReadonlyArray<{
  readonly id: PartyChoice;
  readonly label: string;
  readonly visualLines: readonly string[];
  readonly iconSrc: string;
}> = [
  {
    id: 'solo',
    label: DECISION_V3_PARTY_LABELS.solo,
    visualLines: [DECISION_V3_PARTY_LABELS.solo],
    iconSrc: '/decision/home-functional/party-display/party-solo-display.png',
  },
  {
    id: 'pair',
    label: DECISION_V3_PARTY_LABELS.pair,
    visualLines: [DECISION_V3_PARTY_LABELS.pair],
    iconSrc: '/decision/home-functional/party-display/party-pair-display.png',
  },
  {
    id: 'family',
    label: DECISION_V3_PARTY_LABELS.family,
    visualLines: [DECISION_V3_PARTY_LABELS.family],
    iconSrc: '/decision/home-functional/party-display/party-family-display.png',
  },
  {
    id: 'group',
    label: DECISION_V3_PARTY_LABELS.group,
    visualLines: ['友人・', 'グループ'],
    iconSrc: '/decision/home-functional/party-display/party-group-display.png',
  },
];

export default function HomeFunctionalPreview() {
  const [homeState, setHomeState] = useState<HomeState>({
    kind: 'first-visit',
    focusedCategoryId: 'food',
  });
  const [selectedParty, setSelectedParty] = useState<PartyChoice | null>(null);
  const [stateReady, setStateReady] = useState(false);
  const partySectionRef = useRef<HTMLElement | null>(null);
  const decisionStartPendingRef = useRef(false);

  useLayoutEffect(() => {
    document.body.dataset.decisionHomeFunctional = 'true';
    return () => {
      delete document.body.dataset.decisionHomeFunctional;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const storage = (() => {
      try {
        return window.sessionStorage;
      } catch {
        return undefined;
      }
    })();
    const restoredFocus = readDecisionHomeFocusSession(storage);
    const restored = readDecisionHomeSession(storage);
    if (restored) {
      setHomeState({
        kind: 'conditions-resumable',
        focusedCategoryId: restoredFocus?.focusedCategoryId ?? restored.selectedCategoryId,
        selectedCategoryId: restored.selectedCategoryId,
        conditionSummary: restored.conditionSummary,
      });
      logDecisionHomeEvent({ name: 'condition_resume_view' });
    } else if (restoredFocus) {
      setHomeState({
        kind: 'category-focused',
        focusedCategoryId: restoredFocus.focusedCategoryId,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      const params = new URLSearchParams(window.location.search);
      const demo = params.get('demo');
      if (demo === 'conditions-resumable') {
        void import('@/data/decision-home-topics.development').then((module) => {
          if (cancelled) return;
          setHomeState({
            kind: 'conditions-resumable',
            focusedCategoryId: 'food',
            selectedCategoryId: 'food',
            conditionSummary: module.DEVELOPMENT_CONDITION_SUMMARY,
          });
        });
      }
    }

    setStateReady(true);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!stateReady) return;
    logDecisionHomeEvent({ name: 'home_view', stateKind: homeState.kind });
  }, [homeState.kind, stateReady]);

  const openDecisionConditions = useCallback((party: PartyChoice) => {
    if (decisionStartPendingRef.current) return;
    decisionStartPendingRef.current = true;
    const params = new URLSearchParams({ party, from: 'home' });
    trackAnalyticsEvent('decision_start', { party, source: 'root_home' });
    window.location.assign(`/decision-functional-preview-v3?${params.toString()}`);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        <div className={styles.page} data-home-functional-preview data-state={homeState.kind}>
          <style jsx global>{`
            body[data-decision-home-functional='true'] > nav {
              display: none !important;
            }
          `}</style>
          <HomeHeader />
          <main>
            <HomeHero />
            <section
              ref={partySectionRef}
              className={styles.partySection}
              aria-labelledby="home-party-title"
            >
              <div className={styles.partyHeading}>
                <h2 id="home-party-title">誰と行く？</h2>
              </div>
              <p className={styles.partyIntro}>最初に近い条件を選びましょう</p>
              <div className={styles.partyGrid} role="group" aria-label="一緒に行く人">
                {PARTY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={styles.partyButton}
                    data-selected={selectedParty === option.id ? 'true' : 'false'}
                    aria-label={option.label}
                    aria-pressed={selectedParty === option.id}
                    onClick={() => setSelectedParty(option.id)}
                  >
                    <Image
                      className={styles.partyIcon}
                      src={option.iconSrc}
                      alt=""
                      aria-hidden="true"
                      width={512}
                      height={512}
                      sizes="72px"
                    />
                    <span className={styles.partyLabel} aria-hidden="true">
                      {option.visualLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                    <span className={styles.partyCheck} aria-hidden="true">✓</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.quickDecisionCta}
                disabled={!selectedParty}
                aria-disabled={!selectedParty}
                onClick={() => {
                  if (selectedParty) openDecisionConditions(selectedParty);
                }}
              >
                条件からすぐ決める
              </button>
            </section>

            <section className={styles.keywordSection} aria-labelledby="home-keyword-title">
              <div className={styles.keywordHeading}>
                <span aria-hidden="true" className={styles.headingBar} />
                <h2 id="home-keyword-title">キーワードから探す</h2>
                <span className={styles.preparingBadge}>準備中</span>
              </div>
              <label className={styles.visuallyHidden} htmlFor="home-keyword-preview">
                キーワード検索
              </label>
              <div className={styles.keywordPreview}>
                <span className={styles.keywordSearchIcon} aria-hidden="true" />
                <input
                  id="home-keyword-preview"
                  type="text"
                  placeholder="焼き鳥・食べ放題・個室など"
                  disabled
                />
              </div>
              <p>キーワード検索は準備中です</p>
            </section>

            <TrendingNagoyaSection />
          </main>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
