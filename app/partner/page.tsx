import type { Metadata } from 'next';
import Link from 'next/link';

const description =
  '名古屋のお店向けに、初回無料掲載、店舗紹介記事、Googleマップ導線、公式URL導線、掲載相談を受け付けています。';

export const metadata: Metadata = {
  title: '店舗掲載・無料掲載相談｜なごとしゃ',
  description,
  openGraph: {
    title: '店舗掲載・無料掲載相談｜なごとしゃ',
    description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '店舗掲載・無料掲載相談｜なごとしゃ',
    description,
    images: ['/opengraph-image'],
  },
};

const INSTAGRAM_URL = 'https://www.instagram.com/nagotosha/';
const CONTACT_MAILTO = `mailto:hello@nagotosha.com?subject=${encodeURIComponent(
  'なごとしゃ掲載相談',
)}&body=${encodeURIComponent(`店舗名:
ご担当者名:
メールアドレス:
Instagram / 公式URL:
掲載したい内容:
写真提供の有無:
`)}`;

const HERO_BADGES = ['初回掲載無料（2026年9月30日まで）', 'Instagram DM相談OK', 'Googleマップ導線つき'];

const SUPPORT_ITEMS = [
  {
    title: '店舗紹介記事',
    text: 'お店の特徴、メニュー、使いやすいシーンを、読者が行きたくなる形で整理します。',
    icon: 'article',
  },
  {
    title: '写真掲載',
    text: '店舗外観、料理、商品、店内など、提供写真を記事内で見やすく掲載します。',
    icon: 'photo',
  },
  {
    title: 'Googleマップ導線',
    text: '記事を読んだ人が迷わず来店検討できるよう、地図リンクを分かりやすく置きます。',
    icon: 'map',
  },
  {
    title: '公式URL導線',
    text: '公式サイト、Instagram、予約ページなど、次に見てほしい場所へつなげます。',
    icon: 'link',
  },
  {
    title: '関連記事・まとめ導線',
    text: '新店まとめや関連記事からも見つけやすくし、記事単体で終わらせません。',
    icon: 'spark',
  },
  {
    title: 'トップ新店枠掲載',
    text: '新店や注目情報は、なごとしゃ内の新店枠・記事枠でも紹介します。',
    icon: 'share',
  },
];

const EXAMPLES = [
  {
    title: 'PASTA MANIA 鶴舞店',
    href: '/article/92',
    label: '新店記事',
    area: '鶴舞',
    text: '店舗写真、OPENバッジ、30秒ポイント、基本情報、地図導線を整理した単品店舗記事。',
  },
  {
    title: '七宝麻辣湯 新栄店',
    href: '/article/32',
    label: '新店記事',
    area: '新栄',
    text: '駅近・営業時間・店舗情報を見やすくまとめ、トップ新店枠にも掲載した記事。',
  },
  {
    title: 'JR名古屋タカシマヤ デリシャスコート',
    href: '/article/39',
    label: '施設ニュース',
    area: '名駅',
    text: '複数ブランドを含むリニューアル情報を、商業施設ニュースとして整理した記事。',
  },
];

const PREP_ITEMS = [
  '店舗名',
  '住所',
  '営業時間',
  '定休日',
  '写真',
  '公式URL / Instagram',
  'おすすめ商品',
  'オープン日 / キャンペーン内容',
];

const FLOW_ITEMS = [
  {
    title: '専用フォームで相談',
    text: '掲載したい内容が固まっていなくても大丈夫です。まずはフォームから分かる範囲のお店の情報を送ってください。',
  },
  {
    title: '店舗情報・写真を共有',
    text: '住所、営業時間、写真、公式URLなど、記事化に必要な情報を確認します。',
  },
  {
    title: 'なごとしゃ側で記事化',
    text: '読者が迷わず理解できるよう、見出し、地図導線、公式リンクを整理します。',
  },
  {
    title: '内容確認',
    text: '営業時間や住所など、間違いがあると困る情報を中心に確認します。',
  },
  {
    title: '掲載・記事URL共有',
    text: '公開後は記事URLを共有します。新店枠や関連記事導線にも活用します。',
  },
];

const PAID_MENU = [
  {
    name: 'ライト相談',
    price: '15,000円〜',
    text: '無料掲載後に、写真追加や導線強化を軽く試したい店舗向け。',
  },
  {
    name: '本格PR相談',
    price: '35,000円〜',
    text: '記事掲載、トップ導線、SNS文面、簡易レポートまでまとめて設計。',
  },
  {
    name: '特集・スポンサー相談',
    price: '70,000円〜',
    text: '季節特集、スポンサー枠、継続的な露出設計を相談したい場合に。',
  },
];

const FAQ_ITEMS = [
  {
    question: '無料掲載は本当に無料ですか？',
    answer: '初回掲載は2026年9月30日まで無料相談から受け付けます。内容や時期により掲載可否は編集部で確認します。',
  },
  {
    question: '写真が少なくても相談できますか？',
    answer: '相談できます。外観、商品、店内など、使える写真があるほど記事の魅力は伝わりやすくなります。',
  },
  {
    question: '新店以外でも掲載できますか？',
    answer: '季節メニュー、イベント、リニューアル、手土産、地域の話題なども相談できます。',
  },
  {
    question: 'PR表記はどうなりますか？',
    answer: '広告・PR・提供を含む場合は、読者に分かる形で明記します。',
  },
  {
    question: '掲載後のレポートはありますか？',
    answer: '本格PR相談では、閲覧や地図導線などをもとに簡易レポートを提案できます。',
  },
];

export default function PartnerPage() {
  return (
    <main className="min-h-dvh pb-12" style={{ background: '#ffffff' }}>
      <section className="px-5 pt-7 pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.14em]"
          style={{ color: '#071A4D' }}
        >
          <ArrowLeftIcon />
          NAGOTOSHA
        </Link>

        <div className="mt-7">
          <p className="text-[10px] font-black tracking-[0.22em] mb-3" style={{ color: '#E8483F' }}>
            STORE PARTNER
          </p>
          <h1 className="text-[30px] font-black leading-[1.14] tracking-tight" style={{ color: '#071A4D' }}>
            名古屋のお店を、
            <br />
            なごとしゃで無料掲載しませんか？
          </h1>
          <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#667085' }}>
            新店・季節メニュー・手土産・イベント情報などを、名古屋の読者に届く形で紹介します。まずは2026年9月30日までの初回無料掲載から相談できます。
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {HERO_BADGES.map(badge => (
            <span
              key={badge}
              className="rounded-full px-3 py-1.5 text-[11px] font-black"
              style={{ color: '#071A4D', background: '#F8FAFC', border: '1px solid #E6ECF5' }}
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <p className="text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
            新店・リニューアル・新商品・イベント情報を受け付けています。
            <br />
            必要事項をご入力いただいた後、1〜3営業日以内を目安にご連絡します。
          </p>
          <a
            href="https://forms.gle/cG5TnpdgJn4vh4uw7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full min-w-0 items-center justify-center gap-2 rounded-full px-4 py-4 text-center text-[14px] font-black leading-snug text-white active:scale-[0.98] transition-transform"
            style={{ background: '#E8483F', boxShadow: '0 12px 24px rgba(232,72,63,0.30)' }}
          >
            <span className="min-w-0">掲載相談・情報提供フォームへ</span>
            <ArrowRightIcon />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-black active:scale-[0.98] transition-transform"
            style={{ color: '#071A4D', background: '#ffffff', border: '1.5px solid #E6ECF5' }}
          >
            Instagram DMで相談する
            <ArrowRightIcon />
          </a>
          <a
            href={CONTACT_MAILTO}
            className="flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-black active:scale-[0.98] transition-transform"
            style={{ color: '#071A4D', background: '#ffffff', border: '1.5px solid #E6ECF5' }}
          >
            メールで掲載相談する
          </a>
          <a
            href="#examples"
            className="flex items-center justify-center rounded-full px-5 py-3 text-[13px] font-black active:scale-[0.98] transition-transform"
            style={{ color: '#E8483F', background: 'rgba(232,72,63,0.08)' }}
          >
            掲載実例を見る
          </a>
        </div>
      </section>

      <section className="px-4 pt-2">
        <SectionTitle eyebrow="SUPPORT">掲載でできること</SectionTitle>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {SUPPORT_ITEMS.map(item => (
            <article
              key={item.title}
              className="rounded-[14px] bg-white p-4"
              style={{ border: '1px solid #E6ECF5', boxShadow: '0 4px 16px rgba(7,26,77,0.06)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'rgba(232,72,63,0.08)', color: '#E8483F' }}
              >
                <FeatureIcon name={item.icon} />
              </div>
              <h2 className="mt-3 text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
                {item.title}
              </h2>
              <p className="mt-2 text-[11px] font-medium leading-5" style={{ color: '#667085' }}>
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="examples" className="px-4 pt-8">
        <SectionTitle eyebrow="EXAMPLES">掲載実例</SectionTitle>
        <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
          実際の記事では、写真・OPENバッジ・基本情報・Googleマップ導線・関連記事を組み合わせて紹介します。
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {EXAMPLES.map(example => (
            <Link
              key={example.href}
              href={example.href}
              className="block rounded-[14px] bg-white p-4 active:scale-[0.99] transition-transform"
              style={{ border: '1px solid #E6ECF5', boxShadow: '0 4px 16px rgba(7,26,77,0.06)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-black"
                      style={{ color: '#E8483F', background: 'rgba(232,72,63,0.08)' }}
                    >
                      {example.label}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-black"
                      style={{ color: '#071A4D', background: '#F8FAFC' }}
                    >
                      {example.area}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[16px] font-black leading-snug" style={{ color: '#071A4D' }}>
                    {example.title}
                  </h3>
                </div>
                <span className="mt-1 shrink-0" style={{ color: '#E8483F' }}>
                  <ArrowRightIcon />
                </span>
              </div>
              <p className="mt-3 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
                {example.text}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle eyebrow="CHECKLIST">店舗側で用意するもの</SectionTitle>
        <div
          className="mt-4 rounded-[14px] bg-white p-4"
          style={{ border: '1px solid #E6ECF5', boxShadow: '0 4px 16px rgba(7,26,77,0.06)' }}
        >
          <div className="grid grid-cols-2 gap-2">
            {PREP_ITEMS.map(item => (
              <div
                key={item}
                className="flex min-h-[44px] items-center gap-2 rounded-[10px] px-3 py-2"
                style={{ background: '#F8FAFC', border: '1px solid #E6ECF5' }}
              >
                <span className="shrink-0" style={{ color: '#E8483F' }}>
                  <CheckIcon />
                </span>
                <span className="text-[12px] font-black leading-snug" style={{ color: '#071A4D' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
            すべて揃っていなくても相談できます。まずは分かる範囲で送ってください。
          </p>
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle eyebrow="FLOW">掲載までの流れ</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {FLOW_ITEMS.map((item, index) => (
            <article
              key={item.title}
              className="flex gap-3 rounded-[14px] bg-white p-4"
              style={{ border: '1px solid #E6ECF5', boxShadow: '0 4px 16px rgba(7,26,77,0.06)' }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white"
                style={{ background: '#E8483F' }}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="px-4 pt-8">
        <div
          className="rounded-[18px] p-5"
          style={{
            background: 'linear-gradient(135deg, #FFF1ED 0%, #FFE0DD 48%, #FFF4D7 100%)',
            border: '1.5px solid rgba(232,72,63,0.14)',
          }}
        >
          <p className="text-[10px] font-black tracking-[0.2em]" style={{ color: '#E8483F' }}>
            FREE CONSULTATION
          </p>
          <h2 className="mt-2 text-[21px] font-black leading-snug" style={{ color: '#071A4D' }}>
            まずは初回無料で掲載相談できます（2026年9月30日まで）
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
            新店オープン、季節メニュー、イベント告知、手土産情報など、掲載できるか迷う内容も気軽にご相談ください。
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
              新店・リニューアル・新商品・イベント情報を受け付けています。
              <br />
              必要事項をご入力いただいた後、1〜3営業日以内を目安にご連絡します。
            </p>
            <a
              href="https://forms.gle/cG5TnpdgJn4vh4uw7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-full px-4 py-4 text-center text-[14px] font-black leading-snug text-white active:scale-[0.98] transition-transform"
              style={{ background: '#E8483F', boxShadow: '0 12px 24px rgba(232,72,63,0.30)' }}
            >
              <span className="min-w-0">掲載相談・情報提供フォームへ</span>
              <ArrowRightIcon />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-[13px] font-black active:scale-[0.98] transition-transform"
              style={{ color: '#071A4D', border: '1.5px solid rgba(7,26,77,0.12)' }}
            >
              Instagram DMで相談する
              <ArrowRightIcon />
            </a>
            <a
              href={CONTACT_MAILTO}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-[13px] font-black active:scale-[0.98] transition-transform"
              style={{ color: '#071A4D', border: '1.5px solid rgba(7,26,77,0.12)' }}
            >
              メールで掲載相談する
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle eyebrow="PAID MENU">今後の有料メニュー例</SectionTitle>
        <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
          今は2026年9月30日までの初回無料掲載を主役にしています。継続露出や本格PRが必要な場合だけ、相談内容に合わせて提案します。
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {PAID_MENU.map(menu => (
            <article
              key={menu.name}
              className="rounded-[14px] bg-white p-4"
              style={{ border: '1px solid #E6ECF5', boxShadow: '0 4px 16px rgba(7,26,77,0.06)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-black" style={{ color: '#071A4D' }}>
                  {menu.name}
                </h3>
                <span className="shrink-0 text-[14px] font-black" style={{ color: '#E8483F' }}>
                  {menu.price}
                </span>
              </div>
              <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
                {menu.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle eyebrow="FAQ">よくある質問</SectionTitle>
        <div className="mt-4 flex flex-col gap-3">
          {FAQ_ITEMS.map(item => (
            <article
              key={item.question}
              className="rounded-[14px] bg-white p-4"
              style={{ border: '1px solid #E6ECF5', boxShadow: '0 4px 16px rgba(7,26,77,0.06)' }}
            >
              <h3 className="text-[14px] font-black leading-snug" style={{ color: '#071A4D' }}>
                {item.question}
              </h3>
              <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#667085' }}>
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8 pb-2">
        <div
          className="rounded-[18px] bg-white p-5"
          style={{ border: '1px solid #E6ECF5', boxShadow: '0 10px 28px rgba(7,26,77,0.08)' }}
        >
          <p className="text-[10px] font-black tracking-[0.2em]" style={{ color: '#E8483F' }}>
            TRUST
          </p>
          <h2 className="mt-2 text-[20px] font-black leading-snug" style={{ color: '#071A4D' }}>
            PR表記や掲載後レポートも確認できます
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#667085' }}>
            広告・PRを含む場合は読者に分かる形で明記します。掲載後の反応イメージもサンプルで確認できます。
          </p>
          <Link
            href="/partner/report-sample"
            className="mt-4 inline-flex w-full items-center justify-center rounded-[12px] px-4 py-3 text-[12px] font-black active:scale-[0.98] transition-transform"
            style={{ color: '#071A4D', background: '#F8FAFC', border: '1px solid #E6ECF5' }}
          >
            掲載後レポート例を見る
          </Link>
          <Link
            href="/partner/ad-policy"
            className="mt-2 inline-flex w-full items-center justify-center rounded-[12px] px-4 py-3 text-[12px] font-black active:scale-[0.98] transition-transform"
            style={{ color: '#071A4D', background: '#F8FAFC', border: '1px solid #E6ECF5' }}
          >
            PR表記・広告掲載方針を見る
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

function FeatureIcon({ name }: { name: string }) {
  if (name === 'map') return <MapIcon />;
  if (name === 'share') return <ShareIcon />;
  if (name === 'spark') return <SparkIcon />;
  if (name === 'link') return <LinkIcon />;
  if (name === 'photo') return <PhotoIcon />;
  return <ArticleIcon />;
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

function LinkIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="M21 15l-4.5-4.5L9 18" />
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
