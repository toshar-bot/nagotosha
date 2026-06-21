// Canvas合成: 背景除去済みBlobをぷっくりシールに仕上げる

const BORDER_SIZE = 14;   // 白フチの太さ(px) ※元画像基準
const SHADOW_BLUR = 18;
const SHADOW_OFFSET_Y = 8;
const SHADOW_COLOR = 'rgba(0,0,0,0.38)';

export interface StickerDimensions {
  width: number;
  height: number;
}

function blobToImageBitmap(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob);
}

// 白フチ生成: shadowBlur法（速攻版）
// cutoutImgの周囲に白いシャドウを複数回重ねて厚みを出す
function drawWhiteBorder(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap,
  x: number,
  y: number,
  w: number,
  h: number,
  borderSize: number,
) {
  const steps = Math.ceil(borderSize / 3);
  for (let i = steps; i >= 1; i--) {
    ctx.save();
    ctx.shadowColor = 'white';
    ctx.shadowBlur = i * 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }
}

export async function compositeSticker(
  cutoutBlob: Blob,
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await blobToImageBitmap(cutoutBlob);
  const srcW = img.width;
  const srcH = img.height;

  // キャンバスサイズ = 元画像 + フチ + シャドウのマージン
  const margin = BORDER_SIZE + SHADOW_BLUR + SHADOW_OFFSET_Y + 4;
  const canvasW = srcW + margin * 2;
  const canvasH = srcH + margin * 2;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  const drawX = margin;
  const drawY = margin;

  // 1. ドロップシャドウ
  ctx.save();
  ctx.shadowColor = SHADOW_COLOR;
  ctx.shadowBlur = SHADOW_BLUR;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = SHADOW_OFFSET_Y;
  ctx.drawImage(img, drawX, drawY, srcW, srcH);
  ctx.restore();

  // 2. 白フチ（shadowBlur法）
  drawWhiteBorder(ctx, img, drawX, drawY, srcW, srcH, BORDER_SIZE);

  // 3. 本体（切り抜き画像）
  ctx.drawImage(img, drawX, drawY, srcW, srcH);

  // 4. ツヤオーバーレイ（左上から右下への白グラデ）
  const gradient = ctx.createLinearGradient(
    drawX, drawY,
    drawX + srcW * 0.6, drawY + srcH * 0.6,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.28)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.08)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  // 元画像領域にだけツヤを乗せる（既に描画された画素にのみ適用）
  ctx.globalCompositeOperation = 'source-over';
  // ツヤを本体の上に重ねる（フチには乗せない）
  ctx.drawImage(img, drawX, drawY, srcW, srcH);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = gradient;
  ctx.fillRect(drawX, drawY, srcW, srcH);
  ctx.restore();

  img.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) { reject(new Error('canvas.toBlob failed')); return; }
        resolve({ blob, width: canvasW, height: canvasH });
      },
      'image/png',
    );
  });
}

// 画像をリサイズ（最大辺を maxPx に収める）
export async function resizeImage(blob: Blob, maxPx = 800): Promise<Blob> {
  const img = await blobToImageBitmap(blob);
  const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
  img.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => { if (!b) { reject(new Error('resize failed')); return; } resolve(b); },
      'image/jpeg',
      0.88,
    );
  });
}
