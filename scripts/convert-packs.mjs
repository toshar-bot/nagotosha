import sharp from 'sharp';
import { readdir } from 'fs/promises';
import path from 'path';

const dir = 'public/packs';
const files = (await readdir(dir)).filter(f => f.endsWith('.png'));

for (const file of files) {
  const input = path.join(dir, file);
  const output = path.join(dir, file.replace('.png', '.webp'));

  const info = await sharp(input)
    .resize(540, null, { withoutEnlargement: true }) // 表示幅の2倍(2x対応)
    .webp({ quality: 88, effort: 6 })
    .toFile(output);

  console.log(`${file} → ${file.replace('.png', '.webp')} (${Math.round(info.size / 1024)}KB)`);
}
