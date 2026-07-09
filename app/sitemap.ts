import type { MetadataRoute } from 'next';

const siteUrl = 'https://app.nagotosha.com';

const sitemapEntries = [
  { path: '/', priority: 1 },
  { path: '/article/92', priority: 0.9 },
  { path: '/article/32', priority: 0.9 },
  { path: '/article/58', priority: 0.85 },
  { path: '/article/66', priority: 0.85 },
  { path: '/article/73', priority: 0.85 },
  { path: '/article/39', priority: 0.85 },
  { path: '/article/83', priority: 0.85 },
  { path: '/article/79', priority: 0.85 },
  { path: '/partner', priority: 0.7 },
  { path: '/new', priority: 0.7 },
  { path: '/area', priority: 0.7 },
  { path: '/event', priority: 0.7 },
  { path: '/partner/ad-policy', priority: 0.5 },
] satisfies Array<{ path: string; priority: number }>;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return sitemapEntries.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority,
  }));
}
