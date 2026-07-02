#!/usr/bin/env node
import {
  buildEditUrl,
  buildPostPayload,
  fail,
  loadDraft,
  parseArgs,
  printDryRun,
  resolveCategories,
  resolveTags,
  validateRuntimeEnv,
  wpRequest,
  writeState,
} from './wp-lib.mjs';

const { postJsonPath, dryRun } = parseArgs(process.argv);
const env = validateRuntimeEnv({ dryRun });
if (!env.ok) process.exit(env.exitCode);

const draft = await loadDraft(postJsonPath);

if (dryRun) {
  const operation = draft.state?.postId ? 'would-check-state-before-update' : 'would-check-slug-before-create';
  const payload = buildPostPayload({
    post: draft.post,
    content: draft.content,
    categoryIds: draft.post.categories.map((name) => `dry-run:${name}`),
  });
  printDryRun({ mode: 'submit-draft', operation, post: draft.post, payload, state: draft.state });
  process.exit(0);
}

let operation = 'create';
let postId = draft.state?.postId;

if (postId) {
  const remote = await wpRequest(env, `/posts/${postId}?status=any`);
  if (remote?.status !== 'draft') {
    fail('Stored post is not a draft. Manual confirmation is required.', 'Open WordPress admin and verify the post before running this script again.');
  }
  operation = 'update';
} else {
  const matches = await wpRequest(env, `/posts?slug=${encodeURIComponent(draft.post.slug)}&status=any`);
  if (Array.isArray(matches) && matches.length > 0) {
    fail('Existing post with the same slug was found without local state.', 'Review the WordPress post manually. This script will not update posts without .wp-state.json.');
  }
}

const categoryIds = await resolveCategories(env, draft.post.categories);
const tagIds = await resolveTags(env, draft.post.tags);
const payload = buildPostPayload({ post: draft.post, content: draft.content, categoryIds, tagIds });
const endpoint = operation === 'update' ? `/posts/${postId}` : '/posts';
const saved = await wpRequest(env, endpoint, {
  method: 'POST',
  body: JSON.stringify(payload),
});

postId = saved.id;
const editUrl = buildEditUrl(env.apiBase, postId);
await writeState(draft.statePath, {
  ...draft.state,
  postId,
  slug: draft.post.slug,
  lastRun: new Date().toISOString(),
  editUrl,
});

console.log(`WordPress draft ${operation} complete.`);
console.log(`Post ID: ${postId}`);
console.log(`Status: ${saved.status}`);
console.log(`Edit URL: ${editUrl}`);
console.log('Next: preview the draft in WordPress admin. Publish only from the WordPress admin screen.');
