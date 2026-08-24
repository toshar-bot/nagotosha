export type DecisionV3Step = 'home' | 'candidates' | 'detail' | 'compare' | 'decided';

export type PartyChoice = 'solo' | 'pair' | 'family' | 'group';
export type BudgetChoice = 'under1000' | 'under2000' | 'under4000' | 'any';
export type MoodChoice = 'hearty' | 'light' | 'relax' | 'new-experience';
export type AreaChoice = 'sakae' | 'meieki' | 'osu' | 'any';

export type DecisionV3Conditions = {
  party: PartyChoice;
  budget: BudgetChoice;
  mood: MoodChoice;
  area: AreaChoice;
};

export type DecisionV3ConditionDraft = Partial<DecisionV3Conditions>;

export type RefineChoice =
  | 'reservable'
  | 'wifi'
  | 'power'
  | 'private-room'
  | 'rain-safe'
  | 'long-stay'
  | 'smoke-free'
  | 'smoking-ok'
  | 'smoking-any'
  | 'tatami'
  | 'counter'
  | 'kids-ok'
  | 'parking'
  | 'terrace'
  | 'late-night'
  | 'quiet';

export type CompareAxis =
  | 'budget'
  | 'area'
  | 'access'
  | 'atmosphere'
  | 'smoking'
  | 'seats'
  | 'private-room'
  | 'tatami'
  | 'solo'
  | 'kids'
  | 'reservation'
  | 'long-stay'
  | 'wifi'
  | 'power'
  | 'rain-safe'
  | 'parking'
  | 'terrace'
  | 'late-night'
  | 'quiet';

export type CandidateActionType = 'official' | 'access' | 'reservation';

export type DemoActionAvailability = 'verified' | 'unknown' | 'unavailable';

export type CandidateAction = {
  type: CandidateActionType;
  label: string;
  href?: string;
  availability: DemoActionAvailability;
  verifiedAt?: string;
  source?: string;
};

export type DecisionV3CandidatePhotoAvailability = 'available' | 'unregistered';
export type DecisionV3CandidatePhotoRightsStatus = 'verified' | 'unverified';

export type DecisionV3CandidatePhoto = {
  src?: string;
  detailSrc?: string;
  alt: string;
  availability: DecisionV3CandidatePhotoAvailability;
  rightsStatus: DecisionV3CandidatePhotoRightsStatus;
};

export type DecisionV3KnownBoolean = boolean | 'unknown';
export type DecisionV3SmokingPolicy = 'smoke-free' | 'smoking-ok' | 'unknown';

/**
 * Operation-only fixture data used by the deterministic Decision v3 DEMO selector.
 * These values are not verified facts about real stores and must not be promoted
 * to Store Catalog or production candidate data.
 */
export type DecisionV3DemoSelectionProfile = {
  supportedPartyTypes: PartyChoice[];
  priceMin: number;
  priceMax: number;
  supportedPurposes: MoodChoice[];
  area: Exclude<AreaChoice, 'any'>;
  smokingPolicy: DecisionV3SmokingPolicy;
  privateRoom: DecisionV3KnownBoolean;
  tatami: DecisionV3KnownBoolean;
  counter: DecisionV3KnownBoolean;
  familyAndStroller: DecisionV3KnownBoolean;
  reservation: DecisionV3KnownBoolean;
  parking: DecisionV3KnownBoolean;
  rainFriendly: DecisionV3KnownBoolean;
  wifi: DecisionV3KnownBoolean;
  powerOutlet: DecisionV3KnownBoolean;
  terrace: DecisionV3KnownBoolean;
  lateNight: DecisionV3KnownBoolean;
  quiet: DecisionV3KnownBoolean;
  longStay: DecisionV3KnownBoolean;
};

export type VerifiedDetailText = {
  value: string;
  verifiedAt: string;
  source: string;
};

export type VerifiedDetailItem = {
  title: string;
  body: string;
  icon?: string;
  verifiedAt: string;
  source: string;
};

// Optional, display-only verified detail data. Never used by the selector or
// candidate-eligibility logic. Only present for candidates whose store facts
// have been verified against a primary source.
export type DecisionV3DetailInfo = {
  address?: VerifiedDetailText;
  hours?: VerifiedDetailText;
  phone?: VerifiedDetailText;
  seats?: VerifiedDetailText;
  reservation?: VerifiedDetailText;
  confirmedChips?: string[];
  highlights?: VerifiedDetailItem[];
};

export type DecisionV3Candidate = {
  id: string;
  neutralLabel: '候補A' | '候補B' | '候補C';
  name: string;
  area: string;
  budget: string;
  genre: string;
  tags: [string, string, string];
  points: [string, string, string];
  facts: {
    access: string;
    atmosphere: string;
    smoking: string;
    seats: string;
    privateRoom: string;
    tatami: string;
    solo: string;
    kids: string;
    reservation: string;
    longStay: string;
  };
  actions: CandidateAction[];
  photo: DecisionV3CandidatePhoto;
  detailInfo?: DecisionV3DetailInfo;
  demoSelection: DecisionV3DemoSelectionProfile;
};

export type CandidateSelectionResult =
  | {
      kind: 'matched';
      candidateIds: string[];
      reasonsByCandidateId: Record<string, string[]>;
    }
  | {
      kind: 'no-match';
      relaxationHints: string[];
    }
  | {
      kind: 'data-unavailable';
      missingFields: string[];
    };

export type DecisionV3Session = {
  version: 2;
  step: DecisionV3Step;
  conditions: DecisionV3ConditionDraft;
  refine: RefineChoice[];
  selectionResult: CandidateSelectionResult | null;
  compareIds: string[];
  compareOrder: string[];
  axes: CompareAxis[];
  chosenId: string | null;
  detailId: string | null;
};

export type DecisionV3Action =
  | { type: 'SET_CONDITION'; group: keyof DecisionV3Conditions; value: string }
  | { type: 'TOGGLE_REFINE'; value: RefineChoice }
  | { type: 'PREPARE_CANDIDATES'; candidateSource: 'demo' | 'formal' }
  | { type: 'GO'; step: DecisionV3Step; detailId?: string | null }
  | { type: 'TOGGLE_COMPARE'; candidateId: string }
  | { type: 'REORDER_COMPARE'; candidateId: string; direction: -1 | 1 }
  | { type: 'SET_COMPARE_ORDER'; ids: string[] }
  | { type: 'TOGGLE_AXIS'; axis: CompareAxis }
  | { type: 'REORDER_AXIS'; axis: CompareAxis; direction: -1 | 1 }
  | { type: 'CHOOSE'; candidateId: string }
  | { type: 'RESET_SEARCH' }
  | { type: 'RESTORE'; state: DecisionV3Session };

export type DecisionV3HistorySnapshot = {
  sessionVersion: 2;
  step: DecisionV3Step;
  selectedConditions: DecisionV3ConditionDraft;
  selectedPreferences: RefineChoice[];
  selectionResult: CandidateSelectionResult | null;
  comparedCandidateIds: string[];
  compareOrder: string[];
  comparisonAxes: CompareAxis[];
  selectedCandidateId: string | null;
  detailId: string | null;
  decidedCandidateId: string | null;
};
