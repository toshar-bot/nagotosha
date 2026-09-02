import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Offline only. No credential reader, env-file loader, real key, or transport
// is needed. The UI leaf alone is stubbed; page, lookup, registry, eligibility,
// adapters, dedupe and the normalized OSM fixture are the actual modules.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const codePattern = /\.(?:[cm]?[jt]sx?)$/;
const skipDirectories = new Set(['.git', '.next', 'node_modules', 'public', 'content', 'docs', 'scripts']);
const forbidden = [
  'places.googleapis.com', 'places:searchNearby', 'GOOGLE_PLACES_API_KEY',
  'searchGooglePlacesNearby', 'getExternalPreviewDecisionV3CandidatesWithGoogle',
  'GOOGLE_PLACES_REQUEST_HEADER', 'GOOGLE_PLACES_SESSION_COOKIE',
  'shouldGrantGooglePlacesRequest', 'x-nagotosha-google-places-request',
  'nago.d1.google-places-used',
];
const providerPath = path.join(root, 'lib/google-places-provider.ts');
const pagePath = path.join(root, 'app/decision-functional-preview-v3/page.tsx');
const leafPath = path.join(root, 'components/decision-v3/DecisionV3App.tsx');
const relative = (file) => path.relative(root, file).replaceAll('\\', '/');

function walk(directory, skip = new Set()) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (skip.has(entry.name)) return [];
    const filename = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unreviewed symlink: ${relative(filename)}`);
    return entry.isDirectory() ? walk(filename, skip) : [filename];
  });
}

function sourceFile(filename, source) {
  return ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
}

function runtimeImports(filename, source) {
  const ast = sourceFile(filename, source);
  const imports = [];
  const add = (node) => {
    assert(node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)),
      `Unresolved dynamic runtime module path: ${relative(filename)}`);
    imports.push(node.text);
  };
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      const onlyTypeBindings = clause && !clause.name && clause.namedBindings
        && ts.isNamedImports(clause.namedBindings) && clause.namedBindings.elements.length > 0
        && clause.namedBindings.elements.every((binding) => binding.isTypeOnly);
      if (!clause?.isTypeOnly && !onlyTypeBindings) add(node.moduleSpecifier);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && !node.isTypeOnly) {
      const onlyTypeExports = node.exportClause && ts.isNamedExports(node.exportClause)
        && node.exportClause.elements.length > 0
        && node.exportClause.elements.every((binding) => binding.isTypeOnly);
      if (!onlyTypeExports) add(node.moduleSpecifier);
    } else if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly) {
      assert(ts.isExternalModuleReference(node.moduleReference),
        `Unsupported runtime import-equals: ${relative(filename)}`);
      add(node.moduleReference.expression);
    } else if (ts.isCallExpression(node)) {
      const expression = node.expression;
      const name = ts.isIdentifier(expression) ? expression.text : '';
      const member = ts.isPropertyAccessExpression(expression) ? expression.getText(ast) : '';
      if (expression.kind === ts.SyntaxKind.ImportKeyword || name === 'require'
        || member === 'require.resolve' || member === 'module.require'
        || member === 'import.meta.resolve') {
        add(node.arguments[0]);
      }
      assert(name !== 'eval' && name !== 'Function' && name !== 'createRequire'
        && member !== 'Module.createRequire' && member !== 'module.createRequire',
      `Unreviewed dynamic module construction: ${relative(filename)}`);
    } else if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)
      && node.expression.text === 'Function') {
      throw new Error(`Unreviewed dynamic module construction: ${relative(filename)}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return imports;
}

function verifyImportParser() {
  assert.deepEqual(runtimeImports('fixture.ts', `
    import type { T } from './types'; import { type U } from './types-two';
    import { live } from './direct'; export { live } from './reexport';
    export * from './barrel'; export type { V } from './types-three';
    const a = import('./dynamic'); const b = require('./commonjs');
    const c = require.resolve('./resolve'); module.require('./module');
  `), ['./direct', './reexport', './barrel', './dynamic', './commonjs', './resolve', './module']);
  for (const code of ['import(variable)', 'require(variable)', 'module.require(variable)',
    'require.resolve(variable)', 'import(`./${variable}`)', 'createRequire(import.meta.url)',
    'new Function("return 1")']) {
    assert.throws(() => runtimeImports('fixture.ts', code));
  }
}

function inspectSourceGraph() {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
  assert(!config.error, 'tsconfig parse failed');
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options;
  const localCode = walk(root, skipDirectories).filter((file) => codePattern.test(file));
  const entries = new Set(localCode.filter((file) => {
    const local = relative(file);
    return /^(?:src\/)?(?:app|pages)\//.test(local)
      || /^(?:src\/)?(?:middleware|instrumentation|instrumentation-client)\.[cm]?[jt]sx?$/.test(local);
  }));
  // Server actions can be reached by their action manifest, not just by a
  // normal component import; conservatively treat all source actions as roots.
  for (const file of localCode) {
    const ast = sourceFile(file, fs.readFileSync(file, 'utf8'));
    let action = false;
    function visit(node) {
      if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression)
        && node.expression.text === 'use server') action = true;
      ts.forEachChild(node, visit);
    }
    visit(ast);
    if (action) entries.add(file);
  }
  assert(entries.size > 0 && entries.has(pagePath), 'Deployed page entry was not discovered');
  const queue = [...entries];
  const visited = new Set();
  const externalModules = new Set();
  let edges = 0;
  while (queue.length) {
    const file = queue.shift();
    if (visited.has(file)) continue;
    visited.add(file);
    assert.notEqual(file, providerPath, `Provider is deployed-reachable: ${relative(file)}`);
    const bytes = fs.readFileSync(file, 'utf8');
    for (const token of forbidden) {
      assert(!bytes.includes(token), `Forbidden deployed token ${token} in ${relative(file)}`);
    }
    if (!codePattern.test(file)) continue;
    for (const request of runtimeImports(file, bytes)) {
      edges += 1;
      if (/^(?:node:|https?:)/.test(request)) {
        externalModules.add(request);
        continue;
      }
      const resolved = ts.resolveModuleName(request, file, options, ts.sys).resolvedModule;
      if (resolved && !resolved.isExternalLibraryImport
        && !resolved.resolvedFileName.includes('/node_modules/')
        && !resolved.resolvedFileName.includes('\\node_modules\\')) {
        const absolute = path.resolve(resolved.resolvedFileName);
        assert(!relative(absolute).startsWith('../'), 'Runtime module escaped repository');
        queue.push(absolute);
      } else if (request.startsWith('.') || request.startsWith('@/') || request.startsWith('/')) {
        const direct = request.startsWith('@/') ? path.join(root, request.slice(2))
          : path.resolve(path.dirname(file), request);
        assert(fs.existsSync(direct) && fs.statSync(direct).isFile(),
          `Unresolved local runtime import: ${relative(file)} -> ${request}`);
        queue.push(direct);
      } else {
        // Package dependencies are audited in the emitted Web runtime below.
        assert(resolved || require.resolve(request), 'Unresolved dependency');
        externalModules.add(request);
      }
    }
  }
  assert(!fs.existsSync(path.join(root, 'middleware.ts')),
    'Google grant middleware must have been removed');
  return { entryCount: entries.size, reachableLocalModules: visited.size,
    importEdges: edges, externalModuleLeaves: externalModules.size,
    googleProviderReachable: false, forbiddenTokens: 0, middlewareGrantMechanism: 0 };
}

function inspectBuild(nextDirectory) {
  const next = path.resolve(nextDirectory);
  assert(fs.existsSync(path.join(next, 'BUILD_ID')), 'A completed fresh build is required');
  const server = path.join(next, 'server');
  for (const file of ['middleware-manifest.json', 'server-reference-manifest.json']) {
    assert(fs.existsSync(path.join(server, file)), `Missing build manifest: ${file}`);
  }
  assert(fs.existsSync(path.join(next, 'routes-manifest.json')), 'Missing routes manifest');
  assert(fs.existsSync(path.join(server, 'app-paths-manifest.json')), 'Missing app route manifest');
  const appManifest = JSON.parse(fs.readFileSync(path.join(server, 'app-paths-manifest.json'), 'utf8'));
  assert(appManifest['/decision-functional-preview-v3/page'], 'Preview route missing from build');
  const middleware = JSON.parse(fs.readFileSync(path.join(server, 'middleware-manifest.json'), 'utf8'));
  assert.deepEqual(middleware.middleware ?? {}, {}, 'Deployed middleware unexpectedly exists');
  const files = [...walk(server), path.join(next, 'routes-manifest.json')]
    .filter((file) => /\.(?:js|json|html|rsc)$/.test(file));
  assert(files.some((file) => relative(file).includes('chunks')), 'No server chunks audited');
  for (const file of files) {
    const bytes = fs.readFileSync(file, 'utf8');
    for (const token of forbidden) {
      assert(!bytes.includes(token), `Forbidden build token ${token} in ${path.relative(next, file)}`);
    }
  }
  return { status: 'PASS', serverArtifactsScanned: files.length, forbiddenTokens: 0,
    manifestsVerified: ['middleware', 'server-reference', 'routes', 'app-paths'] };
}

async function invokeActualPage() {
  const original = {
    resolve: Module._resolveFilename, load: Module._load,
    ts: Module._extensions['.ts'], tsx: Module._extensions['.tsx'],
    environment: process.env, date: globalThis.Date, fetch: globalThis.fetch,
  };
  const initialCache = new Set(Object.keys(require.cache));
  const counters = { fetch: 0, network: 0, providerModule: 0, requestHeaders: 0 };
  const restorers = [];
  function deny() {
    counters.network += 1;
    throw new Error('OFFLINE_FIXTURE_NETWORK_FORBIDDEN');
  }
  function patch(object, key) {
    if (typeof object[key] !== 'function') return;
    const previous = object[key];
    object[key] = deny;
    restorers.push(() => { object[key] = previous; });
  }
  const DecisionV3AppProbe = (props) => props;
  const realDate = original.date;
  class FixtureDate extends realDate {
    constructor(...args) { super(...(args.length ? args : ['2026-08-30T00:00:00.000Z'])); }
    static now() { return new realDate('2026-08-30T00:00:00.000Z').getTime(); }
  }
  try {
    for (const name of ['node:http', 'node:https']) {
      const transport = require(name);
      patch(transport, 'request'); patch(transport, 'get');
    }
    const net = require('node:net');
    patch(net, 'connect'); patch(net, 'createConnection'); patch(net.Socket.prototype, 'connect');
    patch(require('node:tls'), 'connect'); patch(require('node:http2'), 'connect');
    patch(require('node:dgram'), 'createSocket');
    const dns = require('node:dns');
    for (const key of ['lookup', 'lookupService', 'resolve', 'resolve4', 'resolve6',
      'resolveAny', 'resolveCname', 'resolveMx', 'resolveNs', 'resolveSoa', 'resolveSrv',
      'resolveTxt', 'reverse']) {
      patch(dns, key); patch(dns.promises, key);
    }
    const children = require('node:child_process');
    for (const key of ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork']) {
      patch(children, key);
    }
    globalThis.fetch = async () => {
      counters.fetch += 1;
      throw new Error('OFFLINE_FIXTURE_FETCH_FORBIDDEN');
    };
    globalThis.Date = FixtureDate;
    Module._resolveFilename = function resolve(request, parent, isMain, options) {
      return original.resolve.call(this,
        request.startsWith('@/') ? path.join(root, request.slice(2)) : request,
        parent, isMain, options);
    };
    Module._load = function load(request, parent, isMain) {
      if (request === 'next/headers') {
        counters.requestHeaders += 1;
        throw new Error('REMOVED_REQUEST_GRANT_PATH_REACHED');
      }
      const resolved = Module._resolveFilename(request, parent, isMain);
      if (resolved === leafPath) return { __esModule: true, default: DecisionV3AppProbe };
      if (resolved === providerPath) {
        counters.providerModule += 1;
        throw new Error('DEPLOYED_GOOGLE_PROVIDER_REACHED');
      }
      return original.load.call(this, request, parent, isMain);
    };
    function compile(module, filename) {
      const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true },
        fileName: filename,
      });
      module._compile(result.outputText, filename);
    }
    Module._extensions['.ts'] = compile;
    Module._extensions['.tsx'] = compile;
    process.env = { NODE_ENV: 'production' };
    const page = require(pagePath).default;
    assert.equal(typeof page, 'function', 'Actual Preview page export missing');
    const oldFlags = {
      EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED: 'true',
      GOOGLE_PLACES_PROVIDER_ENABLED: 'true', GOOGLE_PLACES_PREVIEW_ENABLED: 'true',
    };
    const cases = [
      { name: 'no_flags', env: {}, area: 'meieki', source: 'formal' },
      { name: 'local_development_explicit_demo', env: { NODE_ENV: 'development' }, source: 'demo' },
      { name: 'preview_no_flags', env: { NODE_ENV: 'production', VERCEL_ENV: 'preview' }, source: 'demo' },
      { name: 'preview_valid_meieki', env: { NODE_ENV: 'production', VERCEL_ENV: 'preview', ...oldFlags }, area: 'meieki', source: 'external-preview' },
      { name: 'preview_valid_sakae', env: { NODE_ENV: 'production', VERCEL_ENV: 'preview', ...oldFlags }, area: 'sakae', source: 'external-preview' },
      { name: 'preview_valid_osu', env: { NODE_ENV: 'production', VERCEL_ENV: 'preview', ...oldFlags }, area: 'osu', source: 'external-preview' },
      { name: 'preview_missing_area', env: { NODE_ENV: 'production', VERCEL_ENV: 'preview', ...oldFlags }, source: 'demo' },
      { name: 'preview_invalid_area', env: { NODE_ENV: 'production', VERCEL_ENV: 'preview', ...oldFlags }, area: 'invalid', source: 'demo' },
      { name: 'preview_any_area', env: { NODE_ENV: 'production', VERCEL_ENV: 'preview', ...oldFlags }, area: 'any', source: 'demo' },
      { name: 'production_all_old_flags', env: { NODE_ENV: 'production', VERCEL_ENV: 'production', ...oldFlags }, area: 'meieki', source: 'formal' },
      { name: 'production_overrides_development_node', env: { NODE_ENV: 'development', VERCEL_ENV: 'production', ...oldFlags }, area: 'meieki', source: 'formal' },
      { name: 'unknown_vercel_environment', env: { NODE_ENV: 'production', VERCEL_ENV: 'unknown', ...oldFlags }, area: 'meieki', source: 'formal' },
      { name: 'local_development_external', env: { NODE_ENV: 'development', ...oldFlags }, area: 'meieki', source: 'external-preview' },
    ];
    function check(element, test) {
      assert.equal(element.type, DecisionV3AppProbe, `${test.name}: actual page leaf`);
      assert.equal(element.props.candidateSource, test.source, `${test.name}: source`);
      const candidates = element.props.candidates;
      assert(Array.isArray(candidates), `${test.name}: candidates missing`);
      const counts = {
        formal: candidates.filter((c) => !c.provenance && !c.id.startsWith('demo-')).length,
        demo: candidates.filter((c) => c.id.startsWith('demo-')).length,
        osm: candidates.filter((c) => c.provenance?.kind === 'external-catalog-osm').length,
        google: candidates.filter((c) => c.provenance?.kind === 'external-live-google').length,
      };
      assert.equal(counts.google, 0, `${test.name}: Google candidate`);
      if (test.source === 'formal') assert.deepEqual(counts, { formal: 9, demo: 0, osm: 0, google: 0 });
      if (test.source === 'demo') assert.deepEqual(counts, { formal: 0, demo: 3, osm: 0, google: 0 });
      if (test.source === 'external-preview') {
        assert.equal(counts.formal, 9); assert.equal(counts.demo, 0); assert(counts.osm > 0);
      }
      return { name: test.name, source: test.source, ...counts };
    }
    const results = [];
    for (const test of cases) {
      process.env = { ...test.env };
      results.push(check(await page({ searchParams: test.area ? { externalArea: test.area } : undefined }), test));
    }
    const concurrent = cases.find((test) => test.name === 'preview_valid_sakae');
    process.env = { ...concurrent.env };
    const requests = await Promise.all([0, 1].map(() => page({ searchParams: { externalArea: 'sakae' } })));
    for (const element of requests) check(element, concurrent);
    assert.deepEqual(counters, { fetch: 0, network: 0, providerModule: 0, requestHeaders: 0 });
    return { clock: '2026-08-30T00:00:00.000Z (isolated fixture only)', cases: results,
      concurrentPageInvocations: 2, googleGrantCount: 0, googleProviderCalls: 0,
      googleTransportCalls: 0, allNetworkAttempts: 0,
      concurrentInterpretation: 'unsafe live path removed; not a cookie exactly-once claim' };
  } finally {
    process.env = original.environment; globalThis.Date = original.date;
    globalThis.fetch = original.fetch;
    Module._resolveFilename = original.resolve; Module._load = original.load;
    for (const [extension, handler] of [['.ts', original.ts], ['.tsx', original.tsx]]) {
      if (handler) Module._extensions[extension] = handler;
      else delete Module._extensions[extension];
    }
    for (const restore of restorers.reverse()) restore();
    for (const filename of Object.keys(require.cache)) {
      if (!initialCache.has(filename) && filename.startsWith(root + path.sep)
        && !filename.includes(path.sep + 'node_modules' + path.sep)) delete require.cache[filename];
    }
  }
}

verifyImportParser();
const graph = inspectSourceGraph();
const page = await invokeActualPage();
const args = process.argv.slice(2);
assert(args.length === 0 || (args.length === 2 && args[0] === '--build-dir'),
  'Usage: node scripts/verify-d2r-google-runtime-unreachable-fixture.mjs [--build-dir <isolated .next>]');
const build = args.length ? inspectBuild(args[1]) : { status: 'NOT_RUN',
  reason: 'Run again with --build-dir after an isolated fresh build; no build PASS is inferred.' };
console.log(JSON.stringify({ status: 'PASS', gate: 'DEPLOYED_GOOGLE_LIVE_PATH_UNREACHABLE',
  sourceGraph: graph, actualPage: page, buildArtifacts: build,
  googleLiveRequests: 0, osmLiveRequests: 0, credentialReads: 0 }, null, 2));
