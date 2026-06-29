import type { Metadata } from 'next';
import Link from 'next/link';
import { EventCardClient } from '@/components/EventCardClient';

const description = '今日行けるイベントや週末のおでかけ情報など、名古屋の注目イベントを探せます。';

export const metadata: Metadata = {
  title: '名古屋のイベント｜なごとしゃ',
  description,
  openGraph: {
    title: '名古屋のイベント｜なごとしゃ',
    description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '名古屋のイベント｜なごとしゃ',
    description,
    images: ['/opengraph-image'],
  },
};

const EVENT_FILTERS = [
  { label: '今日行ける',        text: '今から予定に入れやすいイベント',   icon: 'clock' },
  { label: '今週末',            text: '週末のおでかけ候補をまとめて確認', icon: 'sun' },
  { label: '雨の日でも楽しめる', text: '屋内や駅近で過ごしやすい催し',   icon: 'umbrella' },
  { label: '家族で行きたい',    text: '親子で楽しみやすい名古屋イベント', icon: 'heart' },
] as const;

const EVENTS = [
  {
    id: 'event-sakae-light',
    title: '栄 光のインスタレーション',
    area: '栄',
    tag: '夜のおでかけ',
    description: '仕事帰りに立ち寄れる、街なかのライトアップ展示。',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=75',
    startDate: '2026-06-20',
    endDate: '2026-07-20',
  },
  {
    id: 'event-kakuozan-market',
    title: '覚王山アパートメント秋市',
    area: '覚王山',
    tag: 'マーケット',
    description: '雑貨、焼き菓子、クラフト品が並ぶ週末マーケット。',
    imageUrl: 'https://images.unsplash.com/photo-1513125370-3460ebe3401b?auto=format&fit=crop&w=600&q=75',
    startDate: '2026-07-05',
    endDate: '2026-07-06',
  },
  {
    id: 'event-port-family',
    title: '名古屋港ファミリーデイ',
    area: '名古屋港',
    tag: '家族向け',
    description: '海辺を歩きながら楽しめる、親子向けのおでかけイベント。',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=75',
    startDate: '2026-07-04',
    endDate: '2026-07-05',
  },
  {
    id: 'event-osu-food',
    title: '大須まちなか食べ歩き企画',
    area: '大須',
    tag: 'グルメ',
    description: '大須商店街で新店や限定メニューを巡れる企画。',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=75',
    startDate: '2026-06-15',
    endDate: '2026-07-31',
  },
];

const EVENT_NEXT_LINKS = [
  {
    title: '近くのエリアから探す',
    text: '会場近くの寄り道を探す',
    href: '/area',
    icon: 'map',
  },
  {
    title: '新着のおでかけ情報を見る',
    text: '新店や話題のお店を確認',
    href: '/new',
    icon: 'sparkle',
  },
  {
    title: '気になる情報を保存する',
    text: 'あとから見返せるように保存',
    href: '/saved',
    icon: 'bookmark',
  },
];

export default function EventPage() {
  return (
    <main className="min-h-dvh pb-28" style={{ background: '#ffffff' }}>

      {/* ── ページヘッダー ── */}
      <section className="px-4 pt-8 pb-5">
        <p className="text-[10px] font-black tracking-[0.22em]" style={{ color: '#E8483F' }}>
          EVENT
        </p>
        <h1 className="mt-1 text-[28px] font-black leading-tight tracking-tight" style={{ color: '#071A4D' }}>
          名古屋のイベント
        </h1>
        <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
          今日・今週末・季節のイベントをここに集約していきます。
        </p>
      </section>

      {/* ── フィルターカード ── */}
      <section className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          {EVENT_FILTERS.map(filter => (
            <FilterCard key={filter.label} label={filter.label} text={filter.text} icon={filter.icon} />
          ))}
        </div>
      </section>

      {/* ── イベント一覧 ── */}
      <section className="px-4 pt-7">
        <SectionTitle eyebrow="EVENT LIST">開催中・今週末のイベント</SectionTitle>
        <div className="mt-4 flex flex-col gap-4">
          {EVENTS.map(event => (
            <EventCardClient key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* ── 回遊導線 ── */}
      <section className="px-4 pt-8">
        <SectionTitle eyebrow="NEXT TRIP">イベントのあとに探す</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {EVENT_NEXT_LINKS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3.5 rounded-[14px] bg-white px-4 py-3.5 active:scale-[0.98] transition-transform"
              style={{
                border: '1px solid #E6ECF5',
                boxShadow: '0 4px 12px rgba(7,26,77,0.07)',
              }}
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px]"
                style={{ background: 'rgba(232,72,63,0.09)', color: '#E8483F' }}
              >
                {item.icon === 'map' ? <MapPinLgIcon /> : item.icon === 'sparkle' ? <SparkleIcon /> : <BookmarkNavIcon />}
              </div>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium leading-5" style={{ color: '#667085' }}>
                  {item.text}
                </span>
              </span>
              <ChevronRightIcon />
            </Link>
          ))}
        </div>
      </section>

      {/* ── PARTNER ── */}
      <section className="px-4 pt-8 pb-2">
        <div
          className="rounded-[18px] px-5 py-6"
          style={{
            background: 'linear-gradient(135deg, #FFF1ED 0%, #FFE0DD 48%, #FFF4D7 100%)',
            border: '1.5px solid rgba(232,72,63,0.14)',
          }}
        >
          <p className="mb-2 text-[10px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
            EVENT OWNER
          </p>
          <h2 className="text-[17px] font-black leading-snug" style={{ color: '#071A4D' }}>
            イベント告知を相談したい方へ
          </h2>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
            新店イベント、期間限定企画、週末集客など、名古屋のお店や主催者向けの掲載相談を受け付けています。
          </p>
          <div
            className="mt-4 rounded-[14px] px-4 py-4"
            style={{
              background: 'rgba(255,255,255,0.72)',
              border: '1.5px solid rgba(232,72,63,0.20)',
            }}
          >
            <p className="mb-1 text-[9px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
              OPENING SERVICE
            </p>
            <p className="text-[15px] font-black leading-snug" style={{ color: '#071A4D' }}>
              9月末まで初回掲載無料
            </p>
            <p className="mt-1.5 text-[11px] font-medium leading-5" style={{ color: '#667085' }}>
              Instagram DMから相談いただいた店舗さま限定。記事掲載・Googleマップ導線・SNS紹介までお試しできます。
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['初回掲載無料', 'Googleマップ導線つき', 'SNS紹介つき'].map(chip => (
                <span
                  key={chip}
                  className="rounded-full px-2.5 py-1 text-[10px] font-black"
                  style={{ background: 'rgba(232,72,63,0.10)', color: '#E8483F' }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/partner"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-black text-white active:scale-[0.98] transition-transform"
            style={{
              background: '#E8483F',
              boxShadow: '0 12px 24px rgba(232,72,63,0.30)',
            }}
          >
            掲載について相談する
            <ArrowRightIcon />
          </Link>
          <p className="mt-2.5 text-center text-[10px] font-medium" style={{ color: '#E8483F' }}>
            Instagram DMから相談OK・9月末まで初回掲載無料
          </p>
        </div>
      </section>

    </main>
  );
}

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[19px] font-black tracking-tight" style={{ color: '#071A4D' }}>
        {children}
      </h2>
    </div>
  );
}

function FilterCard({ label, text, icon }: { label: string; text: string; icon: string }) {
  const featured = label === '今日行ける' || label === '今週末';
  const iconEl = (() => {
    if (icon === 'clock') return <ClockIcon />;
    if (icon === 'sun') return <SunIcon />;
    if (icon === 'umbrella') return <UmbrellaIcon />;
    if (icon === 'heart') return <HeartIcon />;
    return <CalendarIcon />;
  })();

  return (
    <article
      className="rounded-[14px] p-4"
      style={{
        background: '#ffffff',
        border: featured ? '1.5px solid rgba(232,72,63,0.22)' : '1px solid #E6ECF5',
        boxShadow: featured
          ? '0 7px 20px rgba(232,72,63,0.10)'
          : '0 4px 16px rgba(7,26,77,0.06)',
      }}
    >
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: 'rgba(232,72,63,0.08)', color: '#E8483F' }}
      >
        {iconEl}
      </div>
      <h2 className="text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
        {label}
      </h2>
      <p className="mt-2 text-[11px] font-medium leading-5" style={{ color: '#667085' }}>
        {text}
      </p>
    </article>
  );
}

/* ── SVG Icons ── */

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 3.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function UmbrellaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 12a11.05 11.05 0 0 0-22 0z" />
      <path d="M12 12v6a3 3 0 0 0 6 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M8 2v5" />
      <path d="M16 2v5" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function MapPinLgIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function BookmarkNavIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4CEDD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
