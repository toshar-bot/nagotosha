'use client';

type AnalyticsParameterValue = string | number | boolean | null | undefined;

/**
 * Provider identifiers and location/contact data are not analytics fields.
 * Keep this deny-list at the transport boundary so future callers fail safe.
 */
const FORBIDDEN_PROVIDER_ANALYTICS_PARAMETERS = new Set([
  'provider_entity_id',
  'providerEntityId',
  'google_place_id',
  'osm_entity_id',
  'provider_url',
  'googleMapsUri',
  'websiteUri',
  'nationalPhoneNumber',
  'formattedAddress',
  'osmId',
  'location',
  'phone',
  'address',
  'latitude',
  'longitude',
  'raw_response',
  'api_key',
  'user_location',
]);

export type DecisionFunnelEventName =
  | 'decision_start'
  | 'conditions_complete'
  | 'candidates_view'
  | 'candidate_detail_view'
  | 'compare_view'
  | 'store_decided'
  | 'map_click'
  | 'official_click'
  | 'phone_click';

export function isAnalyticsParameterAllowed(parameterName: string): boolean {
  return !FORBIDDEN_PROVIDER_ANALYTICS_PARAMETERS.has(parameterName);
}

export function trackAnalyticsEvent(
  name: DecisionFunnelEventName,
  parameters: Readonly<Record<string, AnalyticsParameterValue>>,
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const payload = Object.fromEntries(
    Object.entries(parameters).filter(([key, value]) => (
      isAnalyticsParameterAllowed(key) && value !== undefined && value !== null
    )),
  );

  window.gtag('event', name, payload);
}
