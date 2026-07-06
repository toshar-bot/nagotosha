import type { Metadata } from 'next';
import type { FeaturedArticle } from '@/types/portal';
import { FEATURED_ARTICLES } from '@/data/portal';
import { getLatestPortalArticles } from '@/lib/wordpress-fetch';
import { getArticleExperience } from '@/lib/article-experience';
import PortalHomeClient from '@/components/PortalHomeClient';

// WP REST取得が(ビルド時/実行時に)失敗しても、テンプレ完成済みの公開記事を
// 新着に最低限出すための保証枠。WP取得が成功した場合はWP記事も併用する。
const GUARANTEED_ARTICLE_IDS = [92, 83, 79] as const;

function buildGuaranteedArticles(): FeaturedArticle[] {
  return GUARANTEED_ARTICLE_IDS.map((id) => {
    const exp = getArticleExperience(id);
    const shop = exp?.shop;
    const tag = shop ? '新店' : exp?.layout === 'news' ? '新店まとめ' : '特集';
    return {
      id: `wp-${id}`,
      title: exp?.heroTitle ?? '',
      tag,
      area: shop?.areaLabel ?? '名古屋',
      imageUrl: shop?.imageUrl ?? exp?.visual?.imageUrl ?? '',
      publishedAt: shop?.publishDate ?? '2026-07-04',
      isNew: true,
      bg: '#ffffff',
      accentColor: '#E8483F',
    } as FeaturedArticle;
  });
}

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

export const revalidate = 300;

export default async function PortalPage() {
  const wpArticles = await getLatestPortalArticles();
  const guaranteed = buildGuaranteedArticles();
  const seen = new Set(guaranteed.map((a) => a.id));
  // 保証枠(79/83/92)を先頭に、WP取得分から重複を除いて続ける。
  // WP取得が失敗しても保証枠だけは必ず新着に出る(モックには落とさない)。
  const merged = [...guaranteed, ...wpArticles.filter((a) => !seen.has(a.id))];
  const featuredArticles = merged.length > 0 ? merged : FEATURED_ARTICLES;

  return <PortalHomeClient featuredArticles={featuredArticles} />;
}
