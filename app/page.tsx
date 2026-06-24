import type { Metadata } from 'next';
import { FEATURED_ARTICLES } from '@/data/portal';
import { getPortalArticlesWithFallback } from '@/lib/wordpress-fetch';
import PortalHomeClient from '@/components/PortalHomeClient';

const description = '名古屋のグルメ、イベント、新店、エリア情報をスマホで見やすく届ける地域情報ポータルです。';

export const metadata: Metadata = {
  title: 'なごとしゃ｜名古屋のグルメ・イベント・おでかけ情報',
  description,
  openGraph: {
    title: 'なごとしゃ｜名古屋のグルメ・イベント・おでかけ情報',
    description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'なごとしゃ｜名古屋のグルメ・イベント・おでかけ情報',
    description,
    images: ['/opengraph-image'],
  },
};

export default async function PortalPage() {
  const featuredArticles = await getPortalArticlesWithFallback(FEATURED_ARTICLES);

  return <PortalHomeClient featuredArticles={featuredArticles} />;
}
