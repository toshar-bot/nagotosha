import type { FeaturedArticle } from '@/types/portal';

export const EXCLUDED_IDS = new Set<string>();

export type GachaArticle = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  articleUrl: string;
  tag?: string;
  area?: string;
};

type GachaSourceArticle = Pick<FeaturedArticle, 'id' | 'title'> &
  Partial<Pick<FeaturedArticle, 'description' | 'imageUrl' | 'articleUrl' | 'tag' | 'area'>>;

export function buildGachaPool(articles: GachaSourceArticle[]): GachaArticle[] {
  const seen = new Set<string>();
  const pool: GachaArticle[] = [];

  for (const article of articles) {
    const id = String(article.id || '').trim();
    const title = clean(article.title);
    const description = clean(article.description);
    const imageUrl = clean(article.imageUrl);
    const articleUrl = resolveGachaArticleUrl(article);

    if (!id || EXCLUDED_IDS.has(id) || seen.has(id)) continue;
    if (!title || !description || !imageUrl || !articleUrl) continue;

    seen.add(id);
    pool.push({
      id,
      title,
      description,
      imageUrl,
      articleUrl,
      tag: clean(article.tag),
      area: clean(article.area),
    });
  }

  return pool;
}

export function resolveGachaArticleUrl(article: Pick<GachaSourceArticle, 'id' | 'articleUrl'>) {
  const id = String(article.id || '').trim();
  const wpId = id.match(/^wp-(\d+)$/)?.[1];
  if (wpId) return `/article/${wpId}`;

  const href = clean(article.articleUrl);
  if (href?.startsWith('/article/')) return href;

  return undefined;
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
