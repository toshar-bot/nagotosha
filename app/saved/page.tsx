import type { Metadata } from 'next';
import SavedPageClient from '@/components/SavedPageClient';

const description = '気になる記事やお店、イベントを保存してあとから見返せます。';

export const metadata: Metadata = {
  title: '保存した記事｜なごとしゃ',
  description,
  openGraph: {
    title: '保存した記事｜なごとしゃ',
    description,
    type: 'website',
  },
};

export default function SavedPage() {
  return <SavedPageClient />;
}
