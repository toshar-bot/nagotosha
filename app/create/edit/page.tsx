'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { saveMySticker, generateId } from '@/lib/myStickers';
import { compositeSticker, resizeImage } from '@/lib/stickerCanvas';

type Phase = 'removing' | 'preview' | 'naming' | 'saving' | 'done';

function EditInner() {
  const router    = useRouter();
  const params    = useSearchParams();
  const srcUrl    = params.get('src') ?? '';

  const [phase, setPhase]           = useState<Phase>('removing');
  const [progress, setProgress]     = useState(0);
  const [stickerUrl, setStickerUrl] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [stickerBlob, setStickerBlob] = useState<Blob | null>(null);
  const [stickerW, setStickerW]     = useState(0);
  const [stickerH, setStickerH]     = useState(0);
  const [name, setName]             = useState('');
  const [error, setError]           = useState<string | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!srcUrl) { router.replace('/create'); return; }
    runRemoval(srcUrl);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runRemoval(url: string) {
    try {
      // フェイクプログレスバー（WASMロード中）
      progressRef.current = setInterval(() => {
        setProgress(p => Math.min(p + (p < 60 ? 3 : p < 85 ? 1 : 0.3), 95));
      }, 100);

      // 画像取得
      const res  = await fetch(url);
      const blob = await res.blob();

      // リサイズ（大きすぎるとWASMが遅くなる）
      const resized = await resizeImage(blob, 800);

      // 背景除去（CDNからロード。webpackIgnoreでバンドル対象外に）
      // @ts-expect-error URL importはTypeScriptが解決できないが実行時に動作する
      const bgRemoval = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/index.mjs');
      const cutout = await bgRemoval.removeBackground(resized, {
        output: { format: 'image/png', quality: 1 },
      }) as Blob;

      // Canvas合成（白フチ・影・ツヤ）
      const { blob: sticker, width, height } = await compositeSticker(cutout);

      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);

      setCutoutBlob(cutout);
      setStickerBlob(sticker);
      setStickerW(width);
      setStickerH(height);
      setStickerUrl(URL.createObjectURL(sticker));

      // 少し待ってからプレビューへ
      setTimeout(() => setPhase('preview'), 400);
    } catch (e) {
      if (progressRef.current) clearInterval(progressRef.current);
      console.error(e);
      setError('背景除去に失敗しました。別の写真を試してください。');
    }
  }

  async function handleSave() {
    if (!name.trim() || !cutoutBlob || !stickerBlob) return;
    setPhase('saving');
    try {
      await saveMySticker({
        id: generateId(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
        cutoutBlob,
        stickerBlob,
        width: stickerW,
        height: stickerH,
      });
      setPhase('done');
      setTimeout(() => router.push('/zukan?tab=my'), 900);
    } catch {
      setError('保存に失敗しました。');
      setPhase('naming');
    }
  }

  // エラー表示
  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#030108] px-6">
        <p className="text-white/60 text-center text-sm leading-relaxed">{error}</p>
        <button
          onClick={() => router.push('/create')}
          className="px-8 py-3 rounded-2xl font-black text-white bg-white/10 border border-white/15 active:scale-95 transition-transform"
        >
          やり直す
        </button>
      </div>
    );
  }

  // 背景除去中
  if (phase === 'removing') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-[#030108]">
        {/* スキャン風リング */}
        <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
          {[60, 90, 120].map((r, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: r * 2, height: r * 2, borderRadius: '50%',
              border: `1px solid rgba(184,135,47,${0.35 - i * 0.08})`,
              animation: `scan-ring-pulse ${1.4 + i * 0.3}s ease-in-out infinite`,
            }} />
          ))}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(184,135,47,0.5), rgba(184,135,47,0.1))',
            animation: 'scan-ring-pulse 1s ease-in-out infinite alternate',
          }} />
        </div>

        <div className="flex flex-col items-center gap-2 px-6 w-full max-w-xs">
          <p className="text-white/70 font-black text-sm tracking-widest">背景を除去中...</p>
          <p className="text-white/30 text-xs">初回は数秒かかります</p>
          <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/25 text-xs">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  // プレビュー確認
  if (phase === 'preview' && stickerUrl) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center bg-[#030108]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)', paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(110,65,10,0.20) 0%, transparent 65%)',
        }} />

        <div className="relative z-10 flex flex-col items-center gap-6 w-full flex-1 px-6 pt-6 animate-fade-up">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.24em] font-bold text-white/30 mb-1">STICKER PREVIEW</p>
            <h2 className="text-white font-black text-xl">切り抜き確認</h2>
          </div>

          {/* シールプレビュー */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div style={{
              animation: 'sticker-drop 0.5s cubic-bezier(0.34,1.4,0.64,1) both',
              maxWidth: '80vw',
              maxHeight: '55vh',
            }}>
              <img
                src={stickerUrl}
                alt="sticker preview"
                style={{
                  maxWidth: '80vw',
                  maxHeight: '55vh',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.5))',
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setPhase('naming')}
              className="w-full py-5 rounded-2xl font-black text-white text-lg active:scale-95 transition-transform relative overflow-hidden"
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
              <span className="relative">これでシール化する！</span>
            </button>
            <button
              onClick={() => router.push('/create')}
              className="w-full py-4 rounded-2xl font-black text-white/50 text-sm active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              やり直す
            </button>
          </div>
        </div>
      </div>
    );
  }

  // シール名入力
  if (phase === 'naming') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center bg-[#030108]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)', paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(110,65,10,0.20) 0%, transparent 65%)',
        }} />

        <div className="relative z-10 flex flex-col items-center gap-6 w-full px-6 pt-8 animate-fade-up">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.24em] font-bold text-white/30 mb-1">STICKER NAME</p>
            <h2 className="text-white font-black text-xl">シール名をつける</h2>
          </div>

          {/* ミニプレビュー */}
          {stickerUrl && (
            <img
              src={stickerUrl}
              alt="sticker"
              style={{
                maxHeight: '28vh',
                maxWidth: '60vw',
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
              }}
            />
          )}

          {/* 名前入力 */}
          <div className="w-full max-w-xs flex flex-col gap-2">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              placeholder="例: 矢場とんのみそかつ"
              autoFocus
              className="w-full py-4 px-4 rounded-2xl font-bold text-white text-base bg-white/8 border border-white/15 outline-none placeholder:text-white/20"
              style={{ caretColor: '#f2b84b' }}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleSave(); }}
            />
            <p className="text-right text-white/20 text-xs">{name.length}/20</p>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full max-w-xs py-5 rounded-2xl font-black text-white text-lg active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 relative overflow-hidden"
            style={{
              background: name.trim() ? 'linear-gradient(135deg, #b8872f, #7a4a14)' : 'rgba(255,255,255,0.08)',
              boxShadow: name.trim() ? '0 0 36px rgba(184,135,47,0.42), 0 4px 0 rgba(0,0,0,0.35)' : 'none',
            }}
          >
            {name.trim() && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.14), transparent)',
                pointerEvents: 'none',
              }} />
            )}
            <span className="relative">シール帳に保存する</span>
          </button>
        </div>
      </div>
    );
  }

  // 保存中・完了
  if (phase === 'saving' || phase === 'done') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#030108]">
        {stickerUrl && (
          <img
            src={stickerUrl}
            alt="sticker"
            style={{
              maxHeight: '40vh',
              maxWidth: '70vw',
              objectFit: 'contain',
              filter: 'drop-shadow(0 12px 28px rgba(184,135,47,0.4))',
              animation: phase === 'done' ? 'sticker-drop 0.55s cubic-bezier(0.34,1.5,0.64,1) both' : 'none',
            }}
          />
        )}
        <p className="text-white/60 font-black text-sm tracking-widest">
          {phase === 'done' ? 'シール帳に追加したぞ！' : '保存中...'}
        </p>
      </div>
    );
  }

  return null;
}

export default function CreateEditPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-[#030108]">
        <div className="text-white/30 text-sm">読み込み中...</div>
      </div>
    }>
      <EditInner />
    </Suspense>
  );
}
