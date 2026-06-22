export default function SavedPage() {
  return (
    <main className="min-h-dvh pb-28" style={{ background: 'linear-gradient(180deg, #eef6ff 0%, #f8fbff 44%, #ffffff 100%)' }}>
      <section className="relative overflow-hidden px-5 pt-7 pb-6">
        <div className="absolute inset-x-0 top-0 h-56" style={{ background: 'radial-gradient(circle at 18% 8%, rgba(255,255,255,0.92) 0%, transparent 36%), radial-gradient(circle at 85% 18%, rgba(10,154,154,0.14) 0%, transparent 34%)' }} />
        <div className="relative">
          <p className="text-[10px] font-black tracking-[0.22em] mb-3" style={{ color: '#0a9a9a' }}>SAVED</p>
          <h1 className="text-[28px] font-black leading-tight tracking-tight" style={{ color: '#0a2438' }}>保存した記事</h1>
          <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: '#416b7d' }}>
            気になる記事や行きたいお店を、あとから見返せる場所です。
          </p>
        </div>
      </section>

      <section className="px-4 pt-3">
        <div className="rounded-3xl bg-white p-5 text-center" style={{ border: '1.5px solid rgba(29,91,115,0.12)', boxShadow: '0 8px 24px rgba(10,36,56,0.08)' }}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #e8f7fb, #d9f3ef)', color: '#1d5b73' }}>
            <BookmarkIcon />
          </div>
          <h2 className="mt-4 text-[17px] font-black" style={{ color: '#0a2438' }}>まだ保存機能は準備中です。</h2>
          <p className="mt-3 text-[13px] font-medium leading-6" style={{ color: '#5a7b8a' }}>
            今後、保存した記事・お店・イベントをここに表示します。
          </p>
        </div>
      </section>
    </main>
  );
}

function BookmarkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
