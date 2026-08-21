import { DECISION_FRESHNESS_POLICY } from './decision-freshness-policy';
import type { DecisionVerificationGovernancePolicy } from '../types/decision-verification-governance';

export const DECISION_VERIFICATION_GOVERNANCE_POLICY: DecisionVerificationGovernancePolicy = {
  version: 'phase-2a.6-v2',
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
  allowedArtifactChannelsByFact: {
    currentStatus: [
      'official-email',
      'official-form',
      'official-instagram',
      'official-document',
    ],
    openingHours: [
      'official-email',
      'official-form',
      'official-instagram',
      'official-document',
    ],
    price: [
      'official-email',
      'official-form',
      'official-instagram',
      'official-document',
    ],
    officialUrl: [
      'official-email',
      'official-form',
      'official-instagram',
      'official-document',
    ],
    location: [
      'official-email',
      'official-form',
      'official-instagram',
      'official-document',
    ],
    reservationChannel: [
      'official-email',
      'official-form',
      'official-instagram',
      'official-document',
    ],
    editorialClassification: ['editorial-note'],
    relationship: ['internal-ledger'],
    disclosure: ['internal-ledger', 'editorial-note'],
    visualRights: [
      'official-email',
      'official-form',
      'official-document',
      'internal-ledger',
    ],
  },
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
