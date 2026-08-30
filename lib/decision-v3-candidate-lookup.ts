import { DEMO_CANDIDATES } from '@/data/decision-v3-demo';
import { getActiveFormalDecisionV3Candidates } from '@/lib/decision-v3-formal-adapter';
import { getExternalPreviewDecisionV3Candidates } from '@/lib/external-candidate-pool';
import type { DecisionV3CandidateSource } from '@/lib/decision-v3-state';
import type { DecisionV3Candidate } from '@/types/decision-v3';

export type DecisionV3CandidateLookup = {
  source: DecisionV3CandidateSource;
  candidates: readonly DecisionV3Candidate[];
  get: (candidateId: string | null | undefined) => DecisionV3Candidate | undefined;
  has: (candidateId: string | null | undefined) => boolean;
};

/**
 * The only runtime candidate lookup used by Decision V3 surfaces. Candidate
 * screens receive this lookup instead of importing a source-specific registry.
 */
export function createDecisionV3CandidateLookup(
  source: DecisionV3CandidateSource,
  candidates: readonly DecisionV3Candidate[],
): DecisionV3CandidateLookup {
  const candidatesById = new Map<string, DecisionV3Candidate>();
  for (const candidate of candidates) {
    if (!candidatesById.has(candidate.id)) candidatesById.set(candidate.id, candidate);
  }

  return {
    source,
    candidates: Array.from(candidatesById.values()),
    get: (candidateId) => (candidateId ? candidatesById.get(candidateId) : undefined),
    has: (candidateId) => Boolean(candidateId && candidatesById.has(candidateId)),
  };
}

/**
 * Server-side source selection. Production never falls back to DEMO data;
 * formal candidates are release-gated by the adapter and can intentionally be
 * empty. Preview/development callers must explicitly request `demo`.
 */
export function getDecisionV3CandidatesForSource(
  source: DecisionV3CandidateSource,
  now = new Date(),
): readonly DecisionV3Candidate[] {
  if (source === 'demo') return DEMO_CANDIDATES;
  if (source === 'external-preview') return getExternalPreviewDecisionV3Candidates(now);
  return getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: toTokyoISODate(now),
    evaluatedAt: now.toISOString(),
  });
}

function toTokyoISODate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get('year')}-${byType.get('month')}-${byType.get('day')}`;
}
