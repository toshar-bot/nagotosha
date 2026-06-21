'use client';

import { Card } from '@/types/card';
import { RARITY_CONFIG, RarityConfig } from '@/lib/rarity';

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────
interface Props {
  card: Card;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** overrides size preset */
  widthPx?: number;
  owned?: boolean;
  isNew?: boolean;
  rarityRevealed?: boolean;
  /**
   * Real cutout PNG with alpha for the subject layer.
   * Falls back to pseudo-cutout (clip-path on photo) when not provided.
   * Swap this prop with a real segmented PNG in future.
   */
  subjectUrl?: string;
  onClick?: () => void;
}

const SIZES = { sm: 100, md: 164, lg: 230, xl: 290 } as const;

// ─────────────────────────────────────────
// Entry
// ─────────────────────────────────────────
export default function CardVisual({
  card, size = 'md', widthPx, owned = true, isNew = false,
  rarityRevealed = true, subjectUrl, onClick,
}: Props) {
  const w   = widthPx ?? SIZES[size];
  const h   = Math.round(w * 1.42);
  const cfg = RARITY_CONFIG[card.rarity];

  if (!owned || !rarityRevealed) {
    return <CardBack w={w} h={h} onClick={onClick} />;
  }

  if (cfg.isFullArt && card.imageUrl) {
    return (
      <FullArtCard
        card={card} cfg={cfg} w={w} h={h}
        isNew={isNew} subjectUrl={subjectUrl} onClick={onClick}
      />
    );
  }

  return (
    <StandardCard
      card={card} cfg={cfg} w={w} h={h}
      isNew={isNew} subjectUrl={subjectUrl} onClick={onClick}
    />
  );
}

// ─────────────────────────────────────────
// CardBack（未所持・未開封）
// ─────────────────────────────────────────
function CardBack({ w, h, onClick }: { w: number; h: number; onClick?: () => void }) {
  const r = Math.round(w * 0.052);
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', width: w, height: h,
        borderRadius: r, overflow: 'hidden',
        background: 'linear-gradient(160deg, #1c1410 0%, #0e0c0a 100%)',
        border: '2px solid #3a2e24',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
      }}
    >
      {/* Crosshatch pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(120,90,40,0.12) 0, rgba(120,90,40,0.12) 1px, transparent 1px, transparent 12px),
          repeating-linear-gradient(-45deg, rgba(120,90,40,0.10) 0, rgba(120,90,40,0.10) 1px, transparent 1px, transparent 12px)
        `,
      }} />
      {/* Center logo */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: w * 0.04,
      }}>
        <span style={{ fontSize: w * 0.24, opacity: 0.18, lineHeight: 1 }}>🍜</span>
        <span style={{
          fontSize: w * 0.09, fontWeight: 900, letterSpacing: '0.18em',
          color: 'rgba(200,160,80,0.25)',
        }}>NAGOTOSHA</span>
      </div>
      <EdgeHighlight r={r} />
    </div>
  );
}

// ─────────────────────────────────────────
// StandardCard（N / R / SR / SSR）
// ─────────────────────────────────────────
interface CardProps {
  card: Card; cfg: RarityConfig; w: number; h: number;
  isNew: boolean; subjectUrl?: string; onClick?: () => void;
}

function StandardCard({ card, cfg, w, h, isNew, subjectUrl, onClick }: CardProps) {
  const r   = Math.round(w * 0.052);      // outer border radius
  const fw  = cfg.frameWidth;             // frame border width

  // Derived layout measurements (all px)
  const artMargin = Math.round(w * 0.042);
  const artTop    = Math.round(h * 0.096);
  const artHeight = Math.round(h * 0.50);
  const artWidth  = w - artMargin * 2;
  const artR      = Math.round(w * 0.030);
  const infoTop   = artTop + artHeight + Math.round(h * 0.028);
  const infoLeft  = Math.round(w * 0.06);
  const infoRight = Math.round(w * 0.06);
  const footerTop = Math.round(h * 0.905);

  const isSSR = card.rarity === 'SSR';

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', width: w, height: h,
        borderRadius: r,
        border: `${fw}px solid transparent`,
        background: `${cfg.cardBg} padding-box, ${cfg.frameGradient} border-box`,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        boxShadow: `0 ${w * 0.04}px ${w * 0.14}px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)`,
      }}
    >
      {/* ── L2: Texture / sparkles ── */}
      {cfg.hasSparkles && <SparkleLayer w={w} h={h} cfg={cfg} />}

      {/* ── SSR: animated rainbow border ring ── */}
      {isSSR && (
        <div
          className="card-rainbow-animate"
          style={{
            position: 'absolute', inset: 0, zIndex: 40,
            borderRadius: r - fw + 1,
            border: `${fw}px solid transparent`,
            background: `transparent padding-box, ${cfg.frameGradient} border-box`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── L3: Art window (photo, overflow: hidden) ── */}
      <div style={{
        position: 'absolute',
        left: artMargin, right: artMargin,
        top: artTop, height: artHeight,
        borderRadius: artR,
        overflow: 'hidden',
        border: `1.5px solid ${cfg.artBorderColor}`,
        boxShadow: `inset 0 0 16px ${cfg.artGlowColor}`,
        zIndex: 2,
      }}>
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.06)' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)',
          }}>
            <span style={{ fontSize: artWidth * 0.28, opacity: 0.35 }}>🍜</span>
          </div>
        )}
        {/* Photo bottom fade into info zone */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '38%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.72) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── L4: Subject cutout layer ── */}
      {card.imageUrl && (
        <SubjectLayer
          imageUrl={subjectUrl ?? card.imageUrl}
          isRealCutout={!!subjectUrl}
          left={artMargin} artWidth={artWidth}
          top={artTop} height={artHeight}
          artR={artR} w={w} h={h}
        />
      )}

      {/* ── L5: Art window corner ornaments ── */}
      {cfg.cornerStyle !== 'none' && (
        <ArtCorners
          cfg={cfg}
          left={artMargin} top={artTop}
          artWidth={artWidth} artHeight={artHeight}
          w={w}
        />
      )}

      {/* ── Inner frame lines ── */}
      <div style={{
        position: 'absolute',
        inset: fw + Math.round(w * 0.022),
        border: `1px solid ${cfg.innerLineColor}`,
        borderRadius: r - fw - Math.round(w * 0.022) + 2,
        pointerEvents: 'none',
        zIndex: 3,
      }} />

      {/* ── L6: Header zone (rarity badge + series tag) ── */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.013),
        left: Math.round(w * 0.058),
        right: Math.round(w * 0.058),
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <RarityBadge cfg={cfg} w={w} />
        <span style={{
          fontSize: Math.max(7, Math.round(w * 0.030)),
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: cfg.innerLineColor,
          fontVariantNumeric: 'tabular-nums',
        }}>
          NAG
        </span>
      </div>

      {/* NEW badge */}
      {isNew && (
        <div style={{
          position: 'absolute',
          top: Math.round(h * 0.012), right: Math.round(w * 0.056),
          fontSize: Math.max(7, Math.round(w * 0.030)),
          fontWeight: 900, letterSpacing: '0.10em',
          color: '#fff',
          background: 'linear-gradient(135deg, #e63946, #c2112a)',
          borderRadius: w * 0.12,
          padding: `${Math.round(w * 0.012)}px ${Math.round(w * 0.032)}px`,
          zIndex: 12,
        }}>
          NEW
        </div>
      )}

      {/* ── L7: Info section ── */}
      <div style={{
        position: 'absolute',
        top: infoTop,
        left: infoLeft, right: infoRight,
        zIndex: 8,
      }}>
        {/* Divider */}
        <Divider cfg={cfg} w={w} />

        {/* Shop name */}
        <p style={{
          marginTop: Math.round(h * 0.018),
          fontSize: Math.max(8, Math.round(w * 0.034)),
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: cfg.artBorderColor,
          lineHeight: 1,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {card.shopName}
        </p>

        {/* Card name */}
        <CardName name={card.name} cfg={cfg} w={w} h={h} />

        {/* Area + price tags */}
        <div style={{
          display: 'flex', gap: Math.round(w * 0.022),
          marginTop: Math.round(h * 0.016), flexWrap: 'wrap',
        }}>
          <Tag label={card.area} cfg={cfg} w={w} />
          <Tag label={card.priceRange} cfg={cfg} w={w} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        position: 'absolute',
        top: footerTop, left: infoLeft, right: infoRight,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 8,
      }}>
        <span style={{
          fontSize: Math.max(6, Math.round(w * 0.026)),
          color: `${cfg.innerLineColor}`,
          letterSpacing: '0.08em', fontWeight: 700,
        }}>
          {card.area}
        </span>
        <span style={{
          fontSize: Math.max(6, Math.round(w * 0.026)),
          color: `${cfg.innerLineColor}`,
          letterSpacing: '0.08em', fontWeight: 700,
        }}>
          ©NAGOTOSHA
        </span>
      </div>

      {/* ── L8: Holographic overlay ── */}
      <HoloOverlay cfg={cfg} w={w} h={h} artTop={artTop} artHeight={artHeight} artMargin={artMargin} artR={artR} />

      {/* ── L9: Overall gloss varnish ── */}
      <GlossLayer w={w} h={h} r={r} />

      {/* ── Outer edge highlight ── */}
      <EdgeHighlight r={r - fw} />
    </div>
  );
}

// ─────────────────────────────────────────
// FullArtCard（UR）
// ─────────────────────────────────────────
function FullArtCard({ card, cfg, w, h, isNew, subjectUrl, onClick }: CardProps) {
  const r  = Math.round(w * 0.052);
  const fw = cfg.frameWidth;
  const infoH = Math.round(h * 0.30);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', width: w, height: h,
        borderRadius: r,
        border: `${fw}px solid transparent`,
        background: `${cfg.cardBg} padding-box, ${cfg.frameGradient} border-box`,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        boxShadow: `0 ${w * 0.05}px ${w * 0.18}px rgba(0,0,0,0.65)`,
      }}
    >
      {/* ── Full-bleed photo ── */}
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            transform: 'scale(1.04)',
          }}
        />
      )}

      {/* L4: Subject cutout (re-usable layer, future: swap with segmented PNG) */}
      {card.imageUrl && (
        <SubjectLayer
          imageUrl={subjectUrl ?? card.imageUrl}
          isRealCutout={!!subjectUrl}
          left={0} artWidth={w} top={0} height={Math.round(h * 0.72)}
          artR={0} w={w} h={h}
          forFullArt
        />
      )}

      {/* Top fade overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: Math.round(h * 0.22),
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)',
        zIndex: 3,
      }} />

      {/* ── Rainbow holographic film (L8) ── */}
      <div
        className="card-rainbow-animate"
        style={{
          position: 'absolute', inset: 0, zIndex: 4,
          mixBlendMode: 'color-dodge',
          opacity: 0.18,
          background: `linear-gradient(135deg, #ff4488 0%, transparent 30%, transparent 70%, #4488ff 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Animated rainbow border ring */}
      <div
        className="card-rainbow-animate"
        style={{
          position: 'absolute', inset: 0, zIndex: 40,
          borderRadius: r - fw + 1,
          border: `${fw}px solid transparent`,
          background: `transparent padding-box, ${cfg.frameGradient} border-box`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Header: rarity badge ── */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.014), left: Math.round(w * 0.058),
        zIndex: 12,
      }}>
        <RarityBadge cfg={cfg} w={w} />
      </div>
      {isNew && (
        <div style={{
          position: 'absolute',
          top: Math.round(h * 0.013), right: Math.round(w * 0.056),
          fontSize: Math.max(7, Math.round(w * 0.030)),
          fontWeight: 900, letterSpacing: '0.10em', color: '#fff',
          background: 'linear-gradient(135deg, #e63946, #c2112a)',
          borderRadius: w * 0.12,
          padding: `${Math.round(w * 0.012)}px ${Math.round(w * 0.032)}px`,
          zIndex: 12,
        }}>NEW</div>
      )}

      {/* ── Frosted glass info panel (L7) ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0, height: infoH,
        background: 'linear-gradient(to bottom, rgba(4,2,12,0) 0%, rgba(4,2,12,0.86) 28%, rgba(4,2,12,0.96) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 8,
        padding: `${Math.round(h * 0.04)}px ${Math.round(w * 0.07)}px ${Math.round(h * 0.04)}px`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        gap: Math.round(h * 0.012),
      }}>
        <p style={{
          fontSize: Math.max(8, Math.round(w * 0.034)),
          fontWeight: 700,
          color: 'rgba(255,180,220,0.85)',
          letterSpacing: '0.05em',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {card.shopName}
        </p>
        <CardName name={card.name} cfg={cfg} w={w} h={h} />
        <div style={{ display: 'flex', gap: Math.round(w * 0.022) }}>
          <Tag label={card.area} cfg={cfg} w={w} />
          <Tag label={card.priceRange} cfg={cfg} w={w} />
        </div>
      </div>

      {/* ── L9: Gloss ── */}
      <GlossLayer w={w} h={h} r={r} />
      <EdgeHighlight r={r - fw} />
    </div>
  );
}

// ─────────────────────────────────────────
// SubjectLayer（料理飛び出しレイヤー）
// ─────────────────────────────────────────
// L4: This layer can receive a real cutout PNG via imageUrl+isRealCutout=true in the future.
// Currently uses clip-path pseudo-cutout on the photo.
interface SubjectLayerProps {
  imageUrl: string;
  isRealCutout: boolean;
  left: number; artWidth: number;
  top: number; height: number;
  artR: number; w: number; h: number;
  forFullArt?: boolean;
}

function SubjectLayer({ imageUrl, isRealCutout, left, artWidth, top, height, artR, w, forFullArt }: SubjectLayerProps) {
  const protrude = Math.round(height * 0.08);  // how much it rises above art window top

  if (isRealCutout) {
    // ── Future real cutout path ──
    // imageUrl is a transparent PNG of just the food subject
    return (
      <img
        src={imageUrl}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          left: left + artWidth * 0.1,
          top: top - protrude,
          width: artWidth * 0.8,
          height: height + protrude,
          objectFit: 'contain',
          objectPosition: 'bottom center',
          filter: `drop-shadow(0 ${Math.round(w * 0.04)}px ${Math.round(w * 0.07)}px rgba(0,0,0,0.75))`,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    );
  }

  // ── Pseudo-cutout (clip-path ellipse, same image) ──
  // Creates illusion of food rising out of the art window
  const clipW = forFullArt ? '42%' : '44%';
  const clipH = forFullArt ? '48%' : '52%';
  const clipY = forFullArt ? '38%' : '35%';

  return (
    <div
      style={{
        position: 'absolute',
        left, right: left,
        width: artWidth,
        top: top - protrude,
        height: height + protrude,
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: height,
        clipPath: `ellipse(${clipW} ${clipH} at 50% ${clipY})`,
        filter: `drop-shadow(0 ${Math.round(w * 0.035)}px ${Math.round(w * 0.065)}px rgba(0,0,0,0.80))`,
        borderRadius: artR,
      }}>
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: `scale(1.18) translateY(-6%)`,
            transformOrigin: '50% 40%',
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ArtCorners（アートウィンドウのコーナー装飾）
// ─────────────────────────────────────────
interface ArtCornersProps {
  cfg: RarityConfig; left: number; top: number;
  artWidth: number; artHeight: number; w: number;
}

function ArtCorners({ cfg, left, top, artWidth, artHeight, w }: ArtCornersProps) {
  const size    = Math.round(w * 0.056);
  const offset  = -Math.round(w * 0.012);
  const color   = cfg.artBorderColor;
  const lw      = cfg.cornerStyle === 'star' ? 2 : 1.5;
  const dSize   = Math.round(w * 0.016);

  const corners = [
    { key: 'tl', x: left + offset, y: top + offset, bt: true,  br: false, bl: true,  bb: false },
    { key: 'tr', x: left + artWidth - size + Math.abs(offset), y: top + offset, bt: true,  br: true,  bl: false, bb: false },
    { key: 'bl', x: left + offset, y: top + artHeight - size + Math.abs(offset), bt: false, br: false, bl: true,  bb: true  },
    { key: 'br', x: left + artWidth - size + Math.abs(offset), y: top + artHeight - size + Math.abs(offset), bt: false, br: true,  bl: false, bb: true  },
  ];

  return (
    <>
      {corners.map(c => (
        <div
          key={c.key}
          style={{
            position: 'absolute',
            left: c.x, top: c.y,
            width: size, height: size,
            borderTop:    c.bt ? `${lw}px solid ${color}` : undefined,
            borderRight:  c.br ? `${lw}px solid ${color}` : undefined,
            borderBottom: c.bb ? `${lw}px solid ${color}` : undefined,
            borderLeft:   c.bl ? `${lw}px solid ${color}` : undefined,
            pointerEvents: 'none',
            zIndex: 6,
          }}
        >
          {/* Center diamond (ornate/star style) */}
          {(cfg.cornerStyle === 'ornate' || cfg.cornerStyle === 'star') && (
            <div style={{
              position: 'absolute',
              top: c.bt  ? -dSize / 2 - 0.5 : undefined,
              bottom: c.bb ? -dSize / 2 - 0.5 : undefined,
              left: c.bl  ? -dSize / 2 - 0.5 : undefined,
              right: c.br ? -dSize / 2 - 0.5 : undefined,
              width: dSize, height: dSize,
              background: cfg.artGlowColor || color,
              transform: 'rotate(45deg)',
              boxShadow: `0 0 ${dSize}px ${cfg.artGlowColor}`,
            }} />
          )}
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────
// HoloOverlay（ホログラム/シャインオーバーレイ）
// ─────────────────────────────────────────
interface HoloProps {
  cfg: RarityConfig; w: number; h: number;
  artTop: number; artHeight: number; artMargin: number; artR: number;
}

function HoloOverlay({ cfg, artTop, artHeight, artMargin, artR }: HoloProps) {
  if (cfg.holoType === 'none') return null;

  // Silver: subtle diagonal sweep on frame area
  if (cfg.holoType === 'silver') {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 15,
        background: `
          linear-gradient(115deg,
            transparent 20%,
            rgba(180,200,255,0.10) 40%,
            rgba(220,240,255,0.18) 50%,
            rgba(180,200,255,0.10) 60%,
            transparent 80%)
        `,
        backgroundSize: '200% 100%',
        animation: 'card-shimmer-sweep 4s ease-in-out infinite',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }} />
    );
  }

  // Gold: golden shimmer sweep
  if (cfg.holoType === 'gold') {
    return (
      <>
        {/* Shimmer line on art area */}
        <div style={{
          position: 'absolute',
          left: artMargin, right: artMargin,
          top: artTop, height: artHeight,
          borderRadius: artR,
          zIndex: 15,
          background: `linear-gradient(115deg, transparent 20%, rgba(255,220,100,0.14) 45%, rgba(255,240,150,0.22) 52%, rgba(255,220,100,0.14) 58%, transparent 80%)`,
          backgroundSize: '220% 100%',
          animation: 'card-shimmer-sweep 3.5s ease-in-out infinite',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }} />
        {/* Gold glow on frame inner area */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 16,
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(220,160,30,0.12) 0%, transparent 65%)`,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }} />
      </>
    );
  }

  // Rainbow: full rainbow sweep (SSR)
  if (cfg.holoType === 'rainbow') {
    return (
      <>
        <div
          className="card-holo-animate"
          style={{
            position: 'absolute',
            left: artMargin, right: artMargin,
            top: artTop, height: artHeight,
            borderRadius: artR,
            zIndex: 15,
            background: `linear-gradient(135deg,
              rgba(255,100,150,0) 0%,
              rgba(255,100,150,0.22) 18%,
              rgba(255,200,50,0.22) 36%,
              rgba(100,255,180,0.22) 54%,
              rgba(100,150,255,0.22) 72%,
              rgba(200,100,255,0.22) 90%,
              rgba(255,100,150,0) 100%)`,
            mixBlendMode: 'color-dodge',
            pointerEvents: 'none',
          }}
        />
        {/* Sweeping gloss on top */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 16,
          background: `linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0.10) 52%, transparent 75%)`,
          backgroundSize: '250% 100%',
          animation: 'card-shimmer-sweep 5s ease-in-out infinite',
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
        }} />
      </>
    );
  }

  return null;
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function RarityBadge({ cfg, w }: { cfg: RarityConfig; w: number }) {
  const fs = Math.max(7, Math.round(w * 0.031));
  const isSSR = cfg.shortLabel === 'SSR';
  const isUR  = cfg.shortLabel === 'UR';

  return (
    <div
      className={isSSR || isUR ? 'card-rainbow-animate' : undefined}
      style={{
        fontSize: fs,
        fontWeight: 900,
        letterSpacing: '0.14em',
        padding: `${Math.round(w * 0.012)}px ${Math.round(w * 0.032)}px`,
        borderRadius: w * 0.12,
        border: `1px solid ${cfg.borderColor}88`,
        background: isSSR || isUR
          ? `linear-gradient(90deg, rgba(80,0,40,0.88), rgba(0,30,80,0.88))`
          : `rgba(0,0,0,0.55)`,
        color: cfg.color,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: `0 0 ${Math.round(w * 0.05)}px ${cfg.glowColor}`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </div>
  );
}

function CardName({ name, cfg, w, h }: { name: string; cfg: RarityConfig; w: number; h: number }) {
  const fs = Math.max(12, Math.round(w * 0.080));

  const baseStyle: React.CSSProperties = {
    fontSize: fs,
    fontWeight: 900,
    lineHeight: 1.10,
    letterSpacing: '-0.01em',
    marginTop: Math.round(h * 0.008),
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  };

  if (cfg.nameStyle === 'silver') {
    return (
      <p style={{
        ...baseStyle,
        background: 'linear-gradient(175deg, #e0e8f8 0%, #ffffff 35%, #c0cce0 70%, #e8f0ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 1px 4px rgba(140,170,255,0.45))',
      }}>
        {name}
      </p>
    );
  }

  if (cfg.nameStyle === 'gold') {
    return (
      <p style={{
        ...baseStyle,
        background: 'linear-gradient(175deg, #f8e080 0%, #fcd040 25%, #f0b020 55%, #fce060 80%, #d09010 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 2px 6px rgba(220,150,20,0.60))',
      }}>
        {name}
      </p>
    );
  }

  if (cfg.nameStyle === 'rainbow') {
    return (
      <p
        className="card-ur-animate"
        style={{
          ...baseStyle,
          background: 'linear-gradient(90deg, #ff4488, #ff9900, #ffff00, #00ff88, #0088ff, #aa44ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 8px rgba(255,100,200,0.50))',
        }}
      >
        {name}
      </p>
    );
  }

  // plain (N)
  return (
    <p style={{
      ...baseStyle,
      color: '#ffffff',
      textShadow: '0 1px 4px rgba(0,0,0,0.65)',
    }}>
      {name}
    </p>
  );
}

function Tag({ label, cfg, w }: { label: string; cfg: RarityConfig; w: number }) {
  return (
    <span style={{
      fontSize: Math.max(7, Math.round(w * 0.028)),
      fontWeight: 700,
      letterSpacing: '0.05em',
      color: cfg.artBorderColor,
      border: `1px solid ${cfg.innerLineColor}`,
      borderRadius: w * 0.08,
      padding: `${Math.round(w * 0.010)}px ${Math.round(w * 0.024)}px`,
      background: 'rgba(0,0,0,0.25)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function Divider({ cfg, w }: { cfg: RarityConfig; w: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: Math.round(w * 0.018),
      marginBottom: Math.round(w * 0.010),
    }}>
      <div style={{ flex: 1, height: 1, background: cfg.innerLineColor }} />
      {/* Center mark */}
      <div style={{
        width: Math.round(w * 0.022),
        height: Math.round(w * 0.022),
        background: cfg.artBorderColor,
        transform: 'rotate(45deg)',
        flexShrink: 0,
        boxShadow: `0 0 ${Math.round(w * 0.028)}px ${cfg.artGlowColor}`,
      }} />
      <div style={{ flex: 1, height: 1, background: cfg.innerLineColor }} />
    </div>
  );
}

function SparkleLayer({ w, cfg }: { w: number; h: number; cfg: RarityConfig }) {
  const dots = [
    { x: '14%', y: '72%' }, { x: '82%', y: '16%' },
    { x: '28%', y: '28%' }, { x: '68%', y: '78%' },
    { x: '88%', y: '44%' }, { x: '8%',  y: '55%' },
    { x: '55%', y: '88%' }, { x: '38%', y: '14%' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: d.x, top: d.y,
          width: Math.round(w * 0.012),
          height: Math.round(w * 0.012),
          borderRadius: '50%',
          background: cfg.artBorderColor,
          opacity: 0.28 + (i % 3) * 0.08,
          filter: `blur(0.5px) drop-shadow(0 0 ${Math.round(w * 0.015)}px ${cfg.artGlowColor})`,
          transform: `scale(${0.7 + (i % 4) * 0.2})`,
        }} />
      ))}
    </div>
  );
}

function GlossLayer({ r }: { w: number; h: number; r: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: r,
      background: `
        linear-gradient(145deg,
          rgba(255,255,255,0.14) 0%,
          rgba(255,255,255,0.06) 20%,
          transparent 42%)
      `,
      pointerEvents: 'none',
      zIndex: 20,
    }} />
  );
}

function EdgeHighlight({ r }: { r: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: r,
      boxShadow: [
        'inset 0  1px 0 rgba(255,255,255,0.20)',
        'inset 0 -1px 0 rgba(0,0,0,0.40)',
        'inset  1px 0 rgba(255,255,255,0.10)',
        'inset -1px 0 rgba(0,0,0,0.25)',
      ].join(', '),
      pointerEvents: 'none',
      zIndex: 21,
    }} />
  );
}
