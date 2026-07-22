import type { DecisionAction } from './decision-candidate';
import type { DecisionRelaxableDimension, DecisionRequiredChoice } from './decision-match';
import type { DecisionRelationshipResolution } from '../lib/decision-safety';

export type CandidateRoleKey = 'quick' | 'hearty' | 'cafe-relax';
export type CandidateRoleTone = 'blue' | 'coral' | 'violet';
export type CandidateRoleMoodTag = 'quick' | 'hearty' | 'spicy' | 'cafe' | 'relax';

export type CandidatePresentationRole = {
  key: CandidateRoleKey;
  label: string;
  tone: CandidateRoleTone;
};

export type PresentationAction =
  | {
      type: Exclude<DecisionAction['type'], 'reservation'>;
      label: string;
      url: string;
    }
  | {
      type: 'reservation';
      label: string;
      url: string;
      isAvailabilityGuarantee: false;
      note: string;
    };

export type CandidatePresentationModel = {
  candidateId: string;
  articleId: number;
  displayName: string;
  /** 最終的に表示可能な候補配列内の0始まり連続index。 */
  order: number;
  role: CandidatePresentationRole;
  visualTreatment: {
    kind: 'category-panel';
  };
  matchReasons: readonly string[];
  facts: {
    budgetLabel: string;
    areaLabel: string;
    openingHoursLabel: string;
    lastOrderLabel?: string;
  };
  verifiedDates:
    | {
        mode: 'merged';
        label: string;
      }
    | {
        mode: 'per-fact';
        status?: string;
        openingHours?: string;
        price?: string;
      };
  disclosure:
    | null
    | {
        kind: 'pr' | 'owned';
        label: string;
        text: string;
      };
  actions: readonly PresentationAction[];
};

export type RelaxationAxis = DecisionRelaxableDimension | 'party';

export type PresentationRelaxHint = {
  axis: RelaxationAxis;
  label: string;
};

export type DecisionPresentationResult =
  | {
      status: 'incomplete';
      incompleteChoices: readonly DecisionRequiredChoice[];
    }
  | {
      status: 'no-match';
      relaxHints: readonly PresentationRelaxHint[];
    }
  | {
      status: 'data-unavailable';
    }
  | {
      status: 'matched';
      candidates: readonly CandidatePresentationModel[];
    };

export type CandidateRelationshipPresentationInput = {
  candidateId: string;
  resolution: DecisionRelationshipResolution;
};

export type ApprovedRelationshipDisclosure = {
  articleId: number;
  kind: 'pr' | 'owned';
  text: string;
  approved: true;
  approvedBy: 'user';
};

export type CandidateRolePolicyEntry = CandidatePresentationRole & {
  approvedMoodTags: readonly CandidateRoleMoodTag[];
};

export type DecisionPresentationPolicy = {
  version: string;
  candidateCount: {
    minimum: 1;
    maximum: 3;
  };
  roles: readonly CandidateRolePolicyEntry[];
  budgetLabels: Readonly<Record<'under1000' | 'under2000' | 'under4000' | 'open', string>>;
  areaLabels: Readonly<Record<'sakae' | 'meieki' | 'osu', string>>;
  actionLabels: Readonly<Record<DecisionAction['type'], string>>;
  relaxHints: Readonly<Record<DecisionRelaxableDimension, string>>;
  lastOrderPrefix: string;
  maximumMatchReasons: 3;
};

export type PresentationContractViolationCode =
  | 'input-version-mismatch'
  | 'candidate-count-out-of-range'
  | 'duplicate-candidate'
  | 'candidate-not-eligible'
  | 'article-target-required'
  | 'role-not-unique'
  | 'match-reasons-invalid'
  | 'unapproved-area'
  | 'verified-date-invalid'
  | 'relationship-result-missing'
  | 'relationship-not-displayable'
  | 'relationship-target-mismatch'
  | 'disclosure-required'
  | 'action-invalid'
  | 'action-duplicate';

export type PresentationContractViolation = {
  code: PresentationContractViolationCode;
  /** Zero-based index from the original rankedCandidates input. */
  candidateOrder?: number;
};

export type DecisionPresentationDiagnostics = {
  /** Candidate-local exclusions only. Never includes candidate identity or display facts. */
  candidateViolations: readonly PresentationContractViolation[];
};

export type DecisionPresentationBuildResult =
  | {
      ok: true;
      presentation: DecisionPresentationResult;
      diagnostics: DecisionPresentationDiagnostics;
    }
  | {
      ok: false;
      /** Whole-input integrity failures only. */
      violations: readonly PresentationContractViolation[];
    };

export type CandidateDecision = 'undecided' | 'interested' | 'rejected';

export type PresentSession = {
  candidateIds: readonly string[];
  cursor: number;
  decisionsByCandidateId: Readonly<Record<string, CandidateDecision>>;
  history: readonly number[];
};

export type DecisionFlowState =
  | { phase: 'incomplete' }
  | { phase: 'no-match'; relaxHints: readonly PresentationRelaxHint[] }
  | { phase: 'data-unavailable' }
  | { phase: 'presenting'; session: PresentSession }
  | { phase: 'comparing'; candidateIds: readonly string[]; session: PresentSession }
  | { phase: 'decided'; candidateId: string }
  | { phase: 'no-remaining' };

export type DecisionFlowEvent =
  | { type: 'START_MATCHED'; candidateIds: readonly string[] }
  | { type: 'START_NO_MATCH'; relaxHints: readonly PresentationRelaxHint[] }
  | { type: 'START_DATA_UNAVAILABLE' }
  | { type: 'MARK_INTERESTED' }
  | { type: 'MARK_REJECTED' }
  | { type: 'BACK' }
  | { type: 'DECIDE'; candidateId: string }
  | { type: 'RETURN_TO_PRESENTING' }
  | { type: 'RESET' }
  | { type: 'REQUEST_RELAXATION'; axis: RelaxationAxis };

export type DecisionFlowEffect = {
  type: 'request-relaxation';
  axis: RelaxationAxis;
};

export type DecisionFlowViolation =
  | 'candidate-count-out-of-range'
  | 'candidate-id-invalid'
  | 'event-not-allowed'
  | 'candidate-not-interested'
  | 'relaxation-not-offered';

export type DecisionFlowTransition = {
  state: DecisionFlowState;
  accepted: boolean;
  effect?: DecisionFlowEffect;
  violation?: DecisionFlowViolation;
};
