import type { Metadata } from 'next';
import { EditorialEventShell } from '@/components/editorial/EditorialEventShell';
import { FEATURED_ARTICLES } from '@/data/portal';
import { getArticleExperience } from '@/lib/article-experience';
import { getPortalArticlesWithFallback } from '@/lib/wordpress-fetch';

const description = '名古屋のイベント、期間限定情報、季節の特集記事をまとめて探せます。';

export const metadata: Metadata = {
  title: '名古屋のイベント・季節情報｜なごとしゃ',
  description,
  alternates: { canonical: '/event' },
  openGraph: {
    title: '名古屋のイベント・季節情報｜なごとしゃ',
    description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '名古屋のイベント・季節情報｜なごとしゃ',
    description,
    images: ['/opengraph-image'],
  },
};

export default async function EventPage() {
  // Keep the existing portal retrieval active. This shell reads the separate,
  // verified event-roundup data for the calendar, without changing the fetch contract.
  await getPortalArticlesWithFallback(FEATURED_ARTICLES, { perPage: 40 });
  const eventRoundup = getArticleExperience(221)?.eventRoundup;

  return (
    <EditorialEventShell
      items={eventRoundup?.items ?? []}
      filters={eventRoundup?.filters ?? []}
    />
  );
}
