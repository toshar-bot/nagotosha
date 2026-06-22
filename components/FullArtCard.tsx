'use client';

import { Card } from '@/types/card';

interface Props {
  card: Card;
  widthPx: number;
  isNew?: boolean;
  /** CardViewer3D が subject を translateZ で描画するとき true にして内部 SubjectLayer を非表示 */
  hideSubject?: boolean;
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
  { o: '0%',   c: '#ffe89a' },
  { o: '12%',  c: '#fcd84e' },
  { o: '32%',  c: '#e89420' },
  { o: '52%',  c: '#5e2800' },
  { o: '68%',  c: '#c07010' },
  { o: '82%',  c: '#f0c040' },
  { o: '100%', c: '#e8c870' },
];

/* ── UR カードフレーム幅 ───────────────────────────────────── */
const FW = 5;

/* ══════════════════════════════════════════════════════════════
   FullArtCard メインコンポーネント
══════════════════════════════════════════════════════════════ */
export default function FullArtCard({ card, widthPx: w, isNew, hideSubject }: Props) {
  const h  = Math.round(w * 1.42);
  const r  = Math.round(w * 0.052);
  const px = Math.round(w * 0.055);

  const distJa = card.districtJa ?? card.area;
  const distEn = card.districtEn ?? card.area.toUpperCase();

  /* ヘッダー内のセンターカラム幅を計算 */
  const urBadgeW   = Math.round(w * 0.215);
  const distBadgeW = Math.round(w * 0.150);
  const gap        = Math.round(w * 0.018);
  const innerW     = w - px * 2;
  const centerW    = innerW - urBadgeW - distBadgeW - gap * 2;

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
          objectPosition: 'center 18%',
        }} />
      )}

      {/* ━━━━━━━━━━━━━━ L2: 上部暗幕（ヘッダーゾーン） ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: Math.round(h * 0.44),
        background: `linear-gradient(to bottom,
          rgba(2,0,8,0.96) 0%,
          rgba(2,0,8,0.90) 25%,
          rgba(2,0,8,0.68) 52%,
          rgba(2,0,8,0.18) 76%,
          transparent 100%)`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ━━━━━━━━━━━━━━ L3: 下部暗幕（情報ゾーン） ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: Math.round(h * 0.36),
        background: `linear-gradient(to top,
          rgba(2,0,8,0.97) 0%,
          rgba(2,0,8,0.88) 35%,
          rgba(2,0,8,0.52) 62%,
          transparent 100%)`,
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ━━━━━━━━━━━━━━ L4: 青海波 (seigaiha) 上部装飾 ━━━━━━━━━━━━━━ */}
      <SeigahaBg w={w} h={h} />

      {/* ━━━━━━━━━━━━━━ L5: 虹ホロフィルム（全面 color-dodge） ━━━━━━━━━━━━━━ */}
      <div className="card-ur-animate" style={{
        position: 'absolute', inset: 0, zIndex: 4,
        mixBlendMode: 'color-dodge', opacity: 0.08,
        background: RAINBOW_CSS, pointerEvents: 'none',
      }} />

      {/* ━━━━━━━━━━━━━━ L6: ヘッダー（UR | タイトル | 地区バッジ） ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.022), left: px, right: px,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap,
        zIndex: 14,
      }}>
        {/* 左: UR バッジ */}
        <UrBadge w={w} h={h} />

        {/* 中央: タイトル + EN サブタイトル */}
        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: Math.round(h * 0.004),
        }}>
          <SvgGoldTitle name={card.name} totalW={centerW} h={Math.round(w * 0.115)} />
          <EnSubtitle name={card.name} w={centerW} h={Math.round(w * 0.038)} />
          <OriginPill w={w} h={h} />
        </div>

        {/* 右: 地区バッジ */}
        <DistrictBadge distJa={distJa} distEn={distEn} w={w} />
      </div>

      {/* ━━━━━━━━━━━━━━ L7: ヘッダー下 ゴールドライン ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute',
        top: Math.round(h * 0.230), left: px, right: px,
        zIndex: 14,
      }}>
        <GoldRule w={w} />
      </div>

      {/* ━━━━━━━━━━━━━━ L8: 料理 subject レイヤー（切り抜きPNG） ━━━━━━━━━━━━━━ */}
      {/* hideSubject=true のとき CardViewer3D が translateZ レイヤーで代替描画 */}
      <SubjectLayer subjectImageUrl={card.subjectImageUrl} hide={hideSubject} />

      {/* ━━━━━━━━━━━━━━ L9: 下部店舗スペック ━━━━━━━━━━━━━━ */}
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
        boxShadow: `inset 0 0 ${Math.round(w*0.05)}px rgba(200,60,255,0.14)`,
      }} />

      {/* ━━━━━━━━━━━━━━ L61: 内側ゴールドライン ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute',
        inset: FW + Math.round(w * 0.014),
        borderRadius: r - FW - Math.round(w * 0.014) + 2,
        border: '1px solid rgba(200,155,35,0.28)',
        zIndex: 61, pointerEvents: 'none',
      }} />

      {/* ━━━━━━━━━━━━━━ L62: グロスバーニッシュ ━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r,
        background: `linear-gradient(138deg,
          rgba(255,255,255,0.09) 0%,
          rgba(255,255,255,0.03) 22%,
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
  const unit = Math.round(w * 0.095);
  const cols = Math.ceil(w / unit) + 1;
  const rows = 5;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: Math.round(h * 0.44),
      zIndex: 3, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <svg
        width={w} height={Math.round(h * 0.44)}
        viewBox={`0 0 ${w} ${Math.round(h * 0.44)}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => {
            const cx = col * unit + (row % 2 === 0 ? 0 : unit / 2) - unit / 2;
            const cy = row * (unit * 0.6);
            return (
              <path
                key={`${row}-${col}`}
                d={`M ${cx} ${cy + unit * 0.5} A ${unit * 0.5} ${unit * 0.5} 0 0 1 ${cx + unit} ${cy + unit * 0.5}`}
                fill="none"
                stroke="rgba(180,140,30,0.09)"
                strokeWidth="0.8"
              />
            );
          })
        )}
        <line x1={Math.round(w*0.72)} y1="0" x2={Math.round(w*0.62)} y2={Math.round(h*0.44)}
          stroke="rgba(200,160,35,0.05)" strokeWidth="12"/>
        <line x1={Math.round(w*0.28)} y1="0" x2={Math.round(w*0.18)} y2={Math.round(h*0.44)}
          stroke="rgba(200,160,35,0.04)" strokeWidth="8"/>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SVG 金箔タイトル文字
   ・textLength で必ずコンテナ幅いっぱいに引き伸ばす
   ・3レイヤー: 黒太影 → 金箔fill+glow → 内側暖色光
══════════════════════════════════════════════════════════════ */
function SvgGoldTitle({ name, totalW, h }: { name: string; totalW: number; h: number }) {
  const VW = 300;
  const VH = 120;
  const FS = 95;
  const BL = 90;
  const SP = 6;

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
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="g1"/>
          <feFlood floodColor="#cc6800" floodOpacity="0.65" result="c1"/>
          <feComposite in="c1" in2="g1" operator="in" result="glow"/>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="g2"/>
          <feFlood floodColor="#e8b820" floodOpacity="0.50" result="c2"/>
          <feComposite in="c2" in2="g2" operator="in" result="core"/>
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="g3"/>
          <feOffset dx="0" dy="5" in="g3" result="sOff"/>
          <feFlood floodColor="#000000" floodOpacity="0.97" result="c3"/>
          <feComposite in="c3" in2="sOff" operator="in" result="shadow"/>
          <feMerge>
            <feMergeNode in="shadow"/>
            <feMergeNode in="glow"/>
            <feMergeNode in="core"/>
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
        stroke="rgba(0,0,0,0.97)" strokeWidth="10"
        strokeLinejoin="round" strokeLinecap="round"
      >{name}</text>

      {/* Layer B: 金箔 fill + フィルタ */}
      <text x="0" y={BL}
        fontSize={FS} fontWeight="800" fontFamily={FONT_JA}
        letterSpacing={SP}
        textLength={VW - SP} lengthAdjust="spacingAndGlyphs"
        fill="url(#tGold)"
        stroke="rgba(255,220,140,0.30)" strokeWidth="0.6"
        strokeLinejoin="round"
        filter="url(#tFx)"
      >{name}</text>

      {/* Layer C: 内側暖色ハイライト（白みを最小化） */}
      <text x="0" y={BL}
        fontSize={FS} fontWeight="800" fontFamily={FONT_JA}
        letterSpacing={SP}
        textLength={VW - SP} lengthAdjust="spacingAndGlyphs"
        fill="none"
        stroke="rgba(255,220,140,0.07)" strokeWidth="0.5"
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
      style={{ display: 'block', marginTop: 1, overflow: 'visible' }}>
      <defs>
        <filter id="enFx" x="-4%" y="-40%" width="108%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/>
          <feFlood floodColor="#7a5008" floodOpacity="0.55" result="c"/>
          <feComposite in="c" in2="b" operator="in" result="g"/>
          <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <text x="0" y={BL} fontSize={FS} fontWeight="700" fontFamily={FONT_EN}
        textLength={VW} lengthAdjust="spacing"
        fill="none" stroke="rgba(0,0,0,0.88)" strokeWidth="4" strokeLinejoin="round"
      >{text}</text>
      <text x="0" y={BL} fontSize={FS} fontWeight="700" fontFamily={FONT_EN}
        textLength={VW} lengthAdjust="spacing"
        fill="rgba(240,200,110,0.62)" filter="url(#enFx)"
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(h*0.002), flexShrink: 0 }}>
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

      <div style={{
        fontSize: Math.round(w*0.024), fontWeight: 800,
        letterSpacing: '0.18em',
        color: 'rgba(255,215,108,0.92)',
        fontFamily: FONT_EN,
        textShadow: `0 0 ${Math.round(w*0.018)}px rgba(255,175,28,0.55), 0 1px 4px rgba(0,0,0,0.97)`,
        lineHeight: 1,
      }}>ULTRA RARE</div>

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
      <div style={{
        position: 'absolute', inset: 0,
        transform: 'rotate(45deg)',
        border: '1.5px solid rgba(200,155,35,0.68)',
        background: 'rgba(2,0,8,0.82)',
        boxShadow: [
          `0 0 ${Math.round(w*0.032)}px rgba(200,155,35,0.30)`,
          `inset 0 0 ${Math.round(w*0.015)}px rgba(200,155,35,0.08)`,
        ].join(', '),
      }} />
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
      gap: Math.round(w*0.012),
      marginTop: Math.round(h*0.005),
      padding: `${Math.round(h*0.005)}px ${Math.round(w*0.028)}px`,
      border: '1px solid rgba(200,155,35,0.38)',
      borderRadius: 100,
      background: 'rgba(2,0,8,0.40)',
    }}>
      <span style={{ width: Math.round(w*0.010), height: Math.round(w*0.010), borderRadius:'50%', background:'rgba(255,185,38,0.82)', flexShrink:0, display:'inline-block', boxShadow:`0 0 ${Math.round(w*0.008)}px rgba(255,185,38,0.60)` }} />
      <span style={{ fontSize:Math.round(w*0.020), fontWeight:700, letterSpacing:'0.12em', color:'rgba(255,210,105,0.88)', fontFamily:FONT_JA }}>名古屋名物</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   subject レイヤー（切り抜きPNG差し替え用）
   hide=true のとき非表示（CardViewer3D が translateZ で描画）
══════════════════════════════════════════════════════════════ */
function SubjectLayer({ subjectImageUrl, hide }: { subjectImageUrl?: string; hide?: boolean }) {
  if (!subjectImageUrl || hide) return null;

  return (
    <img
      src={subjectImageUrl}
      alt=""
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center 18%',
        zIndex: 8,
        pointerEvents: 'none',
        filter: [
          'drop-shadow(0 14px 28px rgba(0,0,0,0.72))',
          'drop-shadow(0 4px 8px rgba(0,0,0,0.50))',
          'drop-shadow(0 0 18px rgba(80,45,0,0.14))',
        ].join(' '),
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   下部店舗スペック（コメントなし・カード印刷スタイル）
══════════════════════════════════════════════════════════════ */
function BottomInfo({ card, w, h, px, isNew }: { card: Card; w: number; h: number; px: number; isNew?: boolean }) {
  const xs  = Math.round(w * 0.022);  // ラベル
  const sm  = Math.round(w * 0.028);  // 値
  const md  = Math.round(w * 0.034);  // 店名

  const labelColor = 'rgba(175,138,50,0.55)';
  const valueColor = 'rgba(238,218,168,0.92)';
  const shopColor  = 'rgba(255,232,172,0.97)';

  return (
    <div style={{ position: 'absolute', bottom: Math.round(h*0.022), left: px, right: px, zIndex: 14 }}>

      <GoldRule w={w} />

      {/* 店名（大） */}
      <div style={{
        marginTop: Math.round(h*0.010),
        fontSize: md, fontWeight: 900,
        fontFamily: FONT_JA,
        color: shopColor,
        textShadow: '0 1px 8px rgba(0,0,0,0.97), 0 0 2px rgba(0,0,0,0.80)',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {card.shopName}
      </div>

      {/* ADDRESS + PRICE 横並び */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: Math.round(w*0.018),
        marginTop: Math.round(h*0.006),
      }}>
        {/* 住所 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: xs, color: labelColor, fontFamily: FONT_EN, fontWeight: 700, letterSpacing: '0.14em', lineHeight: 1, marginBottom: 3 }}>
            ADDRESS
          </div>
          <div style={{
            fontSize: Math.round(w*0.024), color: valueColor,
            fontFamily: FONT_JA,
            textShadow: '0 1px 6px rgba(0,0,0,0.97)',
            lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {card.address}
          </div>
        </div>

        {/* 価格 */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: xs, color: labelColor, fontFamily: FONT_EN, fontWeight: 700, letterSpacing: '0.14em', lineHeight: 1, marginBottom: 3 }}>
            PRICE
          </div>
          <div style={{
            fontSize: sm, color: valueColor,
            fontFamily: FONT_JA,
            textShadow: '0 1px 6px rgba(0,0,0,0.97)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
          }}>
            {card.priceRange}
          </div>
        </div>
      </div>

      {/* フッター */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: Math.round(h*0.008),
        paddingTop: Math.round(h*0.006),
        borderTop: '1px solid rgba(200,155,35,0.18)',
      }}>
        <span style={{ fontSize: xs, color:'rgba(175,138,50,0.42)', fontWeight:700, letterSpacing:'0.10em', fontFamily:FONT_EN }}>©NAGOTOSHA 2025</span>
        {isNew && (
          <span style={{ fontSize: xs, fontWeight:900, letterSpacing:'0.14em', color:'#fff', background:'linear-gradient(135deg,#e63946,#c2112a)', borderRadius:100, padding:`2px ${Math.round(w*0.022)}px` }}>NEW</span>
        )}
        <span style={{ fontSize: xs, color:'rgba(175,138,50,0.42)', fontWeight:700, letterSpacing:'0.10em', fontFamily:FONT_EN }}>UR · NGY-010</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   4隅の角装飾
══════════════════════════════════════════════════════════════ */
function CornerOrn({ pos, w, fw }: { pos:'tl'|'tr'|'bl'|'br'; w:number; h:number; fw:number }) {
  const off  = fw + Math.round(w * 0.030);
  const sz   = Math.round(w * 0.068);
  const isT  = pos.startsWith('t');
  const isL  = pos.endsWith('l');
  const lw   = '1.2px';
  const col  = 'rgba(200,155,35,0.50)';
  const dSz  = Math.round(w * 0.014);

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
        background: 'rgba(200,155,35,0.68)',
        transform: 'rotate(45deg)',
        boxShadow: `0 0 ${Math.round(dSz*0.8)}px rgba(200,155,35,0.50)`,
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
        rgba(200,155,35,0.58) ${Math.round(w*0.12)}px,
        rgba(200,155,35,0.58) calc(100% - ${Math.round(w*0.12)}px),
        transparent)`,
      ...style,
    }} />
  );
}
