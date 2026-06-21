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
  const wrapRef      = useRef<HTMLDivElement>(null);
  const innerRef     = useRef<HTMLDivElement>(null);
  const frameShineRef = useRef<HTMLDivElement>(null);  // 枠に沿うシャイン
  const holoRef      = useRef<HTMLDivElement>(null);   // ホログラムフィルム
  const shadowRef    = useRef<HTMLDivElement>(null);

  const rafRef  = useRef<number | null>(null);
  const target  = useRef({ rx: 0, ry: 0, px: 0.5, py: 0.5, active: false });
  const current = useRef({ rx: 0, ry: 0, px: 0.5, py: 0.5 });

  const isUR       = card.rarity === 'UR';
  const isHighRare = card.rarity === 'SSR' || isUR;
  const isMid      = card.rarity === 'SR';

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

    // 枠シャイン — pointer位置でinset-shadowの方向が変わる
    if (frameShineRef.current) {
      const ux = (c.px - 0.5) * 2;    // -1 … +1
      const uy = (c.py - 0.5) * 2;
      const shineX = Math.round(-ux * 22);
      const shineY = Math.round(-uy * 22);
      const shineOp = t.active ? 0.65 : 0.0;

      if (isUR) {
        // UR: 枠に沿って走る白グロー
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

    // ホログラムフィルム — 角度で虹色がずれる (SR+のみ)
    if (holoRef.current && (isHighRare || isMid)) {
      const hue   = Math.round(c.px * 280 + c.ry * 3);
      const angle = Math.round(c.px * 140 + c.py * 70 + 115);
      const maxOp = isUR ? 0.16 : isHighRare ? 0.22 : 0.12;
      const op    = t.active ? maxOp : maxOp * 0.35;  // 静止時も少し残す

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

  const cardR = Math.round((widthPx ?? 280) * 0.052);

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
            // 縁の厚み感（右下に影）
            filter: [
              `drop-shadow(${isUR ? 3 : 2}px ${isUR ? 5 : 3}px 0px rgba(0,0,0,${isUR ? 0.80 : 0.60}))`,
              `drop-shadow(0 2px 2px rgba(0,0,0,0.50))`,
            ].join(' '),
          }}
        >
          <CardVisual card={card} owned={owned} widthPx={widthPx} />

          {/* ── 枠シャイン（inset-shadow → 枠に沿って光る） ── */}
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
