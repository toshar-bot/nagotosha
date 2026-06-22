'use client';

import { Card } from '@/types/card';

interface Props {
  card: Card;
  widthPx: number;
  isNew?: boolean;
}

/* ── フォント ──────────────────────────────────────────────── */
const FONT_JA  = "'Shippori Mincho B1','Yu Mincho','YuMincho','游明朝','Hiragino Mincho ProN',serif";
const FONT_EN  = "'Rajdhani','Oswald','Impact','Arial Narrow',sans-serif";
const FONT_NUM = "'Impact','Anton','Arial Black',sans-serif";

/* ── 虹グラデーション ──────────────────────────────────────── */
const RAINBOW_CSS = `linear-gradient(105deg,
  hsl(0,100%,65%)   0%,   hsl(48,100%,65%)  14%,
  hsl(96,100%,65%)  28%,  hsl(152,100%,65%) 42%,
  hsl(200,100%,65%) 57%,  hsl(252,100%,65%) 71%,
  hsl(300,100%,65%) 85%,  hsl(0,100%,65%)   100%)`;

/* ── SVG 金箔グラデーション stops ─────────────────────────── */
const GOLD_S = [
  { o: '0%',   c: '#fff8d2' },
  { o: '10%',  c: '#fce068' },
  { o: '34%',  c: '#f8a828' },
  { o: '54%',  c: '#9a4e04' },
  { o: '74%',  c: '#f8a828' },
  { o: '90%',  c: '#fce068' },
  { o: '100%', c: '#fff0a0' },
];

/* ── UR カードフレーム幅 ───────────────────────────────────── */
const FW = 5;

/* ══════════════════════════════════════════════════════════════
   FullArtCard メインコンポーネント
══════════════════════════════════════════════════════════════ */
export default function FullArtCard({ card, widthPx: w, isNew }: Props) {
  const h  = Math.round(w * 1.42);
  const r  = Math.round(w * 0.052);
  const px = Math.round(w * 0.055);

  const distJa = card.districtJa ?? card.area;
  const distEn = card.districtEn ?? card.area.toUpperCase();

  return (
    <div style={{
      position: 'relative', width: w, height: h,
      borderRadius: r, overflow: 'hidden', flexShrink: 0,
      background: '#03010a',
      boxShadow: [
        `0 ${Math.round(w*0.08)}px ${Math.round(w*0.28)}px rgba(0,0,0,0.94)`,
        `0 0 ${Math.round(w*0.06)}px rgba(220,155,35,0.24)`,
        `0 0 ${Math.round(w*0.18)}px rgba(160,50,240,0.16)`,
      ].join(', '),
    }}>

      {/* ━━━━━━━━━━━━━━ L1: 料理写真フルブリード ━━━━━━━━━━━━━━ */}
      {card.imageUrl && (
        <img src={card.imageUrl} alt={card.name} style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 18%',  // 料理を上寄りで表示
        }} />
      )}

      {/* ━━━━━━━━━━━━━━ L2: 上部暗幕（タイトルゾーン） ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: Math.round(h * 0.50),
        background: `linear-gradient(to bottom,
          rgba(2,0,8,0.97) 0%,
          rgba(2,0,8,0.93) 30%,
          rgba(2,0,8,0.72) 55%,
          rgba(2,0,8,0.22) 76%,
          transparent 100%)`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ━━━━━━━━━━━━━━ L3: 下部暗幕（情報ゾーン） ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: Math.round(h * 0.38),
        background: `linear-gradient(to top,
          rgba(2,0,8,0.97) 0%,
          rgba(2,0,8,0.86) 38%,
          rgba(2,0,8,0.54) 64%,
          transparent 100%)`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ━━━━━━━━━━━━━━ L4: 青海波 (seigaiha) 上部装飾 ━━━━━━━━━━━━━━ */}
      <SeigahaBg w={w} h={h} />

      {/* ━━━━━━━━━━━━━━ L5: 虹ホロフィルム（全面 color-dodge） ━━━━━━━━━━━━━━ */}
      <div className="card-ur-animate" style={{
        position: 'absolute', inset: 0, zIndex: 4,
        mixBlendMode: 'color-dodge', opacity: 0.10,
        background: RAINBOW_CSS, pointerEvents: 'none',
      }} />

      {/* ━━━━━━━━━━━━━━ L6: ヘッダー（UR + 地区バッジ） ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.022), left: px, right: px,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        zIndex: 14,
      }}>
        <UrBadge w={w} h={h} />
        <DistrictBadge distJa={distJa} distEn={distEn} w={w} />
      </div>

      {/* ━━━━━━━━━━━━━━ L7: タイトルゾーン ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.195), left: px, right: px,
        zIndex: 14,
      }}>
        <GoldRule w={w} />

        {/* 料理名 SVG 金箔タイトル（フル幅に引き伸ばし） */}
        <div style={{ marginTop: Math.round(h * 0.006) }}>
          <SvgGoldTitle name={card.name} totalW={w - px * 2} h={Math.round(w * 0.195)} />
        </div>

        {/* EN サブタイトル */}
        <EnSubtitle name={card.name} w={w - px * 2} h={Math.round(w * 0.050)} />

        {/* 名古屋名物ピル */}
        <OriginPill w={w} h={h} />

        <GoldRule w={w} style={{ marginTop: Math.round(h * 0.010) }} />
      </div>

      {/* ━━━━━━━━━━━━━━ L8: 料理 subject レイヤー（切り抜きPNG） ━━━━━━━━━━━━━━ */}
      {/* subjectImageUrl が設定されたら自動的に前面に出る。現在は未設定 */}
      <SubjectLayer subjectImageUrl={card.subjectImageUrl} w={w} h={h} />

      {/* ━━━━━━━━━━━━━━ L9: 下部情報 ━━━━━━━━━━━━━━ */}
      <BottomInfo card={card} w={w} h={h} px={px} isNew={isNew} />

      {/* ━━━━━━━━━━━━━━ 内側4隅の角装飾 ━━━━━━━━━━━━━━ */}
      {(['tl','tr','bl','br'] as const).map(pos => (
        <CornerOrn key={pos} pos={pos} w={w} h={h} fw={FW} />
      ))}

      {/* ━━━━━━━━━━━━━━ L60: 虹ホロ外枠 ━━━━━━━━━━━━━━ */}
      <div className="card-rainbow-animate" style={{
        position: 'absolute', inset: 0, borderRadius: r,
        border: `${FW}px solid transparent`,
        background: `transparent padding-box, ${RAINBOW_CSS} border-box`,
        zIndex: 60, pointerEvents: 'none',
        boxShadow: `inset 0 0 ${Math.round(w*0.05)}px rgba(200,60,255,0.16)`,
      }} />

      {/* ━━━━━━━━━━━━━━ L61: 内側ゴールドライン ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute',
        inset: FW + Math.round(w * 0.014),
        borderRadius: r - FW - Math.round(w * 0.014) + 2,
        border: '1px solid rgba(200,155,35,0.30)',
        zIndex: 61, pointerEvents: 'none',
      }} />

      {/* ━━━━━━━━━━━━━━ L62: グロスバーニッシュ ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r,
        background: `linear-gradient(138deg,
          rgba(255,255,255,0.11) 0%,
          rgba(255,255,255,0.04) 22%,
          transparent 50%)`,
        zIndex: 62, pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   青海波パターン（上部装飾レイヤー）
══════════════════════════════════════════════════════════════ */
function SeigahaBg({ w, h }: { w: number; h: number }) {
  const unit = Math.round(w * 0.095);   // 1セルのサイズ
  const cols = Math.ceil(w / unit) + 1;
  const rows = 5;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: Math.round(h * 0.48),
      zIndex: 3, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <svg
        width={w} height={Math.round(h * 0.48)}
        viewBox={`0 0 ${w} ${Math.round(h * 0.48)}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* 青海波: 半円を互い違いに並べる */}
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => {
            const cx = col * unit + (row % 2 === 0 ? 0 : unit / 2) - unit / 2;
            const cy = row * (unit * 0.6);
            return (
              <g key={`${row}-${col}`}>
                <path
                  d={`M ${cx} ${cy + unit * 0.5} A ${unit * 0.5} ${unit * 0.5} 0 0 1 ${cx + unit} ${cy + unit * 0.5}`}
                  fill="none"
                  stroke="rgba(180,140,30,0.10)"
                  strokeWidth="0.8"
                />
              </g>
            );
          })
        )}
        {/* 縦の光の流れ（ゴールドの縦筋） */}
        <line x1={Math.round(w*0.72)} y1="0" x2={Math.round(w*0.62)} y2={Math.round(h*0.48)}
          stroke="rgba(200,160,35,0.06)" strokeWidth="12"/>
        <line x1={Math.round(w*0.28)} y1="0" x2={Math.round(w*0.18)} y2={Math.round(h*0.48)}
          stroke="rgba(200,160,35,0.04)" strokeWidth="8"/>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SVG 金箔タイトル文字
   ・textLength で必ずコンテナ幅いっぱいに引き伸ばす
   ・3レイヤー: 黒太影 → 金箔fill+glow → 内側白光
══════════════════════════════════════════════════════════════ */
function SvgGoldTitle({ name, totalW, h }: { name: string; totalW: number; h: number }) {
  /* 正規化した座標系で描いて SVG が自動スケール */
  const VW = 300;
  const VH = 120;
  const FS = 95;   // 正規化 font-size
  const BL = 90;   // baseline y
  const SP = 6;    // letter-spacing (正規化)

  return (
    <svg
      width={totalW} height={h}
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="tGold" x1="0" y1="0" x2="0" y2="1">
          {GOLD_S.map(s => <stop key={s.o} offset={s.o} stopColor={s.c} />)}
        </linearGradient>
        <filter id="tFx" x="-18%" y="-22%" width="136%" height="144%">
          {/* オレンジグロー */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="5.5" result="g1"/>
          <feFlood floodColor="#ff8c0a" floodOpacity="0.88" result="c1"/>
          <feComposite in="c1" in2="g1" operator="in" result="glow"/>
          {/* コア輝点 */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="g2"/>
          <feFlood floodColor="#ffe040" floodOpacity="0.70" result="c2"/>
          <feComposite in="c2" in2="g2" operator="in" result="core"/>
          {/* 下ドロップシャドウ */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="g3"/>
          <feOffset dx="0" dy="5" in="g3" result="sOff"/>
          <feFlood floodColor="#000000" floodOpacity="0.97" result="c3"/>
          <feComposite in="c3" in2="sOff" operator="in" result="shadow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="core"/>
            <feMergeNode in="shadow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Layer A: 黒太ストローク（輪郭・影） */}
      <text x="0" y={BL}
        fontSize={FS} fontWeight="800" fontFamily={FONT_JA}
        letterSpacing={SP}
        textLength={VW - SP} lengthAdjust="spacingAndGlyphs"
        fill="none"
        stroke="rgba(0,0,0,0.95)" strokeWidth="10"
        strokeLinejoin="round" strokeLinecap="round"
      >{name}</text>

      {/* Layer B: 金箔 fill + フィルタ */}
      <text x="0" y={BL}
        fontSize={FS} fontWeight="800" fontFamily={FONT_JA}
        letterSpacing={SP}
        textLength={VW - SP} lengthAdjust="spacingAndGlyphs"
        fill="url(#tGold)"
        stroke="rgba(255,245,180,0.42)" strokeWidth="0.8"
        strokeLinejoin="round"
        filter="url(#tFx)"
      >{name}</text>

      {/* Layer C: 内側ハイライト */}
      <text x="0" y={BL}
        fontSize={FS} fontWeight="800" fontFamily={FONT_JA}
        letterSpacing={SP}
        textLength={VW - SP} lengthAdjust="spacingAndGlyphs"
        fill="none"
        stroke="rgba(255,255,230,0.14)" strokeWidth="0.5"
      >{name}</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   EN サブタイトル
══════════════════════════════════════════════════════════════ */
const EN_MAP: Record<string, string> = {
  'ひつまぶし': 'HITSUMABUSHI', '小倉トースト': 'OGURA TOAST',
  'スガキヤラーメン': 'SUGAKIYA RAMEN', '矢場とんの味噌カツ': 'MISO KATSU',
  '世界の山ちゃんの手羽先': 'TEBASAKI', 'ヨコイのあんかけスパ': 'ANKAKE SPA',
  '味仙の台湾ラーメン': 'TAIWAN RAMEN', 'あつた蓬莱軒のひつまぶし': 'HITSUMABUSHI',
  'コメダ珈琲店のシロノワール': 'SHIRO NOIR', '千寿の天むす': 'TENMUSU',
};

function EnSubtitle({ name, w, h }: { name: string; w: number; h: number }) {
  const text = EN_MAP[name];
  if (!text) return null;
  const VW = 300; const VH = 40; const FS = 24; const BL = 28;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', marginTop: -2, overflow: 'visible' }}>
      <defs>
        <filter id="enFx" x="-4%" y="-40%" width="108%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="b"/>
          <feFlood floodColor="#8a6010" floodOpacity="0.60" result="c"/>
          <feComposite in="c" in2="b" operator="in" result="g"/>
          <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <text x="0" y={BL} fontSize={FS} fontWeight="700" fontFamily={FONT_EN}
        textLength={VW} lengthAdjust="spacing"
        fill="none" stroke="rgba(0,0,0,0.85)" strokeWidth="4" strokeLinejoin="round"
      >{text}</text>
      <text x="0" y={BL} fontSize={FS} fontWeight="700" fontFamily={FONT_EN}
        textLength={VW} lengthAdjust="spacing"
        fill="rgba(255,225,140,0.70)" filter="url(#enFx)"
      >{text}</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   UR バッジ（左上・大）
══════════════════════════════════════════════════════════════ */
function UrBadge({ w, h }: { w: number; h: number }) {
  const FS = Math.round(w * 0.090);
  const starSz = Math.round(w * 0.028);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(h*0.002) }}>
      {/* "UR" */}
      <svg width={Math.round(w*0.215)} height={Math.round(FS*1.08)}
        style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="urG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="hsl(0,100%,72%)"/>
            <stop offset="25%"  stopColor="hsl(55,100%,72%)"/>
            <stop offset="50%"  stopColor="hsl(155,100%,72%)"/>
            <stop offset="75%"  stopColor="hsl(235,100%,72%)"/>
            <stop offset="100%" stopColor="hsl(300,100%,72%)"/>
          </linearGradient>
          <filter id="urFx" x="-18%" y="-18%" width="136%" height="136%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="b"/>
            <feFlood floodColor="rgba(200,60,255,0.85)" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <text x="0" y={Math.round(FS*0.92)} fontSize={FS} fontWeight="900"
          fontFamily={FONT_NUM} letterSpacing="-1"
          fill="none" stroke="rgba(0,0,0,0.92)"
          strokeWidth={Math.round(w*0.016)} strokeLinejoin="round"
        >UR</text>
        <text x="0" y={Math.round(FS*0.92)} fontSize={FS} fontWeight="900"
          fontFamily={FONT_NUM} letterSpacing="-1"
          fill="url(#urG)" filter="url(#urFx)"
          className="card-rainbow-animate"
        >UR</text>
      </svg>

      {/* ULTRA RARE */}
      <div style={{
        fontSize: Math.round(w*0.024), fontWeight: 800,
        letterSpacing: '0.18em',
        color: 'rgba(255,215,108,0.92)',
        fontFamily: FONT_EN,
        textShadow: `0 0 ${Math.round(w*0.020)}px rgba(255,175,28,0.62), 0 1px 4px rgba(0,0,0,0.97)`,
        lineHeight: 1,
      }}>ULTRA RARE</div>

      {/* 星×5 */}
      <div style={{ display: 'flex', gap: Math.round(w*0.010), marginTop: Math.round(h*0.003) }}>
        {Array.from({length:5}).map((_,i) => (
          <svg key={i} width={starSz} height={starSz} viewBox="0 0 20 20" className="card-rainbow-animate">
            <polygon
              points="10,0 12.2,7 20,7 13.8,11.3 16,18 10,14 4,18 6.2,11.3 0,7 7.8,7"
              fill="url(#urG)" filter="url(#urFx)"
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   地区バッジ（右上・六角形ダイヤ）
══════════════════════════════════════════════════════════════ */
function DistrictBadge({ distJa, distEn, w }: { distJa: string; distEn: string; w: number }) {
  const sz = Math.round(w * 0.150);
  return (
    <div style={{ position: 'relative', width: sz, height: sz, flexShrink: 0, marginTop: Math.round(w*0.006) }}>
      {/* ひし形フレーム */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: 'rotate(45deg)',
        border: '1.5px solid rgba(200,155,35,0.68)',
        background: 'rgba(2,0,8,0.82)',
        boxShadow: [
          `0 0 ${Math.round(w*0.032)}px rgba(200,155,35,0.32)`,
          `inset 0 0 ${Math.round(w*0.015)}px rgba(200,155,35,0.08)`,
        ].join(', '),
      }} />
      {/* 内側テキスト */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: Math.round(w*0.028), color: 'rgba(255,215,108,0.97)', fontWeight: 900, lineHeight: 1, fontFamily: FONT_JA, textShadow: '0 1px 5px rgba(0,0,0,0.96)' }}>{distJa}</div>
        <div style={{ fontSize: Math.round(w*0.018), color: 'rgba(255,200,88,0.56)', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1, marginTop: 2, fontFamily: FONT_EN }}>{distEn}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   「名古屋名物」ピル
══════════════════════════════════════════════════════════════ */
function OriginPill({ w, h }: { w: number; h: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      gap: Math.round(w*0.014),
      marginTop: Math.round(h*0.006),
      padding: `${Math.round(h*0.006)}px ${Math.round(w*0.036)}px`,
      border: '1px solid rgba(200,155,35,0.44)',
      borderRadius: 100,
      background: 'rgba(2,0,8,0.46)',
    }}>
      <span style={{ width: Math.round(w*0.012), height: Math.round(w*0.012), borderRadius:'50%', background:'rgba(255,185,38,0.85)', flexShrink:0, display:'inline-block', boxShadow:`0 0 ${Math.round(w*0.010)}px rgba(255,185,38,0.65)` }} />
      <span style={{ fontSize:Math.round(w*0.022), fontWeight:700, letterSpacing:'0.12em', color:'rgba(255,210,105,0.92)', fontFamily:FONT_JA }}>名古屋名物</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   subject レイヤー（切り抜きPNG差し替え用）
   subjectImageUrl が設定された時のみ前面表示。
   将来: /public/subjects/hitsumabushi.png 等を用意して差し替える
══════════════════════════════════════════════════════════════ */
function SubjectLayer({ subjectImageUrl, w, h }: { subjectImageUrl?: string; w: number; h: number }) {
  if (!subjectImageUrl) return null;

  // 情報ゾーンの直上、カード下部 32% あたりにフロート
  const bottom = Math.round(h * 0.30);
  // 水平方向はカード幅の 92%、少し右に重心を寄せて料理感を強調
  const imgW   = Math.round(w * 0.92);

  return (
    <img
      src={subjectImageUrl}
      alt=""
      aria-hidden
      style={{
        position: 'absolute',
        bottom,
        left: '50%',
        transform: 'translateX(-50%)',   // 水平センタリング
        width: imgW,
        maxHeight: Math.round(h * 0.54), // カード高さの 54% まで
        objectFit: 'contain',
        objectPosition: 'bottom center',
        zIndex: 8,                        // 写真 > subject > 文字下 の順
        pointerEvents: 'none',
        // 立体感: 下方向に濃いシャドウ、全体に薄いアンビエント
        filter: [
          `drop-shadow(0 ${Math.round(w*0.025)}px ${Math.round(w*0.055)}px rgba(0,0,0,0.82))`,
          `drop-shadow(0 ${Math.round(w*0.006)}px ${Math.round(w*0.014)}px rgba(0,0,0,0.60))`,
          `drop-shadow(0 0            ${Math.round(w*0.030)}px rgba(120,80,10,0.18))`,  // 温かい光の反射
        ].join(' '),
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   下部情報エリア（パネルなし・グラデ直置き）
══════════════════════════════════════════════════════════════ */
function BottomInfo({ card, w, h, px, isNew }: { card: Card; w: number; h: number; px: number; isNew?: boolean }) {
  const xs  = Math.round(w * 0.024);
  const sm  = Math.round(w * 0.030);
  const FS  = Math.round(w * 0.038);  // スコア数字

  return (
    <div style={{ position: 'absolute', bottom: Math.round(h*0.024), left: px, right: px, zIndex: 14 }}>

      {/* コメント（斜体、彫り込み感） */}
      <p style={{
        fontSize: xs, lineHeight: 1.60, fontStyle: 'italic',
        color: 'rgba(232,215,170,0.80)',
        textShadow: '0 1px 6px rgba(0,0,0,0.97), 0 0 2px rgba(0,0,0,0.85)',
        letterSpacing: '0.03em', marginBottom: Math.round(h*0.008),
        fontFamily: FONT_JA,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {card.tosharComment?.slice(0, 50)}
      </p>

      <GoldRule w={w} />

      {/* 店名 + スコア */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: Math.round(w*0.016), marginTop: Math.round(h*0.008) }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontSize: sm, fontWeight: 800,
            color: 'rgba(255,232,182,0.97)',
            textShadow: '0 1px 6px rgba(0,0,0,0.97)',
            letterSpacing: '0.04em', fontFamily: FONT_JA,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>{card.shopName}</div>
          <div style={{ fontSize: xs, color:'rgba(200,168,102,0.68)', fontWeight:600, letterSpacing:'0.10em', marginTop:2, fontFamily: FONT_EN }}>
            {card.area} · NAGOYA
          </div>
        </div>

        {/* スコア（SVG 金箔数字） */}
        <div style={{
          width: Math.round(w*0.125), height: Math.round(w*0.125),
          borderRadius: '50%',
          border: '1.5px solid rgba(200,155,35,0.52)',
          background: 'rgba(2,0,8,0.72)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          flexShrink:0,
          boxShadow:`0 0 ${Math.round(w*0.026)}px rgba(200,150,28,0.28)`,
        }}>
          <svg width={Math.round(w*0.082)} height={Math.round(FS*1.2)} viewBox={`0 0 48 ${Math.round(FS*1.2)}`} style={{ overflow:'visible' }}>
            <defs>
              <linearGradient id="scG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#fce068"/>
                <stop offset="100%" stopColor="#f8a828"/>
              </linearGradient>
            </defs>
            <text x="24" y={Math.round(FS*0.95)} textAnchor="middle"
              fontSize={FS} fontWeight="900" fontFamily={FONT_NUM}
              fill="none" stroke="rgba(0,0,0,0.90)"
              strokeWidth="5" strokeLinejoin="round"
            >96</text>
            <text x="24" y={Math.round(FS*0.95)} textAnchor="middle"
              fontSize={FS} fontWeight="900" fontFamily={FONT_NUM}
              fill="url(#scG)"
            >96</text>
          </svg>
          <div style={{ fontSize: Math.round(w*0.016), color:'rgba(200,155,35,0.58)', fontWeight:700, letterSpacing:'0.04em', marginTop:-2, fontFamily:FONT_EN }}>SCORE</div>
        </div>
      </div>

      {/* フッター */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginTop: Math.round(h*0.008),
        paddingTop: Math.round(h*0.006),
        borderTop: '1px solid rgba(200,155,35,0.20)',
      }}>
        <span style={{ fontSize: xs, color:'rgba(175,138,50,0.48)', fontWeight:700, letterSpacing:'0.10em', fontFamily:FONT_EN }}>©NAGOTOSHA 2025</span>
        {isNew && (
          <span style={{ fontSize: xs, fontWeight:900, letterSpacing:'0.14em', color:'#fff', background:'linear-gradient(135deg,#e63946,#c2112a)', borderRadius:100, padding:`2px ${Math.round(w*0.026)}px` }}>NEW</span>
        )}
        <span style={{ fontSize: xs, color:'rgba(175,138,50,0.48)', fontWeight:700, letterSpacing:'0.10em', fontFamily:FONT_EN }}>UR · NGY-010</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   4隅の角装飾（内枠の内側に配置）
══════════════════════════════════════════════════════════════ */
function CornerOrn({ pos, w, fw }: { pos:'tl'|'tr'|'bl'|'br'; w:number; h:number; fw:number }) {
  const off  = fw + Math.round(w * 0.030);  // 内枠ラインの内側
  const sz   = Math.round(w * 0.068);
  const isT  = pos.startsWith('t');
  const isL  = pos.endsWith('l');
  const lw   = '1.2px';
  const col  = 'rgba(200,155,35,0.52)';
  const dSz  = Math.round(w * 0.014);       // コーナーのダイヤモンド

  return (
    <div style={{
      position: 'absolute', zIndex: 15, pointerEvents: 'none',
      [isT ? 'top' : 'bottom']: off,
      [isL ? 'left' : 'right']: off,
      width: sz, height: sz,
      borderTop:    isT ? `${lw} solid ${col}` : undefined,
      borderBottom: !isT ? `${lw} solid ${col}` : undefined,
      borderLeft:   isL ? `${lw} solid ${col}` : undefined,
      borderRight:  !isL ? `${lw} solid ${col}` : undefined,
    }}>
      <div style={{
        position: 'absolute',
        [isT ? 'top' : 'bottom']: -Math.round(dSz/2),
        [isL ? 'left' : 'right']: -Math.round(dSz/2),
        width: dSz, height: dSz,
        background: 'rgba(200,155,35,0.70)',
        transform: 'rotate(45deg)',
        boxShadow: `0 0 ${Math.round(dSz*0.8)}px rgba(200,155,35,0.55)`,
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ゴールド区切り線
══════════════════════════════════════════════════════════════ */
function GoldRule({ w, style }: { w: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(to right,
        transparent,
        rgba(200,155,35,0.60) ${Math.round(w*0.12)}px,
        rgba(200,155,35,0.60) calc(100% - ${Math.round(w*0.12)}px),
        transparent)`,
      ...style,
    }} />
  );
}
