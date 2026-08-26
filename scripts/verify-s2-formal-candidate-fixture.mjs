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

  const INITIAL_THREE_IDS = [
    'meieki-erick-south-kitte-nagoya',
    'sakae-potama-nagoya-haera',
    'osu-sugakiya-osu',
  ];
  const initialThree = DECISION_CANDIDATES.filter((candidate) => INITIAL_THREE_IDS.includes(candidate.id));
  const ids = initialThree.map((candidate) => candidate.id);
  assert(ids.length === 3, 'fixture must retain the initial-three candidate regression set');
  assert(new Set(ids).size === 3, 'fixture candidate ids must be unique');
  assert(
    ids.join(',') === 'meieki-erick-south-kitte-nagoya,sakae-potama-nagoya-haera,osu-sugakiya-osu',
    'fixture must use the S2.3 meieki, sakae, and osu initial-three records only',
  );

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
    candidates: initialThree,
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
    assert(
      candidate.selection.price.kind === 'range',
      `${candidate.id}: price must retain an evidenced range rather than a fabricated fixed value`,
    );
  }
  assert(
    adapted.find((candidate) => candidate.id === 'meieki-erick-south-kitte-nagoya')?.selection.price.maximum === 2350
      && adapted.find((candidate) => candidate.id === 'sakae-potama-nagoya-haera')?.selection.price.minimum === 450
      && adapted.find((candidate) => candidate.id === 'osu-sugakiya-osu')?.selection.price.minimum === 290,
    'fixture price boundaries must preserve the three official price gates',
  );

  const lightResult = selectDecisionV3Candidates({
    conditions: { party: 'solo', budget: 'any', mood: 'light', area: 'any' },
    preferences: [],
    candidates: adapted,
  });
  assert(lightResult.kind === 'matched', 'formal fixture must enter Candidates for a matching condition');
  assert(
    lightResult.candidateIds.includes('sakae-potama-nagoya-haera')
      && lightResult.candidateIds.includes('osu-sugakiya-osu'),
    'light fixture must retain the S2.3 sakae and osu proposals',
  );

  let state = createInitialDecisionV3State();
  for (const [group, value] of Object.entries({ party: 'solo', budget: 'any', mood: 'light', area: 'any' })) {
    state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
  }
  state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: adapted });
  assert(state.selectionResult?.kind === 'matched', 'Conditions to Candidates fixture flow failed');
  state = decisionV3Reducer(state, { type: 'GO', step: 'detail', detailId: 'sakae-potama-nagoya-haera' });
  assert(state.detailId === 'sakae-potama-nagoya-haera', 'Detail fixture flow failed');
  state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: 'sakae-potama-nagoya-haera' });
  state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: 'osu-sugakiya-osu' });
  state = decisionV3Reducer(state, { type: 'GO', step: 'compare' });
  assert(state.compareIds.length === 2, 'Compare fixture flow failed');
  state = decisionV3Reducer(state, { type: 'CHOOSE', candidateId: 'sakae-potama-nagoya-haera' });
  state = decisionV3Reducer(state, { type: 'GO', step: 'decided' });
  assert(state.chosenId === 'sakae-potama-nagoya-haera' && state.step === 'decided', 'Decided fixture flow failed');

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
    candidates: [initialThree[0]],
    evidence: DECISION_CANDIDATE_EVIDENCE,
    eligibility: [{ ...eligibility[0], eligible: false, exclusions: [{ code: 'evidence-stale' }] }],
    releaseReady: { ...releaseReady, readyCandidates: [releaseReady.readyCandidates[0]], readyCount: 1 },
    definitions: [INITIAL_FORMAL_DECISION_V3_DEFINITIONS[0]],
  });
  assert(expired.length === 0, 'expired fixture candidate must be excluded');

  const unverifiedActionCandidate = {
    ...initialThree[0],
    actions: [{
      type: 'official',
      label: '公式情報を見る',
      url: 'https://info.erickcurry.jp/kitte/',
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
    evaluatedAsOf: '2026-08-26',
    evaluatedAt: '2026-08-26T12:00:00Z',
  });
  assert(activeProduction.length === 9, 'approved registry must activate all nine reviewed candidates');
  assert(
    INITIAL_THREE_IDS.every((candidateId) => activeProduction.some((candidate) => candidate.id === candidateId)),
    'approved registry must retain every initial-three candidate',
  );

  const decisionApp = fs.readFileSync(path.join(root, 'components/decision-v3/DecisionV3App.tsx'), 'utf8');
  for (const eventName of ['map_click', 'official_click', 'phone_click']) {
    assert(
      decisionApp.includes(`trackAnalyticsEvent('${eventName}', { store_id: candidateId, surface })`),
      `${eventName} must preserve the selected formal store_id contract`,
    );
  }
  assert(
    decisionApp.includes("trackAnalyticsEvent('store_decided', {")
      && decisionApp.includes('store_id: candidateId'),
    'store_decided must preserve the selected formal store_id contract',
  );

  const previewPage = fs.readFileSync(path.join(root, 'app/decision-functional-preview-v3/page.tsx'), 'utf8');
  assert(
    previewPage.includes("const candidateSource = demoAllowed ? 'demo' : 'formal';")
      && previewPage.includes('getDecisionV3CandidatesForSource(candidateSource)'),
    'preview must continue to choose demo candidates only through its explicit source gate',
  );

  console.log('S2 formal-candidate fixture: PASS');
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
}
