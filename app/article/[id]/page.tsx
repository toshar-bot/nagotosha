import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWordPressPostById } from '@/lib/wordpress-fetch';
import { stripHtml, decodeHtmlEntities, getFeaturedMediaUrl } from '@/lib/wordpress';
import { getArticleExperience, getFakeSaveCount } from '@/lib/article-experience';
import { ArticleExperience } from '@/components/article/ArticleExperience';

type Params = { id: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getWordPressPostById(params.id);
  if (!post) return { title: '記事が見つかりません | なごとしゃ' };

  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const description = stripHtml(post.excerpt?.rendered ?? '').slice(0, 160);
  const imageUrl = getFeaturedMediaUrl(post);

  return {
    title: `${title} | なごとしゃ`,
    description: description || title,
    openGraph: {
      title,
      description: description || title,
      type: 'article',
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || title,
      images: imageUrl ? [imageUrl] : ['/opengraph-image'],
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const post = await getWordPressPostById(params.id);
  if (!post) notFound();

  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const excerpt = stripHtml(post.excerpt?.rendered ?? '').slice(0, 120);
  const content = post.content?.rendered ?? '';
  const imageUrl = getFeaturedMediaUrl(post);
  const meta = post.meta ?? {};

  const area = typeof meta.area === 'string' && meta.area.trim() ? meta.area.trim() : undefined;
  const tag = typeof meta.category === 'string' && meta.category.trim() ? meta.category.trim() : '記事';
  const mapUrl = typeof meta.mapUrl === 'string' && meta.mapUrl.trim() ? meta.mapUrl.trim() : undefined;
  const storeName = typeof meta.storeName === 'string' && meta.storeName.trim() ? meta.storeName.trim() : undefined;
  const address = typeof meta.address === 'string' && meta.address.trim() ? meta.address.trim() : undefined;
  const imageCredit = typeof meta.imageCredit === 'string' && meta.imageCredit.trim() ? meta.imageCredit.trim() : undefined;
  const imageSourceUrl = typeof meta.imageSourceUrl === 'string' && meta.imageSourceUrl.trim() ? meta.imageSourceUrl.trim() : undefined;

  const publishedDate = new Date(post.date);
  const dateStr = Number.isNaN(publishedDate.getTime())
    ? ''
    : `${publishedDate.getFullYear()}.${String(publishedDate.getMonth() + 1).padStart(2, '0')}.${String(publishedDate.getDate()).padStart(2, '0')}`;

  const articleId = `wp-${post.id}`;
  const experience = getArticleExperience(post.id);
  const saveCount = getFakeSaveCount(post.id);

  return (
    <ArticleExperience
      title={title}
      excerpt={excerpt}
      content={content}
      imageUrl={imageUrl ?? undefined}
      imageCredit={imageCredit}
      imageSourceUrl={imageSourceUrl}
      area={area}
      tag={tag}
      mapUrl={mapUrl}
      officialUrl={experience?.officialUrl}
      storeName={storeName}
      address={address}
      dateStr={dateStr}
      articleId={articleId}
      postId={post.id}
      postLink={post.link}
      saveCount={saveCount}
      experience={experience}
    />
  );
}
