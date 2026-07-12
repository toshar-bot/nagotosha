'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Ga4ParamValue = string | number | boolean | undefined;

export function trackGa4Event(
  eventName: string,
  params: Record<string, Ga4ParamValue> = {},
) {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    );
    window.gtag('event', eventName, cleanParams);
  } catch {
    // Analytics should never block the UI.
  }
}
