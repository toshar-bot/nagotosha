/**
 * Diagnostic-only Google Places policy. This module is not part of a Web
 * entry chain. Local one-shot callers must explicitly opt in via their process
 * environment; no deployed environment, cookie or request header can grant it.
 */
/**
 * Monthly/daily usage needs Cloud quota plus durable shared state. D1 has
 * neither configured, so an app deployment must never enable Google in
 * Production.
 */
export const GOOGLE_PRODUCTION_READY = false;

export type GooglePlacesEnvironment = {
  NODE_ENV?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
  GOOGLE_PLACES_PROVIDER_ENABLED?: string;
  GOOGLE_PLACES_LOCAL_DIAGNOSTIC_ENABLED?: string;
  GOOGLE_PLACES_DIAGNOSTIC_CONTEXT?: string;
};

export function isGooglePlacesLocalDiagnosticEnabled(
  environment: GooglePlacesEnvironment,
): boolean {
  return environment.NODE_ENV === 'production'
    && environment.VERCEL === undefined
    && environment.VERCEL_ENV === undefined
    && environment.GOOGLE_PLACES_PROVIDER_ENABLED === 'true'
    && environment.GOOGLE_PLACES_LOCAL_DIAGNOSTIC_ENABLED === 'true'
    && environment.GOOGLE_PLACES_DIAGNOSTIC_CONTEXT === 'local-one-shot'
    && GOOGLE_PRODUCTION_READY === false;
}
