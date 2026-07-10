import Link from 'next/link';
import type { FeaturedArticle } from '@/types/portal';

type Props = {
  article: FeaturedArticle;
};

export function MoodArticleCard({ article }: Props) {
  const href = article.id.startsWith('wp-')
    ? `/article/${article.id.slice(3)}`
    : article.articleUrl ?? '/new';

  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-[18px] bg-white no-underline"
      style={{
        border: '1px solid #E6ECF5',
        boxShadow: '0 8px 24px rgba(7,26,77,0.08)',
        color: '#0F172A',
      }}
    >
      <div className="flex gap-3 p-3">
        <div
          className="h-[92px] w-[108px] shrink-0 overflow-hidden rounded-[14px]"
          style={{
            background: article.imageUrl
              ? `center / cover no-repeat url("${article.imageUrl}")`
              : article.bg,
          }}
        />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ color: '#E8483F', background: 'rgba(232,72,63,.08)' }}>
              {article.tag}
            </span>
            {article.area && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ color: '#071A4D', background: 'rgba(7,26,77,.06)' }}>
                {article.area}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
            {article.title}
          </h2>
          {article.description && (
            <p
              className="mt-1 text-[11px] font-bold leading-5"
              style={{
                color: '#667085',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {article.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
