import Link from 'next/link';

const NAV_LINKS = [
  {
    href: '/',
    label: 'トップへ戻る',
    description: '名古屋のグルメ・イベント・おでかけ情報',
    icon: <HomeIcon />,
  },
  {
    href: '/new',
    label: '新着記事を見る',
    description: '新店オープンや話題のスポットをチェック',
    icon: <NewIcon />,
  },
  {
    href: '/event',
    label: 'イベントを探す',
    description: '今日行けるイベントや週末のおでかけ情報',
    icon: <CalendarIcon />,
  },
  {
    href: '/area',
    label: 'エリアから探す',
    description: '名駅・栄・大須などのエリア別に探す',
    icon: <MapIcon />,
  },
];

export default function NotFound() {
  return (
    <main
      className="min-h-dvh pb-28"
      style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}
    >
      {/* ── ヒーロー ── */}
      <section className="relative overflow-hidden px-5 pt-12 pb-8">
        <div
          className="absolute inset-x-0 top-0 h-64"
          style={{
            background:
              'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.90) 0%, transparent 38%), radial-gradient(circle at 80% 15%, rgba(10,154,154,0.12) 0%, transparent 36%)',
          }}
        />
        <div className="relative">
          {/* 404 大きめ表示 */}
          <p
            className="text-[56px] font-black leading-none tracking-tighter"
            style={{
              color: 'transparent',
              background: 'linear-gradient(135deg, #c8dff0 0%, #90c0d8 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            404
          </p>
          <h1
            className="mt-3 text-[22px] font-black leading-snug tracking-tight"
            style={{ color: '#0a2438' }}
          >
            ページが見つかりませんでした
          </h1>
          <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>
            お探しのページは移動したか、URLが間違っている可能性があります。
            名古屋のおでかけ情報は、以下のページから探せます。
          </p>
        </div>
      </section>

      {/* ── 区切り ── */}
      <div className="mx-5 mb-6" style={{ height: '1px', background: 'rgba(29,91,115,0.08)' }} />

      {/* ── 導線カード ── */}
      <section className="px-4">
        <div className="flex flex-col gap-3">
          {NAV_LINKS.map(nav => (
            <Link
              key={nav.href}
              href={nav.href}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 active:scale-[0.98] transition-transform"
              style={{
                border: '1px solid rgba(29,91,115,0.10)',
                boxShadow: '0 2px 10px rgba(10,36,56,0.05)',
              }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(29,91,115,0.08)' }}
              >
                {nav.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span
                  className="block text-[14px] font-black leading-snug"
                  style={{ color: '#0a2438' }}
                >
                  {nav.label}
                </span>
                <span
                  className="mt-0.5 block text-[11px] font-medium leading-5"
                  style={{ color: '#7a9aab' }}
                >
                  {nav.description}
                </span>
              </span>
              <ChevronRightIcon />
            </Link>
          ))}
        </div>
      </section>

      {/* ── 店舗向け小リンク ── */}
      <section className="px-4 pt-10">
        <div className="flex justify-center">
          <Link
            href="/partner"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-black active:scale-95 transition-transform"
            style={{
              color: '#1d5b73',
              background: 'rgba(29,91,115,0.07)',
              border: '1px solid rgba(29,91,115,0.14)',
            }}
          >
            店舗掲載・集客相談はこちら
            <ChevronRightIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ── SVGアイコン ── */
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d5b73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function NewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d5b73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d5b73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d5b73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a0b8c0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
