import type { Metadata } from 'next';
import DecisionV3App from '@/components/decision-v3/DecisionV3App';

export const metadata: Metadata = {
  title: 'なごとしゃ Decision Functional Preview v3',
  description: 'なごとしゃ意思決定コンシェルジュの隔離機能Previewです。',
  robots: 'noindex, nofollow, noarchive',
};

export default function DecisionFunctionalPreviewV3Page() {
  const demoAllowed = process.env.NODE_ENV === 'development'
    || process.env.VERCEL_ENV === 'preview'
    || process.env.VERCEL_ENV === 'development';
  const candidateSource = demoAllowed ? 'demo' : 'formal';

  return <DecisionV3App candidateSource={candidateSource} />;
}
