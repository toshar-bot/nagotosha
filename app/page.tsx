import { FEATURED_ARTICLES } from '@/data/portal';
import { getPortalArticlesWithFallback } from '@/lib/wordpress-fetch';
import PortalHomeClient from '@/components/PortalHomeClient';

export default async function PortalPage() {
  const featuredArticles = await getPortalArticlesWithFallback(FEATURED_ARTICLES);

  return <PortalHomeClient featuredArticles={featuredArticles} />;
}
