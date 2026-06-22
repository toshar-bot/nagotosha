import type { Metadata } from 'next';

const description = '今日行けるイベントや週末のおでかけ情報など、名古屋の注目イベントを探せます。';

export const metadata: Metadata = {
  title: '名古屋のイベント｜なごとしゃ',
  description,
  openGraph: {
    title: '名古屋のイベント｜なごとしゃ',
    description,
    type: 'website',
  },
};

const EVENT_FILTERS = [
  {
    label: '今日行ける',
    text: '今から予定に入れやすいイベント',
  },
  {
    label: '今週末',
    text: '週末のおでかけ候補をまとめて確認',
  },
  {
    label: '雨の日でも楽しめる',
    text: '屋内や駅近で過ごしやすい催し',
  },
  {
    label: '家族で行きたい',
    text: '親子で楽しみやすい名古屋イベント',
  },
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

export default function EventPage() {
  return (
    <main className="min-h-dvh pb-28" style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}>
      <PortalHeader
        eyebrow="EVENT"
        title="名古屋のイベント"
        copy="今日・今週末・季節のイベントをここに集約していきます。"
      />

      <section className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          {EVENT_FILTERS.map(filter => (
            <FilterCard key={filter.label} label={filter.label} text={filter.text} />
          ))}
        </div>
      </section>

      <section className="px-4 pt-7">
        <SectionTitle eyebrow="EVENT LIST">開催中・今週末のイベント</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {EVENTS.map(event => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>
      </section>

      <section className="px-4 pt-7">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, #f8fcff, #edf8f6)',
            border: '1.5px solid rgba(29,91,115,0.14)',
          }}
        >
          <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#1d5b73' }}>
            NEXT UPDATE
          </p>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#416b7d' }}>
            今後、イベント情報やWordPress記事データと連携して、開催中・今週末の情報を自動更新していきます。
          </p>
        </div>
      </section>
    </main>
  );
}

function PortalHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <section className="relative overflow-hidden px-5 pt-7 pb-6">
      <div className="absolute inset-x-0 top-0 h-56" style={{ background: 'radial-gradient(circle at 18% 8%, rgba(255,255,255,0.92) 0%, transparent 36%), radial-gradient(circle at 85% 18%, rgba(10,154,154,0.14) 0%, transparent 34%)' }} />
      <div className="relative">
        <p className="text-[10px] font-black tracking-[0.22em] mb-3" style={{ color: '#0a9a9a' }}>{eyebrow}</p>
        <h1 className="text-[28px] font-black leading-tight tracking-tight" style={{ color: '#0a2438' }}>{title}</h1>
        <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>{copy}</p>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#0a9a9a' }}>{eyebrow}</p>
      <h2 className="mt-1 text-[19px] font-black tracking-tight" style={{ color: '#0a2438' }}>{children}</h2>
    </div>
  );
}

function FilterCard({ label, text }: { label: string; text: string }) {
  const featured = label === '今日行ける' || label === '今週末';

  return (
    <article
      className="rounded-2xl p-4"
      style={{
        background: featured ? 'linear-gradient(135deg, #ffffff, #edf8f6)' : '#ffffff',
        border: featured ? '1.5px solid rgba(10,154,154,0.24)' : '1px solid rgba(29,91,115,0.10)',
        boxShadow: featured ? '0 7px 20px rgba(10,154,154,0.10)' : '0 4px 16px rgba(10,36,56,0.06)',
      }}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(10,154,154,0.10)', color: '#1d5b73' }}>
        <CalendarIcon />
      </div>
      <h2 className="text-[14px] font-black leading-snug" style={{ color: '#0a2438' }}>{label}</h2>
      <p className="mt-2 text-[11px] font-medium leading-5" style={{ color: '#5a7b8a' }}>{text}</p>
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
      className="rounded-2xl bg-white p-4"
      style={{
        border: '1px solid rgba(29,91,115,0.10)',
        boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full px-3 py-1 text-[10px] font-black" style={{ color: '#ffffff', background: '#1d5b73' }}>
          {event.tag}
        </span>
        <span className="rounded-full px-3 py-1 text-[10px] font-black" style={{ color: '#0a9a9a', background: 'rgba(10,154,154,0.10)' }}>
          {event.period}
        </span>
      </div>

      <h2 className="mt-3 text-[17px] font-black leading-snug" style={{ color: '#0a2438' }}>{event.title}</h2>
      <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#5a7b8a' }}>{event.description}</p>

      <div className="mt-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ color: '#1d5b73', background: 'rgba(29,91,115,0.08)' }}>
          <MapPinIcon />
          {event.area}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="#"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
          style={{ color: '#ffffff', background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)' }}
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
            color: '#1d5b73',
            background: 'rgba(10,154,154,0.10)',
            border: '1px solid rgba(10,154,154,0.22)',
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
