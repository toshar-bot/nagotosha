#!/usr/bin/env node
import { createReadStream, existsSync } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, resolve } from 'node:path';

const REQUIRED_ENV = ['WORDPRESS_API_BASE', 'WORDPRESS_USERNAME', 'WORDPRESS_APP_PASSWORD'];
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const REQUEST_TIMEOUT_MS = 30000;

const KNOWN_META = {
  'new-open-haera-prtimes.png': {
    title: 'HAERA',
    alt_text: 'HAERAの施設構成と周辺アクセスのイメージ',
    caption: '画像出典: J.フロント リテイリング株式会社 / PR TIMES',
  },
  'new-open-pasta-mania-tsurumai-prtimes.jpg': {
    title: 'PASTA MANIA 鶴舞店',
    alt_text: 'PASTA MANIA 鶴舞店のイメージ',
    caption: '画像出典: 株式会社PASTAMANIA / PR TIMES',
  },
  'new-open-vanillage-matsuzakaya-prtimes.png': {
    title: 'バニラージュ 松坂屋名古屋店',
    alt_text: 'バニラージュ 松坂屋名古屋店のブランドイメージ',
    caption: '画像出典: 若尾製菓株式会社 / PR TIMES',
  },
  'new-open-kappasushi-minato-prtimes.jpg': {
    title: 'かっぱ寿司 名古屋みなと店',
    alt_text: 'かっぱ寿司 名古屋みなと店のオープン記念商品のイメージ',
    caption: '画像出典: カッパ・クリエイト株式会社 / PR TIMES',
  },
  'new-open-pierre-marcolini-haera.jpg': {
    title: 'PIERRE MARCOLINI HAERA店',
    alt_text: 'PIERRE MARCOLINI HAERA店の店舗イメージ',
    caption: '画像出典: HAERA公式',
  },
  'new-open-starbucks-reserve-haera.jpg': {
    title: 'スターバックス リザーブ カフェ HAERA',
    alt_text: 'スターバックス リザーブ カフェ HAERAの店舗イメージ',
    caption: '画像出典: HAERA公式',
  },
};

function usage() {
  console.log('Usage: node scripts/wp-upload-media.mjs <image-directory>');
  console.log('Uploads jpg/jpeg/png/webp files in the directory to WordPress media.');
  console.log('Warning: duplicate uploads are not checked. Re-running may create duplicate media items.');
}

function validateRuntimeEnv() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    console.log('WordPress media upload was not run.');
    console.log(`Missing environment variables: ${missing.join(', ')}`);
    console.log('No request was sent.');
    return null;
  }

  return {
    apiBase: process.env.WORDPRESS_API_BASE.trim().replace(/\/+$/, ''),
    username: process.env.WORDPRESS_USERNAME.trim(),
    appPassword: process.env.WORDPRESS_APP_PASSWORD.trim(),
  };
}

function buildAuthHeader(env) {
  return `Basic ${Buffer.from(`${env.username}:${env.appPassword}`).toString('base64')}`;
}

function mimeTypeForExt(ext) {
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

function defaultTitleFor(filename) {
  return basename(filename, extname(filename))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function wpFetch(env, path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.apiBase}${path}`, {
      ...options,
      headers: {
        Authorization: buildAuthHeader(env),
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });
    const text = await response.text();
    const data = safeJson(text);
    if (!response.ok) {
      const wpCode = data?.code ? ` (${data.code})` : '';
      throw new Error(`WordPress request failed: HTTP ${response.status}${wpCode}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()))
    .map((entry) => ({
      filename: entry.name,
      path: join(directory, entry.name),
      ext: extname(entry.name).toLowerCase(),
      meta: KNOWN_META[entry.name] ?? {
        title: defaultTitleFor(entry.name),
        alt_text: defaultTitleFor(entry.name),
        caption: '',
      },
    }))
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

async function readFileBytes(filePath) {
  const chunks = [];
  for await (const chunk of createReadStream(filePath)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function uploadMedia(env, item) {
  const form = new FormData();
  form.append('file', new Blob([await readFileBytes(item.path)], { type: mimeTypeForExt(item.ext) }), item.filename);

  const media = await wpFetch(env, '/media', {
    method: 'POST',
    body: form,
  });

  const updated = await wpFetch(env, `/media/${media.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item.meta),
  });

  return {
    filename: item.filename,
    id: updated.id ?? media.id,
    source_url: updated.source_url ?? media.source_url,
    title: item.meta.title,
    alt_text: item.meta.alt_text,
    caption: item.meta.caption,
  };
}

const inputDir = process.argv[2];
if (!inputDir) {
  usage();
  process.exit(0);
}

const directory = isAbsolute(inputDir) ? inputDir : resolve(inputDir);
if (!existsSync(directory)) {
  console.log(`Image directory not found: ${directory}`);
  process.exit(1);
}

const env = validateRuntimeEnv();
if (!env) process.exit(0);

const images = await collectImages(directory);
if (images.length === 0) {
  console.log(`No image files found in: ${directory}`);
  process.exit(0);
}

console.log(`Uploading ${images.length} image(s) to WordPress media.`);
console.log('Warning: duplicate uploads are not checked. Re-running may create duplicate media items.');

const results = [];
for (const image of images) {
  const result = await uploadMedia(env, image);
  results.push(result);
  console.log(`${result.filename}: ${result.source_url}`);
}

const outputPath = join(directory, 'uploaded-media.json');
await writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');
console.log(`Saved: ${outputPath}`);
