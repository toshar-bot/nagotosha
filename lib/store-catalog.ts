import {
  STORE_CATALOG_SOURCE_POLICY,
  isStoreSourceCanonicalEligible,
} from '../data/store-catalog-source-policy';
import type {
  CatalogArea,
  CatalogAreaCoverage,
  DecisionPromotionBlocker,
  DecisionPromotionResult,
  MerchantCorrection,
  StoreCatalogCorrectionResult,
  StoreCatalogListingBlocker,
  StoreCatalogListingReadiness,
  StoreCatalogRecords,
  StoreCatalogValidationIssue,
  StoreCatalogValidationResult,
  StoreDiscoveryRecord,
  StoreEntity,
  StoreFact,
  StoreFactKey,
  StoreMergeAssessment,
  StoreMergeReason,
  StoreSourceReference,
  ThreeAreaCatalogReadiness,
} from '../types/store-catalog';

const ISO_INSTANT_PATTERN = /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{3})?Z$/;
const STABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STORE_FACT_KEYS = new Set<StoreFactKey>([
  'displayName',
  'address',
  'area',
  'facilityName',
  'floor',
  'phone',
  'officialUrl',
  'currentStatus',
  'openingHours',
  'price',
  'reservationChannel',
]);
const DISCOVERY_SOURCES = new Set([
  'manual-search',
  'official-store',
  'official-brand',
  'official-facility',
  'editorial',
  'user-submission',
  'google-maps-discovery',
]);
const DISCOVERY_STATUSES = new Set(['discovered', 'promoted', 'merged', 'rejected']);
const SOURCE_REFERENCE_KINDS = new Set([
  'official-store',
  'official-brand',
  'official-facility',
  'merchant-response',
  'editorial-note',
  'user-observation',
  'google-discovery',
]);
const FACT_REVIEW_STATUSES = new Set([
  'unreviewed',
  'provisional',
  'verified',
  'conflicting',
  'stale',
  'needs-review',
]);
const ENTITY_STATUSES = new Set([
  'draft',
  'listed',
  'merge-hold',
  'correction-pending',
  'suspended',
  'retired',
]);
const CORRECTION_STATUSES = new Set(['pending', 'accepted', 'rejected', 'needs-review']);
const DISCOVERY_ALLOWED_FIELDS = new Set([
  'discoveryId',
  'source',
  'capturedAt',
  'sourceUrl',
  'placeIdCandidate',
  'externalMapUrl',
  'nameHint',
  'status',
]);
const SOURCE_REFERENCE_ALLOWED_FIELDS = new Set([
  'sourceRefId',
  'kind',
  'sourceUrl',
  'artifactId',
  'capturedAt',
  'sourceIdentity',
]);
const NON_CURRENT_IDENTITY_STATUSES = new Set(['conflicting', 'stale', 'needs-review']);

export function validateStoreCatalogRecords(
  records: StoreCatalogRecords,
): StoreCatalogValidationResult {
  const issues: StoreCatalogValidationIssue[] = [];
  const discoveryById = uniqueRecordMap(
    records.discoveryRecords,
    'discoveryId',
    'discovery',
    issues,
  );
  const sourceById = uniqueRecordMap(
    records.sourceReferences,
    'sourceRefId',
    'source',
    issues,
  );
  const factById = uniqueRecordMap(records.facts, 'factId', 'fact', issues);
  const entityById = uniqueRecordMap(records.entities, 'storeId', 'entity', issues);
  uniqueRecordMap(records.merchantCorrections, 'correctionId', 'correction', issues);

  for (const record of records.discoveryRecords) {
    validateDiscoveryRecord(record, issues);
  }
  for (const source of records.sourceReferences) {
    validateSourceReference(source, issues);
  }
  for (const fact of records.facts) {
    validateStoreFact(fact, sourceById, factById, entityById, issues);
  }
  for (const entity of records.entities) {
    validateStoreEntity(entity, discoveryById, factById, issues);
  }
  for (const correction of records.merchantCorrections) {
    validateMerchantCorrection(correction, sourceById, entityById, issues);
  }

  return { valid: issues.length === 0, issues };
}

export function getStoreCatalogListingReadiness(
  records: StoreCatalogRecords,
  storeId: string,
  evaluatedAsOf: string,
): StoreCatalogListingReadiness {
  const blockers: StoreCatalogListingBlocker[] = [];
  const asOf = parseISOInstant(evaluatedAsOf);
  if (asOf === undefined) blockers.push('invalid-evaluated-as-of');

  const validation = validateStoreCatalogRecords(records);
  if (!validation.valid) blockers.push('catalog-records-invalid');

  const matches = records.entities.filter((entity) => entity.storeId === storeId);
  const entity = matches.length === 1 ? matches[0] : undefined;
  if (!entity) blockers.push('entity-not-found');
  if (!isValidStableId(storeId)) blockers.push('invalid-store-id');

  if (entity) {
    if (!STORE_CATALOG_SOURCE_POLICY.areas.includes(entity.area)) {
      blockers.push('unsupported-area');
    }
    if (entity.status === 'suspended') blockers.push('entity-suspended');
    if (entity.status === 'retired') blockers.push('entity-retired');
    if (hasActiveMergeHold(entity)) blockers.push('active-merge-hold');

    blockers.push(...evaluateCanonicalIdentity(
      records,
      entity,
      entity.canonicalNameFactId,
      'displayName',
      asOf,
      'canonical-name-missing',
      'canonical-name-invalid',
      'canonical-name-source-ineligible',
    ));
    blockers.push(...evaluateCanonicalIdentity(
      records,
      entity,
      entity.canonicalLocationFactId,
      'address',
      asOf,
      'canonical-location-missing',
      'canonical-location-invalid',
      'canonical-location-source-ineligible',
    ));
  }

  const uniqueBlockers = Array.from(new Set(blockers));
  return {
    storeId,
    listable: uniqueBlockers.length === 0,
    blockers: uniqueBlockers,
    evaluatedAsOf,
  };
}

export function getListableStores(
  records: StoreCatalogRecords,
  evaluatedAsOf: string,
): readonly StoreEntity[] {
  return records.entities.filter((entity) => (
    getStoreCatalogListingReadiness(records, entity.storeId, evaluatedAsOf).listable
  ));
}

export function getStoreCanonicalFact(
  records: StoreCatalogRecords,
  storeId: string,
  target: 'name' | 'location',
): StoreFact | undefined {
  const entityMatches = records.entities.filter((entity) => entity.storeId === storeId);
  if (entityMatches.length !== 1) return undefined;
  const factId = target === 'name'
    ? entityMatches[0].canonicalNameFactId
    : entityMatches[0].canonicalLocationFactId;
  const expectedKey: StoreFactKey = target === 'name' ? 'displayName' : 'address';
  const matches = records.facts.filter((fact) => fact.factId === factId);
  if (matches.length !== 1) return undefined;
  const fact = matches[0];
  return fact.storeId === storeId && fact.key === expectedKey ? fact : undefined;
}

export function getCatalogAreaCoverage(
  records: StoreCatalogRecords,
  evaluatedAsOf: string,
): readonly CatalogAreaCoverage[] {
  const listable = getListableStores(records, evaluatedAsOf);
  return STORE_CATALOG_SOURCE_POLICY.areas.map((area) => {
    const listedCount = listable.filter((entity) => entity.area === area).length;
    return {
      area,
      listedCount,
      target: STORE_CATALOG_SOURCE_POLICY.targetPerArea,
      remaining: Math.max(0, STORE_CATALOG_SOURCE_POLICY.targetPerArea - listedCount),
      ready: listedCount >= STORE_CATALOG_SOURCE_POLICY.targetPerArea,
    };
  });
}

export function getThreeAreaCatalogReadiness(
  records: StoreCatalogRecords,
  evaluatedAsOf: string,
): ThreeAreaCatalogReadiness {
  const coverage = getCatalogAreaCoverage(records, evaluatedAsOf);
  const totalListed = coverage.reduce((sum, entry) => sum + entry.listedCount, 0);
  return {
    targetPerArea: STORE_CATALOG_SOURCE_POLICY.targetPerArea,
    totalTarget: STORE_CATALOG_SOURCE_POLICY.totalTarget,
    totalListed,
    ready: coverage.every((entry) => entry.ready)
      && totalListed >= STORE_CATALOG_SOURCE_POLICY.totalTarget,
    coverage,
  };
}

/** Returns a hold/assessment only. This module deliberately exposes no merge executor. */
export function assessStoreMergeCandidate(
  records: StoreCatalogRecords,
  leftStoreId: string,
  rightStoreId: string,
): StoreMergeAssessment {
  const left = records.entities.find((entity) => entity.storeId === leftStoreId);
  const right = records.entities.find((entity) => entity.storeId === rightStoreId);
  const reasons: StoreMergeReason[] = [];

  if (!left || !right || leftStoreId === rightStoreId) {
    return {
      leftStoreId,
      rightStoreId,
      status: 'merge-hold',
      reasons: ['entity-format-conflict'],
    };
  }

  const humanConfirmedDistinct = (
    left.mergeGuard.confirmedDistinctStoreIds.includes(rightStoreId)
    && right.mergeGuard.confirmedDistinctStoreIds.includes(leftStoreId)
  );
  if (humanConfirmedDistinct) {
    return {
      leftStoreId,
      rightStoreId,
      status: 'distinct',
      reasons: ['human-confirmed-distinct'],
    };
  }

  const leftPlaceIds = getPlaceIdCandidates(records, left);
  const rightPlaceIds = getPlaceIdCandidates(records, right);
  const samePlaceId = leftPlaceIds.some((placeId) => rightPlaceIds.includes(placeId));
  if (samePlaceId) reasons.push('same-place-id-candidate');

  const leftName = comparableFactValue(records, leftStoreId, 'displayName');
  const rightName = comparableFactValue(records, rightStoreId, 'displayName');
  const entityFormatConflict = hasEntityFormatConflict(leftName, rightName);
  if (samePlaceId && entityFormatConflict) reasons.push('entity-format-conflict');

  if (sameComparableFact(records, leftStoreId, rightStoreId, 'phone', normalizePhone)) {
    reasons.push('same-phone');
  }
  if (sameComparableFact(records, leftStoreId, rightStoreId, 'address', normalizeText)) {
    reasons.push('same-address');
  }
  if (sameComparableFact(records, leftStoreId, rightStoreId, 'officialUrl', normalizeUrl)) {
    reasons.push('same-official-url');
  }
  if (areStoreNamesSimilar(leftName, rightName)) reasons.push('similar-store-name');

  const sameFacility = sameComparableFact(
    records,
    leftStoreId,
    rightStoreId,
    'facilityName',
    normalizeText,
  );
  if (sameFacility && haveSameBrandStem(leftName, rightName)) {
    reasons.push('same-facility-same-brand');
  }

  const uniqueReasons = Array.from(new Set(reasons));
  return {
    leftStoreId,
    rightStoreId,
    status: samePlaceId ? 'merge-hold' : uniqueReasons.length > 0 ? 'possible-duplicate' : 'distinct',
    reasons: uniqueReasons,
  };
}

export function stageMerchantCorrection(
  records: StoreCatalogRecords,
  correction: MerchantCorrection,
): StoreCatalogCorrectionResult {
  const blockers = validateCorrectionForStaging(records, correction);
  if (blockers.length > 0) {
    return { accepted: false, blockers, records };
  }

  const entities = records.entities.map((entity) => (
    entity.storeId === correction.storeId
      ? {
          ...entity,
          status: entity.status === 'suspended' || entity.status === 'retired'
            ? entity.status
            : 'correction-pending' as const,
        }
      : entity
  ));
  const facts = records.facts.map((fact) => (
    fact.storeId === correction.storeId
      && fact.key === correction.targetFactKey
      && !fact.supersededByFactId
      ? { ...fact, reviewStatus: 'needs-review' as const }
      : fact
  ));

  return {
    accepted: true,
    blockers: [],
    records: {
      ...records,
      entities,
      facts,
      merchantCorrections: [...records.merchantCorrections, correction],
    },
  };
}

export function resolveMerchantCorrection(
  records: StoreCatalogRecords,
  correctionId: string,
  verifiedReplacementFact: StoreFact,
): StoreCatalogCorrectionResult {
  const correction = records.merchantCorrections.find((entry) => entry.correctionId === correctionId);
  const blockers: string[] = [];
  if (!correction || !['pending', 'needs-review'].includes(correction.status)) {
    blockers.push('correction-not-pending');
  }
  if (records.facts.some((fact) => fact.factId === verifiedReplacementFact.factId)) {
    blockers.push('replacement-fact-id-duplicate');
  }
  if (correction && (
    verifiedReplacementFact.storeId !== correction.storeId
    || verifiedReplacementFact.key !== correction.targetFactKey
    || verifiedReplacementFact.reviewStatus !== 'verified'
  )) {
    blockers.push('replacement-fact-mismatch');
  }
  if (!parseISOInstant(verifiedReplacementFact.observedAt)
    || !verifiedReplacementFact.value.trim()
    || verifiedReplacementFact.sourceRefIds.length === 0
    || verifiedReplacementFact.sourceRefIds.some((sourceRefId) => (
      !records.sourceReferences.some((source) => source.sourceRefId === sourceRefId)
    ))) {
    blockers.push('replacement-fact-invalid');
  }
  if (!hasCanonicalSource(records, verifiedReplacementFact, Number.POSITIVE_INFINITY)) {
    blockers.push('replacement-source-ineligible');
  }
  if (blockers.length > 0 || !correction) {
    return { accepted: false, blockers: Array.from(new Set(blockers)), records };
  }

  const entity = records.entities.find((entry) => entry.storeId === correction.storeId);
  const canonicalTargetId = correction.targetFactKey === 'displayName'
    ? entity?.canonicalNameFactId
    : correction.targetFactKey === 'address'
      ? entity?.canonicalLocationFactId
      : undefined;
  const oldFact = records.facts.find((fact) => (
    fact.storeId === correction.storeId
    && fact.key === correction.targetFactKey
    && !fact.supersededByFactId
    && (canonicalTargetId === undefined || fact.factId === canonicalTargetId)
  ));
  if (!oldFact) {
    return { accepted: false, blockers: ['target-fact-not-found'], records };
  }

  const facts = [
    ...records.facts.map((fact) => (
      fact.factId === oldFact.factId
        ? { ...fact, supersededByFactId: verifiedReplacementFact.factId }
        : fact
    )),
    verifiedReplacementFact,
  ];
  const entities = records.entities.map((entry) => {
    if (entry.storeId !== correction.storeId) return entry;
    return {
      ...entry,
      canonicalNameFactId: entry.canonicalNameFactId === oldFact.factId
        ? verifiedReplacementFact.factId
        : entry.canonicalNameFactId,
      canonicalLocationFactId: entry.canonicalLocationFactId === oldFact.factId
        ? verifiedReplacementFact.factId
        : entry.canonicalLocationFactId,
    };
  });
  const merchantCorrections = records.merchantCorrections.map((entry) => (
    entry.correctionId === correctionId ? { ...entry, status: 'accepted' as const } : entry
  ));

  return {
    accepted: true,
    blockers: [],
    records: { ...records, facts, entities, merchantCorrections },
  };
}

/** Pre-Decision boundary only; existing freshness/governance/matching gates remain authoritative. */
export function getDecisionPromotionResult(
  records: StoreCatalogRecords,
  storeId: string,
  evaluatedAsOf: string,
): DecisionPromotionResult {
  const blockers: DecisionPromotionBlocker[] = [];
  const listing = getStoreCatalogListingReadiness(records, storeId, evaluatedAsOf);
  const entity = records.entities.find((entry) => entry.storeId === storeId);
  if (!listing.listable || !entity) blockers.push('catalog-not-listable');
  if (entity && entity.status !== 'listed') blockers.push('entity-not-listed');
  if (entity && hasActiveMergeHold(entity)) blockers.push('active-merge-hold');

  if (entity) {
    const identityFacts = [
      getStoreCanonicalFact(records, storeId, 'name'),
      getStoreCanonicalFact(records, storeId, 'location'),
    ];
    if (identityFacts.some((fact) => !fact || fact.reviewStatus !== 'verified')) {
      blockers.push('canonical-identity-not-verified');
    }
    if (identityFacts.some((fact) => (
      !fact || !hasCanonicalSource(records, fact, Number.POSITIVE_INFINITY)
    ))) {
      blockers.push('canonical-identity-source-ineligible');
    }
  }

  const uniqueBlockers = Array.from(new Set(blockers));
  return {
    storeId,
    status: uniqueBlockers.length === 0 ? 'ready-for-decision-review' : 'blocked',
    blockers: uniqueBlockers,
  };
}

function validateDiscoveryRecord(
  record: StoreDiscoveryRecord,
  issues: StoreCatalogValidationIssue[],
): void {
  if (!isValidStableId(record.discoveryId)) {
    addIssue(issues, 'invalid-discovery-id', 'discovery', record.discoveryId, 'discoveryId is invalid');
  }
  if (!DISCOVERY_SOURCES.has(record.source) || !DISCOVERY_STATUSES.has(record.status)) {
    addIssue(issues, 'invalid-discovery-enum', 'discovery', record.discoveryId, 'discovery source or status is invalid');
  }
  if (parseISOInstant(record.capturedAt) === undefined) {
    addIssue(issues, 'invalid-captured-at', 'discovery', record.discoveryId, 'capturedAt must be an ISO instant');
  }
  if (record.sourceUrl !== undefined && !isSafeExternalUrl(record.sourceUrl)) {
    addIssue(issues, 'invalid-source-url', 'discovery', record.discoveryId, 'sourceUrl must be HTTP(S)');
  }
  if (record.externalMapUrl !== undefined && !isSafeExternalUrl(record.externalMapUrl)) {
    addIssue(issues, 'invalid-map-url', 'discovery', record.discoveryId, 'externalMapUrl must be HTTP(S)');
  }
  const unknownFields = Object.keys(record).filter((key) => !DISCOVERY_ALLOWED_FIELDS.has(key));
  for (const field of unknownFields) {
    addIssue(issues, 'discovery-field-not-allowed', 'discovery', record.discoveryId, `field is not allowed: ${field}`);
  }
  if (record.source === 'google-maps-discovery') {
    const googleAllowed = new Set(STORE_CATALOG_SOURCE_POLICY.googleDiscoveryAllowedFields);
    for (const field of Object.keys(record)) {
      if (!googleAllowed.has(field)) {
        addIssue(issues, 'google-discovery-field-not-allowed', 'discovery', record.discoveryId, `Google discovery field is not allowed: ${field}`);
      }
    }
    for (const field of STORE_CATALOG_SOURCE_POLICY.googleDiscoveryForbiddenFields) {
      if (field in (record as unknown as Record<string, unknown>)) {
        addIssue(issues, 'google-scraped-fact-forbidden', 'discovery', record.discoveryId, `Google scraped field is forbidden: ${field}`);
      }
    }
    if (!record.placeIdCandidate?.trim() && !record.externalMapUrl?.trim()) {
      addIssue(issues, 'google-discovery-pointer-missing', 'discovery', record.discoveryId, 'Google discovery requires a placeId candidate or external map URL');
    }
  }
}

function validateSourceReference(
  source: StoreSourceReference,
  issues: StoreCatalogValidationIssue[],
): void {
  if (!isValidStableId(source.sourceRefId)) {
    addIssue(issues, 'invalid-source-id', 'source', source.sourceRefId, 'sourceRefId is invalid');
  }
  if (!SOURCE_REFERENCE_KINDS.has(source.kind)) {
    addIssue(issues, 'invalid-source-kind', 'source', source.sourceRefId, 'source kind is invalid');
  }
  if (parseISOInstant(source.capturedAt) === undefined) {
    addIssue(issues, 'invalid-captured-at', 'source', source.sourceRefId, 'capturedAt must be an ISO instant');
  }
  if (source.sourceUrl !== undefined && !isSafeExternalUrl(source.sourceUrl)) {
    addIssue(issues, 'invalid-source-url', 'source', source.sourceRefId, 'sourceUrl must be HTTP(S)');
  }
  if (source.artifactId !== undefined && !source.artifactId.trim()) {
    addIssue(issues, 'invalid-artifact-id', 'source', source.sourceRefId, 'artifactId must not be blank');
  }
  if (source.sourceIdentity !== undefined && !source.sourceIdentity.trim()) {
    addIssue(issues, 'invalid-source-identity', 'source', source.sourceRefId, 'sourceIdentity must not be blank');
  }
  for (const field of Object.keys(source)) {
    if (!SOURCE_REFERENCE_ALLOWED_FIELDS.has(field)) {
      addIssue(issues, 'source-field-not-allowed', 'source', source.sourceRefId, `source field is not allowed: ${field}`);
    }
  }
}

function validateStoreFact(
  fact: StoreFact,
  sourceById: ReadonlyMap<string, StoreSourceReference>,
  factById: ReadonlyMap<string, StoreFact>,
  entityById: ReadonlyMap<string, StoreEntity>,
  issues: StoreCatalogValidationIssue[],
): void {
  if (!isValidStableId(fact.factId)) {
    addIssue(issues, 'invalid-fact-id', 'fact', fact.factId, 'factId is invalid');
  }
  if (!entityById.has(fact.storeId)) {
    addIssue(issues, 'fact-store-missing', 'fact', fact.factId, 'fact references a missing storeId');
  }
  if (!STORE_FACT_KEYS.has(fact.key) || !fact.value.trim()) {
    addIssue(issues, 'invalid-fact', 'fact', fact.factId, 'fact key and value must be valid');
  }
  if (!FACT_REVIEW_STATUSES.has(fact.reviewStatus)) {
    addIssue(issues, 'invalid-review-status', 'fact', fact.factId, 'fact reviewStatus is invalid');
  }
  if (parseISOInstant(fact.observedAt) === undefined) {
    addIssue(issues, 'invalid-observed-at', 'fact', fact.factId, 'observedAt must be an ISO instant');
  }
  if (fact.sourceRefIds.length === 0 || hasDuplicates(fact.sourceRefIds)) {
    addIssue(issues, 'invalid-fact-sources', 'fact', fact.factId, 'fact requires unique source references');
  }
  for (const sourceRefId of fact.sourceRefIds) {
    const source = sourceById.get(sourceRefId);
    if (!source) {
      addIssue(issues, 'fact-source-missing', 'fact', fact.factId, `missing source: ${sourceRefId}`);
    } else if (source.kind === 'google-discovery') {
      addIssue(issues, 'google-discovery-fact-forbidden', 'fact', fact.factId, 'Google discovery cannot be stored as a StoreFact source');
    }
  }
  if (fact.reviewStatus === 'verified' && fact.sourceRefIds.some((sourceRefId) => (
    sourceById.get(sourceRefId)?.kind === 'user-observation'
  ))) {
    addIssue(issues, 'user-observation-verified-fact-forbidden', 'fact', fact.factId, 'Community observations cannot directly become verified Catalog facts');
  }
  if (fact.key === 'area' && !isCatalogArea(fact.value)) {
    addIssue(issues, 'invalid-area-fact', 'fact', fact.factId, 'area fact must use an MVP area');
  }
  if (fact.key === 'officialUrl' && !isSafeExternalUrl(fact.value)) {
    addIssue(issues, 'invalid-official-url', 'fact', fact.factId, 'officialUrl fact must be HTTP(S)');
  }
  if (fact.supersededByFactId !== undefined) {
    const replacement = factById.get(fact.supersededByFactId);
    if (!replacement
      || replacement.factId === fact.factId
      || replacement.storeId !== fact.storeId
      || replacement.key !== fact.key) {
      addIssue(issues, 'invalid-supersession', 'fact', fact.factId, 'supersededByFactId must reference a replacement fact for the same store and key');
    }
  }
}

function validateStoreEntity(
  entity: StoreEntity,
  discoveryById: ReadonlyMap<string, StoreDiscoveryRecord>,
  factById: ReadonlyMap<string, StoreFact>,
  issues: StoreCatalogValidationIssue[],
): void {
  if (!isValidStableId(entity.storeId)) {
    addIssue(issues, 'invalid-store-id', 'entity', entity.storeId, 'storeId is invalid');
  }
  if (!isCatalogArea(entity.area)) {
    addIssue(issues, 'unsupported-area', 'entity', entity.storeId, 'entity area is unsupported');
  }
  if (!ENTITY_STATUSES.has(entity.status)) {
    addIssue(issues, 'invalid-entity-status', 'entity', entity.storeId, 'entity status is invalid');
  }
  if (hasDuplicates(entity.discoveryRecordIds)
    || entity.discoveryRecordIds.some((id) => !discoveryById.has(id))) {
    addIssue(issues, 'invalid-discovery-references', 'entity', entity.storeId, 'entity discovery references must be unique and existing');
  }
  for (const [factId, expectedKey] of [
    [entity.canonicalNameFactId, 'displayName'],
    [entity.canonicalLocationFactId, 'address'],
  ] as const) {
    const fact = factById.get(factId);
    if (!fact || fact.storeId !== entity.storeId || fact.key !== expectedKey) {
      addIssue(issues, 'invalid-canonical-fact', 'entity', entity.storeId, `${expectedKey} canonical fact is invalid`);
    }
  }
  const guardIds = [
    ...entity.mergeGuard.unresolvedCandidateStoreIds,
    ...entity.mergeGuard.confirmedDistinctStoreIds,
  ];
  if (hasDuplicates(entity.mergeGuard.unresolvedCandidateStoreIds)
    || hasDuplicates(entity.mergeGuard.confirmedDistinctStoreIds)
    || guardIds.some((id) => !isValidStableId(id) || id === entity.storeId)) {
    addIssue(issues, 'invalid-merge-guard', 'entity', entity.storeId, 'merge guard IDs must be unique valid IDs for other stores');
  }
}

function validateMerchantCorrection(
  correction: MerchantCorrection,
  sourceById: ReadonlyMap<string, StoreSourceReference>,
  entityById: ReadonlyMap<string, StoreEntity>,
  issues: StoreCatalogValidationIssue[],
): void {
  const source = sourceById.get(correction.sourceRefId);
  if (!isValidStableId(correction.correctionId)
    || !entityById.has(correction.storeId)
    || !STORE_FACT_KEYS.has(correction.targetFactKey)
    || !correction.proposedValue.trim()
    || !correction.note.trim()
    || parseISOInstant(correction.receivedAt) === undefined
    || !CORRECTION_STATUSES.has(correction.status)
    || source?.kind !== 'merchant-response') {
    addIssue(issues, 'invalid-merchant-correction', 'correction', correction.correctionId, 'merchant correction must be complete and reference a merchant response source');
  }
}

function evaluateCanonicalIdentity(
  records: StoreCatalogRecords,
  entity: StoreEntity,
  factId: string,
  expectedKey: 'displayName' | 'address',
  asOf: number | undefined,
  missingCode: StoreCatalogListingBlocker,
  invalidCode: StoreCatalogListingBlocker,
  sourceCode: StoreCatalogListingBlocker,
): StoreCatalogListingBlocker[] {
  if (!factId.trim()) return [missingCode];
  const matches = records.facts.filter((fact) => fact.factId === factId);
  if (matches.length === 0) return [missingCode];
  if (matches.length !== 1) return [invalidCode];
  const fact = matches[0];
  const observedAt = parseISOInstant(fact.observedAt);
  if (
    fact.storeId !== entity.storeId
    || fact.key !== expectedKey
    || !fact.value.trim()
    || fact.supersededByFactId !== undefined
    || NON_CURRENT_IDENTITY_STATUSES.has(fact.reviewStatus)
    || observedAt === undefined
    || asOf === undefined
    || observedAt > asOf
  ) {
    return [invalidCode];
  }
  return hasCanonicalSource(records, fact, asOf) ? [] : [sourceCode];
}

function hasCanonicalSource(
  records: StoreCatalogRecords,
  fact: StoreFact,
  asOf: number,
): boolean {
  return fact.sourceRefIds.some((sourceRefId) => {
    const source = records.sourceReferences.find((entry) => entry.sourceRefId === sourceRefId);
    const capturedAt = source ? parseISOInstant(source.capturedAt) : undefined;
    return Boolean(
      source
      && capturedAt !== undefined
      && capturedAt <= asOf
      && isStoreSourceCanonicalEligible(fact.key, source.kind),
    );
  });
}

function validateCorrectionForStaging(
  records: StoreCatalogRecords,
  correction: MerchantCorrection,
): string[] {
  const blockers: string[] = [];
  if (records.merchantCorrections.some((entry) => entry.correctionId === correction.correctionId)) {
    blockers.push('correction-id-duplicate');
  }
  const entity = records.entities.find((entry) => entry.storeId === correction.storeId);
  if (!entity) blockers.push('store-not-found');
  if (!isValidStableId(correction.correctionId)
    || !correction.proposedValue.trim()
    || !correction.note.trim()
    || parseISOInstant(correction.receivedAt) === undefined
    || !['pending', 'needs-review'].includes(correction.status)) {
    blockers.push('correction-invalid');
  }
  const source = records.sourceReferences.find((entry) => entry.sourceRefId === correction.sourceRefId);
  if (source?.kind !== 'merchant-response') blockers.push('merchant-source-invalid');
  if (!records.facts.some((fact) => (
    fact.storeId === correction.storeId
    && fact.key === correction.targetFactKey
    && !fact.supersededByFactId
  ))) {
    blockers.push('target-fact-not-found');
  }
  return Array.from(new Set(blockers));
}

function hasActiveMergeHold(entity: StoreEntity): boolean {
  if (entity.status === 'merge-hold') return true;
  return entity.mergeGuard.unresolvedCandidateStoreIds.some((candidateId) => (
    !entity.mergeGuard.confirmedDistinctStoreIds.includes(candidateId)
  ));
}

function getPlaceIdCandidates(records: StoreCatalogRecords, entity: StoreEntity): string[] {
  return entity.discoveryRecordIds.flatMap((discoveryId) => {
    const discovery = records.discoveryRecords.find((entry) => entry.discoveryId === discoveryId);
    return discovery?.placeIdCandidate?.trim() ? [discovery.placeIdCandidate.trim()] : [];
  });
}

function comparableFactValue(
  records: StoreCatalogRecords,
  storeId: string,
  key: StoreFactKey,
): string | undefined {
  const values = records.facts.filter((fact) => (
    fact.storeId === storeId
    && fact.key === key
    && !fact.supersededByFactId
    && !['conflicting', 'needs-review'].includes(fact.reviewStatus)
    && fact.value.trim()
  ));
  return values.length === 1 ? values[0].value : undefined;
}

function sameComparableFact(
  records: StoreCatalogRecords,
  leftStoreId: string,
  rightStoreId: string,
  key: StoreFactKey,
  normalize: (value: string) => string,
): boolean {
  const left = comparableFactValue(records, leftStoreId, key);
  const right = comparableFactValue(records, rightStoreId, key);
  return Boolean(left && right && normalize(left) && normalize(left) === normalize(right));
}

function hasEntityFormatConflict(leftName?: string, rightName?: string): boolean {
  if (!leftName || !rightName) return false;
  const isVariant = (value: string) => /take\s*out|takeout|テイクアウト|持ち帰り/i.test(value);
  return isVariant(leftName) !== isVariant(rightName);
}

function areStoreNamesSimilar(leftName?: string, rightName?: string): boolean {
  if (!leftName || !rightName) return false;
  const left = normalizeText(leftName);
  const right = normalizeText(rightName);
  if (!left || !right) return false;
  if (left === right) return true;
  const leftStem = storeNameStem(leftName);
  const rightStem = storeNameStem(rightName);
  if (leftStem.length >= 2 && leftStem === rightStem) return true;
  const shorter = left.length <= right.length ? left : right;
  const longer = left.length > right.length ? left : right;
  return shorter.length >= 4 && longer.includes(shorter);
}

function haveSameBrandStem(leftName?: string, rightName?: string): boolean {
  if (!leftName || !rightName) return false;
  const left = storeNameStem(leftName);
  const right = storeNameStem(rightName);
  return left.length >= 2 && left === right;
}

function storeNameStem(value: string): string {
  return normalizeText(value)
    .replace(/(栄|名駅|名古屋|大須|店|支店|テイクアウト|takeout).*$/i, '');
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeUrl(value: string): string {
  return value.trim().toLowerCase().replace(/\/+$/, '');
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').toLowerCase()
    .replace(/[\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~、。・「」『』（）【】［］]/g, '');
}

function parseISOInstant(value: string): number | undefined {
  const match = ISO_INSTANT_PATTERN.exec(value);
  if (!match || !isValidISODate(match[1])) return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isValidISODate(value: string): boolean {
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function isSafeExternalUrl(value: string): boolean {
  if (!value || value.includes('\\')) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isCatalogArea(value: string): value is CatalogArea {
  return STORE_CATALOG_SOURCE_POLICY.areas.includes(value as CatalogArea);
}

function isValidStableId(value: string): boolean {
  return STABLE_ID_PATTERN.test(value);
}

function hasDuplicates<T>(values: readonly T[]): boolean {
  return new Set(values).size !== values.length;
}

function uniqueRecordMap<T extends Record<K, string>, K extends keyof T>(
  records: readonly T[],
  key: K,
  recordType: StoreCatalogValidationIssue['recordType'],
  issues: StoreCatalogValidationIssue[],
): Map<string, T> {
  const map = new Map<string, T>();
  for (const record of records) {
    const id = record[key];
    if (map.has(id)) {
      addIssue(issues, `duplicate-${String(key)}`, recordType, id, `duplicate ID: ${id}`);
    } else {
      map.set(id, record);
    }
  }
  return map;
}

function addIssue(
  issues: StoreCatalogValidationIssue[],
  code: string,
  recordType: StoreCatalogValidationIssue['recordType'],
  recordId: string | undefined,
  message: string,
): void {
  issues.push({ code, recordType, recordId, message });
}
