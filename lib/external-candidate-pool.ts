import osmFixture from '@/data/external-candidate-pool/osm-nagoya-fixture.json';
import { getActiveFormalDecisionV3Candidates } from '@/lib/decision-v3-formal-adapter';
import { searchGooglePlacesNearby } from '@/lib/google-places-provider';
import type {
  AreaChoice,
  DecisionV3Candidate,
  DecisionV3KnownBoolean,
  DecisionV3Price,
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

export const EXTERNAL_CANDIDATE_POOL_PREVIEW_FLAG = 'EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED';
export const EXTERNAL_CANDIDATE_POOL_LIMITS = {
  maxCandidatesPerArea: 50,
  maxCandidatesPerResult: 3,
  maxProviderRequestsPerServerRender: 1,
  providerTimeoutMs: 2_500,
} as const;

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
  return [...formal, ...excludeExternalDuplicates(formal, external)];
}

/**
 * Preview-only live composition. It makes at most one Places request for the
 * caller-selected area and retains OSM/formal candidates if Google is absent,
 * over quota, timed out, or unavailable. It is never called by Production.
 */
export async function getExternalPreviewDecisionV3CandidatesWithGoogle(
  area: Exclude<AreaChoice, 'any'> | null,
  now = new Date(),
): Promise<readonly DecisionV3Candidate[]> {
  const base = getExternalPreviewDecisionV3Candidates(now);
  if (!area) return base;

  const googleRecords = await searchGooglePlacesNearby(area, {
    maxRequests: EXTERNAL_CANDIDATE_POOL_LIMITS.maxProviderRequestsPerServerRender,
    timeoutMs: EXTERNAL_CANDIDATE_POOL_LIMITS.providerTimeoutMs,
  }, now);
  const googleCandidates = googleRecords
    .map(adaptExternalCandidatePoolRecord)
    .filter((candidate): candidate is DecisionV3Candidate => Boolean(candidate));
  return [...base, ...excludeExternalDuplicates(base, googleCandidates)];
}

export function excludeExternalDuplicates(
  formal: readonly DecisionV3Candidate[],
  external: readonly DecisionV3Candidate[],
): readonly DecisionV3Candidate[] {
  const formalIds = new Set(formal.map((candidate) => candidate.id));
  const formalNames = new Set(formal.map((candidate) => normalizeIdentity(candidate.name)));
  const retained = new Set<string>();

  return external.filter((candidate) => {
    const normalizedName = normalizeIdentity(candidate.name);
    if (formalIds.has(candidate.id) || formalNames.has(normalizedName) || retained.has(candidate.id)) {
      return false;
    }
    retained.add(candidate.id);
    return true;
  });
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
