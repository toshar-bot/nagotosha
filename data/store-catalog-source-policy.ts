import type {
  CatalogArea,
  StoreFactKey,
  StoreSourceReferenceKind,
} from '../types/store-catalog';

const CANONICAL_SOURCE_KINDS = [
  'official-store',
  'official-brand',
  'official-facility',
  'merchant-response',
  'editorial-note',
] as const satisfies readonly StoreSourceReferenceKind[];

export type StoreCatalogSourcePolicy = {
  version: string;
  areas: readonly CatalogArea[];
  targetPerArea: number;
  totalTarget: number;
  canonicalSourceKindsByFact: Readonly<
    Record<StoreFactKey, readonly StoreSourceReferenceKind[]>
  >;
  googleDiscoveryAllowedFields: readonly string[];
  googleDiscoveryForbiddenFields: readonly string[];
};

export const STORE_CATALOG_SOURCE_POLICY: StoreCatalogSourcePolicy = {
  version: 'store-catalog-v1',
  areas: ['sakae', 'meieki', 'osu'],
  targetPerArea: 10,
  totalTarget: 30,
  canonicalSourceKindsByFact: {
    displayName: CANONICAL_SOURCE_KINDS,
    address: CANONICAL_SOURCE_KINDS,
    area: CANONICAL_SOURCE_KINDS,
    facilityName: CANONICAL_SOURCE_KINDS,
    floor: CANONICAL_SOURCE_KINDS,
    phone: CANONICAL_SOURCE_KINDS,
    officialUrl: CANONICAL_SOURCE_KINDS,
    currentStatus: CANONICAL_SOURCE_KINDS,
    openingHours: CANONICAL_SOURCE_KINDS,
    price: CANONICAL_SOURCE_KINDS,
    reservationChannel: CANONICAL_SOURCE_KINDS,
  },
  googleDiscoveryAllowedFields: [
    'discoveryId',
    'source',
    'capturedAt',
    'placeIdCandidate',
    'externalMapUrl',
    'status',
  ],
  googleDiscoveryForbiddenFields: [
    'canonicalName',
    'canonicalAddress',
    'openingHours',
    'price',
    'rating',
    'reviewText',
    'reviewCount',
    'reviews',
    'scrapedFacts',
  ],
};

export function isStoreSourceCanonicalEligible(
  factKey: StoreFactKey,
  sourceKind: StoreSourceReferenceKind,
): boolean {
  return STORE_CATALOG_SOURCE_POLICY.canonicalSourceKindsByFact[factKey]
    .includes(sourceKind);
}
