const NEW_CARDS = [
  {
    title: 'NEWオープン',
    text: '名古屋に新しくできたお店やスポットを、エリアごとに見つけやすく整理します。',
  },
  {
    title: '新着グルメ',
    text: '新メニュー、限定メニュー、話題になり始めたグルメ情報をまとめます。',
  },
  {
    title: '話題の記事',
    text: '保存数や地図クリックが伸びている記事を、あとから見返しやすく並べます。',
  },
];

export default function NewPage() {
  return (
    <main className="min-h-dvh pb-28" style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}>
      <PortalHeader eyebrow="NEW" title="新着・NEW!" copy="新店オープン、話題のスポット、新しい記事をまとめてチェックできます。" />
      <section className="px-4 pt-3">
        <div className="flex flex-col gap-3">
          {NEW_CARDS.map(card => (
            <InfoCard key={card.title} title={card.title} text={card.text} />
          ))}
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

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-white p-4" style={{ border: '1px solid rgba(29,91,115,0.10)', boxShadow: '0 4px 16px rgba(10,36,56,0.06)' }}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #e8f7fb, #d9f3ef)', color: '#1d5b73' }}>
          <StarIcon />
        </span>
        <div>
          <h2 className="text-[15px] font-black leading-snug" style={{ color: '#0a2438' }}>{title}</h2>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#5a7b8a' }}>{text}</p>
        </div>
      </div>
    </article>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}
