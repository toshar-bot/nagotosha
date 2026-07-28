const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedDecisionV3Motion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function scrollDecisionV3ElementIntoView(
  element: Element | null,
  options: Omit<ScrollIntoViewOptions, 'behavior'> = {},
) {
  element?.scrollIntoView({
    ...options,
    behavior: prefersReducedDecisionV3Motion() ? 'auto' : 'smooth',
  });
}

export function scrollDecisionV3WindowTo(
  options: Omit<ScrollToOptions, 'behavior'>,
) {
  if (typeof window === 'undefined') return;
  window.scrollTo({
    ...options,
    behavior: prefersReducedDecisionV3Motion() ? 'auto' : 'smooth',
  });
}
