import { DECISION_FRESHNESS_POLICY } from './decision-freshness-policy';
import type { DecisionVerificationGovernancePolicy } from '../types/decision-verification-governance';

export const DECISION_VERIFICATION_GOVERNANCE_POLICY: DecisionVerificationGovernancePolicy = {
  version: 'phase-2a.6-v1',
  freshnessPolicyVersion: DECISION_FRESHNESS_POLICY.version,
  minimumCoolingOffHours: 24,
  requiredBaseFactKeys: [
    'currentStatus',
    'openingHours',
    'price',
    'officialUrl',
    'location',
    'editorialClassification',
    'relationship',
  ],
  prohibitedActorIds: [
    'ai',
    'assistant',
    'bot',
    'chatgpt',
    'claude',
    'codex',
    'openai',
    'system',
  ],
};
