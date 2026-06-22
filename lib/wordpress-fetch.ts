import { FEATURED_ARTICLES } from '@/data/portal';
import { normalizeWordPressPostsToFeaturedArticles } from '@/lib/wordpress';
import type { FeaturedArticle, WordPressPost } from '@/types/portal';

export interface WordPressPostsParams {
  perPage?: number;
  page?: number;
  search?: string;
  categories?: string | number;
  tags?: string | number;
}

const DEFAULT_REVALIDATE_SECONDS = 300;
const DEFAULT_PER_PAGE = 10;
const MIN_PER_PAGE = 1;
const MAX_PER_PAGE = 100;

export function getWordPressApiBase(): string | null {
  const value = process.env.WORDPRESS_API_BASE?.trim();
  if (!value) return null;
  return value.replace(/\/+$/, '');
}

export function getWordPressRevalidateSeconds(): number {
  return parsePositiveInteger(
    process.env.WORDPRESS_REVALIDATE_SECONDS,
    DEFAULT_REVALIDATE_SECONDS,
  );
}

export function getWordPressDefaultPerPage(): number {
  return clamp(
    parsePositiveInteger(process.env.WORDPRESS_DEFAULT_PER_PAGE, DEFAULT_PER_PAGE),
    MIN_PER_PAGE,
    MAX_PER_PAGE,
  );
}

export function buildWordPressPostsUrl(params?: WordPressPostsParams): string | null {
  const apiBase = getWordPressApiBase();
  if (!apiBase) return null;

  const perPage = clamp(
    params?.perPage ?? getWordPressDefaultPerPage(),
    MIN_PER_PAGE,
    MAX_PER_PAGE,
  );

  const searchParams = new URLSearchParams({
    _embed: '1',
    per_page: String(perPage),
    orderby: 'date',
    order: 'desc',
  });

  if (params?.page !== undefined) {
    searchParams.set('page', String(Math.max(1, Math.floor(params.page))));
  }
  if (params?.search) {
    searchParams.set('search', params.search);
  }
  if (params?.categories !== undefined) {
    searchParams.set('categories', String(params.categories));
  }
  if (params?.tags !== undefined) {
    searchParams.set('tags', String(params.tags));
  }

  return `${apiBase}/posts?${searchParams.toString()}`;
}

export async function getWordPressPosts(params?: WordPressPostsParams): Promise<WordPressPost[]> {
  const url = buildWordPressPostsUrl(params);
  if (!url) return [];

  try {
    const response = await fetch(url, {
      next: { revalidate: getWordPressRevalidateSeconds() },
    });

    if (!response.ok) {
      console.warn('WordPress posts fetch failed');
      return [];
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];

    return data.filter(isWordPressPost);
  } catch {
    console.warn('WordPress posts fetch failed');
    return [];
  }
}

export async function getLatestPortalArticles(
  params?: WordPressPostsParams,
): Promise<FeaturedArticle[]> {
  const posts = await getWordPressPosts(params);
  if (posts.length === 0) return [];
  return normalizeWordPressPostsToFeaturedArticles(posts, { markAsNew: true });
}

export async function getPortalArticlesWithFallback(
  fallback?: FeaturedArticle[],
  params?: WordPressPostsParams,
): Promise<FeaturedArticle[]> {
  const articles = await getLatestPortalArticles(params);
  if (articles.length > 0) return articles;
  return fallback ?? FEATURED_ARTICLES;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isWordPressPost(value: unknown): value is WordPressPost {
  if (!value || typeof value !== 'object') return false;

  const post = value as Partial<WordPressPost>;
  return (
    typeof post.id === 'number' &&
    typeof post.date === 'string' &&
    typeof post.slug === 'string' &&
    typeof post.link === 'string' &&
    isRenderedField(post.title) &&
    isRenderedField(post.excerpt)
  );
}

function isRenderedField(value: unknown): value is WordPressPost['title'] {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { rendered?: unknown }).rendered === 'string'
  );
}
