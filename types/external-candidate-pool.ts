import type { AreaChoice } from '@/types/decision-v3';

export type ExternalCandidateProvider = 'google-places' | 'openstreetmap';
export type ExternalCandidateKind = 'external-live-google' | 'external-catalog-osm';
export type ExternalBusinessStatus = 'operational' | 'closed' | 'unknown';
export type ExternalBudgetState = 'known' | 'unknown';
export type ExternalOpeningState = 'current' | 'provider-reported' | 'unknown';
export type ExternalCandidateConfidence = 'provider-reported' | 'provider-limited';

export type ExternalCandidateAttribution = {
  label: string;
  href: string;
  license?: string;
};

export type ExternalCandidateLocation = {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
};

/**
 * Provider-scoped data before it is adapted to the Decision presentation
 * model. It intentionally keeps provider fields and unknowns separate from
 * Nagotosha-reviewed facts.
 */
export type ExternalCandidatePoolRecord = {
  externalId: string;
  provider: ExternalCandidateProvider;
  providerEntityId: string;
  name: string;
  area: Exclude<AreaChoice, 'any'>;
  category: string;
  location: ExternalCandidateLocation;
  businessStatus: ExternalBusinessStatus;
  budgetState: ExternalBudgetState;
  openingState: ExternalOpeningState;
  sourceRetrievedAt: string;
  attribution: ExternalCandidateAttribution;
  confidence: ExternalCandidateConfidence;
  verifiedFields: readonly string[];
  unknownFields: readonly string[];
  price?: {
    minimum?: number;
    maximum?: number;
    label?: string;
  };
  osm?: {
    osmId: number;
    osmType: 'node' | 'way' | 'relation';
    amenity?: string;
    cuisine?: string;
    address?: string;
    openingHours?: string;
    website?: string;
    phone?: string;
  };
  google?: {
    googleMapsUri?: string;
    websiteUri?: string;
    phone?: string;
    currentOpeningHours?: readonly string[];
    priceLevel?: string;
    priceRange?: string;
  };
};

export type ExternalCandidatePoolFixture = {
  schemaVersion: 1;
  purpose: 'development-fixture-only';
  source: string;
  sourceRetrievedAt: string;
  attribution: ExternalCandidateAttribution;
  runtimePolicy: string;
  areas: Record<Exclude<AreaChoice, 'any'>, readonly ExternalCandidatePoolRecord[]>;
};

export type GooglePlacesRequestBudget = {
  maxRequests: number;
  timeoutMs: number;
};

export const GOOGLE_PLACES_NEARBY_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.primaryType',
  'places.businessStatus',
  'places.location',
  'places.formattedAddress',
  'places.currentOpeningHours',
  'places.priceLevel',
  'places.priceRange',
  'places.googleMapsUri',
  'places.websiteUri',
  'places.nationalPhoneNumber',
] as const;
