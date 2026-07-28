'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_COMPARE_AXES, COMPARE_AXIS_LABELS, DEMO_CANDIDATES } from '@/data/decision-v3-demo';
import {
  getDecisionV3PointerIntent,
  reorderDecisionV3Ids,
} from '@/lib/decision-v3-pointer-reorder';
import type { CompareAxis } from '@/types/decision-v3';
import { CandidatePhotoV3 } from './CandidatePhotoV3';
import styles from './decision-v3.module.css';

const compareLabel = (index: number) => `候補${String.fromCharCode(65 + index)}`;
const DIALOG_FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
const INTERACTIVE_POINTER_TARGET = 'button, a, input, select, textarea';

type PointerReorderSession = {
  pointerId: number;
  candidateId: string;
  startX: number;
  startY: number;
  engaged: boolean;
};

type Props = {
  compareOrder: string[];
  axes: CompareAxis[];
  chosenId: string | null;
  onBack: () => void;
  onReorder: (candidateId: string, direction: -1 | 1) => void;
  onSetOrder: (ids: string[]) => void;
  onChoose: (candidateId: string) => void;
  onToggleAxis: (axis: CompareAxis) => void;
  onReorderAxis: (axis: CompareAxis, direction: -1 | 1) => void;
  onDecide: () => void;
  onRestart: () => void;
};

function axisValue(candidateId: string, axis: CompareAxis) {
  const candidate = DEMO_CANDIDATES.find((item) => item.id === candidateId);
  if (!candidate) return '—';
  const values: Record<CompareAxis, string> = {
    budget: candidate.budget,
    area: candidate.area,
    access: candidate.facts.access,
    atmosphere: candidate.facts.atmosphere,
    smoking: candidate.facts.smoking,
    seats: candidate.facts.seats,
    'private-room': candidate.facts.privateRoom,
    tatami: candidate.facts.tatami,
    solo: candidate.facts.solo,
    kids: candidate.facts.kids,
    reservation: candidate.facts.reservation,
    'long-stay': candidate.facts.longStay,
    wifi: 'DEMOでは未確認',
    power: 'DEMOでは未確認',
    'rain-safe': candidate.tags.includes('雨でも安心') ? '雨でも安心' : 'DEMOでは未確認',
    parking: 'DEMOでは未確認',
    terrace: 'DEMOでは未確認',
    'late-night': 'DEMOでは未確認',
    quiet: candidate.facts.atmosphere,
  };
  return values[axis];
}

export function CompareV3({
  compareOrder,
  axes,
  chosenId,
  onBack,
  onReorder,
  onSetOrder,
  onChoose,
  onToggleAxis,
  onReorderAxis,
  onDecide,
  onRestart,
}: Props) {
  const [activeAxis, setActiveAxis] = useState<CompareAxis>(axes[0] ?? 'budget');
  const [editorOpen, setEditorOpen] = useState(false);
  const [axisLimit, setAxisLimit] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [pointerDraggedId, setPointerDraggedId] = useState<string | null>(null);
  const [grabbedId, setGrabbedId] = useState<string | null>(null);
  const pointerSessionRef = useRef<PointerReorderSession | null>(null);
  const compareContentRef = useRef<HTMLDivElement | null>(null);
  const editorDialogRef = useRef<HTMLElement | null>(null);
  const editorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const editorCloseRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const candidates = useMemo(
    () =>
      compareOrder
        .map((id) => DEMO_CANDIDATES.find((item) => item.id === id))
        .filter((candidate): candidate is (typeof DEMO_CANDIDATES)[number] => Boolean(candidate)),
    [compareOrder],
  );

  useEffect(() => {
    if (!editorOpen) return;

    const background = compareContentRef.current;
    const bottomNav = document.querySelector<HTMLElement>('nav[aria-label="意思決定フロー"]');
    const previousBodyOverflow = document.body.style.overflow;
    const previousBackgroundAriaHidden = background?.getAttribute('aria-hidden');
    const previousNavAriaHidden = bottomNav?.getAttribute('aria-hidden');
    const inertBackground = background as (HTMLDivElement & { inert: boolean }) | null;
    const inertBottomNav = bottomNav as (HTMLElement & { inert: boolean }) | null;

    if (inertBackground) inertBackground.inert = true;
    if (inertBottomNav) inertBottomNav.inert = true;
    background?.setAttribute('aria-hidden', 'true');
    bottomNav?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden';

    const focusFrame = window.requestAnimationFrame(() => editorCloseRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      if (inertBackground) inertBackground.inert = false;
      if (inertBottomNav) inertBottomNav.inert = false;
      if (background) {
        if (previousBackgroundAriaHidden == null) background.removeAttribute('aria-hidden');
        else background.setAttribute('aria-hidden', previousBackgroundAriaHidden);
      }
      if (bottomNav) {
        if (previousNavAriaHidden == null) bottomNav.removeAttribute('aria-hidden');
        else bottomNav.setAttribute('aria-hidden', previousNavAriaHidden);
      }
      document.body.style.overflow = previousBodyOverflow;
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [editorOpen]);

  const openEditor = () => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : editorTriggerRef.current;
    setEditorOpen(true);
  };

  const closeEditor = () => setEditorOpen(false);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeEditor();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      editorDialogRef.current?.querySelectorAll<HTMLElement>(DIALOG_FOCUSABLE_SELECTOR) ?? [],
    ).filter((element) => !element.hasAttribute('disabled') && element.getClientRects().length > 0);
    if (focusable.length === 0) {
      event.preventDefault();
      editorDialogRef.current?.focus();
      return;
    }

    const first = focusable.at(0);
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const clearPointerSession = (element?: HTMLElement, pointerId?: number) => {
    if (
      element
      && pointerId !== undefined
      && element.hasPointerCapture(pointerId)
    ) {
      element.releasePointerCapture(pointerId);
    }
    pointerSessionRef.current = null;
    setPointerDraggedId(null);
  };

  const nearestPointerTargetId = (clientX: number) => {
    const columns = Array.from(
      document.querySelectorAll<HTMLElement>('[data-compare-candidate-id]'),
    );
    let targetId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const column of columns) {
      const rect = column.getBoundingClientRect();
      const distance = Math.abs(clientX - (rect.left + rect.width / 2));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        targetId = column.dataset.compareCandidateId ?? null;
      }
    }
    return targetId;
  };

  return (
    <section className={`${styles.screenStage} ${styles.compareScreenStage}`} aria-labelledby="compare-title">
      <div ref={compareContentRef}>
      <header className={styles.compareHeader}>
        <button type="button" className={styles.iconButton} onClick={onBack} aria-label="候補へ戻る">←</button>
        <div>
          <h1 id="compare-title">比較して選ぶ</h1>
          <p>矢印・ドラッグ・キーボードで並び替えできます</p>
        </div>
        <button
          ref={editorTriggerRef}
          type="button"
          className={styles.textButton}
          onClick={openEditor}
        >
          項目編集
        </button>
      </header>

      <div className={styles.axisTabs} aria-label="比較項目">
        {axes.map((axis) => (
          <button
            key={axis}
            type="button"
            aria-pressed={activeAxis === axis}
            className={activeAxis === axis ? styles.axisActive : ''}
            onClick={() => setActiveAxis(axis)}
          >
            {COMPARE_AXIS_LABELS[axis]}
          </button>
        ))}
      </div>

      <div className={styles.compareColumns}>
        {candidates.map((candidate, index) => {
          const displayLabel = compareLabel(index);
          return (
          <article
            key={candidate.id}
            className={`${styles.compareColumn} ${
              chosenId === candidate.id ? styles.compareChosen : ''
            } ${
              pointerDraggedId === candidate.id ? styles.compareColumnPointerDragging : ''
            }`}
            data-compare-candidate-id={candidate.id}
            data-pointer-reordering={pointerDraggedId === candidate.id ? 'true' : 'false'}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', candidate.id);
              setDraggedId(candidate.id);
            }}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!draggedId || draggedId === candidate.id) return;
              onSetOrder(reorderDecisionV3Ids(compareOrder, draggedId, candidate.id));
              setDraggedId(null);
            }}
            onPointerDown={(event) => {
              if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
              if (
                event.target instanceof Element
                && event.target.closest(INTERACTIVE_POINTER_TARGET)
              ) {
                return;
              }
              pointerSessionRef.current = {
                pointerId: event.pointerId,
                candidateId: candidate.id,
                startX: event.clientX,
                startY: event.clientY,
                engaged: false,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const session = pointerSessionRef.current;
              if (!session || session.pointerId !== event.pointerId) return;
              const intent = getDecisionV3PointerIntent(
                event.clientX - session.startX,
                event.clientY - session.startY,
              );
              if (intent === 'vertical' && !session.engaged) {
                clearPointerSession(event.currentTarget, event.pointerId);
                return;
              }
              if (intent === 'horizontal') {
                session.engaged = true;
                setPointerDraggedId(session.candidateId);
                event.preventDefault();
              }
            }}
            onPointerUp={(event) => {
              const session = pointerSessionRef.current;
              if (!session || session.pointerId !== event.pointerId) return;
              const intent = getDecisionV3PointerIntent(
                event.clientX - session.startX,
                event.clientY - session.startY,
              );
              if (session.engaged || intent === 'horizontal') {
                const targetId = nearestPointerTargetId(event.clientX);
                if (targetId) {
                  onSetOrder(
                    reorderDecisionV3Ids(
                      compareOrder,
                      session.candidateId,
                      targetId,
                    ),
                  );
                }
              }
              clearPointerSession(event.currentTarget, event.pointerId);
            }}
            onPointerCancel={(event) => {
              const session = pointerSessionRef.current;
              if (session?.pointerId === event.pointerId) {
                clearPointerSession(event.currentTarget, event.pointerId);
              }
            }}
            tabIndex={0}
            aria-grabbed={grabbedId === candidate.id}
            onKeyDown={(event) => {
              if (event.key === ' ') {
                event.preventDefault();
                setGrabbedId((current) => (current === candidate.id ? null : candidate.id));
              }
              if (grabbedId === candidate.id && event.key === 'ArrowLeft') {
                event.preventDefault();
                onReorder(candidate.id, -1);
              }
              if (grabbedId === candidate.id && event.key === 'ArrowRight') {
                event.preventDefault();
                onReorder(candidate.id, 1);
              }
            }}
          >
            <span className={styles.candidateLabel}>{displayLabel}</span>
            <CandidatePhotoV3 candidate={candidate} ratio="thumb" />
            <h2>{candidate.name}</h2>
            <div className={styles.reorderControls} aria-label={`${candidate.name}を並び替え`}>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onReorder(candidate.id, -1)}
                aria-label="左へ移動"
              >
                ←
              </button>
              <span aria-hidden="true">⠿</span>
              <button
                type="button"
                disabled={index === candidates.length - 1}
                onClick={() => onReorder(candidate.id, 1)}
                aria-label="右へ移動"
              >
                →
              </button>
            </div>
          </article>
          );
        })}
      </div>

      <section className={styles.compareFocus} aria-live="polite">
        <h2>いま比較中：{COMPARE_AXIS_LABELS[activeAxis]}</h2>
        <div>
          {candidates.map((candidate, index) => (
            <article key={candidate.id}>
              <span>{compareLabel(index)}</span>
              <strong>{axisValue(candidate.id, activeAxis)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.chooseSection} aria-labelledby="choose-title">
        <h2 id="choose-title">どのお店にしますか？</h2>
        <div>
          {candidates.map((candidate, index) => (
            <button
              type="button"
              key={candidate.id}
              aria-pressed={chosenId === candidate.id}
              className={chosenId === candidate.id ? styles.chooseActive : ''}
              onClick={() => onChoose(candidate.id)}
            >
              <span>{compareLabel(index)}</span>
              {candidate.name}
              {chosenId === candidate.id ? <b aria-hidden="true">✓</b> : null}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.compareFlowActions}>
        <button type="button" className={styles.secondaryButton} onClick={onRestart}>
          条件を変えて再検索
        </button>
      </div>

      {!editorOpen ? (
        <div className={styles.compareStickyAction}>
          {!chosenId ? (
            <p className={styles.compareCtaHelper}>候補を1つ選ぶと決定できます</p>
          ) : null}
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!chosenId}
            aria-disabled={!chosenId}
            onClick={onDecide}
          >
            選んだお店に決める
          </button>
        </div>
      ) : null}
      </div>

      {editorOpen ? (
        <div
          className={styles.sheetBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <section
            ref={editorDialogRef}
            className={styles.axisSheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="axis-editor-title"
            aria-describedby="axis-editor-description"
            tabIndex={-1}
            onKeyDown={handleDialogKeyDown}
          >
            <span className={styles.sheetHandle} aria-hidden="true" />
            <div className={styles.sheetHeader}>
              <h2 id="axis-editor-title">比較項目を編集</h2>
              <button
                ref={editorCloseRef}
                type="button"
                className={styles.sheetCloseButton}
                onClick={closeEditor}
                aria-label="比較項目編集を閉じる"
              >
                ×
              </button>
            </div>
            <p id="axis-editor-description">5件まで選べます。矢印で表示順も変えられます。</p>
            <div className={styles.axisEditorList}>
              {ALL_COMPARE_AXES.map((axis) => {
                const selected = axes.includes(axis);
                return (
                  <div key={axis}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        if (!selected && axes.length >= 5) {
                          setAxisLimit(true);
                          return;
                        }
                        setAxisLimit(false);
                        onToggleAxis(axis);
                        if (activeAxis === axis && selected) {
                          setActiveAxis(axes.find((item) => item !== axis) ?? 'budget');
                        }
                      }}
                    >
                      {selected ? '✓ ' : ''}{COMPARE_AXIS_LABELS[axis]}
                    </button>
                    {selected ? (
                      <span>
                        <button
                          type="button"
                          onClick={() => onReorderAxis(axis, -1)}
                          disabled={axes.indexOf(axis) === 0}
                          aria-label={`${COMPARE_AXIS_LABELS[axis]}を前へ`}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => onReorderAxis(axis, 1)}
                          disabled={axes.indexOf(axis) === axes.length - 1}
                          aria-label={`${COMPARE_AXIS_LABELS[axis]}を後ろへ`}
                        >
                          →
                        </button>
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {axisLimit ? <p className={styles.limitMessage} role="alert">比較項目は5件までです</p> : null}
            <button type="button" className={styles.primaryButton} onClick={closeEditor}>
              決定
            </button>
          </section>
        </div>
      ) : null}
    </section>
  );
}
