'use client';

import { useState } from 'react';
import type { DecisionModeAvailability } from '@/types/decision-candidate';
import styles from './decision-concierge.module.css';

type Choice = { value: string; label: string };

const PARTY_CHOICES: Choice[] = [
  { value: 'solo', label: 'ひとり' },
  { value: 'couple', label: 'デート・ふたり' },
  { value: 'family', label: '家族・子ども' },
  { value: 'group', label: '友人・グループ' },
];

const BUDGET_CHOICES: Choice[] = [
  { value: 'under1000', label: '〜1,000円' },
  { value: 'under2000', label: '〜2,000円' },
  { value: 'under4000', label: '〜4,000円' },
  { value: 'any', label: '気にしない' },
];

const MOOD_CHOICES: Choice[] = [
  { value: 'hearty', label: 'しっかり食べたい' },
  { value: 'light', label: '軽く楽しみたい' },
  { value: 'relax', label: 'ゆっくり過ごしたい' },
  { value: 'newExperience', label: '新しい体験' },
];

const AREA_CHOICES: Choice[] = [
  { value: 'sakae', label: '栄・伏見' },
  { value: 'meieki', label: '名駅・駅周辺' },
  { value: 'osu', label: '大須・上前津' },
  { value: 'any', label: 'こだわらない' },
];

export default function ConditionPanel({
  foodAvailability,
}: {
  foodAvailability: DecisionModeAvailability;
}) {
  const [party, setParty] = useState('');
  const [budget, setBudget] = useState('');
  const [mood, setMood] = useState('');
  const [area, setArea] = useState('');
  const selectedConditions = [
    getChoiceLabel(PARTY_CHOICES, party),
    getChoiceLabel(BUDGET_CHOICES, budget),
    getChoiceLabel(MOOD_CHOICES, mood),
    getChoiceLabel(AREA_CHOICES, area),
  ].filter((label): label is string => Boolean(label));

  return (
    <section id="decision" className={styles.decisionStage} aria-labelledby="decision-title">
      <div className={styles.nagoyaLine} aria-hidden="true" />
      <div className={styles.stageIntro}>
        <p className={styles.eyebrow}>DECISION START</p>
        <h2 id="decision-title">まずは、今日の条件を聞かせてください</h2>
        <p>まずは食事から。<br />誰と・予算・気分を選ぶと、条件に合う候補をご提案します。</p>
      </div>

      <div className={styles.modeRow} aria-label="意思決定モード">
        <div className={styles.activeMode}>
          <span>FOOD</span>
          <strong>食事から考える</strong>
        </div>
        <details className={styles.previewDetails}>
          <summary>Preview情報</summary>
          <p>
            event・outingは候補が各3件以上になるまで非表示です。現在のfood候補は
            {foodAvailability.candidateCount}件です。
          </p>
        </details>
      </div>

      <form className={styles.conditionForm} onSubmit={(event) => event.preventDefault()}>
        <ChoiceGroup legend="誰と？" choices={PARTY_CHOICES} selected={party} onSelect={setParty} />
        <ChoiceGroup legend="予算" choices={BUDGET_CHOICES} selected={budget} onSelect={setBudget} />
        <ChoiceGroup legend="気分" choices={MOOD_CHOICES} selected={mood} onSelect={setMood} />

        <details className={styles.areaDetails}>
          <summary>エリアも選ぶ（任意）</summary>
          <div className={styles.choiceGrid}>
            {AREA_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                className={area === choice.value ? styles.choiceActive : styles.choice}
                aria-pressed={area === choice.value}
                onClick={() => setArea(choice.value)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </details>

        <p className={styles.selectionSummary} role="status" aria-live="polite">
          <span>選択中</span>
          {selectedConditions.length > 0 ? selectedConditions.join('・') : '条件を選んでください'}
        </p>

        <button type="submit" className={styles.disabledCta} disabled>
          候補データを準備中です
        </button>
      </form>
    </section>
  );
}

function getChoiceLabel(choices: Choice[], value: string): string | undefined {
  return choices.find((choice) => choice.value === value)?.label;
}

function ChoiceGroup({
  legend,
  choices,
  selected,
  onSelect,
}: {
  legend: string;
  choices: Choice[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset className={styles.choiceGroup}>
      <legend>{legend}</legend>
      <div className={styles.choiceGrid}>
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            className={selected === choice.value ? styles.choiceActive : styles.choice}
            aria-pressed={selected === choice.value}
            onClick={() => onSelect(choice.value)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
