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
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '保存した記事｜なごとしゃ',
    description,
    images: ['/opengraph-image'],
  },
};

export default function SavedPage() {
  return <SavedPageClient />;
}
