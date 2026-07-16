import type { MetadataRoute } from 'next';
import { getWordPressPosts } from '@/lib/wordpress-fetch';
import { siteUrl } from '@/lib/site';

const staticEntries = [
  { path: '/partner', priority: 0.7 },
  { path: '/new', priority: 0.7 },
  { path: '/area', priority: 0.7 },
  { path: '/event', priority: 0.7 },
  { path: '/privacy', priority: 0.5 },
  { path: '/terms', priority: 0.5 },
  { path: '/partner/ad-policy', priority: 0.5 },
  { path: '/partner/report-sample', priority: 0.5 },
] satisfies Array<{ path: string; priority: number }>;

const fallbackPublishedArticleIds = [
  149, 167, 173, 178, 182, 143, 137, 131, 124, 115, 101, 92, 83, 79, 73, 66, 58, 39, 32,
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const posts = await getWordPressPosts({ perPage: 100 });
  const articleIds = posts.length > 0
    ? posts.map((post) => post.id)
    : [...fallbackPublishedArticleIds];

  const uniqueArticleIds = Array.from(new Set([...articleIds, ...fallbackPublishedArticleIds])).sort((a, b) => b - a);
  const articleEntries = uniqueArticleIds.map((id) => ({
    path: `/article/${id}`,
    priority: fallbackPublishedArticleIds.includes(id as typeof fallbackPublishedArticleIds[number]) ? 0.85 : 0.75,
  }));

  const entries = [
    { path: '/', priority: 1 },
    ...staticEntries,
    ...articleEntries,
  ];

  return entries.map(({ path, priority }) => ({
    url: siteUrl(path),
    lastModified,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority,
  }));
}
