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
      jsx: typescript.JsxEmit.ReactJSX,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildFormal(candidate, id) {
  return {
    ...candidate,
    id,
    name: `Formal ${id}`,
    selection: {
      ...candidate.selection,
      area: 'sakae',
      supportedPartyTypes: ['solo'],
      supportedPurposes: ['light'],
      price: { kind: 'fixed', amount: 800, label: '¥800（fixture）' },
    },
  };
}

try {
  const fixture = require(path.join(root, 'data/external-candidate-pool/osm-nagoya-fixture.json'));
  const { GOOGLE_PLACES_CONTRACT_FIXTURE } = require(
    path.join(root, 'data/external-candidate-pool/google-places-contract-fixture.ts'),
  );
  const {
    adaptExternalCandidatePoolRecord,
    dedupeExternalCandidates,
    excludeExternalDuplicates,
    getExternalPreviewDecisionV3Candidates,
    getOsmExternalCandidatePool,
    shouldRequestGoogleForArea,
  } = require(path.join(root, 'lib/external-candidate-pool.ts'));
  const { getDecisionV3ExternalProviderActions } = require(
    path.join(root, 'lib/decision-v3-external-actions.ts'),
  );
  const {
    GOOGLE_PRODUCTION_READY,
    isGooglePlacesPreviewProviderEnabled,
    shouldGrantGooglePlacesRequest,
  } = require(path.join(root, 'lib/google-places-policy.ts'));
  const {
    isAnalyticsParameterAllowed,
    trackAnalyticsEvent,
  } = require(path.join(root, 'lib/analytics.ts'));
  const {
    mapGooglePlaceToExternalRecord,
    searchGooglePlacesNearby,
  } = require(path.join(root, 'lib/google-places-provider.ts'));
  const { getActiveFormalDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-formal-adapter.ts'));
  const { getDecisionV3CandidatesForSource } = require(path.join(root, 'lib/decision-v3-candidate-lookup.ts'));
  const { selectDecisionV3Candidates } = require(path.join(root, 'lib/decision-v3-selector.ts'));
  const {
    createInitialDecisionV3State,
    decisionV3Reducer,
    normalizeDecisionV3RestoredState,
  } = require(path.join(root, 'lib/decision-v3-state.ts'));

  const allFixtureCandidates = Object.values(fixture.areas).flat();
  assert(fixture.schemaVersion === 1, 'OSM fixture schema must be v1');
  assert(fixture.attribution.label === '© OpenStreetMap contributors', 'OSM attribution must be explicit');
  for (const area of ['meieki', 'sakae', 'osu']) {
    assert(fixture.areas[area].length >= 50, `${area} must contain at least 50 OSM candidates`);
  }
  assert(
    new Set(allFixtureCandidates.map((candidate) => candidate.externalId)).size === allFixtureCandidates.length,
    'OSM fixture external IDs must be globally unique',
  );
  assert(
    allFixtureCandidates.every((candidate) => candidate.provider === 'openstreetmap' && candidate.providerEntityId),
    'OSM fixture provider fields must remain isolated',
  );

  const catalog = getOsmExternalCandidatePool();
  assert(catalog.length === 150, 'runtime fixture must cap the catalog at 50 records per area');
  const adaptedOsm = adaptExternalCandidatePoolRecord(catalog[0]);
  assert(adaptedOsm?.provenance?.kind === 'external-catalog-osm', 'OSM presentation must retain source type');
  assert(adaptedOsm?.actions.length === 0, 'OSM website/phone tags must not create verified actions');
  assert(
    adaptedOsm?.provenance?.providerActions.some((action) => action.kind === 'map'),
    'OSM must expose only its canonical provider map action outside the formal action gate',
  );

  const googleRecord = mapGooglePlaceToExternalRecord(
    'sakae',
    GOOGLE_PLACES_CONTRACT_FIXTURE.places[0],
    new Date('2026-08-28T00:00:00.000Z'),
  );
  const adaptedGoogle = googleRecord && adaptExternalCandidatePoolRecord(googleRecord);
  assert(googleRecord?.provider === 'google-places', 'Google contract fixture must map to Google provider');
  assert(
    googleRecord?.budgetState === 'known'
      && googleRecord.price?.minimum === 600
      && googleRecord.price?.maximum === 900,
    'valid JPY startPrice/endPrice must become a known external price range',
  );
  assert(adaptedGoogle?.provenance?.kind === 'external-live-google', 'Google presentation must retain source type');
  assert(adaptedGoogle?.actions.length === 0, 'Google website/phone must not become verified actions');
  assert(
    getDecisionV3ExternalProviderActions(adaptedGoogle).some((action) => action.kind === 'map'),
    'Google must expose a provider map action only when the provider supplied it',
  );
  assert(
    getDecisionV3ExternalProviderActions(adaptedGoogle).every((action) => action.href),
    'external provider actions require a nonempty safe href',
  );
  const noActionGoogle = adaptExternalCandidatePoolRecord({
    ...googleRecord,
    externalId: 'google-no-actions-fixture',
    google: {},
  });
  assert(
    getDecisionV3ExternalProviderActions(noActionGoogle).length === 0,
    'external records with no provider actions must render zero action DOM',
  );
  assert(
    mapGooglePlaceToExternalRecord(
      'sakae',
      { ...GOOGLE_PLACES_CONTRACT_FIXTURE.places[0], googleMapsUri: undefined },
      new Date('2026-08-28T00:00:00.000Z'),
    ) === null,
    'a Google record without provider attribution/map URI must render zero candidate DOM',
  );
  for (const invalidPriceRange of [
    { startPrice: { currencyCode: 'JPY', units: '600' } },
    { startPrice: { currencyCode: 'USD', units: '600' }, endPrice: { currencyCode: 'USD', units: '900' } },
    { startPrice: { currencyCode: 'JPY', units: '900' }, endPrice: { currencyCode: 'JPY', units: '600' } },
    { startPrice: { currencyCode: 'JPY', units: '600', nanos: 1 }, endPrice: { currencyCode: 'JPY', units: '900' } },
    { startPrice: { currencyCode: 'JPY', units: 'not-a-number' }, endPrice: { currencyCode: 'JPY', units: '900' } },
  ]) {
    const invalidPriceRecord = mapGooglePlaceToExternalRecord(
      'sakae',
      { ...GOOGLE_PLACES_CONTRACT_FIXTURE.places[0], priceRange: invalidPriceRange },
      new Date('2026-08-28T00:00:00.000Z'),
    );
    assert(
      invalidPriceRecord?.budgetState === 'unknown' && !invalidPriceRecord.price,
      'missing upper bound, currency mismatch, or invalid Money values must keep Google price unknown',
    );
  }
  const priceLevelOnlyRecord = mapGooglePlaceToExternalRecord(
    'sakae',
    { ...GOOGLE_PLACES_CONTRACT_FIXTURE.places[0], priceRange: undefined, priceLevel: 'PRICE_LEVEL_INEXPENSIVE' },
    new Date('2026-08-28T00:00:00.000Z'),
  );
  assert(
    priceLevelOnlyRecord?.budgetState === 'unknown' && !priceLevelOnlyRecord.price,
    'priceLevel alone must not infer a yen budget range',
  );

  assert(GOOGLE_PRODUCTION_READY === false, 'Google Production readiness must be hard-blocked without durable counters');
  assert(
    !isGooglePlacesPreviewProviderEnabled({ NODE_ENV: 'production', EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED: 'true', GOOGLE_PLACES_PROVIDER_ENABLED: 'true', GOOGLE_PLACES_PREVIEW_ENABLED: 'true' }),
    'Production must keep Google provider off even with flags',
  );
  assert(
    !isGooglePlacesPreviewProviderEnabled({ NODE_ENV: 'development' }),
    'unknown environment flags must keep Google provider off',
  );
  assert(
    isGooglePlacesPreviewProviderEnabled({ NODE_ENV: 'development', EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED: 'true', GOOGLE_PLACES_PROVIDER_ENABLED: 'true', GOOGLE_PLACES_PREVIEW_ENABLED: 'true' }),
    'development requires all three explicit flags before Google is eligible',
  );
  const enabledPreviewEnvironment = {
    NODE_ENV: 'development',
    EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED: 'true',
    GOOGLE_PLACES_PROVIDER_ENABLED: 'true',
    GOOGLE_PLACES_PREVIEW_ENABLED: 'true',
  };
  assert(
    shouldGrantGooglePlacesRequest({
      environment: enabledPreviewEnvironment,
      externalAreaRequested: true,
      sessionRequestAlreadyUsed: false,
    }),
    'the first eligible Preview browser-session request may be granted',
  );
  assert(
    !shouldGrantGooglePlacesRequest({
      environment: enabledPreviewEnvironment,
      externalAreaRequested: true,
      sessionRequestAlreadyUsed: true,
    }),
    'the second eligible request in one browser session must be rejected',
  );
  const approvedEventParameters = {
    decision_start: { party: 'solo', source: 'root_home' },
    conditions_complete: { party: 'solo', area: 'sakae', budget: 'under1000', refine_count: 1 },
    candidates_view: { party: 'solo', candidate_count: 3, result_status: 'matched' },
    candidate_detail_view: { store_id: 'formal-fixture', source: 'candidates', candidate_source: 'formal-reviewed' },
    compare_view: { compare_count: 2, source: 'detail' },
    store_decided: { store_id: 'formal-fixture', compare_count: 2, party: 'solo', candidate_source: 'formal-reviewed' },
    map_click: { store_id: 'google-fixture', surface: 'detail', candidate_source: 'google' },
    official_click: { store_id: 'osm-fixture', surface: 'decided', candidate_source: 'osm' },
    phone_click: { store_id: 'formal-fixture', surface: 'detail', candidate_source: 'formal-reviewed' },
  };
  for (const [eventName, parameters] of Object.entries(approvedEventParameters)) {
    for (const [parameterName, value] of Object.entries(parameters)) {
      assert(
        isAnalyticsParameterAllowed(eventName, parameterName, value),
        `${eventName}.${parameterName} must remain an allowed existing GA4 parameter`,
      );
    }
  }
  for (const forbiddenParameter of [
    'provider_entity_id', 'providerEntityId', 'providerId', 'place_id', 'placeId', 'google_place_id', 'osm_entity_id', 'osmId',
    'provider_url', 'providerUrl', 'url', 'href', 'map_url', 'googleMapsUri', 'websiteUri', 'official_url',
    'nationalPhoneNumber', 'phone', 'phoneNumber', 'tel',
    'formattedAddress', 'address', 'location', 'lat', 'lng', 'latitude', 'longitude', 'coordinates',
    'raw_response', 'api_key', 'user_location',
  ]) {
    assert(
      !isAnalyticsParameterAllowed('map_click', forbiddenParameter, 'fixture-value'),
      `analytics must reject unlisted provider/contact/location alias ${forbiddenParameter}`,
    );
  }
  for (const source of ['formal-reviewed', 'google', 'osm']) {
    assert(isAnalyticsParameterAllowed('map_click', 'candidate_source', source), `analytics must retain ${source} candidate source`);
  }
  assert(
    !isAnalyticsParameterAllowed('map_click', 'candidate_source', 'demo')
      && !isAnalyticsParameterAllowed('map_click', 'candidate_source', 'untrusted'),
    'candidate_source must be formal-reviewed, google, or osm only',
  );
  const originalWindow = globalThis.window;
  const gtagCalls = [];
  try {
    globalThis.window = { gtag: (...args) => gtagCalls.push(args) };
    trackAnalyticsEvent('map_click', {
      store_id: 'google-fixture',
      surface: 'detail',
      candidate_source: 'google',
      providerEntityId: 'places/provider-secret',
      placeId: 'provider-place-id',
      providerUrl: 'https://provider.example/secret',
      phoneNumber: '+81-00-0000-0000',
      formattedAddress: 'provider address',
      coordinates: '35.1,136.9',
      unlisted_key: 'must-not-send',
    });
    const payload = gtagCalls[0]?.[2];
    assert(
      gtagCalls.length === 1
        && Object.keys(payload).sort().join(',') === 'candidate_source,store_id,surface'
        && payload.candidate_source === 'google',
      'unlisted keys must be absent from the GA4 payload while approved keys remain',
    );
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }

  const activeFormal = getActiveFormalDecisionV3Candidates({
    evaluatedAsOf: '2026-08-28',
    evaluatedAt: '2026-08-28T12:00:00.000Z',
  });
  assert(activeFormal.length === 9, 'formal active registry must remain nine candidates');
  const formal = [buildFormal(activeFormal[0], 'formal-a'), buildFormal(activeFormal[1], 'formal-b')];
  const knownExternal = adaptExternalCandidatePoolRecord({
    ...catalog.find((candidate) => candidate.area === 'sakae'),
    externalId: 'osm-known-price-fixture',
    name: 'External known-price fixture',
    businessStatus: 'operational',
    budgetState: 'known',
    openingState: 'current',
    price: { minimum: 600, maximum: 900, label: '¥600〜¥900（fixture）' },
    verifiedFields: ['businessStatus', 'price'],
    unknownFields: ['party', 'mood', 'officialAction', 'phoneAction'],
  });
  assert(knownExternal, 'known external fixture must adapt');

  const conditions = { party: 'solo', budget: 'under1000', mood: 'light', area: 'sakae' };
  const filled = selectDecisionV3Candidates({
    conditions,
    preferences: [],
    candidates: [...formal, knownExternal],
  });
  assert(
    filled.kind === 'matched' && filled.candidateIds.join(',') === 'formal-a,formal-b,osm-known-price-fixture',
    'external candidate must fill only the third slot after formal matches',
  );
  assert(
    filled.kind === 'matched' && filled.reasonsByCandidateId['osm-known-price-fixture'].includes('人数／気分の適性は未確認'),
    'external reason must disclose unknown party/mood suitability',
  );

  const strictUnknown = selectDecisionV3Candidates({
    conditions,
    preferences: [],
    candidates: [adaptedOsm],
  });
  assert(
    strictUnknown.kind !== 'matched' || strictUnknown.candidateIds.length === 0,
    'strict budget must not include external unknown prices',
  );
  const googlePriceCandidate = adaptExternalCandidatePoolRecord(
    mapGooglePlaceToExternalRecord(
      'sakae',
      {
        ...GOOGLE_PLACES_CONTRACT_FIXTURE.places[0],
        priceRange: {
          startPrice: { currencyCode: 'JPY', units: '1200' },
          endPrice: { currencyCode: 'JPY', units: '1800' },
        },
      },
      new Date('2026-08-28T00:00:00.000Z'),
    ),
  );
  assert(googlePriceCandidate, 'valid JPY Google price range must adapt');
  const strictGoogleCandidate = {
    ...googlePriceCandidate,
    id: 'google-strict-budget-fixture',
    selection: {
      ...googlePriceCandidate.selection,
      supportedPartyTypes: ['solo'],
      supportedPurposes: ['light'],
    },
  };
  assert(
    selectDecisionV3Candidates({
      conditions: { ...conditions, budget: 'under1000' },
      preferences: [],
      candidates: [strictGoogleCandidate],
    }).kind !== 'matched'
      && selectDecisionV3Candidates({
        conditions: { ...conditions, budget: 'under2000' },
        preferences: [],
        candidates: [strictGoogleCandidate],
      }).kind === 'matched',
    'strict budget must use the verified Google JPY price range rather than priceLevel inference',
  );
  assert(
    adaptExternalCandidatePoolRecord({ ...catalog[0], externalId: 'osm-closed-fixture', businessStatus: 'closed' }) === null,
    'closed external candidates must be excluded before presentation',
  );
  const exactFormal = {
    ...formal[0],
    actions: [],
    detailInfo: { phone: { value: '052-1234-5678', verifiedAt: '2026-08-28', source: 'fixture' } },
  };
  const exactExternal = {
    ...knownExternal,
    id: 'osm-duplicate',
    provenance: {
      ...knownExternal.provenance,
      providerActions: [{ kind: 'phone', label: '電話する', href: 'tel:052-1234-5678' }],
    },
  };
  const exactDedupe = dedupeExternalCandidates([exactFormal], [exactExternal]);
  assert(
    exactDedupe.candidates.length === 0 && exactDedupe.summary.merged === 1,
    'exact phone identity must keep the formal candidate only',
  );
  const unresolvedExternal = {
    ...knownExternal,
    id: 'osm-unresolved',
    name: exactFormal.name,
    detailInfo: { address: { value: '名古屋市中区fixture 1-2-3', verifiedAt: '2026-08-28', source: 'fixture' } },
  };
  const unresolvedFormal = {
    ...exactFormal,
    detailInfo: { address: { value: '名古屋市中区fixture 1-2-3', verifiedAt: '2026-08-28', source: 'fixture' } },
  };
  const unresolvedDedupe = dedupeExternalCandidates([unresolvedFormal], [unresolvedExternal]);
  assert(
    unresolvedDedupe.candidates.length === 1
      && unresolvedDedupe.summary.unresolved === 1
      && unresolvedDedupe.candidates[0].provenance?.duplicateStatus === 'unresolved',
    'name/address assistance must remain unresolved, not auto-merged',
  );
  const osmDuplicate = {
    ...exactExternal,
    id: 'osm-google-link-fixture',
    provenance: {
      ...exactExternal.provenance,
      provider: 'openstreetmap',
      providerEntityId: 'node/101',
      linkedProviderEntities: [{ provider: 'openstreetmap', providerEntityId: 'node/101' }],
    },
  };
  const googleDuplicate = {
    ...adaptedGoogle,
    id: 'google-osm-link-fixture',
    provenance: {
      ...adaptedGoogle.provenance,
      providerEntityId: 'places/101',
      linkedProviderEntities: [{ provider: 'google-places', providerEntityId: 'places/101' }],
      providerActions: [{ kind: 'phone', label: '電話する', href: 'tel:052-1234-5678' }],
    },
  };
  const googlePriority = dedupeExternalCandidates([], [osmDuplicate, googleDuplicate]);
  assert(
    googlePriority.candidates.length === 1
      && googlePriority.candidates[0].provenance?.provider === 'google-places'
      && googlePriority.candidates[0].provenance?.linkedProviderEntities.length === 2,
    'exact Google/OSM duplicate must keep Google presentation and both provider links',
  );
  const sameBrandStores = [
    ['meieki-komeda-nagoya-eki-nishi', 'コメダ珈琲店 名古屋駅西店', 'https://komeda-fixture.example/nagoya-eki-nishi'],
    ['osu-komeda-kamimaezu', 'コメダ珈琲店 上前津店', 'https://komeda-fixture.example/kamimaezu'],
    ['meieki-sugakiya-nagoya-eki-esca', 'スガキヤ 名古屋駅エスカ店', 'https://sugakiya-fixture.example/nagoya-eki-esca'],
    ['osu-sugakiya-osu', 'スガキヤ 大須店', 'https://sugakiya-fixture.example/osu'],
  ].map(([id, name, href]) => ({
    ...knownExternal,
    id,
    name,
    provenance: {
      ...knownExternal.provenance,
      providerEntityId: `node/${id}`,
      providerActions: [{ kind: 'website', label: 'ウェブサイトを見る', href }],
      linkedProviderEntities: [{ provider: 'openstreetmap', providerEntityId: `node/${id}` }],
    },
  }));
  const sameBrandDedupe = dedupeExternalCandidates([], sameBrandStores);
  assert(
    sameBrandDedupe.candidates.length === 4
      && sameBrandDedupe.candidates.filter((candidate) => candidate.provenance?.duplicateStatus === 'unresolved').length === 2,
    'two Komeda and two Sugakiya stores must remain distinct while shared brand domains are unresolved',
  );
  const exactUrlDedupe = dedupeExternalCandidates([], [
    sameBrandStores[0],
    {
      ...sameBrandStores[0],
      id: 'same-komeda-url-with-fragment',
      provenance: {
        ...sameBrandStores[0].provenance,
        providerEntityId: 'node/same-komeda-url-with-fragment',
        providerActions: [{ kind: 'website', label: 'ウェブサイトを見る', href: 'https://komeda-fixture.example/nagoya-eki-nishi#menu' }],
        linkedProviderEntities: [{ provider: 'openstreetmap', providerEntityId: 'node/same-komeda-url-with-fragment' }],
      },
    },
  ]);
  assert(
    exactUrlDedupe.candidates.length === 1 && exactUrlDedupe.summary.merged === 1,
    'only a normalized complete URL match may merge same-brand store records',
  );
  assert(
    shouldRequestGoogleForArea('sakae', true),
    'an explicit area plus the middleware grant must permit one controlled Google request despite OSM coverage',
  );
  assert(
    shouldRequestGoogleForArea('sakae', true),
    'raw formal candidate count must not suppress the controlled Preview Google request',
  );
  assert(
    !shouldRequestGoogleForArea(null, true),
    'a missing explicit external area must prevent Google access',
  );
  assert(
    !shouldRequestGoogleForArea('sakae', false),
    'an ungranted request marker must prevent Google access',
  );

  const originalFetch = globalThis.fetch;
  let providerFetches = 0;
  let nearbyRequestBody;
  try {
    globalThis.fetch = (_input, init) => {
      providerFetches += 1;
      nearbyRequestBody = JSON.parse(String(init?.body ?? ''));
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('fixture timeout')), { once: true });
      });
    };
    const timedOut = await searchGooglePlacesNearby(
      'sakae',
      { allowLiveRequest: true, maxRequests: 1, timeoutMs: 1 },
      new Date('2026-08-28T00:00:00.000Z'),
      { ...enabledPreviewEnvironment, GOOGLE_PLACES_API_KEY: 'fixture-only-key' },
    );
    assert(timedOut.length === 0 && providerFetches === 1, 'timeout must fall back after one request with retry 0');
    assert(
      nearbyRequestBody?.locationRestriction?.circle?.center?.latitude === 35.1694
        && nearbyRequestBody?.locationRestriction?.circle?.center?.longitude === 136.9081
        && nearbyRequestBody?.locationRestriction?.circle?.radius === 1_000
        && Object.keys(nearbyRequestBody.locationRestriction.circle.center).length === 2,
      'Nearby Search request body must normalize center latitude/longitude separately from radius',
    );
    const productionBlocked = await searchGooglePlacesNearby(
      'sakae',
      { allowLiveRequest: true, maxRequests: 1, timeoutMs: 2_500 },
      new Date('2026-08-28T00:00:00.000Z'),
      { ...enabledPreviewEnvironment, NODE_ENV: 'production', GOOGLE_PLACES_API_KEY: 'fixture-only-key' },
    );
    assert(productionBlocked.length === 0 && providerFetches === 1, 'Production must issue zero Google requests');
  } finally {
    globalThis.fetch = originalFetch;
  }

  let state = createInitialDecisionV3State();
  for (const [group, value] of Object.entries(conditions)) {
    state = decisionV3Reducer(state, { type: 'SET_CONDITION', group, value });
  }
  state = decisionV3Reducer(state, { type: 'PREPARE_CANDIDATES', candidates: [...formal, knownExternal] });
  state = decisionV3Reducer(state, { type: 'GO', step: 'detail', detailId: 'osm-known-price-fixture' });
  const restored = normalizeDecisionV3RestoredState(state, 'external-preview', [...formal, knownExternal]);
  assert(
    restored.step === 'detail' && restored.detailId === 'osm-known-price-fixture',
    'valid external Detail state must survive reload normalization',
  );
  const stale = normalizeDecisionV3RestoredState(
    { ...state, detailId: 'demo-a', compareIds: ['demo-a'], compareOrder: ['demo-a'] },
    'external-preview',
    [...formal, knownExternal],
  );
  assert(stale.step === 'candidates' && stale.detailId === null && stale.compareIds.length === 0, 'stale demo IDs must not restore into external preview');

  const previewCandidates = getDecisionV3CandidatesForSource('external-preview', new Date('2026-08-28T12:00:00.000Z'));
  assert(previewCandidates.some((candidate) => candidate.provenance?.kind === 'external-catalog-osm'), 'external preview must contain OSM records');
  assert(!previewCandidates.some((candidate) => candidate.id.startsWith('demo-')), 'external preview must not contain demo candidates');
  assert(previewCandidates.length > 9, 'external preview must retain formal plus external pool');

  const allOsmPresentationCandidates = catalog
    .map(adaptExternalCandidatePoolRecord)
    .filter((candidate) => Boolean(candidate));
  const runtimeDedupe = dedupeExternalCandidates(activeFormal, allOsmPresentationCandidates);
  const matrix = {
    formalOnly: { matched: 0, noMatch: 0, dataUnavailable: 0 },
    formalPlusOsm: { matched: 0, noMatch: 0, dataUnavailable: 0, externallyFilled: 0 },
  };
  for (const party of ['solo', 'pair', 'family', 'group']) {
    for (const budget of ['under1000', 'under2000', 'under4000', 'any']) {
      for (const mood of ['hearty', 'light', 'relax', 'new-experience']) {
        for (const area of ['meieki', 'sakae', 'osu', 'any']) {
          const input = { party, budget, mood, area };
          const formalOnly = selectDecisionV3Candidates({
            conditions: input,
            preferences: [],
            candidates: activeFormal,
          });
          const combined = selectDecisionV3Candidates({
            conditions: input,
            preferences: [],
            candidates: [...activeFormal, ...runtimeDedupe.candidates],
          });
          if (formalOnly.kind === 'matched') matrix.formalOnly.matched += 1;
          else if (formalOnly.kind === 'no-match') matrix.formalOnly.noMatch += 1;
          else matrix.formalOnly.dataUnavailable += 1;
          if (combined.kind === 'matched') {
            matrix.formalPlusOsm.matched += 1;
            if (combined.candidateIds.some((id) => id.startsWith('osm-'))) {
              matrix.formalPlusOsm.externallyFilled += 1;
            }
          } else if (combined.kind === 'no-match') matrix.formalPlusOsm.noMatch += 1;
          else matrix.formalPlusOsm.dataUnavailable += 1;
        }
      }
    }
  }
  assert(matrix.formalOnly.matched + matrix.formalOnly.noMatch + matrix.formalOnly.dataUnavailable === 256, 'formal-only no-match matrix must cover every condition set');
  assert(matrix.formalPlusOsm.matched + matrix.formalPlusOsm.noMatch + matrix.formalPlusOsm.dataUnavailable === 256, 'formal plus OSM matrix must cover every condition set');

  const previewPage = fs.readFileSync(path.join(root, 'app/decision-functional-preview-v3/page.tsx'), 'utf8');
  assert(previewPage.includes('EXTERNAL_CANDIDATE_POOL_PREVIEW_FLAG'), 'external pool must be feature-flagged');
  assert(previewPage.includes("demoAllowed") && previewPage.includes("'formal'"), 'Production path must remain formal');
  const appSource = fs.readFileSync(path.join(root, 'components/decision-v3/DecisionV3App.tsx'), 'utf8');
  assert(!appSource.includes('provider_entity_id'), 'GA4 must never receive a provider entity identifier');
  assert(appSource.includes("candidate_source: candidate.provenance.provider === 'google-places' ? 'google' : 'osm'"), 'external GA4 must retain only the provider class');
  assert(!appSource.includes("candidateSource === 'demo' ? 'demo'"), 'demo must not be emitted as candidate_source');
  const middlewareSource = fs.readFileSync(path.join(root, 'middleware.ts'), 'utf8');
  assert(middlewareSource.includes('GOOGLE_PLACES_SESSION_COOKIE'), 'Preview Google request must be session-capped with a cookie');
  assert(middlewareSource.includes('GOOGLE_PLACES_REQUEST_HEADER'), 'Only middleware may grant a single server request');
  assert(middlewareSource.includes('requestHeaders.delete'), 'Client-supplied request budget headers must be stripped');
  const providerSource = fs.readFileSync(path.join(root, 'lib/google-places-provider.ts'), 'utf8');
  assert(providerSource.includes('allowLiveRequest') && providerSource.includes('isGooglePlacesPreviewProviderEnabled'), 'Google provider must fail closed before a fetch');
  assert(providerSource.includes('setTimeout') && providerSource.includes('controller.abort'), 'Google provider must enforce its timeout');
  const clientSources = [
    'components/decision-v3/CandidateListV3.tsx',
    'components/decision-v3/DetailV3.tsx',
    'components/decision-v3/DecidedV3.tsx',
    'components/decision-v3/DecisionV3App.tsx',
  ].map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  assert(!clientSources.includes('GOOGLE_PLACES_API_KEY') && !clientSources.includes('NEXT_PUBLIC_GOOGLE'), 'Google API key must have zero client exposure');

  console.log(`D1 external-candidate-pool fixture: PASS ${JSON.stringify({
    runtimeDedupe: runtimeDedupe.summary,
    noMatchMatrix: matrix,
  })}`);
} finally {
  Module._resolveFilename = originalResolveFilename;
  if (originalTsExtension) Module._extensions['.ts'] = originalTsExtension;
}
