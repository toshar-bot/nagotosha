/**
 * Synthetic, test-only API-shape fixture. It is not a Google response, is
 * never displayed, and deliberately contains no real Place content. Google
 * Place IDs may be retained at runtime; provider response bodies are not
 * committed to this repository.
 */
export const GOOGLE_PLACES_CONTRACT_FIXTURE = {
  places: [
    {
      id: 'places/contract-fixture-cafe-001',
      displayName: { text: 'Contract fixture cafe' },
      primaryType: 'cafe',
      businessStatus: 'OPERATIONAL',
      location: { latitude: 35.1694, longitude: 136.9081 },
      formattedAddress: 'Contract fixture address',
      currentOpeningHours: { weekdayDescriptions: ['Mon-Sun: 10:00-20:00'] },
      priceLevel: 'PRICE_LEVEL_MODERATE',
      priceRange: 'provider-reported',
      googleMapsUri: 'https://maps.google.com/?q=contract-fixture-cafe-001',
      websiteUri: 'https://example.invalid/contract-fixture-cafe-001',
      nationalPhoneNumber: '+81-00-0000-0000',
    },
  ],
} as const;
