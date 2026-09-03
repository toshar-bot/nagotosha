'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ALL_COMPARE_AXES, COMPARE_AXIS_LABELS } from '@/data/decision-v3-demo';
import type { DecisionV3CandidateLookup } from '@/lib/decision-v3-candidate-lookup';
import { reorderDecisionV3Ids } from '@/lib/decision-v3-pointer-reorder';
import { formatDecisionV3PartyDisplayText } from '@/lib/decision-v3-party-handoff';
import type { CompareAxis } from '@/types/decision-v3';
import { CandidatePhotoV3 } from './CandidatePhotoV3';
import ExternalCandidateProvenanceV3 from './ExternalCandidateProvenanceV3';
import styles from './decision-v3.module.css';

const compareLabel = (index: number) => `候補${String.fromCharCode(65 + index)}`;
const axisLabel = (axis: CompareAxis) => formatDecisionV3PartyDisplayText(COMPARE_AXIS_LABELS[axis]);
const UNKNOWN_MARKERS = ['未確認', '確認中', '想定'];
const COMPARE_AXIS_ICON_PATHS = {
  budget: '/decision/v3/icons/material-symbols-rounded/payments.svg',
  area: '/decision/v3/icons/material-symbols-rounded/location-on.svg',
  access: '/decision/v3/icons/material-symbols-rounded/location-on.svg',
  atmosphere: '/decision/v3/icons/material-symbols-rounded/sentiment-satisfied.svg',
  smoking: '/decision/v3/icons/material-symbols-rounded/refine/smoke-free.svg',
  seats: '/decision/v3/icons/material-symbols-rounded/refine/counter.svg',
  'private-room': '/decision/v3/icons/material-symbols-rounded/refine/private-room.svg',
  tatami: '/decision/v3/icons/material-symbols-rounded/refine/tatami.svg',
  solo: '/decision/v3/icons/material-symbols-rounded/group.svg',
  kids: '/decision/v3/icons/material-symbols-rounded/refine/kids-ok.svg',
  reservation: '/decision/v3/icons/material-symbols-rounded/refine/reservable.svg',
  'long-stay': '/decision/v3/icons/material-symbols-rounded/refine/long-stay.svg',
  wifi: '/decision/v3/icons/material-symbols-rounded/refine/wifi.svg',
  power: '/decision/v3/icons/material-symbols-rounded/refine/power.svg',
  'rain-safe': '/decision/v3/icons/material-symbols-rounded/refine/rain-safe.svg',
  parking: '/decision/v3/icons/material-symbols-rounded/refine/parking.svg',
  terrace: '/decision/v3/icons/material-symbols-rounded/refine/terrace.svg',
  'late-night': '/decision/v3/icons/material-symbols-rounded/refine/late-night.svg',
  quiet: '/decision/v3/icons/material-symbols-rounded/refine/quiet.svg',
} satisfies Record<CompareAxis, string>;
const DIALOG_FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type PointerReorderSession = {
  pointerId: number;
  candidateId: string;
  startX: number;
  startY: number;
  engaged: boolean;
};

const POINTER_REORDER_THRESHOLD = 8;

type Props = {
  compareOrder: string[];
  candidateLookup: DecisionV3CandidateLookup;
  axes: CompareAxis[];
  onBack: () => void;
  onReorder: (candidateId: string, direction: -1 | 1) => void;
  onSetOrder: (ids: string[]) => void;
  onToggleAxis: (axis: CompareAxis) => void;
  onReorderAxis: (axis: CompareAxis, direction: -1 | 1) => void;
  onDecide: (candidateId: string) => void;
};

function axisValue(
  candidateLookup: DecisionV3CandidateLookup,
  candidateId: string,
  axis: CompareAxis,
) {
  const candidate = candidateLookup.get(candidateId);
  if (!candidate) return '確認中';

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
    wifi: '未確認',
    power: '未確認',
    'rain-safe': candidate.tags.includes('雨でも安心') ? '雨でも安心' : '未確認',
    parking: '未確認',
    terrace: '未確認',
    'late-night': '未確認',
    quiet: candidate.facts.atmosphere,
  };
  const displayValue = formatDecisionV3PartyDisplayText(values[axis]).trim();
  return displayValue && !UNKNOWN_MARKERS.some((marker) => displayValue.includes(marker))
    ? displayValue
    : '確認中';
}

export function CompareV3({
  compareOrder,
  candidateLookup,
  axes,
  onBack,
  onReorder,
  onSetOrder,
  onToggleAxis,
  onReorderAxis,
  onDecide,
}: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [axisLimit, setAxisLimit] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [pointerDraggedId, setPointerDraggedId] = useState<string | null>(null);
  const [grabbedId, setGrabbedId] = useState<string | null>(null);
  const [activeAxisId, setActiveAxisId] = useState<CompareAxis>(() => axes[0] ?? 'budget');
  const pointerSessionRef = useRef<PointerReorderSession | null>(null);
  const compareContentRef = useRef<HTMLDivElement | null>(null);
  const editorDialogRef = useRef<HTMLElement | null>(null);
  const editorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const editorCloseRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const candidates = useMemo(
    () => compareOrder
      .map((id) => candidateLookup.get(id))
      .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate)),
    [candidateLookup, compareOrder],
  );
  const activeAxis = axes.includes(activeAxisId) ? activeAxisId : (axes[0] ?? 'budget');

  useEffect(() => {
    if (!axes.includes(activeAxisId) && axes[0]) {
      setActiveAxisId(axes[0]);
    }
  }, [activeAxisId, axes]);

  useEffect(() => {
    if (!editorOpen) return;

    const background = compareContentRef.current;
    const bottomNav = document.querySelector<HTMLElement>(
      'nav[aria-label="なごとしゃ共通ナビゲーション"], nav[aria-label="意思決定フロー"]',
    );
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
    if (element && pointerId !== undefined && element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
    pointerSessionRef.current = null;
    setPointerDraggedId(null);
  };

  const nearestPointerTargetId = (clientY: number) => {
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>('[data-compare-candidate-id]'),
    );
    let targetId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      const distance = Math.abs(clientY - (rect.top + rect.height / 2));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        targetId = row.dataset.compareCandidateId ?? null;
      }
    }
    return targetId;
  };

  const handleAxisTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    axis: CompareAxis,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveAxisId(axis);
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const tabs = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const currentIndex = tabs.indexOf(event.currentTarget);
    if (currentIndex < 0 || tabs.length === 0) return;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = tabs[(currentIndex + direction + tabs.length) % tabs.length];
    nextTab?.focus();
    nextTab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  return (
    <section className={`${styles.screenStage} ${styles.compareScreenStage}`} aria-labelledby="compare-title">
      <div ref={compareContentRef}>
        <header className={styles.comparePageHeader}>
          <button type="button" className={styles.iconButton} onClick={onBack} aria-label="候補へ戻る">←</button>
          <div className={styles.compareTitleBlock}>
            <h1 id="compare-title">比較して決める</h1>
            <p>
              <span>気になる{candidates.length}件を見比べて、</span>
              <span>今日の一軒を選びましょう</span>
            </p>
          </div>
          <button type="button" className={styles.compareChangeButton} onClick={onBack}>
            {candidates.length}件を変更
          </button>
        </header>

        <div className={styles.compareToolbar}>
          <button
            ref={editorTriggerRef}
            type="button"
            className={styles.compareEditButton}
            onClick={openEditor}
            aria-label="比較項目を編集"
          >
            <span>項目</span><span>編集</span>
          </button>
        </div>

        <div
          className={styles.compareAxisTabs}
          role="tablist"
          aria-label="比較項目"
        >
          {axes.map((axis) => (
            <button
              type="button"
              role="tab"
              id={`compare-axis-tab-${axis}`}
              key={axis}
              aria-selected={activeAxis === axis}
              aria-controls="compare-axis-panel"
              tabIndex={activeAxis === axis ? 0 : -1}
              onClick={() => setActiveAxisId(axis)}
              onKeyDown={(event) => handleAxisTabKeyDown(event, axis)}
            >
              {axisLabel(axis)}
            </button>
          ))}
        </div>

        <section
          id="compare-axis-panel"
          className={styles.compareAxisPanel}
          role="tabpanel"
          aria-labelledby={`compare-axis-tab-${activeAxis}`}
        >
          <h2 className={styles.compareActiveAxisHeading}>
            <span
              className={styles.compareAxisIcon}
              style={{ '--compare-icon': `url("${COMPARE_AXIS_ICON_PATHS[activeAxis]}")` } as CSSProperties}
              aria-hidden="true"
            />
            <span>{axisLabel(activeAxis)}を比較</span>
          </h2>

          <div className={styles.compareVerticalList}>
            {candidates.map((candidate, index) => {
              const displayLabel = compareLabel(index);
              return (
                <article
                  key={candidate.id}
                  className={`${styles.compareVerticalCandidate} ${pointerDraggedId === candidate.id ? styles.compareVerticalCandidateDragging : ''}`}
                  data-compare-candidate-id={candidate.id}
                  data-pointer-reordering={pointerDraggedId === candidate.id ? 'true' : 'false'}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggedId || draggedId === candidate.id) return;
                    onSetOrder(reorderDecisionV3Ids(compareOrder, draggedId, candidate.id));
                    setDraggedId(null);
                  }}
                >
                  <header className={styles.compareVerticalCandidateHeader}>
                    <span className={styles.candidateLabel}>{displayLabel}</span>
                    <h2>{candidate.name}</h2>
                    <button
                      type="button"
                      className={styles.compareReorderHandle}
                      data-compare-reorder-handle
                      draggable
                      aria-label={`${candidate.name}を並べ替え`}
                      aria-grabbed={grabbedId === candidate.id}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', candidate.id);
                        setDraggedId(candidate.id);
                      }}
                      onDragEnd={() => setDraggedId(null)}
                      onPointerDown={(event) => {
                        if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
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
                        const deltaX = event.clientX - session.startX;
                        const deltaY = event.clientY - session.startY;
                        if (!session.engaged && Math.abs(deltaX) >= POINTER_REORDER_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                          clearPointerSession(event.currentTarget, event.pointerId);
                          return;
                        }
                        if (Math.abs(deltaY) >= POINTER_REORDER_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
                          session.engaged = true;
                          setPointerDraggedId(session.candidateId);
                          event.preventDefault();
                        }
                      }}
                      onPointerUp={(event) => {
                        const session = pointerSessionRef.current;
                        if (!session || session.pointerId !== event.pointerId) return;
                        if (session.engaged) {
                          const targetId = nearestPointerTargetId(event.clientY);
                          if (targetId) onSetOrder(reorderDecisionV3Ids(compareOrder, session.candidateId, targetId));
                        }
                        clearPointerSession(event.currentTarget, event.pointerId);
                      }}
                      onPointerCancel={(event) => {
                        const session = pointerSessionRef.current;
                        if (session?.pointerId === event.pointerId) clearPointerSession(event.currentTarget, event.pointerId);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === ' ') {
                          event.preventDefault();
                          setGrabbedId((current) => (current === candidate.id ? null : candidate.id));
                          return;
                        }
                        if (event.key === 'Escape' && grabbedId === candidate.id) {
                          event.preventDefault();
                          setGrabbedId(null);
                          return;
                        }
                        if (grabbedId === candidate.id && (event.key === 'ArrowUp' || event.key === 'ArrowLeft')) {
                          event.preventDefault();
                          onReorder(candidate.id, -1);
                        }
                        if (grabbedId === candidate.id && (event.key === 'ArrowDown' || event.key === 'ArrowRight')) {
                          event.preventDefault();
                          onReorder(candidate.id, 1);
                        }
                      }}
                    >
                      <span aria-hidden="true">↕</span>
                    </button>
                  </header>

                  <ExternalCandidateProvenanceV3 candidate={candidate} density="compact" />
                  <div className={styles.compareVerticalCandidateBody}>
                    <CandidatePhotoV3 candidate={candidate} ratio="thumb" />
                    <div className={styles.compareVerticalValueBlock}>
                      <p className={styles.compareVerticalValue}>
                        {axisValue(candidateLookup, candidate.id, activeAxis)}
                      </p>
                      <button
                        type="button"
                        className={styles.compareDecisionButton}
                        onClick={() => onDecide(candidate.id)}
                        aria-label={`${candidate.name}に決める`}
                      >
                        ここに決める
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {editorOpen ? (
        <div className={styles.sheetBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditor(); }}>
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
              <button ref={editorCloseRef} type="button" className={styles.sheetCloseButton} onClick={closeEditor} aria-label="比較項目編集を閉じる">×</button>
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
                      }}
                    >
                      {selected ? '✓ ' : ''}{axisLabel(axis)}
                    </button>
                    {selected ? (
                      <span>
                        <button type="button" onClick={() => onReorderAxis(axis, -1)} disabled={axes.indexOf(axis) === 0} aria-label={`${axisLabel(axis)}を前へ`}>←</button>
                        <button type="button" onClick={() => onReorderAxis(axis, 1)} disabled={axes.indexOf(axis) === axes.length - 1} aria-label={`${axisLabel(axis)}を後ろへ`}>→</button>
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {axisLimit ? <p className={styles.limitMessage} role="alert">比較項目は5件までです</p> : null}
            <button type="button" className={styles.primaryButton} onClick={closeEditor}>決定</button>
          </section>
        </div>
      ) : null}
    </section>
  );
}
