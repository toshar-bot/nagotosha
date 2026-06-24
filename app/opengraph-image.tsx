import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'なごとしゃ';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Noto Sans JP (weight 900) を Google Fonts から取得してSatoriに渡す
  // Edge runtime では fetch が使えるため、リクエスト時に動的取得する
  type FontEntry = { name: string; data: ArrayBuffer; weight: 900; style: 'normal' };
  let fonts: FontEntry[] = [];

  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } },
    ).then(r => r.text());

    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (match?.[1]) {
      const data = await fetch(match[1]).then(r => r.arrayBuffer());
      fonts = [{ name: 'NotoSansJP', data, weight: 900, style: 'normal' }];
    }
  } catch {
    // フォント取得失敗時はSatoriのデフォルトfallbackで描画
  }

  const jp = fonts.length ? 'NotoSansJP, sans-serif' : 'sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #eef6ff 0%, #d8ecf8 55%, #b8d8f0 100%)',
        }}
      >
        {/* 右側 装飾円 */}
        <div style={{
          position: 'absolute',
          right: -130,
          top: 315 - 260,
          width: 520,
          height: 520,
          borderRadius: '50%',
          border: '1.5px solid rgba(10,154,154,0.12)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          right: -90,
          top: 315 - 200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          border: '1.5px solid rgba(10,154,154,0.08)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          right: -55,
          top: 315 - 140,
          width: 280,
          height: 280,
          borderRadius: '50%',
          border: '1.5px solid rgba(10,154,154,0.06)',
          display: 'flex',
        }} />

        {/* 左 縦アクセントバー */}
        <div style={{
          position: 'absolute',
          left: 80,
          top: 190,
          width: 7,
          height: 250,
          borderRadius: 4,
          background: '#0a9a9a',
          display: 'flex',
        }} />

        {/* コンテンツエリア */}
        <div style={{
          position: 'absolute',
          left: 116,
          top: 190,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* サイト名 */}
          <div style={{
            fontSize: 100,
            fontWeight: 900,
            color: '#0a2438',
            fontFamily: jp,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            display: 'flex',
          }}>
            なごとしゃ
          </div>

          {/* 区切り線 */}
          <div style={{
            width: 580,
            height: 2,
            background: 'rgba(29,91,115,0.14)',
            marginTop: 16,
            marginBottom: 20,
            display: 'flex',
          }} />

          {/* サブコピー */}
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#416b7d',
            fontFamily: jp,
            lineHeight: 1.4,
            display: 'flex',
          }}>
            名古屋のグルメ・イベント・おでかけ情報
          </div>

          {/* 英語ラベル */}
          <div style={{
            marginTop: 18,
            fontSize: 17,
            fontWeight: 400,
            color: '#8aa5b0',
            letterSpacing: '3px',
            fontFamily: 'sans-serif',
            display: 'flex',
          }}>
            Nagoya Local Guide
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length ? fonts : undefined,
    },
  );
}
