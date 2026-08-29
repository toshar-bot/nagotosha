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

function installWindow({ throwGtag, throwPush, throwReplace, throwScroll, throwSession } = {}) {
  const calls = {
    analytics: [],
    push: [],
    replace: [],
    scroll: 0,
    session: 0,
  };
  global.window = {
    location: { href: 'https://example.test/decision-functional-preview-v3?step=compare' },
    history: {
      state: null,
      pushState(state, _title, url) {
        calls.push.push({ state, url });
        this.state = state;
        if (throwPush) throw new Error('push failed');
      },
      replaceState(state, _title, url) {
        calls.replace.push({ state, url });
        this.state = state;
        if (throwReplace) throw new Error('replace failed');
      },
    },
    sessionStorage: {
      setItem() {
        calls.session += 1;
        if (throwSession) throw new Error('session failed');
      },
    },
    scrollTo() {
      calls.scroll += 1;
      if (throwScroll) throw new Error('scroll failed');
    },
    setTimeout(callback) {
      callback();
      return 1;
    },
    gtag(...args) {
      calls.analytics.push(args);
      if (throwGtag) throw new Error('gtag failed');
    },
  };
  return calls;
}

try {
  const { getActiveFormalDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-formal-adapter.ts'));
  const { trackAnalyticsEvent, sanitizeDecisionAnalyticsPayload } = require(path.join(root, 'lib/analytics.ts'));
  const {
    createDecisionV3TransitionGuard,
    deferDecisionV3Analytics,
    persistDecisionV3State,
  } = require(path.join(root, 'lib/decision-v3-transition.ts'));
  const { readDecisionV3HistoryState } = require(path.join(root, 'lib/decision-v3-history.ts'));
  const { createInitialDecisionV3State, decisionV3Reducer } = require(path.join(root, 'lib/decision-v3-state.ts'));

  const active = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: '2026-08-29',
    evaluatedAt: '2026-08-29T12:00:00.000Z',
  });
  assert(active.length === 9, 'atomic transition fixture requires the nine active formal candidates');

  const buildCompareState = (count) => {
    let state = createInitialDecisionV3State();
    for (const [group, value] of Object.entries({
      party: 'solo', budget: 'any', mood: 'light', area: 'any',
    })) {
      state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
    }
    state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: active });
    state = decisionV3Reducer(state, { type: 'GO', step: 'candidates' });
    const ids = state.selectionResult?.kind === 'matched' ? state.selectionResult.candidateIds.slice(0, count) : [];
    assert(ids.length === count, `${count}-candidate fixture needs ${count} matching candidates`);
    for (const candidateId of ids) {
      state = decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId });
    }
    state = decisionV3Reducer(state, { type: 'GO', step: 'compare' });
    return { ids, state };
  };

  const buildDecidedState = (count) => {
    const compare = buildCompareState(count);
    const chosen = decisionV3Reducer(compare.state, { type: 'CHOOSE', candidateId: compare.ids[0] });
    const decided = decisionV3Reducer(chosen, { type: 'GO', step: 'decided' });
    assert(decided.step === 'decided' && decided.chosenId === compare.ids[0], 'CHOOSE must create a valid Decided state');
    return { compare: compare.state, decided, chosenId: compare.ids[0] };
  };

  const normalCalls = installWindow();
  const normal = buildDecidedState(3);
  const normalResult = persistDecisionV3State(normal.decided, { history: 'push', scroll: true });
  assert(normalResult.sessionSaved, 'normal session save must succeed');
  assert(normalResult.historyWritten, 'normal semantic navigation must push history');
  assert(normalCalls.push.length === 1, 'semantic Decided navigation must write exactly one pushState');
  assert(normalCalls.replace.length === 0, 'semantic Decided navigation must not redundantly replace history');
  assert(normalCalls.scroll === 1, 'normal Decided navigation must scroll once after commit');
  assert(
    readDecisionV3HistoryState(normalCalls.push[0].state)?.step === 'decided',
    'the pushed history snapshot must restore Decided',
  );
  assert(
    readDecisionV3HistoryState(normalCalls.push[0].state)?.chosenId === normal.chosenId,
    'the pushed history snapshot must retain chosenId',
  );
  assert(buildCompareState(3).state.compareOrder.join(',') === normal.compare.compareOrder.join(','), 'Compare order must remain stable before Decided');

  for (const [label, setup] of Object.entries({
    gtag: { throwGtag: true },
    replaceState: { throwReplace: true },
    pushState: { throwPush: true },
    scrollTo: { throwScroll: true },
    sessionStorage: { throwSession: true },
  })) {
    const calls = installWindow(setup);
    const { decided, chosenId } = buildDecidedState(3);
    const guard = createDecisionV3TransitionGuard();
    guard.run(() => {
      const result = persistDecisionV3State(decided, { history: 'push', scroll: true });
      deferDecisionV3Analytics(() => {
        trackAnalyticsEvent('store_decided', {
          store_id: chosenId,
          compare_count: 3,
          party: 'solo',
          candidate_source: 'formal-reviewed',
        });
      });
      assert(decided.step === 'decided' && decided.chosenId === chosenId, `${label} must not alter the committed Decided state`);
      if (label === 'pushState') assert(!result.historyWritten, 'pushState failure must be contained');
      if (label === 'replaceState') assert(calls.replace.length === 0, 'Decided must not issue a redundant replaceState');
      if (label === 'sessionStorage') assert(!result.sessionSaved, 'sessionStorage failure must be contained');
    });
    assert(!guard.isInFlight(), `${label} failure must not leave the transition guard stuck`);
  }

  const guard = createDecisionV3TransitionGuard();
  try {
    guard.run(() => {
      throw new Error('commit failure');
    });
  } catch {
    // The caller can observe a React commit failure, but the guard must always be released.
  }
  assert(!guard.isInFlight(), 'a thrown transition operation must release the guard in finally');

  const analyticsCalls = installWindow();
  assert(trackAnalyticsEvent('store_decided', {
    store_id: 'meieki-erick-south-kitte-nagoya',
    compare_count: 3,
    party: 'solo',
    candidate_source: 'formal-reviewed',
    url: 'https://forbidden.example',
    phone: '0000000000',
  }), 'normal gtag must report delivery');
  const payload = analyticsCalls.analytics.at(-1)[2];
  assert(payload.store_id === 'meieki-erick-south-kitte-nagoya', 'approved store_id must remain in payload');
  assert(payload.candidate_source === 'formal-reviewed', 'valid candidate source must remain in payload');
  assert(!('url' in payload) && !('phone' in payload), 'unapproved analytics keys must be excluded');
  assert(
    !('candidate_source' in sanitizeDecisionAnalyticsPayload('store_decided', {
      store_id: 'meieki-erick-south-kitte-nagoya',
      candidate_source: 'invalid-source',
    })),
    'invalid candidate sources must be excluded without throwing',
  );
  installWindow({ throwGtag: true });
  assert(!trackAnalyticsEvent('store_decided', { store_id: normal.chosenId }), 'throwing gtag must fail closed without throwing');
  global.window.gtag = undefined;
  assert(!trackAnalyticsEvent('store_decided', { store_id: normal.chosenId }), 'missing gtag must be a safe no-op');

  const stressCalls = installWindow();
  for (const count of [1, 2, 3]) {
    for (let iteration = 0; iteration < 10; iteration += 1) {
      const pushCountBefore = stressCalls.push.length;
      const replaceCountBefore = stressCalls.replace.length;
      const { compare, decided, chosenId } = buildDecidedState(count);
      const iterationGuard = createDecisionV3TransitionGuard();
      iterationGuard.run(() => persistDecisionV3State(decided, { history: 'push', scroll: true }));
      assert(decided.step === 'decided' && decided.chosenId === chosenId, `${count}-candidate stress #${iteration + 1} must reach Decided`);
      assert(decided.compareOrder.join(',') === compare.compareOrder.join(','), `${count}-candidate stress #${iteration + 1} must retain compare order`);
      assert(
        stressCalls.push.length === pushCountBefore + 1 && stressCalls.replace.length === replaceCountBefore,
        `${count}-candidate stress #${iteration + 1} must create exactly one history entry without a redundant replace`,
      );
      const pushedEntry = stressCalls.push.at(-1);
      const reloaded = readDecisionV3HistoryState(pushedEntry.state);
      assert(reloaded?.step === 'decided' && reloaded.chosenId === chosenId, `${count}-candidate stress #${iteration + 1} must survive reload`);
      const back = readDecisionV3HistoryState({
        app: 'nago-decision-v3',
        snapshot: {
          ...pushedEntry.state.snapshot,
          step: 'compare',
          selectedCandidateId: null,
          decidedCandidateId: null,
        },
      });
      assert(back?.step === 'compare', `${count}-candidate stress #${iteration + 1} must restore Compare on back`);
      assert(readDecisionV3HistoryState(pushedEntry.state)?.step === 'decided', `${count}-candidate stress #${iteration + 1} must restore Decided on forward`);
      assert(!iterationGuard.isInFlight(), `${count}-candidate stress #${iteration + 1} must release the guard`);
    }
  }

  for (let session = 0; session < 10; session += 1) {
    const freshCalls = installWindow();
    const { compare, decided, chosenId } = buildDecidedState(3);
    const freshGuard = createDecisionV3TransitionGuard();
    freshGuard.run(() => persistDecisionV3State(decided, { history: 'push', scroll: true }));
    assert(decided.step === 'decided' && decided.chosenId === chosenId, `fresh 3-candidate session #${session + 1} must reach Decided`);
    assert(decided.compareOrder.join(',') === compare.compareOrder.join(','), `fresh 3-candidate session #${session + 1} must retain compare order`);
    assert(freshCalls.push.length === 1 && freshCalls.replace.length === 0, `fresh 3-candidate session #${session + 1} must write one history entry`);
    assert(readDecisionV3HistoryState(freshCalls.push[0].state)?.step === 'decided', `fresh 3-candidate session #${session + 1} must survive reload`);
    assert(!freshGuard.isInFlight(), `fresh 3-candidate session #${session + 1} must release the guard`);
  }

  const appSource = fs.readFileSync(path.join(root, 'components/decision-v3/DecisionV3App.tsx'), 'utf8');
  assert(!appSource.includes('replaceDecisionV3History(state)'), 'navigation must not write a redundant pre-dispatch replaceState');
  assert(!appSource.includes('pushDecisionV3History(nextState)'), 'history writing must stay in the side-effect coordinator');
  assert(!appSource.includes("if (!hydrated) return;\n    saveDecisionV3Session(state)"), 'state changes must not trigger an effect-driven history write');
  assert(
    appSource.indexOf("commitDecisionState(decidedState, 'push')") < appSource.indexOf("trackAnalyticsEvent('store_decided'"),
    'store_decided analytics must be scheduled only after Decided commits',
  );

  console.log('Decision V3 atomic-transition fixture: PASS');
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
  delete global.window;
}
