import { getWordPressApiBase, getWordPressPosts } from '@/lib/wordpress-fetch';
import type { WordPressPost } from '@/types/portal';

export default async function WordPressStatusPage() {
  const hasApiBase = Boolean(getWordPressApiBase());
  const posts = await getWordPressPosts({ perPage: 3 });
  const hasPosts = posts.length > 0;

  return (
    <main
      className="min-h-dvh pb-28"
      style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f7fbff 42%, #ffffff 100%)' }}
    >
      <section className="relative overflow-hidden px-5 pt-7 pb-6">
        <div
          className="absolute inset-x-0 top-0 h-56"
          style={{
            background:
              'radial-gradient(circle at 18% 8%, rgba(255,255,255,0.92) 0%, transparent 36%), radial-gradient(circle at 86% 20%, rgba(10,154,154,0.14) 0%, transparent 34%)',
          }}
        />
        <div className="relative">
          <p className="mb-3 text-[10px] font-black tracking-[0.22em]" style={{ color: '#0a9a9a' }}>
            WORDPRESS STATUS
          </p>
          <h1 className="text-[27px] font-black leading-tight tracking-tight" style={{ color: '#0a2438' }}>
            WordPress接続ステータス
          </h1>
          <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>
            記事データの取得状況を確認するための内部確認ページです。
          </p>
        </div>
      </section>

      <section className="px-4">
        <div className="grid gap-3">
          <StatusCard
            label="API設定"
            value={hasApiBase ? '設定済み' : '未設定'}
            tone={hasApiBase ? 'ok' : 'muted'}
            description="WORDPRESS_API_BASE の有無だけを確認します。URL全文は表示しません。"
          />
          <StatusCard
            label="取得結果"
            value={hasPosts ? `${posts.length}件取得` : '取得なし'}
            tone={hasPosts ? 'ok' : 'muted'}
            description="getWordPressPosts({ perPage: 3 }) で最新記事の取得可否を確認します。"
          />
          <StatusCard
            label="表示モード"
            value={hasPosts ? 'WordPress記事を使用可能' : '静的フォールバックを使用'}
            tone={hasPosts ? 'ok' : 'fallback'}
            description="/new は取得できない場合でも編集部のおすすめ記事を表示します。"
          />
        </div>
      </section>

      <section className="px-4 pt-5">
        <div
          className="rounded-2xl bg-white p-4"
          style={{
            border: '1px solid rgba(29,91,115,0.10)',
            boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[0.16em]" style={{ color: '#0a9a9a' }}>
                LATEST POSTS
              </p>
              <h2 className="mt-1 text-[17px] font-black" style={{ color: '#0a2438' }}>
                取得できた記事
              </h2>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black"
              style={{ color: '#1d5b73', background: 'rgba(10,154,154,0.10)' }}
            >
              最大3件
            </span>
          </div>

          {hasPosts ? (
            <div className="grid gap-2">
              {posts.map(post => (
                <PostTitleRow key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl px-3 py-3 text-[12px] font-bold leading-6" style={{ color: '#6f8994', background: '#f4f9fc' }}>
              WordPress記事は取得できていません。/new では静的フォールバックの記事を表示します。
            </p>
          )}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(29,91,115,0.04)',
            border: '1px solid rgba(29,91,115,0.08)',
          }}
        >
          <p className="text-[11px] font-medium leading-6" style={{ color: '#8aa5b0' }}>
            このページでは秘密情報、トークン、WordPress APIのURL全文は表示しません。本番設定前後の接続確認だけに使います。
          </p>
        </div>
      </section>
    </main>
  );
}

function StatusCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: 'ok' | 'fallback' | 'muted';
}) {
  const color = tone === 'ok' ? '#0a9a9a' : tone === 'fallback' ? '#1d5b73' : '#6f8994';
  const background = tone === 'ok' ? 'rgba(10,154,154,0.10)' : tone === 'fallback' ? 'rgba(29,91,115,0.08)' : '#f4f9fc';

  return (
    <article
      className="rounded-2xl bg-white p-4"
      style={{
        border: '1px solid rgba(29,91,115,0.10)',
        boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black tracking-[0.12em]" style={{ color: '#8aa5b0' }}>
            {label}
          </p>
          <h2 className="mt-2 text-[18px] font-black leading-snug" style={{ color: '#0a2438' }}>
            {value}
          </h2>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{ color, background }}
        >
          {tone === 'ok' ? 'OK' : tone === 'fallback' ? 'FALLBACK' : 'CHECK'}
        </span>
      </div>
      <p className="mt-3 text-[12px] font-medium leading-6" style={{ color: '#5a7b8a' }}>
        {description}
      </p>
    </article>
  );
}

function PostTitleRow({ post }: { post: WordPressPost }) {
  const title = formatPostTitle(post.title.rendered);

  return (
    <div
      className="rounded-xl px-3 py-3"
      style={{
        background: '#f4f9fc',
        border: '1px solid rgba(29,91,115,0.08)',
      }}
    >
      <p className="text-[12px] font-black leading-6" style={{ color: '#0a2438' }}>
        {title || 'タイトル未設定'}
      </p>
    </div>
  );
}

function formatPostTitle(value: string): string {
  return decodeHtmlEntities(stripHtml(value)).trim();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

function decodeHtmlEntities(value: string): string {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => entities[name] ?? match);
}
