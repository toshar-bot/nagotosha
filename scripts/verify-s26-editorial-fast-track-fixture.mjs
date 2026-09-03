import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originalResolveFilename = Module._resolveFilename;
const originalTsExtension = Module._extensions['.ts'];

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    return originalResolveFilename.call(this, path.join(root, request.slice(2)), parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

Module._extensions['.ts'] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const output = typescript.transpileModule(source, {
    compilerOptions: {
      target: typescript.ScriptTarget.ES2020,
      module: typescript.ModuleKind.CommonJS,
      jsx: typescript.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

const typescript = require('typescript');
const AS_OF_DATE = '2026-08-26';
const AS_OF_INSTANT = '2026-08-26T12:00:00Z';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const { DECISION_CANDIDATES } = require(path.join(root, 'data/decision-candidates.ts'));
  const { DECISION_CANDIDATE_EVIDENCE } = require(path.join(root, 'data/decision-candidate-evidence.ts'));
  const { DECISION_CANDIDATE_FRESHNESS } = require(path.join(root, 'data/decision-candidate-freshness.ts'));
  const {
    DECISION_INDEPENDENT_REVIEWS,
    DECISION_OPERATOR_REVIEWS,
    DECISION_VERIFICATION_ARTIFACTS,
    DECISION_VERIFICATION_HOLDS,
  } = require(path.join(root, 'data/decision-verification-records.ts'));
  const { INITIAL_FORMAL_DECISION_V3_DEFINITIONS } = require(path.join(root, 'data/decision-candidate-proposals.ts'));
  const { getEligibleDecisionCandidates } = require(path.join(root, 'lib/decision-eligibility.ts'));
  const { getProductionReadyCandidates } = require(path.join(root, 'lib/decision-release-readiness.ts'));
  const { getDecisionV3CandidatesForSource } = require(path.join(root, 'lib/decision-v3-candidate-lookup.ts'));
  const { getActiveFormalDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-formal-adapter.ts'));
  const { selectDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-selector.ts'));
  const {
    createInitialDecisionV3State,
    decisionV3Reducer,
    normalizeDecisionV3RestoredState,
  } = require(path.join(root, 'lib/decision-v3-state.ts'));

  const INITIAL_THREE_IDS = [
    'meieki-erick-south-kitte-nagoya',
    'sakae-potama-nagoya-haera',
    'osu-sugakiya-osu',
  ];
  const initialThree = DECISION_CANDIDATES.filter((candidate) => INITIAL_THREE_IDS.includes(candidate.id));
  const ids = initialThree.map((candidate) => candidate.id);
  assert(
    ids.join(',') === 'meieki-erick-south-kitte-nagoya,sakae-potama-nagoya-haera,osu-sugakiya-osu',
    'S2.6 may activate only the reviewed initial-three candidate ids',
  );
  assert(DECISION_INDEPENDENT_REVIEWS.length === 0, 'fast-track must not create independent review records');
  assert(DECISION_VERIFICATION_HOLDS.length === 0, 'reviewed candidates must have no active hold records');

  const contexts = INITIAL_FORMAL_DECISION_V3_DEFINITIONS.map((definition) => ({
    candidateId: definition.candidateId,
    area: definition.area,
    priceKind: definition.price.kind,
  }));
  const eligibleSet = getEligibleDecisionCandidates(
    initialThree,
    DECISION_CANDIDATE_EVIDENCE,
    DECISION_CANDIDATE_FRESHNESS,
    AS_OF_DATE,
  );
  assert(eligibleSet.eligibility.every((entry) => entry.eligible), 'all three must pass freshness eligibility');
  const readiness = getProductionReadyCandidates({
    candidates: initialThree,
    eligibleSet,
    artifacts: DECISION_VERIFICATION_ARTIFACTS,
    operatorReviews: DECISION_OPERATOR_REVIEWS,
    independentReviews: DECISION_INDEPENDENT_REVIEWS,
    holds: DECISION_VERIFICATION_HOLDS,
    evaluatedAsOf: AS_OF_INSTANT,
    editorialFastTrackContexts: contexts,
  });
  assert(readiness.readyCount === 3 && readiness.blockedCandidateCount === 0, 'three fast-track candidates must be production-ready');
  assert(
    readiness.readyCandidates.every((candidate) => (
      candidate.verificationStage === 'production-verified' && candidate.productionUseApproved === true
    )),
    'productionUseApproved must result from readiness evaluation',
  );

  const active = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: AS_OF_DATE,
    evaluatedAt: AS_OF_INSTANT,
  });
  assert(active.length === 9, 'formal runtime must adapt all nine reviewed production candidates');
  const initialActive = active.filter((candidate) => INITIAL_THREE_IDS.includes(candidate.id));
  assert(initialActive.length === 3, 'formal runtime must retain the initial-three regression set');
  for (const candidate of initialActive) {
    assert(candidate.photo.availability === 'unregistered', `${candidate.id}: visual:none must retain fallback`);
    assert(candidate.photo.rightsStatus === 'unverified', `${candidate.id}: fallback must not claim image rights`);
    assert(candidate.actions.map((action) => action.type).sort().join(',') === 'access,official,phone', `${candidate.id}: verified actions only`);
    assert(candidate.actions.find((action) => action.type === 'access')?.href.includes('api=1'), `${candidate.id}: Maps must retain api=1`);
  }

  const byId = new Map(active.map((candidate) => [candidate.id, candidate]));
  assert(byId.get('meieki-erick-south-kitte-nagoya')?.selection.price.maximum === 2350, 'Eric South price scope changed');
  assert(byId.get('sakae-potama-nagoya-haera')?.selection.price.minimum === 450, 'Potama price scope changed');
  assert(byId.get('osu-sugakiya-osu')?.selection.price.minimum === 290, 'Sugakiya price scope changed');

  for (const [area, id, mood] of [
    ['meieki', 'meieki-erick-south-kitte-nagoya', 'hearty'],
    ['sakae', 'sakae-potama-nagoya-haera', 'light'],
    ['osu', 'osu-sugakiya-osu', 'light'],
  ]) {
    const result = selectDecisionV3Candidates({
      conditions: { party: 'solo', budget: 'any', mood, area },
      preferences: [],
      candidates: initialActive,
    });
    assert(result.kind === 'matched' && result.candidateIds.includes(id), `${id}: formal area flow failed`);
  }

  let state = createInitialDecisionV3State();
  for (const [group, value] of Object.entries({ party: 'solo', budget: 'any', mood: 'light', area: 'any' })) {
    state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
  }
  state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: initialActive });
  assert(state.selectionResult?.kind === 'matched', 'Conditions to Candidates flow failed');
  state = decisionV3Reducer(state, { type: 'GO', step: 'detail', detailId: 'sakae-potama-nagoya-haera' });
  state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: 'sakae-potama-nagoya-haera' });
  state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: 'osu-sugakiya-osu' });
  state = decisionV3Reducer(state, { type: 'GO', step: 'compare' });
  state = decisionV3Reducer(state, { type: 'CHOOSE', candidateId: 'sakae-potama-nagoya-haera' });
  state = decisionV3Reducer(state, { type: 'GO', step: 'decided' });
  assert(state.chosenId === 'sakae-potama-nagoya-haera' && state.step === 'decided', 'Compare to Decided flow failed');
  const restored = normalizeDecisionV3RestoredState({
    ...state,
    compareIds: ['demo-a', 'demo-b'],
    compareOrder: ['demo-b', 'demo-a'],
    chosenId: 'demo-b',
    detailId: 'demo-b',
  }, 'formal', initialActive);
  assert(restored.compareIds.length === 0 && restored.chosenId === null && restored.detailId === null, 'formal restore revived demo state');

  assert(getDecisionV3CandidatesForSource('demo').length === 3, 'explicit preview demo source regressed');
  assert(getActiveFormalDecisionV3Candidates({ candidates: [], evaluatedAsOf: AS_OF_DATE, evaluatedAt: AS_OF_INSTANT }).length === 0, 'formal zero candidates must remain data-unavailable');
  assert(getActiveFormalDecisionV3Candidates({ evaluatedAsOf: '2026-10-01', evaluatedAt: '2026-10-01T00:00:00Z' }).length === 0, 'expired candidates must fail closed');

  const base = initialThree[0];
  const baseDefinition = INITIAL_FORMAL_DECISION_V3_DEFINITIONS[0];
  const readyCountFor = ({ candidate = base, freshness = DECISION_CANDIDATE_FRESHNESS, artifacts = DECISION_VERIFICATION_ARTIFACTS, operatorReviews = DECISION_OPERATOR_REVIEWS, holds = DECISION_VERIFICATION_HOLDS, priceKind = baseDefinition.price.kind }) => {
    const set = getEligibleDecisionCandidates([candidate], DECISION_CANDIDATE_EVIDENCE, freshness, AS_OF_DATE);
    return getProductionReadyCandidates({
      candidates: [candidate],
      eligibleSet: set,
      artifacts,
      operatorReviews,
      independentReviews: [],
      holds,
      evaluatedAsOf: AS_OF_INSTANT,
      editorialFastTrackContexts: [{ candidateId: candidate.id, area: baseDefinition.area, priceKind }],
    }).readyCount;
  };
  assert(readyCountFor({ candidate: { ...base, relationshipTarget: { ...base.relationshipTarget, relationship: 'pr' } } }) === 0, 'PR relationship must use standard fail-closed path');
  assert(readyCountFor({ candidate: { ...base, relationshipTarget: { ...base.relationshipTarget, relationship: 'unknown' } } }) === 0, 'unknown relationship must fail closed');
  assert(readyCountFor({ candidate: { ...base, visual: { kind: 'category', categoryKey: 'food', alt: 'fixture' } } }) === 0, 'photo/category visual must not use fast track');
  assert(readyCountFor({ priceKind: 'variable' }) === 0, 'variable price must not use fast track');
  assert(readyCountFor({ operatorReviews: [] }) === 0, 'missing operator review must fail closed');
  assert(readyCountFor({ artifacts: DECISION_VERIFICATION_ARTIFACTS.map((artifact) => (
    artifact.artifactId === 's26-erick-south-official-store' ? { ...artifact, sha256: 'invalid' } : artifact
  )) }) === 0, 'invalid artifact hash must fail closed');
  assert(readyCountFor({ freshness: DECISION_CANDIDATE_FRESHNESS.map((record) => (
    record.evidenceId === 's23-erick-south-hours'
      ? { ...record, reviewStatus: 'conflicting', conflicts: [{ importance: 'important', status: 'unresolved' }] }
      : record
  )) }) === 0, 'source conflict must fail closed');
  assert(readyCountFor({ holds: [{
    holdId: 'fixture-active-hold',
    candidateId: base.id,
    reason: 'evidence-missing',
    recordedAt: '2026-08-24T12:00:00Z',
    status: 'active',
    note: 'fixture',
  }] }) === 0, 'active hold must fail closed');

  const { sanitizeDecisionAnalyticsPayload } = require(path.join(root, 'lib/analytics.ts'));
  const formalCandidateId = active[0]?.id;
  assert(typeof formalCandidateId === 'string' && formalCandidateId.length > 0,
    'analytics regression fixture requires an actual active formal candidate ID');
  const formalAnalyticsCases = [
    ['candidate_detail_view', {
      store_id: formalCandidateId, source: 'candidates', candidate_source: 'formal-reviewed',
    }],
    ['store_decided', {
      store_id: formalCandidateId, compare_count: 2, party: 'solo', candidate_source: 'formal-reviewed',
    }],
    ...['map_click', 'official_click', 'phone_click'].map((eventName) => [eventName, {
      store_id: formalCandidateId, surface: 'detail', candidate_source: 'formal-reviewed',
    }]),
  ];
  for (const [eventName, parameters] of formalAnalyticsCases) {
    const expected = JSON.stringify(parameters);
    const payload = sanitizeDecisionAnalyticsPayload(eventName, { ...parameters });
    assert(Object.prototype.hasOwnProperty.call(payload, 'store_id')
      && payload.store_id === formalCandidateId
      && payload.candidate_source === 'formal-reviewed',
    `${eventName}: formal-reviewed store_id must remain present and unchanged`);
    assert(JSON.stringify(payload) === expected,
      `${eventName}: formal analytics must retain the complete allowed payload`);
  }

  const externalPrivateValue = 'synthetic-external-private-value';
  const prohibitedAliases = Object.fromEntries([
    'provider_entity_id', 'place_id', 'placeId', 'PlaceID', 'candidate_id', 'external_id',
    'provider_id', 'osm_id', 'hashed_id', 'token', 'url', 'phone', 'address',
    'latitude', 'longitude', 'coordinates', 'query', 'raw_response', 'api_key',
    'cookie', 'session_marker',
  ].map((key) => [key, externalPrivateValue]));
  for (const candidateSource of ['google', 'osm']) {
    for (const eventName of ['candidate_detail_view', 'store_decided', 'map_click', 'official_click', 'phone_click']) {
      for (const sourceFirst of [false, true]) {
        const parameters = sourceFirst
          ? { candidate_source: candidateSource, store_id: externalPrivateValue, ...prohibitedAliases }
          : { store_id: externalPrivateValue, ...prohibitedAliases, candidate_source: candidateSource };
        const payload = sanitizeDecisionAnalyticsPayload(eventName, parameters);
        assert(!Object.prototype.hasOwnProperty.call(payload, 'store_id'),
          `${eventName}: external store_id must be absent regardless of key order`);
        assert(JSON.stringify(payload) === JSON.stringify({ candidate_source: candidateSource })
          && !JSON.stringify(payload).includes(externalPrivateValue),
        `${eventName}: external analytics must retain only its coarse provider source`);
      }
    }
  }

  assert(JSON.stringify(sanitizeDecisionAnalyticsPayload('candidates_view', {
    party: 'solo', candidate_count: 2, result_status: 'matched',
  })) === JSON.stringify({ party: 'solo', candidate_count: 2, result_status: 'matched' }),
  'candidates_view must preserve party, candidate count, and match status');
  assert(JSON.stringify(sanitizeDecisionAnalyticsPayload('compare_view', { compare_count: 2, source: 'candidates' }))
    === JSON.stringify({ compare_count: 2, source: 'candidates' }),
  'compare_view must preserve the comparison count and originating surface');

  console.log('S2.6 editorial-fast-track fixture: PASS');
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
}
