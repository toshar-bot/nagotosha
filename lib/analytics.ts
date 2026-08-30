'use client';

type AnalyticsParameterValue = string | number | boolean | null | undefined;

type AnalyticsParameterKey =
  | 'area'
  | 'budget'
  | 'candidate_count'
  | 'candidate_source'
  | 'compare_count'
  | 'party'
  | 'refine_count'
  | 'result_status'
  | 'source'
  | 'store_id'
  | 'surface';

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

const EVENT_PARAMETER_ALLOWLIST: Record<DecisionFunnelEventName, readonly AnalyticsParameterKey[]> = {
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

const CANDIDATE_SOURCES = new Set(['formal-reviewed', 'google', 'osm']);

/** Pure allow-list boundary used both by runtime and deterministic fixtures. */
export function isAnalyticsParameterAllowed(
  name: DecisionFunnelEventName,
  key: string,
  value: AnalyticsParameterValue,
): boolean {
  if (!EVENT_PARAMETER_ALLOWLIST[name].includes(key as AnalyticsParameterKey)) return false;
  if (value === null || value === undefined) return false;
  if (key === 'candidate_source') {
    return typeof value === 'string' && CANDIDATE_SOURCES.has(value);
  }
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export function sanitizeDecisionAnalyticsPayload(
  name: DecisionFunnelEventName,
  parameters: Readonly<Record<string, AnalyticsParameterValue>>,
): Record<string, string | number | boolean> {
  const allowedKeys = new Set(EVENT_PARAMETER_ALLOWLIST[name]);
  const payload: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(parameters)) {
    if (allowedKeys.has(key as AnalyticsParameterKey) && isAnalyticsParameterAllowed(name, key, value)) {
      payload[key] = value as string | number | boolean;
    }
  }

  return payload;
}

export function trackAnalyticsEvent(
  name: DecisionFunnelEventName,
  parameters: Readonly<Record<string, AnalyticsParameterValue>>,
): boolean {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false;

    window.gtag('event', name, sanitizeDecisionAnalyticsPayload(name, parameters));
    return true;
  } catch {
    return false;
  }
}
