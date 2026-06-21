'use client';

import React, { forwardRef } from 'react';
import { Card } from '@/types/card';
import { PlacedStickerData } from '@/lib/stickerBook';
import { PageTheme } from '@/lib/bookThemes';
import PlacedSticker from './PlacedSticker';

export function randomRotation(): number {
  return (Math.random() - 0.5) * 26; // ±13°
}

interface Props {
  theme: PageTheme;
  placed: PlacedStickerData[];     // すでにpageIndexでフィルタ済み
  cardMap: Record<string, Card>;
  newUid: string | null;
  leftPageRef:  React.RefObject<HTMLDivElement>;
  rightPageRef: React.RefObject<HTMLDivElement>;
  onStickerMove:   (uid: string, cx: number, cy: number, rotation: number, scale: number) => void;
  onStickerRemove: (uid: string) => void;
}

export default function StickerBook({
  theme, placed, cardMap, newUid,
  leftPageRef, rightPageRef,
  onStickerMove, onStickerRemove,
}: Props) {
  const leftPlaced  = placed.filter(p => p.pageId === 'left');
  const rightPlaced = placed.filter(p => p.pageId === 'right');

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        background: '#c2a87e',
        padding: '7px 4px 4px',
        boxShadow: 'inset 0 3px 12px rgba(70,40,5,0.30)',
      }}
    >
      <div
        className="flex w-full h-full"
        style={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 5px 28px rgba(0,0,0,0.25)' }}
      >
        {/* 左ページ */}
        <PageSurface
          ref={leftPageRef}
          side="left"
          theme={theme}
          placed={leftPlaced}
          cardMap={cardMap}
          newUid={newUid}
          onMove={onStickerMove}
          onRemove={onStickerRemove}
        />

        {/* 綴じ部 */}
        <Spine />

        {/* 右ページ */}
        <PageSurface
          ref={rightPageRef}
          side="right"
          theme={theme}
          placed={rightPlaced}
          cardMap={cardMap}
          newUid={newUid}
          onMove={onStickerMove}
          onRemove={onStickerRemove}
        />
      </div>
    </div>
  );
}

/* ── Spine ── */
function Spine() {
  return (
    <div style={{
      width: 13, flexShrink: 0, position: 'relative',
      background: 'linear-gradient(to right, #a88858 0%, #ccaa78 40%, #bea068 60%, #9a7840 100%)',
      boxShadow: 'inset -3px 0 8px rgba(0,0,0,0.14), inset 3px 0 8px rgba(0,0,0,0.14)',
    }}>
      {[13, 29, 45, 61, 77].map((pct, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          top: `${pct}%`, width: 8, height: 8, borderRadius: '50%',
          background: '#806030',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.08)',
        }} />
      ))}
    </div>
  );
}

/* ── PageSurface ── */
interface PageSurfaceProps {
  side: 'left' | 'right';
  theme: PageTheme;
  placed: PlacedStickerData[];
  cardMap: Record<string, Card>;
  newUid: string | null;
  onMove:   (uid: string, cx: number, cy: number, rotation: number, scale: number) => void;
  onRemove: (uid: string) => void;
}

const PageSurface = forwardRef<HTMLDivElement, PageSurfaceProps>(
  ({ side, theme, placed, cardMap, newUid, onMove, onRemove }, ref) => {
    const bg = side === 'left' ? theme.leftBg : theme.rightBg;
    const isLeft = side === 'left';

    return (
      <div
        ref={ref}
        className="flex-1 relative overflow-hidden select-none"
        style={{ background: bg, touchAction: 'none' }}
      >
        {/* 背景パターン */}
        <PatternLayer pattern={theme.pattern} color={theme.patternColor} />

        {/* マスキングテープ */}
        <MaskingTape masking={theme.masking} />

        {/* ページ内ドット枠線 */}
        <div style={{
          position: 'absolute', top: 23, left: 5, right: 5, bottom: 5,
          border: `1.5px dashed ${theme.borderColor}`,
          borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* コーナー装飾 */}
        <CornerDeco style={theme.cornerStyle} color={theme.accent} />

        {/* ページタイトルラベル */}
        <TitleLabel theme={theme} isLeft={isLeft} />

        {/* 散らし装飾文字 */}
        {theme.decos.map((d, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: `${d.x}%`, top: `${d.y}%`,
            fontSize: d.size,
            color: theme.accent,
            opacity: d.opacity ?? 0.25,
            transform: d.rot ? `rotate(${d.rot}deg)` : undefined,
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: 1,
          }}>
            {d.char}
          </span>
        ))}

        {/* 貼り付け済みシール */}
        {placed.map(item => {
          const card = cardMap[item.stickerId];
          if (!card) return null;
          return (
            <PlacedSticker
              key={item.uid}
              uid={item.uid}
              card={card}
              cx={item.cx}
              cy={item.cy}
              rotation={item.rotation}
              scale={item.scale}
              zIndex={item.zIndex}
              isNew={item.uid === newUid}
              onMove={onMove}
              onRemove={onRemove}
              getPageRect={() => (ref as React.RefObject<HTMLDivElement>).current?.getBoundingClientRect() ?? null}
            />
          );
        })}
      </div>
    );
  },
);
PageSurface.displayName = 'PageSurface';

/* ── サブコンポーネント ── */

function PatternLayer({ pattern, color }: { pattern: string; color: string }) {
  if (pattern === 'dot') return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `radial-gradient(circle, ${color} 1.5px, transparent 1.5px)`,
      backgroundSize: '18px 18px',
    }} />
  );
  if (pattern === 'grid') return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `
        repeating-linear-gradient(0deg,  ${color} 0, ${color} 1px, transparent 1px, transparent 28px),
        repeating-linear-gradient(90deg, ${color} 0, ${color} 1px, transparent 1px, transparent 28px)
      `,
    }} />
  );
  if (pattern === 'flower') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[[15,25],[55,45],[80,20],[30,70],[65,80],[10,60]].map(([x, y], i) => (
        <span key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: 10, color, opacity: 0.18, userSelect: 'none' }}>✿</span>
      ))}
    </div>
  );
  if (pattern === 'star-dot') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
      }} />
      {[[20,35],[70,55],[40,80],[85,25]].map(([x, y], i) => (
        <span key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: 8, color, opacity: 0.20, userSelect: 'none' }}>★</span>
      ))}
    </div>
  );
  return null;
}

function MaskingTape({ masking }: { masking: PageTheme['masking'] }) {
  const { color1, color2, style } = masking;
  let bg = '';
  if (style === 'dot')
    bg = `radial-gradient(circle, rgba(255,255,255,0.55) 2px, transparent 2px), ${color1}`;
  else if (style === 'stripe')
    bg = `repeating-linear-gradient(45deg, ${color1} 0, ${color1} 4px, ${color2} 4px, ${color2} 9px)`;
  else if (style === 'leaf')
    bg = `repeating-linear-gradient(90deg, ${color1} 0, ${color1} 10px, ${color2} 10px, ${color2} 18px)`;
  else if (style === 'ribbon')
    bg = `repeating-linear-gradient(90deg, ${color1} 0, ${color1} 14px, ${color2} 14px, ${color2} 28px)`;
  else if (style === 'hachimaki')
    bg = `repeating-linear-gradient(90deg, ${color1} 0, ${color1} 7px, ${color2} 7px, ${color2} 14px)`;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 20,
      background: bg,
      backgroundSize: style === 'dot' ? '9px 9px' : undefined,
      opacity: 0.78,
      zIndex: 1,
      pointerEvents: 'none',
    }} />
  );
}

function CornerDeco({ style, color }: { style: PageTheme['cornerStyle']; color: string }) {
  if (style === 'none') return null;
  const positions = ['tl','tr','bl','br'] as const;

  if (style === 'stitch') return (
    <>{positions.map(p => (
      <div key={p} style={{
        position: 'absolute',
        top:    p[0]==='t' ? 25 : undefined, bottom: p[0]==='b' ? 7 : undefined,
        left:   p[1]==='l' ? 7  : undefined, right:  p[1]==='r' ? 7 : undefined,
        width: 14, height: 14,
        borderTop:    p[0]==='t' ? `2px solid ${color}` : undefined,
        borderBottom: p[0]==='b' ? `2px solid ${color}` : undefined,
        borderLeft:   p[1]==='l' ? `2px solid ${color}` : undefined,
        borderRight:  p[1]==='r' ? `2px solid ${color}` : undefined,
        opacity: 0.45, pointerEvents: 'none',
      }} />
    ))}</>
  );
  if (style === 'round') return (
    <>{positions.map(p => (
      <div key={p} style={{
        position: 'absolute',
        top:    p[0]==='t' ? 25 : undefined, bottom: p[0]==='b' ? 7 : undefined,
        left:   p[1]==='l' ? 7  : undefined, right:  p[1]==='r' ? 7 : undefined,
        width: 7, height: 7, borderRadius: '50%',
        background: color, opacity: 0.28, pointerEvents: 'none',
      }} />
    ))}</>
  );
  if (style === 'diamond') return (
    <>{positions.map(p => (
      <div key={p} style={{
        position: 'absolute',
        top:    p[0]==='t' ? 25 : undefined, bottom: p[0]==='b' ? 7 : undefined,
        left:   p[1]==='l' ? 7  : undefined, right:  p[1]==='r' ? 7 : undefined,
        width: 8, height: 8, border: `1.5px solid ${color}`,
        transform: 'rotate(45deg)', opacity: 0.38, pointerEvents: 'none',
      }} />
    ))}</>
  );
  return null;
}

function TitleLabel({ theme, isLeft }: { theme: PageTheme; isLeft: boolean }) {
  const hasColorBg = theme.labelBg !== 'transparent';
  return (
    <div style={{
      position: 'absolute',
      top: 27,
      left: isLeft ? 10 : undefined,
      right: isLeft ? undefined : 10,
      fontSize: 9,
      fontWeight: 900,
      fontStyle: 'italic',
      letterSpacing: '0.10em',
      color: hasColorBg ? theme.labelColor : theme.labelColor,
      background: hasColorBg ? theme.labelBg : 'transparent',
      padding: hasColorBg ? '2px 7px' : 0,
      borderRadius: hasColorBg ? 4 : 0,
      transform: `rotate(${theme.labelRot}deg)`,
      transformOrigin: isLeft ? 'left center' : 'right center',
      userSelect: 'none',
      pointerEvents: 'none',
      zIndex: 2,
      boxShadow: hasColorBg ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
    }}>
      {isLeft ? theme.title : theme.subtitle}
    </div>
  );
}
