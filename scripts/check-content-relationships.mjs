import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const sourcePath = path.join(root, 'lib', 'content-relationships.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
  },
  fileName: sourcePath,
});

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nagotosha-relationship-check-'));
const modulePath = path.join(tempDir, 'content-relationships.mjs');
fs.writeFileSync(modulePath, transpiled.outputText, 'utf8');

const mod = await import(pathToFileURL(modulePath).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertResolution(postId, expected) {
  const result = mod.resolveContentRelationship(postId);
  assert(result.relationship === expected.relationship, `Post ${postId} relationship must be ${expected.relationship}`);
  assert(
    result.displayableOnRedesignedSurfaces === expected.displayable,
    `Post ${postId} displayable must be ${expected.displayable}`,
  );
  if ('displayLabel' in expected) {
    assert(result.displayLabel === expected.displayLabel, `Post ${postId} label must be ${expected.displayLabel}`);
  }
  return result;
}

for (const postId of [214, 182, 178, 173, 159, 137]) {
  const editorial = assertResolution(postId, { relationship: 'editorial', displayable: true, displayLabel: undefined });
  assert(!editorial.commercialDisclosure, `Post ${postId} must not have inferred commercialDisclosure`);
}

const owned = assertResolution(205, { relationship: 'owned', displayable: true, displayLabel: '運営関係' });
assert(owned.relationshipExplanation === 'なごとしゃ運営者と関係のある店舗を紹介する記事です。', 'Post 205 explanation must match');
assert(!owned.commercialDisclosure, 'Post 205 must not have inferred commercialDisclosure');
assert(owned.displayLabel !== 'PR・提供情報', 'Post 205 must not receive PR label');

const records = mod.listContentRelationshipRegistryRecords();
const editorialCount = records.filter((record) => record.relationship === 'editorial').length;
const ownedCount = records.filter((record) => record.relationship === 'owned').length;
const prCount = records.filter((record) => record.relationship === 'pr').length;
const unknownCount = [214, 205, 182, 178, 173, 159, 137]
  .map((postId) => mod.resolveContentRelationship(postId))
  .filter((result) => result.relationship === 'unknown').length;
const displayableCount = [214, 205, 182, 178, 173, 159, 137]
  .map((postId) => mod.resolveContentRelationship(postId))
  .filter((result) => result.displayableOnRedesignedSurfaces).length;
assert(editorialCount === 6, 'Registry must contain six confirmed editorial records');
assert(ownedCount === 1, 'Registry must contain one confirmed owned record');
assert(prCount === 0, 'Registry must not contain inferred PR records');
assert(unknownCount === 0, 'All seven target posts must be confirmed');
assert(displayableCount === 7, 'All seven target posts must be displayable');

const editorial = mod.validateContentRelationshipRecord({ postId: 1, relationship: 'editorial' });
assert(editorial.length === 0, 'Editorial content without commercial disclosure must be valid');

const editorialWithDisclosure = mod.validateContentRelationshipRecord({
  postId: 1,
  relationship: 'editorial',
  commercialDisclosure: {
    paid: false,
    productProvided: false,
    invited: false,
    productionRequested: false,
    verifiedAt: '2026-07-18',
  },
});
assert(editorialWithDisclosure.some((error) => error.includes('must not include')), 'Editorial disclosure must be rejected');

const completePr = mod.resolveContentRelationship({
  postId: 2,
  relationship: 'pr',
  commercialDisclosure: {
    sponsorName: 'Example Sponsor',
    paid: true,
    productProvided: false,
    invited: false,
    productionRequested: false,
    verifiedAt: '2026-07-18',
  },
});
assert(completePr.displayableOnRedesignedSurfaces === true, 'Complete PR content must be displayable');
assert(completePr.displayLabel === 'PR・提供情報', 'PR label must be PR・提供情報');

const missingPrDisclosure = mod.validateContentRelationshipRecord({ postId: 3, relationship: 'pr' });
assert(missingPrDisclosure.some((error) => error.includes('requires commercialDisclosure')), 'PR without disclosure must be rejected');

const missingPrVerifiedAt = mod.validateContentRelationshipRecord({
  postId: 4,
  relationship: 'pr',
  commercialDisclosure: {
    sponsorName: 'Example Sponsor',
    paid: true,
    productProvided: false,
    invited: false,
    productionRequested: false,
    verifiedAt: '',
  },
});
assert(missingPrVerifiedAt.some((error) => error.includes('verifiedAt')), 'PR without verifiedAt must be rejected');

const missingOwnedExplanation = mod.validateContentRelationshipRecord({ postId: 5, relationship: 'owned' });
assert(missingOwnedExplanation.some((error) => error.includes('relationshipExplanation')), 'Owned without explanation must be rejected');

const noFallback = mod.resolveContentRelationship({ id: 'wp-999', title: '通常記事に見える記事' });
assert(noFallback.relationship === 'unknown', 'Missing data must not fall back to editorial');
assert(noFallback.displayableOnRedesignedSurfaces === false, 'Missing data must be excluded');

fs.rmSync(tempDir, { recursive: true, force: true });
console.log('content relationship checks passed');

