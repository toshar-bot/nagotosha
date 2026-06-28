import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_ENV = [
  'WORDPRESS_API_BASE',
  'WORDPRESS_USERNAME',
  'WORDPRESS_APP_PASSWORD',
];

const TEXT = {
  title: '\u3010TEST\u3011\u306a\u3054\u3068\u3057\u3083\u6295\u7a3f\u9023\u643a\u30c6\u30b9\u30c8',
  excerpt: '\u306a\u3054\u3068\u3057\u3083\u306eWordPress\u6295\u7a3f\u9023\u643a\u3068\u8a18\u4e8b\u8868\u793a\u3092\u78ba\u8a8d\u3059\u308b\u305f\u3081\u306e\u30c6\u30b9\u30c8\u8a18\u4e8b\u3067\u3059\u3002',
  area: '\u4e2d\u533a\u30fb\u6804',
  tag: '\u30ab\u30d5\u30a7',
  mapLabel: 'Google\u30de\u30c3\u30d7\u3067\u898b\u308b',
};

const ALLOWED_STATUSES = new Set(['draft', 'publish']);
const isDryRun = process.argv.includes('--dry-run');

const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
if (missing.length > 0) {
  console.log('WordPress test post was not created.');
  console.log(`Missing environment variables: ${missing.join(', ')}`);
  console.log('Set the variables locally, then run this script again.');
  process.exit(0);
}

const apiBase = process.env.WORDPRESS_API_BASE.trim().replace(/\/+$/, '');
const username = process.env.WORDPRESS_USERNAME.trim();
const appPassword = process.env.WORDPRESS_APP_PASSWORD.trim();
const requestedStatus = process.env.WORDPRESS_TEST_POST_STATUS?.trim() || 'draft';

if (!ALLOWED_STATUSES.has(requestedStatus)) {
  console.error('WordPress test post was not created.');
  console.error('WORDPRESS_TEST_POST_STATUS must be either "draft" or "publish".');
  process.exit(1);
}

const mapUrl = 'https://www.google.com/maps/search/?api=1&query=%E5%90%8D%E5%8F%A4%E5%B1%8B+%E6%A0%84+%E3%82%AB%E3%83%95%E3%82%A7';
const logoDataUri = getLogoDataUri();

const testPost = {
  title: TEXT.title,
  slug: `nagotosha-test-post-${Date.now()}`,
  status: requestedStatus,
  content: buildTestPostContent(mapUrl, logoDataUri),
  excerpt: TEXT.excerpt,
  meta: {
    area: TEXT.area,
    tag: TEXT.tag,
    category: TEXT.tag,
    mapUrl,
  },
};

if (isDryRun) {
  console.log('Dry run only. WordPress test post was not created.');
  console.log(`Endpoint: ${apiBase}/posts`);
  console.log(`Status: ${testPost.status}`);
  console.log(`Title: ${testPost.title}`);
  console.log(`Slug: ${testPost.slug}`);
  console.log('Meta keys: area, tag, category, mapUrl');
  process.exit(0);
}

const credentials = Buffer.from(`${username}:${appPassword}`).toString('base64');

const response = await fetch(`${apiBase}/posts`, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${credentials}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPost),
});

const responseText = await response.text();
let data;
try {
  data = JSON.parse(responseText);
} catch {
  data = null;
}

if (!response.ok) {
  console.error('WordPress test post was not created.');
  console.error(`Status: ${response.status}`);
  console.error(data?.message || 'WordPress returned a non-JSON or empty error response.');
  process.exit(1);
}

console.log('WordPress test post created.');
console.log(`Post ID: ${data.id}`);
console.log(`Status: ${data.status}`);
console.log(`URL: ${data.link}`);

function getLogoDataUri() {
  const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
  const logoPath = join(rootDir, 'public', 'subjects', 'nagotosha-header-complete.png');
  if (!existsSync(logoPath)) return '';
  const bytes = readFileSync(logoPath);
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

function renderLogoBlock(logoDataUri) {
  if (!logoDataUri) return '';
  return `
  <div style="margin:0 0 22px;padding:12px 0 16px;border-bottom:1px solid #E6ECF5;text-align:left;">
    <img src="${logoDataUri}" alt="\u306a\u3054\u3068\u3057\u3083 \u540d\u53e4\u5c4b\u60c5\u5831\u5c40 \u30c8\u30fc\u30b7\u30e3\u30fc" style="display:block;width:100%;max-width:430px;height:auto;margin:0;object-fit:contain;">
  </div>`;
}

function buildTestPostContent(mapUrl, logoDataUri) {
  const sectionTitleStyle = 'margin:0 0 12px;color:#071A4D;font-size:22px;line-height:1.45;font-weight:900;';
  const bodyStyle = 'margin:0;color:#334155;font-size:16px;line-height:1.9;font-weight:500;';
  const cardStyle = 'margin:22px 0;padding:18px;border:1px solid #E6ECF5;border-radius:18px;background:#FFFFFF;box-shadow:0 8px 24px rgba(7,26,77,0.06);';
  const labelStyle = 'margin:0 0 6px;color:#E8483F;font-size:12px;font-weight:900;letter-spacing:0.16em;';

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue','Yu Gothic',YuGothic,sans-serif;color:#0F172A;line-height:1.9;font-size:16px;background:#FFFFFF;">
  ${renderLogoBlock(logoDataUri)}
  <section style="margin:0 0 24px;padding:18px 0 2px;">
    <p style="margin:0 0 12px;color:#E8483F;font-size:12px;font-weight:900;letter-spacing:0.16em;">NAGOTOSHA ARTICLE</p>
    <p style="margin:0;color:#334155;font-size:16px;line-height:1.9;font-weight:600;">
      \u3053\u308c\u306f\u3001\u306a\u3054\u3068\u3057\u3083\u306eWordPress\u6295\u7a3f\u9023\u643a\u3068\u8a18\u4e8b\u8868\u793a\u3092\u78ba\u8a8d\u3059\u308b\u305f\u3081\u306e\u30c6\u30b9\u30c8\u8a18\u4e8b\u3067\u3059\u3002\u8868\u793a\u78ba\u8a8d\u5f8c\u3001\u524a\u9664\u307e\u305f\u306f\u4e0b\u66f8\u304d\u3078\u623b\u3057\u307e\u3059\u3002
    </p>
  </section>

  <section style="${cardStyle};border-left:5px solid #E8483F;">
    <p style="${labelStyle}">POINT</p>
    <h2 style="${sectionTitleStyle}">\u3053\u306e\u8a18\u4e8b\u306e\u30dd\u30a4\u30f3\u30c8</h2>
    <ul style="margin:0;padding-left:20px;color:#334155;font-size:15px;line-height:1.9;font-weight:600;">
      <li>WordPress\u304b\u3089\u3001\u306a\u3054\u3068\u3057\u3083\u306e\u65b0\u7740\u8a18\u4e8b\u4e00\u89a7\u3078\u8868\u793a\u3067\u304d\u308b\u304b\u78ba\u8a8d\u3057\u307e\u3059\u3002</li>
      <li>\u30bf\u30a4\u30c8\u30eb\u3001\u8aac\u660e\u6587\u3001\u30a8\u30ea\u30a2\u3001\u30bf\u30b0\u3001\u5730\u56f3\u5c0e\u7dda\u306e\u8868\u793a\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002</li>
      <li>\u672c\u8a18\u4e8b\u306f\u30c6\u30b9\u30c8\u7528\u3067\u3059\u3002\u5b9f\u5e97\u8217\u306e\u6b63\u5f0f\u306a\u7d39\u4ecb\u8a18\u4e8b\u3067\u306f\u3042\u308a\u307e\u305b\u3093\u3002</li>
    </ul>
  </section>

  <section style="${cardStyle}">
    <p style="${labelStyle}">STORY</p>
    <h2 style="${sectionTitleStyle}">\u3069\u3093\u306a\u8a71\u984c\uff1f</h2>
    <p style="${bodyStyle}">
      \u540d\u53e4\u5c4b\u30fb\u6804\u30a8\u30ea\u30a2\u306b\u3042\u308b\u30ab\u30d5\u30a7\u3092\u60f3\u5b9a\u3057\u305f\u3001\u8868\u793a\u78ba\u8a8d\u7528\u306e\u30b5\u30f3\u30d7\u30eb\u8a18\u4e8b\u3067\u3059\u3002\u304a\u5e97\u306e\u96f0\u56f2\u6c17\u3001\u884c\u304d\u305f\u304f\u306a\u308b\u7406\u7531\u3001\u5730\u56f3\u5c0e\u7dda\u307e\u3067\u3092\u4e00\u3064\u306e\u8a18\u4e8b\u3068\u3057\u3066\u81ea\u7136\u306b\u898b\u305b\u3089\u308c\u308b\u304b\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002
    </p>
  </section>

  <section style="${cardStyle}">
    <p style="${labelStyle}">CHECK</p>
    <h2 style="${sectionTitleStyle}">\u6ce8\u76ee\u30dd\u30a4\u30f3\u30c8</h2>
    <div style="display:grid;gap:12px;">
      <div style="padding:15px;border-radius:16px;background:#FFF7F7;border:1px solid #F8C9C6;">
        <p style="margin:0;color:#E8483F;font-size:13px;font-weight:900;">POINT 01</p>
        <p style="margin:6px 0 0;color:#334155;font-size:14px;line-height:1.8;font-weight:600;">\u30b9\u30de\u30db\u3067\u8aad\u307f\u3084\u3059\u3044\u672c\u6587\u69cb\u6210\u3068\u3001\u306a\u3054\u3068\u3057\u3083\u3089\u3057\u3044\u8d64\u30fb\u7d3a\u306e\u30c8\u30fc\u30f3\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002</p>
      </div>
      <div style="padding:15px;border-radius:16px;background:#FFF7F7;border:1px solid #F8C9C6;">
        <p style="margin:0;color:#E8483F;font-size:13px;font-weight:900;">POINT 02</p>
        <p style="margin:6px 0 0;color:#334155;font-size:14px;line-height:1.8;font-weight:600;">\u8a18\u4e8b\u4e00\u89a7\u304b\u3089WordPress\u8a18\u4e8b\u30da\u30fc\u30b8\u3078\u9077\u79fb\u3067\u304d\u308b\u304b\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002</p>
      </div>
    </div>
  </section>

  <section style="${cardStyle};background:#FFF0F0;border-color:#F8C9C6;">
    <p style="${labelStyle}">RECOMMEND</p>
    <h2 style="${sectionTitleStyle}">\u3053\u3093\u306a\u4eba\u306b\u304a\u3059\u3059\u3081</h2>
    <p style="${bodyStyle}">
      \u65b0\u3057\u3044\u304a\u5e97\u3092\u63a2\u3057\u3066\u3044\u308b\u4eba\u3001\u6804\u5468\u8fba\u3067\u30ab\u30d5\u30a7\u3092\u63a2\u3057\u305f\u3044\u4eba\u3001\u6c17\u306b\u306a\u308b\u8a18\u4e8b\u3092\u4fdd\u5b58\u3057\u3066\u3042\u3068\u304b\u3089\u898b\u8fd4\u3057\u305f\u3044\u4eba\u306b\u5411\u3051\u305f\u8a18\u4e8b\u8868\u793a\u3092\u60f3\u5b9a\u3057\u3066\u3044\u307e\u3059\u3002
    </p>
  </section>

  <section style="${cardStyle}">
    <p style="${labelStyle}">MAP</p>
    <h2 style="${sectionTitleStyle}">\u5730\u56f3\u30fb\u30a2\u30af\u30bb\u30b9\u5c0e\u7dda</h2>
    <p style="${bodyStyle}">
      \u5b9f\u5e97\u8217\u8a18\u4e8b\u3067\u306f\u3001\u8a18\u4e8b\u3092\u8aad\u3093\u3060\u3042\u3068\u306b\u305d\u306e\u307e\u307e\u5730\u56f3\u3067\u5834\u6240\u3092\u78ba\u8a8d\u3067\u304d\u308b\u5c0e\u7dda\u3092\u7528\u610f\u3057\u307e\u3059\u3002
    </p>
    <p style="margin:18px 0 0;">
      <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;padding:15px 20px;border-radius:999px;background:#E8483F;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:900;box-shadow:0 10px 22px rgba(232,72,63,.24);">
        ${TEXT.mapLabel}
      </a>
    </p>
  </section>

  <section style="${cardStyle}">
    <p style="${labelStyle}">SUMMARY</p>
    <h2 style="${sectionTitleStyle}">\u307e\u3068\u3081</h2>
    <p style="${bodyStyle}">
      \u3053\u306e\u30c6\u30b9\u30c8\u8a18\u4e8b\u3067\u306f\u3001WordPress\u6295\u7a3f\u304b\u3089\u3001\u306a\u3054\u3068\u3057\u3083\u306e\u8a18\u4e8b\u4e00\u89a7\u30fb\u8a18\u4e8b\u672c\u6587\u30fb\u5730\u56f3\u5c0e\u7dda\u307e\u3067\u306e\u6d41\u308c\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002\u8868\u793a\u78ba\u8a8d\u5f8c\u3001\u3053\u306e\u8a18\u4e8b\u306f\u524a\u9664\u307e\u305f\u306f\u4e0b\u66f8\u304d\u3078\u623b\u3057\u307e\u3059\u3002
    </p>
  </section>
</div>
`;
}
