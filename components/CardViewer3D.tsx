'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Card } from '@/types/card';
import CardVisual from './CardVisual';

interface Props {
  card: Card;
  owned: boolean;
  widthPx?: number;
}

const MAX_TILT_X = 22;   // degrees vertical
const MAX_TILT_Y = 28;   // degrees horizontal
const SPRING     = 0.11; // lerp factor (lower = springier)

export default function CardViewer3D({ card, owned, widthPx }: Props) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);
  const shineRef  = useRef<HTMLDivElement>(null);
  const holoRef   = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const rafRef    = useRef<number | null>(null);
  const target    = useRef({ rx: 0, ry: 0, px: 0.5, py: 0.5, active: false });
  const current   = useRef({ rx: 0, ry: 0, px: 0.5, py: 0.5 });

  const isHighRare = card.rarity === 'SSR' || card.rarity === 'UR';
  const isMid      = card.rarity === 'SR';

  // ── レンダリング（RAF ループ） ───────────────────────────────
  function tick() {
    const t = target.current;
    const c = current.current;

    c.rx += (t.rx - c.rx) * SPRING;
    c.ry += (t.ry - c.ry) * SPRING;
    c.px += (t.px - c.px) * SPRING;
    c.py += (t.py - c.py) * SPRING;

    const inner  = innerRef.current;
    const shine  = shineRef.current;
    const holo   = holoRef.current;
    const shadow = shadowRef.current;

    if (inner) {
      inner.style.transform = `rotateX(${c.rx}deg) rotateY(${c.ry}deg)`;
    }

    if (shine) {
      const sx = c.px * 100;
      const sy = c.py * 100;
      shine.style.background = `radial-gradient(ellipse 70% 55% at ${sx}% ${sy}%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.10) 45%, transparent 75%)`;
      shine.style.opacity = t.active ? '1' : '0';
    }

    if (holo && (isHighRare || isMid)) {
      const hue   = Math.round(c.px * 320);
      const angle = Math.round(c.px * 160 + c.py * 80 + 110);
      const maxOp = isHighRare ? 0.28 : 0.14;
      holo.style.backgroundImage = [
        `linear-gradient(${angle}deg,`,
        `  hsl(${hue},100%,62%) 0%,`,
        `  hsl(${(hue + 55) % 360},100%,62%) 18%,`,
        `  hsl(${(hue + 110) % 360},100%,62%) 36%,`,
        `  hsl(${(hue + 165) % 360},100%,62%) 54%,`,
        `  hsl(${(hue + 220) % 360},100%,62%) 72%,`,
        `  hsl(${(hue + 275) % 360},100%,62%) 100%`,
        `)`,
      ].join('');
      holo.style.opacity = t.active ? String(maxOp) : '0';
    }

    if (shadow) {
      // 傾きに合わせて影の方向を動かす
      const ox = (-c.ry / MAX_TILT_Y) * 12;
      const oy = (c.rx  / MAX_TILT_X) * 8 + 14;
      shadow.style.transform = `translateX(${ox}px) translateY(${oy}px) scaleX(0.88)`;
    }

    const settled = !t.active
      && Math.abs(c.rx) < 0.03
      && Math.abs(c.ry) < 0.03;

    if (settled) {
      rafRef.current = null;
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }

  function startRaf() {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }

  // ── ポインター ───────────────────────────────────────────────
  const onPointerMove = useCallback((e: PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = Math.max(0, Math.min(1, (e.clientX - rect.left)  / rect.width));
    const py = Math.max(0, Math.min(1, (e.clientY - rect.top)   / rect.height));
    target.current = {
      rx: (0.5 - py) * MAX_TILT_X * 2,
      ry: (px - 0.5) * MAX_TILT_Y * 2,
      px,
      py,
      active: true,
    };
    startRaf();
  }, []);

  const onPointerLeave = useCallback(() => {
    target.current = { rx: 0, ry: 0, px: 0.5, py: 0.5, active: false };
    startRaf();
  }, []);

  // ── ジャイロ（スマホ傾け） ──────────────────────────────────
  useEffect(() => {
    function onOrientation(e: DeviceOrientationEvent) {
      if (target.current.active) return; // 触っている間はジャイロ無効
      if (e.beta === null || e.gamma === null) return;
      const rx = Math.max(-MAX_TILT_X, Math.min(MAX_TILT_X, (e.beta - 50) * 0.45));
      const ry = Math.max(-MAX_TILT_Y, Math.min(MAX_TILT_Y, e.gamma * 0.65));
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
  }, []);

  // ── イベント登録 ────────────────────────────────────────────
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

  return (
    <div
      ref={wrapRef}
      style={{
        display: 'inline-block',
        padding: '24px 28px 36px',  // 影のスペース
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'grab',
      }}
    >
      {/* perspective ラッパー */}
      <div style={{ perspective: '900px', perspectiveOrigin: '50% 50%' }}>
        {/* 地面の影（カードの下） */}
        <div
          ref={shadowRef}
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            width: '80%',
            height: 28,
            marginLeft: '-40%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 75%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            willChange: 'transform',
            filter: 'blur(4px)',
          }}
        />

        {/* カード本体 */}
        <div
          ref={innerRef}
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            // 縁の厚み感: 右・下に濃い影
            filter: 'drop-shadow(0 2px 0px rgba(0,0,0,0.65)) drop-shadow(2px 0 0px rgba(0,0,0,0.45))',
          }}
        >
          <CardVisual card={card} owned={owned} widthPx={widthPx} />

          {/* ── Shine（反射ハイライト） ── */}
          <div
            ref={shineRef}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 12,
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.18s',
              mixBlendMode: 'overlay',
              zIndex: 10,
            }}
          />

          {/* ── Hologram（虹グラデ） ── */}
          {(isHighRare || isMid) && (
            <div
              ref={holoRef}
              style={{
                position: 'absolute', inset: 0,
                borderRadius: 12,
                pointerEvents: 'none',
                opacity: 0,
                transition: 'opacity 0.25s',
                mixBlendMode: 'color-dodge',
                zIndex: 11,
              }}
            />
          )}

          {/* ── Edge highlight（縁の光沢） ── */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 12,
            pointerEvents: 'none',
            zIndex: 12,
            boxShadow: [
              'inset 0  1px 0 rgba(255,255,255,0.22)',  // 上縁
              'inset 0 -1px 0 rgba(0,0,0,0.35)',         // 下縁
              'inset  1px 0 rgba(255,255,255,0.12)',      // 左縁
              'inset -1px 0 rgba(0,0,0,0.25)',            // 右縁
            ].join(', '),
          }} />
        </div>
      </div>
    </div>
  );
}
