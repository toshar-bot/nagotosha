import { MINIMUM_CANDIDATES_PER_MODE } from '../data/decision-candidates';
import type {
  DecisionAction,
  DecisionCandidate,
  DecisionCandidateEvidence,
  DecisionCandidateStatus,
  DecisionCandidateVisual,
  DecisionEditorialClassificationField,
  DecisionMode,
  DecisionModeAvailability,
  DecisionOfficialFactField,
  DecisionOfficialFactEvidence,
  DecisionRelationshipTarget,
  VerifiedImage,
} from '../types/decision-candidate';
import { resolveContentRelationship, type ContentRelationshipResolution } from './content-relationships';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const NO_APPROVED_CATEGORY_KEYS: ReadonlySet<string> = new Set<string>();
const REQUIRED_OFFICIAL_FACT_FIELDS: readonly DecisionOfficialFactField[] = [
  'currentStatus',
  'openingHours',
  'price',
  'officialUrl',
  'location',
  'nearestStation',
];
const REQUIRED_EDITORIAL_FIELDS: readonly DecisionEditorialClassificationField[] = [
  'partyTypes',
  'budgetBand',
  'moodTags',
  'reservationNeed',
];

export type DecisionRelationshipResolution = ContentRelationshipResolution & {
  target: DecisionRelationshipTarget;
};

export function resolveDecisionRelationshipTarget(
  target: DecisionRelationshipTarget,
): DecisionRelationshipResolution {
  if (target.kind === 'article') {
    return {
      ...resolveContentRelationship(target.articleId),
      target,
    };
  }

  return {
    postId: target.articleId,
    relationship: 'unknown',
    source: 'none',
    displayableOnRedesignedSurfaces: false,
    validationErrors: [
      target.itemId.trim()
        ? 'roundup item relationship is not explicitly confirmed'
        : 'roundup itemId is required',
    ],
    target,
  };
}

export function resolveDecisionCandidateRelationship(
  candidate: Pick<DecisionCandidate, 'relationshipTarget'>,
): DecisionRelationshipResolution {
  return resolveDecisionRelationshipTarget(candidate.relationshipTarget);
}

export function isResolvedRelationshipDisplayable(
  resolution: DecisionRelationshipResolution,
): boolean {
  return (
    resolution.displayableOnRedesignedSurfaces
    && resolution.relationship !== 'unknown'
    && resolution.validationErrors.length === 0
  );
}

export function isValidVerificationDate(value: string | undefined): value is string {
  if (!value || !ISO_DATE_PATTERN.test(value)) return false;
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

export function isValidDecisionTime(value: string | undefined): value is string {
  return Boolean(value && TIME_PATTERN.test(value));
}

export function isSafeInternalUrl(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
}

export function isSafeExternalUrl(value: string): boolean {
  if (!value || value.includes('\\')) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isSafeDecisionUrl(value: string): boolean {
  return isSafeInternalUrl(value) || isSafeExternalUrl(value);
}

export function isDecisionCandidateStatusDisplayable(
  mode: DecisionMode,
  status: DecisionCandidateStatus,
): boolean {
  if (mode === 'event') return status === 'available' || status === 'scheduled';
  return status === 'available';
}

export function isVerifiedImageDisplayable(image: VerifiedImage | undefined): image is VerifiedImage {
  if (
    !image
    || image.rightsVerified !== true
    || !image.src.trim()
    || !image.alt.trim()
    || !image.credit.trim()
    || !image.license.trim()
    || !isSafeDecisionUrl(image.src)
    || !isSafeExternalUrl(image.sourceUrl)
    || !isValidVerificationDate(image.verifiedAt)
  ) {
    return false;
  }

  const photographedAtValid = image.photographedAt === undefined
    || isValidVerificationDate(image.photographedAt);
  const eventYearValid = image.eventYear === undefined
    || image.eventYear === 'unknown'
    || (Number.isInteger(image.eventYear) && image.eventYear > 0);

  if (!photographedAtValid || !eventYearValid) return false;

  if (image.usage === 'decorative') {
    return typeof image.isHistorical === 'boolean' || image.isHistorical === 'unknown';
  }

  if (image.usage !== 'evidence' || typeof image.isHistorical !== 'boolean') return false;

  const hasKnownCaptureTime = image.photographedAt !== undefined
    || (typeof image.eventYear === 'number' && Number.isInteger(image.eventYear) && image.eventYear > 0);
  const hasRequiredHistoricalCaption = image.isHistorical !== true || image.caption.trim().length > 0;

  return hasKnownCaptureTime && hasRequiredHistoricalCaption;
}

export function resolveDecisionCandidateVisual(
  visual: DecisionCandidateVisual,
  approvedCategoryKeys: ReadonlySet<string> = NO_APPROVED_CATEGORY_KEYS,
): DecisionCandidateVisual {
  if (visual.kind === 'photo') {
    return isVerifiedImageDisplayable(visual.image) ? visual : { kind: 'none' };
  }

  if (visual.kind === 'category') {
    return visual.categoryKey.trim()
      && visual.alt.trim()
      && approvedCategoryKeys.has(visual.categoryKey)
      ? visual
      : { kind: 'none' };
  }

  return { kind: 'none' };
}

export function isDecisionActionDisplayable(action: DecisionAction): boolean {
  if (
    !action.label.trim()
    || !isSafeDecisionUrl(action.url)
    || !isValidVerificationDate(action.verifiedAt)
  ) {
    return false;
  }

  return action.type !== 'reservation' || (
    action.availabilityConfirmed === true
    && action.availabilityScope === 'booking-channel'
    && action.availabilityMeaning === 'channel-available-not-slot-guarantee'
  );
}

export function isDecisionCandidateDisplayable(candidate: DecisionCandidate): boolean {
  const relationship = resolveDecisionCandidateRelationship(candidate);

  return (
    isResolvedRelationshipDisplayable(relationship)
    && isValidVerificationDate(candidate.statusVerifiedAt)
    && isValidVerificationDate(candidate.openingHoursVerifiedAt)
    && isValidVerificationDate(candidate.priceVerifiedAt)
    && isDecisionCandidateStatusDisplayable(candidate.decisionMode, candidate.currentStatus)
    && candidate.partyTypes.length > 0
    && candidate.moodTags.length > 0
    && candidate.actions.length > 0
    && candidate.actions.every(isDecisionActionDisplayable)
  );
}

export type DecisionRegistryValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateDecisionCandidateRegistry(
  candidates: readonly DecisionCandidate[],
  evidenceRecords: readonly DecisionCandidateEvidence[],
  expectedCount = 3,
): DecisionRegistryValidationResult {
  const errors: string[] = [];
  const evidenceById = new Map<string, DecisionCandidateEvidence>();
  const candidateIds = new Set<string>();
  const articleIds = new Set<number>();

  if (candidates.length !== expectedCount) {
    errors.push(`registry must contain exactly ${expectedCount} candidates`);
  }

  for (const evidence of evidenceRecords) {
    if (!evidence.id.trim()) {
      errors.push('evidence id is required');
      continue;
    }
    if (evidenceById.has(evidence.id)) {
      errors.push(`duplicate evidence id: ${evidence.id}`);
      continue;
    }
    evidenceById.set(evidence.id, evidence);
    errors.push(...validateDecisionEvidence(evidence));
  }

  for (const candidate of candidates) {
    const prefix = candidate.id || '(missing candidate id)';
    if (!candidate.id.trim()) errors.push('candidate id is required');
    if (candidateIds.has(candidate.id)) errors.push(`${prefix}: duplicate candidate id`);
    candidateIds.add(candidate.id);

    if (candidate.relationshipTarget.kind !== 'article') {
      errors.push(`${prefix}: initial candidate must target an article`);
    } else {
      const articleId = candidate.relationshipTarget.articleId;
      if (articleIds.has(articleId)) errors.push(`${prefix}: duplicate articleId ${articleId}`);
      articleIds.add(articleId);
    }

    if (candidate.decisionMode !== 'food') errors.push(`${prefix}: decisionMode must be food`);
    if (candidate.entityType !== 'place') errors.push(`${prefix}: entityType must be place`);
    if (!candidate.displayName.trim()) errors.push(`${prefix}: displayName is required`);
    if (candidate.currentStatus !== 'available') errors.push(`${prefix}: currentStatus must be available`);
    if (!isValidVerificationDate(candidate.statusVerifiedAt)) {
      errors.push(`${prefix}: statusVerifiedAt must be a real date`);
    }
    if (!isValidVerificationDate(candidate.openingHoursVerifiedAt)) {
      errors.push(`${prefix}: openingHoursVerifiedAt must be a real date`);
    }
    if (!isValidVerificationDate(candidate.priceVerifiedAt)) {
      errors.push(`${prefix}: priceVerifiedAt must be a real date`);
    }
    if (!isValidDecisionTime(candidate.openingHours.opens)
      || !isValidDecisionTime(candidate.openingHours.closes)
      || (candidate.openingHours.lastOrder !== undefined
        && !isValidDecisionTime(candidate.openingHours.lastOrder))) {
      errors.push(`${prefix}: openingHours must use valid HH:mm values`);
    }
    if (candidate.walkingMinutes !== undefined
      && (!Number.isInteger(candidate.walkingMinutes) || candidate.walkingMinutes < 0)) {
      errors.push(`${prefix}: walkingMinutes must be a non-negative integer when present`);
    }
    if (candidate.partyTypes.length === 0) errors.push(`${prefix}: partyTypes must not be empty`);
    if (candidate.moodTags.length === 0) errors.push(`${prefix}: moodTags must not be empty`);
    if (candidate.timeOfDay.length === 0) errors.push(`${prefix}: timeOfDay must not be empty`);

    const relationship = resolveDecisionCandidateRelationship(candidate);
    if (relationship.relationship !== 'editorial') {
      errors.push(`${prefix}: relationship must resolve to editorial`);
    }
    if (!isResolvedRelationshipDisplayable(relationship)) {
      errors.push(`${prefix}: relationship is conflicted or not displayable`);
    }

    const resolvedVisual = resolveDecisionCandidateVisual(candidate.visual);
    if (candidate.visual.kind !== 'none' && resolvedVisual.kind === 'none') {
      errors.push(`${prefix}: visual is not verified for display`);
    }

    const articleActions = candidate.actions.filter((action) => action.type === 'article');
    const officialActions = candidate.actions.filter((action) => action.type === 'official');
    const reservationActions = candidate.actions.filter((action) => action.type === 'reservation');
    if (articleActions.length !== 1) errors.push(`${prefix}: exactly one article action is required`);
    if (officialActions.length !== 1) errors.push(`${prefix}: exactly one official action is required`);
    if (!candidate.actions.every(isDecisionActionDisplayable)) {
      errors.push(`${prefix}: every action must have a safe URL and verified date`);
    }
    if (candidate.id === 'food-182-sawi-sakae') {
      if (reservationActions.length !== 1) errors.push(`${prefix}: reservation action is required`);
    } else if (reservationActions.length > 0) {
      errors.push(`${prefix}: reservation action is allowed only for food-182-sawi-sakae`);
    }
    if (reservationActions.length > 0 && candidate.reservationAvailability !== 'channel-available') {
      errors.push(`${prefix}: reservation action requires channel-available status`);
    }
    if (candidate.reservationAvailability === 'channel-available' && reservationActions.length !== 1) {
      errors.push(`${prefix}: channel-available status requires one reservation action`);
    }

    const candidateEvidence = candidate.evidenceIds.map((id) => evidenceById.get(id));
    if (candidate.evidenceIds.length === 0) errors.push(`${prefix}: evidenceIds must not be empty`);
    for (let index = 0; index < candidateEvidence.length; index += 1) {
      const evidence = candidateEvidence[index];
      const evidenceId = candidate.evidenceIds[index];
      if (!evidence) {
        errors.push(`${prefix}: missing evidence ${evidenceId}`);
      } else if (evidence.candidateId !== candidate.id) {
        errors.push(`${prefix}: evidence ${evidenceId} belongs to another candidate`);
      }
    }

    const presentEvidence = candidateEvidence.filter(
      (evidence): evidence is DecisionCandidateEvidence => evidence !== undefined,
    );
    const verificationDateByField: ReadonlyArray<[
      DecisionOfficialFactField,
      string,
      string,
    ]> = [
      ['currentStatus', candidate.statusVerifiedAt, 'statusVerifiedAt'],
      ['openingHours', candidate.openingHoursVerifiedAt, 'openingHoursVerifiedAt'],
      ['price', candidate.priceVerifiedAt, 'priceVerifiedAt'],
    ];
    for (const [field, candidateDate, candidateDateField] of verificationDateByField) {
      const matchingEvidence = presentEvidence.find((evidence): evidence is DecisionOfficialFactEvidence => (
        evidence.kind === 'official-fact' && evidence.field === field
      ));
      if (matchingEvidence && matchingEvidence.verifiedAt !== candidateDate) {
        errors.push(`${prefix}: ${candidateDateField} must match source-access evidence for ${field}`);
      }
    }
    for (const field of REQUIRED_OFFICIAL_FACT_FIELDS) {
      if (!presentEvidence.some((evidence) => evidence.kind === 'official-fact' && evidence.field === field)) {
        errors.push(`${prefix}: missing official-fact evidence for ${field}`);
      }
    }
    for (const field of REQUIRED_EDITORIAL_FIELDS) {
      if (!presentEvidence.some((evidence) => (
        evidence.kind === 'editorial-classification'
        && evidence.field === field
        && evidence.approved === true
        && evidence.approvedBy === 'user'
      ))) {
        errors.push(`${prefix}: missing approved editorial evidence for ${field}`);
      }
    }
    for (const field of ['timeOfDay', 'weatherFit'] as const) {
      if (!presentEvidence.some((evidence) => evidence.kind === 'derived-fact' && evidence.field === field)) {
        errors.push(`${prefix}: missing derived-fact evidence for ${field}`);
      }
    }
  }

  for (const evidence of evidenceRecords) {
    if (!candidateIds.has(evidence.candidateId)) {
      errors.push(`${evidence.id}: evidence candidate does not exist`);
    }
    const referenceIds = evidence.kind === 'editorial-classification'
      ? evidence.supportingEvidenceIds
      : evidence.kind === 'derived-fact'
        ? evidence.derivedFromEvidenceIds
        : [];
    for (const referenceId of referenceIds) {
      const referenced = evidenceById.get(referenceId);
      if (!referenced) {
        errors.push(`${evidence.id}: missing referenced evidence ${referenceId}`);
      } else if (referenced.candidateId !== evidence.candidateId) {
        errors.push(`${evidence.id}: referenced evidence belongs to another candidate`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateDecisionEvidence(evidence: DecisionCandidateEvidence): string[] {
  const errors: string[] = [];
  const runtimeEvidence = evidence as unknown as Record<string, unknown>;
  if ('publishedAt' in runtimeEvidence || 'modified' in runtimeEvidence) {
    errors.push(`${evidence.id}: publication or modified dates are not verification evidence`);
  }

  if (evidence.kind === 'official-fact') {
    if (!isSafeExternalUrl(evidence.sourceUrl)) errors.push(`${evidence.id}: sourceUrl must be safe`);
    if (!isValidVerificationDate(evidence.verifiedAt)) errors.push(`${evidence.id}: verifiedAt is invalid`);
    if (evidence.verificationMethod !== 'source-accessed-at') {
      errors.push(`${evidence.id}: verificationMethod must be source-accessed-at`);
    }
  } else if (evidence.kind === 'editorial-classification') {
    if (evidence.approved !== true || evidence.approvedBy !== 'user') {
      errors.push(`${evidence.id}: editorial classification must be user-approved`);
    }
    if (!isValidVerificationDate(evidence.approvedAt)) errors.push(`${evidence.id}: approvedAt is invalid`);
    if (!evidence.rationale.trim()) errors.push(`${evidence.id}: rationale is required`);
    if (evidence.supportingEvidenceIds.length === 0) {
      errors.push(`${evidence.id}: supportingEvidenceIds must not be empty`);
    }
  } else {
    if (!isValidVerificationDate(evidence.verifiedAt)) errors.push(`${evidence.id}: verifiedAt is invalid`);
    if (!evidence.derivationRule.trim()) errors.push(`${evidence.id}: derivationRule is required`);
    if (evidence.derivedFromEvidenceIds.length === 0) {
      errors.push(`${evidence.id}: derivedFromEvidenceIds must not be empty`);
    }
  }

  return errors;
}

export function getDecisionModeAvailability(
  mode: DecisionMode,
  candidates: readonly DecisionCandidate[],
): DecisionModeAvailability {
  const candidateCount = candidates.filter(
    (candidate) => candidate.decisionMode === mode && isDecisionCandidateDisplayable(candidate),
  ).length;

  return {
    mode,
    candidateCount,
    minimumCandidateCount: MINIMUM_CANDIDATES_PER_MODE,
    enabled: candidateCount >= MINIMUM_CANDIDATES_PER_MODE,
  };
}
