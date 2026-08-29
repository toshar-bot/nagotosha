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

export function trackAnalyticsEvent(
  name: DecisionFunnelEventName,
  parameters: Readonly<Record<string, AnalyticsParameterValue>>,
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const payload = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined && value !== null),
  );

  window.gtag('event', name, payload);
}
