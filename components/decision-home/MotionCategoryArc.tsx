'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { useMotionValue, useReducedMotion, type PanInfo } from 'motion/react';
import * as m from 'motion/react-m';
import {
  DECISION_HOME_CATEGORIES,
  getRelativeCategoryPosition,
  wrapCategoryIndex,
} from '@/data/decision-home-categories';
import type { CategoryId } from '@/types/decision-home';
import CategoryCard from './CategoryCard';
import styles from './home-functional.module.css';

type FocusMethod = 'tap' | 'swipe' | 'keyboard';
type InteractionPhase = 'idle' | 'dragging' | 'settling';

export type MotionCategoryArcHandle = {
  requestCategory: (categoryId: CategoryId, method?: FocusMethod) => boolean;
};

type MotionCategoryArcProps = {
  readonly focusedCategoryId: CategoryId;
  readonly selectedCategoryId?: CategoryId;
  readonly onFocusCategory: (categoryId: CategoryId, method: FocusMethod) => void;
  readonly onFocusCategorySettled: (categoryId: CategoryId) => void;
  readonly onSelectCategory: (categoryId: CategoryId, method: 'card') => void;
  readonly onFirstMove: () => void;
};

const CLICK_SUPPRESSION_MS = 380;
const SETTLE_LOCK_MS = 360;
const DRAG_DISTANCE_THRESHOLD = 42;
const DRAG_VELOCITY_THRESHOLD = 600;
const GHOST_CLICK_DISTANCE = 8;
const SAFARI_BACK_GESTURE_EDGE = 20;

function shortestDelta(activeIndex: number, targetIndex: number): number {
  const length = DECISION_HOME_CATEGORIES.length;
  const direct = targetIndex - activeIndex;
  if (Math.abs(direct) <= length / 2) return direct;
  return direct > 0 ? direct - length : direct + length;
}

const MotionCategoryArc = forwardRef<MotionCategoryArcHandle, MotionCategoryArcProps>(
  function MotionCategoryArc(
    {
      focusedCategoryId,
      selectedCategoryId,
      onFocusCategory,
      onFocusCategorySettled,
      onSelectCategory,
      onFirstMove,
    },
    ref,
  ) {
    const [phase, setPhase] = useState<InteractionPhase>('idle');
    const phaseRef = useRef<InteractionPhase>('idle');
    const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resetFrameRef = useRef<number | null>(null);
    const suppressClickUntilRef = useRef(0);
    const safariEdgeGestureRef = useRef(false);
    const verticalGestureRef = useRef(false);
    const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
    const dragX = useMotionValue(0);
    const reducedMotion = useReducedMotion();
    const activeIndex = DECISION_HOME_CATEGORIES.findIndex(({ id }) => id === focusedCategoryId);

    const updatePhase = useCallback((nextPhase: InteractionPhase) => {
      phaseRef.current = nextPhase;
      setPhase(nextPhase);
    }, []);

    const releaseSettleLock = useCallback((categoryId: CategoryId) => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        updatePhase('idle');
        onFocusCategorySettled(categoryId);
      }, reducedMotion ? 0 : SETTLE_LOCK_MS);
    }, [onFocusCategorySettled, reducedMotion, updatePhase]);

    useEffect(
      () => () => {
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        if (resetFrameRef.current !== null) cancelAnimationFrame(resetFrameRef.current);
        dragX.stop();
      },
      [dragX],
    );

    const returnDragToOrigin = useCallback(() => {
      dragX.stop();
      if (resetFrameRef.current !== null) cancelAnimationFrame(resetFrameRef.current);

      const origin = dragX.get();
      if (reducedMotion || Math.abs(origin) < 0.5) {
        dragX.set(0);
        resetFrameRef.current = null;
        if (phaseRef.current === 'dragging') updatePhase('idle');
        return;
      }

      const startedAt = performance.now();
      const durationMs = 200;
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / durationMs, 1);
        const eased = 1 - (1 - progress) ** 3;
        dragX.set(origin * (1 - eased));
        if (progress < 1) {
          resetFrameRef.current = requestAnimationFrame(tick);
          return;
        }
        resetFrameRef.current = null;
        dragX.set(0);
        if (phaseRef.current === 'dragging') updatePhase('idle');
      };
      resetFrameRef.current = requestAnimationFrame(tick);
    }, [dragX, reducedMotion, updatePhase]);

    const requestMove = useCallback(
      (delta: number, method: FocusMethod): boolean => {
        if (delta === 0 || phaseRef.current === 'settling') return false;
        if (phaseRef.current === 'dragging' && method !== 'swipe') return false;

        updatePhase('settling');
        if (resetFrameRef.current !== null) {
          cancelAnimationFrame(resetFrameRef.current);
          resetFrameRef.current = null;
        }
        dragX.stop();
        dragX.set(0);
        const nextIndex = wrapCategoryIndex(activeIndex + delta);
        const nextCategoryId = DECISION_HOME_CATEGORIES[nextIndex].id;
        onFocusCategory(nextCategoryId, method);
        onFirstMove();
        releaseSettleLock(nextCategoryId);
        return true;
      },
      [activeIndex, dragX, onFirstMove, onFocusCategory, releaseSettleLock, updatePhase],
    );

    const requestCategory = useCallback(
      (categoryId: CategoryId, method: FocusMethod = 'tap') => {
        const targetIndex = DECISION_HOME_CATEGORIES.findIndex(({ id }) => id === categoryId);
        if (targetIndex < 0) return false;
        return requestMove(shortestDelta(activeIndex, targetIndex), method);
      },
      [activeIndex, requestMove],
    );

    useImperativeHandle(ref, () => ({ requestCategory }), [requestCategory]);

    const activateCategory = (categoryId: CategoryId, itemIndex: number) => {
      if (Date.now() < suppressClickUntilRef.current || phaseRef.current !== 'idle') return;
      if (itemIndex !== activeIndex) {
        requestMove(shortestDelta(activeIndex, itemIndex), 'tap');
        return;
      }
      onSelectCategory(categoryId, 'card');
    };

    const resetPointerTracking = () => {
      pointerStartRef.current = null;
      safariEdgeGestureRef.current = false;
      verticalGestureRef.current = false;
    };

    const handlePointerDownCapture = (event: PointerEvent<HTMLDivElement>) => {
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      safariEdgeGestureRef.current = event.clientX <= SAFARI_BACK_GESTURE_EDGE;
      verticalGestureRef.current = false;
    };

    const handlePointerMoveCapture = (event: PointerEvent<HTMLDivElement>) => {
      const start = pointerStartRef.current;
      if (!start || safariEdgeGestureRef.current) return;
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      if (Math.abs(deltaY) > GHOST_CLICK_DISTANCE && Math.abs(deltaY) > Math.abs(deltaX)) {
        verticalGestureRef.current = true;
        dragX.stop();
        dragX.set(0);
      }
    };

    const handleDragStart = () => {
      if (phaseRef.current !== 'idle' || safariEdgeGestureRef.current) return;
      updatePhase('dragging');
    };

    const handleDrag = (_event: MouseEvent | TouchEvent | globalThis.PointerEvent, info: PanInfo) => {
      if (verticalGestureRef.current || safariEdgeGestureRef.current) {
        dragX.set(0);
        return;
      }
      if (Math.abs(info.offset.x) >= GHOST_CLICK_DISTANCE) {
        suppressClickUntilRef.current = Date.now() + CLICK_SUPPRESSION_MS;
      }
    };

    const handleDragEnd = (_event: MouseEvent | TouchEvent | globalThis.PointerEvent, info: PanInfo) => {
      const cancelled = safariEdgeGestureRef.current || verticalGestureRef.current;
      resetPointerTracking();

      if (cancelled) {
        returnDragToOrigin();
        return;
      }

      const moved = Math.abs(info.offset.x) >= GHOST_CLICK_DISTANCE || Math.abs(info.velocity.x) >= 120;
      if (moved) suppressClickUntilRef.current = Date.now() + CLICK_SUPPRESSION_MS;

      if (info.offset.x <= -DRAG_DISTANCE_THRESHOLD || info.velocity.x <= -DRAG_VELOCITY_THRESHOLD) {
        requestMove(1, 'swipe');
      } else if (
        info.offset.x >= DRAG_DISTANCE_THRESHOLD ||
        info.velocity.x >= DRAG_VELOCITY_THRESHOLD
      ) {
        requestMove(-1, 'swipe');
      } else {
        returnDragToOrigin();
      }
    };

    const handlePointerCancel = () => {
      if (Math.abs(dragX.get()) >= GHOST_CLICK_DISTANCE) {
        suppressClickUntilRef.current = Date.now() + CLICK_SUPPRESSION_MS;
      }
      resetPointerTracking();
      returnDragToOrigin();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        requestMove(-1, 'keyboard');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        requestMove(1, 'keyboard');
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (phaseRef.current === 'idle') onSelectCategory(focusedCategoryId, 'card');
      }
    };

    return (
      <div className={styles.categoryViewport} data-interaction-phase={phase}>
        <m.div
          className={styles.categoryArc}
          role="listbox"
          aria-label="楽しみ方を選ぶ"
          aria-activedescendant={`decision-home-category-${focusedCategoryId}`}
          tabIndex={0}
          style={{ x: dragX }}
          drag={phase === 'settling' ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.04}
          dragMomentum={false}
          dragSnapToOrigin={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onPointerDownCapture={handlePointerDownCapture}
          onPointerMoveCapture={handlePointerMoveCapture}
          onPointerCancel={handlePointerCancel}
          onKeyDown={handleKeyDown}
        >
          {DECISION_HOME_CATEGORIES.map((category, itemIndex) => {
            const relativePosition = getRelativeCategoryPosition(
              itemIndex,
              activeIndex,
              DECISION_HOME_CATEGORIES.length,
            );
            return (
              <CategoryCard
                key={category.id}
                category={category}
                relativePosition={relativePosition}
                selected={
                  (selectedCategoryId ?? focusedCategoryId) === category.id && relativePosition === 0
                }
                onActivate={() => activateCategory(category.id, itemIndex)}
              />
            );
          })}
        </m.div>
        <p className={styles.categoryLive} aria-live="polite">
          {DECISION_HOME_CATEGORIES[activeIndex].label}
          {DECISION_HOME_CATEGORIES[activeIndex].availability === 'coming-soon'
            ? 'は準備中です'
            : 'を選択中です'}
        </p>
      </div>
    );
  },
);

export default MotionCategoryArc;
