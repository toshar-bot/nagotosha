import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWordPressPostById, getWordPressPosts } from '@/lib/wordpress-fetch';
import { stripHtml, decodeHtmlEntities, getFeaturedMediaUrl } from '@/lib/wordpress';
import { getArticleExperience, type ArticleRelated } from '@/lib/article-experience';
import { ArticleExperience } from '@/components/article/ArticleExperience';

type Params = { id: string };

const LOCAL_PREVIEW_POST_ID = '79';
// dev限定プレビュー用。post 79 公開後はWPのアイキャッチが自動で使われる(なごとしゃ自身のWPメディアID 80)
const LOCAL_PREVIEW_IMAGE_URL = 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-beer-garden-2026-eyecatch.png';
const PUBLIC_EXPERIENCE_FALLBACK_IDS = new Set(['79', '83', '92']);
const LOCAL_PREVIEW_TITLE = '名古屋ビアガーデン特集2026。夏に行きたい屋上・駅近スポットまとめ';
const LOCAL_PREVIEW_EXCERPT =
  '名古屋のビアガーデンを公式情報ベースでまとめました。名駅・栄・金山の屋上&駅近5会場の開催期間・営業時間・予約方法を紹介。雨の日対応や幹事向けの選び方も。2026年7月時点の情報です。';

function canUseLocalPreview(id: string) {
  return (
    PUBLIC_EXPERIENCE_FALLBACK_IDS.has(id) ||
    (process.env.NODE_ENV === 'development' && (id === LOCAL_PREVIEW_POST_ID || id === '83' || id === '92' || id === '104'))
  );
}

function getLocalPreviewData(id: string) {
  if (id === '92') {
    return {
      postId: 92,
      title: '【鶴舞・新店】PASTA MANIA 鶴舞店がオープン。ランチは通常営業、ディナーは予約制',
      excerpt: '鶴舞駅から徒歩約3分のパスタ専門店。ランチは通常営業、ディナーは完全予約制と案内されています。',
      imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pasta-mania-tsurumai-prtimes.jpg',
      tag: 'グルメ',
      dateStr: '2026.07.05',
      postLink: '/article/92',
    };
  }

  // 104 = 単品新店記事テンプレの未検証サンプル(dev限定・本番WPに存在しない)
  if (id === '104') {
    return {
      postId: 104,
      title: 'PIERRE MARCOLINI HAERA店が栄にオープン！ショコラ×カフェ×ギフトが楽しめる注目店',
      excerpt: '単品新店記事テンプレのdevelopmentプレビュー(未検証サンプル)。',
      imageUrl: undefined as string | undefined,
      tag: '新店',
      dateStr: '2026.07.04',
      postLink: '/article/104',
    };
  }

  if (id === '83') {
    return {
      postId: 83,
      title: 'Post83 local preview',
      excerpt: 'Local preview for Post83.',
      imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-new-open-2026-summer-eyecatch.png',
      tag: 'news',
      dateStr: '2026.07.04',
      postLink: '/article/83',
    };
  }

  const postId = Number(LOCAL_PREVIEW_POST_ID);
  return {
    postId,
    title: LOCAL_PREVIEW_TITLE,
    excerpt: LOCAL_PREVIEW_EXCERPT,
    imageUrl: LOCAL_PREVIEW_IMAGE_URL,
    tag: 'おでかけ',
    dateStr: '2026.07.03',
    postLink: '/article/79',
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getWordPressPostById(params.id);
  if (!post && canUseLocalPreview(params.id)) {
    const preview = getLocalPreviewData(params.id);
    const experience = getArticleExperience(preview.postId);
    const title = experience?.heroTitle ?? preview.title;
    const description = experience?.lead ?? preview.excerpt;
    return {
      title: `${title} | なごとしゃ`,
      description,
      alternates: { canonical: `/article/${params.id}` },
      robots: { index: false, follow: false },
    };
  }
  if (!post) return { title: '記事が見つかりません | なごとしゃ', alternates: { canonical: `/article/${params.id}` } };

  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const description = stripHtml(post.excerpt?.rendered ?? '').slice(0, 160);
  const imageUrl = getFeaturedMediaUrl(post);

  return {
    title: `${title} | なごとしゃ`,
    description: description || title,
    alternates: { canonical: `/article/${post.id}` },
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

/* ── WP記事本文からの店舗情報抽出（experience未定義の記事用） ──
   標準記事テンプレの「ラベル: 値」「<th>ラベル</th><td>値</td>」両形式に対応。
   取得できない項目は非表示にする（「確認中」等のプレースホルダは採用しない） */

const PLACEHOLDER_VALUE_PATTERN = /確認中|未定|不明|TBD|ダミー|サンプル/;
const NAGOYA_AREAS = [
  '名駅', '名古屋駅', '栄', '大須', '金山', '鶴舞', '新栄', '伏見', '久屋大通',
  '覚王山', '今池', '千種', '熱田', '名古屋港', '東山', '矢場町', '上前津', '丸の内', '納屋橋',
];

function extractBodyField(html: string, labels: string[]): string | undefined {
  for (const label of labels) {
    // 形式1: <th>ラベル</th><td>値</td> / <dt>ラベル</dt><dd>値</dd>
    const cellRe = new RegExp(
      `<(?:th|dt)[^>]*>\\s*${label}\\s*</(?:th|dt)>\\s*<(?:td|dd)[^>]*>([\\s\\S]*?)</(?:td|dd)>`,
    );
    const cellMatch = html.match(cellRe);
    if (cellMatch) {
      const value = stripHtml(cellMatch[1]).trim();
      if (isUsableValue(value)) return value;
    }
    // 形式2: ラベル: 値（本文テキスト）
    const text = html.replace(/<[^>]*>/g, '\n');
    const lineRe = new RegExp(`${label}\\s*[:：]\\s*([^\\n]+)`);
    const lineMatch = text.match(lineRe);
    if (lineMatch) {
      const value = lineMatch[1].trim();
      if (isUsableValue(value)) return value;
    }
  }
  return undefined;
}

function isUsableValue(value: string): boolean {
  return value.length > 0 && value.length <= 80 && !PLACEHOLDER_VALUE_PATTERN.test(value);
}

function deriveArea(address: string | undefined, title: string): string | undefined {
  for (const source of [address, title]) {
    if (!source) continue;
    for (const areaName of NAGOYA_AREAS) {
      if (source.includes(areaName)) {
        return areaName === '名古屋駅' ? '名駅' : areaName;
      }
    }
  }
  return undefined;
}

/* ── 30秒要点UIへの自動抽出 ──
   本文の「まず3行でわかる」(なければ「ここがポイント」)配下の箇条書きを要点として使う。
   該当が取れない記事では要点UI自体を非表示にする */

const QUICK_POINT_HEADINGS = ['まず3行でわかる', 'ここがポイント'];

function extractQuickPoints(html: string): string[] {
  for (const heading of QUICK_POINT_HEADINGS) {
    const sectionRe = new RegExp(
      `<h[23][^>]*>\\s*${heading}\\s*</h[23]>\\s*(?:<ul[^>]*>([\\s\\S]*?)</ul>|<p[^>]*>([\\s\\S]*?)</p>)`,
    );
    const match = html.match(sectionRe);
    if (!match) continue;
    const points = (match[1] ?? match[2] ?? '')
      .split(/<br\s*\/?>|<\/li>/)
      .map((part) => stripHtml(part).replace(/^[・•\s]+/, '').trim())
      .filter((point) => point.length > 0 && point.length <= 60 && !PLACEHOLDER_VALUE_PATTERN.test(point));
    if (points.length >= 2) return points.slice(0, 4);
  }
  return [];
}

function hasInlineQuickSummaryHeading(html: string): boolean {
  const headingRe = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let match = headingRe.exec(html);
  while (match) {
    const headingText = decodeHtmlEntities(stripHtml(match[1]))
      .replace(/\s+/g, '')
      .trim();
    if (headingText === 'まず3行でわかる' || headingText === 'まず3行で分かる') return true;
    match = headingRe.exec(html);
  }
  return false;
}

/* ── 関連記事の自動選定 ──
   同エリア > 同カテゴリ > 新しい順でスコアリングし3件返す。
   該当が少ない場合も新着順で自然に3件まで補完される */

async function buildRelatedArticles(
  currentPostId: number,
  currentArea: string | undefined,
  currentTag: string,
): Promise<ArticleRelated[]> {
  const posts = await getWordPressPosts({ perPage: 20 });
  const scored = posts
    .filter((p) => p.id !== currentPostId && !stripHtml(p.title.rendered).includes('【TEST】'))
    .map((p) => {
      const title = decodeHtmlEntities(stripHtml(p.title.rendered));
      const area = deriveArea(undefined, title);
      const tag = deriveCategory(p, undefined);
      let score = 0;
      if (currentArea && area === currentArea) score += 2;
      if (tag === currentTag) score += 1;
      return { post: p, title, area, tag, score };
    });

  scored.sort(
    (a, b) => b.score - a.score || Date.parse(b.post.date) - Date.parse(a.post.date),
  );

  return scored.slice(0, 3).map(({ post: p, title, area, tag }) => ({
    title,
    href: `/article/${p.id}`,
    label: area ?? tag,
    imageUrl: getFeaturedMediaUrl(p) ?? undefined,
  }));
}

const GENERIC_CATEGORY_NAMES = new Set(['記事', '未分類', 'uncategorized', 'blog']);

function deriveCategory(post: { _embedded?: { 'wp:term'?: unknown[][] } }, metaCategory?: string): string {
  if (metaCategory && !GENERIC_CATEGORY_NAMES.has(metaCategory)) return metaCategory;
  const termGroups = post._embedded?.['wp:term'] ?? [];
  for (const group of termGroups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      if (!term || typeof term !== 'object') continue;
      const t = term as { taxonomy?: unknown; name?: unknown };
      if (t.taxonomy !== 'category' || typeof t.name !== 'string') continue;
      const name = t.name.trim();
      if (name && !GENERIC_CATEGORY_NAMES.has(name.toLowerCase()) && !GENERIC_CATEGORY_NAMES.has(name)) {
        return name;
      }
    }
  }
  // 意味のある分類が取れない場合は「記事」ではなく「グルメ」に寄せる
  return 'グルメ';
}

export default async function ArticlePage({ params }: { params: Params }) {
  const post = await getWordPressPostById(params.id);
  if (!post && canUseLocalPreview(params.id)) {
    const preview = getLocalPreviewData(params.id);
    const experience = getArticleExperience(preview.postId);

    return (
      <ArticleExperience
        title={experience?.heroTitle ?? preview.title}
        excerpt={experience?.lead ?? preview.excerpt}
        content=""
        imageUrl={preview.imageUrl}
        tag={preview.tag}
        mapUrl={experience?.mapUrl}
        officialUrl={experience?.officialUrl}
        dateStr={preview.dateStr}
        articleId={`local-preview-${preview.postId}`}
        postId={preview.postId}
        postLink={preview.postLink}
        experience={experience}
      />
    );
  }

  if (!post) notFound();

  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const excerpt = stripHtml(post.excerpt?.rendered ?? '').slice(0, 120);
  const content = post.content?.rendered ?? '';
  const imageUrl = getFeaturedMediaUrl(post);
  const meta = post.meta ?? {};

  const metaArea = typeof meta.area === 'string' && meta.area.trim() ? meta.area.trim() : undefined;
  const metaCategory = typeof meta.category === 'string' && meta.category.trim() ? meta.category.trim() : undefined;
  const metaMapUrl = typeof meta.mapUrl === 'string' && meta.mapUrl.trim() ? meta.mapUrl.trim() : undefined;
  const metaStoreName = typeof meta.storeName === 'string' && meta.storeName.trim() ? meta.storeName.trim() : undefined;
  const metaAddress = typeof meta.address === 'string' && meta.address.trim() ? meta.address.trim() : undefined;
  const imageCredit = typeof meta.imageCredit === 'string' && meta.imageCredit.trim() ? meta.imageCredit.trim() : undefined;
  const imageSourceUrl = typeof meta.imageSourceUrl === 'string' && meta.imageSourceUrl.trim() ? meta.imageSourceUrl.trim() : undefined;

  // meta未設定でも本文の標準構成（店舗情報）からUIに反映する
  const storeName = metaStoreName ?? extractBodyField(content, ['店名', '店舗名']);
  const address = metaAddress ?? extractBodyField(content, ['住所', '所在地']);
  const hours = extractBodyField(content, ['営業時間']);
  const closed = extractBodyField(content, ['定休日', '休業日']);
  const price = extractBodyField(content, ['価格帯', '予算']);
  const openDate = extractBodyField(content, ['オープン日', 'オープン予定', '開店日']);
  const area = metaArea ?? deriveArea(address, title);
  const tag = deriveCategory(post, metaCategory);
  const mapUrl = metaMapUrl
    ?? (storeName || address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([storeName, address].filter(Boolean).join(' '))}`
      : undefined);

  const extraShopInfo = [
    openDate ? { label: 'オープン日', value: openDate } : undefined,
    hours ? { label: '営業時間', value: hours } : undefined,
    closed ? { label: '定休日', value: closed } : undefined,
    price ? { label: '価格帯', value: price } : undefined,
  ].filter(Boolean) as { label: string; value: string }[];

  const publishedDate = new Date(post.date);
  const dateStr = Number.isNaN(publishedDate.getTime())
    ? ''
    : `${publishedDate.getFullYear()}.${String(publishedDate.getMonth() + 1).padStart(2, '0')}.${String(publishedDate.getDate()).padStart(2, '0')}`;

  const articleId = `wp-${post.id}`;
  const experience = getArticleExperience(post.id);
  const suppressQuickSummary = hasInlineQuickSummaryHeading(content);
  const quickPoints = suppressQuickSummary ? [] : extractQuickPoints(content);
  const related = await buildRelatedArticles(post.id, area, tag);

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
      extraShopInfo={extraShopInfo.length > 0 ? extraShopInfo : undefined}
      quickPoints={quickPoints.length > 0 ? quickPoints : undefined}
      suppressQuickSummary={suppressQuickSummary}
      related={related.length > 0 ? related : undefined}
      dateStr={dateStr}
      articleId={articleId}
      postId={post.id}
      postLink={post.link}
      experience={experience}
    />
  );
}
