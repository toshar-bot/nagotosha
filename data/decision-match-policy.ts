import type { DecisionPartyType } from '../types/decision-candidate';
import type {
  DecisionBudgetChoice,
  DecisionBudgetLimit,
  DecisionMoodChoice,
  DecisionMoodPolicyEntry,
} from '../types/decision-match';

export const DECISION_MOOD_POLICY: Readonly<
  Record<DecisionMoodChoice, readonly DecisionMoodPolicyEntry[]>
> = {
  hearty: [
    { candidateTag: 'hearty', score: 3, matchKind: 'exact' },
    { candidateTag: 'spicy', score: 2, matchKind: 'related' },
  ],
  light: [
    { candidateTag: 'light', score: 3, matchKind: 'exact' },
    { candidateTag: 'quick', score: 2, matchKind: 'related' },
    { candidateTag: 'cafe', score: 1, matchKind: 'related' },
  ],
  relax: [
    { candidateTag: 'relax', score: 3, matchKind: 'exact' },
    { candidateTag: 'cafe', score: 2, matchKind: 'related' },
  ],
  newExperience: [
    { candidateTag: 'newExperience', score: 3, matchKind: 'exact' },
  ],
};

export const CANDIDATE_BUDGET_LIMIT: DecisionBudgetLimit = {
  under1000: 1000,
  under2000: 2000,
  under4000: 4000,
  open: null,
};

export const QUERY_BUDGET_LIMIT: Readonly<
  Record<Exclude<DecisionBudgetChoice, 'any'>, number>
> = {
  under1000: 1000,
  under2000: 2000,
  under4000: 4000,
};

export const PARTY_CHOICE_LABEL: Readonly<Record<DecisionPartyType, string>> = {
  solo: 'ひとり',
  couple: 'ふたり',
  family: '家族',
  group: 'グループ',
};

export const BUDGET_CHOICE_LABEL: Readonly<
  Record<Exclude<DecisionBudgetChoice, 'any'>, string>
> = {
  under1000: '〜1,000円',
  under2000: '〜2,000円',
  under4000: '〜4,000円',
};

export const MOOD_CHOICE_LABEL: Readonly<Record<DecisionMoodChoice, string>> = {
  hearty: 'しっかり食べたい',
  light: '軽く楽しみたい',
  relax: 'ゆっくり過ごしたい',
  newExperience: '新しい体験',
};
