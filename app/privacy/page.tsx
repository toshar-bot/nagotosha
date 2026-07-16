import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site';

const title = 'プライバシーポリシー｜なごとしゃ';
const description =
  'なごとしゃで取得する可能性のある情報、利用目的、外部サービス、問い合わせ先についてまとめています。';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/privacy' },
  openGraph: {
    title,
    description,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'なごとしゃ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/opengraph-image'],
  },
};

const sections = [
  {
    title: '取得する可能性のある情報',
    body: [
      'なごとしゃでは、サイトの閲覧時にアクセス日時、閲覧ページ、端末やブラウザの種類、参照元などの技術的な情報を取得する場合があります。',
      '掲載相談・情報提供フォーム、メール、Instagram DMでお問い合わせいただく場合、店舗名、担当者名、メールアドレス、Instagramや公式URL、掲載したい内容、写真提供の有無など、連絡と確認に必要な情報を受け取ります。',
    ],
  },
  {
    title: '利用目的',
    body: [
      '取得した情報は、問い合わせへの返信、掲載可否や内容確認、サイト改善、閲覧状況の把握、不正利用やトラブルの防止のために利用します。',
      '掲載相談でいただいた内容は、記事化や掲載内容の確認、必要な連絡のために使用します。',
    ],
  },
  {
    title: 'アクセス解析とCookie',
    body: [
      'なごとしゃでは、サイトの利用状況を把握するため、Google Analyticsを使用しています。Google AnalyticsではCookie等を利用して閲覧状況を計測する場合があります。',
      'ブラウザの設定によりCookieを無効にできますが、一部の表示や機能に影響する場合があります。',
    ],
  },
  {
    title: '外部サービス',
    body: [
      '掲載相談にはGoogleフォーム、メール、Instagramなどの外部サービスを利用しています。外部サービスを利用する場合、それぞれのサービス提供者の規約やプライバシーポリシーが適用されます。',
      '記事内では、公式サイト、予約ページ、Googleマップなど外部サイトへのリンクを掲載する場合があります。',
    ],
  },
  {
    title: '第三者提供と情報管理',
    body: [
      '法令に基づく場合を除き、取得した情報を本人の同意なく第三者へ提供しません。',
      '取得した情報は、利用目的に必要な範囲で管理し、不要になった情報は適切な方法で削除または利用停止します。',
    ],
  },
  {
    title: '内容の変更',
    body: [
      '本ポリシーは、サイト運営内容や利用する外部サービスの変更に応じて、必要な範囲で更新する場合があります。',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh pb-16" style={{ background: '#ffffff' }}>
      <section className="px-5 pt-7 pb-7">
        <Link href="/" className="text-[11px] font-black tracking-[0.14em]" style={{ color: '#071A4D' }}>
          NAGOTOSHA
        </Link>
        <p className="mt-7 text-[10px] font-black tracking-[0.22em]" style={{ color: '#E8483F' }}>
          PRIVACY POLICY
        </p>
        <h1 className="mt-2 text-[29px] font-black leading-tight" style={{ color: '#071A4D' }}>
          プライバシーポリシー
        </h1>
        <p className="mt-4 text-[13px] font-medium leading-7" style={{ color: '#667085' }}>
          なごとしゃの閲覧、掲載相談、情報提供に関する個人情報等の取り扱いをまとめています。
        </p>
      </section>

      <section className="px-4">
        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[14px] bg-white p-5"
              style={{ border: '1px solid #E6ECF5', boxShadow: '0 6px 18px rgba(7,26,77,0.06)' }}
            >
              <h2 className="text-[17px] font-black leading-snug" style={{ color: '#071A4D' }}>
                {section.title}
              </h2>
              {section.body.map((text) => (
                <p key={text} className="mt-3 text-[13px] font-medium leading-7" style={{ color: '#667085' }}>
                  {text}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-[14px] bg-white p-5" style={{ border: '1px solid #E6ECF5' }}>
          <h2 className="text-[17px] font-black" style={{ color: '#071A4D' }}>
            お問い合わせ
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-7" style={{ color: '#667085' }}>
            個人情報の取り扱いに関するお問い合わせは、下記メールアドレスまでご連絡ください。
          </p>
          <a className="mt-3 inline-flex text-[13px] font-black" style={{ color: '#E8483F' }} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </main>
  );
}
