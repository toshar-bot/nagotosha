import type { Metadata } from 'next';
import DecisionV3App from '@/components/decision-v3/DecisionV3App';
import { getDecisionV3CandidatesForSource } from '@/lib/decision-v3-candidate-lookup';

export const metadata: Metadata = {
  title: 'なごとしゃ Decision Functional Preview v3',
  description: 'なごとしゃ意思決定コンシェルジュの隔離機能Previewです。',
  robots: 'noindex, nofollow, noarchive',
};

// Formal eligibility/freshness is evaluated at request time. Preview still
// opts into DEMO data explicitly; production has no DEMO fallback.
export const dynamic = 'force-dynamic';

export default function DecisionFunctionalPreviewV3Page() {
  const demoAllowed = process.env.NODE_ENV === 'development'
    || process.env.VERCEL_ENV === 'preview'
    || process.env.VERCEL_ENV === 'development';
  const candidateSource = demoAllowed ? 'demo' : 'formal';
  const candidates = getDecisionV3CandidatesForSource(candidateSource);

  return <DecisionV3App candidateSource={candidateSource} candidates={candidates} />;
}
