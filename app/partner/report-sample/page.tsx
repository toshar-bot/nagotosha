import Link from 'next/link';

const REPORT_INSIGHTS = [
  {
    title: 'どの記事が読まれたか',
    text: '閲覧数や注目された記事から、読者の反応を確認できます。',
  },
  {
    title: 'どれだけ来店導線が押されたか',
    text: 'Googleマップクリックや保存数から、来店前の行動を確認できます。',
  },
  {
    title: '次に何を改善すべきか',
    text: '週末集客、写真、タイトル、PR導線など、次回改善のヒントを整理します。',
  },
];

const KPI_ITEMS = [
  { label: '記事閲覧数', value: '4,820', sub: 'views' },
  { label: '保存数', value: '312', sub: 'saves' },
  { label: 'Googleマップクリック', value: '148', sub: 'map clicks' },
  { label: 'SNS投稿表示', value: '12,400', sub: 'social impressions' },
];

const BREAKDOWN_ITEMS = [
  { label: 'トップ注目枠', value: 42 },
  { label: 'みんなの注目記事', value: 31 },
  { label: '人気ランキング', value: 18 },
  { label: 'その他', value: 9 },
];

const SUGGESTIONS = [
  {
    title: '週末前の露出を増やす',
    text: '金曜から土曜午前にかけて注目枠を強め、来店検討が増える時間帯に合わせます。',
  },
  {
    title: '駅からの導線を強化',
    text: '地図クリックが高いため、最寄り駅からの歩き方や目印を記事内で補足します。',
  },
  {
    title: 'NEW!訴求を継続',
    text: '新規客向けに、限定メニューや初回来店のきっかけをSNSでも配信します。',
  },
];

const SAVE_RANKING = [
  { rank: 1, label: '大須スペシャルティコーヒー', value: 312 },
  { rank: 2, label: '覚王山アパートメント秋市',    value: 204 },
  { rank: 3, label: '栄 光のインスタレーション',    value: 128 },
];

const MAP_RANKING = [
  { rank: 1, label: '大須スペシャルティコーヒー',   value: 148 },
  { rank: 2, label: '錦 自家製パスタの店',          value: 96  },
  { rank: 3, label: '覚王山 白いクリームソーダ',    value: 72  },
];

export default function ReportSamplePage() {
  return (
    <main
      className="min-h-dvh pb-28"
      style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f7fbff 42%, #ffffff 100%)' }}
    >
      <section className="relative overflow-hidden px-5 pt-7 pb-7">
        <div
          className="absolute inset-x-0 top-0 h-64"
          style={{
            background:
              'radial-gradient(circle at 18% 10%, rgba(255,255,255,0.95) 0%, transparent 34%), radial-gradient(circle at 86% 18%, rgba(10,154,154,0.16) 0%, transparent 32%)',
          }}
        />
        <div className="relative">
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.14em]"
            style={{ color: '#1d5b73' }}
          >
            <ArrowLeftIcon />
            PARTNER
          </Link>

          <div className="mt-7">
            <p className="text-[10px] font-black tracking-[0.22em] mb-3" style={{ color: '#0a9a9a' }}>
              SAMPLE REPORT
            </p>
            <h1 className="text-[29px] font-black leading-[1.14] tracking-tight" style={{ color: '#0a2438' }}>
              掲載後の反応が、
              <br />
              数字で見える。
            </h1>
            <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>
              なごとしゃでは、記事の閲覧数・保存数・Googleマップクリック数をもとに、次の集客改善につなげます。
            </p>
            <p className="mt-3 rounded-2xl px-4 py-3 text-[11px] font-bold leading-5" style={{ color: '#5f8392', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(29,91,115,0.10)' }}>
              これはサンプル表示です。実際の数値は掲載内容・期間により変動します。
            </p>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div
          className="rounded-3xl bg-white p-5"
          style={{
            border: '1.5px solid rgba(29,91,115,0.12)',
            boxShadow: '0 8px 24px rgba(10,36,56,0.08)',
          }}
        >
          <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#0a9a9a' }}>
            STORE
          </p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-black leading-snug" style={{ color: '#0a2438' }}>
                大須スペシャルティコーヒー
              </h2>
              <p className="mt-2 text-[12px] font-bold" style={{ color: '#5f8392' }}>
                掲載期間：2026.06.01 - 2026.06.30
              </p>
            </div>
            <span className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-white" style={{ background: '#0a9a9a' }}>
              大須
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-[11px] font-black" style={{ color: '#1d5b73', background: 'rgba(29,91,115,0.08)' }}>
              スタンダード
            </span>
            <span className="text-[11px] font-bold" style={{ color: '#8aa5b0' }}>
              掲載プラン
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 pt-6">
        <SectionTitle eyebrow="REPORT POINTS">このレポートで分かること</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {REPORT_INSIGHTS.map(item => (
            <article
              key={item.title}
              className="rounded-2xl bg-white p-4"
              style={{
                border: '1px solid rgba(29,91,115,0.10)',
                boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
              }}
            >
              <h2 className="text-[14px] font-black leading-snug" style={{ color: '#0a2438' }}>
                {item.title}
              </h2>
              <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#5a7b8a' }}>
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <SectionTitle eyebrow="KPI">掲載レポート</SectionTitle>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {KPI_ITEMS.map(item => (
            <article
              key={item.label}
              className="rounded-2xl bg-white p-4"
              style={{
                border: '1px solid rgba(29,91,115,0.10)',
                boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
              }}
            >
              <p className="text-[11px] font-black leading-snug" style={{ color: '#416b7d' }}>
                {item.label}
              </p>
              <p className="mt-2 text-[26px] font-black tracking-tight" style={{ color: '#1d5b73' }}>
                {item.value}
              </p>
              <p className="mt-1 text-[9px] font-black tracking-[0.14em]" style={{ color: '#a0b8c0' }}>
                {item.sub}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle eyebrow="BREAKDOWN">反応の内訳</SectionTitle>
        <div
          className="mt-4 rounded-2xl bg-white p-4"
          style={{
            border: '1px solid rgba(29,91,115,0.10)',
            boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
          }}
        >
          <div className="flex flex-col gap-4">
            {BREAKDOWN_ITEMS.map(item => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-black" style={{ color: '#24465a' }}>
                    {item.label}
                  </span>
                  <span className="text-[12px] font-black" style={{ color: '#1d5b73' }}>
                    {item.value}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full" style={{ background: '#edf6fa' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.value}%`,
                      background: 'linear-gradient(90deg, #1d5b73, #0a9a9a)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle eyebrow="RANKING">保存数・地図クリックもレポート化</SectionTitle>
        <p className="mt-3 text-[13px] font-medium leading-7" style={{ color: '#5f8392' }}>
          読まれた数だけでなく、あとで見返したい保存数や、実際の来店に近いGoogleマップクリックまで確認できます。
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <RankingPanel
            eyebrow="SAVE RANKING"
            title="保存ランキング"
            unit="保存"
            icon={<BookmarkPanelIcon />}
            items={SAVE_RANKING}
          />
          <RankingPanel
            eyebrow="MAP RANKING"
            title="地図クリックランキング"
            unit="地図クリック"
            icon={<MapPinIcon />}
            items={MAP_RANKING}
          />
        </div>
        <div
          className="mt-4 rounded-2xl p-4"
          style={{
            background: 'rgba(29,91,115,0.04)',
            border: '1px solid rgba(29,91,115,0.09)',
          }}
        >
          <p className="text-[12px] font-medium leading-6" style={{ color: '#416b7d' }}>
            保存数は「あとで行きたい」の強さ、地図クリックは「来店に近い行動」として、次回の露出や訴求改善に活用します。
          </p>
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle eyebrow="NEXT ACTION">改善提案</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {SUGGESTIONS.map((item, index) => (
            <article
              key={item.title}
              className="rounded-2xl bg-white p-4"
              style={{
                border: '1px solid rgba(29,91,115,0.10)',
                boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-black"
                  style={{ color: '#ffffff', background: '#1d5b73' }}
                >
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-[14px] font-black" style={{ color: '#0a2438' }}>
                    {item.title}
                  </h2>
                  <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#5a7b8a' }}>
                    {item.text}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, #f8fcff, #edf8f6)',
            border: '1.5px solid rgba(29,91,115,0.14)',
          }}
        >
          <h2 className="text-[17px] font-black leading-snug" style={{ color: '#0a2438' }}>
            掲載後の反応まで一緒に見ます
          </h2>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#416b7d' }}>
            掲載して終わりではなく、保存数や地図クリックを見ながら、次の来店につながる改善案まで提案します。
          </p>
          <Link
            href="/partner"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[13px] font-black text-white active:scale-[0.98] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)',
              boxShadow: '0 8px 22px rgba(29,91,115,0.20)',
            }}
          >
            掲載プランを相談する
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      <section className="px-4 pt-8">
        <div
          className="rounded-3xl p-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #0a2438, #1d5b73)',
            boxShadow: '0 10px 28px rgba(10,36,56,0.28)',
          }}
        >
          <p className="text-[10px] font-black tracking-[0.2em] text-white/55">REPORT TO ACTION</p>
          <h2 className="mt-2 text-[20px] font-black leading-snug text-white">
            数字を見ながら、
            <br />
            次の集客を一緒に考えます。
          </h2>
          <Link
            href="/partner#contact"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-[14px] font-black active:scale-[0.98] transition-transform"
            style={{ color: '#1d5b73' }}
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
      <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#0a9a9a' }}>
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[19px] font-black tracking-tight" style={{ color: '#0a2438' }}>
        {children}
      </h2>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

function RankingPanel({
  eyebrow, title, unit, icon, items,
}: {
  eyebrow: string;
  title: string;
  unit: string;
  icon: React.ReactNode;
  items: { rank: number; label: string; value: number }[];
}) {
  return (
    <article
      className="rounded-2xl bg-white p-4"
      style={{
        border: '1px solid rgba(29,91,115,0.10)',
        boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
      }}
    >
      <div
        className="flex items-center gap-2 mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(29,91,115,0.07)' }}
      >
        <span style={{ color: '#0a9a9a' }}>{icon}</span>
        <div>
          <p className="text-[9px] font-black tracking-[0.18em]" style={{ color: '#a0b8c0' }}>
            {eyebrow}
          </p>
          <p className="text-[13px] font-black leading-tight" style={{ color: '#0a2438' }}>
            {title}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.map(item => {
          const isTop = item.rank === 1;
          return (
            <div
              key={item.rank}
              className="flex items-center gap-3 rounded-xl"
              style={isTop
                ? { background: 'rgba(10,154,154,0.07)', padding: '8px 10px' }
                : { padding: '5px 2px' }}
            >
              <span
                className="flex shrink-0 items-center justify-center rounded-full font-black"
                style={isTop
                  ? { width: 26, height: 26, background: '#0a9a9a', color: '#ffffff', fontSize: 12 }
                  : { width: 22, height: 22, background: 'rgba(29,91,115,0.08)', color: '#8aa5b0', fontSize: 11 }}
              >
                {item.rank}
              </span>
              <span
                className="flex-1 min-w-0 truncate font-black text-[12px]"
                style={{ color: isTop ? '#0a2438' : '#5a7b8a' }}
              >
                {item.label}
              </span>
              <span
                className="shrink-0 font-black tabular-nums"
                style={{ fontSize: isTop ? 20 : 16, color: isTop ? '#0a9a9a' : '#8aa5b0', lineHeight: 1 }}
              >
                {item.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] font-bold text-right" style={{ color: '#a0b8c0' }}>
        {unit}数（サンプル）
      </p>
    </article>
  );
}

function BookmarkPanelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2.5" />
    </svg>
  );
}
