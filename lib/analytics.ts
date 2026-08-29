'use client';

type AnalyticsParameterValue = string | number | boolean | null | undefined;

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

export type DecisionCandidateAnalyticsSource = 'formal-reviewed' | 'google' | 'osm';

const DECISION_FUNNEL_EVENT_PARAMETER_ALLOW_LIST: Readonly<Record<
  DecisionFunnelEventName,
  readonly string[]
>> = {
  decision_start: ['party', 'source'],
  conditions_complete: ['party', 'area', 'budget', 'refine_count'],
  candidates_view: ['party', 'candidate_count', 'result_status'],
  candidate_detail_view: ['store_id', 'source', 'candidate_source'],
  compare_view: ['compare_count', 'source'],
  store_decided: ['store_id', 'compare_count', 'party', 'candidate_source'],
  map_click: ['store_id', 'surface', 'candidate_source'],
  official_click: ['store_id', 'surface', 'candidate_source'],
  phone_click: ['store_id', 'surface', 'candidate_source'],
};

const DECISION_CANDIDATE_ANALYTICS_SOURCES = new Set<DecisionCandidateAnalyticsSource>([
  'formal-reviewed',
  'google',
  'osm',
]);

export function isAnalyticsParameterAllowed(
  eventName: DecisionFunnelEventName,
  parameterName: string,
  value: AnalyticsParameterValue,
): boolean {
  if (!DECISION_FUNNEL_EVENT_PARAMETER_ALLOW_LIST[eventName].includes(parameterName)) return false;
  return parameterName !== 'candidate_source'
    || (typeof value === 'string' && DECISION_CANDIDATE_ANALYTICS_SOURCES.has(value as DecisionCandidateAnalyticsSource));
}

export function trackAnalyticsEvent(
  name: DecisionFunnelEventName,
  parameters: Readonly<Record<string, AnalyticsParameterValue>>,
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const payload = Object.fromEntries(
    Object.entries(parameters).filter(([key, value]) => (
      value !== undefined && value !== null && isAnalyticsParameterAllowed(name, key, value)
    )),
  );

  try {
    window.gtag('event', name, payload);
  } catch {
    // Analytics must never block a user-initiated Decision transition.
  }
}
