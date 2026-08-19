import type { Metadata } from 'next';
import DecisionHome from '@/components/decision-concierge/DecisionHome';

export const metadata: Metadata = {
  title: 'Decision Concierge Preview｜なごとしゃ',
  description: '確認済み情報から名古屋での過ごし方を考える、なごとしゃの意思決定コンシェルジュPreviewです。',
  robots: 'noindex, nofollow, noarchive',
};

export default function HomeDecisionPreviewPage() {
  return <DecisionHome />;
}
