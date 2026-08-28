/**
 * Configuration-only Google Places policy. Every environment must explicitly
 * opt in; missing or unknown values are fail-closed.
 */
export const EXTERNAL_CANDIDATE_POOL_PREVIEW_FLAG = 'EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED';
export const GOOGLE_PLACES_PROVIDER_ENABLED_FLAG = 'GOOGLE_PLACES_PROVIDER_ENABLED';
export const GOOGLE_PLACES_PREVIEW_ENABLED_FLAG = 'GOOGLE_PLACES_PREVIEW_ENABLED';
export const GOOGLE_PLACES_SESSION_COOKIE = 'nago.d1.google-places-used';
export const GOOGLE_PLACES_REQUEST_HEADER = 'x-nagotosha-google-places-request';

/**
 * Monthly/daily usage needs Cloud quota plus durable shared state. D1 has
 * neither configured, so an app deployment must never enable Google in
 * Production.
 */
export const GOOGLE_PRODUCTION_READY = false;

export type GooglePlacesEnvironment = {
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED?: string;
  GOOGLE_PLACES_PROVIDER_ENABLED?: string;
  GOOGLE_PLACES_PREVIEW_ENABLED?: string;
};

export function isNonProductionPreviewEnvironment(environment: GooglePlacesEnvironment): boolean {
  return environment.NODE_ENV === 'development'
    || environment.VERCEL_ENV === 'preview'
    || environment.VERCEL_ENV === 'development';
}

export function isGooglePlacesPreviewProviderEnabled(
  environment: GooglePlacesEnvironment,
): boolean {
  return isNonProductionPreviewEnvironment(environment)
    && environment.EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED === 'true'
    && environment.GOOGLE_PLACES_PROVIDER_ENABLED === 'true'
    && environment.GOOGLE_PLACES_PREVIEW_ENABLED === 'true'
    && GOOGLE_PRODUCTION_READY === false;
}

/**
 * Pure request-budget decision shared by middleware and fixtures. The cookie
 * only limits a browser session; it is intentionally not treated as a
 * durable daily or monthly counter.
 */
export function shouldGrantGooglePlacesRequest(input: {
  environment: GooglePlacesEnvironment;
  externalAreaRequested: boolean;
  sessionRequestAlreadyUsed: boolean;
}): boolean {
  return isGooglePlacesPreviewProviderEnabled(input.environment)
    && input.externalAreaRequested
    && !input.sessionRequestAlreadyUsed;
}
