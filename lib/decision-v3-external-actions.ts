import { isSafeExternalUrl } from '@/lib/decision-safety';
import type {
  DecisionV3Candidate,
  DecisionV3ExternalProviderAction,
} from '@/types/decision-v3';

const PROVIDER_PHONE_PATTERN = /^\+?[0-9][0-9().\-\s]{5,30}$/;

/**
 * Provider actions are deliberately independent from the formal verified
 * action gate. A provider-returned URL is useful, but never becomes a
 * Nagotosha-verified official/map/phone action.
 */
export function getDecisionV3ExternalProviderActions(
  candidate: DecisionV3Candidate | undefined,
): readonly DecisionV3ExternalProviderAction[] {
  if (!candidate?.provenance) return [];
  return candidate.provenance.providerActions.filter(isSafeProviderAction);
}

export function isSafeProviderAction(
  action: DecisionV3ExternalProviderAction,
): boolean {
  if (!action.label.trim() || !action.href.trim()) return false;
  if (action.kind === 'phone') return isSafeTelephoneHref(action.href);
  return isSafeExternalUrl(action.href);
}

function isSafeTelephoneHref(value: string): boolean {
  if (!value.startsWith('tel:') || value.includes('?') || value.includes('#') || value.includes('\\')) {
    return false;
  }
  const number = value.slice('tel:'.length);
  return PROVIDER_PHONE_PATTERN.test(number);
}
