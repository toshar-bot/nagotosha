const AREA_FILTERS = [
  {
    label: '今日近くで探す',
    text: '今いる場所や帰り道から寄りやすい候補を探す',
  },
  {
    label: '週末のおでかけ',
    text: 'ゆっくり歩ける街やイベントが多い場所から探す',
  },
  {
    label: 'グルメが多いエリア',
    text: '食べ歩き、夜ごはん、カフェ巡りに強い街を見る',
  },
];

const AREAS = [
  {
    name: '名駅',
    description: '買い物、カフェ、仕事帰りのごはんまで集まる名古屋の玄関口。',
    tags: ['駅近', '買い物', '夜ごはん'],
  },
  {
    name: '栄',
    description: '話題のカフェ、夜のおでかけ、イベントが見つかる中心エリア。',
    tags: ['カフェ', '夜', 'イベント'],
  },
  {
    name: '大須',
    description: '食べ歩き、古着、個性派ショップを歩いて楽しめる街。',
    tags: ['食べ歩き', '古着', '新店'],
  },
  {
    name: '金山',
    description: '待ち合わせや飲み会、ライブ帰りにも使いやすい便利エリア。',
    tags: ['飲み会', '駅近', '夜'],
  },
  {
    name: '藤が丘',
    description: '落ち着いたカフェや日常使いのお店を探しやすい東山線エリア。',
    tags: ['カフェ', '日常', '東山線'],
  },
  {
    name: '覚王山',
    description: '雑貨、焼き菓子、落ち着いた散歩に向いた上品なエリア。',
    tags: ['散歩', '焼き菓子', '雑貨'],
  },
  {
    name: '名古屋港',
    description: '海辺のおでかけ、家族向けスポット、週末の散歩に。',
    tags: ['家族', '海辺', '週末'],
  },
  {
    name: '今池',
    description: '音楽、居酒屋、個性ある夜の楽しみが見つかるエリア。',
    tags: ['音楽', '居酒屋', '夜'],
  },
];

export default function AreaPage() {
  return (
    <main className="min-h-dvh pb-28" style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}>
      <PortalHeader
        eyebrow="AREA"
        title="エリアから探す"
        copy="名駅、栄、大須、藤が丘など、行きたいエリアから名古屋を探せます。"
      />

      <section className="px-4 pt-2">
        <div className="grid grid-cols-1 gap-3">
          {AREA_FILTERS.map(filter => (
            <FilterCard key={filter.label} label={filter.label} text={filter.text} />
          ))}
        </div>
      </section>

      <section className="px-4 pt-7">
        <SectionTitle eyebrow="AREA LIST">名古屋のエリア</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-3">
          {AREAS.map(area => (
            <AreaCard key={area.name} area={area} />
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
            今後、記事・イベント・店舗データと連携して、エリアごとの人気スポットや新着情報を自動更新していきます。
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
  const featured = label === '今日近くで探す';

  return (
    <article
      className="rounded-2xl p-4"
      style={{
        background: featured ? 'linear-gradient(135deg, #ffffff, #edf8f6)' : '#ffffff',
        border: featured ? '1.5px solid rgba(10,154,154,0.24)' : '1px solid rgba(29,91,115,0.10)',
        boxShadow: featured ? '0 7px 20px rgba(10,154,154,0.10)' : '0 4px 16px rgba(10,36,56,0.06)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(10,154,154,0.10)', color: '#1d5b73' }}>
          <MapIcon />
        </span>
        <div>
          <h2 className="text-[14px] font-black leading-snug" style={{ color: '#0a2438' }}>{label}</h2>
          <p className="mt-2 text-[11px] font-medium leading-5" style={{ color: '#5a7b8a' }}>{text}</p>
        </div>
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
      className="rounded-2xl bg-white p-4"
      style={{
        border: '1px solid rgba(29,91,115,0.10)',
        boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#0a9a9a' }}>
            NAGOYA AREA
          </p>
          <h2 className="mt-1 text-[21px] font-black leading-tight" style={{ color: '#0a2438' }}>{area.name}</h2>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #e8f7fb, #d9f3ef)', color: '#1d5b73' }}>
          <MapIcon />
        </span>
      </div>

      <p className="mt-3 text-[12px] font-medium leading-6" style={{ color: '#5a7b8a' }}>{area.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {area.tags.map(tag => (
          <span key={tag} className="rounded-full px-2.5 py-1 text-[10px] font-black" style={{ color: '#1d5b73', background: 'rgba(29,91,115,0.08)' }}>
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="#"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
          style={{ color: '#ffffff', background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)' }}
        >
          このエリアを見る
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
