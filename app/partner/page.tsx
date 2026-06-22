import Link from 'next/link';

const SUPPORT_ITEMS = [
  {
    title: '店舗紹介記事',
    text: 'お店の魅力、看板メニュー、利用シーンを読者が行きたくなる形で整理します。',
    icon: 'article',
  },
  {
    title: 'NEW! オープン掲載',
    text: '新店や新メニューをトップページの注目導線に乗せ、早い認知獲得を支援します。',
    icon: 'spark',
  },
  {
    title: 'Googleマップ導線',
    text: '記事を読んだ人が迷わず来店検討できるよう、地図クリックまで設計します。',
    icon: 'map',
  },
  {
    title: 'SNS投稿サポート',
    text: 'X投稿向けの文章や画像構成まで、記事と一緒に使える素材として整えます。',
    icon: 'share',
  },
];

const PLANS = [
  {
    name: 'ライトプラン',
    price: '15,000円〜',
    lead: 'まずは掲載を始めたい店舗向け',
    features: ['店舗紹介記事', 'Googleマップ導線', 'NEW! ラベル掲載'],
  },
  {
    name: 'スタンダード',
    price: '35,000円〜',
    lead: '認知と来店導線をまとめて作りたい店舗向け',
    featured: true,
    features: ['トップ注目枠', 'みんなの注目記事', 'X投稿用画像/文章', '簡易レポート'],
  },
  {
    name: 'プレミアム',
    price: '70,000円〜',
    lead: '継続的に集客改善したい店舗向け',
    features: ['トップ掲載強化', 'ランキング枠', 'ショート動画台本', '月次改善提案'],
  },
];

const STRENGTHS = [
  '名古屋特化',
  'スマホで見やすい',
  'NEW!訴求が強い',
  'Googleマップクリックを重視',
  'AIで記事・SNS・レポートまで高速化',
];

const CONTACT_FIELDS = [
  '店舗名',
  'ご担当者名',
  'メールアドレス',
  '掲載したい内容',
];

const CONTACT_PLAN_OPTIONS = [
  'ライト',
  'スタンダード',
  'プレミアム',
  'まだ決めていない',
];

const CONTACT_MAILTO = `mailto:hello@nagotosha.com?subject=${encodeURIComponent(
  'なごとしゃ掲載相談',
)}&body=${encodeURIComponent(`店舗名：
ご担当者名：
メールアドレス：
掲載したい内容：
希望プラン：`)}`;

export default function PartnerPage() {
  return (
    <main
      className="min-h-dvh pb-28"
      style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f7fbff 38%, #ffffff 100%)' }}
    >
      <section className="relative overflow-hidden px-5 pt-7 pb-8">
        <div
          className="absolute inset-x-0 top-0 h-64"
          style={{
            background:
              'radial-gradient(circle at 18% 10%, rgba(255,255,255,0.95) 0%, transparent 34%), radial-gradient(circle at 86% 20%, rgba(10,154,154,0.16) 0%, transparent 32%)',
          }}
        />
        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.14em]"
            style={{ color: '#1d5b73' }}
          >
            <ArrowLeftIcon />
            NAGOTOSHA
          </Link>

          <div className="mt-7">
            <p className="text-[10px] font-black tracking-[0.22em] mb-3" style={{ color: '#0a9a9a' }}>
              STORE PARTNER
            </p>
            <h1 className="text-[30px] font-black leading-[1.14] tracking-tight" style={{ color: '#0a2438' }}>
              名古屋のお店を、
              <br />
              行きたい人へ届ける。
            </h1>
            <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>
              なごとしゃは、記事掲載だけでなく、NEW!掲載・Googleマップ導線・SNS投稿までまとめて支援する名古屋特化メディアです。
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href="#contact"
              className="flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[14px] font-black text-white active:scale-[0.98] transition-transform"
              style={{
                background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)',
                boxShadow: '0 8px 22px rgba(29,91,115,0.24)',
              }}
            >
              掲載について相談する
              <ArrowRightIcon />
            </a>
            <a
              href="#plans"
              className="flex items-center justify-center rounded-2xl px-5 py-3.5 text-[13px] font-black active:scale-[0.98] transition-transform"
              style={{
                color: '#1d5b73',
                background: '#ffffff',
                border: '1.5px solid rgba(29,91,115,0.14)',
              }}
            >
              まずは内容を見る
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 pt-2">
        <SectionTitle eyebrow="SUPPORT">なごとしゃでできること</SectionTitle>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {SUPPORT_ITEMS.map(item => (
            <article
              key={item.title}
              className="rounded-2xl bg-white p-4"
              style={{
                border: '1px solid rgba(29,91,115,0.10)',
                boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #e8f7fb, #d9f3ef)', color: '#1d5b73' }}
              >
                <FeatureIcon name={item.icon} />
              </div>
              <h2 className="mt-3 text-[14px] font-black leading-snug" style={{ color: '#0a2438' }}>
                {item.title}
              </h2>
              <p className="mt-2 text-[11px] font-medium leading-5" style={{ color: '#5a7b8a' }}>
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="plans" className="px-4 pt-8">
        <SectionTitle eyebrow="PLAN">掲載プラン</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {PLANS.map(plan => (
            <article
              key={plan.name}
              className="rounded-2xl bg-white p-4"
              style={{
                border: plan.featured ? '1.5px solid rgba(10,154,154,0.34)' : '1px solid rgba(29,91,115,0.10)',
                boxShadow: plan.featured
                  ? '0 8px 24px rgba(10,154,154,0.14)'
                  : '0 4px 16px rgba(10,36,56,0.06)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-black" style={{ color: '#0a2438' }}>
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-[11px] font-bold" style={{ color: '#5f8392' }}>
                    {plan.lead}
                  </p>
                </div>
                {plan.featured && (
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-[10px] font-black tracking-[0.12em]"
                    style={{ color: '#ffffff', background: '#0a9a9a' }}
                  >
                    BASIC
                  </span>
                )}
              </div>
              <p className="mt-4 text-[26px] font-black tracking-tight" style={{ color: '#1d5b73' }}>
                {plan.price}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-[13px] font-bold" style={{ color: '#24465a' }}>
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle eyebrow="WHY NAGOTOSHA">なごとしゃが強い理由</SectionTitle>
        <div
          className="mt-4 rounded-2xl bg-white p-4"
          style={{
            border: '1px solid rgba(29,91,115,0.10)',
            boxShadow: '0 4px 16px rgba(10,36,56,0.06)',
          }}
        >
          <div className="flex flex-col gap-2.5">
            {STRENGTHS.map(strength => (
              <div key={strength} className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'rgba(10,154,154,0.10)', color: '#0a9a9a' }}
                >
                  <CheckIcon />
                </span>
                <p className="text-[13px] font-black" style={{ color: '#0a2438' }}>
                  {strength}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-8">
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, #f8fcff, #edf8f6)',
            border: '1.5px solid rgba(29,91,115,0.14)',
          }}
        >
          <p className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#1d5b73' }}>
            PR POLICY
          </p>
          <h2 className="mt-2 text-[17px] font-black" style={{ color: '#0a2438' }}>
            PR表記について
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#416b7d' }}>
            広告・PRの場合は、読者に分かるように明確に表記します。短期的な露出だけでなく、信頼を落とさない紹介を大切にします。
          </p>
        </div>
      </section>

      <section id="contact" className="px-4 pt-8">
        <div
          className="rounded-3xl p-5"
          style={{
            background: '#ffffff',
            border: '1.5px solid rgba(29,91,115,0.12)',
            boxShadow: '0 10px 28px rgba(10,36,56,0.10)',
          }}
        >
          <p className="text-[10px] font-black tracking-[0.2em]" style={{ color: '#0a9a9a' }}>
            CONTACT
          </p>
          <h2 className="mt-2 text-[21px] font-black leading-snug" style={{ color: '#0a2438' }}>
            掲載について相談する
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#416b7d' }}>
            新店オープン、イベント告知、Googleマップ導線、SNS投稿まで、まずは気軽にご相談ください。
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {CONTACT_FIELDS.map(field => (
              <FieldPreview key={field} label={field} />
            ))}

            <div>
              <p className="mb-2 text-[11px] font-black" style={{ color: '#24465a' }}>
                希望プラン
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CONTACT_PLAN_OPTIONS.map((plan, index) => (
                  <div
                    key={plan}
                    className="rounded-xl px-3 py-3 text-center text-[12px] font-black"
                    style={{
                      color: index === 3 ? '#5f8392' : '#1d5b73',
                      background: index === 1 ? 'rgba(10,154,154,0.10)' : '#f6fbff',
                      border: index === 1
                        ? '1.5px solid rgba(10,154,154,0.26)'
                        : '1px solid rgba(29,91,115,0.10)',
                    }}
                  >
                    {plan}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a
            href={CONTACT_MAILTO}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[14px] font-black text-white active:scale-[0.98] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1d5b73, #0a9a9a)',
              boxShadow: '0 8px 22px rgba(29,91,115,0.22)',
            }}
          >
            掲載について相談する
            <ArrowRightIcon />
          </a>
          <p className="mt-3 text-[10px] font-medium leading-5" style={{ color: '#6f8d9a' }}>
            内容を確認後、掲載可否・プラン・進行方法についてご連絡します。広告・PR掲載の場合は、読者に分かる形で明確に表記します。
          </p>
          <Link
            href="/partner/report-sample"
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-[12px] font-black active:scale-[0.98] transition-transform"
            style={{
              color: '#1d5b73',
              background: '#f6fbff',
              border: '1px solid rgba(29,91,115,0.12)',
            }}
          >
            掲載レポートサンプルを見る
          </Link>
          <Link
            href="/partner/ad-policy"
            className="mt-2 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-[12px] font-black active:scale-[0.98] transition-transform"
            style={{
              color: '#1d5b73',
              background: '#f6fbff',
              border: '1px solid rgba(29,91,115,0.12)',
            }}
          >
            PR表記・広告掲載について
          </Link>
          <Link
            href="/partner/wordpress-status"
            className="mt-2 inline-flex w-full flex-col items-center justify-center rounded-2xl px-4 py-3 text-center active:scale-[0.98] transition-transform"
            style={{
              color: '#1d5b73',
              background: '#f6fbff',
              border: '1px solid rgba(29,91,115,0.12)',
            }}
          >
            <span className="text-[12px] font-black">
              WordPress接続ステータスを確認
            </span>
            <span className="mt-1 text-[10px] font-bold" style={{ color: '#6f8d9a' }}>
              記事取得やフォールバック状態を確認できます。
            </span>
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

function FeatureIcon({ name }: { name: string }) {
  if (name === 'map') return <MapIcon />;
  if (name === 'share') return <ShareIcon />;
  if (name === 'spark') return <SparkIcon />;
  return <ArticleIcon />;
}

function FieldPreview({ label }: { label: string }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-black" style={{ color: '#24465a' }}>
        {label}
      </p>
      <div
        className="rounded-xl px-3 py-3.5 text-[12px] font-bold"
        style={{
          color: '#9ab0bc',
          background: '#f6fbff',
          border: '1px solid rgba(29,91,115,0.10)',
        }}
      >
        メール作成画面で入力してください
      </div>
    </div>
  );
}

function ArticleIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.5l6.8-4" />
      <path d="M8.6 13.5l6.8 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
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

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}
