import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originalResolveFilename = Module._resolveFilename;
const originalTsExtension = Module._extensions['.ts'];
const typescript = require('typescript');

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
  const { getActiveFormalDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-formal-adapter.ts'));
  const { DEMO_CANDIDATES } = require(path.join(root, 'data/decision-v3-demo.ts'));
  const { parseDecisionV3Session } = require(path.join(root, 'lib/decision-v3-session.ts'));
  const {
    createInitialDecisionV3State,
    decisionV3Reducer,
    normalizeDecisionV3RestoredState,
  } = require(path.join(root, 'lib/decision-v3-state.ts'));

  const active = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: '2026-08-26',
    evaluatedAt: '2026-08-26T12:00:00Z',
  });
  const potamaId = 'sakae-potama-nagoya-haera';
  const sugakiyaId = 'osu-sugakiya-osu';
  const erickId = 'meieki-erick-south-kitte-nagoya';

  assert(active.length === 9, 'fixture requires nine active formal candidates after B2 approval');
  assert(
    active.find((candidate) => candidate.id === potamaId)?.selection.price.label
      === '¥450〜¥1,300（全店共通7品＋名古屋HAERA店限定主食4品）',
    'Potama formal label must preserve the approved price scope',
  );

  const matching = () => {
    let state = createInitialDecisionV3State();
    for (const [group, value] of Object.entries({ party: 'solo', budget: 'any', mood: 'light', area: 'any' })) {
      state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
    }
    state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: active });
    return decisionV3Reducer(state, { type: 'GO', step: 'candidates' });
  };

  const candidates = matching();
  assert(
    normalizeDecisionV3RestoredState(candidates, 'formal', active).step === 'candidates',
    'Candidates must survive formal restore',
  );

  const detail = decisionV3Reducer(candidates, { type: 'GO', step: 'detail', detailId: potamaId });
  const restoredDetail = normalizeDecisionV3RestoredState(detail, 'formal', active);
  assert(restoredDetail.step === 'detail' && restoredDetail.detailId === potamaId, 'valid Detail must survive restore');

  let compare = decisionV3Reducer(detail, { type: 'TOGGLE_COMPARE', candidateId: potamaId });
  compare = decisionV3Reducer(compare, { type: 'TOGGLE_COMPARE', candidateId: sugakiyaId });
  compare = decisionV3Reducer(compare, { type: 'SET_COMPARE_ORDER', ids: [sugakiyaId, potamaId] });
  compare = decisionV3Reducer(compare, { type: 'GO', step: 'compare' });
  const restoredCompare = normalizeDecisionV3RestoredState(compare, 'formal', active);
  assert(
    restoredCompare.step === 'compare'
      && restoredCompare.compareIds.join(',') === `${potamaId},${sugakiyaId}`
      && restoredCompare.compareOrder.join(',') === `${sugakiyaId},${potamaId}`,
    'valid Compare ids and order must survive restore',
  );

  let decided = decisionV3Reducer(compare, { type: 'CHOOSE', candidateId: potamaId });
  decided = decisionV3Reducer(decided, { type: 'GO', step: 'decided' });
  const restoredDecided = normalizeDecisionV3RestoredState(decided, 'formal', active);
  assert(
    restoredDecided.step === 'decided' && restoredDecided.chosenId === potamaId,
    'valid Decided state must survive restore',
  );

  const staleDemo = normalizeDecisionV3RestoredState({
    ...decided,
    compareIds: ['demo-a', potamaId, 'deleted-id'],
    compareOrder: ['demo-a', potamaId, potamaId],
    detailId: 'demo-a',
    chosenId: 'demo-a',
  }, 'formal', active);
  assert(
    staleDemo.step === 'candidates'
      && staleDemo.compareIds.join(',') === potamaId
      && staleDemo.compareOrder.join(',') === potamaId
      && staleDemo.detailId === null
      && staleDemo.chosenId === null,
    'stale demo ids must be removed and an invalid decided state must fail closed',
  );

  const deleted = normalizeDecisionV3RestoredState({
    ...compare,
    compareIds: [potamaId, erickId],
    compareOrder: [erickId, potamaId],
  }, 'formal', active.filter((candidate) => candidate.id !== erickId));
  assert(
    deleted.step === 'compare'
      && deleted.compareIds.join(',') === potamaId
      && deleted.compareOrder.join(',') === potamaId,
    'deleted formal ids must be removed while valid compare state remains',
  );

  const expired = normalizeDecisionV3RestoredState(decided, 'formal', []);
  assert(
    expired.step === 'candidates' && expired.selectionResult?.kind === 'data-unavailable',
    'expired formal candidates must fail closed to data-unavailable',
  );

  const invalidChosen = normalizeDecisionV3RestoredState({ ...decided, chosenId: erickId }, 'formal', active);
  assert(invalidChosen.step === 'candidates' && invalidChosen.chosenId === null, 'chosen id outside compare must not restore Decided');

  const home = normalizeDecisionV3RestoredState({
    ...decided,
    step: 'home',
    conditions: { party: 'solo' },
    refine: ['quiet'],
  }, 'formal', active);
  assert(
    home.step === 'home'
      && home.refine.join(',') === 'quiet'
      && home.selectionResult === null
      && home.compareIds.length === 0
      && home.chosenId === null,
    'formal Home restore must retain only conditions and refine',
  );

  let demo = createInitialDecisionV3State();
  for (const [group, value] of Object.entries({ party: 'solo', budget: 'any', mood: 'hearty', area: 'sakae' })) {
    demo = decisionV3Reducer(demo, { type: 'SET_CONDITION', group, value });
  }
  demo = decisionV3Reducer(demo, { type: 'PREPARE_CANDIDATES', candidates: DEMO_CANDIDATES });
  demo = decisionV3Reducer(demo, { type: 'GO', step: 'detail', detailId: 'demo-a' });
  const restoredDemo = normalizeDecisionV3RestoredState(demo, 'demo', DEMO_CANDIDATES);
  assert(
    restoredDemo.step === 'detail' && restoredDemo.detailId === 'demo-a',
    'valid explicit demo Detail must remain available after restore',
  );
  const staleDemoSource = normalizeDecisionV3RestoredState({
    ...demo,
    detailId: 'unknown-demo-id',
  }, 'demo', DEMO_CANDIDATES);
  assert(staleDemoSource.step === 'candidates' && staleDemoSource.detailId === null, 'stale demo ids must fail closed');

  const sessionFor = (step, ids, overrides = {}) => ({
    version: 2,
    step,
    conditions: { party: 'solo', budget: 'any', mood: 'light', area: 'any' },
    refine: [],
    selectionResult: {
      kind: 'matched',
      candidateIds: ids,
      reasonsByCandidateId: Object.fromEntries(ids.map((id) => [id, ['fixture']])),
    },
    compareIds: step === 'compare' || step === 'decided' ? [ids[0]] : [],
    compareOrder: step === 'compare' || step === 'decided' ? [ids[0]] : [],
    axes: ['budget'],
    chosenId: step === 'decided' ? ids[0] : null,
    detailId: step === 'detail' ? ids[0] : null,
    ...overrides,
  });
  const parses = (value) => parseDecisionV3Session(value) !== null;
  for (const step of ['candidates', 'detail', 'compare', 'decided']) {
    assert(parses(sessionFor(step, ['demo-a'])), `demo ${step} session must parse`);
    assert(parses(sessionFor(step, [potamaId])), `formal ${step} session must parse`);
  }
  assert(parses(sessionFor('candidates', ['demo-a', potamaId])), 'mixed canonical ids must parse without membership checks');
  for (const invalidId of ['', 'demo a', 'Demo-a', 'demo_a', 'demo/a', `a-${'a'.repeat(127)}`]) {
    assert(!parses(sessionFor('candidates', [invalidId])), `invalid candidate id must fail: ${JSON.stringify(invalidId)}`);
  }
  assert(!parses(sessionFor('candidates', ['demo-a', 'demo-a'])), 'duplicate candidate ids must fail');
  assert(!parses(sessionFor('candidates', ['demo-a'], { selectionResult: { kind: 'matched', candidateIds: ['demo-a'], reasonsByCandidateId: {} } })), 'reason keys must match candidate ids');
  assert(!parses(sessionFor('decided', ['demo-a'], { chosenId: 'formal-other-id' })), 'chosen id outside compare must fail');
  assert(!parses(sessionFor('detail', ['demo-a'], { detailId: 'formal-other-id' })), 'detail id outside selection must fail');
  assert(!parses(sessionFor('candidates', ['demo-a', 'demo-b', 'demo-c', 'formal-other-id'])), 'more than three candidate ids must fail');
  assert(!parses({ ...sessionFor('candidates', ['demo-a']), unexpected: true }), 'unexpected session keys must fail');

  const stateSource = fs.readFileSync(path.join(root, 'lib/decision-v3-state.ts'), 'utf8');
  const restoreSource = stateSource.slice(stateSource.indexOf('export function normalizeDecisionV3RestoredState'));
  assert(!restoreSource.includes('trackAnalyticsEvent'), 'state restoration must not emit business analytics events');
  const decisionAppSource = fs.readFileSync(path.join(root, 'components/decision-v3/DecisionV3App.tsx'), 'utf8');
  const hydrationRestoreEffect = decisionAppSource.slice(
    decisionAppSource.indexOf('useEffect(() => {', decisionAppSource.indexOf('const candidateLookup')),
    decisionAppSource.indexOf('const navigate = useCallback'),
  );
  assert(
    !hydrationRestoreEffect.includes('trackAnalyticsEvent'),
    'hydration and popstate restoration must not emit business analytics events',
  );

  console.log('S2.7 formal-state-restoration fixture: PASS');
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
}
