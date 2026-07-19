import { MINIMUM_CANDIDATES_PER_MODE } from '../data/decision-candidates';
import type {
  DecisionAction,
  DecisionCandidate,
  DecisionCandidateStatus,
  DecisionCandidateVisual,
  DecisionMode,
  DecisionModeAvailability,
  DecisionRelationshipTarget,
  VerifiedImage,
} from '../types/decision-candidate';
import { resolveContentRelationship, type ContentRelationshipResolution } from './content-relationships';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NO_APPROVED_CATEGORY_KEYS: ReadonlySet<string> = new Set<string>();

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

  return action.type !== 'reservation' || action.availabilityConfirmed === true;
}

export function isDecisionCandidateDisplayable(candidate: DecisionCandidate): boolean {
  const relationship = resolveDecisionCandidateRelationship(candidate);

  return (
    isResolvedRelationshipDisplayable(relationship)
    && isValidVerificationDate(candidate.verifiedAt)
    && isDecisionCandidateStatusDisplayable(candidate.decisionMode, candidate.status)
    && candidate.partyTypes.length > 0
    && candidate.moodTags.length > 0
    && candidate.actions.length > 0
    && candidate.actions.every(isDecisionActionDisplayable)
  );
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
