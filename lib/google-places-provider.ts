import type { AreaChoice } from '@/types/decision-v3';
import {
  GOOGLE_PLACES_NEARBY_FIELD_MASK,
  type ExternalCandidatePoolRecord,
  type GooglePlacesRequestBudget,
} from '@/types/external-candidate-pool';

const GOOGLE_PLACES_NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';

const AREA_SEARCH_CIRCLES: Record<Exclude<AreaChoice, 'any'>, {
  latitude: number;
  longitude: number;
  radius: number;
}> = {
  meieki: { latitude: 35.1706, longitude: 136.8817, radius: 1_000 },
  sakae: { latitude: 35.1694, longitude: 136.9081, radius: 1_000 },
  osu: { latitude: 35.1576, longitude: 136.9056, radius: 1_000 },
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  primaryType?: string;
  businessStatus?: string;
  location?: { latitude?: number; longitude?: number };
  formattedAddress?: string;
  currentOpeningHours?: { weekdayDescriptions?: string[] };
  priceLevel?: string;
  priceRange?: unknown;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
};

type GoogleNearbyResponse = { places?: GooglePlace[] };

/**
 * Returns an in-memory Google Places result only when the server has a key.
 * This function is server-only by convention: callers must never serialize
 * the key or raw response to a client, repository fixture, or log.
 */
export async function searchGooglePlacesNearby(
  area: Exclude<AreaChoice, 'any'>,
  requestBudget: GooglePlacesRequestBudget,
  now = new Date(),
): Promise<readonly ExternalCandidatePoolRecord[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || requestBudget.maxRequests < 1) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestBudget.timeoutMs);
  try {
    const circle = AREA_SEARCH_CIRCLES[area];
    const response = await fetch(GOOGLE_PLACES_NEARBY_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': GOOGLE_PLACES_NEARBY_FIELD_MASK.join(','),
      },
      body: JSON.stringify({
        includedTypes: ['restaurant', 'cafe', 'fast_food', 'food_court', 'ice_cream_shop'],
        maxResultCount: 20,
        locationRestriction: { circle: { center: circle, radius: circle.radius } },
        languageCode: 'ja',
      }),
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const payload = await response.json() as GoogleNearbyResponse;
    return (payload.places ?? [])
      .map((place) => mapGooglePlaceToExternalRecord(area, place, now))
      .filter((record): record is ExternalCandidatePoolRecord => Boolean(record));
  } catch {
    // Provider failure is intentionally silent to the user-facing flow. The
    // selection layer remains formal-only or OSM-backed as configured.
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export function mapGooglePlaceToExternalRecord(
  area: Exclude<AreaChoice, 'any'>,
  place: GooglePlace,
  now: Date,
): ExternalCandidatePoolRecord | null {
  const providerEntityId = readText(place.id);
  const name = readText(place.displayName?.text);
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  if (!providerEntityId || !name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const googleMapsUri = readText(place.googleMapsUri);
  return {
    externalId: `google-${toCanonicalId(providerEntityId)}`,
    provider: 'google-places',
    providerEntityId,
    name,
    area,
    category: readText(place.primaryType) ?? 'unknown',
    location: {
      latitude: Number(latitude),
      longitude: Number(longitude),
      formattedAddress: readText(place.formattedAddress),
    },
    businessStatus: place.businessStatus === 'OPERATIONAL'
      ? 'operational'
      : place.businessStatus === 'CLOSED_PERMANENTLY' || place.businessStatus === 'CLOSED_TEMPORARILY'
        ? 'closed'
        : 'unknown',
    budgetState: 'unknown',
    openingState: place.currentOpeningHours?.weekdayDescriptions?.length ? 'provider-reported' : 'unknown',
    sourceRetrievedAt: now.toISOString(),
    attribution: {
      label: 'Google Maps',
      href: googleMapsUri ?? 'https://maps.google.com/',
      license: 'Google Maps Platform',
    },
    confidence: 'provider-reported',
    verifiedFields: [],
    unknownFields: ['price', 'party', 'mood', 'officialAction', 'phoneAction'],
    google: {
      googleMapsUri,
      websiteUri: readText(place.websiteUri),
      phone: readText(place.nationalPhoneNumber),
      currentOpeningHours: place.currentOpeningHours?.weekdayDescriptions,
      priceLevel: readText(place.priceLevel),
      priceRange: typeof place.priceRange === 'string' ? place.priceRange : undefined,
    },
  };
}

function readText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function toCanonicalId(providerEntityId: string) {
  return providerEntityId
    .replace(/^places\//, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
