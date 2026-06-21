'use client';

/**
 * FullArtCard — NAGOTOSHAプレミアムカード
 *
 * レイヤー構成（下→上）:
 * L1  写真フルブリード
 * L2  奥行きビネット（エッジ暗化・下部グラデ）
 * L3  ヘッダーゾーン（ロゴ・UR表記・カード番号）
 * L4  カード名ゾーン（金箔タイトル・英字サブタイトル）
 * L5  下部情報パネル（フロストガラス）
 * L6  ホロフィルム（mix-blend-mode: color-dodge）
 * L7  外枠レインボーリング（アニメーション）
 * L8  内枠ゴールドライン
 * L9  グロスニス
 * L10 エッジハイライト
 */

import { Card } from '@/types/card';

interface Props {
  card: Card;
  widthPx: number;
  isNew?: boolean;
}

export default function FullArtCard({ card, widthPx: w, isNew }: Props) {
  const h  = Math.round(w * 1.42);
  const r  = Math.round(w * 0.052);      // outer border radius
  const fw = 4;                           // frame width px

  // --- Layout measurements ---
  const titleBottom   = Math.round(h * 0.345);  // title zone: bottom edge from card bottom
  const panelHeight   = Math.round(h * 0.295);  // frosted panel height
  const titleFontJP   = Math.round(w * 0.130);  // Japanese title font size
  const titleFontEN   = Math.round(w * 0.038);  // English subtitle
  const headerPad     = Math.round(w * 0.055);  // header horizontal padding
  const headerTop     = Math.round(h * 0.016);  // header top padding

  // rainbow gradient (used on frame and UR badge)
  const rainbowGrad = 'linear-gradient(135deg, #ff2266 0%, #ff6600 14%, #ffdd00 28%, #00ff88 43%, #0066ff 57%, #8800ff 71%, #ff2266 86%, #ff6600 100%)';

  return (
    <div
      style={{
        position: 'relative',
        width: w, height: h,
        borderRadius: r,
        border: `${fw}px solid transparent`,
        // gradient-border trick
        background: `rgba(0,0,0,0) padding-box, ${rainbowGrad} border-box`,
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: [
          `0 ${Math.round(w * 0.07)}px ${Math.round(w * 0.22)}px rgba(0,0,0,0.80)`,
          `0 ${Math.round(w * 0.02)}px ${Math.round(w * 0.06)}px rgba(0,0,0,0.55)`,
          `0 0 0 1px rgba(255,255,255,0.05)`,
        ].join(', '),
      }}
    >

      {/* ── L1: 写真フルブリード ── */}
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 22%',
            transform: 'scale(1.02)',  // 境界のジャギ隠し
          }}
        />
      )}

      {/* ── L2: 奥行きビネット ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: [
          // 外縁を暗くする（物理的な奥行き感）
          `radial-gradient(ellipse 96% 88% at 50% 35%, transparent 42%, rgba(0,0,0,0.60) 100%)`,
          // 上部グラデ（ヘッダー可読性）
          `linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.10) 18%, transparent 35%)`,
          // 下部グラデ（パネルへ自然につなぐ）
          `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 22%, transparent 48%)`,
        ].join(', '),
        pointerEvents: 'none',
      }} />

      {/* ── L3: ヘッダーゾーン ── */}
      <div style={{
        position: 'absolute',
        top: headerTop,
        left: headerPad, right: headerPad,
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        zIndex: 10,
      }}>
        {/* 左：NAGOTOSHAロゴ */}
        <LogoMark w={w} />

        {/* 右：URバッジ + カード番号 */}
        <div style={{ textAlign: 'right' }}>
          <URBadge w={w} rainbowGrad={rainbowGrad} />
          <p style={{
            fontSize: Math.max(7, Math.round(w * 0.028)),
            fontWeight: 700,
            color: 'rgba(220,160,40,0.60)',
            letterSpacing: '0.16em',
            marginTop: Math.round(w * 0.012),
          }}>
            NGY-010
          </p>
        </div>
      </div>

      {/* ── L4: カード名ゾーン ── */}
      <div style={{
        position: 'absolute',
        bottom: titleBottom,
        left: 0, right: 0,
        textAlign: 'center',
        zIndex: 10,
        padding: `${Math.round(h * 0.018)}px ${Math.round(w * 0.06)}px ${Math.round(h * 0.022)}px`,
      }}>
        {/* 装飾ライン（上） */}
        <TitleDivider w={w} />

        {/* 日本語タイトル — 金箔加工 */}
        <p style={{
          fontSize: titleFontJP,
          fontWeight: 900,
          letterSpacing: '0.08em',
          lineHeight: 1.1,
          margin: `${Math.round(h * 0.010)}px 0 ${Math.round(h * 0.006)}px`,
          // 金箔グラデ
          background: 'linear-gradient(180deg, #fff8c0 0%, #fce080 18%, #f8c030 42%, #d08010 62%, #f8c030 80%, #fce080 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          // 白フチ
          WebkitTextStroke: `${Math.max(1, Math.round(w * 0.004))}px rgba(255,240,160,0.50)`,
          // 発光 + 奥行き影
          filter: `drop-shadow(0 0 ${Math.round(w * 0.04)}px rgba(255,190,30,0.70)) drop-shadow(0 3px 8px rgba(0,0,0,0.95))`,
          userSelect: 'none',
        }}>
          {card.name}
        </p>

        {/* 英字サブタイトル */}
        <p style={{
          fontSize: titleFontEN,
          fontWeight: 700,
          letterSpacing: '0.28em',
          color: 'rgba(230,195,100,0.78)',
          textShadow: '0 1px 6px rgba(0,0,0,0.90)',
          marginBottom: Math.round(h * 0.008),
          fontStyle: 'italic',
          userSelect: 'none',
        }}>
          HITSUMABUSHI
        </p>

        {/* 装飾ライン（下） */}
        <TitleDivider w={w} />
      </div>

      {/* ── L5: 下部情報パネル ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: panelHeight,
        background: 'linear-gradient(to bottom, rgba(4,2,10,0) 0%, rgba(4,2,10,0.80) 20%, rgba(4,2,10,0.95) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderTop: '1px solid rgba(220,160,40,0.20)',
        zIndex: 9,
        padding: `${Math.round(h * 0.038)}px ${Math.round(w * 0.07)}px ${Math.round(h * 0.032)}px`,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* コメント */}
        <p style={{
          fontSize: Math.max(9, Math.round(w * 0.034)),
          color: 'rgba(215,195,160,0.75)',
          lineHeight: 1.55,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {card.tosharComment}
        </p>

        {/* 店名・エリア行 */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginTop: Math.round(h * 0.014),
        }}>
          <div>
            <p style={{
              fontSize: Math.max(11, Math.round(w * 0.042)),
              fontWeight: 900,
              color: 'rgba(255,230,180,0.92)',
              letterSpacing: '0.04em',
            }}>
              {card.shopName}
            </p>
            <p style={{
              fontSize: Math.max(8, Math.round(w * 0.030)),
              color: 'rgba(180,155,115,0.70)',
              letterSpacing: '0.10em',
              marginTop: 2,
            }}>
              {card.area} · NAGOYA
            </p>
          </div>
          {/* 右：スコア風演出 */}
          <FlavorScore w={w} />
        </div>

        {/* フッター行 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: Math.round(h * 0.018),
          borderTop: '1px solid rgba(220,160,40,0.12)',
          paddingTop: Math.round(h * 0.012),
        }}>
          <span style={{
            fontSize: Math.max(7, Math.round(w * 0.026)),
            color: 'rgba(160,135,90,0.55)',
            letterSpacing: '0.10em',
          }}>
            ©NAGOTOSHA 2025
          </span>
          <span style={{
            fontSize: Math.max(7, Math.round(w * 0.026)),
            color: 'rgba(220,160,40,0.50)',
            letterSpacing: '0.12em',
            fontWeight: 700,
          }}>
            UR · NGY-010
          </span>
        </div>
      </div>

      {/* NEW badge */}
      {isNew && (
        <div style={{
          position: 'absolute',
          top: headerTop, left: headerPad,
          fontSize: Math.max(7, Math.round(w * 0.030)),
          fontWeight: 900, letterSpacing: '0.10em', color: '#fff',
          background: 'linear-gradient(135deg, #e63946, #c2112a)',
          borderRadius: w * 0.12,
          padding: `${Math.round(w * 0.012)}px ${Math.round(w * 0.032)}px`,
          zIndex: 20,
        }}>NEW</div>
      )}

      {/* ── L6: ホログラムフィルム ── */}
      <div
        className="card-rainbow-animate"
        style={{
          position: 'absolute', inset: 0, zIndex: 15,
          mixBlendMode: 'color-dodge',
          opacity: 0.10,
          background: [
            `linear-gradient(135deg, rgba(255,60,120,0.85) 0%, transparent 35%, transparent 65%, rgba(60,120,255,0.85) 100%)`,
          ].join(', '),
          pointerEvents: 'none',
        }}
      />

      {/* ── L7: 外枠レインボーリング（アニメーション） ── */}
      <div
        className="card-rainbow-animate"
        style={{
          position: 'absolute', inset: 0, zIndex: 30,
          borderRadius: r - fw + 1,
          border: `${fw + 1}px solid transparent`,
          background: `transparent padding-box, ${rainbowGrad} border-box`,
          pointerEvents: 'none',
        }}
      />

      {/* ── L8: 内枠ゴールドライン ── */}
      <div style={{
        position: 'absolute',
        inset: fw + Math.round(w * 0.020),
        borderRadius: r - fw - Math.round(w * 0.018),
        border: '1px solid rgba(220,160,40,0.35)',
        pointerEvents: 'none',
        zIndex: 31,
      }} />

      {/* ── L9: グロスニス ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r,
        background: 'linear-gradient(145deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 22%, transparent 46%)',
        pointerEvents: 'none',
        zIndex: 32,
      }} />

      {/* ── L10: エッジハイライト ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r,
        boxShadow: [
          'inset 0  1px 0 rgba(255,255,255,0.18)',
          'inset 0 -1px 0 rgba(0,0,0,0.50)',
          'inset  1px 0 rgba(255,255,255,0.08)',
          'inset -1px 0 rgba(0,0,0,0.28)',
        ].join(', '),
        pointerEvents: 'none',
        zIndex: 33,
      }} />
    </div>
  );
}

// ── サブコンポーネント ──

function LogoMark({ w }: { w: number }) {
  const circleSize = Math.round(w * 0.072);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(w * 0.022) }}>
      <div style={{
        width: circleSize, height: circleSize,
        borderRadius: '50%',
        border: `1.5px solid rgba(220,165,40,0.60)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: Math.round(circleSize * 0.52),
          color: 'rgba(220,165,40,0.88)',
          fontWeight: 900,
          lineHeight: 1,
          userSelect: 'none',
        }}>名</span>
      </div>
      <span style={{
        fontSize: Math.max(7, Math.round(w * 0.028)),
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: 'rgba(220,165,40,0.60)',
        textShadow: '0 1px 4px rgba(0,0,0,0.80)',
        userSelect: 'none',
      }}>
        NAGOTOSHA
      </span>
    </div>
  );
}

function URBadge({ w, rainbowGrad }: { w: number; rainbowGrad: string }) {
  const fs = Math.max(8, Math.round(w * 0.034));
  return (
    <div style={{ textAlign: 'right' }}>
      <span
        className="card-rainbow-animate"
        style={{
          display: 'inline-block',
          fontSize: fs,
          fontWeight: 900,
          letterSpacing: '0.16em',
          background: rainbowGrad,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 6px rgba(255,100,200,0.60))',
          userSelect: 'none',
        }}
      >
        UR
      </span>
      <p style={{
        fontSize: Math.max(6, Math.round(w * 0.026)),
        fontWeight: 700,
        letterSpacing: '0.14em',
        color: 'rgba(200,160,255,0.55)',
        textShadow: '0 1px 4px rgba(0,0,0,0.80)',
        marginTop: 1,
      }}>
        ULTRA RARE
      </p>
    </div>
  );
}

function TitleDivider({ w }: { w: number }) {
  const dSize = Math.round(w * 0.020);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: Math.round(w * 0.024),
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(220,165,40,0.55))' }} />
      <div style={{
        width: dSize, height: dSize,
        background: 'rgba(220,165,40,0.75)',
        transform: 'rotate(45deg)',
        flexShrink: 0,
        boxShadow: `0 0 ${dSize * 2}px rgba(255,180,30,0.60)`,
      }} />
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(220,165,40,0.55))' }} />
    </div>
  );
}

function FlavorScore({ w }: { w: number }) {
  const bars = [5, 5, 4, 5];  // 旨み・香り・見た目・希少度
  const labels = ['旨', '香', '映', '希'];
  const fs = Math.max(7, Math.round(w * 0.025));

  return (
    <div style={{
      display: 'flex', gap: Math.round(w * 0.018), alignItems: 'flex-end',
    }}>
      {bars.map((v, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{
            width: Math.round(w * 0.032),
            height: Math.round(w * 0.12),
            background: 'rgba(220,160,40,0.15)',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}>
            <div style={{
              width: '100%',
              height: `${(v / 5) * 100}%`,
              background: 'linear-gradient(to top, rgba(220,140,20,0.90), rgba(255,210,60,0.90))',
            }} />
          </div>
          <span style={{ fontSize: fs, color: 'rgba(180,145,80,0.65)', fontWeight: 700 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
