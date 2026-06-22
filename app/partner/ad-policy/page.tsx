import Link from 'next/link';

const DISCLOSURE_POINTS = [
  'PR・広告表記を明確にします',
  '通常記事と広告記事の違いを分かりやすくします',
  '誇大表現や事実確認が難しい表現は避けます',
];

const PR_TYPES = [
  {
    type: 'PR記事',
    desc: '店舗から掲載料を受けて制作する紹介記事',
    badge: 'PR / Sponsored',
    badgeBg: 'rgba(10,154,154,0.10)',
    badgeColor: '#0a9a9a',
    icon: 'doc',
  },
  {
    type: '広告枠',
    desc: 'トップページやランキング周辺に掲載する広告枠',
    badge: '広告',
    badgeBg: 'rgba(29,91,115,0.08)',
    badgeColor: '#1d5b73',
    icon: 'layout',
  },
  {
    type: '編集記事',
    desc: '編集部が独自に選定・取材・紹介する通常記事',
    badge: '通常記事として掲載',
    badgeBg: 'rgba(0,0,0,0.04)',
    badgeColor: '#5f8392',
    icon: 'pen',
  },
];

const AD_MENUS = [
  {
    name: '来店ブーストパック',
    desc: '注目記事掲載、Googleマップ導線、保存導線を組み合わせて、来店前の行動を増やすプラン。',
    metrics: ['閲覧数', '保存数', '地図クリック数'],
    icon: 'boost',
  },
  {
    name: 'NEWオープン応援パック',
    desc: '新店オープンやリニューアル時に、NEW!訴求で認知を広げるプラン。',
    metrics: ['表示回数', '記事閲覧数', '地図クリック数'],
    icon: 'spark',
  },
  {
    name: '週末集客パック',
    desc: '金曜から週末にかけて、おでかけ需要に合わせて露出を高めるプラン。',
    metrics: ['週末閲覧数', '保存数', '地図クリック数'],
    icon: 'calendar',
  },
  {
    name: 'Googleマップ送客プラン',
    desc: '記事やカードからGoogleマップへの導線を強化し、来店に近い行動を増やすプラン。',
    metrics: ['地図クリック数', 'エリア反応', '保存数'],
    icon: 'map',
  },
];

const EDITORIAL_FEATURES = [
  '編集部が独自に選定',
  '掲載保証なし',
  '内容や掲載時期は編集判断',
  'PR表記なし',
];

const PR_FEATURES = [
  '店舗からの依頼で制作',
  '掲載内容を事前確認',
  '掲載期間や導線を設計',
  'PR表記あり',
];

const DISALLOWED = [
  '誤認を招く表現',
  '実態と異なる過度な表現',
  '法令に抵触する可能性がある内容',
  '読者に不利益を与える内容',
  'なごとしゃの世界観や品質基準に合わない内容',
];

const DISALLOWED_DETAIL_POINTS = [
  '読者に誤解を与える内容',
  '法令や公序良俗に反する内容',
  '実態確認が難しい過度な効果表現',
  '他店や個人を不当に下げる表現',
];

export default function AdPolicyPage() {
  return (
    <main
      className="min-h-dvh pb-28"
      style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f7fbff 42%, #ffffff 100%)' }}
    >
      {/* ── ヒーロー ── */}
      <section className="relative overflow-hidden px-5 pt-7 pb-7">
        <div
          className="absolute inset-x-0 top-0 h-64"
          style={{
            background:
              'radial-gradient(circle at 18% 10%, rgba(255,255,255,0.95) 0%, transparent 34%), radial-gradient(circle at 86% 18%, rgba(10,154,154,0.14) 0%, transparent 32%)',
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
              AD POLICY
            </p>
            <h1 className="text-[29px] font-black leading-[1.14] tracking-tight" style={{ color: '#0a2438' }}>
              PR表記と
              <br />
              広告掲載について
            </h1>
            <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>
              なごとしゃでは、読者にわかりやすく、店舗にも誠実な掲載を行うため、PR記事・広告枠・通常記事の違いを明確にしています。
            </p>
            <p
              className="mt-3 rounded-2xl px-4 py-3 text-[11px] font-bold leading-5"
              style={{ color: '#5f8392', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(29,91,115,0.10)' }}
            >
              広告やPRを含む場合は、記事内または掲載枠にわかりやすく表示します。
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <div
          className="rounded-3xl bg-white p-5"
          style={{
            border: '1.5px solid rgba(29,91,115,0.12)',
            boxShadow: '0 8px 24px rgba(10,36,56,0.08)',
          }}
        >
          <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#0a9a9a' }}>
            POLICY
          </p>
          <h2 className="mt-2 text-[19px] font-black leading-snug" style={{ color: '#0a2438' }}>
            なごとしゃの広告掲載方針
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-7" style={{ color: '#416b7d' }}>
            なごとしゃでは、読者が安心して情報を選べるように、広告・PR・協賛を含む記事には分かりやすい表記を行います。掲載内容は店舗やサービスの魅力を伝える一方で、読者に誤解を与える表現にならないよう確認します。
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {DISCLOSURE_POINTS.map(point => (
              <div
                key={point}
                className="flex items-start gap-2.5 rounded-2xl px-3 py-3"
                style={{
                  background: '#f6fbff',
                  border: '1px solid rgba(29,91,115,0.08)',
                }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: '#0a9a9a' }}>
                  <CheckSmIcon />
                </span>
                <p className="text-[12px] font-black leading-5" style={{ color: '#24465a' }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PR表記について ── */}
      <section className="px-4 pt-4">
        <SectionTitle eyebrow="DISCLOSURE">PR・広告は明確に表示します</SectionTitle>
        <p className="mt-3 text-[13px] font-medium leading-7" style={{ color: '#5f8392' }}>
          店舗から掲載料や提供を受けた記事・枠については、「PR」「広告」「Sponsored」などの表記を行います。読者が通常の記事と区別できるようにし、信頼性を損なわない運営を目指します。
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {PR_TYPES.map(item => (
            <article
              key={item.type}
              className="flex items-start gap-4 rounded-2xl bg-white p-4"
              style={{
                border: '1px solid rgba(29,91,115,0.10)',
                boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #e8f7fb, #d9f3ef)', color: '#1d5b73' }}
              >
                <PrTypeIcon name={item.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-[14px] font-black" style={{ color: '#0a2438' }}>
                    {item.type}
                  </h3>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.10em]"
                    style={{ background: item.badgeBg, color: item.badgeColor }}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] font-medium leading-5" style={{ color: '#5a7b8a' }}>
                  {item.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 広告商品一覧 ── */}
      <section className="px-4 pt-8">
        <SectionTitle eyebrow="MENU">店舗向け掲載メニュー</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {AD_MENUS.map(item => (
            <article
              key={item.name}
              className="rounded-2xl bg-white p-4"
              style={{
                border: '1px solid rgba(29,91,115,0.10)',
                boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #e8f7fb, #d9f3ef)', color: '#1d5b73' }}
                >
                  <MenuIcon name={item.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-black" style={{ color: '#0a2438' }}>
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-[12px] font-medium leading-5" style={{ color: '#5a7b8a' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
              <div
                className="mt-3 flex flex-wrap items-center gap-1.5 pt-3"
                style={{ borderTop: '1px solid rgba(29,91,115,0.06)' }}
              >
                <span className="text-[9px] font-black tracking-[0.12em]" style={{ color: '#8aa5b0' }}>
                  主な指標
                </span>
                {item.metrics.map(m => (
                  <span
                    key={m}
                    className="rounded-full px-2 py-0.5 text-[10px] font-black"
                    style={{ background: 'rgba(29,91,115,0.07)', color: '#1d5b73' }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 通常記事との違い ── */}
      <section className="px-4 pt-8">
        <SectionTitle eyebrow="COMPARISON">通常記事とPR記事の違い</SectionTitle>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <article
            className="rounded-2xl bg-white p-4"
            style={{
              border: '1px solid rgba(29,91,115,0.10)',
              boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
            }}
          >
            <p className="text-[10px] font-black tracking-[0.14em] mb-3" style={{ color: '#8aa5b0' }}>
              通常記事
            </p>
            <ul className="flex flex-col gap-2.5">
              {EDITORIAL_FEATURES.map(f => (
                <li
                  key={f}
                  className="flex items-start gap-1.5 text-[11px] font-bold leading-5"
                  style={{ color: '#416b7d' }}
                >
                  <span className="shrink-0 mt-0.5" style={{ color: '#b0c8d0' }}>
                    <DotIcon />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </article>

          <article
            className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(140deg, #f0fbf9, #eaf6fb)',
              border: '1.5px solid rgba(10,154,154,0.20)',
              boxShadow: '0 4px 16px rgba(10,154,154,0.08)',
            }}
          >
            <p className="text-[10px] font-black tracking-[0.14em] mb-3" style={{ color: '#0a9a9a' }}>
              PR記事
            </p>
            <ul className="flex flex-col gap-2.5">
              {PR_FEATURES.map(f => (
                <li
                  key={f}
                  className="flex items-start gap-1.5 text-[11px] font-bold leading-5"
                  style={{ color: '#24465a' }}
                >
                  <span className="shrink-0 mt-0.5" style={{ color: '#0a9a9a' }}>
                    <CheckSmIcon />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ── 掲載できない内容 ── */}
      <section className="px-4 pt-8">
        <SectionTitle eyebrow="POLICY">掲載をお断りする場合があります</SectionTitle>
        <p className="mt-3 text-[13px] font-medium leading-7" style={{ color: '#5f8392' }}>
          読者の安全や信頼を守るため、内容によっては掲載をお断りする場合があります。
        </p>
        <div
          className="mt-4 rounded-2xl bg-white p-4"
          style={{
            border: '1px solid rgba(29,91,115,0.10)',
            boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
          }}
        >
          <div className="flex flex-col gap-3">
            {DISALLOWED.map(item => (
              <div key={item} className="flex items-start gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'rgba(176,30,30,0.08)', color: '#b01e1e' }}
                >
                  <XIcon />
                </span>
                <p className="text-[13px] font-black pt-0.5" style={{ color: '#24465a' }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
          <div
            className="mt-4 rounded-2xl p-4"
            style={{
              background: 'rgba(29,91,115,0.04)',
              border: '1px solid rgba(29,91,115,0.08)',
            }}
          >
            <p className="text-[11px] font-black tracking-[0.12em]" style={{ color: '#1d5b73' }}>
              確認する観点
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {DISALLOWED_DETAIL_POINTS.map(point => (
                <div key={point} className="flex items-start gap-2">
                  <span className="mt-1 shrink-0" style={{ color: '#8aa5b0' }}>
                    <DotIcon />
                  </span>
                  <p className="text-[12px] font-bold leading-5" style={{ color: '#416b7d' }}>
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
            掲載内容に不安がある場合もご相談ください
          </h2>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#416b7d' }}>
            PR表記や掲載内容の見せ方は、店舗の魅力と読者の分かりやすさの両方を大切にして調整します。
          </p>
          <Link
            href="/partner"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[13px] font-black text-white active:scale-[0.98] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)',
              boxShadow: '0 8px 22px rgba(29,91,115,0.20)',
            }}
          >
            掲載について相談する
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pt-8">
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'linear-gradient(135deg, #0a2438, #1d5b73)',
            boxShadow: '0 10px 28px rgba(10,36,56,0.28)',
          }}
        >
          <p className="text-[10px] font-black tracking-[0.2em] text-white/55">HONEST PARTNERSHIP</p>
          <h2 className="mt-2 text-[20px] font-black leading-snug text-white">
            誠実に伝わる掲載を、
            <br />
            一緒に作ります。
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
            広告感を強く出すのではなく、読者が行きたくなる理由を整理し、店舗の魅力が自然に伝わる掲載を目指します。
          </p>
          <Link
            href="/partner#contact"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-[14px] font-black active:scale-[0.98] transition-transform"
            style={{ color: '#1d5b73' }}
          >
            掲載について相談する
            <ArrowRightIcon />
          </Link>
          <Link
            href="/partner/report-sample"
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-[13px] font-black active:scale-[0.98] transition-transform"
            style={{
              color: 'rgba(255,255,255,0.75)',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            掲載レポートサンプルを見る
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

function PrTypeIcon({ name }: { name: string }) {
  if (name === 'layout') return <LayoutIcon />;
  if (name === 'pen') return <PenIcon />;
  return <DocIcon />;
}

function MenuIcon({ name }: { name: string }) {
  if (name === 'spark') return <SparkIcon />;
  if (name === 'calendar') return <CalendarIcon />;
  if (name === 'map') return <MapPinIcon />;
  return <BoostIcon />;
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
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

function DocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function BoostIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2.5" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function CheckSmIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
