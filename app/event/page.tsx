import type { Metadata } from 'next';
import Link from 'next/link';

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
  { label: '今日行ける',       text: '今から予定に入れやすいイベント' },
  { label: '今週末',           text: '週末のおでかけ候補をまとめて確認' },
  { label: '雨の日でも楽しめる', text: '屋内や駅近で過ごしやすい催し' },
  { label: '家族で行きたい',   text: '親子で楽しみやすい名古屋イベント' },
];

const EVENTS = [
  {
    title: '栄 光のインスタレーション',
    area: '栄',
    period: '開催中',
    tag: '夜のおでかけ',
    description: '仕事帰りにも立ち寄りやすい、街なかのライトアップイベント。',
  },
  {
    title: '覚王山アパートメント秋市',
    area: '覚王山',
    period: '今週末',
    tag: 'マーケット',
    description: '雑貨、焼き菓子、クラフト作品をゆっくり楽しめる週末マーケット。',
  },
  {
    title: '名古屋港ファミリーデイ',
    area: '名古屋港',
    period: '今週末',
    tag: '家族向け',
    description: '海辺の散歩と一緒に楽しめる、親子向けのおでかけイベント。',
  },
  {
    title: '大須まちなか食べ歩き企画',
    area: '大須',
    period: '開催中',
    tag: 'グルメ',
    description: '大須商店街を歩きながら、新しいお店や限定メニューを探せる企画。',
  },
];

const EVENT_NEXT_LINKS = [
  {
    title: '近くのエリアから探す',
    text: 'イベント会場の近くで、グルメや寄り道スポットを探せます。',
    href: '/area',
  },
  {
    title: '新着のおでかけ情報を見る',
    text: '新店、イベント、話題のお店をまとめてチェックできます。',
    href: '/new',
  },
  {
    title: '気になる情報を保存する',
    text: '行きたい場所を保存して、あとから見返せます。',
    href: '/saved',
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
            <FilterCard key={filter.label} label={filter.label} text={filter.text} />
          ))}
        </div>
      </section>

      {/* ── イベント一覧 ── */}
      <section className="px-4 pt-7">
        <SectionTitle eyebrow="EVENT LIST">開催中・今週末のイベント</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {EVENTS.map(event => (
            <EventCard key={event.title} event={event} />
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
              className="flex items-center gap-3 rounded-[14px] bg-white px-4 py-4 active:scale-[0.98] transition-transform"
              style={{
                border: '1px solid #E6ECF5',
                boxShadow: '0 4px 12px rgba(7,26,77,0.07)',
              }}
            >
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

function FilterCard({ label, text }: { label: string; text: string }) {
  const featured = label === '今日行ける' || label === '今週末';
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
        <CalendarIcon />
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

function EventCard({ event }: { event: typeof EVENTS[number] }) {
  const mapUrl = `https://www.google.com/maps/search/?${new URLSearchParams({
    api: '1',
    query: `名古屋 ${event.area} ${event.title}`,
  }).toString()}`;

  return (
    <article
      className="rounded-[14px] bg-white p-4"
      style={{
        border: '1px solid #E6ECF5',
        boxShadow: '0 4px 16px rgba(7,26,77,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="rounded-full px-3 py-1 text-[10px] font-black"
          style={{ color: '#ffffff', background: '#071A4D' }}
        >
          {event.tag}
        </span>
        <span
          className="rounded-full px-3 py-1 text-[10px] font-black"
          style={{ color: '#E8483F', background: 'rgba(232,72,63,0.08)' }}
        >
          {event.period}
        </span>
      </div>

      <h2 className="mt-3 text-[17px] font-black leading-snug" style={{ color: '#071A4D' }}>
        {event.title}
      </h2>
      <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
        {event.description}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{ color: '#071A4D', background: 'rgba(7,26,77,0.06)' }}
        >
          <MapPinIcon />
          {event.area}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="/new"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
          style={{
            color: '#ffffff',
            background: '#E8483F',
            boxShadow: '0 6px 14px rgba(232,72,63,0.25)',
          }}
        >
          詳細を見る
          <ArrowRightIcon />
        </a>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
          style={{
            color: '#071A4D',
            background: 'rgba(7,26,77,0.06)',
            border: '1px solid #E6ECF5',
          }}
        >
          地図で探す
          <MapPinIcon />
        </a>
      </div>
    </article>
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

function MapPinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
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

function ChevronRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4CEDD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
