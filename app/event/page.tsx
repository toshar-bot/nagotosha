const EVENT_CARDS = [
  {
    title: '今週末の注目イベント',
    text: '名古屋市内で開催される週末イベントを、行きやすさと話題性で整理していきます。',
  },
  {
    title: '雨の日でも楽しめる屋内イベント',
    text: '天気を気にせず過ごせる展示、マーケット、体験型イベントをまとめます。',
  },
  {
    title: '家族で行きたい名古屋イベント',
    text: '子ども連れでも楽しみやすい会場や、短時間で回れるお出かけ先を紹介します。',
  },
];

export default function EventPage() {
  return (
    <main className="min-h-dvh pb-28" style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}>
      <PortalHeader eyebrow="EVENT" title="名古屋のイベント" copy="今日・今週末・季節のイベントをここに集約していきます。" />
      <section className="px-4 pt-3">
        <div className="flex flex-col gap-3">
          {EVENT_CARDS.map(card => (
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
          <CalendarIcon />
        </span>
        <div>
          <h2 className="text-[15px] font-black leading-snug" style={{ color: '#0a2438' }}>{title}</h2>
          <p className="mt-2 text-[12px] font-medium leading-6" style={{ color: '#5a7b8a' }}>{text}</p>
        </div>
      </div>
    </article>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M8 2v5" />
      <path d="M16 2v5" />
      <path d="M3 10h18" />
    </svg>
  );
}
