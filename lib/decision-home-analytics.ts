import type { HomeAnalyticsEvent } from '@/types/decision-home';

export function logDecisionHomeEvent(event: HomeAnalyticsEvent): void {
  if (process.env.NODE_ENV !== 'development') return;
  // Development-only, local structured logging. No external transport or personal data.
  console.debug('[decision-home]', event);
}
