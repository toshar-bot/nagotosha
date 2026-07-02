import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, resolve } from 'node:path';

const REQUIRED_ENV = ['WORDPRESS_API_BASE', 'WORDPRESS_USERNAME', 'WORDPRESS_APP_PASSWORD'];
const RETRYABLE_STATUSES = new Set([500, 502, 503, 504]);
const REQUEST_TIMEOUT_MS = 15000;

export function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const args = argv.filter((arg) => arg !== '--dry-run');
  return { postJsonPath: args[2], dryRun };
}

export function validateRuntimeEnv({ dryRun }) {
  if (dryRun) return { ok: true, dryRun: true };

  const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    console.log('WordPress draft was not submitted.');
    console.log(`Missing environment variables: ${missing.join(', ')}`);
    console.log('Set them locally before running the real submission, for example:');
    console.log('$env:WORDPRESS_API_BASE="https://example.com/wp-json/wp/v2"');
    console.log('$env:WORDPRESS_USERNAME="your-wordpress-username"');
    console.log('$env:WORDPRESS_APP_PASSWORD="your-wordpress-application-password"');
    console.log('No request was sent.');
    return { ok: false, exitCode: 0 };
  }

  return {
    ok: true,
    apiBase: process.env.WORDPRESS_API_BASE.trim().replace(/\/+$/, ''),
    username: process.env.WORDPRESS_USERNAME.trim(),
    appPassword: process.env.WORDPRESS_APP_PASSWORD.trim(),
  };
}

export async function loadDraft(postJsonPath) {
  if (!postJsonPath) {
    fail('Missing post.json path.', 'Run: node scripts/wp/submit-draft.mjs <post.json> [--dry-run]');
  }

  const resolvedPostPath = resolve(postJsonPath);
  if (!existsSync(resolvedPostPath)) {
    fail(`post.json not found: ${resolvedPostPath}`, 'Check the path and run the command again.');
  }

  let post;
  try {
    post = JSON.parse(await readFile(resolvedPostPath, 'utf8'));
  } catch {
    fail('post.json is not valid JSON.', 'Fix the JSON syntax and run the command again.');
  }

  validatePostSchema(post);

  const draftDir = dirname(resolvedPostPath);
  const bodyPath = resolveRelative(draftDir, post.bodyFile);
  if (!existsSync(bodyPath)) {
    fail(`bodyFile not found: ${post.bodyFile}`, 'Place the approved HTML file next to post.json.');
  }

  const content = await readFile(bodyPath, 'utf8');
  const statePath = join(draftDir, '.wp-state.json');
  const state = await readState(statePath);

  return {
    post,
    content,
    draftDir,
    postJsonPath: resolvedPostPath,
    bodyPath,
    statePath,
    state,
  };
}

export function validatePostSchema(post) {
  const required = ['slug', 'title', 'excerpt', 'bodyFile', 'categories', 'tags'];
  const missing = required.filter((key) => post[key] == null || post[key] === '');
  if (missing.length > 0) {
    fail(`post.json is missing required fields: ${missing.join(', ')}`, 'Add the missing fields and run again.');
  }

  if (Object.hasOwn(post, 'status')) {
    fail('post.json must not contain a status field.', 'Remove the status field. The script always submits drafts.');
  }

  if (!Array.isArray(post.categories) || post.categories.length === 0) {
    fail('post.json categories must be a non-empty array.', 'Add at least one category name.');
  }

  if (!Array.isArray(post.tags)) {
    fail('post.json tags must be an array.', 'Use an empty array or tag names.');
  }
}

export async function readState(statePath) {
  if (!existsSync(statePath)) return {};

  try {
    return JSON.parse(await readFile(statePath, 'utf8'));
  } catch {
    fail('.wp-state.json is not valid JSON.', 'Fix or remove the local state file after manual review.');
  }
}

export async function writeState(statePath, state) {
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

export function resolveRelative(baseDir, filePath) {
  return isAbsolute(filePath) ? filePath : join(baseDir, filePath);
}

export function buildEditUrl(apiBase, postId) {
  return `${siteBaseFromApi(apiBase)}/wp-admin/post.php?post=${postId}&action=edit`;
}

export function siteBaseFromApi(apiBase) {
  return apiBase.replace(/\/wp-json\/wp\/v2\/?$/, '').replace(/\/+$/, '');
}

export function buildPostPayload({ post, content, categoryIds, tagIds = post.tags }) {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content,
    categories: categoryIds,
    tags: tagIds,
    meta: post.meta ?? {},
    status: 'draft',
  };
}

export function buildAuthHeader(env) {
  return `Basic ${Buffer.from(`${env.username}:${env.appPassword}`).toString('base64')}`;
}

export async function wpRequest(env, path, options = {}) {
  const url = `${env.apiBase}${path}`;
  const method = options.method ?? 'GET';
  const headers = {
    Authorization: buildAuthHeader(env),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers ?? {}),
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const text = await response.text();
      const data = safeJson(text);

      if (response.ok) return data;

      const wpCode = data?.code ? ` (${data.code})` : '';
      if (attempt === 0 && RETRYABLE_STATUSES.has(response.status)) continue;
      fail(`WordPress request failed: HTTP ${response.status}${wpCode}`, 'Review the post in WordPress or retry after checking permissions.');
    } catch (error) {
      clearTimeout(timeout);
      if (attempt === 0) continue;
      const reason = error?.name === 'AbortError' ? 'request timed out' : 'request failed';
      fail(`WordPress ${reason}.`, 'Check network access and run again.');
    }
  }
}

export async function resolveCategories(env, names) {
  const ids = [];
  const missing = [];
  const candidates = [];

  for (const name of names) {
    const results = await wpRequest(env, `/categories?search=${encodeURIComponent(name)}&per_page=20`);
    const exact = Array.isArray(results) ? results.find((item) => item.name === name) : null;
    if (exact) {
      ids.push(exact.id);
    } else {
      missing.push(name);
      for (const item of Array.isArray(results) ? results.slice(0, 5) : []) {
        candidates.push(`${item.id}: ${item.name}`);
      }
    }
  }

  if (missing.length > 0) {
    fail(`Missing WordPress categories: ${missing.join(', ')}`, candidates.length > 0 ? `Existing candidates: ${candidates.join(', ')}` : 'Create the categories manually in WordPress, then run again.');
  }

  return ids;
}

export async function resolveTags(env, names) {
  const ids = [];

  for (const name of names) {
    const results = await wpRequest(env, `/tags?search=${encodeURIComponent(name)}&per_page=20`);
    const exact = Array.isArray(results) ? results.find((item) => item.name === name) : null;
    if (exact) {
      ids.push(exact.id);
      continue;
    }

    const created = await wpRequest(env, '/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    ids.push(created.id);
  }

  return ids;
}

export function printDryRun({ mode, operation, post, payload, state, eyecatch }) {
  const printable = {
    mode,
    operation,
    slug: post.slug,
    title: post.title,
    categories: post.categories,
    tags: post.tags,
    state: {
      hasState: Boolean(state?.postId),
      postId: state?.postId ?? null,
      mediaId: state?.mediaId ?? null,
    },
    payload,
    eyecatch,
  };
  console.log(JSON.stringify(printable, null, 2));
  console.log('Dry run only. No WordPress request was sent.');
}

export function validateEyecatch(post, draftDir) {
  if (!post.eyecatch?.file) {
    fail('post.json eyecatch.file is missing.', 'Add eyecatch.file or skip the upload script.');
  }

  const filePath = resolveRelative(draftDir, post.eyecatch.file);
  if (!existsSync(filePath)) {
    fail(`Eyecatch file not found: ${post.eyecatch.file}`, 'Place the image file in the draft folder and run again.');
  }

  const ext = extname(filePath).slice(1).toLowerCase();
  const allowed = new Set(['png', 'jpg', 'jpeg', 'webp']);
  if (!allowed.has(ext)) {
    fail(`Unsupported eyecatch extension: ${ext}`, 'Use png, jpg, jpeg, or webp.');
  }

  return {
    filePath,
    ext,
    filename: post.eyecatch.filename || `${post.slug}-eyecatch.${ext}`,
    alt: post.eyecatch.alt ?? '',
    title: post.eyecatch.title ?? post.title,
  };
}

export function mimeTypeForExt(ext) {
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

function safeJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export function fail(reason, next) {
  console.error(reason);
  if (next) console.error(`Next: ${next}`);
  process.exit(1);
}
