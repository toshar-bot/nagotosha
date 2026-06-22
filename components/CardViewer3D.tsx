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
  // subject 3D: img のみ RAF で更新 (wrapperはstyle固定)
  const subjectRef    = useRef<HTMLImageElement>(null);

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

    // ── subject parallax ──
    // wrapper が translateZ(60px) で固定前面にある。
    // img 内で translate することで、背景と subject の視差差を作る。
    // カードが右に傾く(ry>0)とき subject は逆方向へズレ → 前後感が生まれる
    if (subjectRef.current) {
      // parallax 強化: ±12px X / ±9px Y
      // カードが右(ry>0)→ subject は左へ、上(rx>0)→ subject は下へ
      // この「逆方向へのズレ」が前後感を生む
      const parX = (-c.ry * 0.46).toFixed(2);   // max ±12px @ 26deg
      const parY = ( c.rx * 0.45).toFixed(2);   // max ±9.0px @ 20deg
      const shX  = (-c.ry * 0.75).toFixed(1);
      const shY  = ( c.rx * 0.60 + 16).toFixed(1);

      subjectRef.current.style.transform =
        `translate(${parX}px, ${parY}px) scale(1.058)`;
      subjectRef.current.style.filter = [
        'brightness(1.18) contrast(1.20) saturate(1.14)',
        `drop-shadow(${shX}px ${shY}px 28px rgba(0,0,0,0.76))`,
        `drop-shadow(0 5px 12px rgba(0,0,0,0.55))`,
        `drop-shadow(0 0 22px rgba(110,65,0,0.20))`,
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

    // 接地影: カード傾きに合わせてズレる
    if (shadowRef.current) {
      const ox = (-c.ry / MAX_TILT_Y) * 16;
      const oy = (c.rx  / MAX_TILT_X) * 10 + 18;
      shadowRef.current.style.transform = `translateX(${ox}px) translateY(${oy}px) scaleX(0.82)`;
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

  const hasSubject = isUR && !!card.subjectImageUrl && owned;

  return (
    <div
      ref={wrapRef}
      style={{
        display: 'inline-block',
        padding: '20px 24px 44px',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'grab',
      }}
    >
      {/* perspective コンテナ */}
      <div style={{ perspective: '900px', perspectiveOrigin: '50% 45%', position: 'relative' }}>

        {/* ── 接地影（楕円・傾き連動） ── */}
        <div
          ref={shadowRef}
          style={{
            position: 'absolute',
            bottom: -20, left: '50%',
            width: '82%', height: 36,
            marginLeft: '-41%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.70) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            willChange: 'transform',
            filter: 'blur(8px)',
          }}
        />

        {/* ── 台座グロー（金色の接地光） ── */}
        {isUR && (
          <div style={{
            position: 'absolute',
            bottom: -8, left: '50%',
            width: '62%', height: 24,
            marginLeft: '-31%',
            background: 'radial-gradient(ellipse, rgba(200,140,30,0.28) 0%, transparent 72%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            filter: 'blur(4px)',
          }}/>
        )}

        {/* カード本体 */}
        <div
          ref={innerRef}
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            filter: [
              `drop-shadow(${isUR ? 4 : 2}px ${isUR ? 6 : 3}px 1px rgba(0,0,0,${isUR ? 0.82 : 0.60}))`,
              `drop-shadow(0 2px 3px rgba(0,0,0,0.52))`,
            ].join(' '),
          }}
        >
          {/* カードビジュアル（base を内包）— subject は hideSubject で非表示 */}
          <CardVisual
            card={card}
            owned={owned}
            widthPx={widthPx}
            hideSubject={hasSubject}
          />

          {/* ── subject 3D前面レイヤー ──────────────────────────────
              構造: div(translateZ:60px固定 + overflow:hidden) > img(parallax)
              - divのtranslateZでCSS3D上の前面に配置
              - imgのtranslateでtilt連動の視差差を実現
              - overflow:hiddenがscale時のはみ出しをクリップ
          ──────────────────────────────────────────────────────── */}
          {hasSubject && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0,
              width: w, height: h,
              borderRadius: cardR,
              overflow: 'hidden',
              // ★ base photo (z=0) より 105px 手前 — 視差が目視で分かる距離
              transform: 'translateZ(105px)',
              pointerEvents: 'none',
            }}>
              <img
                ref={subjectRef}
                src={card.subjectImageUrl}
                alt=""
                aria-hidden
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 18%',    // base 写真と完全一致
                  // 初期値 (RAF で毎フレーム上書き)
                  transform: 'scale(1.058)',
                  filter: [
                    'brightness(1.18) contrast(1.20) saturate(1.14)',
                    'drop-shadow(0 16px 28px rgba(0,0,0,0.76))',
                    'drop-shadow(0 5px 12px rgba(0,0,0,0.55))',
                  ].join(' '),
                }}
              />
            </div>
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

          {/* ── ホログラムフィルム（SR+） ── */}
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
