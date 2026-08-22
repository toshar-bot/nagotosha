import type { Metadata } from 'next';
import { OFFICIAL_INSTAGRAM_URL, SITE_ALTERNATE_NAME, SITE_NAME, siteUrl } from '@/lib/site';
import HomeFunctionalPreview from '@/components/decision-home/HomeFunctionalPreview';

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

export default function HomePage() {
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
      <HomeFunctionalPreview />
    </>
  );
}
