import type { AreaChoice } from '@/types/decision-v3';
import {
  isGooglePlacesLocalDiagnosticEnabled,
  type GooglePlacesEnvironment,
} from '@/lib/google-places-policy';
import { isSafeExternalUrl } from '@/lib/decision-safety';
import {
  GOOGLE_PLACES_NEARBY_FIELD_MASK,
  type ExternalCandidatePoolRecord,
  type GooglePlacesMoney,
  type GooglePlacesPriceRange,
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
  priceRange?: GooglePlacesPriceRange;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
};

type GoogleNearbyResponse = { places?: GooglePlace[] };
type GooglePlacesRuntimeEnvironment = GooglePlacesEnvironment & {
  GOOGLE_PLACES_API_KEY?: string;
};

/**
 * Diagnostic-only in-memory provider, unreachable from deployed Web routes.
 * Local callers must inject explicit diagnostic conditions and a temporary
 * key in their process environment. Synthetic tests may inject an environment
 * and transport. Never serialize keys or raw responses to clients or logs.
 */
export async function searchGooglePlacesNearby(
  area: Exclude<AreaChoice, 'any'>,
  requestBudget: GooglePlacesRequestBudget,
  now = new Date(),
  environment: GooglePlacesRuntimeEnvironment = process.env,
): Promise<readonly ExternalCandidatePoolRecord[]> {
  if (!requestBudget.allowLiveRequest || !isGooglePlacesLocalDiagnosticEnabled(environment)) return [];
  const apiKey = environment.GOOGLE_PLACES_API_KEY;
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
        includedTypes: ['restaurant', 'cafe', 'fast_food_restaurant', 'food_court', 'ice_cream_shop'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: circle.latitude, longitude: circle.longitude },
            radius: circle.radius,
          },
        },
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
  const googleMapsUri = readText(place.googleMapsUri);
  if (
    !providerEntityId
    || !name
    || !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || !googleMapsUri
    || !isSafeExternalUrl(googleMapsUri)
  ) return null;

  const price = toVerifiedGoogleJpyPrice(place.priceRange);

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
    budgetState: price ? 'known' : 'unknown',
    openingState: place.currentOpeningHours?.weekdayDescriptions?.length ? 'provider-reported' : 'unknown',
    sourceRetrievedAt: now.toISOString(),
    attribution: {
      label: 'Google Maps',
      href: googleMapsUri,
      license: 'Google Maps Platform',
    },
    confidence: 'provider-reported',
    verifiedFields: price ? ['price'] : [],
    unknownFields: [
      ...(price ? [] : ['price']),
      'party',
      'mood',
      'officialAction',
      'phoneAction',
    ],
    price,
    google: {
      googleMapsUri,
      websiteUri: readText(place.websiteUri),
      phone: readText(place.nationalPhoneNumber),
      currentOpeningHours: place.currentOpeningHours?.weekdayDescriptions,
      priceLevel: readText(place.priceLevel),
      priceRange: place.priceRange,
    },
  };
}

function toVerifiedGoogleJpyPrice(
  range: GooglePlacesPriceRange | undefined,
): ExternalCandidatePoolRecord['price'] | undefined {
  const start = toWholeJpy(range?.startPrice);
  const end = toWholeJpy(range?.endPrice);
  if (start === null || end === null || start >= end) return undefined;

  return {
    minimum: start,
    maximum: end,
    // Google defines endPrice as exclusive; keep that visible rather than
    // presenting the provider range as a Nagotosha-reviewed menu price.
    label: `¥${start.toLocaleString('ja-JP')}〜¥${end.toLocaleString('ja-JP')}未満（Google Maps情報）`,
  };
}

function toWholeJpy(value: GooglePlacesMoney | undefined): number | null {
  if (!value || value.currencyCode !== 'JPY' || !/^\d+$/.test(value.units ?? '')) return null;
  if (value.nanos !== undefined && value.nanos !== 0) return null;
  const units = Number(value.units);
  return Number.isSafeInteger(units) && units >= 0 ? units : null;
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
