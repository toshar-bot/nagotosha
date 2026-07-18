import type { Metadata } from 'next';
import type { FeaturedArticle } from '@/types/portal';
import { FEATURED_ARTICLES } from '@/data/portal';
import { getLatestPortalArticles } from '@/lib/wordpress-fetch';
import { getArticleExperience } from '@/lib/article-experience';
import { OFFICIAL_INSTAGRAM_URL, SITE_ALTERNATE_NAME, SITE_NAME, siteUrl } from '@/lib/site';
import PortalHomeClient from '@/components/PortalHomeClient';

// WP REST取得が失敗しても、テンプレート完成済みの公開記事を新着に最低限出すための保証枠。
// WP取得が成功した場合はWP記事も併用する。
const GUARANTEED_ARTICLE_IDS = [92, 83, 79] as const;

function buildGuaranteedArticles(): FeaturedArticle[] {
  return GUARANTEED_ARTICLE_IDS.map((id) => {
    const exp = getArticleExperience(id);
    const shop = exp?.shop;
    const tag = shop ? '新店' : exp?.layout === 'news' ? '新店まとめ' : '特集';
    return {
      id: `wp-${id}`,
      title: exp?.heroTitle ?? '',
      description: shop?.summary ?? exp?.lead ?? '',
      tag,
      articleUrl: `/article/${id}`,
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
  '名古屋の新店、グルメ、イベント、おでかけ情報を写真でサクッと探せる、なごとしゃの地域情報ポータルです。';
const topUrl = siteUrl('/');
const ogImageUrl = siteUrl('/opengraph-image');
const logoUrl = siteUrl('/subjects/nagotosha-header-complete.png');

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: topUrl },
  openGraph: {
    title,
    description,
    type: 'website',
    url: topUrl,
    siteName: SITE_NAME,
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImageUrl],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${topUrl}#website`,
  url: topUrl,
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAME,
  inLanguage: 'ja',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${topUrl}#organization`,
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAME,
  url: topUrl,
  logo: {
    '@type': 'ImageObject',
    url: logoUrl,
  },
  sameAs: [OFFICIAL_INSTAGRAM_URL],
};

export const revalidate = 300;

function toTime(publishedAt: string | undefined): number {
  if (!publishedAt) return 0;
  const t = new Date(publishedAt).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default async function PortalPage() {
  const wpArticles = await getLatestPortalArticles();
  const gachaSourceArticles = await getLatestPortalArticles({ perPage: 30 });
  const guaranteed = buildGuaranteedArticles();
  const wpIds = new Set(wpArticles.map((a) => a.id));
  // WP取得分を正とし、保証枠(79/83/92)はWP取得に含まれない場合のみ補完する。
  // 「新着記事」の名に合わせ、必ず公開日の降順に並べる。保証枠を先頭に固定しない。
  const merged = [...wpArticles, ...guaranteed.filter((a) => !wpIds.has(a.id))].sort(
    (a, b) => toTime(b.publishedAt) - toTime(a.publishedAt),
  );
  const featuredArticles = merged.length > 0 ? merged : FEATURED_ARTICLES;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <PortalHomeClient featuredArticles={featuredArticles} gachaSourceArticles={gachaSourceArticles} />
    </>
  );
}
