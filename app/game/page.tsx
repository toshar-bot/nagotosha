import Link from 'next/link';

import { GachaExperience } from '@/components/GachaExperience';
import { buildGachaPool } from '@/lib/gacha-pool';
import { getLatestPortalArticles } from '@/lib/wordpress-fetch';

export const revalidate = 300;

export default async function GamePage() {
  const articles = await getLatestPortalArticles({ perPage: 30 });
  const gachaArticles = buildGachaPool(articles);

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFDF7_45%,#FFF7F6_100%)] px-4 pb-28 pt-5 text-[#0F172A]">
      <div className="mx-auto w-full max-w-[520px]">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#E6ECF5] bg-white px-4 text-[13px] font-black text-[#071A4D] no-underline shadow-[0_8px_18px_rgba(7,26,77,0.07)]"
        >
          ← トップへ戻る
        </Link>

        <header className="pb-4 pt-6">
          <p className="text-[11px] font-black tracking-[0.22em] text-[#E8483F]">TODAY PICK</p>
          <h1 className="mt-2 text-[28px] font-black leading-tight text-[#071A4D]">
            今日の一軒ガチャ
          </h1>
          <p className="mt-3 text-[14px] font-bold leading-relaxed text-[#667085]">
            行き先を決めきれない日に、公開中の記事から1本だけ引ける軽い入口です。
          </p>
        </header>

        <GachaExperience articles={gachaArticles} location="game" />
      </div>
    </main>
  );
}
