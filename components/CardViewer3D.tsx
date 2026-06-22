'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Card } from '@/types/card';
import CardVisual from './CardVisual';

interface Props {
  card: Card;
  owned: boolean;
  widthPx?: number;
}

const MAX_TILT_X = 20;
const MAX_TILT_Y = 26;
const SPRING     = 0.10;

export default function CardViewer3D({ card, owned, widthPx }: Props) {
  const wrapRef       = useRef<HTMLDivElement>(null);
  const innerRef      = useRef<HTMLDivElement>(null);
  const frameShineRef = useRef<HTMLDivElement>(null);
  const holoRef       = useRef<HTMLDivElement>(null);
  const shadowRef     = useRef<HTMLDivElement>(null);
  const subjectRef    = useRef<HTMLImageElement>(null);  // 3D 前面 subject レイヤー

  const rafRef  = useRef<number | null>(null);
  const target  = useRef({ rx: 0, ry: 0, px: 0.5, py: 0.5, active: false });
  const current = useRef({ rx: 0, ry: 0, px: 0.5, py: 0.5 });

  const isUR       = card.rarity === 'UR';
  const isHighRare = card.rarity === 'SSR' || isUR;
  const isMid      = card.rarity === 'SR';

  const w = widthPx ?? 280;
  const h = Math.round(w * 1.42);
  const cardR = Math.round(w * 0.052);

  // ── RAF アニメーションループ ──────────────────────────────────
  function tick() {
    const t = target.current;
    const c = current.current;

    c.rx += (t.rx - c.rx) * SPRING;
    c.ry += (t.ry - c.ry) * SPRING;
    c.px += (t.px - c.px) * SPRING;
    c.py += (t.py - c.py) * SPRING;

    // カード本体の傾き
    if (innerRef.current) {
      innerRef.current.style.transform = `rotateX(${c.rx}deg) rotateY(${c.ry}deg)`;
    }

    // subject 3D前面レイヤー: parallax + 明度差 + 傾き連動シャドウ
    if (subjectRef.current) {
      // parallax: カードが右に傾く(ry>0)とき subject は逆方向(左)へズレる → 奥行き感
      const parX = -c.ry * 0.24;   // max ±6.2px @ 26deg
      const parY =  c.rx * 0.20;   // max ±4.0px @ 20deg
      // シャドウ方向もカード傾きに連動
      const shX = (-c.ry * 0.55).toFixed(1);
      const shY = (c.rx * 0.40 + 10).toFixed(1);

      subjectRef.current.style.transform =
        `translate3d(${parX.toFixed(2)}px, ${parY.toFixed(2)}px, 38px) scale(1.016)`;
      subjectRef.current.style.filter = [
        'brightness(1.10) contrast(1.15) saturate(1.10)',
        `drop-shadow(${shX}px ${shY}px 20px rgba(0,0,0,0.68))`,
        `drop-shadow(0 2px 6px rgba(0,0,0,0.44))`,
        `drop-shadow(0 0 12px rgba(90,55,0,0.16))`,
      ].join(' ');
    }

    // 枠シャイン
    if (frameShineRef.current) {
      const ux = (c.px - 0.5) * 2;
      const uy = (c.py - 0.5) * 2;
      const shineX = Math.round(-ux * 22);
      const shineY = Math.round(-uy * 22);
      const shineOp = t.active ? 0.65 : 0.0;

      if (isUR) {
        frameShineRef.current.style.boxShadow = [
          `inset ${shineX}px ${shineY}px 30px rgba(255,255,255,${shineOp * 0.28})`,
          `inset 0 0 6px rgba(255,255,255,${shineOp * 0.18})`,
        ].join(', ');
      } else if (isHighRare) {
        frameShineRef.current.style.boxShadow =
          `inset ${shineX}px ${shineY}px 24px rgba(220,200,255,${shineOp * 0.22})`;
      } else if (isMid) {
        frameShineRef.current.style.boxShadow =
          `inset ${shineX}px ${shineY}px 20px rgba(255,200,60,${shineOp * 0.20})`;
      } else {
        frameShineRef.current.style.boxShadow =
          `inset ${shineX}px ${shineY}px 16px rgba(255,255,255,${shineOp * 0.12})`;
      }
    }

    // ホログラムフィルム
    if (holoRef.current && (isHighRare || isMid)) {
      const hue   = Math.round(c.px * 280 + c.ry * 3);
      const angle = Math.round(c.px * 140 + c.py * 70 + 115);
      const maxOp = isUR ? 0.14 : isHighRare ? 0.22 : 0.12;
      const op    = t.active ? maxOp : maxOp * 0.35;

      holoRef.current.style.backgroundImage = `linear-gradient(${angle}deg,
        hsl(${hue},100%,65%) 0%,
        hsl(${(hue+50)%360},100%,65%) 20%,
        hsl(${(hue+100)%360},100%,65%) 40%,
        hsl(${(hue+150)%360},100%,65%) 60%,
        hsl(${(hue+200)%360},100%,65%) 80%,
        hsl(${(hue+250)%360},100%,65%) 100%)`;
      holoRef.current.style.opacity = String(op);
    }

    // 影の位置
    if (shadowRef.current) {
      const ox = (-c.ry / MAX_TILT_Y) * 14;
      const oy = (c.rx  / MAX_TILT_X) * 10 + 16;
      shadowRef.current.style.transform = `translateX(${ox}px) translateY(${oy}px) scaleX(0.85)`;
    }

    const settled = !t.active && Math.abs(c.rx) < 0.04 && Math.abs(c.ry) < 0.04;
    if (settled) {
      rafRef.current = null;
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }

  function startRaf() {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }

  // ── ポインター ────────────────────────────────────────────────
  const onPointerMove = useCallback((e: PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height));
    target.current = {
      rx: (0.5 - py) * MAX_TILT_X * 2,
      ry: (px - 0.5) * MAX_TILT_Y * 2,
      px, py, active: true,
    };
    startRaf();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerLeave = useCallback(() => {
    target.current = { rx: 0, ry: 0, px: 0.5, py: 0.5, active: false };
    startRaf();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ジャイロ ──────────────────────────────────────────────────
  useEffect(() => {
    function onOrientation(e: DeviceOrientationEvent) {
      if (target.current.active) return;
      if (e.beta === null || e.gamma === null) return;
      const rx = Math.max(-MAX_TILT_X, Math.min(MAX_TILT_X, (e.beta - 50) * 0.42));
      const ry = Math.max(-MAX_TILT_Y, Math.min(MAX_TILT_Y, e.gamma * 0.60));
      target.current = {
        rx, ry,
        px: 0.5 + ry / (MAX_TILT_Y * 2),
        py: 0.5 - rx / (MAX_TILT_X * 2),
        active: false,
      };
      startRaf();
    }
    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── イベント登録 ──────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerleave', onPointerLeave);
    el.addEventListener('pointercancel', onPointerLeave);
    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      el.removeEventListener('pointercancel', onPointerLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onPointerMove, onPointerLeave]);

  // UR の subjectImageUrl があるときに 3D 前面 subject を描画するか
  const hasSubject = isUR && !!card.subjectImageUrl && owned;

  return (
    <div
      ref={wrapRef}
      style={{
        display: 'inline-block',
        padding: '20px 24px 40px',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'grab',
      }}
    >
      {/* perspective コンテナ */}
      <div style={{ perspective: '1000px', perspectiveOrigin: '50% 50%', position: 'relative' }}>

        {/* 地面の影 */}
        <div
          ref={shadowRef}
          style={{
            position: 'absolute',
            bottom: -16, left: '50%',
            width: '78%', height: 32,
            marginLeft: '-39%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.65) 0%, transparent 72%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            willChange: 'transform',
            filter: 'blur(5px)',
          }}
        />

        {/* カード本体 */}
        <div
          ref={innerRef}
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            filter: [
              `drop-shadow(${isUR ? 3 : 2}px ${isUR ? 5 : 3}px 0px rgba(0,0,0,${isUR ? 0.80 : 0.60}))`,
              `drop-shadow(0 2px 2px rgba(0,0,0,0.50))`,
            ].join(' '),
          }}
        >
          {/* カードビジュアル本体 — subject は CardViewer3D が代替描画するので hideSubject */}
          <CardVisual
            card={card}
            owned={owned}
            widthPx={widthPx}
            hideSubject={hasSubject}
          />

          {/* ── subject 3D前面レイヤー（translateZ で料理を前面に） ── */}
          {hasSubject && (
            <img
              ref={subjectRef}
              src={card.subjectImageUrl}
              alt=""
              aria-hidden
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: w,
                height: h,
                objectFit: 'cover',
                objectPosition: 'center 18%',   // base 写真と完全一致
                // 初期値（RAFで毎フレーム上書きされる）
                transform: 'translate3d(0px, 0px, 38px) scale(1.016)',
                clipPath: `inset(0 round ${cardR}px)`,
                pointerEvents: 'none',
                filter: [
                  'brightness(1.10) contrast(1.15) saturate(1.10)',
                  'drop-shadow(0 10px 20px rgba(0,0,0,0.68))',
                  'drop-shadow(0 2px 6px rgba(0,0,0,0.44))',
                ].join(' '),
              }}
            />
          )}

          {/* ── 枠シャイン ── */}
          <div
            ref={frameShineRef}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: cardR,
              pointerEvents: 'none',
              zIndex: 50,
              transition: 'box-shadow 0.08s ease-out',
            }}
          />

          {/* ── ホログラムフィルム（SR+、角度で虹がずれる） ── */}
          {(isHighRare || isMid) && (
            <div
              ref={holoRef}
              style={{
                position: 'absolute', inset: 0,
                borderRadius: cardR,
                pointerEvents: 'none',
                opacity: isUR ? 0.10 : isHighRare ? 0.16 : 0.08,
                mixBlendMode: 'color-dodge',
                zIndex: 51,
                transition: 'opacity 0.3s',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
