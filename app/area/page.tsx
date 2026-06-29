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

type AreaIconType = 'station' | 'walk' | 'pin';

const AREA_FILTERS = [
  { label: '今日近くで探す',    text: '今いる場所や帰り道から寄りやすい候補を探す', icon: 'clock' },
  { label: '週末のおでかけ',    text: 'ゆっくり歩けるエリアやイベントが多い場所から', icon: 'sun' },
  { label: 'グルメが多いエリア', text: '食べ歩き、夜ごはん、カフェ巡りに強い街を見る', icon: 'gourmet' },
] as const;

const AREAS: {
  name: string;
  description: string;
  tags: string[];
  href: string;
  imageUrl: string;
  iconType: AreaIconType;
}[] = [
  {
    name: '名駅',
    description: '高層ビルとKITTEが集まる、名古屋の玄関口。',
    tags: ['駅近', '買い物', '夜ごはん'],
    href: '/new?area=%E5%90%8D%E9%A7%85',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=75',
    iconType: 'station',
  },
  {
    name: '栄',
    description: 'オアシス21とテレビ塔が目印、カフェとイベントが集まる中心地。',
    tags: ['カフェ', '夜', 'イベント'],
    href: '/new?area=%E6%A0%84',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=75',
    iconType: 'pin',
  },
  {
    name: '大須',
    description: '食べ歩き、古着、個性派ショップが集まる歩いて楽しい商店街。',
    tags: ['食べ歩き', '古着', '新店'],
    href: '/new?area=%E5%A4%A7%E9%A0%88',
    imageUrl: 'https://images.unsplash.com/photo-1513125370-3460ebe3401b?auto=format&fit=crop&w=600&q=75',
    iconType: 'walk',
  },
  {
    name: '金山',
    description: '飲み会やライブ帰りにも使いやすい、便利な乗換えエリア。',
    tags: ['飲み会', '駅近', '夜'],
    href: '/new?area=%E9%87%91%E5%B1%B1',
    imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=75',
    iconType: 'station',
  },
  {
    name: '藤が丘',
    description: '落ち着いたカフェと日常使いのお店が並ぶ、東山線の終点エリア。',
    tags: ['カフェ', '日常', '東山線'],
    href: '/new?area=%E8%97%A4%E3%81%8C%E4%B8%98',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=75',
    iconType: 'station',
  },
  {
    name: '覚王山',
    description: '雑貨、焼き菓子、おしゃれなカフェが並ぶ散歩向きのエリア。',
    tags: ['散歩', '焼き菓子', '雑貨'],
    href: '/new?area=%E8%A6%9A%E7%8E%8B%E5%B1%B1',
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=75',
    iconType: 'walk',
  },
  {
    name: '名古屋港',
    description: '海辺の散歩と水族館、家族で楽しめる週末スポット。',
    tags: ['家族', '海辺', '週末'],
    href: '/new?area=%E5%90%8D%E5%8F%A4%E5%B1%8B%E6%B8%AF',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=75',
    iconType: 'pin',
  },
  {
    name: '今池',
    description: '音楽、居酒屋、個性ある夜の楽しみが見つかるエリア。',
    tags: ['音楽', '居酒屋', '夜'],
    href: '/new?area=%E4%BB%8A%E6%B1%A0',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e6785?auto=format&fit=crop&w=600&q=75',
    iconType: 'station',
  },
];

const AREA_NEXT_LINKS = [
  {
    title: '新着のお店を見る',
    text: '気になるエリアの新店や話題のお店をチェック。',
    href: '/new',
  },
  {
    title: '近くのイベントを見る',
    text: '週末や今日行けるイベントを探せます。',
    href: '/event',
  },
  {
    title: '気になる場所を保存する',
    text: '行きたいお店やイベントをあとから見返せます。',
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
        <div className="grid grid-cols-1 gap-3">
          {AREA_FILTERS.map(filter => (
            <FilterCard key={filter.label} label={filter.label} text={filter.text} icon={filter.icon} />
          ))}
        </div>
      </section>

      {/* ── エリア一覧 ── */}
      <section className="px-4 pt-7">
        <SectionTitle eyebrow="AREA LIST">名古屋のエリア</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4">
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
              style={{ border: '1px solid #E6ECF5', boxShadow: '0 4px 12px rgba(7,26,77,0.07)' }}
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
            名駅、栄、大須など、エリアごとの来店導線やGoogleマップ送客の相談を受け付けています。
          </p>
          <Link
            href="/partner"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-black text-white active:scale-[0.98] transition-transform"
            style={{ background: '#E8483F', boxShadow: '0 12px 24px rgba(232,72,63,0.30)' }}
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

function FilterCard({ label, text, icon }: { label: string; text: string; icon: string }) {
  const featured = label === '今日近くで探す';
  const iconEl = icon === 'clock' ? <ClockIcon /> : icon === 'sun' ? <SunIcon /> : <GourmetIcon />;
  return (
    <article
      className="flex items-start gap-3 rounded-[14px] p-4"
      style={{
        background: '#ffffff',
        border: featured ? '1.5px solid rgba(232,72,63,0.22)' : '1px solid #E6ECF5',
        boxShadow: featured ? '0 7px 20px rgba(232,72,63,0.10)' : '0 4px 16px rgba(7,26,77,0.06)',
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'rgba(232,72,63,0.08)', color: '#E8483F' }}
      >
        {iconEl}
      </span>
      <div>
        <h2 className="text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
          {label}
        </h2>
        <p className="mt-1.5 text-[11px] font-medium leading-5" style={{ color: '#667085' }}>
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
      className="relative overflow-hidden rounded-[18px] bg-white"
      style={{ border: '1px solid #E6ECF5', boxShadow: '0 8px 24px rgba(7,26,77,0.08)' }}
    >
      {/* 全体タップ用オーバーレイリンク */}
      <Link href={area.href} className="absolute inset-0 z-10" aria-label={`${area.name}のお店・グルメを見る`} />

      {/* 写真エリア */}
      <div
        className="relative h-[150px] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={area.imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.28) 100%)' }}
        />
        {/* エリア名を写真上に表示 */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', color: '#ffffff' }}
          >
            {area.iconType === 'station' ? <StationIcon /> : area.iconType === 'walk' ? <WalkIcon /> : <MapPinIcon size={14} />}
          </span>
          <h2 className="text-[22px] font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.40)]">
            {area.name}
          </h2>
        </div>
      </div>

      {/* テキストエリア */}
      <div className="p-4">
        <p
          className="text-[12px] font-medium leading-6"
          style={{ color: '#667085', wordBreak: 'keep-all' }}
        >
          {area.description}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
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

        {/* ボタン行（z-20 で overlay より上） */}
        <div className="relative z-20 mt-4 flex flex-wrap gap-2">
          <Link
            href={area.href}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
            style={{ color: '#ffffff', background: '#E8483F', boxShadow: '0 6px 14px rgba(232,72,63,0.25)' }}
          >
            このエリアを見る
            <ArrowRightIcon />
          </Link>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
            style={{ color: '#071A4D', background: 'rgba(7,26,77,0.06)', border: '1px solid #E6ECF5' }}
          >
            地図で探す
            <MapPinIcon size={12} />
          </a>
        </div>
      </div>
    </article>
  );
}

/* ── SVG Icons ── */

function StationIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="16" rx="3" />
      <path d="M4 10h16" />
      <path d="M9 22l3-4 3 4" />
      <path d="M9 6h6" />
    </svg>
  );
}

function WalkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
      <path d="M10 8l-3 5h4l-1 7" />
      <path d="M10 8l4 2 2-3" />
      <path d="M14 15l2 5" />
    </svg>
  );
}

function MapPinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

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

function GourmetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
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
