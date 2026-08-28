import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const typescript = require('typescript');
const originalResolveFilename = Module._resolveFilename;
const originalTsExtension = Module._extensions['.ts'];

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    return originalResolveFilename.call(this, path.join(root, request.slice(2)), parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

Module._extensions['.ts'] = function compileTypeScript(module, filename) {
  const output = typescript.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      target: typescript.ScriptTarget.ES2020,
      module: typescript.ModuleKind.CommonJS,
      jsx: typescript.JsxEmit.ReactJSX,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildFormal(candidate, id) {
  return {
    ...candidate,
    id,
    name: `Formal ${id}`,
    selection: {
      ...candidate.selection,
      area: 'sakae',
      supportedPartyTypes: ['solo'],
      supportedPurposes: ['light'],
      price: { kind: 'fixed', amount: 800, label: '¥800（fixture）' },
    },
  };
}

try {
  const fixture = require(path.join(root, 'data/external-candidate-pool/osm-nagoya-fixture.json'));
  const { GOOGLE_PLACES_CONTRACT_FIXTURE } = require(
    path.join(root, 'data/external-candidate-pool/google-places-contract-fixture.ts'),
  );
  const {
    adaptExternalCandidatePoolRecord,
    excludeExternalDuplicates,
    getExternalPreviewDecisionV3Candidates,
    getOsmExternalCandidatePool,
  } = require(path.join(root, 'lib/external-candidate-pool.ts'));
  const { mapGooglePlaceToExternalRecord } = require(path.join(root, 'lib/google-places-provider.ts'));
  const { getActiveFormalDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-formal-adapter.ts'));
  const { getDecisionV3CandidatesForSource } = require(path.join(root, 'lib/decision-v3-candidate-lookup.ts'));
  const { selectDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-selector.ts'));
  const {
    createInitialDecisionV3State,
    decisionV3Reducer,
    normalizeDecisionV3RestoredState,
  } = require(path.join(root, 'lib/decision-v3-state.ts'));

  const allFixtureCandidates = Object.values(fixture.areas).flat();
  assert(fixture.schemaVersion === 1, 'OSM fixture schema must be v1');
  assert(fixture.attribution.label === '© OpenStreetMap contributors', 'OSM attribution must be explicit');
  for (const area of ['meieki', 'sakae', 'osu']) {
    assert(fixture.areas[area].length >= 50, `${area} must contain at least 50 OSM candidates`);
  }
  assert(
    new Set(allFixtureCandidates.map((candidate) => candidate.externalId)).size === allFixtureCandidates.length,
    'OSM fixture external IDs must be globally unique',
  );
  assert(
    allFixtureCandidates.every((candidate) => candidate.provider === 'openstreetmap' && candidate.providerEntityId),
    'OSM fixture provider fields must remain isolated',
  );

  const catalog = getOsmExternalCandidatePool();
  assert(catalog.length === 150, 'runtime fixture must cap the catalog at 50 records per area');
  const adaptedOsm = adaptExternalCandidatePoolRecord(catalog[0]);
  assert(adaptedOsm?.provenance?.kind === 'external-catalog-osm', 'OSM presentation must retain source type');
  assert(adaptedOsm?.actions.length === 0, 'OSM website/phone tags must not create verified actions');

  const googleRecord = mapGooglePlaceToExternalRecord(
    'sakae',
    GOOGLE_PLACES_CONTRACT_FIXTURE.places[0],
    new Date('2026-08-28T00:00:00.000Z'),
  );
  const adaptedGoogle = googleRecord && adaptExternalCandidatePoolRecord(googleRecord);
  assert(googleRecord?.provider === 'google-places', 'Google contract fixture must map to Google provider');
  assert(adaptedGoogle?.provenance?.kind === 'external-live-google', 'Google presentation must retain source type');
  assert(adaptedGoogle?.actions.length === 0, 'Google website/phone must not become verified actions');

  const activeFormal = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: '2026-08-28',
    evaluatedAt: '2026-08-28T12:00:00.000Z',
  });
  assert(activeFormal.length === 9, 'formal active registry must remain nine candidates');
  const formal = [buildFormal(activeFormal[0], 'formal-a'), buildFormal(activeFormal[1], 'formal-b')];
  const knownExternal = adaptExternalCandidatePoolRecord({
    ...catalog.find((candidate) => candidate.area === 'sakae'),
    externalId: 'osm-known-price-fixture',
    name: 'External known-price fixture',
    businessStatus: 'operational',
    budgetState: 'known',
    openingState: 'current',
    price: { minimum: 600, maximum: 900, label: '¥600〜¥900（fixture）' },
    verifiedFields: ['businessStatus', 'price'],
    unknownFields: ['party', 'mood', 'officialAction', 'phoneAction'],
  });
  assert(knownExternal, 'known external fixture must adapt');

  const conditions = { party: 'solo', budget: 'under1000', mood: 'light', area: 'sakae' };
  const filled = selectDecisionV3Candidates({
    conditions,
    preferences: [],
    candidates: [...formal, knownExternal],
  });
  assert(
    filled.kind === 'matched' && filled.candidateIds.join(',') === 'formal-a,formal-b,osm-known-price-fixture',
    'external candidate must fill only the third slot after formal matches',
  );
  assert(
    filled.kind === 'matched' && filled.reasonsByCandidateId['osm-known-price-fixture'].includes('人数／気分の適性は未確認'),
    'external reason must disclose unknown party/mood suitability',
  );

  const strictUnknown = selectDecisionV3Candidates({
    conditions,
    preferences: [],
    candidates: [adaptedOsm],
  });
  assert(
    strictUnknown.kind !== 'matched' || strictUnknown.candidateIds.length === 0,
    'strict budget must not include external unknown prices',
  );
  assert(
    adaptExternalCandidatePoolRecord({ ...catalog[0], externalId: 'osm-closed-fixture', businessStatus: 'closed' }) === null,
    'closed external candidates must be excluded before presentation',
  );
  assert(
    excludeExternalDuplicates(formal, [{ ...knownExternal, id: 'osm-duplicate', name: formal[0].name }]).length === 0,
    'formal identity must win over an external duplicate',
  );

  let state = createInitialDecisionV3State();
  for (const [group, value] of Object.entries(conditions)) {
    state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
  }
  state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: [...formal, knownExternal] });
  state = decisionV3Reducer(state, { type: 'GO', step: 'detail', detailId: 'osm-known-price-fixture' });
  const restored = normalizeDecisionV3RestoredState(state, 'external-preview', [...formal, knownExternal]);
  assert(
    restored.step === 'detail' && restored.detailId === 'osm-known-price-fixture',
    'valid external Detail state must survive reload normalization',
  );
  const stale = normalizeDecisionV3RestoredState(
    { ...state, detailId: 'demo-a', compareIds: ['demo-a'], compareOrder: ['demo-a'] },
    'external-preview',
    [...formal, knownExternal],
  );
  assert(stale.step === 'candidates' && stale.detailId === null && stale.compareIds.length === 0, 'stale demo IDs must not restore into external preview');

  const previewCandidates = getDecisionV3CandidatesForSource('external-preview', new Date('2026-08-28T12:00:00.000Z'));
  assert(previewCandidates.some((candidate) => candidate.provenance?.kind === 'external-catalog-osm'), 'external preview must contain OSM records');
  assert(!previewCandidates.some((candidate) => candidate.id.startsWith('demo-')), 'external preview must not contain demo candidates');
  assert(previewCandidates.length > 9, 'external preview must retain formal plus external pool');

  const previewPage = fs.readFileSync(path.join(root, 'app/decision-functional-preview-v3/page.tsx'), 'utf8');
  assert(previewPage.includes('EXTERNAL_CANDIDATE_POOL_PREVIEW_FLAG'), 'external pool must be feature-flagged');
  assert(previewPage.includes("demoAllowed") && previewPage.includes("'formal'"), 'Production path must remain formal');
  const appSource = fs.readFileSync(path.join(root, 'components/decision-v3/DecisionV3App.tsx'), 'utf8');
  assert(appSource.includes('provider_entity_id'), 'external GA4 parameters must retain provider entity identifier');

  console.log('D1 external-candidate-pool fixture: PASS');
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
}
