// Pure helpers for Decision v3 store-detail external actions.
// No side effects, no selector/state involvement.

/**
 * Build a Google Maps Directions deep link that opens in the Google Maps app on
 * iOS/Android or in the browser on desktop. `api=1` is required by the
 * Google Maps URLs contract, and the destination must be URL-encoded.
 */
export function buildGoogleMapsDirectionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** True when an href should open in a new tab (everything except tel:/mailto:). */
export function isExternalHref(href: string): boolean {
  return /^https?:/i.test(href);
}
