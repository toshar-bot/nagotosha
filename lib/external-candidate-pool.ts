import osmFixture from '@/data/external-candidate-pool/osm-nagoya-fixture.json';
import { getActiveFormalDecisionV3Candidates } from '@/lib/decision-v3-formal-adapter';
import { searchGooglePlacesNearby } from '@/lib/google-places-provider';
import { isSafeExternalUrl } from '@/lib/decision-safety';
import type {
  AreaChoice,
  DecisionV3Candidate,
  DecisionV3ExternalProviderAction,
  DecisionV3KnownBoolean,
  DecisionV3Price,
  DecisionV3ProviderEntityLink,
  MoodChoice,
  PartyChoice,
} from '@/types/decision-v3';
import type {
  ExternalCandidateKind,
  ExternalCandidatePoolFixture,
  ExternalCandidatePoolRecord,
} from '@/types/external-candidate-pool';

const AREA_LABEL: Record<Exclude<AreaChoice, 'any'>, string> = {
  meieki: '名駅・駅周辺',
  sakae: '栄・伏見',
  osu: '大須・上前津',
};

const CATEGORY_LABEL: Record<string, string> = {
  cafe: 'カフェ',
  restaurant: '飲食店',
  fast_food: 'ファストフード',
  food_court: 'フードコート',
  ice_cream: 'アイスクリーム',
};

const UNKNOWN_BOOLEAN: DecisionV3KnownBoolean = 'unknown';
const UNKNOWN_PARTY: PartyChoice[] = [];
const UNKNOWN_MOOD: MoodChoice[] = [];

export { EXTERNAL_CANDIDATE_POOL_PREVIEW_FLAG } from '@/lib/google-places-policy';
export const EXTERNAL_CANDIDATE_POOL_LIMITS = {
  maxCandidatesPerArea: 50,
  maxCandidatesPerResult: 3,
  maxProviderRequestsPerSession: 1,
  providerTimeoutMs: 2_500,
} as const;

export type ExternalCandidateDedupeSummary = {
  merged: number;
  distinct: number;
  unresolved: number;
};

export type ExternalCandidateDedupeResult = {
  candidates: readonly DecisionV3Candidate[];
  summary: ExternalCandidateDedupeSummary;
};

export function getOsmExternalCandidatePool(): readonly ExternalCandidatePoolRecord[] {
  const fixture = osmFixture as ExternalCandidatePoolFixture;
  return (Object.keys(fixture.areas) as Exclude<AreaChoice, 'any'>[])
    .flatMap((area) => fixture.areas[area].slice(0, EXTERNAL_CANDIDATE_POOL_LIMITS.maxCandidatesPerArea));
}

export function adaptExternalCandidatePoolRecord(
  record: ExternalCandidatePoolRecord,
): DecisionV3Candidate | null {
  if (record.businessStatus === 'closed') return null;

  const sourceKind: ExternalCandidateKind = record.provider === 'google-places'
    ? 'external-live-google'
    : 'external-catalog-osm';
  const price = toPresentationPrice(record);
  const sourceLabel = sourceKind === 'external-live-google'
    ? 'Google Maps情報'
    : 'OpenStreetMap基礎情報';
  const sourceReason = buildSourceReason(record);
  const providerActions = buildProviderActions(record);

  return {
    id: record.externalId,
    neutralLabel: '外部候補',
    name: record.name,
    area: AREA_LABEL[record.area],
    budget: price.label,
    genre: CATEGORY_LABEL[record.category] ?? record.category,
    tags: [sourceLabel],
    points: [sourceReason, '人数／気分の適性は未確認'],
    facts: {
      access: '確認中',
      atmosphere: '確認中',
      smoking: '確認中',
      seats: '確認中',
      privateRoom: '確認中',
      tatami: '確認中',
      solo: '確認中',
      kids: '確認中',
      reservation: '確認中',
      longStay: '確認中',
    },
    actions: [],
    photo: {
      alt: `${record.name}の写真は確認中です`,
      availability: 'unregistered',
      rightsStatus: 'unverified',
    },
    selection: {
      supportedPartyTypes: UNKNOWN_PARTY,
      supportedPurposes: UNKNOWN_MOOD,
      area: record.area,
      price,
      smokingPolicy: 'unknown',
      privateRoom: UNKNOWN_BOOLEAN,
      tatami: UNKNOWN_BOOLEAN,
      counter: UNKNOWN_BOOLEAN,
      familyAndStroller: UNKNOWN_BOOLEAN,
      reservation: UNKNOWN_BOOLEAN,
      parking: UNKNOWN_BOOLEAN,
      rainFriendly: UNKNOWN_BOOLEAN,
      wifi: UNKNOWN_BOOLEAN,
      powerOutlet: UNKNOWN_BOOLEAN,
      terrace: UNKNOWN_BOOLEAN,
      lateNight: UNKNOWN_BOOLEAN,
      quiet: UNKNOWN_BOOLEAN,
      longStay: UNKNOWN_BOOLEAN,
    },
    provenance: {
      kind: sourceKind,
      label: sourceLabel,
      provider: record.provider,
      providerEntityId: record.providerEntityId,
      sourceRetrievedAt: record.sourceRetrievedAt,
      attribution: record.attribution,
      businessStatus: record.businessStatus,
      verifiedFields: record.verifiedFields,
      unknownFields: record.unknownFields,
      reason: sourceReason,
      providerActions,
      linkedProviderEntities: [{ provider: record.provider, providerEntityId: record.providerEntityId }],
      duplicateStatus: 'distinct',
    },
  };
}

/**
 * Preview-only pool composition. The current formal set remains first; OSM
 * catalog records are fallback data, never review-equivalent candidates.
 */
export function getExternalPreviewDecisionV3Candidates(
  now = new Date(),
  externalRecords: readonly ExternalCandidatePoolRecord[] = getOsmExternalCandidatePool(),
): readonly DecisionV3Candidate[] {
  const formal = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: toTokyoISODate(now),
    evaluatedAt: now.toISOString(),
  });
  const external = externalRecords
    .map(adaptExternalCandidatePoolRecord)
    .filter((candidate): candidate is DecisionV3Candidate => Boolean(candidate));
  return [...formal, ...dedupeExternalCandidates(formal, external).candidates];
}

/**
 * Preview-only live composition. It makes at most one Places request for the
 * caller-selected area and retains OSM/formal candidates if Google is absent,
 * over quota, timed out, or unavailable. It is never called by Production.
 */
export async function getExternalPreviewDecisionV3CandidatesWithGoogle(
  area: Exclude<AreaChoice, 'any'> | null,
  allowLiveRequest: boolean,
  now = new Date(),
): Promise<readonly DecisionV3Candidate[]> {
  const base = getExternalPreviewDecisionV3Candidates(now);
  if (!area || !shouldRequestGoogleForArea(area, allowLiveRequest)) return base;

  const googleRecords = await searchGooglePlacesNearby(area, {
    maxRequests: EXTERNAL_CANDIDATE_POOL_LIMITS.maxProviderRequestsPerSession,
    timeoutMs: EXTERNAL_CANDIDATE_POOL_LIMITS.providerTimeoutMs,
    allowLiveRequest,
  }, now);
  const googleCandidates = googleRecords
    .map(adaptExternalCandidatePoolRecord)
    .filter((candidate): candidate is DecisionV3Candidate => Boolean(candidate));
  return [...base, ...dedupeExternalCandidates(base, googleCandidates).candidates];
}

export function shouldRequestGoogleForArea(
  area: Exclude<AreaChoice, 'any'> | null,
  allowLiveRequest: boolean,
): boolean {
  // `allowLiveRequest` is the middleware-issued, one-time session grant. An
  // explicit area plus that grant intentionally permits one Preview request
  // even when the raw OSM catalog already has three records for the area.
  return Boolean(area && allowLiveRequest);
}

/**
 * Formal candidates always win. Exact provider/entity, phone, and website
 * matches are merged. Name/address proximity alone remains visible but marked
 * unresolved so it never causes an automatic merge.
 */
export function dedupeExternalCandidates(
  formal: readonly DecisionV3Candidate[],
  external: readonly DecisionV3Candidate[],
): ExternalCandidateDedupeResult {
  const accepted: DecisionV3Candidate[] = [];
  const summary: ExternalCandidateDedupeSummary = { merged: 0, distinct: 0, unresolved: 0 };

  for (let candidate of external) {
    const formalMatch = formal.find((item) => isExactProviderMatch(item, candidate));
    if (formalMatch) {
      summary.merged += 1;
      continue;
    }

    const exactExternal = accepted.find((item) => isExactProviderMatch(item, candidate));
    if (exactExternal) {
      mergeProviderEntity(exactExternal, candidate);
      summary.merged += 1;
      continue;
    }

    const ambiguous = [...formal, ...accepted].some((item) => isAmbiguousProviderMatch(item, candidate));
    if (ambiguous && candidate.provenance) {
      candidate = {
        ...candidate,
        provenance: { ...candidate.provenance, duplicateStatus: 'unresolved' },
      };
      summary.unresolved += 1;
    } else {
      summary.distinct += 1;
    }
    accepted.push(candidate);
  }

  return { candidates: accepted, summary };
}

/** Backward-compatible list-only helper used by existing callers. */
export function excludeExternalDuplicates(
  formal: readonly DecisionV3Candidate[],
  external: readonly DecisionV3Candidate[],
): readonly DecisionV3Candidate[] {
  return dedupeExternalCandidates(formal, external).candidates;
}

function buildProviderActions(record: ExternalCandidatePoolRecord): readonly DecisionV3ExternalProviderAction[] {
  const actions: DecisionV3ExternalProviderAction[] = [];
  if (record.provider === 'google-places') {
    if (isSafeExternalUrl(record.google?.googleMapsUri ?? '')) {
      actions.push({ kind: 'map', label: 'Google Mapsで確認', href: record.google!.googleMapsUri! });
    }
    if (isSafeExternalUrl(record.google?.websiteUri ?? '')) {
      actions.push({ kind: 'website', label: 'ウェブサイトを見る', href: record.google!.websiteUri! });
    }
    const phoneAction = toProviderPhoneAction(record.google?.phone, '電話する');
    if (phoneAction) actions.push(phoneAction);
    return actions;
  }

  const osm = record.osm;
  if (osm && Number.isSafeInteger(osm.osmId) && osm.osmId > 0) {
    actions.push({
      kind: 'map',
      label: 'OpenStreetMapで確認',
      href: `https://www.openstreetmap.org/${osm.osmType}/${osm.osmId}`,
    });
  }
  if (isSafeExternalUrl(osm?.website ?? '')) {
    actions.push({ kind: 'website', label: 'ウェブサイトを見る', href: osm!.website! });
  }
  const phoneAction = toProviderPhoneAction(osm?.phone, '電話する');
  if (phoneAction) actions.push(phoneAction);
  return actions;
}

function toProviderPhoneAction(value: string | undefined, label: string): DecisionV3ExternalProviderAction | null {
  if (!value || !/^\+?[0-9][0-9().\-\s]{5,30}$/.test(value)) return null;
  return { kind: 'phone', label, href: `tel:${value}` };
}

function isExactProviderMatch(left: DecisionV3Candidate, right: DecisionV3Candidate): boolean {
  if (left.id === right.id) return true;
  const leftProvenance = left.provenance;
  const rightProvenance = right.provenance;
  if (leftProvenance && rightProvenance) {
    if (
      leftProvenance.provider === rightProvenance.provider
      && leftProvenance.providerEntityId === rightProvenance.providerEntityId
    ) return true;
  }
  const leftPhone = normalizedPhone(left);
  const rightPhone = normalizedPhone(right);
  if (leftPhone && rightPhone && leftPhone === rightPhone) return true;
  const leftDomain = normalizedWebsiteDomain(left);
  const rightDomain = normalizedWebsiteDomain(right);
  return Boolean(leftDomain && rightDomain && leftDomain === rightDomain);
}

function isAmbiguousProviderMatch(left: DecisionV3Candidate, right: DecisionV3Candidate): boolean {
  if (normalizeIdentity(left.name) !== normalizeIdentity(right.name)) return false;
  const leftAddress = normalizeIdentity(left.detailInfo?.address?.value ?? '');
  const rightAddress = normalizeIdentity(right.detailInfo?.address?.value ?? '');
  return Boolean(leftAddress && rightAddress && leftAddress === rightAddress);
}

function mergeProviderEntity(
  retained: DecisionV3Candidate,
  duplicate: DecisionV3Candidate,
) {
  if (!retained.provenance || !duplicate.provenance) return;
  const links: DecisionV3ProviderEntityLink[] = [
    ...retained.provenance.linkedProviderEntities,
    ...duplicate.provenance.linkedProviderEntities,
  ].filter((link, index, all) => all.findIndex((item) => (
    item.provider === link.provider && item.providerEntityId === link.providerEntityId
  )) === index);
  const retainedIsGoogle = retained.provenance.provider === 'google-places';
  const duplicateIsGoogle = duplicate.provenance.provider === 'google-places';
  const winner = duplicateIsGoogle && !retainedIsGoogle ? duplicate : retained;
  const loser = winner === retained ? duplicate : retained;
  if (winner === retained) {
    retained.provenance = { ...retained.provenance, linkedProviderEntities: links };
    return;
  }
  // The accepted array keeps the current object reference. Copy Google data
  // into it when a later exact duplicate has the higher provider priority.
  Object.assign(retained, {
    ...winner,
    provenance: { ...winner.provenance!, linkedProviderEntities: links },
  });
  void loser;
}

function normalizedPhone(candidate: DecisionV3Candidate): string | null {
  const phoneAction = candidate.provenance?.providerActions.find((action) => action.kind === 'phone')?.href
    ?? candidate.actions.find((action) => action.type === 'phone')?.href
    ?? candidate.detailInfo?.phone?.value;
  const normalized = (phoneAction ?? '').replace(/^tel:/i, '').replace(/\D/g, '');
  return normalized.length >= 6 ? normalized : null;
}

function normalizedWebsiteDomain(candidate: DecisionV3Candidate): string | null {
  const href = candidate.provenance?.providerActions.find((action) => action.kind === 'website')?.href
    ?? candidate.actions.find((action) => action.type === 'official')?.href;
  if (!href || !isSafeExternalUrl(href)) return null;
  try {
    return new URL(href).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function toPresentationPrice(record: ExternalCandidatePoolRecord): DecisionV3Price {
  if (
    record.budgetState === 'known'
    && typeof record.price?.minimum === 'number'
    && typeof record.price?.maximum === 'number'
    && record.price.label
  ) {
    return {
      kind: 'range',
      minimum: record.price.minimum,
      maximum: record.price.maximum,
      label: record.price.label,
    };
  }
  return {
    kind: 'variable',
    label: '価格は確認中',
    note: '外部providerの情報だけでは、予算条件を確定できません。',
  };
}

function buildSourceReason(record: ExternalCandidatePoolRecord): string {
  const area = AREA_LABEL[record.area];
  const opening = record.businessStatus === 'operational'
    ? '現在営業中'
    : record.openingState === 'provider-reported'
      ? '営業時間はprovider掲載'
      : '営業状態は未確認';
  return `${area}・${opening}`;
}

function normalizeIdentity(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('ja-JP')
    .replace(/[\s・・'’()（）\-－ー]/g, '');
}

function toTokyoISODate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get('year')}-${byType.get('month')}-${byType.get('day')}`;
}
