'use client';

import { LazyMotion, MotionConfig } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DECISION_HOME_CATEGORIES,
  getDecisionHomeCategory,
} from '@/data/decision-home-categories';
import { logDecisionHomeEvent } from '@/lib/decision-home-analytics';
import { readDecisionHomeSession } from '@/lib/decision-home-session';
import type { CategoryId, HomeState, TopicCard } from '@/types/decision-home';
import CategoryPrimaryCta from './CategoryPrimaryCta';
import ComingSoonSheet from './ComingSoonSheet';
import ConditionResumePanel from './ConditionResumePanel';
import HomeBottomNav from './HomeBottomNav';
import HomeHeader from './HomeHeader';
import HomeHero from './HomeHero';
import MotionCategoryArc, { type MotionCategoryArcHandle } from './MotionCategoryArc';
import TrendingNagoyaSection from './TrendingNagoyaSection';
import styles from './home-functional.module.css';

const loadFeatures = () => import('./motion-features').then((module) => module.default);

type SheetState = {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
};

export default function HomeFunctionalPreview() {
  const [homeState, setHomeState] = useState<HomeState>({
    kind: 'first-visit',
    focusedCategoryId: 'food',
  });
  const [topics, setTopics] = useState<readonly TopicCard[]>([]);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [demoConditions, setDemoConditions] = useState(false);
  const [stateReady, setStateReady] = useState(false);
  const [hasMovedCategory, setHasMovedCategory] = useState(false);
  const categoryArcRef = useRef<MotionCategoryArcHandle>(null);

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
    const restored = readDecisionHomeSession(storage);
    if (restored) {
      setHomeState({
        kind: 'conditions-resumable',
        focusedCategoryId: restored.selectedCategoryId,
        selectedCategoryId: restored.selectedCategoryId,
        conditionSummary: restored.conditionSummary,
      });
      logDecisionHomeEvent({ name: 'condition_resume_view' });
    }

    if (process.env.NODE_ENV === 'development') {
      const params = new URLSearchParams(window.location.search);
      const demo = params.get('demo');
      if (demo === 'conditions-resumable' || demo === 'topics') {
        void import('@/data/decision-home-topics.development').then((module) => {
          if (cancelled) return;
          if (demo === 'conditions-resumable') {
            setDemoConditions(true);
            setHomeState({
              kind: 'conditions-resumable',
              focusedCategoryId: 'food',
              selectedCategoryId: 'food',
              conditionSummary: module.DEVELOPMENT_CONDITION_SUMMARY,
            });
          } else {
            setTopics(module.DEVELOPMENT_TOPIC_FIXTURES);
          }
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

  useEffect(() => {
    for (const topic of topics) {
      logDecisionHomeEvent({ name: 'topic_impression', topicId: topic.id, kind: topic.kind });
    }
  }, [topics]);

  const focusedCategory = useMemo(
    () => getDecisionHomeCategory(homeState.focusedCategoryId),
    [homeState.focusedCategoryId],
  );

  const focusCategory = useCallback(
    (categoryId: CategoryId, method: 'tap' | 'swipe' | 'keyboard') => {
      setHomeState((current) => {
        if (current.kind === 'conditions-resumable') {
          return { ...current, focusedCategoryId: categoryId };
        }
        return {
          kind: 'category-focused',
          focusedCategoryId: categoryId,
          selectedCategoryId: current.kind === 'category-focused' ? current.selectedCategoryId : undefined,
        };
      });
      logDecisionHomeEvent({ name: 'category_focus', categoryId, method });
    },
    [],
  );

  const openDecisionConditions = useCallback(() => {
    window.location.assign('/home-decision-preview#decision');
  }, []);

  const returnToFood = useCallback(() => {
    categoryArcRef.current?.requestCategory('food', 'tap');
  }, []);

  const selectCategory = useCallback(
    (categoryId: CategoryId, method: 'card' | 'cta') => {
      const category = getDecisionHomeCategory(categoryId);
      if (category.availability === 'coming-soon') {
        logDecisionHomeEvent({ name: 'category_coming_soon', categoryId });
        setSheet({
          title: `${category.label}は準備中です`,
          description: '確認できた候補がそろうまで、食事の条件入力をお試しいただけます。',
          actionLabel: '食事へ戻す',
          onAction: () => {
            setSheet(null);
            returnToFood();
          },
        });
        return;
      }

      setHomeState({
        kind: 'category-focused',
        focusedCategoryId: categoryId,
        selectedCategoryId: categoryId,
      });
      logDecisionHomeEvent({ name: 'category_select', categoryId, method });
      openDecisionConditions();
    },
    [openDecisionConditions, returnToFood],
  );

  const openConditions = useCallback(() => {
    openDecisionConditions();
  }, [openDecisionConditions]);

  const openComingSoonFeature = useCallback((feature: string) => {
    setSheet({
      title: `${feature}は準備中です`,
      description: '実データと安全確認がそろってから公開します。',
    });
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
            <section className={styles.categorySection} aria-labelledby="home-category-title">
              <div className={styles.categoryHeading}>
                <p className={styles.categoryKicker}>まずは</p>
                <h2 id="home-category-title">楽しみ方を選ぶ</h2>
              </div>
              <p className={styles.categoryInstruction} aria-live="polite">
                {hasMovedCategory ? '中央をもう一度タップで決定' : '気になるものを真ん中へ'}
              </p>
              <MotionCategoryArc
                ref={categoryArcRef}
                focusedCategoryId={homeState.focusedCategoryId}
                selectedCategoryId={
                  homeState.kind === 'category-focused' || homeState.kind === 'conditions-resumable'
                    ? homeState.selectedCategoryId
                    : undefined
                }
                onFocusCategory={focusCategory}
                onSelectCategory={(categoryId) => selectCategory(categoryId, 'card')}
                onFirstMove={() => setHasMovedCategory(true)}
              />
              <div className={styles.categoryDots} aria-hidden="true">
                {DECISION_HOME_CATEGORIES.map((category) => (
                  <span key={category.id} data-active={category.id === homeState.focusedCategoryId ? 'true' : 'false'} />
                ))}
              </div>
              <CategoryPrimaryCta
                category={focusedCategory}
                onSelect={() => selectCategory(focusedCategory.id, 'cta')}
                onReturnToFood={returnToFood}
              />
            </section>

            {homeState.kind === 'conditions-resumable' ? (
              <ConditionResumePanel
                conditionSummary={homeState.conditionSummary}
                demo={demoConditions}
                onEdit={() => {
                  logDecisionHomeEvent({ name: 'condition_resume_edit' });
                  openDecisionConditions();
                }}
                onContinue={() => {
                  logDecisionHomeEvent({ name: 'condition_resume_continue' });
                  openDecisionConditions();
                }}
              />
            ) : null}

            <TrendingNagoyaSection
              topics={topics}
              onTopicClick={(topic) => {
                logDecisionHomeEvent({ name: 'topic_click', topicId: topic.id, kind: topic.kind });
              }}
            />
          </main>
          <HomeBottomNav
            onConditions={openConditions}
            onDiscover={() => openComingSoonFeature('発見')}
            onSaved={() => openComingSoonFeature('保存')}
          />
          {sheet ? (
            <ComingSoonSheet
              title={sheet.title}
              description={sheet.description}
              actionLabel={sheet.actionLabel}
              onAction={sheet.onAction}
              onClose={() => setSheet(null)}
            />
          ) : null}
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
