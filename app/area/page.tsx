import type { Metadata } from 'next';
import Link from 'next/link';

const description = '名駅、栄、大須、藤が丘など、名古屋のエリア別にグルメやおでかけ情報を探せます。';

export const metadata: Metadata = {
  title: 'エリアから探す｜なごとしゃ',
  description,
  openGraph: {
    title: 'エリアから探す｜なごとしゃ',
    description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'エリアから探す｜なごとしゃ',
    description,
    images: ['/opengraph-image'],
  },
};

const AREA_FILTERS = [
  { label: '今日近くで探す',   text: '今いる場所や帰り道から寄りやすい候補を探す' },
  { label: '週末のおでかけ',   text: 'ゆっくり歩ける街やイベントが多い場所から探す' },
  { label: 'グルメが多いエリア', text: '食べ歩き、夜ごはん、カフェ巡りに強い街を見る' },
];

const AREAS = [
  {
    name: '名駅',
    description: '買い物、カフェ、仕事帰りのごはんまで集まる名古屋の玄関口。',
    tags: ['駅近', '買い物', '夜ごはん'],
    href: '/new?area=%E5%90%8D%E9%A7%85',
  },
  {
    name: '栄',
    description: '話題のカフェ、夜のおでかけ、イベントが見つかる中心エリア。',
    tags: ['カフェ', '夜', 'イベント'],
    href: '/new?area=%E6%A0%84',
  },
  {
    name: '大須',
    description: '食べ歩き、古着、個性派ショップを歩いて楽しめる街。',
    tags: ['食べ歩き', '古着', '新店'],
    href: '/new?area=%E5%A4%A7%E9%A0%88',
  },
  {
    name: '金山',
    description: '待ち合わせや飲み会、ライブ帰りにも使いやすい便利エリア。',
    tags: ['飲み会', '駅近', '夜'],
    href: '/new?area=%E9%87%91%E5%B1%B1',
  },
  {
    name: '藤が丘',
    description: '落ち着いたカフェや日常使いのお店を探しやすい東山線エリア。',
    tags: ['カフェ', '日常', '東山線'],
    href: '/new?area=%E8%97%A4%E3%81%8C%E4%B8%98',
  },
  {
    name: '覚王山',
    description: '雑貨、焼き菓子、落ち着いた散歩に向いた上品なエリア。',
    tags: ['散歩', '焼き菓子', '雑貨'],
    href: '/new?area=%E8%A6%9A%E7%8E%8B%E5%B1%B1',
  },
  {
    name: '名古屋港',
    description: '海辺のおでかけ、家族向けスポット、週末の散歩に。',
    tags: ['家族', '海辺', '週末'],
    href: '/new?area=%E5%90%8D%E5%8F%A4%E5%B1%8B%E6%B8%AF',
  },
  {
    name: '今池',
    description: '音楽、居酒屋、個性ある夜の楽しみが見つかるエリア。',
    tags: ['音楽', '居酒屋', '夜'],
    href: '/new?area=%E4%BB%8A%E6%B1%A0',
  },
];

const AREA_NEXT_LINKS = [
  {
    title: '新着のお店を見る',
    text: '気になるエリアの新店や話題のお店をまとめてチェックできます。',
    href: '/new',
  },
  {
    title: '近くのイベントを見る',
    text: '週末のおでかけや、今日行けるイベントを探せます。',
    href: '/event',
  },
  {
    title: '気になる場所を保存する',
    text: '行きたいお店やイベントを保存して、あとから見返せます。',
    href: '/saved',
  },
];

export default function AreaPage() {
  return (
    <main className="min-h-dvh pb-28" style={{ background: '#ffffff' }}>

      {/* ── ページヘッダー ── */}
      <section className="px-4 pt-8 pb-5">
        <p className="text-[10px] font-black tracking-[0.22em]" style={{ color: '#E8483F' }}>
          AREA
        </p>
        <h1 className="mt-1 text-[28px] font-black leading-tight tracking-tight" style={{ color: '#071A4D' }}>
          エリアから探す
        </h1>
        <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
          名駅、栄、大須、藤が丘など、行きたいエリアから名古屋を探せます。
        </p>
      </section>

      {/* ── フィルターカード ── */}
      <section className="px-4 pt-2">
        <div className="flex flex-col gap-3">
          {AREA_FILTERS.map(filter => (
            <FilterCard key={filter.label} label={filter.label} text={filter.text} />
          ))}
        </div>
      </section>

      {/* ── エリア一覧 ── */}
      <section className="px-4 pt-7">
        <SectionTitle eyebrow="AREA LIST">名古屋のエリア</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-3">
          {AREAS.map(area => (
            <AreaCard key={area.name} area={area} />
          ))}
        </div>
      </section>

      {/* ── 回遊導線 ── */}
      <section className="px-4 pt-8">
        <SectionTitle eyebrow="NEXT DISCOVERY">エリアを決めたら次に見る</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {AREA_NEXT_LINKS.map(item => (
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
            AREA OWNER
          </p>
          <h2 className="text-[17px] font-black leading-snug" style={{ color: '#071A4D' }}>
            このエリアで集客したいお店へ
          </h2>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
            名駅、栄、大須、藤が丘など、エリアごとの来店導線づくりやGoogleマップ送客の相談を受け付けています。
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
  const featured = label === '今日近くで探す';
  return (
    <article
      className="flex items-start gap-3 rounded-[14px] p-4"
      style={{
        background: '#ffffff',
        border: featured ? '1.5px solid rgba(232,72,63,0.22)' : '1px solid #E6ECF5',
        boxShadow: featured
          ? '0 7px 20px rgba(232,72,63,0.10)'
          : '0 4px 16px rgba(7,26,77,0.06)',
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'rgba(232,72,63,0.08)', color: '#E8483F' }}
      >
        <MapIcon />
      </span>
      <div>
        <h2 className="text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
          {label}
        </h2>
        <p className="mt-2 text-[11px] font-medium leading-5" style={{ color: '#667085' }}>
          {text}
        </p>
      </div>
    </article>
  );
}

function AreaCard({ area }: { area: typeof AREAS[number] }) {
  const mapUrl = `https://www.google.com/maps/search/?${new URLSearchParams({
    api: '1',
    query: `名古屋 ${area.name}`,
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
        <div>
          <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#E8483F' }}>
            NAGOYA AREA
          </p>
          <h2 className="mt-1 text-[21px] font-black leading-tight" style={{ color: '#071A4D' }}>
            {area.name}
          </h2>
        </div>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(232,72,63,0.08)', color: '#E8483F' }}
        >
          <MapIcon />
        </span>
      </div>

      <p className="mt-3 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
        {area.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {area.tags.map(tag => (
          <span
            key={tag}
            className="rounded-full px-2.5 py-1 text-[10px] font-black"
            style={{ color: '#071A4D', background: 'rgba(7,26,77,0.06)' }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={area.href}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
          style={{
            color: '#ffffff',
            background: '#E8483F',
            boxShadow: '0 6px 14px rgba(232,72,63,0.25)',
          }}
        >
          このエリアを見る
          <ArrowRightIcon />
        </Link>
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
          <MapIcon small />
        </a>
      </div>
    </article>
  );
}

function MapIcon({ small = false }: { small?: boolean }) {
  const size = small ? 12 : 18;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
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
