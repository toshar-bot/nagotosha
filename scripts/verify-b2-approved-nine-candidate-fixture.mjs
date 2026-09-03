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
const AS_OF_DATE = '2026-08-26';
const AS_OF_INSTANT = '2026-08-26T12:00:00Z';

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
    },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

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
  const { FORMAL_DECISION_V3_DEFINITIONS, getActiveFormalDecisionV3Candidates } = require(
    path.join(root, 'lib/decision-v3-formal-adapter.ts'),
  );
  const { getDecisionV3CandidatesForSource } = require(path.join(root, 'lib/decision-v3-candidate-lookup.ts'));
  const { getEligibleDecisionCandidates } = require(path.join(root, 'lib/decision-eligibility.ts'));
  const { getProductionReadyCandidates } = require(path.join(root, 'lib/decision-release-readiness.ts'));
  const { selectDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-selector.ts'));
  const {
    createInitialDecisionV3State,
    decisionV3Reducer,
    normalizeDecisionV3RestoredState,
  } = require(path.join(root, 'lib/decision-v3-state.ts'));

  const B2_IDS = [
    'meieki-sugakiya-nagoya-eki-esca',
    'meieki-komeda-nagoya-eki-nishi',
    'sakae-sutadon-nagoya-sakae',
    'sakae-cafe-laduree-lachic',
    'osu-cocoichi-naka-ku-osu',
    'osu-komeda-kamimaezu',
  ];
  const expectedPrices = new Map([
    ['meieki-sugakiya-nagoya-eki-esca', '¥470〜¥790（名古屋駅エスカ店の単品ラーメン）'],
    ['meieki-komeda-nagoya-eki-nishi', '¥470〜¥1,400（名古屋駅西店のスナック単品）'],
    ['sakae-sutadon-nagoya-sakae', '¥890〜¥1,290（名古屋栄店適用の丼・定食・カレー・そば）'],
    ['sakae-cafe-laduree-lachic', '¥486〜¥702（名古屋ラシック店のオリジナルブレンドコーヒー）'],
    ['osu-cocoichi-naka-ku-osu', '¥556〜¥1,036（中区大須店のポークカレー150g〜600g）'],
    ['osu-komeda-kamimaezu', '¥490〜¥1,450（上前津店のスナック単品）'],
  ]);

  assert(DECISION_CANDIDATES.length === 9, 'active candidate registry must contain nine candidates');
  assert(new Set(DECISION_CANDIDATES.map((candidate) => candidate.id)).size === 9, 'candidate IDs must be unique');
  assert(B2_IDS.every((candidateId) => DECISION_CANDIDATES.some((candidate) => candidate.id === candidateId)), 'all six B2 candidates must be active');
  for (const area of ['meieki', 'sakae', 'osu']) {
    assert(
      DECISION_CANDIDATES.filter((candidate) => candidate.area === area).length === 3,
      `${area}: exactly three active candidates required`,
    );
  }
  for (const candidate of DECISION_CANDIDATES) {
    assert(candidate.relationshipTarget.kind === 'catalog' && candidate.relationshipTarget.relationship === 'editorial', `${candidate.id}: relationship must be editorial`);
    assert(candidate.visual.kind === 'none', `${candidate.id}: visual:none is required`);
    assert(candidate.actions.map((action) => action.type).sort().join(',') === 'map,official,phone', `${candidate.id}: verified maps, official, and phone actions required`);
    assert(candidate.actions.find((action) => action.type === 'map')?.url.includes('api=1'), `${candidate.id}: Maps must retain api=1`);
  }

  const eligibility = getEligibleDecisionCandidates(
    DECISION_CANDIDATES,
    DECISION_CANDIDATE_EVIDENCE,
    DECISION_CANDIDATE_FRESHNESS,
    AS_OF_DATE,
  );
  assert(eligibility.eligibility.every((entry) => entry.eligible), 'all nine candidates must pass freshness eligibility');
  const readiness = getProductionReadyCandidates({
    candidates: DECISION_CANDIDATES,
    eligibleSet: eligibility,
    artifacts: DECISION_VERIFICATION_ARTIFACTS,
    operatorReviews: DECISION_OPERATOR_REVIEWS,
    independentReviews: DECISION_INDEPENDENT_REVIEWS,
    holds: DECISION_VERIFICATION_HOLDS,
    evaluatedAsOf: AS_OF_INSTANT,
    editorialFastTrackContexts: FORMAL_DECISION_V3_DEFINITIONS.map((definition) => ({
      candidateId: definition.candidateId,
      area: definition.area,
      priceKind: definition.price.kind,
    })),
  });
  assert(readiness.readyCount === 9 && readiness.blockedCandidateCount === 0, 'production readiness must be 9 ready and 0 blocked');
  assert(readiness.readyCandidates.every((candidate) => candidate.productionUseApproved && candidate.verificationStage === 'production-verified'), 'every active candidate must be production-verified');

  const active = getActiveFormalDecisionV3Candidates({ evaluatedAsOf: AS_OF_DATE, evaluatedAt: AS_OF_INSTANT });
  assert(active.length === 9, 'formal adapter must expose all nine reviewed candidates');
  assert(active.every((candidate) => !candidate.id.startsWith('demo-')), 'formal active candidates must never include demos');
  const activeById = new Map(active.map((candidate) => [candidate.id, candidate]));
  for (const [candidateId, label] of expectedPrices) {
    const candidate = activeById.get(candidateId);
    assert(candidate?.budget === label && candidate.selection.price.label === label, `${candidateId}: bounded category price label changed`);
    assert(candidate.photo.availability === 'unregistered' && candidate.photo.rightsStatus === 'unverified', `${candidateId}: visual:none fallback contract changed`);
    assert(candidate.actions.map((action) => action.type).sort().join(',') === 'access,official,phone', `${candidateId}: presentation actions changed`);
  }

  for (const [candidateId, conditions] of [
    ['meieki-sugakiya-nagoya-eki-esca', { party: 'solo', budget: 'under1000', mood: 'light', area: 'meieki' }],
    ['meieki-komeda-nagoya-eki-nishi', { party: 'family', budget: 'under2000', mood: 'relax', area: 'meieki' }],
    ['sakae-sutadon-nagoya-sakae', { party: 'solo', budget: 'under2000', mood: 'hearty', area: 'sakae' }],
    ['sakae-cafe-laduree-lachic', { party: 'pair', budget: 'under1000', mood: 'relax', area: 'sakae' }],
    ['osu-cocoichi-naka-ku-osu', { party: 'solo', budget: 'under2000', mood: 'hearty', area: 'osu' }],
    ['osu-komeda-kamimaezu', { party: 'pair', budget: 'under2000', mood: 'relax', area: 'osu' }],
  ]) {
    const result = selectDecisionV3Candidates({ conditions, preferences: [], candidates: active });
    assert(result.kind === 'matched' && result.candidateIds.includes(candidateId), `${candidateId}: approved condition coverage failed`);
  }

  let state = createInitialDecisionV3State();
  for (const [group, value] of Object.entries({ party: 'solo', budget: 'any', mood: 'light', area: 'any' })) {
    state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
  }
  state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: active });
  assert(state.selectionResult?.kind === 'matched', 'Candidates state requires a match');
  const [firstId, secondId] = state.selectionResult.candidateIds;
  assert(firstId && secondId, 'compare fixture requires two matching active formal candidates');
  state = decisionV3Reducer(state, { type: 'GO', step: 'detail', detailId: firstId });
  state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: firstId });
  state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: secondId });
  state = decisionV3Reducer(state, { type: 'SET_COMPARE_ORDER', ids: [secondId, firstId] });
  state = decisionV3Reducer(state, { type: 'GO', step: 'compare' });
  state = decisionV3Reducer(state, { type: 'CHOOSE', candidateId: firstId });
  state = decisionV3Reducer(state, { type: 'GO', step: 'decided' });
  const restored = normalizeDecisionV3RestoredState(state, 'formal', active);
  assert(restored.step === 'decided' && restored.chosenId === firstId && restored.compareOrder.join(',') === `${secondId},${firstId}`, 'formal Detail, Compare, Decided, and reload state must persist');
  const stale = normalizeDecisionV3RestoredState({
    ...state,
    compareIds: ['demo-a', firstId, 'removed-formal-id'],
    compareOrder: ['demo-a', firstId, 'removed-formal-id'],
    chosenId: 'demo-a',
    detailId: 'demo-a',
  }, 'formal', active);
  assert(stale.step === 'candidates' && stale.compareIds.join(',') === firstId && stale.chosenId === null && stale.detailId === null, 'stale demo and removed IDs must not restore');
  assert(
    normalizeDecisionV3RestoredState(state, 'formal', []).selectionResult?.kind === 'data-unavailable',
    'empty or expired formal candidates must fail closed to data-unavailable',
  );

  assert(getDecisionV3CandidatesForSource('formal', new Date(AS_OF_INSTANT)).length === 9, 'production-equivalent formal lookup must return nine candidates');
  assert(getDecisionV3CandidatesForSource('demo', new Date(AS_OF_INSTANT)).length === 3, 'explicit Preview demo lookup must retain exactly three demos');
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

  assert(JSON.stringify(sanitizeDecisionAnalyticsPayload('compare_view', { compare_count: 2, source: 'candidates' }))
    === JSON.stringify({ compare_count: 2, source: 'candidates' }),
  'compare_view must preserve the comparison count and originating surface');

  console.log('B2 approved nine-candidate fixture: PASS');
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
}
