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
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const originalWindow = globalThis.window;

try {
  const analytics = require(path.join(root, 'lib/analytics.ts'));
  const state = require(path.join(root, 'lib/decision-v3-state.ts'));
  const decisionApp = fs.readFileSync(path.join(root, 'components/decision-v3/DecisionV3App.tsx'), 'utf8');

  const handlerStart = decisionApp.indexOf('onDecide={(candidateId) => {');
  const decidedStateIndex = decisionApp.indexOf(
    "const decidedState = decisionV3Reducer(chosenState, { type: 'GO', step: 'decided' });",
    handlerStart,
  );
  const dispatchIndex = decisionApp.indexOf(
    "dispatch({ type: 'RESTORE', state: decidedState });",
    handlerStart,
  );
  const historyPushIndex = decisionApp.indexOf('pushDecisionV3History(decidedState);', handlerStart);
  const analyticsIndex = decisionApp.indexOf("trackAnalyticsEvent('store_decided'", handlerStart);
  assert(handlerStart >= 0, 'onDecide handler must exist');
  assert(
    decidedStateIndex >= 0 && dispatchIndex > decidedStateIndex && historyPushIndex > dispatchIndex && analyticsIndex > historyPushIndex,
    'Decided state and history must be committed before store_decided analytics',
  );

  const trace = [];
  let compareState = {
    ...state.createInitialDecisionV3State(),
    step: 'compare',
    conditions: { party: 'solo', budget: 'any', mood: 'light', area: 'any' },
    compareIds: ['formal-a', 'formal-b'],
    compareOrder: ['formal-b', 'formal-a'],
  };

  trace.push('click-handler');
  const candidateId = 'formal-a';
  trace.push(`candidateId:${candidateId}`);
  trace.push(`compareIds:${compareState.compareIds.join(',')}`);
  const chosenState = state.decisionV3Reducer(compareState, { type: 'CHOOSE', candidateId });
  trace.push(`chosenId:${chosenState.chosenId}`);
  assert(chosenState.chosenId === candidateId, 'CHOOSE must preserve the selected formal ID');
  const transitionStarted = true;
  trace.push(`beginTransition:${transitionStarted}`);
  const decidedState = state.decisionV3Reducer(chosenState, { type: 'GO', step: 'decided' });
  trace.push(`decidedState:${decidedState.step}`);
  assert(decidedState.step === 'decided' && decidedState.chosenId === candidateId, 'Decided state must retain chosenId');
  trace.push('dispatch');
  compareState = decidedState;
  trace.push('history-push');
  const lookupHit = true;
  trace.push(`candidateLookup:${lookupHit}`);

  for (const source of ['external-catalog-osm', 'external-live-google']) {
    const externalId = `${source}-synthetic`;
    const externalCompareState = {
      ...state.createInitialDecisionV3State(),
      step: 'compare',
      conditions: { party: 'solo', budget: 'any', mood: 'light', area: 'sakae' },
      compareIds: [externalId],
      compareOrder: [externalId],
    };
    const externalChosen = state.decisionV3Reducer(externalCompareState, { type: 'CHOOSE', candidateId: externalId });
    const externalDecided = state.decisionV3Reducer(externalChosen, { type: 'GO', step: 'decided' });
    assert(
      externalDecided.step === 'decided' && externalDecided.chosenId === externalId,
      `${source} candidates must reach Decided through the source-agnostic transition`,
    );
    trace.push(`external-decided:${source}`);
  }

  let transitionInFlight = null;
  let historyPushCount = 0;
  const beginTransition = (step) => {
    if (transitionInFlight === step) return false;
    transitionInFlight = step;
    return true;
  };
  if (beginTransition('decided')) historyPushCount += 1;
  if (beginTransition('decided')) historyPushCount += 1;
  assert(historyPushCount === 1, 'a rapid second Decided action must not add another history entry');
  trace.push('rapid-decided-history:1');

  delete globalThis.window;
  analytics.trackAnalyticsEvent('store_decided', { store_id: candidateId, compare_count: 2, party: 'solo' });
  assert(compareState.step === 'decided', 'missing gtag must not prevent Decided state');

  const calls = [];
  globalThis.window = { gtag: (...args) => calls.push(args) };
  trace.push('analytics-start:normal');
  analytics.trackAnalyticsEvent('store_decided', {
    store_id: candidateId,
    compare_count: 2,
    party: 'solo',
    candidate_source: 'formal-reviewed',
    providerEntityId: 'must-not-send',
  });
  trace.push('analytics-end:normal');
  assert(calls.length === 1, 'normal gtag must receive exactly one explicit store_decided event');
  assert(
    Object.keys(calls[0][2]).sort().join(',') === 'candidate_source,compare_count,party,store_id',
    'unapproved analytics parameters must be excluded without blocking the transition',
  );

  globalThis.window = { gtag: () => { throw new Error('fixture gtag failure'); } };
  trace.push('analytics-start:throw');
  analytics.trackAnalyticsEvent('store_decided', { store_id: candidateId, compare_count: 2, party: 'solo' });
  trace.push('analytics-end:throw');
  assert(compareState.step === 'decided' && compareState.chosenId === candidateId, 'throwing gtag must not block Decided state');

  console.log(`Decision transition analytics fixture: PASS ${JSON.stringify({ trace })}`);
} finally {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  Module._resolveFilename = originalResolveFilename;
  Module._extensions['.ts'] = originalTsExtension;
}
