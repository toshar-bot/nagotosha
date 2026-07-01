import type { Metadata } from 'next';
import { FEATURED_ARTICLES } from '@/data/portal';
import { getPortalArticlesWithFallback } from '@/lib/wordpress-fetch';
import PortalHomeClient from '@/components/PortalHomeClient';

const title = 'なごとしゃ | 名古屋の新店・イベント・ごはんを探せるシティガイド';
const description =
  '名古屋の新店・イベント・ごはんを写真でサクッと探せる、なごとしゃの地域情報ポータルです。';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/opengraph-image'],
  },
};

export default async function PortalPage() {
  const featuredArticles = await getPortalArticlesWithFallback(FEATURED_ARTICLES);

  return <PortalHomeClient featuredArticles={featuredArticles} />;
}
