'use client';

import { useState } from 'react';
import TosharMascot from '@/components/mascot/TosharMascot';
import type { DecisionModeAvailability } from '@/types/decision-candidate';
import styles from './decision-concierge.module.css';

type ChoiceTone = 'blue' | 'coral' | 'green' | 'orange' | 'violet';
type ChoiceIconName =
  | 'person'
  | 'heart'
  | 'family'
  | 'group'
  | 'yen'
  | 'yenDouble'
  | 'wallet'
  | 'shuffle'
  | 'fork'
  | 'cup'
  | 'chair'
  | 'sparkles'
  | 'city'
  | 'station'
  | 'temple'
  | 'mapRange';

type Choice = {
  value: string;
  label: string;
  labelLines: readonly string[];
  icon: ChoiceIconName;
  tone: ChoiceTone;
};

const PARTY_CHOICES: Choice[] = [
  { value: 'solo', label: 'ひとり', labelLines: ['ひとり'], icon: 'person', tone: 'blue' },
  { value: 'couple', label: 'デート・ふたり', labelLines: ['デート・', 'ふたり'], icon: 'heart', tone: 'coral' },
  { value: 'family', label: '家族・子ども', labelLines: ['家族・', '子ども'], icon: 'family', tone: 'green' },
  { value: 'group', label: '友人・グループ', labelLines: ['友人・', 'グループ'], icon: 'group', tone: 'blue' },
];

const BUDGET_CHOICES: Choice[] = [
  { value: 'under1000', label: '〜1,000円', labelLines: ['〜1,000円'], icon: 'yen', tone: 'orange' },
  { value: 'under2000', label: '〜2,000円', labelLines: ['〜2,000円'], icon: 'yenDouble', tone: 'orange' },
  { value: 'under4000', label: '〜4,000円', labelLines: ['〜4,000円'], icon: 'wallet', tone: 'orange' },
  { value: 'any', label: '気にしない', labelLines: ['気にしない'], icon: 'shuffle', tone: 'green' },
];

const MOOD_CHOICES: Choice[] = [
  { value: 'hearty', label: 'しっかり食べたい', labelLines: ['しっかり', '食べたい'], icon: 'fork', tone: 'coral' },
  { value: 'light', label: '軽く楽しみたい', labelLines: ['軽く', '楽しみたい'], icon: 'cup', tone: 'blue' },
  { value: 'relax', label: 'ゆっくり過ごしたい', labelLines: ['ゆっくり', '過ごしたい'], icon: 'chair', tone: 'orange' },
  { value: 'newExperience', label: '新しい体験', labelLines: ['新しい', '体験'], icon: 'sparkles', tone: 'violet' },
];

const AREA_CHOICES: Choice[] = [
  { value: 'sakae', label: '栄・伏見', labelLines: ['栄・伏見'], icon: 'city', tone: 'blue' },
  { value: 'meieki', label: '名駅・駅周辺', labelLines: ['名駅・', '駅周辺'], icon: 'station', tone: 'blue' },
  { value: 'osu', label: '大須・上前津', labelLines: ['大須・', '上前津'], icon: 'temple', tone: 'violet' },
  { value: 'any', label: 'こだわらない', labelLines: ['こだわら', 'ない'], icon: 'mapRange', tone: 'coral' },
];

export default function ConditionPanel({
  foodAvailability: _foodAvailability,
}: {
  foodAvailability: DecisionModeAvailability;
}) {
  void _foodAvailability;
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

      <form className={styles.conditionForm} onSubmit={(event) => event.preventDefault()}>
        <ChoiceGroup legend="誰と行く？" choices={PARTY_CHOICES} selected={party} onSelect={setParty} />
        <ChoiceGroup legend="予算は？" choices={BUDGET_CHOICES} selected={budget} onSelect={setBudget} />
        <ChoiceGroup legend="今の気分は？" choices={MOOD_CHOICES} selected={mood} onSelect={setMood} />
        <ChoiceGroup
          legend="エリアは？（任意）"
          choices={AREA_CHOICES}
          selected={area}
          onSelect={setArea}
        />

        <div className={styles.selectionSummaryRow}>
          <p className={styles.selectionSummary} role="status" aria-live="polite">
            <span>選択中</span>
            {selectedConditions.length > 0 ? selectedConditions.join('・') : '条件を選んでください'}
          </p>
          <TosharMascot
            pose="listen"
            className={styles.decisionMascot}
            sizes="(max-width: 340px) 68px, (min-width: 420px) 82px, 76px"
          />
        </div>

        <div className={styles.conditionActions}>
          <button type="submit" className={styles.primaryDecisionCta} disabled aria-disabled="true">
            この条件で提案してもらう <span aria-hidden="true">›</span>
          </button>
          <p className={styles.conditionActionNote}>候補データ準備中</p>
          <a href="#discover" className={styles.secondaryDecisionCta}>特集・新店から探す</a>
        </div>
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
        {choices.map((choice) => {
          const isSelected = selected === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              className={`${styles.choice} ${isSelected ? styles.choiceActive : ''}`}
              data-tone={choice.tone}
              aria-label={choice.label}
              aria-pressed={isSelected}
              onClick={() => onSelect(choice.value)}
            >
              <span className={styles.choiceIcon} aria-hidden="true">
                <ChoiceIcon name={choice.icon} />
              </span>
              <span className={styles.choiceLabel} aria-hidden="true">
                {choice.labelLines.map((line) => (
                  <span key={line} className={styles.choiceLabelLine} aria-hidden="true">{line}</span>
                ))}
              </span>
              {isSelected && (
                <span className={styles.choiceCheck} aria-hidden="true">
                  <svg viewBox="0 0 20 20">
                    <path d="m5 10.4 3.1 3.1L15.4 6" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ChoiceIcon({ name }: { name: ChoiceIconName }) {
  const commonProps = {
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const surface = <circle className={styles.iconSurface} cx="16" cy="16" r="15" />;

  switch (name) {
    case 'person':
      return <svg {...commonProps}>{surface}<circle className={styles.iconFill} cx="16" cy="9" r="4" /><path d="M8 27v-4.2c0-4.4 3.6-8 8-8s8 3.6 8 8V27" /></svg>;
    case 'heart':
      return <svg {...commonProps}>{surface}<path className={styles.iconFill} d="M16 26S5.5 19.6 5.5 11.8A5.8 5.8 0 0 1 16 8.4a5.8 5.8 0 0 1 10.5 3.4C26.5 19.6 16 26 16 26Z" /></svg>;
    case 'family':
      return <svg {...commonProps}>{surface}<circle className={styles.iconFill} cx="11" cy="10" r="3" /><circle className={styles.iconFill} cx="22" cy="11" r="2.6" /><path d="M5.5 26v-4.4a5.5 5.5 0 0 1 11 0V26M17.5 25v-3.1a4.5 4.5 0 0 1 9 0V25" /></svg>;
    case 'group':
      return <svg {...commonProps}>{surface}<circle className={styles.iconFill} cx="16" cy="8.5" r="3.3" /><circle className={styles.iconFill} cx="7.5" cy="12" r="2.5" /><circle className={styles.iconFill} cx="24.5" cy="12" r="2.5" /><path d="M10.5 26v-4.5a5.5 5.5 0 0 1 11 0V26M2.8 26v-3a4.6 4.6 0 0 1 5.7-4.5M29.2 26v-3a4.6 4.6 0 0 0-5.7-4.5" /></svg>;
    case 'yen':
      return <svg {...commonProps}>{surface}<circle className={styles.iconFill} cx="16" cy="16" r="10" /><path d="m11 9 5 6 5-6M16 15v9M11.5 17.5h9M11.5 21h9" /></svg>;
    case 'yenDouble':
      return <svg {...commonProps}>{surface}<circle className={styles.iconFill} cx="13.5" cy="16" r="9.5" /><path d="m9.5 11 4 4.8 4-4.8M13.5 15.8v7M10 18h7M10 21h7M22 8.5a9.5 9.5 0 0 1 3.5 14" /></svg>;
    case 'wallet':
      return <svg {...commonProps}>{surface}<path className={styles.iconFill} d="M5 9h20a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V9Z" /><path d="M5 10V8a3 3 0 0 1 3-3h15v5M19 15h8v6h-8a3 3 0 0 1 0-6Z" /><circle cx="20" cy="18" r=".8" fill="currentColor" stroke="none" /></svg>;
    case 'shuffle':
      return <svg {...commonProps}>{surface}<path d="M5 9h4c7 0 7 14 14 14h4M23 19l4 4-4 4M5 23h4c3.3 0 4.9-3.1 6.5-6.4M23 5l4 4-4 4M19.5 9H27" /></svg>;
    case 'fork':
      return <svg {...commonProps}>{surface}<path d="M8 5v8M12 5v8M8 9h4M10 13v14M22 5v22M22 5c-4 3.5-4 9.2 0 11" /></svg>;
    case 'cup':
      return <svg {...commonProps}>{surface}<path className={styles.iconFill} d="M7 13h17v5a8.5 8.5 0 0 1-17 0v-5Z" /><path d="M24 15h1.5a3.5 3.5 0 0 1 0 7H23M5 27h22M12 9c-1.5-1.8.8-2.8 0-4.5M18 9c-1.5-1.8.8-2.8 0-4.5" /></svg>;
    case 'chair':
      return <svg {...commonProps}>{surface}<path className={styles.iconFill} d="M9 13h14c2 0 3 1.6 3 3.5V22H7v-4" /><path d="M9 6v11h14V9M10 22v5M23 22v5" /></svg>;
    case 'sparkles':
      return <svg {...commonProps}>{surface}<path className={styles.iconFill} d="m16 4 1.8 5.2L23 11l-5.2 1.8L16 18l-1.8-5.2L9 11l5.2-1.8L16 4Z" /><path d="M25 19l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1 1-2.8ZM7 18l1.1 3 3 1.1-3 1.1-1.1 3-1.1-3-3-1.1 3-1.1L7 18Z" /></svg>;
    case 'city':
      return <svg {...commonProps}>{surface}<path className={styles.iconFill} d="M8 27V12h7v15M15 27V6h9v21" /><path d="M5 27h22M11 16h1M11 20h1M18 10h2M18 15h2M18 20h2" /></svg>;
    case 'station':
      return <svg {...commonProps}>{surface}<rect className={styles.iconFill} x="7" y="5" width="18" height="20" rx="4" /><path d="M10 17h12M11 9h10v5H11zM11 25l-2 3M21 25l2 3M11.5 21h.1M20.5 21h.1" /></svg>;
    case 'temple':
      return <svg {...commonProps}>{surface}<path className={styles.iconFill} d="M4 12h24L16 5 4 12Z" /><path d="M7 15h18M9 15v10M15 15v10M23 15v10M5 27h22" /></svg>;
    case 'mapRange':
      return <svg {...commonProps}>{surface}<path className={styles.iconFill} d="M16 19s5-4.7 5-8a5 5 0 0 0-10 0c0 3.3 5 8 5 8Z" /><circle cx="16" cy="11" r="1.6" /><path d="M10 18 5 23M5 18v5h5M22 18l5 5M27 18v5h-5" /></svg>;
  }
}
