export type DecisionMode = 'food' | 'event' | 'outing';

export type DecisionPartyType = 'solo' | 'couple' | 'family' | 'group';
export type DecisionBudgetBand = 'under1000' | 'under2000' | 'under4000' | 'open' | 'any';
export type DecisionMoodTag =
  | 'hearty'
  | 'light'
  | 'relax'
  | 'newExperience'
  | 'quick'
  | 'spicy'
  | 'cafe';
export type DecisionCandidateStatus = 'available' | 'scheduled' | 'closed' | 'unknown';
export type DecisionReservationNeed = 'not-needed' | 'optional' | 'unavailable';
export type DecisionReservationAvailability = 'channel-available' | 'unavailable' | 'not-confirmed';
export type DecisionTimeOfDay = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'dinner';
export type DecisionWeatherFit = 'indoor' | 'outdoor' | 'mixed';

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
  /** Confirms only that the booking channel works, never a slot for a date, time, or party size. */
  availabilityConfirmed: true;
  availabilityScope: 'booking-channel';
  availabilityMeaning: 'channel-available-not-slot-guarantee';
};

export type DecisionAction = DecisionLinkAction | DecisionReservationAction;

export type DecisionOpeningHours = {
  opens: string;
  closes: string;
  lastOrder?: string;
};

export type DecisionEvidenceKind =
  | 'official-fact'
  | 'editorial-classification'
  | 'derived-fact';

export type DecisionOfficialFactField =
  | 'currentStatus'
  | 'openingHours'
  | 'price'
  | 'officialUrl'
  | 'reservationChannel'
  | 'reservationUnavailable'
  | 'location'
  | 'nearestStation'
  | 'walkingMinutes'
  | 'seats';

export type DecisionEditorialClassificationField =
  | 'partyTypes'
  | 'budgetBand'
  | 'moodTags'
  | 'reservationNeed';

export type DecisionDerivedFactField = 'timeOfDay' | 'weatherFit';
export type DecisionEvidenceSourceType =
  | 'official-site'
  | 'official-facility'
  | 'official-booking'
  | 'official-release';

type DecisionEvidenceBase = {
  id: string;
  candidateId: string;
  kind: DecisionEvidenceKind;
};

export type DecisionOfficialFactEvidence = DecisionEvidenceBase & {
  kind: 'official-fact';
  field: DecisionOfficialFactField;
  sourceUrl: string;
  sourceType: DecisionEvidenceSourceType;
  verifiedAt: string;
  /** `verifiedAt` is when the source was accessed, not a publication or modified date. */
  verificationMethod: 'source-accessed-at';
  note?: string;
};

export type DecisionEditorialClassificationEvidence = DecisionEvidenceBase & {
  kind: 'editorial-classification';
  field: DecisionEditorialClassificationField;
  approved: true;
  approvedBy: 'user';
  approvedAt: string;
  rationale: string;
  supportingEvidenceIds: string[];
};

export type DecisionDerivedFactEvidence = DecisionEvidenceBase & {
  kind: 'derived-fact';
  field: DecisionDerivedFactField;
  derivedFromEvidenceIds: string[];
  derivationRule: string;
  verifiedAt: string;
};

export type DecisionCandidateEvidence =
  | DecisionOfficialFactEvidence
  | DecisionEditorialClassificationEvidence
  | DecisionDerivedFactEvidence;

export type DecisionCandidate = {
  id: string;
  relationshipTarget: DecisionRelationshipTarget;
  decisionMode: DecisionMode;
  entityType: 'place' | 'event' | 'product' | 'guide';
  displayName: string;
  visual: DecisionCandidateVisual;
  partyTypes: DecisionPartyType[];
  budgetBand: DecisionBudgetBand;
  moodTags: DecisionMoodTag[];
  reservationNeed: DecisionReservationNeed;
  reservationAvailability: DecisionReservationAvailability;
  area: string;
  location?: string;
  nearestStation: string;
  walkingMinutes?: number;
  openingHours: DecisionOpeningHours;
  timeOfDay: DecisionTimeOfDay[];
  weatherFit: DecisionWeatherFit;
  /** Means the store's operating existence was verified, not that it is open right now. */
  currentStatus: DecisionCandidateStatus;
  statusVerifiedAt: string;
  openingHoursVerifiedAt: string;
  priceVerifiedAt: string;
  actions: DecisionAction[];
  evidenceIds: string[];
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
