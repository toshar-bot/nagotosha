'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    // クエリパラメータでURLを渡す（blob URLはセッション内で有効）
    router.push(`/create/edit?src=${encodeURIComponent(url)}`);
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#030108]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)', paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* 背景グロウ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(110,65,10,0.18) 0%, transparent 65%)',
      }} />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-xs animate-fade-up">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.24em] font-bold text-white/30 mb-1">NAGOTOSHA</p>
          <h1 className="text-white font-black text-2xl">マイシール作成</h1>
          <p className="text-white/40 text-sm mt-2 leading-relaxed">
            食べたメシの写真を撮って<br />ぷっくりシールにしよう
          </p>
        </div>

        {/* カメラ撮影 */}
        <label className="w-full">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
          <div
            className="w-full py-5 rounded-2xl font-black text-white text-lg text-center active:scale-95 transition-transform cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #b8872f, #7a4a14)',
              boxShadow: '0 0 36px rgba(184,135,47,0.42), 0 4px 0 rgba(0,0,0,0.35)',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.14), transparent)',
              pointerEvents: 'none',
            }} />
            <span className="relative">カメラで撮る</span>
          </div>
        </label>

        {/* ライブラリ選択 */}
        <label className="w-full">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            ref={inputRef}
          />
          <div
            className="w-full py-4 rounded-2xl font-black text-white/70 text-base text-center active:scale-95 transition-transform cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            ライブラリから選ぶ
          </div>
        </label>

        <p className="text-white/20 text-xs text-center leading-relaxed">
          写真はこのデバイスのみに保存されます<br />外部サーバーには送信しません
        </p>
      </div>
    </div>
  );
}
