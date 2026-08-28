/**
 * One-time development fixture generator for the external candidate pool.
 *
 * This script is intentionally manual: it must not run from Next.js, a
 * browser, Vercel, or Production. It uses the Nominatim service as an OSM
 * read endpoint, retains only the fields required for the OSM catalog
 * contract, and writes the derived fixture with ODbL attribution.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_PATH = process.argv[2]
  ?? path.resolve('data/external-candidate-pool/osm-nagoya-fixture.json');
const USER_AGENT = 'Nagotosha-External-Candidate-Pool/1.0 (development fixture)';
const RETRIEVED_AT = new Date().toISOString();
const TYPES = ['cafe', 'restaurant', 'fast food', 'food court', 'ice cream'];
const MINIMUM_PER_AREA = 50;

const AREAS = {
  meieki: { west: 136.872, south: 35.157, east: 136.895, north: 35.178 },
  sakae: { west: 136.893, south: 35.157, east: 136.925, north: 35.181 },
  osu: { west: 136.888, south: 35.145, east: 136.912, north: 35.168 },
};

const attribution = {
  label: '© OpenStreetMap contributors',
  href: 'https://www.openstreetmap.org/copyright',
  license: 'ODbL 1.0',
};

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function toViewBox({ west, south, east, north }) {
  return `${west},${north},${east},${south}`;
}

function asTrimmedString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function toCandidate(area, place) {
  const extra = place.extratags && typeof place.extratags === 'object' ? place.extratags : {};
  const address = place.address && typeof place.address === 'object' ? place.address : {};
  const name = asTrimmedString(place.name) ?? asTrimmedString(address.amenity);
  if (!name || !asTrimmedString(place.osm_type) || !Number.isInteger(place.osm_id)) return null;

  return {
    externalId: `osm-${place.osm_type}-${place.osm_id}`,
    provider: 'openstreetmap',
    providerEntityId: `${place.osm_type}/${place.osm_id}`,
    name,
    area,
    category: asTrimmedString(place.type) ?? 'unknown',
    location: {
      latitude: Number(place.lat),
      longitude: Number(place.lon),
      formattedAddress: asTrimmedString(place.display_name),
    },
    businessStatus: 'unknown',
    budgetState: 'unknown',
    openingState: asTrimmedString(extra.opening_hours) ? 'provider-reported' : 'unknown',
    sourceRetrievedAt: RETRIEVED_AT,
    attribution,
    confidence: 'provider-reported',
    verifiedFields: [],
    unknownFields: [
      'businessStatus',
      'price',
      'party',
      'mood',
      'officialAction',
      'phoneAction',
    ],
    osm: {
      osmId: place.osm_id,
      osmType: place.osm_type,
      amenity: asTrimmedString(place.type),
      cuisine: asTrimmedString(extra.cuisine),
      address: asTrimmedString(place.display_name),
      openingHours: asTrimmedString(extra.opening_hours),
      website: asTrimmedString(extra.website),
      phone: asTrimmedString(extra.phone),
    },
  };
}

async function fetchAreaType(area, type) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '50');
  url.searchParams.set('bounded', '1');
  url.searchParams.set('viewbox', toViewBox(AREAS[area]));
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('q', type);

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`${area}/${type}: HTTP ${response.status}`);
  const value = await response.json();
  if (!Array.isArray(value)) throw new Error(`${area}/${type}: unexpected response`);
  return value;
}

const catalogByArea = {};
const assignedExternalIds = new Set();
for (const area of Object.keys(AREAS)) {
  const candidates = new Map();
  for (const type of TYPES) {
    const places = await fetchAreaType(area, type);
    for (const place of places) {
      const candidate = toCandidate(area, place);
      if (candidate && Number.isFinite(candidate.location.latitude) && Number.isFinite(candidate.location.longitude)) {
        candidates.set(candidate.externalId, candidate);
      }
    }
    await sleep(1100);
  }
  const normalized = [...candidates.values()]
    .sort((left, right) => left.externalId.localeCompare(right.externalId, 'en'))
    .filter((candidate) => {
      if (assignedExternalIds.has(candidate.externalId)) return false;
      assignedExternalIds.add(candidate.externalId);
      return true;
    });
  if (normalized.length < MINIMUM_PER_AREA) {
    throw new Error(`${area}: expected ${MINIMUM_PER_AREA}+ candidates, got ${normalized.length}`);
  }
  catalogByArea[area] = normalized;
}

const fixture = {
  schemaVersion: 1,
  purpose: 'development-fixture-only',
  source: 'OpenStreetMap via Nominatim one-time retrieval',
  sourceRetrievedAt: RETRIEVED_AT,
  attribution,
  runtimePolicy: 'Never query Overpass or Nominatim from Production runtime.',
  areas: catalogByArea,
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output: OUTPUT_PATH, counts: Object.fromEntries(
  Object.entries(catalogByArea).map(([area, candidates]) => [area, candidates.length]),
) }));
