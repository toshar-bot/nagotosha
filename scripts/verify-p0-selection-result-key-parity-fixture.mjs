import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
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

// Keep failure output sanitized: no actual candidate IDs, names, or session dumps.
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const jsonRoundtrip = (value) => JSON.parse(JSON.stringify(value));

try {
  const { CONDITION_GROUPS } = require(path.join(root, 'data/decision-v3-demo.ts'));
  const { getActiveFormalDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-formal-adapter.ts'));
  const { selectDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-selector.ts'));
  const { parseDecisionV3Session } = require(path.join(root, 'lib/decision-v3-session.ts'));
  const {
    createInitialDecisionV3State,
    decisionV3Reducer,
    normalizeDecisionV3RestoredState,
  } = require(path.join(root, 'lib/decision-v3-state.ts'));

  // Pin the same approved-nine snapshot as S2.7; do not depend on wall-clock freshness.
  const active = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: '2026-08-26',
    evaluatedAt: '2026-08-26T12:00:00Z',
  });
  assert(active.length === 9, 'fixture requires nine actual approved formal candidates');
  assert(
    equal(CONDITION_GROUPS.map((group) => group.key), ['party', 'budget', 'mood', 'area'])
      && CONDITION_GROUPS.every((group) => group.options.length === 4),
    'fixture requires the actual four groups with four options each',
  );
  const combinations = CONDITION_GROUPS.reduce(
    (conditions, group) => conditions.flatMap((partial) => group.options.map((option) => ({
      ...partial,
      [group.key]: option.value,
    }))),
    [{}],
  );
  assert(combinations.length === 256, 'fixture must exercise all 256 formal condition combinations');

  const totals = {
    kinds: { matched: 0, 'no-match': 0, 'data-unavailable': 0 },
    candidateCounts: [0, 0, 0, 0],
    knownCases: 0,
    roundtrips: { candidates: 0, detail: 0, compare: 0, decided: 0 },
    extraReasonGuards: 0,
    missingReasonGuards: 0,
  };

  for (const conditions of combinations) {
    const label = Object.values(conditions).join('/');
    const result = selectDecisionV3Candidates({ conditions, preferences: [], candidates: active });
    totals.kinds[result.kind] += 1;
    const candidateCount = result.kind === 'matched' ? result.candidateIds.length : 0;
    assert(candidateCount <= 3, `${label}: selector must retain the maximum of three candidates`);
    totals.candidateCounts[candidateCount] += 1;

    const knownCase = conditions.party === 'pair'
      && conditions.mood === 'light'
      && conditions.area === 'any'
      && ['under2000', 'under4000', 'any'].includes(conditions.budget);
    if (knownCase) {
      assert(result.kind === 'matched' && candidateCount === 3, `${label}: known case must select three candidates`);
      totals.knownCases += 1;
    }
    if (result.kind !== 'matched') continue;

    const ids = result.candidateIds;
    const reasonKeys = Object.keys(result.reasonsByCandidateId);
    assert(ids.length >= 1 && ids.length <= 3, `${label}: matched candidate count must be one to three`);
    assert(new Set(ids).size === ids.length, `${label}: selected candidates must be unique`);
    assert(reasonKeys.length === ids.length, `${label}: reason key count must equal candidate count`);
    assert(reasonKeys.every((key) => ids.includes(key)), `${label}: extra reason keys are forbidden`);
    assert(ids.every((id) => reasonKeys.includes(id)), `${label}: missing reason keys are forbidden`);
    for (const id of ids) {
      const reasons = result.reasonsByCandidateId[id];
      assert(Array.isArray(reasons) && reasons.length >= 1 && reasons.length <= 3,
        `${label}: every selected candidate must have one to three reasons`);
      assert(reasons.every((reason) => typeof reason === 'string' && reason.trim().length > 0),
        `${label}: reasons must be nonempty strings`);
    }

    let state = createInitialDecisionV3State();
    for (const [group, value] of Object.entries(conditions)) {
      state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
    }
    state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: active });
    assert(equal(state.selectionResult, result), `${label}: actual reducer must retain selector output`);
    const candidates = decisionV3Reducer(state, { type: 'GO', step: 'candidates' });
    const lastId = ids[ids.length - 1];
    const detail = decisionV3Reducer(candidates, { type: 'GO', step: 'detail', detailId: lastId });
    state = detail;
    // Exercise the largest valid comparison even when only one candidate matched.
    for (const candidateId of ids) state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId });
    state = decisionV3Reducer(state, { type: 'SET_COMPARE_ORDER', ids: [...ids].reverse() });
    const compare = decisionV3Reducer(state, { type: 'GO', step: 'compare' });
    const chosen = decisionV3Reducer(compare, { type: 'CHOOSE', candidateId: lastId });
    const decided = decisionV3Reducer(chosen, { type: 'GO', step: 'decided' });
    assert(equal(compare.compareIds, ids) && equal(compare.compareOrder, [...ids].reverse()),
      `${label}: comparison must exercise all selected candidates and reversed display order`);
    assert(detail.detailId === lastId && decided.chosenId === lastId,
      `${label}: detail and chosen states must retain the last selected position`);

    for (const snapshot of [candidates, detail, compare, decided]) {
      const stepLabel = `${label}/${snapshot.step}`;
      const serialized = jsonRoundtrip(snapshot);
      assert(equal(serialized, snapshot), `${stepLabel}: JSON serialization must preserve actual state`);
      const parsed = parseDecisionV3Session(serialized);
      assert(parsed !== null, `${stepLabel}: actual session parser must accept selector output after JSON roundtrip`);
      assert(equal(parsed, snapshot), `${stepLabel}: session parser must preserve the full snapshot`);
      const restored = normalizeDecisionV3RestoredState(parsed, 'formal', active);
      for (const key of ['step', 'chosenId', 'detailId', 'compareIds', 'compareOrder', 'conditions', 'selectionResult']) {
        assert(equal(restored[key], snapshot[key]), `${stepLabel}: normalizer must preserve ${key}`);
      }
      assert(equal(restored, snapshot), `${stepLabel}: normalizer must preserve the full snapshot`);
      totals.roundtrips[snapshot.step] += 1;

      const extraReason = jsonRoundtrip(snapshot);
      const unselectedKey = 'p0-fixture-unselected';
      assert(!ids.includes(unselectedKey), `${stepLabel}: corrupt guard key must be outside the selection`);
      extraReason.selectionResult.reasonsByCandidateId[unselectedKey] = ['fixture guard'];
      assert(parseDecisionV3Session(jsonRoundtrip(extraReason)) === null,
        `${stepLabel}: parser must continue rejecting an extra reason key`);
      totals.extraReasonGuards += 1;

      const missingReason = jsonRoundtrip(snapshot);
      delete missingReason.selectionResult.reasonsByCandidateId[ids[0]];
      assert(parseDecisionV3Session(jsonRoundtrip(missingReason)) === null,
        `${stepLabel}: parser must continue rejecting a missing reason key`);
      totals.missingReasonGuards += 1;
    }
  }

  assert(totals.knownCases === 3, 'all three known reproduction conditions must be exercised');
  assert(equal(totals.kinds, { matched: 137, 'no-match': 119, 'data-unavailable': 0 }),
    'formal selector result kind counts must remain unchanged');
  assert(equal(totals.candidateCounts, [119, 103, 12, 22]),
    'formal candidate count distribution for zero/one/two/three must remain unchanged');
  assert(Object.values(totals.roundtrips).every((count) => count === 137),
    'every matched result must survive JSON, parser, and normalizer in all four steps');
  assert(totals.extraReasonGuards === 548 && totals.missingReasonGuards === 548,
    'all 548 snapshots must reject extra and missing reason key corruption');

  console.log('P0 selection-result-key-parity fixture: PASS');
  console.log(JSON.stringify({ evaluatedAsOf: '2026-08-26', conditions: 256, ...totals }));
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
  else delete Module._extensions['.ts'];
}
