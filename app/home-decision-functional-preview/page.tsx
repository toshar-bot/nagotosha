import type { Metadata } from 'next';
import HomeFunctionalPreview from '@/components/decision-home/HomeFunctionalPreview';

export const metadata: Metadata = {
  title: 'Home Functional Preview｜なごとしゃ',
  description: 'なごとしゃDecision Homeの機能確認専用Previewです。',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function HomeDecisionFunctionalPreviewPage() {
  return <HomeFunctionalPreview />;
}
