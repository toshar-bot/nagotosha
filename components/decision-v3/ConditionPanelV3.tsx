import {
  CONDITION_GROUPS,
  CONDITION_LABELS,
  REFINE_CHOICES,
} from '@/data/decision-v3-demo';
import { hasAllRequiredConditions } from '@/lib/decision-v3-state';
import type {
  DecisionV3ConditionDraft,
  DecisionV3Conditions,
  RefineChoice,
} from '@/types/decision-v3';
import { FeatureIcon } from './FeatureIcon';
import { MapFallbackV3 } from './MapFallbackV3';
import styles from './decision-v3.module.css';

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
        <span aria-hidden="true" className={styles.headingRule} />
        <div>
          <h2 id="conditions-title">あなたにぴったりの<br />行き先を見つけます</h2>
          <p>4つの条件をひとつずつ選んでください。</p>
        </div>
      </header>

      <div className={styles.conditionGroups}>
        {CONDITION_GROUPS.map((group) => (
          <fieldset key={group.key} className={styles.conditionGroup}>
            <legend>
              {group.title}
              {'note' in group && group.note ? <small>（{group.note}）</small> : null}
            </legend>
            {group.key === 'area' ? (
              <MapFallbackV3 />
            ) : null}
            <div className={styles.conditionGrid}>
              {group.options.map((option) => {
                const selected = conditions[group.key] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    className={`${styles.conditionOption} ${selected ? styles.conditionOptionSelected : ''}`}
                    onClick={() => onCondition(group.key, option.value)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/decision/v3/conditions/${option.icon}`}
                      alt=""
                      aria-hidden="true"
                      width={512}
                      height={512}
                    />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <fieldset className={styles.refineGroup}>
        <legend>こだわり条件 <small>（任意）</small></legend>
        <RefineOptions refine={refine} onRefine={onRefine} />
      </fieldset>

      <div className={styles.conditionSubmit}>
        <div className={styles.conditionSummary} aria-live="polite">
          {ready
            ? [
                CONDITION_LABELS.party[conditions.party],
                CONDITION_LABELS.budget[conditions.budget],
                CONDITION_LABELS.mood[conditions.mood],
                CONDITION_LABELS.area[conditions.area],
              ].join(' / ')
            : '選んだ条件がここにまとまります'}
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!ready}
          aria-disabled={!ready}
          onClick={onSubmit}
        >
          この条件で候補を見る
          <span aria-hidden="true">→</span>
        </button>
        {!ready ? <p className={styles.formHelper}>4つすべて選ぶと候補を出せます</p> : null}
      </div>
    </section>
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
    return (
      <button
        key={option.value}
        type="button"
        className={`${styles.refineChip} ${selected ? styles.refineChipSelected : ''}`}
        aria-pressed={selected}
        onClick={() => onRefine(option.value)}
      >
        <FeatureIcon name={option.value} />
        <span>{option.label}</span>
      </button>
    );
  };
  const smokingValues = new Set<RefineChoice>(['smoke-free', 'smoking-ok', 'smoking-any']);
  const smokingOptions = REFINE_CHOICES.filter((option) => smokingValues.has(option.value));
  const initialOptions = REFINE_CHOICES.filter(
    (option) => option.initial && !smokingValues.has(option.value),
  );
  const expandedOptions = REFINE_CHOICES.filter((option) => !option.initial);

  return (
    <>
      <div role="group" aria-labelledby="smoking-condition-label">
        <p id="smoking-condition-label" className={styles.formHelper}>喫煙条件</p>
        <div className={styles.refineGrid}>
          {smokingOptions.map(renderOption)}
        </div>
      </div>
      <div className={styles.refineGrid}>
        {initialOptions.map(renderOption)}
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
