const AREAS = ['名駅', '栄', '大須', '金山', '藤が丘', '覚王山', '名古屋港', '今池'];

export default function AreaPage() {
  return (
    <main className="min-h-dvh pb-28" style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}>
      <PortalHeader eyebrow="AREA" title="エリアから探す" copy="名駅、栄、大須、藤が丘など、行きたいエリアから名古屋を探せます。" />
      <section className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-3">
          {AREAS.map(area => (
            <article key={area} className="rounded-2xl bg-white p-4" style={{ border: '1px solid rgba(29,91,115,0.10)', boxShadow: '0 4px 16px rgba(10,36,56,0.06)' }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-black" style={{ color: '#0a2438' }}>{area}</h2>
                  <p className="mt-1 text-[10px] font-black tracking-[0.14em]" style={{ color: '#8aa5b0' }}>NAGOYA AREA</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(10,154,154,0.10)', color: '#1d5b73' }}>
                  <MapIcon />
                </span>
              </div>
            </article>
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

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
