/**
 * Synthetic request-body contract for the Places API (New) Nearby Search.
 * It intentionally contains no credentials or provider response data.
 */
export const GOOGLE_PLACES_NEARBY_REQUEST_BODY_FIXTURE = {
  includedTypes: [
    'restaurant',
    'cafe',
    'fast_food_restaurant',
    'food_court',
    'ice_cream_shop',
  ],
  maxResultCount: 20,
  locationRestriction: {
    circle: {
      center: { latitude: 35.1694, longitude: 136.9081 },
      radius: 1_000,
    },
  },
  languageCode: 'ja',
} as const;
