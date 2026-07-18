import type { MetadataRoute } from 'next';
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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries = [
    { path: '/', priority: 1 },
    ...staticEntries,
  ];

  return entries.map(({ path, priority }) => ({
    url: siteUrl(path),
    lastModified,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority,
  }));
}
