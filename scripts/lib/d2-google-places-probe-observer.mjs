import { createHash } from 'node:crypto';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchNearby';
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_REQUEST_BYTES = 64 * 1024;
const IDENTIFIER = /^[A-Z][A-Z0-9_]{0,62}$/;
const FIELD_PATH = /^[A-Za-z][A-Za-z0-9_.\[\]-]{0,127}$/;
const budgets = new WeakMap();
const FIELDS = new Set([
  'id', 'displayName', 'primaryType', 'businessStatus', 'location',
  'formattedAddress', 'currentOpeningHours', 'priceLevel', 'priceRange',
  'googleMapsUri', 'websiteUri', 'nationalPhoneNumber',
].map((field) => `places.${field}`));
const TYPES = new Set(['restaurant', 'cafe', 'fast_food_restaurant', 'food_court', 'ice_cream_shop']);
const BODY_KEYS = new Set(['includedTypes', 'maxResultCount', 'locationRestriction', 'languageCode']);
const HEADER_NAMES = new Set(['content-type', 'x-goog-api-key', 'x-goog-fieldmask', 'accept', 'cache-control']);
const RETENTION = Object.freeze({
  raw_request_body_stored: false, api_key_value_stored: false,
  header_values_stored: false, raw_response_stored: false,
  error_message_stored: false, error_description_stored: false,
  metadata_values_stored: false, place_data_stored: false,
});

/** In-process, shared, non-resettable budget. A retry consumes a new slot. */
export function createGooglePlacesProbeBudget(limit) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 3) throw new Error('INVALID_PROBE_LIMIT');
  const state = { limit, reserved: 0, blocked: 0 };
  const budget = Object.freeze({ snapshot: () => Object.freeze({ ...state }) });
  budgets.set(budget, state);
  return budget;
}

function reserveSlot(budget) {
  const state = budgets.get(budget);
  if (state.reserved >= state.limit) {
    state.blocked += 1;
    const error = new Error('PROBE_HARD_CAP_EXCEEDED');
    error.name = 'ProbeHardCapError';
    throw error;
  }
  state.reserved += 1;
  return state.reserved;
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function safeTokens(values, allowed, unknown) {
  return [...new Set(values.map((value) => allowed.has(value) ? value : unknown))].sort().slice(0, 20);
}

// Cancel the clone only. Awaiting tee cancellation can deadlock until the
// original is consumed, so cancellation is observed without awaiting it.
async function boundedBytes(body, limit) {
  if (!body) return { bytes: new Uint8Array(), tooLarge: false };
  const reader = body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        void reader.cancel().catch(() => {});
        return { bytes: null, tooLarge: true };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { bytes, tooLarge: false };
  } finally {
    chunks.length = 0;
    reader.releaseLock();
  }
}

async function inspectRequest(input, init, context) {
  // Clone Request input before constructing an inspection copy; never disturb
  // the caller's request body. Streaming init bodies are deliberately unsupported.
  if (init?.body && typeof init.body.getReader === 'function') throw new Error('UNSUPPORTED_PROBE_REQUEST_BODY');
  const request = new Request(input instanceof Request ? input.clone() : input, init);
  const url = new URL(request.url);
  if (url.href !== ENDPOINT) throw new Error('PROBE_ENDPOINT_MISMATCH');
  const read = await boundedBytes(request.body, MAX_REQUEST_BYTES);
  if (read.tooLarge) throw new Error('PROBE_REQUEST_TOO_LARGE');
  let body = null;
  let jsonValid = false;
  try {
    body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(read.bytes));
    jsonValid = true;
  } catch { /* Only structure, never text, survives inspection. */ }
  const object = body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  const center = object?.locationRestriction?.circle?.center;
  const radius = object?.locationRestriction?.circle?.radius;
  const coordinateValid = typeof center?.latitude === 'number' && Number.isFinite(center.latitude)
    && Math.abs(center.latitude) <= 90 && typeof center?.longitude === 'number'
    && Number.isFinite(center.longitude) && Math.abs(center.longitude) <= 180;
  const radiusValid = typeof radius === 'number' && Number.isFinite(radius) && radius > 0 && radius <= 50_000;
  const types = safeTokens(Array.isArray(object?.includedTypes) ? object.includedTypes : [], TYPES, 'UNRECOGNIZED_TYPE');
  const topKeys = safeTokens(object ? Object.keys(object) : [], BODY_KEYS, 'UNRECOGNIZED_FIELD');
  const maxCount = Number.isInteger(object?.maxResultCount) && object.maxResultCount >= 1 && object.maxResultCount <= 20
    ? object.maxResultCount : null;
  const language = object?.languageCode === 'ja' ? 'ja' : 'UNAVAILABLE';
  // Hash an allowlisted contract projection, never the raw body. In addition to
  // coordinate redaction, unknown values cannot smuggle data into the digest.
  const redacted = {
    body_top_level_keys: topKeys, includedTypes: types, maxResultCount: maxCount, languageCode: language,
    locationRestriction: { circle: {
      center: { latitude: 'REDACTED_LATITUDE', longitude: 'REDACTED_LONGITUDE' },
      radius: radiusValid ? radius : null,
    } },
    coordinate_values_valid: coordinateValid, radius_valid: radiusValid,
  };
  const mask = (request.headers.get('x-goog-fieldmask') ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  return {
    ...context, endpoint_match: true, protocol: url.protocol, hostname: url.hostname, pathname: url.pathname,
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(request.method) ? request.method : 'OTHER',
    header_names: safeTokens([...request.headers.keys()], HEADER_NAMES, 'UNRECOGNIZED_HEADER'),
    content_type_valid: /^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? ''),
    api_key_header_present: request.headers.has('x-goog-api-key'),
    field_mask_header_present: request.headers.has('x-goog-fieldmask'),
    field_mask_token_count: mask.length,
    field_mask_tokens: safeTokens(mask, FIELDS, 'UNRECOGNIZED_FIELD_MASK'),
    body_type: input instanceof Request && init?.body === undefined ? 'Request'
      : typeof init?.body === 'string' ? 'string' : 'OTHER',
    body_json_valid: jsonValid, body_top_level_keys: topKeys, included_types: types,
    max_result_count: maxCount, language_code: language, coordinate_values_valid: coordinateValid, radius_valid: radiusValid,
    body_byte_length: read.bytes.byteLength,
    redacted_body_contract_sha256: createHash('sha256').update(canonical(redacted)).digest('hex'),
    abort_signal_present: Boolean(init?.signal || input instanceof Request), transport_started: true,
  };
}

function emptyResponse() {
  return {
    status_source: 'UNAVAILABLE', transport_status: 'UNAVAILABLE', transport_ok: null, elapsed_ms: 0,
    content_type_class: 'UNAVAILABLE', body_parse_state: 'UNAVAILABLE', returned_places_count: 'UNAVAILABLE',
    error_code: null, rpc_status: null, error_info_reasons: [], bad_request_fields: [], field_violation_reasons: [],
    quota_violation_count: 0, invalid_identifier_count: 0, transport_exception_class: null,
  };
}

function collectIdentifiers(error, record) {
  function identifier(value, pattern) {
    if (value === undefined) return null;
    if (typeof value === 'string' && pattern.test(value)) return value;
    record.invalid_identifier_count += 1;
    return null;
  }
  record.error_code = Number.isInteger(error?.code) && error.code >= 0 && error.code <= 599 ? error.code : null;
  record.rpc_status = identifier(error?.status, IDENTIFIER);
  const reasons = new Set();
  const fields = new Set();
  const violations = new Set();
  for (const detail of Array.isArray(error?.details) ? error.details : []) {
    if (detail?.['@type'] === 'type.googleapis.com/google.rpc.ErrorInfo') {
      const value = identifier(detail.reason, IDENTIFIER);
      if (value) reasons.add(value);
    } else if (detail?.['@type'] === 'type.googleapis.com/google.rpc.BadRequest') {
      for (const violation of Array.isArray(detail.fieldViolations) ? detail.fieldViolations : []) {
        const field = identifier(violation?.field, FIELD_PATH);
        const reason = identifier(violation?.reason, IDENTIFIER);
        if (field) fields.add(field);
        if (reason) violations.add(reason);
      }
    } else if (detail?.['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure') {
      record.quota_violation_count += Array.isArray(detail.violations) ? detail.violations.length : 0;
    }
  }
  record.error_info_reasons = [...reasons].sort().slice(0, 20);
  record.bad_request_fields = [...fields].sort().slice(0, 20);
  record.field_violation_reasons = [...violations].sort().slice(0, 20);
}

async function inspectResponse(response, record) {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = /^application\/(?:[a-z0-9.+-]+\+)?json(?:\s*;|$)/i.test(contentType);
  record.content_type_class = isJson ? 'JSON' : contentType ? 'OTHER' : 'ABSENT';
  if (!isJson) {
    record.body_parse_state = 'NON_JSON';
    return;
  }
  let read;
  try {
    read = await boundedBytes(response.clone().body, MAX_BODY_BYTES);
  } catch {
    record.body_parse_state = 'READ_FAILED';
    return;
  }
  if (read.tooLarge) {
    record.body_parse_state = 'TOO_LARGE';
    return;
  }
  let payload;
  try {
    payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(read.bytes));
  } catch {
    record.body_parse_state = 'MALFORMED_JSON';
    return;
  }
  record.body_parse_state = 'JSON_PARSED';
  if (response.ok) record.returned_places_count = Array.isArray(payload?.places) ? payload.places.length : 0;
  else collectIdentifiers(payload?.error, record);
}

/**
 * Pure transport-injection observer; no credentials, environment, I/O or live CLI.
 * Share a createGooglePlacesProbeBudget result across all observed area wrappers.
 * onRecord receives only detached sanitized data and should be synchronous.
 * A sink failure never replaces a successful original Response; the runner must
 * independently require the expected record count before accepting evidence.
 */
export function createObservedGooglePlacesFetch({ transport, budget, area, providerEntryPoint, providerSourceSha256, onRecord }) {
  if (typeof transport !== 'function' || typeof onRecord !== 'function' || !budgets.has(budget)
    || !['meieki', 'sakae', 'osu'].includes(area)
    || providerEntryPoint !== 'lib/google-places-provider.ts#searchGooglePlacesNearby'
    || !/^[a-f0-9]{64}$/.test(providerSourceSha256)) throw new Error('INVALID_OBSERVER_CONFIGURATION');
  return async function observedFetch(input, init) {
    // Synchronous, before the first await, including concurrent callers.
    const slot = reserveSlot(budget);
    const request = await inspectRequest(input, init, {
      slot_index: slot, area, provider_entry_point: providerEntryPoint, provider_source_sha256: providerSourceSha256,
    });
    const responseRecord = emptyResponse();
    const started = performance.now();
    let response;
    let transportError;
    let threw = false;
    try {
      response = await transport(input, init);
      if (!(response instanceof Response)) throw new TypeError('INVALID_TRANSPORT_RESPONSE');
      responseRecord.status_source = 'original_fetch_response';
      responseRecord.transport_status = response.status;
      responseRecord.transport_ok = response.ok;
    } catch (error) {
      threw = true;
      transportError = error;
      responseRecord.transport_exception_class = error?.name === 'AbortError' ? 'AbortError'
        : error instanceof TypeError ? 'TypeError' : 'Error';
    }
    responseRecord.elapsed_ms = Math.max(0, Math.round(performance.now() - started));
    if (!threw) await inspectResponse(response, responseRecord);
    const record = { schemaVersion: 1, request, response: responseRecord, retention: { ...RETENTION } };
    try {
      const pending = onRecord(record);
      if (pending && typeof pending.catch === 'function') void pending.catch(() => {});
    } catch { /* Sink failure must not change the provider result. */ }
    if (threw) throw transportError;
    return response;
  };
}
