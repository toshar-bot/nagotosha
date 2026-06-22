'use client';

import { Card } from '@/types/card';

interface Props {
  card: Card;
  widthPx: number;
  isNew?: boolean;
}

const EN_NAME: Record<string, string> = {
  'ひつまぶし'            : 'HITSUMABUSHI',
  '小倉トースト'          : 'OGURA TOAST',
  'スガキヤラーメン'      : 'SUGAKIYA RAMEN',
  '矢場とんの味噌カツ'    : 'MISO KATSU',
  '世界の山ちゃんの手羽先': 'TEBASAKI',
  'ヨコイのあんかけスパ'  : 'ANKAKE SPA',
  '味仙の台湾ラーメン'    : 'TAIWAN RAMEN',
  'あつた蓬莱軒のひつまぶし': 'HITSUMABUSHI',
  'コメダ珈琲店のシロノワール': 'SHIRO NOIR',
  '千寿の天むす'          : 'TENMUSU',
};

/* ── カードフォント (Shippori Mincho B1 / 游明朝 fallback) ── */
const CARD_FONT = "'Shippori Mincho B1','Yu Mincho','YuMincho','游明朝','Hiragino Mincho ProN',serif";

/* ── 定数グラデーション ── */
const RAINBOW = `linear-gradient(105deg,
  hsl(0,100%,65%)   0%,
  hsl(48,100%,65%)  14%,
  hsl(96,100%,65%)  28%,
  hsl(152,100%,65%) 42%,
  hsl(200,100%,65%) 57%,
  hsl(252,100%,65%) 71%,
  hsl(300,100%,65%) 85%,
  hsl(0,100%,65%)   100%)`;

/* ── SVG 金箔グラデーション stops ── */
const GOLD_STOPS = [
  { offset: '0%',   color: '#fff8d2' },
  { offset: '12%',  color: '#fce068' },
  { offset: '36%',  color: '#f8a828' },
  { offset: '56%',  color: '#a05008' },
  { offset: '76%',  color: '#f8a828' },
  { offset: '100%', color: '#fce068' },
];

/* ─────────────────────────────────────────────────────────────
   FullArtCard（UR）
───────────────────────────────────────────────────────────── */
export default function FullArtCard({ card, widthPx: w, isNew }: Props) {
  const h  = Math.round(w * 1.42);
  const r  = Math.round(w * 0.052);
  const fw = 5;

  const px     = Math.round(w * 0.058);
  const textSm = Math.round(w * 0.030);
  const textXs = Math.round(w * 0.024);

  const enName = EN_NAME[card.name] ?? '';

  return (
    <div style={{
      position: 'relative',
      width: w, height: h,
      borderRadius: r,
      overflow: 'hidden',
      flexShrink: 0,
      background: '#04020d',
      boxShadow: [
        `0 ${Math.round(w*0.07)}px ${Math.round(w*0.26)}px rgba(0,0,0,0.93)`,
        `0 0 ${Math.round(w*0.06)}px rgba(220,160,40,0.22)`,
        `0 0 ${Math.round(w*0.16)}px rgba(180,60,240,0.14)`,
      ].join(', '),
    }}>

      {/* ━━ L1: 料理写真フルブリード ━━ */}
      {card.imageUrl && (
        <img src={card.imageUrl} alt={card.name} style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 22%',
        }} />
      )}

      {/* ━━ L2: 上部暗幕（タイトルゾーン） ━━ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: Math.round(h * 0.46),
        background: `linear-gradient(to bottom,
          rgba(3,1,10,0.97) 0%,
          rgba(3,1,10,0.90) 34%,
          rgba(3,1,10,0.64) 58%,
          rgba(3,1,10,0.18) 78%,
          transparent 100%)`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ━━ L3: 下部暗幕（情報ゾーン） ━━ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: Math.round(h * 0.36),
        background: `linear-gradient(to top,
          rgba(3,1,10,0.97) 0%,
          rgba(3,1,10,0.84) 40%,
          rgba(3,1,10,0.50) 66%,
          transparent 100%)`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ━━ L4: 和柄ドット（上部ゾーン） ━━ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: Math.round(h * 0.46),
        zIndex: 3, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(circle, rgba(180,130,30,0.11) ${Math.round(w*0.044)}px, transparent ${Math.round(w*0.044)}px),
          radial-gradient(circle, rgba(150,80,220,0.07) ${Math.round(w*0.024)}px, transparent ${Math.round(w*0.024)}px)
        `,
        backgroundSize: `${Math.round(w*0.11)}px ${Math.round(w*0.11)}px, ${Math.round(w*0.06)}px ${Math.round(w*0.06)}px`,
        backgroundPosition: '0 0, 55% 55%',
        mixBlendMode: 'screen',
      }} />

      {/* ━━ L5: 虹ホロフィルム（全面、color-dodge、控えめ） ━━ */}
      <div className="card-ur-animate" style={{
        position: 'absolute', inset: 0,
        zIndex: 4, mixBlendMode: 'color-dodge', opacity: 0.10,
        background: RAINBOW, pointerEvents: 'none',
      }} />

      {/* ━━ L6: ヘッダー（URバッジ + 名古屋ダイヤ） ━━ */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.024), left: px, right: px,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        zIndex: 12,
      }}>
        <UrBadge w={w} h={h} />
        <NagoyaDiamond w={w} />
      </div>

      {/* ━━ L7: タイトルゾーン（SVG金箔文字） ━━ */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.200), left: px, right: px,
        zIndex: 12,
      }}>
        <GoldLine />

        {/* SVG 金箔タイトル */}
        <div style={{ marginTop: Math.round(h * 0.008) }}>
          <SvgGoldTitle name={card.name} w={w - px * 2} h={Math.round(w * 0.20)} />
        </div>

        {/* EN サブタイトル */}
        {enName && (
          <SvgEnSubtitle text={enName} w={w - px * 2} h={Math.round(w * 0.055)} />
        )}

        {/* 名古屋名物ピル */}
        <OriginPill w={w} h={h} />

        <GoldLine style={{ marginTop: Math.round(h * 0.012) }} />
      </div>

      {/* ━━ L8: 下部情報 ━━ */}
      <BottomInfo card={card} w={w} h={h} px={px} textSm={textSm} textXs={textXs} isNew={isNew} />

      {/* ━━ L9: 虹ホロ外枠 ━━ */}
      <div className="card-rainbow-animate" style={{
        position: 'absolute', inset: 0,
        borderRadius: r,
        border: `${fw}px solid transparent`,
        background: `transparent padding-box, ${RAINBOW} border-box`,
        zIndex: 60, pointerEvents: 'none',
        boxShadow: `inset 0 0 ${Math.round(w*0.04)}px rgba(220,80,255,0.14)`,
      }} />

      {/* ━━ L10: 内側ゴールドライン ━━ */}
      <div style={{
        position: 'absolute',
        inset: fw + Math.round(w * 0.016),
        borderRadius: r - fw - Math.round(w * 0.016) + 2,
        border: '1px solid rgba(200,155,35,0.28)',
        zIndex: 61, pointerEvents: 'none',
      }} />

      {/* ━━ L11: グロスバーニッシュ ━━ */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r,
        background: `linear-gradient(135deg,
          rgba(255,255,255,0.10) 0%,
          rgba(255,255,255,0.04) 25%,
          transparent 55%)`,
        zIndex: 62, pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SVG 金箔タイトル文字
   3レイヤー構造：
     1. 黒太ストローク（影・輪郭）
     2. 金箔グラデーション fill + glow フィルタ
     3. 明るい薄ストローク（内側ハイライト）
───────────────────────────────────────────────────────────── */
function SvgGoldTitle({ name, w, h }: { name: string; w: number; h: number }) {
  const fontSize = Math.round(w * 0.355);  // コンテナ幅基準
  const baseline = Math.round(fontSize * 0.88);

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        {/* 金箔グラデーション（縦方向） */}
        <linearGradient id="svgGold" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          {GOLD_STOPS.map(s => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>

        {/* テキストのグロー + ドロップシャドウ フィルタ */}
        <filter id="titleFx" x="-22%" y="-22%" width="144%" height="144%">
          {/* 広いオレンジグロー */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={Math.round(w * 0.038)} result="gBlur"/>
          <feFlood floodColor="#ff9010" floodOpacity="0.88" result="gColor"/>
          <feComposite in="gColor" in2="gBlur" operator="in" result="glow"/>

          {/* 輝点（コアグロー） */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={Math.round(w * 0.014)} result="cBlur"/>
          <feFlood floodColor="#ffe040" floodOpacity="0.72" result="cColor"/>
          <feComposite in="cColor" in2="cBlur" operator="in" result="core"/>

          {/* 下方向ドロップシャドウ */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={Math.round(w * 0.016)} result="sBlur"/>
          <feOffset dx="0" dy={Math.round(w * 0.016)} in="sBlur" result="sOff"/>
          <feFlood floodColor="#000000" floodOpacity="0.96" result="sColor"/>
          <feComposite in="sColor" in2="sOff" operator="in" result="shadow"/>

          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="core"/>
            <feMergeNode in="shadow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Layer A: 黒太ストローク（影・輪郭） */}
      <text
        x="0" y={baseline}
        fontSize={fontSize}
        fontWeight="800"
        fontFamily={CARD_FONT}
        letterSpacing={Math.round(w * 0.012)}
        fill="none"
        stroke="rgba(0,0,0,0.94)"
        strokeWidth={Math.round(w * 0.030)}
        strokeLinejoin="round"
        strokeLinecap="round"
      >{name}</text>

      {/* Layer B: 金箔 fill + glow フィルタ */}
      <text
        x="0" y={baseline}
        fontSize={fontSize}
        fontWeight="800"
        fontFamily={CARD_FONT}
        letterSpacing={Math.round(w * 0.012)}
        fill="url(#svgGold)"
        stroke="rgba(255,245,180,0.42)"
        strokeWidth={Math.round(w * 0.005)}
        strokeLinejoin="round"
        filter="url(#titleFx)"
      >{name}</text>

      {/* Layer C: 内側ハイライト（極細白ストローク） */}
      <text
        x="0" y={baseline}
        fontSize={fontSize}
        fontWeight="800"
        fontFamily={CARD_FONT}
        letterSpacing={Math.round(w * 0.012)}
        fill="none"
        stroke="rgba(255,255,230,0.16)"
        strokeWidth={Math.round(w * 0.002)}
      >{name}</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   SVG EN サブタイトル（細、アイボリー、大きめ letter-spacing）
───────────────────────────────────────────────────────────── */
function SvgEnSubtitle({ text, w, h }: { text: string; w: number; h: number }) {
  const fontSize = Math.round(w * 0.088);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', marginTop: -2, overflow: 'visible' }}>
      <defs>
        <filter id="enFx" x="-5%" y="-40%" width="110%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={Math.round(w * 0.012)} result="blur"/>
          <feFlood floodColor="#a07010" floodOpacity="0.65" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* 黒ストローク */}
      <text
        x="0" y={Math.round(fontSize * 0.90)}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="'Rajdhani','Oswald','Impact',sans-serif"
        letterSpacing={Math.round(w * 0.055)}
        fill="none"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth={Math.round(w * 0.012)}
        strokeLinejoin="round"
      >{text}</text>
      {/* アイボリーゴールド fill */}
      <text
        x="0" y={Math.round(fontSize * 0.90)}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="'Rajdhani','Oswald','Impact',sans-serif"
        letterSpacing={Math.round(w * 0.055)}
        fill="rgba(255,225,145,0.72)"
        filter="url(#enFx)"
      >{text}</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   UR バッジ（大、TCGスタイル、SVG 虹グラデーション）
───────────────────────────────────────────────────────────── */
function UrBadge({ w, h }: { w: number; h: number }) {
  const urSize = Math.round(w * 0.088);
  const starSz = Math.round(w * 0.028);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(h * 0.002) }}>
      {/* "UR" SVG */}
      <svg width={Math.round(w * 0.200)} height={Math.round(urSize * 1.05)} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="urGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="hsl(0,100%,72%)"/>
            <stop offset="25%"  stopColor="hsl(60,100%,72%)"/>
            <stop offset="50%"  stopColor="hsl(160,100%,72%)"/>
            <stop offset="75%"  stopColor="hsl(240,100%,72%)"/>
            <stop offset="100%" stopColor="hsl(300,100%,72%)"/>
          </linearGradient>
          <filter id="urFx" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={Math.round(w*0.018)} result="blur"/>
            <feFlood floodColor="rgba(220,80,255,0.80)" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="glow"/>
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* 黒影 */}
        <text
          x="0" y={Math.round(urSize * 0.92)}
          fontSize={urSize} fontWeight="900"
          fontFamily="'Impact','Anton','Arial Black',sans-serif"
          letterSpacing="-1"
          fill="none" stroke="rgba(0,0,0,0.92)"
          strokeWidth={Math.round(w*0.018)} strokeLinejoin="round"
        >UR</text>
        {/* 虹色 fill */}
        <text
          x="0" y={Math.round(urSize * 0.92)}
          fontSize={urSize} fontWeight="900"
          fontFamily="'Impact','Anton','Arial Black',sans-serif"
          letterSpacing="-1"
          fill="url(#urGrad)"
          filter="url(#urFx)"
          className="card-rainbow-animate"
        >UR</text>
      </svg>

      {/* ULTRA RARE テキスト */}
      <div style={{
        fontSize: Math.round(w * 0.024),
        fontWeight: 800,
        letterSpacing: '0.18em',
        color: 'rgba(255,215,110,0.92)',
        textShadow: `0 0 ${Math.round(w*0.02)}px rgba(255,175,30,0.60), 0 1px 4px rgba(0,0,0,0.96)`,
        fontFamily: "'Rajdhani','Oswald',sans-serif",
      }}>ULTRA RARE</div>

      {/* 星 ×5 */}
      <div style={{ display: 'flex', gap: Math.round(w * 0.010), marginTop: Math.round(h * 0.003) }}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} width={starSz} height={starSz} viewBox="0 0 20 20" className="card-rainbow-animate">
            <polygon
              points="10,0 12.2,7 20,7 13.8,11.3 16,18 10,14 4,18 6.2,11.3 0,7 7.8,7"
              fill="url(#urGrad)"
              filter="url(#urFx)"
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   名古屋ダイヤバッジ（右上）
───────────────────────────────────────────────────────────── */
function NagoyaDiamond({ w }: { w: number }) {
  const sz = Math.round(w * 0.145);
  return (
    <div style={{ position: 'relative', width: sz, height: sz, flexShrink: 0, marginTop: Math.round(w * 0.006) }}>
      <div style={{
        position: 'absolute', inset: 0,
        transform: 'rotate(45deg)',
        border: '1.5px solid rgba(200,155,35,0.65)',
        background: 'rgba(3,1,12,0.80)',
        boxShadow: `0 0 ${Math.round(w*0.03)}px rgba(200,155,35,0.28)`,
      }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: Math.round(w*0.026), color: 'rgba(255,210,110,0.95)', fontWeight: 900, lineHeight: 1, fontFamily: CARD_FONT, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>名古屋</div>
        <div style={{ fontSize: Math.round(w*0.018), color: 'rgba(255,200,90,0.58)', fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1, marginTop: 2 }}>NAGOYA</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   「名古屋名物」ピル
───────────────────────────────────────────────────────────── */
function OriginPill({ w, h }: { w: number; h: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      gap: Math.round(w * 0.014),
      marginTop: Math.round(h * 0.008),
      padding: `${Math.round(h * 0.006)}px ${Math.round(w * 0.038)}px`,
      border: '1px solid rgba(200,155,35,0.45)',
      borderRadius: 100,
      background: 'rgba(3,1,10,0.48)',
    }}>
      <span style={{ width: Math.round(w*0.012), height: Math.round(w*0.012), borderRadius: '50%', background: 'rgba(255,185,40,0.85)', flexShrink: 0, display: 'inline-block', boxShadow: `0 0 ${Math.round(w*0.01)}px rgba(255,185,40,0.65)` }} />
      <span style={{ fontSize: Math.round(w*0.022), fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,210,105,0.90)', fontFamily: CARD_FONT }}>名古屋名物</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   下部情報エリア（パネルなし、グラデ直置き）
───────────────────────────────────────────────────────────── */
interface BottomInfoProps {
  card: Card; w: number; h: number; px: number;
  textSm: number; textXs: number; isNew?: boolean;
}
function BottomInfo({ card, w, h, px, textSm, textXs, isNew }: BottomInfoProps) {
  const scoreSize = Math.round(w * 0.040);
  return (
    <div style={{ position: 'absolute', bottom: Math.round(h*0.026), left: px, right: px, zIndex: 12 }}>

      {/* コメント（斜体、彫り込み感） */}
      <p style={{
        fontSize: textXs,
        lineHeight: 1.58,
        fontStyle: 'italic',
        color: 'rgba(235,215,170,0.80)',
        textShadow: '0 1px 5px rgba(0,0,0,0.96), 0 0 2px rgba(0,0,0,0.8)',
        letterSpacing: '0.03em',
        marginBottom: Math.round(h * 0.010),
        fontFamily: CARD_FONT,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {card.tosharComment?.slice(0, 48)}
      </p>

      <GoldLine />

      {/* 店名 + スコア */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: Math.round(w*0.02), marginTop: Math.round(h*0.010) }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: textSm,
            fontWeight: 800,
            color: 'rgba(255,232,185,0.96)',
            textShadow: '0 1px 5px rgba(0,0,0,0.96)',
            letterSpacing: '0.04em',
            fontFamily: CARD_FONT,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{card.shopName}</div>
          <div style={{
            fontSize: textXs, color: 'rgba(200,168,105,0.68)',
            fontWeight: 600, letterSpacing: '0.10em', marginTop: 2,
          }}>{card.area} · NAGOYA</div>
        </div>

        {/* スコアサークル（SVG数字） */}
        <div style={{
          width: Math.round(w*0.125), height: Math.round(w*0.125),
          borderRadius: '50%',
          border: '1.5px solid rgba(200,155,35,0.50)',
          background: 'rgba(3,1,10,0.70)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 0 ${Math.round(w*0.025)}px rgba(200,150,30,0.26)`,
        }}>
          <svg width={Math.round(w*0.08)} height={Math.round(scoreSize*1.2)} viewBox={`0 0 ${Math.round(w*0.08)} ${Math.round(scoreSize*1.2)}`} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="scoreGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fce068"/>
                <stop offset="100%" stopColor="#f8a828"/>
              </linearGradient>
            </defs>
            <text
              x="50%" y={Math.round(scoreSize*0.95)}
              textAnchor="middle"
              fontSize={scoreSize} fontWeight="900"
              fontFamily="'Impact','Arial Black',sans-serif"
              fill="none" stroke="rgba(0,0,0,0.88)"
              strokeWidth={Math.round(w*0.010)} strokeLinejoin="round"
            >96</text>
            <text
              x="50%" y={Math.round(scoreSize*0.95)}
              textAnchor="middle"
              fontSize={scoreSize} fontWeight="900"
              fontFamily="'Impact','Arial Black',sans-serif"
              fill="url(#scoreGold)"
            >96</text>
          </svg>
          <div style={{ fontSize: Math.round(w*0.016), color: 'rgba(200,155,35,0.58)', fontWeight: 700, letterSpacing: '0.04em', marginTop: -2 }}>SCORE</div>
        </div>
      </div>

      {/* フッターバー */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: Math.round(h*0.010),
        paddingTop: Math.round(h*0.007),
        borderTop: '1px solid rgba(200,155,35,0.18)',
      }}>
        <span style={{ fontSize: textXs, color: 'rgba(178,138,52,0.48)', fontWeight: 700, letterSpacing: '0.10em' }}>©NAGOTOSHA 2025</span>
        {isNew && (
          <span style={{ fontSize: textXs, fontWeight: 900, letterSpacing: '0.14em', color: '#fff', background: 'linear-gradient(135deg,#e63946,#c2112a)', borderRadius: 100, padding: `2px ${Math.round(w*0.026)}px` }}>NEW</span>
        )}
        <span style={{ fontSize: textXs, color: 'rgba(178,138,52,0.48)', fontWeight: 700, letterSpacing: '0.10em' }}>UR · NGY-010</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ゴールド区切り線
───────────────────────────────────────────────────────────── */
function GoldLine({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      height: 1,
      background: 'linear-gradient(to right, transparent, rgba(200,155,35,0.55), rgba(200,155,35,0.55), transparent)',
      ...style,
    }} />
  );
}
