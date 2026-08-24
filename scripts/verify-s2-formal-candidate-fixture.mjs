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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const { DECISION_CANDIDATES } = require(path.join(root, 'data/decision-candidates.ts'));
  const { DECISION_CANDIDATE_EVIDENCE } = require(path.join(root, 'data/decision-candidate-evidence.ts'));
  const { INITIAL_FORMAL_DECISION_V3_DEFINITIONS } = require(path.join(root, 'data/decision-candidate-proposals.ts'));
  const {
    adaptFormalDecisionV3Candidates,
    getActiveFormalDecisionV3Candidates,
  } = require(path.join(root, 'lib/decision-v3-formal-adapter.ts'));
  const { selectDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-selector.ts'));
  const {
    createInitialDecisionV3State,
    decisionV3Reducer,
    normalizeDecisionV3RestoredState,
  } = require(path.join(root, 'lib/decision-v3-state.ts'));

  const ids = DECISION_CANDIDATES.map((candidate) => candidate.id);
  assert(ids.length === 3, 'fixture must provide exactly three provisional candidates');
  assert(new Set(ids).size === 3, 'fixture candidate ids must be unique');

  const eligibility = ids.map((candidateId) => ({
    candidateId,
    eligible: true,
    evaluatedAsOf: '2026-08-24',
    policyVersion: 'fixture',
    exclusions: [],
  }));
  const releaseReady = {
    surface: 'production',
    evaluatedAsOf: '2026-08-24T09:07:41Z',
    readyCandidates: ids.map((candidateId) => ({
      candidateId,
      verificationStage: 'production-verified',
      productionUseApproved: true,
    })),
    readyCount: ids.length,
    blockedCandidateCount: 0,
  };
  const adapted = adaptFormalDecisionV3Candidates({
    candidates: DECISION_CANDIDATES,
    evidence: DECISION_CANDIDATE_EVIDENCE,
    eligibility,
    releaseReady,
    definitions: INITIAL_FORMAL_DECISION_V3_DEFINITIONS,
  });

  assert(adapted.length === 3, 'approved fixture gate must adapt all three candidates');
  assert(
    adapted.map((candidate) => candidate.selection.area).sort().join(',') === 'meieki,osu,sakae',
    'fixture areas must cover meieki, sakae, and osu exactly once',
  );
  for (const candidate of adapted) {
    assert(candidate.photo.availability === 'unregistered', `${candidate.id}: visual:none must use fallback`);
    assert(candidate.photo.rightsStatus === 'unverified', `${candidate.id}: fallback must not claim rights`);
    const actionTypes = candidate.actions.map((action) => action.type).sort().join(',');
    assert(actionTypes === 'access,official,phone', `${candidate.id}: verified map, official, phone actions required`);
  }

  const lightResult = selectDecisionV3Candidates({
    conditions: { party: 'solo', budget: 'any', mood: 'light', area: 'any' },
    preferences: [],
    candidates: adapted,
  });
  assert(lightResult.kind === 'matched', 'formal fixture must enter Candidates for a matching condition');
  assert(
    lightResult.candidateIds.includes('food-178-potama-haera')
      && lightResult.candidateIds.includes('osu-konparu-honten'),
    'light fixture must retain the verified sakae and osu proposals',
  );

  let state = createInitialDecisionV3State();
  for (const [group, value] of Object.entries({ party: 'solo', budget: 'any', mood: 'light', area: 'any' })) {
    state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
  }
  state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: adapted });
  assert(state.selectionResult?.kind === 'matched', 'Conditions to Candidates fixture flow failed');
  state = decisionV3Reducer(state, { type: 'GO', step: 'detail', detailId: 'food-178-potama-haera' });
  assert(state.detailId === 'food-178-potama-haera', 'Detail fixture flow failed');
  state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: 'food-178-potama-haera' });
  state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: 'osu-konparu-honten' });
  state = decisionV3Reducer(state, { type: 'GO', step: 'compare' });
  assert(state.compareIds.length === 2, 'Compare fixture flow failed');
  state = decisionV3Reducer(state, { type: 'CHOOSE', candidateId: 'food-178-potama-haera' });
  state = decisionV3Reducer(state, { type: 'GO', step: 'decided' });
  assert(state.chosenId === 'food-178-potama-haera' && state.step === 'decided', 'Decided fixture flow failed');

  const normalized = normalizeDecisionV3RestoredState({
    ...state,
    compareIds: ['demo-a', 'demo-b'],
    compareOrder: ['demo-b', 'demo-a'],
    chosenId: 'demo-b',
    detailId: 'demo-b',
  }, 'formal', adapted);
  assert(
    normalized.step === 'candidates'
      && normalized.compareIds.length === 0
      && normalized.chosenId === null
      && normalized.detailId === null,
    'formal restore must not revive stale demo state',
  );

  const expired = adaptFormalDecisionV3Candidates({
    candidates: [DECISION_CANDIDATES[0]],
    evidence: DECISION_CANDIDATE_EVIDENCE,
    eligibility: [{ ...eligibility[0], eligible: false, exclusions: [{ code: 'evidence-stale' }] }],
    releaseReady: { ...releaseReady, readyCandidates: [releaseReady.readyCandidates[0]], readyCount: 1 },
    definitions: [INITIAL_FORMAL_DECISION_V3_DEFINITIONS[0]],
  });
  assert(expired.length === 0, 'expired fixture candidate must be excluded');

  const unverifiedActionCandidate = {
    ...DECISION_CANDIDATES[0],
    actions: [{
      type: 'official',
      label: '公式情報を見る',
      url: 'https://www.yabaton.com/modules/shop/index.php?content_id=5',
      verifiedAt: '',
    }],
  };
  const unverifiedAction = adaptFormalDecisionV3Candidates({
    candidates: [unverifiedActionCandidate],
    evidence: DECISION_CANDIDATE_EVIDENCE,
    eligibility: [eligibility[0]],
    releaseReady: { ...releaseReady, readyCandidates: [releaseReady.readyCandidates[0]], readyCount: 1 },
    definitions: [INITIAL_FORMAL_DECISION_V3_DEFINITIONS[0]],
  });
  assert(unverifiedAction[0]?.actions.length === 0, 'unverified action must have no presentation DOM action');

  const activeProduction = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: '2026-08-24',
    evaluatedAt: '2026-08-24T09:07:41Z',
  });
  assert(activeProduction.length === 0, 'provisional registry must keep production candidates at zero');

  const decisionApp = fs.readFileSync(path.join(root, 'components/decision-v3/DecisionV3App.tsx'), 'utf8');
  assert(
    decisionApp.includes("trackAnalyticsEvent('map_click', { store_id: candidateId, surface })"),
    'map_click must preserve the selected formal store_id contract',
  );

  console.log('S2 formal-candidate fixture: PASS');
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
}
