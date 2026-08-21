export type CatalogArea = 'sakae' | 'meieki' | 'osu';

export type StoreDiscoverySource =
  | 'manual-search'
  | 'official-store'
  | 'official-brand'
  | 'official-facility'
  | 'editorial'
  | 'user-submission'
  | 'google-maps-discovery';

export type StoreDiscoveryStatus = 'discovered' | 'promoted' | 'merged' | 'rejected';

/** Discovery-only input. It is never a canonical StoreEntity or StoreFact. */
export type StoreDiscoveryRecord = {
  discoveryId: string;
  source: StoreDiscoverySource;
  capturedAt: string;
  sourceUrl?: string;
  placeIdCandidate?: string;
  externalMapUrl?: string;
  nameHint?: string;
  status: StoreDiscoveryStatus;
};

export type StoreSourceReferenceKind =
  | 'official-store'
  | 'official-brand'
  | 'official-facility'
  | 'merchant-response'
  | 'editorial-note'
  | 'user-observation'
  | 'google-discovery';

export type StoreSourceReference = {
  sourceRefId: string;
  kind: StoreSourceReferenceKind;
  sourceUrl?: string;
  artifactId?: string;
  capturedAt: string;
  sourceIdentity?: string;
};

export type StoreFactKey =
  | 'displayName'
  | 'address'
  | 'area'
  | 'facilityName'
  | 'floor'
  | 'phone'
  | 'officialUrl'
  | 'currentStatus'
  | 'openingHours'
  | 'price'
  | 'reservationChannel';

export type StoreFactReviewStatus =
  | 'unreviewed'
  | 'provisional'
  | 'verified'
  | 'conflicting'
  | 'stale'
  | 'needs-review';

export type StoreFact = {
  factId: string;
  storeId: string;
  key: StoreFactKey;
  value: string;
  sourceRefIds: readonly string[];
  observedAt: string;
  reviewStatus: StoreFactReviewStatus;
  supersededByFactId?: string;
};

export type StoreEntityStatus =
  | 'draft'
  | 'listed'
  | 'merge-hold'
  | 'correction-pending'
  | 'suspended'
  | 'retired';

export type StoreMergeGuard = {
  unresolvedCandidateStoreIds: readonly string[];
  confirmedDistinctStoreIds: readonly string[];
};

export type StoreEntity = {
  storeId: string;
  area: CatalogArea;
  status: StoreEntityStatus;
  canonicalNameFactId: string;
  canonicalLocationFactId: string;
  discoveryRecordIds: readonly string[];
  mergeGuard: StoreMergeGuard;
};

export type MerchantCorrectionStatus = 'pending' | 'accepted' | 'rejected' | 'needs-review';

export type MerchantCorrection = {
  correctionId: string;
  storeId: string;
  targetFactKey: StoreFactKey;
  proposedValue: string;
  sourceRefId: string;
  receivedAt: string;
  status: MerchantCorrectionStatus;
  note: string;
};

export type StoreCatalogRecords = {
  discoveryRecords: readonly StoreDiscoveryRecord[];
  sourceReferences: readonly StoreSourceReference[];
  facts: readonly StoreFact[];
  entities: readonly StoreEntity[];
  merchantCorrections: readonly MerchantCorrection[];
};

export type StoreCatalogValidationIssue = {
  code: string;
  recordType: 'discovery' | 'source' | 'fact' | 'entity' | 'correction' | 'catalog';
  recordId?: string;
  message: string;
};

export type StoreCatalogValidationResult = {
  valid: boolean;
  issues: readonly StoreCatalogValidationIssue[];
};

export type StoreCatalogListingBlocker =
  | 'invalid-evaluated-as-of'
  | 'catalog-records-invalid'
  | 'entity-not-found'
  | 'invalid-store-id'
  | 'unsupported-area'
  | 'entity-suspended'
  | 'entity-retired'
  | 'active-merge-hold'
  | 'area-fact-conflict'
  | 'canonical-name-missing'
  | 'canonical-name-invalid'
  | 'canonical-name-source-ineligible'
  | 'canonical-location-missing'
  | 'canonical-location-invalid'
  | 'canonical-location-source-ineligible';

export type StoreCatalogListingReadiness = {
  storeId: string;
  listable: boolean;
  blockers: readonly StoreCatalogListingBlocker[];
  evaluatedAsOf: string;
};

export type StoreMergeReason =
  | 'same-place-id-candidate'
  | 'same-phone'
  | 'same-address'
  | 'same-official-url'
  | 'similar-store-name'
  | 'same-facility-same-brand'
  | 'entity-format-conflict'
  | 'human-confirmed-distinct';

export type StoreMergeAssessment = {
  leftStoreId: string;
  rightStoreId: string;
  status: 'distinct' | 'possible-duplicate' | 'merge-hold';
  reasons: readonly StoreMergeReason[];
};

export type DecisionPromotionBlocker =
  | 'catalog-not-listable'
  | 'entity-not-listed'
  | 'active-merge-hold'
  | 'canonical-identity-not-verified'
  | 'canonical-identity-source-ineligible';

export type DecisionPromotionResult = {
  storeId: string;
  status: 'ready-for-decision-review' | 'blocked';
  blockers: readonly DecisionPromotionBlocker[];
};

export type CatalogAreaCoverage = {
  area: CatalogArea;
  listedCount: number;
  target: number;
  remaining: number;
  ready: boolean;
};

export type ThreeAreaCatalogReadiness = {
  targetPerArea: number;
  totalTarget: number;
  totalListed: number;
  ready: boolean;
  coverage: readonly CatalogAreaCoverage[];
};

export type StoreCatalogCorrectionResult = {
  accepted: boolean;
  blockers: readonly string[];
  records: StoreCatalogRecords;
};
