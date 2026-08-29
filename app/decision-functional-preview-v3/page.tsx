import type { Metadata } from 'next';
import { headers } from 'next/headers';
import DecisionV3App from '@/components/decision-v3/DecisionV3App';
import { getDecisionV3CandidatesForSource } from '@/lib/decision-v3-candidate-lookup';
import {
  EXTERNAL_CANDIDATE_POOL_PREVIEW_FLAG,
  getExternalPreviewDecisionV3CandidatesWithGoogle,
} from '@/lib/external-candidate-pool';
import {
  GOOGLE_PLACES_REQUEST_HEADER,
  isGooglePlacesPreviewProviderEnabled,
} from '@/lib/google-places-policy';
import type { AreaChoice } from '@/types/decision-v3';

export const metadata: Metadata = {
  title: 'なごとしゃ Decision Functional Preview v3',
  description: 'なごとしゃ意思決定コンシェルジュの隔離機能Previewです。',
  robots: 'noindex, nofollow, noarchive',
};

// Formal eligibility/freshness is evaluated at request time. Preview still
// opts into DEMO data explicitly; production has no DEMO fallback.
export const dynamic = 'force-dynamic';

type Props = {
  searchParams?: { externalArea?: string };
};

export default async function DecisionFunctionalPreviewV3Page({ searchParams }: Props) {
  const demoAllowed = process.env.NODE_ENV === 'development'
    || process.env.VERCEL_ENV === 'preview'
    || process.env.VERCEL_ENV === 'development';
  const externalPoolEnabled = demoAllowed
    && process.env[EXTERNAL_CANDIDATE_POOL_PREVIEW_FLAG] === 'true';
  const allowGoogleRequest = externalPoolEnabled
    && isGooglePlacesPreviewProviderEnabled(process.env)
    && headers().get(GOOGLE_PLACES_REQUEST_HEADER) === '1';
  const candidateSource = demoAllowed ? 'demo' : 'formal';
  const activeCandidateSource = externalPoolEnabled ? 'external-preview' : candidateSource;
  const candidates = externalPoolEnabled
    ? await getExternalPreviewDecisionV3CandidatesWithGoogle(
      readExternalArea(searchParams?.externalArea),
      allowGoogleRequest,
    )
    : getDecisionV3CandidatesForSource(candidateSource);

  return <DecisionV3App candidateSource={activeCandidateSource} candidates={candidates} />;
}

function readExternalArea(value: string | undefined): Exclude<AreaChoice, 'any'> | null {
  return value === 'meieki' || value === 'sakae' || value === 'osu' ? value : null;
}
