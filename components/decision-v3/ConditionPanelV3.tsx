import type { CSSProperties } from 'react';

import {
  CONDITION_GROUPS,
  REFINE_CHOICES,
} from '@/data/decision-v3-demo';
import { DECISION_V3_PARTY_LABELS } from '@/lib/decision-v3-party-handoff';
import { hasAllRequiredConditions } from '@/lib/decision-v3-state';
import type {
  DecisionV3ConditionDraft,
  DecisionV3Conditions,
  PartyChoice,
  RefineChoice,
} from '@/types/decision-v3';
import styles from './decision-v3.module.css';

const CONDITION_GROUP_ORDER: ReadonlyArray<keyof DecisionV3Conditions> = [
  'party',
  'budget',
  'area',
  'mood',
];

const CONDITION_GROUP_META: Record<
  keyof DecisionV3Conditions,
  { number: string; title: string; icon: string }
> = {
  party: { number: '1', title: '誰と行く？', icon: '/decision/v3/icons/material-symbols-rounded/group.svg' },
  budget: { number: '2', title: '予算は？', icon: '/decision/v3/icons/material-symbols-rounded/payments.svg' },
  area: { number: '3', title: 'エリアは？', icon: '/decision/v3/icons/material-symbols-rounded/location-on.svg' },
  mood: { number: '4', title: '今の気分は？', icon: '/decision/v3/icons/material-symbols-rounded/sentiment-satisfied.svg' },
};

const PARTY_OPTION_LABEL_LINES = {
  solo: [DECISION_V3_PARTY_LABELS.solo],
  pair: [DECISION_V3_PARTY_LABELS.pair],
  family: [DECISION_V3_PARTY_LABELS.family],
  group: ['友人・', 'グループ'],
} satisfies Record<PartyChoice, ReadonlyArray<string>>;

const OPTION_LABEL_LINES: Partial<Record<string, ReadonlyArray<string>>> = {
  'area:meieki': ['名駅・', '駅周辺'],
  'area:osu': ['大須・', '上前津'],
  'area:any': ['こだわら', 'ない'],
  'mood:hearty': ['しっかり', '食べたい'],
  'mood:light': ['軽く', '楽しみたい'],
  'mood:relax': ['ゆっくり', '過ごしたい'],
};

const ORDERED_CONDITION_GROUPS = [...CONDITION_GROUPS].sort(
  (left, right) =>
    CONDITION_GROUP_ORDER.indexOf(left.key) - CONDITION_GROUP_ORDER.indexOf(right.key),
);

const REFINE_ICON_PATHS = {
  'smoke-free': '/decision/v3/icons/material-symbols-rounded/refine/smoke-free.svg',
  'smoking-ok': '/decision/v3/icons/material-symbols-rounded/refine/smoking-ok.svg',
  'smoking-any': '/decision/v3/icons/material-symbols-rounded/refine/smoking-any.svg',
  'private-room': '/decision/v3/icons/material-symbols-rounded/refine/private-room.svg',
  tatami: '/decision/v3/icons/material-symbols-rounded/refine/tatami.svg',
  counter: '/decision/v3/icons/material-symbols-rounded/refine/counter.svg',
  'kids-ok': '/decision/v3/icons/material-symbols-rounded/refine/kids-ok.svg',
  reservable: '/decision/v3/icons/material-symbols-rounded/refine/reservable.svg',
  parking: '/decision/v3/icons/material-symbols-rounded/refine/parking.svg',
  'rain-safe': '/decision/v3/icons/material-symbols-rounded/refine/rain-safe.svg',
  wifi: '/decision/v3/icons/material-symbols-rounded/refine/wifi.svg',
  power: '/decision/v3/icons/material-symbols-rounded/refine/power.svg',
  terrace: '/decision/v3/icons/material-symbols-rounded/refine/terrace.svg',
  'late-night': '/decision/v3/icons/material-symbols-rounded/refine/late-night.svg',
  quiet: '/decision/v3/icons/material-symbols-rounded/refine/quiet.svg',
  'long-stay': '/decision/v3/icons/material-symbols-rounded/refine/long-stay.svg',
} satisfies Record<RefineChoice, string>;

const REFINE_LABEL_LINES: Partial<Record<RefineChoice, ReadonlyArray<string>>> = {
  counter: ['カウンター席', 'あり'],
  'kids-ok': ['ベビーカー', '子連れOK'],
  parking: ['駐車場', 'あり'],
  'rain-safe': ['雨でも', '安心'],
  wifi: ['Wi-Fi', 'あり'],
  'long-stay': ['長居', 'しやすい'],
};

const INITIAL_REFINE_ORDER = [
  'private-room',
  'tatami',
  'reservable',
] as const satisfies ReadonlyArray<RefineChoice>;

const WIDE_REFINE_ORDER = [
  'kids-ok',
  'counter',
] as const satisfies ReadonlyArray<RefineChoice>;

type Props = {
  conditions: DecisionV3ConditionDraft;
  refine: RefineChoice[];
  onCondition: (group: keyof DecisionV3Conditions, value: string) => void;
  onRefine: (value: RefineChoice) => void;
  onSubmit: () => void;
};

export function ConditionPanelV3({ conditions, refine, onCondition, onRefine, onSubmit }: Props) {
  const ready = hasAllRequiredConditions(conditions);

  return (
    <section id="decision-v3-conditions" className={styles.conditionsStage} aria-labelledby="conditions-title">
      <header className={styles.sectionHeading}>
        <h2 id="conditions-title">条件からすぐ決める</h2>
        <p>今日のごはんを、条件からしぼります</p>
      </header>

      <div className={styles.conditionGroups}>
        {ORDERED_CONDITION_GROUPS.map((group) => {
          const meta = CONDITION_GROUP_META[group.key];
          return (
          <fieldset key={group.key} className={styles.conditionGroup}>
            <legend className={styles.srOnly}>
              {meta.number}. {meta.title}
              {'note' in group && group.note ? `（${group.note}）` : ''}
            </legend>
            <div className={styles.conditionGroupHeading} aria-hidden="true">
              <span className={styles.conditionGroupNumber}>{meta.number}</span>
              <ConditionHeadingIcon src={meta.icon} />
              <span className={styles.conditionGroupTitle}>{meta.title}</span>
              {'note' in group && group.note ? (
                <small>（{group.note}）</small>
              ) : null}
            </div>
            <div className={styles.conditionGrid}>
              {group.options.map((option) => {
                const selected = conditions[group.key] === option.value;
                const partyLabel = group.key === 'party'
                  ? DECISION_V3_PARTY_LABELS[option.value as PartyChoice]
                  : undefined;
                const labelLines = group.key === 'party'
                  ? PARTY_OPTION_LABEL_LINES[option.value as PartyChoice]
                  : OPTION_LABEL_LINES[`${group.key}:${option.value}`] ?? [option.label];
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-label={partyLabel}
                    aria-pressed={selected}
                    className={`${styles.conditionOption} ${selected ? styles.conditionOptionSelected : ''}`}
                    onClick={() => onCondition(group.key, option.value)}
                  >
                    <span className={styles.conditionOptionContent}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/decision/v3/conditions-display/${group.key}-${option.value}-display.png`}
                        alt=""
                        aria-hidden="true"
                        width={512}
                        height={512}
                      />
                      <span className={styles.conditionOptionLabel}>
                        {labelLines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          );
        })}
      </div>

      <fieldset className={styles.refineGroup}>
        <legend className={styles.srOnly}>5. こだわり条件（任意）</legend>
        <div className={styles.conditionGroupHeading} aria-hidden="true">
          <span className={styles.conditionGroupNumber}>5</span>
          <ConditionHeadingIcon src="/decision/v3/icons/material-symbols-rounded/tune.svg" />
          <span className={styles.conditionGroupTitle}>こだわり条件</span>
          <small>（任意）</small>
        </div>
        <RefineOptions refine={refine} onRefine={onRefine} />
      </fieldset>

      <div className={styles.conditionSubmit}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!ready}
          aria-disabled={!ready}
          onClick={onSubmit}
        >
          この条件で候補を見る
        </button>
      </div>
    </section>
  );
}

function ConditionHeadingIcon({ src }: { src: string }) {
  return (
    <span
      className={styles.conditionHeadingIcon}
      aria-hidden="true"
      style={{ '--condition-heading-icon': `url("${src}")` } as CSSProperties}
    />
  );
}

function RefineMaterialIcon({ name }: { name: RefineChoice }) {
  return (
    <span
      className={styles.refineMaterialIcon}
      aria-hidden="true"
      style={{ '--refine-icon': `url("${REFINE_ICON_PATHS[name]}")` } as CSSProperties}
    />
  );
}

function RefineOptions({
  refine,
  onRefine,
}: {
  refine: RefineChoice[];
  onRefine: (value: RefineChoice) => void;
}) {
  const renderOption = (option: (typeof REFINE_CHOICES)[number]) => {
    const selected = refine.includes(option.value);
    const labelLines = REFINE_LABEL_LINES[option.value];
    return (
      <button
        key={option.value}
        type="button"
        className={`${styles.refineChip} ${selected ? styles.refineChipSelected : ''}`}
        aria-pressed={selected}
        onClick={() => onRefine(option.value)}
      >
        <RefineMaterialIcon name={option.value} />
        <span className={styles.refineLabel}>
          {labelLines
            ? labelLines.map((line) => <span key={line}>{line}</span>)
            : option.label}
        </span>
      </button>
    );
  };
  const smokingValues = new Set<RefineChoice>(['smoke-free', 'smoking-ok', 'smoking-any']);
  const smokingOptions = REFINE_CHOICES.filter((option) => smokingValues.has(option.value));
  const initialOptions = REFINE_CHOICES
    .filter((option) => INITIAL_REFINE_ORDER.includes(option.value as (typeof INITIAL_REFINE_ORDER)[number]))
    .sort(
      (left, right) =>
        INITIAL_REFINE_ORDER.indexOf(left.value as (typeof INITIAL_REFINE_ORDER)[number])
        - INITIAL_REFINE_ORDER.indexOf(right.value as (typeof INITIAL_REFINE_ORDER)[number]),
    );
  const wideOptions = REFINE_CHOICES
    .filter((option) => WIDE_REFINE_ORDER.includes(option.value as (typeof WIDE_REFINE_ORDER)[number]))
    .sort(
      (left, right) =>
        WIDE_REFINE_ORDER.indexOf(left.value as (typeof WIDE_REFINE_ORDER)[number])
        - WIDE_REFINE_ORDER.indexOf(right.value as (typeof WIDE_REFINE_ORDER)[number]),
    );
  const expandedOptions = REFINE_CHOICES.filter((option) => !option.initial);

  return (
    <>
      <div role="group" aria-labelledby="smoking-condition-label">
        <p id="smoking-condition-label" className={styles.formHelper}>喫煙条件</p>
        <div className={`${styles.refineGrid} ${styles.refineInitialGrid}`}>
          {smokingOptions.map(renderOption)}
        </div>
      </div>
      <div className={`${styles.refineGrid} ${styles.refineInitialGrid}`}>
        {initialOptions.map(renderOption)}
      </div>
      <div className={`${styles.refineGrid} ${styles.refineWideGrid}`}>
        {wideOptions.map(renderOption)}
      </div>
      <details className={styles.refineDetails}>
        <summary>もっと見る</summary>
        <div className={styles.refineGrid}>
          {expandedOptions.map(renderOption)}
        </div>
      </details>
    </>
  );
}
