import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import Module, { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Offline actual-source regression fixture. Only browser scheduling/React hooks
// in the callback harness and Next's image wrapper are simulated. Candidate
// adaptation, four screen components, analytics, reducer, transition, session,
// and history are the real modules. No response, markup, or identity is logged.
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ts = require('typescript');
const React = require('react');
const jsxRuntime = require('react/jsx-runtime');
const { renderToStaticMarkup } = require('react-dom/server');
const restore = [];
let networkAttempts = 0;
const denyNetwork = () => {
  networkAttempts += 1;
  throw new Error('P1_FIXTURE_NETWORK_FORBIDDEN');
};
const check = (condition, name) => {
  if (!condition) throw new Error(`P1_FIXTURE_${name}`);
};
const noOp = () => {};
const count = (text, token) => text.split(token).length - 1;
const textOnly = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const load = (file) => require(path.join(root, file));

function replace(object, key, value) {
  const previous = object[key];
  object[key] = value;
  restore.push(() => { object[key] = previous; });
}

function installOfflineLoader() {
  replace(globalThis, 'fetch', denyNetwork);
  for (const [name, methods] of [
    ['node:http', ['request', 'get']], ['node:https', ['request', 'get']],
    ['node:net', ['connect', 'createConnection']], ['node:tls', ['connect']],
  ]) for (const method of methods) replace(require(name), method, denyNetwork);
  replace(require('node:net').Socket.prototype, 'connect', denyNetwork);
  const originalResolve = Module._resolveFilename;
  replace(Module, '_resolveFilename', function resolve(request, parent, ...args) {
    return originalResolve.call(this, request.startsWith('@/')
      ? path.join(root, request.slice(2)) : request, parent, ...args);
  });
  const originalLoad = Module._load;
  replace(Module, '_load', function readModule(request, parent, ...args) {
    if (request === 'next/image') {
      return { __esModule: true, default: ({ priority, ...props }) => React.createElement('img', props) };
    }
    return originalLoad.call(this, request, parent, ...args);
  });
  const compile = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    module._compile(ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true,
      },
    }).outputText, filename);
  };
  replace(Module._extensions, '.ts', compile);
  replace(Module._extensions, '.tsx', compile);
  replace(Module._extensions, '.css', (module) => {
    module.exports = { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
  });
}

function verifySurfaces(cases, modules) {
  const { createDecisionV3CandidateLookup, ExternalCandidateProvenanceV3, surfaces } = modules;
  const results = [];
  for (const { label, candidate, source } of cases) {
    const candidateLookup = createDecisionV3CandidateLookup(source, [candidate]);
    const shared = { candidateLookup, onBack: noOp, onDetail: noOp, onCompare: noOp };
    const props = {
      Candidates: { ...shared, conditions: { party: 'solo', budget: 'any', mood: 'hearty', area: 'any' },
        selectionResult: { kind: 'matched', candidateIds: [candidate.id] }, refine: [], compareIds: [],
        onToggleCompare: noOp, onHome: noOp },
      Detail: { ...shared, candidateId: candidate.id, inCompare: false, compareLimitReached: false, onToggleCompare: noOp },
      Compare: { ...shared, compareOrder: [candidate.id], axes: ['budget', 'area'], onReorder: noOp,
        onSetOrder: noOp, onToggleAxis: noOp, onReorderAxis: noOp, onDecide: noOp },
      Decided: { ...shared, candidateId: candidate.id },
    };
    for (const [surface, Component] of Object.entries(surfaces)) {
      const html = renderToStaticMarkup(React.createElement(Component, props[surface]));
      const text = textOnly(html);
      const provenance = candidate.provenance;
      const blocks = count(html, 'data-external-provenance=');
      check(blocks === (provenance ? 1 : 0), `${label}_${surface}_BLOCK_COUNT`);
      if (provenance) {
        check(text.includes(provenance.label), `${label}_${surface}_SOURCE_LABEL`);
        check(text.includes(provenance.reason), `${label}_${surface}_REASON`);
        check(text.includes(provenance.attribution.label), `${label}_${surface}_ATTRIBUTION_LABEL`);
        if (provenance.attribution.license) check(text.includes(provenance.attribution.license),
          `${label}_${surface}_ATTRIBUTION_LICENSE`);
        check(text.includes('人数／気分の適性は未確認'), `${label}_${surface}_UNKNOWN_SUITABILITY`);
        check(!html.includes(provenance.providerEntityId), `${label}_${surface}_PROVIDER_ID_DOM`);
        check(!text.includes(candidate.id), `${label}_${surface}_EXTERNAL_ID_COPY`);
        const withoutDisclaimer = text.replace(/なごとしゃ確認済み(?:の公式情報)?ではありません/g, '');
        check(!withoutDisclaimer.includes('なごとしゃ確認済み'), `${label}_${surface}_VERIFICATION_OVERCLAIM`);
        if (provenance.provider === 'openstreetmap') {
          check(text.includes('© OpenStreetMap contributors'), `${label}_${surface}_CONTRIBUTORS`);
          check(count(text, 'ODbL 1.0') === 1, `${label}_${surface}_LICENSE_ONCE`);
        } else {
          check(text.includes('Google Maps'), `${label}_${surface}_GOOGLE_ATTRIBUTION`);
          check(!text.includes('OpenStreetMap') && !text.includes('ODbL'), `${label}_${surface}_NO_OSM_ATTRIBUTION`);
        }
        if (surface === 'Compare') {
          check(html.includes('data-provenance-density="compact"'), `${label}_COMPARE_COMPACT`);
        }
        if (surface === 'Detail' || surface === 'Decided') {
          const actions = provenance.providerActions;
          const sectionCount = surface === 'Detail'
            ? count(html, 'id="detail-provider-actions-title"')
            : count(html, 'class="decidedSecondaryActions"');
          check(sectionCount === (actions.length ? 1 : 0), `${label}_${surface}_ACTION_SECTION_COUNT`);
          for (const action of actions) check(count(html, `href="${action.href}"`) === 1,
            `${label}_${surface}_ACTION_LINK_ONCE`);
        }
      } else {
        check(!text.includes('ODbL'), `${label}_${surface}_NO_EXTERNAL_LICENSE`);
      }
      results.push({ cohort: label, surface, provenanceBlocks: blocks, passed: true });
    }
    for (const density of ['default', 'compact']) {
      const html = renderToStaticMarkup(React.createElement(ExternalCandidateProvenanceV3, { candidate, density }));
      check(count(html, 'data-external-provenance=') === (candidate.provenance ? 1 : 0),
        `${label}_${density}_SHARED_COMPONENT`);
      if (candidate.provenance) {
        check(!html.includes(candidate.provenance.providerEntityId), `${label}_${density}_NO_PROVIDER_ID`);
        check(!html.includes(candidate.provenance.sourceRetrievedAt), `${label}_${density}_NO_TIMESTAMP`);
      }
    }
  }
  const unresolved = { ...cases[0].candidate, provenance: { ...cases[0].candidate.provenance, duplicateStatus: 'unresolved' } };
  check(renderToStaticMarkup(React.createElement(ExternalCandidateProvenanceV3, { candidate: unresolved }))
    .includes('提供元間の同一性は確認中です'), 'UNRESOLVED_COPY_RETAINED');
  return results;
}

function verifySanitizer(sanitize, formal) {
  const events = ['candidate_detail_view', 'store_decided', 'map_click', 'official_click', 'phone_click'];
  const privateMarker = 'synthetic-private-analytics-marker';
  const aliases = Object.fromEntries([
    'candidate_id', 'external_id', 'provider_id', 'provider_entity_id', 'place_id', 'placeId', 'PlaceID',
    'osm_id', 'hashed_id', 'token', 'url', 'URL', 'phone', 'address', 'coordinates', 'latitude',
    'longitude', 'query', 'raw_response', 'api_key', 'cookie', 'session_marker', 'store_name',
  ].map((key) => [key, privateMarker]));
  let externalCases = 0;
  for (const event of events) for (const source of ['google', 'osm']) for (const reversed of [false, true]) {
    const fields = reversed
      ? { candidate_source: source, store_id: privateMarker, ...aliases }
      : { store_id: privateMarker, ...aliases, candidate_source: source };
    const payload = sanitize(event, fields);
    check(Object.keys(payload).length === 1 && payload.candidate_source === source,
      'EXTERNAL_SANITIZER_EXACT_ALLOWLIST');
    check(!hasOwn(payload, 'store_id') && !JSON.stringify(payload).includes(privateMarker),
      'EXTERNAL_SANITIZER_REDACTION');
    externalCases += 1;
  }
  for (const event of events) {
    const payload = sanitize(event, { store_id: formal.id, candidate_source: 'formal-reviewed' });
    check(payload.store_id === formal.id && payload.candidate_source === 'formal-reviewed',
      'FORMAL_SANITIZER_CONTRACT');
    const demo = sanitize(event, { store_id: 'synthetic-demo-marker' });
    check(demo.store_id === 'synthetic-demo-marker' && !hasOwn(demo, 'candidate_source'),
      'DEMO_SANITIZER_CONTRACT');
    const invalid = sanitize(event, { store_id: 'synthetic-demo-marker', candidate_source: 'invalid-source' });
    check(invalid.store_id === 'synthetic-demo-marker' && !hasOwn(invalid, 'candidate_source'),
      'INVALID_SOURCE_EXISTING_CONTRACT');
  }
  return { externalCases, formalCases: events.length, demoCases: events.length, invalidSourceCases: events.length };
}

function createBrowser(initialState, historyModule) {
  const timers = [], listeners = new Map(), storage = new Map();
  const history = { entries: [historyModule.createDecisionV3HistoryState(initialState)], index: 0,
    scrollRestoration: 'auto', get state() { return this.entries[this.index]; },
    replaceState(value) { this.entries[this.index] = structuredClone(value); },
    pushState(value) { this.entries.splice(this.index + 1); this.entries.push(structuredClone(value)); this.index += 1; } };
  const browser = { history, innerHeight: 844,
    location: { href: 'https://fixture.example/decision-functional-preview-v3', search: '', assign: denyNetwork },
    sessionStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
    addEventListener: (name, fn) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener: (name, fn) => listeners.get(name)?.delete(fn),
    setTimeout: (fn) => { timers.push(fn); return timers.length; }, clearTimeout: noOp,
    requestAnimationFrame: () => 1, cancelAnimationFrame: noOp, scrollTo: noOp,
    flushTimers: () => { while (timers.length) timers.shift()(); },
    travel: (offset) => { history.index += offset; for (const fn of listeners.get('popstate') ?? []) fn({ state: history.state }); },
  };
  return browser;
}

function createActualAppHarness(browser, source, candidates, analytics, rawEvents) {
  const slots = [], pendingEffects = [];
  let cursor = 0;
  const sameDeps = (left, right) => Boolean(left && right && left.length === right.length
    && left.every((value, index) => Object.is(value, right[index])));
  const hooks = {
    useReducer(reducer, argument, initialize) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: initialize ? initialize(argument) : argument };
      return [slots[index].value, (action) => { slots[index].value = reducer(slots[index].value, action); }];
    },
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, (value) => { slots[index].value = typeof value === 'function' ? value(slots[index].value) : value; }];
    },
    useRef(initial) { const index = cursor++; if (!slots[index]) slots[index] = { current: initial }; return slots[index]; },
    useMemo(factory, dependencies) {
      const index = cursor++;
      if (!slots[index] || !sameDeps(slots[index].dependencies, dependencies)) slots[index] = { value: factory(), dependencies };
      return slots[index].value;
    },
    useCallback(callback, dependencies) { return hooks.useMemo(() => callback, dependencies); },
    useEffect(effect, dependencies) {
      const index = cursor++;
      if (!slots[index] || !sameDeps(slots[index].dependencies, dependencies)) {
        const previous = slots[index];
        slots[index] = { dependencies, cleanup: previous?.cleanup };
        pendingEffects.push(() => { slots[index].cleanup?.(); slots[index].cleanup = effect(); });
      }
    },
  };
  class FixtureElement {
    constructor(href) { this.href = href; }
    closest(selector) { return selector === 'a[href]' ? this : null; }
    getAttribute(name) { return name === 'href' ? this.href : null; }
  }
  const appPath = path.join(root, 'components/decision-v3/DecisionV3App.tsx');
  const compiled = ts.transpileModule(fs.readFileSync(appPath, 'utf8'), {
    fileName: appPath, compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const leaf = (name) => Object.defineProperty(() => null, 'name', { value: name });
  const localRequire = (request) => {
    if (request === 'react') return hooks;
    if (request === 'react/jsx-runtime') return jsxRuntime;
    if (request === 'react-dom') return { flushSync: (callback) => callback() };
    if (request === '@/lib/analytics') return { ...analytics, trackAnalyticsEvent: (name, parameters) => {
      rawEvents.push({ name, parameters: { ...parameters } });
      return analytics.trackAnalyticsEvent(name, parameters);
    } };
    if (request.includes('/components/') || request.startsWith('./')) {
      if (request.endsWith('.css')) return { __esModule: true, default: {} };
      const name = path.basename(request);
      return { [name]: leaf(name) };
    }
    return request.startsWith('@/') ? load(request.slice(2)) : require(request);
  };
  const module = { exports: {} };
  const context = vm.createContext({ window: browser, document: { getElementById: () => null },
    Element: FixtureElement, URL, URLSearchParams, setTimeout: browser.setTimeout, clearTimeout: noOp });
  new vm.Script(`(function(require,module,exports){${compiled}\n})`, { filename: appPath })
    .runInContext(context)(localRequire, module, module.exports);
  const render = () => { cursor = 0; return module.exports.default({ candidateSource: source, candidates }); };
  const find = (element, name) => {
    if (!element || typeof element !== 'object') return null;
    if (element.type?.name === name) return element;
    for (const child of [element.props?.children].flat(Infinity)) { const found = find(child, name); if (found) return found; }
    return null;
  };
  return { render, find, state: () => slots[0].value,
    effects: () => { while (pendingEffects.length) pendingEffects.shift()(); },
    dispose: () => { for (const slot of slots) slot?.cleanup?.(); },
    click: (element, href) => element.props.onClickCapture({ target: new FixtureElement(href) }) };
}

function verifyAppCallbacks(cases, modules) {
  const { analytics, stateModule, historyModule, selectDecisionV3Candidates } = modules;
  const targetEvents = ['candidate_detail_view', 'store_decided', 'map_click', 'official_click', 'phone_click'];
  const results = [];
  for (const { label, candidate, source } of cases) {
    let conditions;
    for (const party of ['solo', 'pair', 'family', 'group']) for (const mood of ['hearty', 'light', 'relax', 'new-experience']) {
      const trial = { party, mood, budget: 'any', area: 'any' };
      if (!conditions && selectDecisionV3Candidates({ conditions: trial, preferences: [], candidates: [candidate] }).kind === 'matched') conditions = trial;
    }
    check(conditions, `${label}_APP_SELECTABLE`);
    let state = stateModule.createInitialDecisionV3State();
    for (const [group, value] of Object.entries(conditions)) state = stateModule.decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
    state = stateModule.decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: [candidate] });
    state = stateModule.decisionV3Reducer(state, { type: 'GO', step: 'candidates' });
    state = stateModule.decisionV3Reducer(state, { type: 'TOGGLE_COMPARE', candidateId: candidate.id });
    const browser = createBrowser(state, historyModule), rawEvents = [], sentEvents = [];
    browser.gtag = (command, name, payload) => { check(command === 'event', 'GTAG_COMMAND'); sentEvents.push({ name, payload }); };
    const previousWindow = globalThis.window;
    globalThis.window = browser;
    let harness;
    try {
      harness = createActualAppHarness(browser, source, [candidate], analytics, rawEvents);
      let element = harness.render();
      check(sentEvents.length === 0, `${label}_RENDER_EVENT_ZERO`);
      harness.effects(); element = harness.render(); browser.flushTimers();
      check(sentEvents.length === 0, `${label}_HYDRATION_EVENT_ZERO`);
      harness.find(element, 'CandidateListV3').props.onDetail(candidate.id);
      element = harness.render(); browser.flushTimers();
      check(harness.state().step === 'detail', `${label}_DETAIL_TRANSITION`);
      const actions = candidate.provenance?.providerActions ?? candidate.actions.filter(modules.isDecisionV3ActionDisplayable);
      const expectedActions = new Set();
      for (const action of actions) {
        const kind = action.kind ?? action.type;
        const event = { map: 'map_click', access: 'map_click', website: 'official_click', official: 'official_click', phone: 'phone_click' }[kind];
        if (!event || expectedActions.has(event)) continue;
        harness.click(element, action.href); expectedActions.add(event);
      }
      harness.find(element, 'DetailV3').props.onBack();
      element = harness.render(); browser.flushTimers();
      harness.find(element, 'CandidateListV3').props.onCompare();
      element = harness.render(); browser.flushTimers();
      const historyBeforeDecide = browser.history.entries.length;
      harness.find(element, 'CompareV3').props.onDecide(candidate.id);
      element = harness.render(); browser.flushTimers();
      check(harness.state().step === 'decided' && harness.state().chosenId === candidate.id, `${label}_DECIDED_STATE`);
      check(browser.history.entries.length === historyBeforeDecide + 1, `${label}_SINGLE_DECIDE_HISTORY`);
      const expectedNames = ['candidate_detail_view', 'store_decided', ...expectedActions];
      for (const name of expectedNames) check(sentEvents.filter((event) => event.name === name).length === 1,
        `${label}_EXPLICIT_EVENT_ONCE`);
      if (candidate.provenance) check(expectedNames.length === 5, `${label}_ALL_FIVE_CALL_SITES`);
      for (const event of [...rawEvents.map(({ name, parameters }) => ({ name, payload: parameters })), ...sentEvents]) {
        if (!targetEvents.includes(event.name)) continue;
        const expectedSource = candidate.provenance?.provider === 'google-places' ? 'google' : candidate.provenance ? 'osm' : source === 'demo' ? undefined : 'formal-reviewed';
        check(event.payload.candidate_source === expectedSource, `${label}_CALLER_SOURCE_CONTRACT`);
        if (candidate.provenance) {
          check(!hasOwn(event.payload, 'store_id'), `${label}_CALLER_AND_SINK_STORE_ID_ZERO`);
          const json = JSON.stringify(event.payload);
          check(!json.includes(candidate.id) && !json.includes(candidate.provenance.providerEntityId), `${label}_NO_IDENTIFIER_VALUE`);
        } else {
          check(event.payload.store_id === candidate.id, `${label}_FORMAL_DEMO_STORE_ID_RETAINED`);
        }
      }
      const eventCount = sentEvents.length;
      harness.dispose();
      harness = createActualAppHarness(browser, source, [candidate], analytics, rawEvents);
      harness.render(); harness.effects(); harness.render(); browser.flushTimers();
      check(harness.state().step === 'decided' && harness.state().chosenId === candidate.id, `${label}_RELOAD_DECIDED`);
      browser.travel(-1); harness.render(); browser.flushTimers();
      check(harness.state().step === 'compare', `${label}_BACK_COMPARE`);
      browser.travel(1); harness.render(); browser.flushTimers();
      check(harness.state().step === 'decided', `${label}_FORWARD_DECIDED`);
      check(sentEvents.length === eventCount, `${label}_RESTORE_EVENT_ZERO`);
      browser.travel(-1); element = harness.render();
      browser.gtag = () => { throw new Error('SYNTHETIC_ANALYTICS_FAILURE'); };
      harness.find(element, 'CompareV3').props.onDecide(candidate.id);
      harness.render(); browser.flushTimers();
      check(harness.state().step === 'decided' && harness.state().chosenId === candidate.id, `${label}_ANALYTICS_THROW_DECIDED`);
      results.push({ cohort: label, checkedExplicitEventKinds: expectedNames.length, storeDecidedCount: 1,
        renderAndHydrationEvents: 0, restoreResendEvents: 0, callerAndSanitizerPassed: true, analyticsThrowStateSafe: true });
    } finally {
      harness?.dispose();
      if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    }
  }
  return results;
}

try {
  installOfflineLoader();
  const external = load('lib/external-candidate-pool.ts');
  const { createDecisionV3CandidateLookup } = load('lib/decision-v3-candidate-lookup.ts');
  const ExternalCandidateProvenanceV3 = load('components/decision-v3/ExternalCandidateProvenanceV3.tsx').default;
  const formal = load('lib/decision-v3-formal-adapter.ts').getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: '2026-09-02', evaluatedAt: '2026-09-02T00:00:00.000Z',
  });
  check(formal.length === 9, 'FORMAL_NINE');
  const osmActionless = external.getOsmExternalCandidatePool().map(external.adaptExternalCandidatePoolRecord)
    .find((candidate) => candidate && candidate.provenance.providerActions.length === 0);
  check(osmActionless, 'ACTUAL_ACTIONLESS_OSM_EXISTS');
  const syntheticActions = [
    { kind: 'map', label: 'Synthetic map action', href: 'https://fixture.example/map' },
    { kind: 'website', label: 'Synthetic website action', href: 'https://fixture.example/website' },
    { kind: 'phone', label: 'Synthetic phone action', href: 'tel:+810000000000' },
  ];
  // Explicit synthetic hrefs exercise every caller; this does not manufacture
  // an OSM URL in the product adapter or change any provider/action contract.
  const osmActionable = { ...osmActionless, id: 'osm-synthetic-p1-candidate', name: 'Synthetic OSM candidate',
    provenance: { ...osmActionless.provenance, providerEntityId: 'synthetic-private-osm-entity',
      providerActions: syntheticActions, linkedProviderEntities: [] } };
  const google = { ...osmActionable, id: 'google-synthetic-p1-candidate', name: 'Synthetic Google candidate',
    provenance: { ...osmActionable.provenance, kind: 'external-live-google', provider: 'google-places',
      providerEntityId: 'synthetic-private-google-entity', label: 'Google Maps情報',
      attribution: { label: 'Google Maps', href: 'https://fixture.example/attribution', license: 'Google Maps Platform' } } };
  const { DEMO_CANDIDATES } = load('data/decision-v3-demo.ts');
  const cases = [
    { label: 'osm-actionless', candidate: osmActionless, source: 'external-preview' },
    { label: 'osm-actionable-synthetic', candidate: osmActionable, source: 'external-preview' },
    { label: 'google-synthetic', candidate: google, source: 'external-preview' },
    { label: 'formal', candidate: formal[0], source: 'formal' },
    { label: 'demo', candidate: DEMO_CANDIDATES[0], source: 'demo' },
  ];
  const surfaces = Object.fromEntries(['CandidateListV3', 'DetailV3', 'CompareV3', 'DecidedV3'].map((name, index) => [
    ['Candidates', 'Detail', 'Compare', 'Decided'][index], load(`components/decision-v3/${name}.tsx`)[name],
  ]));
  const analytics = load('lib/analytics.ts');
  const provenance = verifySurfaces(cases, { createDecisionV3CandidateLookup, ExternalCandidateProvenanceV3, surfaces });
  const sanitizer = verifySanitizer(analytics.sanitizeDecisionAnalyticsPayload, formal[0]);
  const appCallbacks = verifyAppCallbacks(cases.filter(({ label }) => label !== 'osm-actionless'), {
    analytics, stateModule: load('lib/decision-v3-state.ts'), historyModule: load('lib/decision-v3-history.ts'),
    selectDecisionV3Candidates: load('lib/decision-v3-selector.ts').selectDecisionV3Candidates,
    isDecisionV3ActionDisplayable: load('lib/decision-v3-action-gate.ts').isDecisionV3ActionDisplayable,
  });
  check(networkAttempts === 0, 'NETWORK_ATTEMPTS_ZERO');
  console.log(JSON.stringify({ status: 'PASS', provenance, sanitizer, appCallbacks, networkAttempts,
    liveGoogleRequests: 0, liveOsmRequests: 0, credentialReads: 0,
    note: 'Callback harness uses actual App, analytics, state, transition, session and history; real viewport/pointer QA remains a separate gate.' }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: 'FAIL', check: typeof error?.message === 'string'
    && error.message.startsWith('P1_FIXTURE_') ? error.message : 'P1_FIXTURE_UNEXPECTED_RUNTIME_ERROR', networkAttempts }));
  process.exitCode = 1;
} finally {
  for (const undo of restore.reverse()) undo();
}
