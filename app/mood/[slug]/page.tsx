import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MoodArticleCard } from '@/components/MoodArticleCard';
import { MoodChips } from '@/components/MoodChips';
import { getMood, getOtherMoods, MOODS } from '@/data/moods';
import { getWordPressPostById } from '@/lib/wordpress-fetch';
import { normalizeWordPressPostToFeaturedArticle } from '@/lib/wordpress';
import type { FeaturedArticle, WordPressPost } from '@/types/portal';

type Params = {
  slug: string;
};

export function generateStaticParams() {
  return MOODS.map((mood) => ({ slug: mood.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const mood = getMood(params.slug);
  if (!mood) return { title: '気分が見つかりません | なごとしゃ' };
  return {
    title: `${mood.label} | 気分から探す | なごとしゃ`,
    description: `${mood.hint}に合わせて、なごとしゃ編集部が記事を選びました。`,
  };
}

export const revalidate = 300;

export default async function MoodPage({ params }: { params: Params }) {
  const mood = getMood(params.slug);
  if (!mood) notFound();

  const { articles } = await getMoodArticles(mood.slug, mood.articleIds);
  const otherMoods = getOtherMoods(mood.slug);

  return (
    <main className="min-h-dvh pb-28" style={{ background: 'linear-gradient(180deg,#FFFFFF 0%,#FFFDF7 55%,#FFFFFF 100%)' }}>
      <section className="px-4 pb-5 pt-6">
        <Link href="/" className="inline-flex items-center gap-1 text-[12px] font-black no-underline" style={{ color: '#E8483F' }}>
          ← トップへ戻る
        </Link>
        <p className="mt-6 text-[11px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
          MOOD PICKS
        </p>
        <h1 className="mt-1 text-[28px] font-black leading-tight" style={{ color: '#071A4D' }}>
          {mood.label}
        </h1>
        <p className="mt-2 text-[14px] font-black leading-6" style={{ color: '#071A4D' }}>
          {mood.hint}
        </p>
        <div
          className="mt-5 rounded-[18px] bg-white px-4 py-4"
          style={{ border: '1px solid #E6ECF5', boxShadow: '0 8px 22px rgba(7,26,77,.07)' }}
        >
          <p className="text-[12px] font-black tracking-[0.14em]" style={{ color: '#E8483F' }}>
            TOSHAR NOTE
          </p>
          <p className="mt-2 text-[14px] font-black leading-7" style={{ color: '#071A4D' }}>
            {mood.tosharLine}
          </p>
        </div>
      </section>

      <section className="px-4">
        <div className="flex flex-col gap-3">
          {articles.length > 0 ? (
            articles.map((article) => (
              <MoodArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div
              className="rounded-[18px] bg-white px-4 py-5"
              style={{ border: '1px solid #E6ECF5', boxShadow: '0 8px 22px rgba(7,26,77,.07)' }}
            >
              <p className="text-[14px] font-black leading-7" style={{ color: '#071A4D' }}>
                現在、この気分に合う記事を準備中です。
                <br />
                ほかの気分から探してみてください。
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pt-8">
        <p className="text-[11px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
          OTHER MOODS
        </p>
        <h2 className="mt-1 text-[18px] font-black" style={{ color: '#071A4D' }}>
          ほかの気分で探す
        </h2>
        <div className="mt-4">
          <MoodChips moods={otherMoods} />
        </div>
      </section>
    </main>
  );
}

async function getMoodArticles(
  moodSlug: string,
  articleIds: string[],
): Promise<{ articles: FeaturedArticle[]; missingIds: string[] }> {
  const entries = await Promise.all(
    articleIds.map(async (id) => ({
      id,
      post: await getWordPressPostById(id),
    })),
  );
  const publicEntries = entries.filter((entry): entry is { id: string; post: WordPressPost } => isPublicWordPressPost(entry.post));
  const missingIds = entries.filter((entry) => !isPublicWordPressPost(entry.post)).map((entry) => entry.id);

  if (process.env.NODE_ENV !== 'production' && missingIds.length > 0) {
    console.warn('[mood] article fetch mismatch', {
      moodSlug,
      configuredArticleIds: articleIds,
      missingArticleIds: missingIds,
      resolvedCount: publicEntries.length,
    });
  }

  return {
    articles: publicEntries.map((entry) => normalizeWordPressPostToFeaturedArticle(entry.post, { markAsNew: true })),
    missingIds,
  };
}

function isPublicWordPressPost(post: WordPressPost | null): post is WordPressPost {
  if (!post) return false;
  const status = (post as WordPressPost & { status?: unknown }).status;
  return status === undefined || status === 'publish';
}
