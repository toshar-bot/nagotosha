import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
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

function conditions(party, budget, mood, area) {
  return { party, budget, mood, area };
}

try {
  const fixture = require(path.join(root, 'data/external-candidate-pool/osm-nagoya-fixture.json'));
  const { GOOGLE_PLACES_CONTRACT_FIXTURE } = require(
    path.join(root, 'data/external-candidate-pool/google-places-contract-fixture.ts'),
  );
  const { GOOGLE_PLACES_NEARBY_REQUEST_BODY_FIXTURE } = require(
    path.join(root, 'data/external-candidate-pool/google-places-nearby-request-body-fixture.ts'),
  );
  const {
    adaptExternalCandidatePoolRecord,
    dedupeExternalCandidates,
    getExternalPreviewDecisionV3Candidates,
    getOsmExternalCandidatePool,
    shouldRequestGoogleForArea,
  } = require(path.join(root, 'lib/external-candidate-pool.ts'));
  const {
    GOOGLE_PRODUCTION_READY,
    isGooglePlacesExternalArea,
    isGooglePlacesPreviewProviderEnabled,
    shouldGrantGooglePlacesRequest,
  } = require(path.join(root, 'lib/google-places-policy.ts'));
  const { GOOGLE_PLACES_NEARBY_FIELD_MASK } = require(
    path.join(root, 'types/external-candidate-pool.ts'),
  );
  const { mapGooglePlaceToExternalRecord } = require(
    path.join(root, 'lib/google-places-provider.ts'),
  );
  const { getDecisionV3ExternalProviderActions } = require(
    path.join(root, 'lib/decision-v3-external-actions.ts'),
  );
  const { getActiveFormalDecisionV3Candidates } = require(
    path.join(root, 'lib/decision-v3-formal-adapter.ts'),
  );
  const { selectDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-selector.ts'));
  const { sanitizeDecisionAnalyticsPayload } = require(path.join(root, 'lib/analytics.ts'));

  const areas = ['meieki', 'sakae', 'osu'];
  assert(fixture.schemaVersion === 1, 'OSM fixture schema must be v1');
  assert(fixture.attribution.label === '© OpenStreetMap contributors', 'OSM attribution must be explicit');
  for (const area of areas) {
    assert(fixture.areas[area].length >= 50, area + ' must include at least 50 normalized OSM records');
  }
  const rawOsm = getOsmExternalCandidatePool();
  assert(rawOsm.length === 150, 'runtime OSM pool must cap to exactly 50 records per area');
  assert(new Set(rawOsm.map((record) => record.externalId)).size === rawOsm.length,
    'OSM external IDs must be globally unique');
  assert(rawOsm.every((record) => record.provider === 'openstreetmap' && record.providerEntityId),
    'OSM records must retain isolated provider identity');

  const adaptedOsm = adaptExternalCandidatePoolRecord(rawOsm[0]);
  assert(adaptedOsm?.actions.length === 0, 'OSM fields must not become verified formal actions');
  assert(getDecisionV3ExternalProviderActions(adaptedOsm).every((action) => action.href),
    'external action DOM needs an explicit safe href');

  const statusOverclaimWords = ['現在営業中', '今開いている', 'すぐ入れる', '予約可能'];
  const assertStatusCopy = (candidate, label) => {
    const reason = candidate?.provenance?.reason ?? '';
    assert(statusOverclaimWords.every((word) => !reason.includes(word)),
      `${label} status reason must not overclaim current opening`);
    assert(reason.includes('現在の開店状況は未確認'),
      `${label} status reason must explicitly limit current opening claims`);
  };

  const googleOperational = mapGooglePlaceToExternalRecord(
    'sakae',
    { ...GOOGLE_PLACES_CONTRACT_FIXTURE.places[0], businessStatus: 'OPERATIONAL' },
    new Date('2026-08-30T00:00:00.000Z'),
  );
  assertStatusCopy(adaptExternalCandidatePoolRecord(googleOperational), 'Google OPERATIONAL');

  const osmOperational = { ...rawOsm[0], businessStatus: 'operational', openingState: 'provider-reported' };
  assertStatusCopy(adaptExternalCandidatePoolRecord(osmOperational), 'OSM operational');

  const providerReported = adaptExternalCandidatePoolRecord({
    ...rawOsm[0], businessStatus: 'unknown', openingState: 'provider-reported',
  });
  assertStatusCopy(providerReported, 'provider-reported opening');

  const unknownStatus = adaptExternalCandidatePoolRecord({
    ...rawOsm[0], businessStatus: 'unknown', openingState: 'unknown',
  });
  assert(unknownStatus?.provenance?.reason.includes('営業状態は未確認'),
    'unknown status copy must remain explicit');

  const closed = adaptExternalCandidatePoolRecord({ ...rawOsm[0], businessStatus: 'closed' });
  assert(closed === null, 'closed external candidates must remain excluded');

  const googleRecord = mapGooglePlaceToExternalRecord(
    'sakae',
    GOOGLE_PLACES_CONTRACT_FIXTURE.places[0],
    new Date('2026-08-30T00:00:00.000Z'),
  );
  assert(googleRecord?.budgetState === 'known', 'valid JPY Google range must be known');
  assert(googleRecord?.price?.minimum === 600 && googleRecord?.price?.maximum === 900,
    'Google JPY range boundaries must be preserved');
  assert(mapGooglePlaceToExternalRecord('sakae', {
    ...GOOGLE_PLACES_CONTRACT_FIXTURE.places[0],
    priceRange: { startPrice: { currencyCode: 'USD', units: '600' }, endPrice: { currencyCode: 'USD', units: '900' } },
  }, new Date())?.budgetState === 'unknown', 'currency mismatch must remain budget unknown');
  assert(mapGooglePlaceToExternalRecord('sakae', {
    ...GOOGLE_PLACES_CONTRACT_FIXTURE.places[0],
    priceRange: { startPrice: { currencyCode: 'JPY', units: '600' } },
  }, new Date())?.budgetState === 'unknown', 'missing upper price bound must remain budget unknown');
  assert(mapGooglePlaceToExternalRecord('sakae', {
    ...GOOGLE_PLACES_CONTRACT_FIXTURE.places[0],
    priceRange: undefined,
    priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
  }, new Date())?.budgetState === 'unknown', 'priceLevel must never infer a yen range');
  const adaptedGoogle = adaptExternalCandidatePoolRecord(googleRecord);
  const strictBudget = selectDecisionV3Candidates({
    conditions: conditions('solo', 'under1000', 'light', 'sakae'),
    preferences: [],
    candidates: adaptedGoogle ? [adaptedGoogle] : [],
  });
  assert(strictBudget.kind === 'matched' && strictBudget.candidateIds.length === 1,
    'known Google JPY range must participate in strict budget fallback');

  assert(GOOGLE_PRODUCTION_READY === false, 'Production Google readiness must remain hard-off');
  assert(!isGooglePlacesPreviewProviderEnabled({
    NODE_ENV: 'production',
    EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED: 'true',
    GOOGLE_PLACES_PROVIDER_ENABLED: 'true',
    GOOGLE_PLACES_PREVIEW_ENABLED: 'true',
  }), 'Production must never enable Google even with flags');
  assert(!isGooglePlacesPreviewProviderEnabled({ NODE_ENV: 'development' }),
    'unknown flags must fail closed');
  const previewEnvironment = {
    NODE_ENV: 'development',
    EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED: 'true',
    GOOGLE_PLACES_PROVIDER_ENABLED: 'true',
    GOOGLE_PLACES_PREVIEW_ENABLED: 'true',
  };
  assert(isGooglePlacesExternalArea('meieki') && !isGooglePlacesExternalArea('any'),
    'Google gate must accept only supported explicit areas');
  assert(shouldGrantGooglePlacesRequest({
    environment: previewEnvironment, externalAreaRequested: true, sessionRequestAlreadyUsed: false,
  }), 'one explicit Preview request may be granted');
  assert(!shouldGrantGooglePlacesRequest({
    environment: previewEnvironment, externalAreaRequested: true, sessionRequestAlreadyUsed: true,
  }), 'a second session request must be denied');
  assert(shouldRequestGoogleForArea('meieki', true), 'valid granted area may request Google once');
  assert(!shouldRequestGoogleForArea(null, true), 'no external area must keep Google off');
  assert(GOOGLE_PLACES_NEARBY_REQUEST_BODY_FIXTURE.includedTypes.includes('fast_food_restaurant')
    && !GOOGLE_PLACES_NEARBY_REQUEST_BODY_FIXTURE.includedTypes.includes('fast_food'),
  'Nearby request must use the valid fast_food_restaurant type');
  assert(GOOGLE_PLACES_NEARBY_REQUEST_BODY_FIXTURE.locationRestriction.circle.center
    && GOOGLE_PLACES_NEARBY_REQUEST_BODY_FIXTURE.locationRestriction.circle.radius === 1_000,
  'Nearby request must use normalized center and sibling radius');
  assert(GOOGLE_PLACES_NEARBY_FIELD_MASK.every((field) => field.startsWith('places.')),
    'Google field mask must stay explicit and scoped');

  const sameBrand = (id, name, url) => ({
    ...adaptedGoogle,
    id,
    name,
    provenance: {
      ...adaptedGoogle.provenance,
      providerEntityId: id,
      providerActions: [{ kind: 'website', label: '提供元サイト', href: url }],
      linkedProviderEntities: [{ provider: 'google-places', providerEntityId: id }],
      duplicateStatus: 'distinct',
    },
  });
  const komedaOne = sameBrand('google-komeda-meieki', 'コメダ珈琲店 名古屋駅西店', 'https://komeda.example/meieki');
  const komedaTwo = sameBrand('google-komeda-kamimaezu', 'コメダ珈琲店 上前津店', 'https://komeda.example/kamimaezu');
  const sugakiyaOne = sameBrand('google-sugakiya-meieki', 'スガキヤ 名古屋駅エスカ店', 'https://sugakiya.example/meieki');
  const sugakiyaTwo = sameBrand('google-sugakiya-osu', 'スガキヤ 大須店', 'https://sugakiya.example/osu');
  const sameBrandResult = dedupeExternalCandidates([], [komedaOne, komedaTwo, sugakiyaOne, sugakiyaTwo]);
  assert(sameBrandResult.candidates.length === 4, 'same-brand domains must not merge separate branches');
  assert(sameBrandResult.summary.unresolved === 2, 'same brand domains must be surfaced as unresolved');
  const exactDuplicate = dedupeExternalCandidates([], [komedaOne, { ...komedaOne }]);
  assert(exactDuplicate.candidates.length === 1 && exactDuplicate.summary.merged === 1,
    'exact provider IDs must merge');

  const formal = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: '2026-08-30',
    evaluatedAt: '2026-08-30T00:00:00.000Z',
  });
  assert(formal.length === 9, 'production-equivalent formal registry must stay at nine active candidates');
  const external = getExternalPreviewDecisionV3Candidates(new Date('2026-08-30T00:00:00.000Z'));
  assert(
    external.some((candidate) => candidate.provenance?.kind === 'external-catalog-osm'),
    'Preview pool must retain normalized OSM fallback after exact duplicate removal',
  );

  const choices = {
    party: ['solo', 'pair', 'family', 'group'],
    budget: ['under1000', 'under2000', 'under4000', 'any'],
    mood: ['hearty', 'light', 'relax', 'new-experience'],
    area: ['sakae', 'meieki', 'osu', 'any'],
  };
  const report = {
    formal: { matched: 0, no_match: 0, data_unavailable: 0, counts: [0, 0, 0, 0] },
    external: { matched: 0, no_match: 0, data_unavailable: 0, counts: [0, 0, 0, 0], filled: 0, externalOnly: 0 },
  };
  for (const party of choices.party) for (const budget of choices.budget) for (const mood of choices.mood) for (const area of choices.area) {
    const input = { conditions: conditions(party, budget, mood, area), preferences: [] };
    const formalResult = selectDecisionV3Candidates({ ...input, candidates: formal });
    const externalResult = selectDecisionV3Candidates({ ...input, candidates: external });
    for (const [key, result] of [['formal', formalResult], ['external', externalResult]]) {
      if (result.kind === 'matched') {
        report[key].matched += 1;
        report[key].counts[result.candidateIds.length] += 1;
      } else {
        report[key][result.kind.replace('-', '_')] += 1;
        report[key].counts[0] += 1;
      }
    }
    if (externalResult.kind === 'matched') {
      const externalIds = externalResult.candidateIds.filter((id) => id.startsWith('osm-') || id.startsWith('google-'));
      if (externalIds.length > 0) {
        report.external.filled += 1;
        if (formalResult.kind !== 'matched') report.external.externalOnly += 1;
        for (const id of externalIds) {
          assert(externalResult.reasonsByCandidateId[id].includes('人数／気分の適性は未確認'),
            'external party/mood must never be represented as a complete match');
        }
      }
    }
  }
  assert(report.formal.matched + report.formal.no_match + report.formal.data_unavailable === 256,
    'formal condition matrix must cover exactly 256 combinations');
  assert(report.external.matched + report.external.no_match + report.external.data_unavailable === 256,
    'external condition matrix must cover exactly 256 combinations');

  const allowed = sanitizeDecisionAnalyticsPayload('map_click', {
    store_id: 'google-contract-fixture',
    candidate_source: 'google',
    provider_entity_id: 'forbidden',
    placeId: 'forbidden',
    url: 'https://forbidden.invalid',
    phone: '+810000000000',
    address: 'forbidden',
    latitude: 35,
  });
  assert(JSON.stringify(allowed) === JSON.stringify({
    store_id: 'google-contract-fixture',
    candidate_source: 'google',
  }), 'analytics allow-list must strip provider, URL, phone, address, and coordinates');

  console.log(JSON.stringify({
    status: 'PASS',
    osmPerArea: Object.fromEntries(areas.map((area) => [area, fixture.areas[area].length])),
    formalCount: formal.length,
    externalCandidateCount: external.length,
    matrix: report,
    liveGoogleRequests: 0,
    rawProviderResponsesStored: 0,
  }, null, 2));
} finally {
  Module._resolveFilename = originalResolveFilename;
  Module._extensions['.ts'] = originalTsExtension;
}
