import fs from 'node:fs';
import Module, { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createGooglePlacesProbeBudget, createObservedGooglePlacesFetch } from './lib/d2-google-places-probe-observer.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = 'lib/google-places-provider.ts#searchGooglePlacesNearby';
const SENTINELS = [
  'SENTINEL_MESSAGE_MUST_NOT_SURVIVE', 'SENTINEL_DESCRIPTION_MUST_NOT_SURVIVE',
  'SENTINEL_METADATA_MUST_NOT_SURVIVE', 'SENTINEL_URL_MUST_NOT_SURVIVE',
  'SENTINEL_PHONE_MUST_NOT_SURVIVE', 'SENTINEL_ADDRESS_MUST_NOT_SURVIVE',
];

function check(condition, label) {
  if (!condition) throw new Error(label); // Labels only; never serialize failed payloads.
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', 'X-Synthetic': 'fixture' } });
}

function syntheticPlace() {
  return {
    id: 'places/synthetic-observer-only', displayName: { text: 'Synthetic observer fixture' },
    primaryType: 'restaurant', businessStatus: 'OPERATIONAL', location: { latitude: 0, longitude: 0 },
    googleMapsUri: 'https://example.invalid/synthetic-map', formattedAddress: SENTINELS[5],
    nationalPhoneNumber: SENTINELS[4], websiteUri: SENTINELS[3],
  };
}

function rpcError(code, status, details = []) {
  return { error: { code, status, message: SENTINELS[0], details } };
}

const errorInfo = (reason) => ({
  '@type': 'type.googleapis.com/google.rpc.ErrorInfo', reason, domain: SENTINELS[3], metadata: { ignored: SENTINELS[2] },
});
const badRequest = (field, reason) => ({
  '@type': 'type.googleapis.com/google.rpc.BadRequest',
  fieldViolations: [{ field, reason, description: SENTINELS[1] }],
});

function evidenceSchema(record) {
  const integer = { type: 'integer', minimum: 0 };
  const strings = { type: 'array', maxItems: 20, uniqueItems: true, items: { type: 'string', maxLength: 128 } };
  const scalar = (value) => Array.isArray(value) ? strings : typeof value === 'boolean' ? { type: 'boolean' }
    : typeof value === 'number' ? integer : { type: 'string' };
  const requestProperties = Object.fromEntries(Object.entries(record.request).map(([key, value]) => [key, scalar(value)]));
  requestProperties.slot_index = { type: 'integer', minimum: 1, maximum: 3 };
  requestProperties.area = { enum: ['meieki', 'sakae', 'osu'] };
  requestProperties.max_result_count = { type: ['integer', 'null'], minimum: 1, maximum: 20 };
  for (const key of ['provider_source_sha256', 'redacted_body_contract_sha256']) requestProperties[key] = { type: 'string', pattern: '^[a-f0-9]{64}$' };
  const responseProperties = {
    status_source: { enum: ['original_fetch_response', 'UNAVAILABLE'] },
    transport_status: { anyOf: [integer, { const: 'UNAVAILABLE' }] },
    transport_ok: { type: ['boolean', 'null'] }, elapsed_ms: integer,
    content_type_class: { enum: ['JSON', 'OTHER', 'ABSENT', 'UNAVAILABLE'] },
    body_parse_state: { enum: ['JSON_PARSED', 'NON_JSON', 'MALFORMED_JSON', 'TOO_LARGE', 'READ_FAILED', 'UNAVAILABLE'] },
    returned_places_count: { anyOf: [integer, { const: 'UNAVAILABLE' }] },
    error_code: { type: ['integer', 'null'], minimum: 0, maximum: 599 },
    rpc_status: { type: ['string', 'null'], pattern: '^[A-Z][A-Z0-9_]{0,62}$' },
    error_info_reasons: { ...strings, items: { type: 'string', pattern: '^[A-Z][A-Z0-9_]{0,62}$' } },
    bad_request_fields: { ...strings, items: { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9_.\\[\\]-]{0,127}$' } },
    field_violation_reasons: { ...strings, items: { type: 'string', pattern: '^[A-Z][A-Z0-9_]{0,62}$' } },
    quota_violation_count: integer, invalid_identifier_count: integer,
    transport_exception_class: { enum: ['AbortError', 'TypeError', 'Error', null] },
  };
  const object = (properties) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'D2R sanitized provider transport evidence v1',
    ...object({ schemaVersion: { const: 1 }, request: object(requestProperties), response: object(responseProperties),
      retention: object(Object.fromEntries(Object.keys(record.retention).map((key) => [key, { const: false }]))),
    }),
  };
}

/** No artifact I/O here: callers may persist only the sanitized returned report. */
export async function runGooglePlacesObserverFixture() {
  const restore = [];
  const originalFetch = globalThis.fetch;
  const originalResolveFilename = Module._resolveFilename;
  const originalTsExtension = Module._extensions['.ts'];
  let networkAttempts = 0;
  let firstActualRequest;
  const denyNetwork = () => { networkAttempts += 1; throw new Error('BLOCKED_D2R_OFFLINE_NETWORK_ATTEMPT'); };
  try {
    globalThis.fetch = denyNetwork;
    // Also deny non-fetch transports, without logging destinations or arguments.
    for (const [moduleName, names] of [
      ['node:http', ['request', 'get']], ['node:https', ['request', 'get']],
      ['node:net', ['connect', 'createConnection']], ['node:tls', ['connect']],
      ['node:dns', ['lookup', 'resolve', 'resolve4', 'resolve6']],
    ]) {
      const module = require(moduleName);
      for (const name of names) {
        const previous = module[name];
        module[name] = denyNetwork;
        restore.push(() => { module[name] = previous; });
      }
    }
    const socketPrototype = require('node:net').Socket.prototype;
    const originalConnect = socketPrototype.connect;
    socketPrototype.connect = denyNetwork;
    restore.push(() => { socketPrototype.connect = originalConnect; });
    const records = [];
    const results = [];
    let totalTransportCalls = 0;
    const providerSourceSha256 = createHash('sha256').update(fs.readFileSync(path.join(root, 'lib/google-places-provider.ts'))).digest('hex');
    const typescript = require('typescript');
    Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
      return originalResolveFilename.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, isMain, options);
    };
    Module._extensions['.ts'] = function compileTypeScript(module, filename) {
      const output = typescript.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { target: typescript.ScriptTarget.ES2020, module: typescript.ModuleKind.CommonJS,
          jsx: typescript.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true }, fileName: filename,
      });
      module._compile(output.outputText, filename);
    };
    const { searchGooglePlacesNearby } = require(path.join(root, 'lib/google-places-provider.ts'));
    const environment = Object.freeze({
      NODE_ENV: 'production', VERCEL_ENV: 'preview', EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED: 'true',
      GOOGLE_PLACES_PROVIDER_ENABLED: 'true', GOOGLE_PLACES_PREVIEW_ENABLED: 'true',
      GOOGLE_PLACES_API_KEY: 'synthetic-observer-token',
    });
    const now = new Date('2026-09-02T00:00:00Z');
    const providerBudget = { allowLiveRequest: true, maxRequests: 1, timeoutMs: 1000 };
    const invoke = (area = 'meieki', timeoutMs = 1000) => searchGooglePlacesNearby(area, { ...providerBudget, timeoutMs }, now, environment);
    const makeObserver = (transport, budget, area, onRecord) => createObservedGooglePlacesFetch({
      transport, budget, area, providerEntryPoint: ENTRY, providerSourceSha256, onRecord,
    });

    async function runCase(name, factory, expected, options = {}) {
      let providerFetchCalls = 0;
      let transportCalls = 0;
      let originalResponse;
      let identical = false;
      let callInput;
      let callInit;
      const caseRecords = [];
      const budget = createGooglePlacesProbeBudget(1);
      const observer = makeObserver(async (input, init) => {
        check(input === callInput && init === callInit, 'TRANSPORT_ARGUMENT_IDENTITY');
        transportCalls += 1;
        totalTransportCalls += 1;
        originalResponse = await factory(init);
        return originalResponse;
      }, budget, 'meieki', (record) => caseRecords.push(record));
      globalThis.fetch = async (input, init) => {
        providerFetchCalls += 1;
        callInput = input;
        callInit = init;
        if (!firstActualRequest) firstActualRequest = { input, init };
        const response = await observer(input, init);
        identical = response === originalResponse;
        check(!response.bodyUsed, 'ORIGINAL_BODY_CONSUMED_BEFORE_PROVIDER');
        return response;
      };
      let mapped;
      try { mapped = await invoke('meieki', options.timeoutMs ?? 1000); }
      finally { globalThis.fetch = denyNetwork; }
      check(providerFetchCalls === 1 && transportCalls === 1 && caseRecords.length === 1, 'ACTUAL_PROVIDER_INVOCATION_COUNT');
      const record = caseRecords[0];
      check(record.request.slot_index === 1 && record.request.area === 'meieki', 'SLOT_RESPONSE_ASSOCIATION');
      check(record.request.provider_entry_point === ENTRY && record.request.provider_source_sha256 === providerSourceSha256, 'ACTUAL_SOURCE_BINDING');
      check(record.request.endpoint_match && record.request.method === 'POST', 'ACTUAL_REQUEST_METHOD_ENDPOINT');
      check(record.request.api_key_header_present && record.request.field_mask_token_count === 12, 'ACTUAL_REQUEST_HEADERS');
      check(record.request.coordinate_values_valid && record.request.radius_valid && record.request.body_json_valid, 'ACTUAL_REQUEST_BODY');
      check(record.response.transport_status === expected.status, 'TRANSPORT_STATUS_NOT_PRESERVED');
      check(record.response.status_source === (expected.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'original_fetch_response'), 'STATUS_SOURCE');
      check(record.response.body_parse_state === expected.parse, 'BODY_PARSE_STATE');
      check(record.response.returned_places_count === (expected.returned ?? 'UNAVAILABLE'), 'RETURNED_PLACES_COUNT');
      check(mapped.length === (expected.mapped ?? 0), 'ACTUAL_MAPPED_COUNT');
      check(record.response.rpc_status === (expected.rpc ?? null), 'RPC_STATUS');
      check(record.response.transport_exception_class === (expected.exception ?? null), 'EXCEPTION_CLASS');
      if (originalResponse) {
        check(identical, 'OBSERVER_RESPONSE_OBJECT_CHANGED');
        check(originalResponse.status === expected.status && originalResponse.headers.get('x-synthetic') === (options.noMarker ? null : 'fixture'), 'RESPONSE_HEADERS_CHANGED');
        if (expected.status === 200) check(originalResponse.bodyUsed, 'ACTUAL_PROVIDER_DID_NOT_PARSE_ORIGINAL');
        else check(!originalResponse.bodyUsed, 'OBSERVER_CONSUMED_ERROR_ORIGINAL');
      }
      if (!options.skipBaseline) {
        globalThis.fetch = async (_input, init) => { totalTransportCalls += 1; return factory(init); };
        let withoutObserver;
        try { withoutObserver = await invoke('meieki', options.timeoutMs ?? 1000); }
        finally { globalThis.fetch = denyNetwork; }
        check(JSON.stringify(mapped) === JSON.stringify(withoutObserver), 'OBSERVER_CHANGED_PROVIDER_RESULT');
      }
      options.verify?.(record);
      records.push(record);
      results.push({ case: name, pass: true, actual_provider_invoked: true, observed_fetch_calls: providerFetchCalls,
        transport_calls: transportCalls, slot_index: 1, transport_status: record.response.transport_status,
        status_source: record.response.status_source, body_parse_state: record.response.body_parse_state,
        returned_places_count: record.response.returned_places_count, mapped_candidate_count: mapped.length,
        original_response_identity: originalResponse ? identical : 'NOT_APPLICABLE', provider_result_unchanged: true });
      return record;
    }

    await runCase('A_SUCCESS_ZERO', () => jsonResponse({ places: [] }), { status: 200, parse: 'JSON_PARSED', returned: 0 });
    await runCase('B_SUCCESS_ONE', () => jsonResponse({ places: [syntheticPlace()] }), { status: 200, parse: 'JSON_PARSED', returned: 1, mapped: 1 });
    await runCase('B2_MAPPER_FILTER_DISTINCTION', () => jsonResponse({ places: [syntheticPlace(), {}] }), { status: 200, parse: 'JSON_PARSED', returned: 2, mapped: 1 });
    await runCase('C_HTTP_400', () => jsonResponse(rpcError(400, 'INVALID_ARGUMENT', [
      badRequest('includedTypes[0]', 'INVALID_VALUE'), errorInfo('INVALID_REQUEST'),
    ]), 400), { status: 400, parse: 'JSON_PARSED', rpc: 'INVALID_ARGUMENT' }, {
      verify: (record) => {
        check(record.response.error_info_reasons[0] === 'INVALID_REQUEST', 'ERROR_INFO_REASON');
        check(record.response.bad_request_fields[0] === 'includedTypes[0]', 'BAD_REQUEST_FIELD');
        check(record.response.field_violation_reasons[0] === 'INVALID_VALUE', 'FIELD_VIOLATION_REASON');
        check(record.response.error_code === 400, 'ERROR_CODE');
      },
    });
    await runCase('D_HTTP_403', () => jsonResponse(rpcError(403, 'PERMISSION_DENIED', [
      errorInfo('API_KEY_SERVICE_BLOCKED'), errorInfo('invalid reason'),
    ]), 403), { status: 403, parse: 'JSON_PARSED', rpc: 'PERMISSION_DENIED' }, {
      verify: (record) => check(record.response.error_info_reasons.length === 1 && record.response.invalid_identifier_count === 1, 'INVALID_REASON_NOT_DROPPED'),
    });
    await runCase('E_HTTP_429', () => jsonResponse(rpcError(429, 'RESOURCE_EXHAUSTED', [{
      '@type': 'type.googleapis.com/google.rpc.QuotaFailure', violations: [{ subject: SENTINELS[3], description: SENTINELS[1] }],
    }]), 429), { status: 429, parse: 'JSON_PARSED', rpc: 'RESOURCE_EXHAUSTED' }, {
      verify: (record) => check(record.response.quota_violation_count === 1, 'QUOTA_COUNT'),
    });
    await runCase('F_HTTP_500', () => jsonResponse(rpcError(500, 'INTERNAL'), 500), { status: 500, parse: 'JSON_PARSED', rpc: 'INTERNAL' });
    await runCase('G_NON_JSON', () => new Response(SENTINELS[0], { status: 502, headers: { 'Content-Type': 'text/html' } }), { status: 502, parse: 'NON_JSON' }, { noMarker: true });
    await runCase('H_MALFORMED_JSON', () => new Response('{', { status: 400, headers: { 'Content-Type': 'application/json' } }), { status: 400, parse: 'MALFORMED_JSON' }, { noMarker: true });
    await runCase('I_TOO_LARGE', () => new Response(' '.repeat(2 * 1024 * 1024 + 1), { status: 500, headers: { 'Content-Type': 'application/json' } }), { status: 500, parse: 'TOO_LARGE' }, { noMarker: true });
    await runCase('I2_CLONE_READ_FAILURE', () => new Response(new ReadableStream({
      start(controller) { controller.error(new Error(SENTINELS[0])); },
    }), { status: 500, headers: { 'Content-Type': 'application/json' } }), { status: 500, parse: 'READ_FAILED' }, { noMarker: true });
    await runCase('J_ABORT_ERROR', (init) => new Promise((_resolve, reject) => {
      const abort = () => reject(new DOMException(SENTINELS[0], 'AbortError'));
      if (init.signal.aborted) abort();
      else init.signal.addEventListener('abort', abort, { once: true });
    }), { status: 'UNAVAILABLE', parse: 'UNAVAILABLE', exception: 'AbortError' }, { timeoutMs: 10 });
    await runCase('K_TYPE_ERROR', () => { throw new TypeError(SENTINELS[0]); }, { status: 'UNAVAILABLE', parse: 'UNAVAILABLE', exception: 'TypeError' });
    await runCase('L_IDENTIFIER_BOUNDS', () => jsonResponse(rpcError(400, 'invalid status', [
      ...Array.from({ length: 25 }, (_, index) => errorInfo(`REASON_${String(index).padStart(2, '0')}`)),
      errorInfo('REASON_00'), errorInfo('X'.repeat(64)),
      badRequest('field/invalid', 'invalid reason'), badRequest('x'.repeat(129), 'VALID_REASON'),
      badRequest('field[0]', 'VALID_REASON'),
    ]), 400), { status: 400, parse: 'JSON_PARSED' }, {
      verify: (record) => {
        check(record.response.invalid_identifier_count === 5, 'INVALID_IDENTIFIER_COUNT');
        check(record.response.error_info_reasons.length === 20, 'REASON_ARRAY_CAP');
        check(record.response.error_info_reasons.join(',') === [...new Set(record.response.error_info_reasons)].sort().join(','), 'IDENTIFIER_SORT_DEDUPE');
        check(record.response.bad_request_fields.length === 1 && record.response.field_violation_reasons.length === 1, 'FIELD_FILTER_DEDUPE');
      },
    });

    // All direct observer edge tests reuse input/init captured from the actual
    // provider. No request body or mapper is reimplemented in this fixture.
    const { input, init } = firstActualRequest;
    let capCalls = 0;
    let capFetchCalls = 0;
    const capRecords = [];
    const capBudget = createGooglePlacesProbeBudget(3);
    const capObserver = makeObserver(async () => { capCalls += 1; totalTransportCalls += 1; return jsonResponse({ places: [] }); }, capBudget, 'meieki', (r) => capRecords.push(r));
    globalThis.fetch = (...args) => { capFetchCalls += 1; return capObserver(...args); };
    try { for (let index = 0; index < 4; index += 1) check((await invoke()).length === 0, 'HARD_CAP_PROVIDER_RETURN'); }
    finally { globalThis.fetch = denyNetwork; }
    check(capCalls === 3 && capFetchCalls === 4 && capRecords.length === 3, 'HARD_CAP_TRANSPORT_INTEGRATION');
    check(capBudget.snapshot().blocked === 1 && capRecords.every((r, index) => r.request.slot_index === index + 1 && r.response.transport_status === 200), 'HARD_CAP_SLOT_ASSOCIATION');
    records.push(...capRecords);
    results.push({ case: 'HARD_CAP_ACTUAL_PROVIDER', pass: true, actual_provider_invoked: true, observed_fetch_calls: capFetchCalls,
      transport_calls: capCalls, blocked_before_transport: 1, slots: capRecords.map((r) => r.request.slot_index), mapped_candidate_count: 0 });

    const concurrentBudget = createGooglePlacesProbeBudget(1);
    let concurrentCalls = 0;
    const concurrentRecords = [];
    const transport = async () => { concurrentCalls += 1; totalTransportCalls += 1; await new Promise((resolve) => setTimeout(resolve, 5)); return jsonResponse({ places: [] }); };
    const first = makeObserver(transport, concurrentBudget, 'meieki', (r) => concurrentRecords.push(r));
    const second = makeObserver(transport, concurrentBudget, 'sakae', (r) => concurrentRecords.push(r));
    const pendingConcurrent = [first(input, init), second(input, init)];
    check(concurrentBudget.snapshot().reserved === 1 && concurrentBudget.snapshot().blocked === 1, 'SLOT_RESERVATION_NOT_SYNCHRONOUS');
    const settled = await Promise.allSettled(pendingConcurrent);
    check(concurrentBudget.snapshot().reserved === 1 && concurrentBudget.snapshot().blocked === 1 && concurrentCalls === 1, 'CONCURRENT_HARD_CAP');
    check(settled.filter((r) => r.status === 'fulfilled').length === 1 && concurrentRecords.length === 1, 'CONCURRENT_RESULT');
    check(settled[1].status === 'rejected' && settled[1].reason.name === 'ProbeHardCapError', 'BLOCKED_BEFORE_TRANSPORT');
    await settled[0].value.json();
    records.push(...concurrentRecords);

    let requestIdentity = false;
    const originalRequest = new Request(input, init);
    const requestRecord = [];
    const requestObserver = makeObserver(async (received, receivedInit) => {
      requestIdentity = received === originalRequest && receivedInit === undefined;
      check(!received.bodyUsed && (await received.json()).maxResultCount === 20, 'REQUEST_INSPECTION_CONSUMED_ORIGINAL');
      totalTransportCalls += 1;
      return jsonResponse({ places: [] });
    }, createGooglePlacesProbeBudget(1), 'meieki', (r) => requestRecord.push(r));
    await (await requestObserver(originalRequest)).json();
    check(requestIdentity && requestRecord[0].request.body_type === 'Request', 'REQUEST_IDENTITY');
    records.push(...requestRecord);

    // Distinct coordinates must produce the same redacted contract digest.
    const areaRecords = [];
    const areaBudget = createGooglePlacesProbeBudget(3);
    for (const area of ['meieki', 'sakae', 'osu']) {
      globalThis.fetch = makeObserver(async () => { totalTransportCalls += 1; return jsonResponse({ places: [] }); }, areaBudget, area, (r) => areaRecords.push(r));
      try { await invoke(area); } finally { globalThis.fetch = denyNetwork; }
    }
    check(new Set(areaRecords.map((r) => r.request.redacted_body_contract_sha256)).size === 1, 'COORDINATE_REDACTION_DIGEST');
    records.push(...areaRecords);

    const sinkResponse = jsonResponse({ places: [] });
    const sinkObserver = makeObserver(async () => { totalTransportCalls += 1; return sinkResponse; }, createGooglePlacesProbeBudget(1), 'meieki', () => { throw new Error(SENTINELS[0]); });
    check(await sinkObserver(input, init) === sinkResponse, 'SINK_FAILURE_RESPONSE_MUTATION');
    await sinkResponse.json();

    // The serialized evidence is the retention boundary. Response-only fields
    // and arbitrary human text never cross it, even in synthetic form.
    const serialized = JSON.stringify(records);
    for (const sentinel of SENTINELS) check(!serialized.includes(sentinel), 'SANITIZER_SENTINEL_LEAK');
    for (const forbidden of ['synthetic-observer-token', 'synthetic-observer-only', 'Synthetic observer fixture', 'example.invalid', '"formattedAddress":', '"nationalPhoneNumber":']) {
      check(!serialized.includes(forbidden), 'PLACE_OR_SECRET_RETENTION');
    }
    check(records.every((r) => Object.values(r.retention).every((value) => value === false)), 'RETENTION_FLAGS');
    check(records.every((r) => r.response.elapsed_ms >= 0), 'ELAPSED_TIME');
    const observerSource = fs.readFileSync(path.join(root, 'scripts/lib/d2-google-places-probe-observer.mjs'), 'utf8');
    check(!/process\.env|console\.|node:fs|globalThis\.fetch/.test(observerSource), 'PURE_OBSERVER_BOUNDARY');
    check(!/AIza[0-9A-Za-z_-]{35}/.test(observerSource + fs.readFileSync(fileURLToPath(import.meta.url), 'utf8')), 'KEY_LIKE_FIXTURE');
    check(networkAttempts === 0, 'OFFLINE_NETWORK_ATTEMPT');
    return {
      gate: 'PASS', provider_source_sha256: providerSourceSha256, schema: evidenceSchema(records[0]),
      cases: results, records,
      hard_cap: { limit_three_transport_calls: capCalls, fourth_blocked_before_transport: true,
        concurrent_limit_one_transport_calls: concurrentCalls, concurrent_second_blocked: true,
        middleware_race: 'CONCURRENT_FIRST_REQUEST_RACE_PRESENT', middleware_changed: false },
      integrity: { response_identity: true, original_body_consumption_before_provider: 0, provider_results_unchanged: true,
        request_identity: true, coordinate_redacted_digest_same_across_areas: true, sink_failure_preserves_response: true },
      retention: { sentinel_count: SENTINELS.length, sentinel_leaks: 0, raw_body_saved: 0, error_messages_saved: 0,
        descriptions_saved: 0, metadata_saved: 0, place_data_saved: 0, key_like_fixture_added: false },
      network: { synthetic_transport_calls: totalTransportCalls, non_synthetic_attempts: networkAttempts,
        google: 0, osm: 0, vercel: 0, github: 0, production: 0, ip_lookup: 0, credential_reads: 0, quarantine_reads: 0 },
    };
  } finally {
    firstActualRequest = undefined;
    globalThis.fetch = originalFetch;
    Module._resolveFilename = originalResolveFilename;
    if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
    else delete Module._extensions['.ts'];
    for (const undo of restore.reverse()) undo();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await runGooglePlacesObserverFixture();
    console.log(JSON.stringify({ gate: report.gate, cases: report.cases.length, hard_cap: report.hard_cap,
      integrity: report.integrity, retention: report.retention, network: report.network }));
  } catch {
    console.error('BLOCKED_D2R_ACTUAL_PROVIDER_INTEGRATION_FAILURE');
    process.exitCode = 1;
  }
}
