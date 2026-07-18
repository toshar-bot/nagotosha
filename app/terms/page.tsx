import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site';

const title = '利用規約｜なごとしゃ';
const description =
  'なごとしゃの利用条件、掲載情報、外部リンク、著作権、免責事項、問い合わせ先についてまとめています。';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/terms' },
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
    title: 'サイトの利用について',
    body: 'なごとしゃは、名古屋周辺の新店、グルメ、おでかけ、イベント、店舗掲載相談に関する情報を提供する地域情報サイトです。利用者は、本規約の内容を確認したうえでサイトを利用するものとします。',
  },
  {
    title: '掲載情報について',
    body: '記事内の営業時間、価格、メニュー、開催内容、予約方法などは、公式発表や店舗・施設の情報をもとに掲載します。内容は変更・終了する場合があるため、来店や予約の前に公式サイト、予約ページ、店舗・施設の最新情報をご確認ください。',
  },
  {
    title: '外部リンクについて',
    body: '記事やページ内には、公式サイト、予約ページ、Googleマップ、外部フォーム、SNSなどへのリンクを掲載する場合があります。外部サイトの内容や利用条件については、各サイトの運営者が定める規約等をご確認ください。',
  },
  {
    title: '著作権・画像権利',
    body: 'なごとしゃに掲載する文章、画像、デザイン等の権利は、なごとしゃまたは正当な権利者に帰属します。記事内の公式画像、提供画像、外部素材は、出典や提供元の条件に従って掲載します。無断転載や不正利用はお控えください。',
  },
  {
    title: '禁止事項',
    body: 'サイトの運営を妨げる行為、掲載内容の無断転載、虚偽情報の送信、第三者の権利を侵害する行為、法令や公序良俗に反する行為は禁止します。',
  },
  {
    title: '免責事項',
    body: 'なごとしゃは、掲載情報の正確性や完全性の向上に努めますが、内容の変更、終了、価格改定、臨時休業、予約状況などについて常に完全であることを保証するものではありません。利用者は自身の判断で最新の公式情報を確認してください。',
  },
  {
    title: '規約の変更',
    body: '本規約は、サイト運営内容の変更に応じて更新する場合があります。変更後の内容は、本ページに掲載した時点で有効になります。',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-dvh pb-16" style={{ background: '#ffffff' }}>
      <section className="px-5 pt-7 pb-7">
        <Link href="/" className="text-[11px] font-black tracking-[0.14em]" style={{ color: '#071A4D' }}>
          NAGOTOSHA
        </Link>
        <p className="mt-7 text-[10px] font-black tracking-[0.22em]" style={{ color: '#E8483F' }}>
          TERMS
        </p>
        <h1 className="mt-2 text-[29px] font-black leading-tight" style={{ color: '#071A4D' }}>
          利用規約
        </h1>
        <p className="mt-4 text-[13px] font-medium leading-7" style={{ color: '#667085' }}>
          なごとしゃを安心して利用いただくための基本的な条件をまとめています。
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
              <p className="mt-3 text-[13px] font-medium leading-7" style={{ color: '#667085' }}>
                {section.body}
              </p>
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
            本規約に関するお問い合わせは、下記メールアドレスまでご連絡ください。
          </p>
          <a className="mt-3 inline-flex text-[13px] font-black" style={{ color: '#E8483F' }} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </main>
  );
}
