import type {
  CandidateBudgetBand,
  DecisionCandidate,
  DecisionPartyType,
} from './decision-candidate';

export type DecisionBudgetChoice = 'under1000' | 'under2000' | 'under4000' | 'any';
export type DecisionMoodChoice = 'hearty' | 'light' | 'relax' | 'newExperience';
export type DecisionAreaChoice = 'sakae' | 'meieki' | 'osu' | 'any';

export type DecisionMatchQuery = {
  partyType?: DecisionPartyType;
  budget?: DecisionBudgetChoice;
  mood?: DecisionMoodChoice;
  area?: DecisionAreaChoice;
};

export type DecisionMatchStatus = 'incomplete' | 'matched' | 'no-match';
export type DecisionRequiredChoice = 'partyType' | 'budget' | 'mood';
export type DecisionHardFilterDimension = 'candidate' | 'partyType' | 'budget' | 'area';
export type DecisionRelaxableDimension = 'budget' | 'area' | 'mood';

export type DecisionHardFilterReason = {
  dimension: DecisionHardFilterDimension;
  code:
    | 'candidate-not-matchable'
    | 'party-not-supported'
    | 'budget-over-limit'
    | 'open-budget-requires-any'
    | 'area-mismatch';
  selectedValue?: string;
  candidateValue?: string | readonly string[];
};

export type DecisionMatchReason = {
  dimension: 'partyType' | 'budget' | 'mood';
  code: 'approved-party' | 'approved-budget' | 'approved-mood-exact' | 'approved-mood-related';
  text: string;
  evidenceId: string;
};

export type RankedDecisionCandidate = {
  candidate: DecisionCandidate;
  registryIndex: number;
  moodScore: number;
  exactMatchCount: number;
  matchReasons: readonly DecisionMatchReason[];
};

export type RejectedDecisionCandidate = {
  candidate: DecisionCandidate;
  registryIndex: number;
  hardFilterReasons: readonly DecisionHardFilterReason[];
  moodMatched: boolean;
};

export type DecisionChoiceCoverage = {
  partyType: Readonly<Record<DecisionPartyType, number>>;
  budget: Readonly<Record<Exclude<DecisionBudgetChoice, 'any'>, number>>;
  mood: Readonly<Record<DecisionMoodChoice, number>>;
  area: Readonly<Record<Exclude<DecisionAreaChoice, 'any'>, number>>;
};

export type DecisionMatchResult = {
  status: DecisionMatchStatus;
  rankedCandidates: readonly RankedDecisionCandidate[];
  rejectedCandidates: readonly RejectedDecisionCandidate[];
  hardFilterReasons: Readonly<Record<string, readonly DecisionHardFilterReason[]>>;
  matchReasons: Readonly<Record<string, readonly DecisionMatchReason[]>>;
  exactMatchCount: Readonly<Record<string, number>>;
  moodScore: Readonly<Record<string, number>>;
  relaxableDimensions: readonly DecisionRelaxableDimension[];
  choiceCoverage: DecisionChoiceCoverage;
  incompleteChoices: readonly DecisionRequiredChoice[];
};

export type DecisionMoodPolicyEntry = {
  candidateTag: 'hearty' | 'light' | 'relax' | 'newExperience' | 'quick' | 'spicy' | 'cafe';
  score: 1 | 2 | 3;
  matchKind: 'exact' | 'related';
};

export type DecisionBudgetLimit = Readonly<Record<CandidateBudgetBand, number | null>>;
