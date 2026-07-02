#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import {
  fail,
  loadDraft,
  mimeTypeForExt,
  parseArgs,
  printDryRun,
  validateEyecatch,
  validateRuntimeEnv,
  wpRequest,
  writeState,
} from './wp-lib.mjs';

const { postJsonPath, dryRun } = parseArgs(process.argv);
const env = validateRuntimeEnv({ dryRun });
if (!env.ok) process.exit(env.exitCode);

const draft = await loadDraft(postJsonPath);

if (!draft.state?.postId) {
  fail('No postId found in .wp-state.json.', 'Run submit-draft first, then upload the eyecatch.');
}

const eyecatch = validateEyecatch(draft.post, draft.draftDir);

if (dryRun) {
  printDryRun({
    mode: 'upload-eyecatch',
    operation: draft.state?.mediaId ? 'would-reuse-media-and-set-featured-media' : 'would-upload-media-and-set-featured-media',
    post: draft.post,
    payload: {
      postId: draft.state.postId,
      mediaId: draft.state.mediaId ?? null,
      filename: eyecatch.filename,
      alt_text: eyecatch.alt,
      title: eyecatch.title,
    },
    state: draft.state,
    eyecatch: {
      file: draft.post.eyecatch.file,
      filename: eyecatch.filename,
      extension: eyecatch.ext,
    },
  });
  process.exit(0);
}

const remote = await wpRequest(env, `/posts/${draft.state.postId}?status=any`);
if (remote?.status !== 'draft') {
  fail('Stored post is not a draft. Eyecatch was not changed.', 'Open WordPress admin and verify the post before running this script again.');
}

let mediaId = draft.state.mediaId;
if (!mediaId) {
  const bytes = await readFile(eyecatch.filePath);
  const media = await wpRequest(env, '/media', {
    method: 'POST',
    headers: {
      'Content-Disposition': `attachment; filename="${eyecatch.filename}"`,
      'Content-Type': mimeTypeForExt(eyecatch.ext),
    },
    body: bytes,
  });
  mediaId = media.id;

  await wpRequest(env, `/media/${mediaId}`, {
    method: 'POST',
    body: JSON.stringify({
      alt_text: eyecatch.alt,
      title: eyecatch.title,
    }),
  });
}

await wpRequest(env, `/posts/${draft.state.postId}`, {
  method: 'POST',
  body: JSON.stringify({ featured_media: mediaId }),
});

await writeState(draft.statePath, {
  ...draft.state,
  mediaId,
  lastRun: new Date().toISOString(),
});

console.log('Eyecatch set on WordPress draft.');
console.log(`Post ID: ${draft.state.postId}`);
console.log(`Media ID: ${mediaId}`);
console.log('Status was left unchanged.');
