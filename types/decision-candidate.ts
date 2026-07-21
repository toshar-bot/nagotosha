export type DecisionMode = 'food' | 'event' | 'outing';

export type DecisionPartyType = 'solo' | 'couple' | 'family' | 'group';
export type DecisionBudgetBand = 'under1000' | 'under2000' | 'under4000' | 'any';
export type DecisionMoodTag = 'hearty' | 'light' | 'relax' | 'newExperience';
export type DecisionCandidateStatus = 'available' | 'scheduled' | 'closed' | 'unknown';

export type VerifiedImageUsage = 'decorative' | 'evidence';
export type HistoricalState = boolean | 'unknown';
export type ImageEventYear = number | 'unknown';

export type VerifiedImage = {
  src: string;
  alt: string;
  usage: VerifiedImageUsage;
  caption: string;
  photographedAt?: string;
  eventYear?: ImageEventYear;
  isHistorical: HistoricalState;
  credit: string;
  sourceUrl: string;
  license: string;
  rightsVerified: boolean;
  verifiedAt: string;
};

export type DecisionRelationshipTarget =
  | {
      kind: 'article';
      articleId: number;
    }
  | {
      kind: 'roundup-item';
      articleId: number;
      itemId: string;
    };

export type DecisionCandidateVisual =
  | {
      kind: 'photo';
      image: VerifiedImage;
    }
  | {
      kind: 'category';
      categoryKey: string;
      alt: string;
    }
  | {
      kind: 'none';
    };

type DecisionLinkAction = {
  type: 'article' | 'official' | 'map';
  label: string;
  url: string;
  verifiedAt: string;
};

type DecisionReservationAction = {
  type: 'reservation';
  label: string;
  url: string;
  verifiedAt: string;
  availabilityConfirmed: true;
};

export type DecisionAction = DecisionLinkAction | DecisionReservationAction;

export type DecisionCandidate = {
  id: string;
  relationshipTarget: DecisionRelationshipTarget;
  decisionMode: DecisionMode;
  entityType: 'place' | 'event' | 'product' | 'guide';
  title: string;
  visual: DecisionCandidateVisual;
  partyTypes: DecisionPartyType[];
  budgetBand?: DecisionBudgetBand;
  moodTags: DecisionMoodTag[];
  area?: string;
  status: DecisionCandidateStatus;
  verifiedAt: string;
  actions: DecisionAction[];
};

export type DecisionModeAvailability = {
  mode: DecisionMode;
  candidateCount: number;
  minimumCandidateCount: number;
  enabled: boolean;
};

export type PreviewAssetAvailability = {
  mascotAssetAvailable: boolean;
};
