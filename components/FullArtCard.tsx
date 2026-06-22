'use client';

import { Card } from '@/types/card';

interface Props {
  card: Card;
  widthPx: number;
  isNew?: boolean;
}

// カード名 → ローマ字サブタイトル
const EN_NAME: Record<string, string> = {
  'ひつまぶし': 'HITSUMABUSHI',
  '小倉トースト': 'OGURA TOAST',
  'スガキヤラーメン': 'SUGAKIYA RAMEN',
  '矢場とんの味噌カツ': 'MISO KATSU',
  '世界の山ちゃんの手羽先': 'TEBASAKI',
  'ヨコイのあんかけスパ': 'ANKAKE SPA',
  '味仙の台湾ラーメン': 'TAIWAN RAMEN',
  'あつた蓬莱軒のひつまぶし': 'HITSUMABUSHI',
  'コメダ珈琲店のシロノワール': 'SHIRO NOIR',
  '千寿の天むす': 'TENMUSU',
};

const UR_SCORE = 96;

const RAINBOW = `linear-gradient(105deg,
  hsl(0,100%,65%) 0%,
  hsl(48,100%,65%) 14%,
  hsl(96,100%,65%) 28%,
  hsl(152,100%,65%) 42%,
  hsl(200,100%,65%) 57%,
  hsl(252,100%,65%) 71%,
  hsl(300,100%,65%) 85%,
  hsl(0,100%,65%) 100%)`;

const GOLD =
  'linear-gradient(180deg,#fff8d2 0%,#fce068 14%,#f8a828 40%,#b86008 60%,#f8a828 78%,#fce068 100%)';

export default function FullArtCard({ card, widthPx: w, isNew }: Props) {
  const h  = Math.round(w * 1.42);
  const r  = Math.round(w * 0.052);
  const fw = 5;

  const px      = Math.round(w * 0.058);
  const titleJP = Math.round(w * 0.150);
  const titleEN = Math.round(w * 0.036);
  const textSm  = Math.round(w * 0.030);
  const textXs  = Math.round(w * 0.024);
  const starSz  = Math.round(w * 0.030);

  const enName = EN_NAME[card.name] ?? '';

  return (
    <div
      style={{
        position: 'relative',
        width: w, height: h,
        borderRadius: r,
        overflow: 'hidden',
        flexShrink: 0,
        background: '#04020d',
        boxShadow: [
          `0 ${Math.round(w * 0.07)}px ${Math.round(w * 0.25)}px rgba(0,0,0,0.92)`,
          `0 0 ${Math.round(w * 0.06)}px rgba(220,160,40,0.22)`,
          `0 0 ${Math.round(w * 0.14)}px rgba(180,80,220,0.12)`,
        ].join(', '),
      }}
    >
      {/* ── L1: 料理写真 (フルブリード) ── */}
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 22%',
          }}
        />
      )}

      {/* ── L2: 上部暗幕 (タイトルゾーン) ── */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: Math.round(h * 0.46),
        background: `linear-gradient(to bottom,
          rgba(3,1,10,0.97) 0%,
          rgba(3,1,10,0.90) 36%,
          rgba(3,1,10,0.64) 60%,
          rgba(3,1,10,0.18) 80%,
          transparent 100%)`,
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* ── L3: 下部暗幕 (情報ゾーン) ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: Math.round(h * 0.36),
        background: `linear-gradient(to top,
          rgba(3,1,10,0.97) 0%,
          rgba(3,1,10,0.84) 42%,
          rgba(3,1,10,0.50) 68%,
          transparent 100%)`,
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* ── L4: 和柄ドット (上部ゾーンに重ねる) ── */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: Math.round(h * 0.46),
        zIndex: 3,
        pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(circle, rgba(180,130,30,0.11) ${Math.round(w * 0.046)}px, transparent ${Math.round(w * 0.046)}px),
          radial-gradient(circle, rgba(160,90,210,0.07) ${Math.round(w * 0.026)}px, transparent ${Math.round(w * 0.026)}px)
        `,
        backgroundSize: `${Math.round(w * 0.11)}px ${Math.round(w * 0.11)}px, ${Math.round(w * 0.062)}px ${Math.round(w * 0.062)}px`,
        backgroundPosition: '0 0, 55% 55%',
        mixBlendMode: 'screen',
      }} />

      {/* ── L5: 虹ホロフィルム (全面、控えめ) ── */}
      <div
        className="card-ur-animate"
        style={{
          position: 'absolute', inset: 0,
          zIndex: 4,
          mixBlendMode: 'color-dodge',
          opacity: 0.10,
          background: RAINBOW,
          pointerEvents: 'none',
        }}
      />

      {/* ── L6: ヘッダー (URバッジ + 名古屋ダイヤ) ── */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.024),
        left: px, right: px,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 12,
      }}>
        {/* UR バッジ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(h * 0.003) }}>
          <div style={{
            fontSize: Math.round(w * 0.088),
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            background: RAINBOW,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: [
              `drop-shadow(0 0 ${Math.round(w * 0.030)}px rgba(220,80,255,0.85))`,
              `drop-shadow(0 0 ${Math.round(w * 0.014)}px rgba(255,120,40,0.70))`,
            ].join(' '),
          }}>UR</div>

          <div style={{
            fontSize: Math.round(w * 0.026),
            fontWeight: 800,
            letterSpacing: '0.16em',
            color: 'rgba(255,210,110,0.92)',
            textShadow: `0 0 ${Math.round(w * 0.02)}px rgba(255,180,30,0.60), 0 1px 4px rgba(0,0,0,0.95)`,
            lineHeight: 1,
          }}>ULTRA RARE</div>

          <div style={{ display: 'flex', gap: Math.round(w * 0.012), marginTop: Math.round(h * 0.004) }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={starSz} />
            ))}
          </div>
        </div>

        {/* 名古屋ダイヤバッジ */}
        <div style={{ position: 'relative', width: Math.round(w * 0.145), height: Math.round(w * 0.145), flexShrink: 0, marginTop: Math.round(h * 0.004) }}>
          <div style={{
            position: 'absolute', inset: 0,
            transform: 'rotate(45deg)',
            border: '1.5px solid rgba(200,155,35,0.65)',
            background: 'rgba(3,1,12,0.80)',
            boxShadow: `0 0 ${Math.round(w * 0.03)}px rgba(200,155,35,0.28)`,
          }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: Math.round(w * 0.026), color: 'rgba(255,210,110,0.95)', fontWeight: 900, lineHeight: 1, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>名古屋</div>
            <div style={{ fontSize: Math.round(w * 0.018), color: 'rgba(255,200,90,0.60)', fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1, marginTop: 2 }}>NAGOYA</div>
          </div>
        </div>
      </div>

      {/* ── L7: タイトルゾーン ── */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.202),
        left: px, right: px,
        zIndex: 12,
      }}>
        <Divider />

        {/* 料理名 (金箔風) */}
        <div style={{
          marginTop: Math.round(h * 0.008),
          fontSize: titleJP,
          fontWeight: 900,
          lineHeight: 1.0,
          letterSpacing: '0.05em',
          background: GOLD,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          WebkitTextStroke: `${Math.max(1, Math.round(w * 0.005))}px rgba(255,245,180,0.50)`,
          filter: [
            `drop-shadow(0 0 ${Math.round(w * 0.055)}px rgba(255,155,15,1.0))`,
            `drop-shadow(0 0 ${Math.round(w * 0.026)}px rgba(255,200,30,0.80))`,
            `drop-shadow(0 ${Math.round(h * 0.007)}px ${Math.round(w * 0.022)}px rgba(0,0,0,1.0))`,
            `drop-shadow(0 2px 6px rgba(0,0,0,0.95))`,
          ].join(' '),
        }}>
          {card.name}
        </div>

        {enName && (
          <div style={{
            marginTop: Math.round(h * 0.004),
            fontSize: titleEN,
            fontWeight: 700,
            letterSpacing: '0.32em',
            color: 'rgba(255,220,130,0.70)',
            textShadow: `0 1px 6px rgba(0,0,0,0.95), 0 0 ${Math.round(w * 0.04)}px rgba(200,140,20,0.35)`,
          }}>{enName}</div>
        )}

        {/* 名古屋名物ピル */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: Math.round(w * 0.016),
          marginTop: Math.round(h * 0.010),
          padding: `${Math.round(h * 0.007)}px ${Math.round(w * 0.040)}px`,
          border: '1px solid rgba(200,155,35,0.48)',
          borderRadius: 100,
          background: 'rgba(3,1,12,0.52)',
        }}>
          <span style={{
            width: Math.round(w * 0.014), height: Math.round(w * 0.014),
            borderRadius: '50%',
            background: 'rgba(255,185,40,0.85)',
            flexShrink: 0,
            display: 'inline-block',
            boxShadow: `0 0 ${Math.round(w * 0.012)}px rgba(255,185,40,0.65)`,
          }} />
          <span style={{ fontSize: textXs, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,210,110,0.92)' }}>名古屋名物</span>
        </div>

        <Divider style={{ marginTop: Math.round(h * 0.012) }} />
      </div>

      {/* ── L8: 下部情報 (パネルなし、グラデ上に直接テキスト) ── */}
      <div style={{
        position: 'absolute',
        bottom: Math.round(h * 0.026),
        left: px, right: px,
        zIndex: 12,
      }}>
        {/* コメント */}
        <p style={{
          fontSize: textXs,
          lineHeight: 1.58,
          color: 'rgba(230,215,185,0.80)',
          textShadow: '0 1px 5px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.8)',
          letterSpacing: '0.03em',
          marginBottom: Math.round(h * 0.012),
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {card.tosharComment?.slice(0, 48)}
        </p>

        <Divider />

        {/* 店名 + エリア + スコア */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: Math.round(w * 0.02), marginTop: Math.round(h * 0.012) }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: textSm,
              fontWeight: 800,
              color: 'rgba(255,232,190,0.96)',
              textShadow: '0 1px 5px rgba(0,0,0,0.95)',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{card.shopName}</div>
            <div style={{
              fontSize: textXs,
              color: 'rgba(200,170,110,0.68)',
              fontWeight: 600, letterSpacing: '0.10em', marginTop: 2,
            }}>{card.area} · NAGOYA</div>
          </div>

          {/* スコアサークル */}
          <div style={{
            width: Math.round(w * 0.130), height: Math.round(w * 0.130),
            borderRadius: '50%',
            border: '1.5px solid rgba(200,155,35,0.50)',
            background: 'rgba(3,1,12,0.72)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 ${Math.round(w * 0.025)}px rgba(200,150,30,0.28)`,
          }}>
            <div style={{
              fontSize: Math.round(w * 0.040),
              fontWeight: 900, lineHeight: 1,
              background: 'linear-gradient(180deg,#fce068,#f8a828)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 ${Math.round(w * 0.012)}px rgba(255,170,20,0.70))`,
            }}>{UR_SCORE}</div>
            <div style={{ fontSize: Math.round(w * 0.018), color: 'rgba(200,155,35,0.60)', fontWeight: 700, letterSpacing: '0.04em' }}>SCORE</div>
          </div>
        </div>

        {/* フッター */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: Math.round(h * 0.012),
          paddingTop: Math.round(h * 0.008),
          borderTop: '1px solid rgba(200,155,35,0.18)',
        }}>
          <span style={{ fontSize: textXs, color: 'rgba(180,140,55,0.50)', fontWeight: 700, letterSpacing: '0.10em' }}>©NAGOTOSHA 2025</span>
          {isNew && (
            <span style={{ fontSize: textXs, fontWeight: 900, letterSpacing: '0.14em', color: '#fff', background: 'linear-gradient(135deg,#e63946,#c2112a)', borderRadius: 100, padding: `2px ${Math.round(w * 0.026)}px` }}>NEW</span>
          )}
          <span style={{ fontSize: textXs, color: 'rgba(180,140,55,0.50)', fontWeight: 700, letterSpacing: '0.10em' }}>UR · NGY-010</span>
        </div>
      </div>

      {/* ── L9: 虹ホロ外枠 ── */}
      <div
        className="card-rainbow-animate"
        style={{
          position: 'absolute', inset: 0,
          borderRadius: r,
          border: `${fw}px solid transparent`,
          background: `transparent padding-box, ${RAINBOW} border-box`,
          zIndex: 60,
          pointerEvents: 'none',
          boxShadow: `inset 0 0 ${Math.round(w * 0.04)}px rgba(220,80,255,0.12)`,
        }}
      />

      {/* ── L10: 内側ゴールドライン ── */}
      <div style={{
        position: 'absolute',
        inset: fw + Math.round(w * 0.016),
        borderRadius: r - fw - Math.round(w * 0.016) + 2,
        border: '1px solid rgba(200,155,35,0.28)',
        pointerEvents: 'none',
        zIndex: 61,
      }} />

      {/* ── L11: グロスバーニッシュ ── */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: r,
        background: `linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 25%, transparent 55%)`,
        pointerEvents: 'none',
        zIndex: 62,
      }} />
    </div>
  );
}

// ─── 星 ─────────────────────────────────────────────────────────
function Star({ size }: { size: number }) {
  return (
    <div
      className="card-rainbow-animate"
      style={{
        width: size, height: size, flexShrink: 0,
        background: 'linear-gradient(135deg, hsl(50,100%,65%), hsl(200,100%,65%))',
        clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
        filter: `drop-shadow(0 0 ${Math.round(size * 0.5)}px rgba(255,200,50,0.70))`,
      }}
    />
  );
}

// ─── ゴールド区切り線 ────────────────────────────────────────────
function Divider({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      height: 1,
      background: 'linear-gradient(to right, transparent, rgba(200,155,35,0.55), rgba(200,155,35,0.55), transparent)',
      ...style,
    }} />
  );
}
