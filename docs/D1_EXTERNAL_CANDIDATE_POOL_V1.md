# D1 External Candidate Pool v1

## Scope and source separation

| presentation kind | source of truth | may become formal automatically | Production availability | visible provenance |
| --- | --- | --- | --- | --- |
| `formal-reviewed` | existing Decision registry, evidence, freshness, and review gates | n/a | yes | existing Nagotosha presentation |
| `external-live-google` | one in-memory Places API (New) response | no | no | `Google Maps情報` and Google Maps attribution |
| `external-catalog-osm` | one-time OSM development fixture | no | no | `OpenStreetMap基礎情報` and `© OpenStreetMap contributors` |

Provider data never supplies a formal verification, operator review, independent review, verified action, or image right. Provider website and phone fields stay in the provider record and produce no official/phone action DOM.

## Architecture

1. `formal` candidates are selected with the existing full deterministic matcher.
2. Only if the result has fewer than three formal candidates does the selector evaluate external candidates.
3. External candidates are added after formal candidates, up to three total.
4. External area is a hard filter. A `closed` provider business status is removed before presentation.
5. With `under1000` / `under2000` / `under4000`, an external candidate needs a known fixed/range price. Unknown/variable price is never interpreted as inexpensive.
6. Provider data does not establish party, mood, or refine facts. Those unknowns remain visible as `人数／気分の適性は未確認`, not a negative exclusion.
7. Formal/external duplicate IDs or normalized names keep the formal candidate only.
8. Session/history schema remains v2. Restore recalculates against the active lookup, so stale, removed, expired, and demo IDs cannot return.

`DecisionV3App` sends `candidate_source` and `provider_entity_id` only on existing candidate-specific analytics events. Existing event names and page_view behavior are unchanged.

## Preview and failure policy

- The existing Preview route stays `demo` by default.
- Only Preview/development plus `EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED=true` can select `external-preview`.
- Production keeps `formal`; it has no demo or external fallback.
- A server render can make at most one Google Places request, uses a 2.5 second timeout, and otherwise returns the formal + OSM candidate pool.
- Google provider failure, quota failure, no key, or invalid response returns no Google candidates. It never interrupts the formal flow.
- No client receives an API key. No Google response body or photo is committed. Google Place IDs are the only values eligible for durable retention.
- No Overpass or Nominatim request is made at application runtime. The OSM file is a development fixture only.

## Google Places API (New) contract

`Nearby Search (New)` is server-only and uses an explicit, non-wildcard field mask:

```text
id, displayName, primaryType, businessStatus, location, formattedAddress,
currentOpeningHours, priceLevel, priceRange, googleMapsUri, websiteUri,
nationalPhoneNumber
```

Ratings, reviews, AI summaries, and photos are not requested. Photo handling is intentionally deferred: any future live photo display requires the returned author attributions and a separate rights/attribution review.

The current environment has no Google Places key. Consequently no live Google request was made for D1; the synthetic contract fixture exercises the response shape without saving Google content.

## License and attribution matrix

| provider | data use | storage | required presentation | current implementation |
| --- | --- | --- | --- | --- |
| Google Places | live, preview-only provider response | no response body; place ID only is retainable | Google Maps attribution; use Google-provided attribution treatment before enabling live cards | textual source/attribution component; live flag remains off pending setup/review |
| OpenStreetMap | one-time derived development fixture | normalized OSM catalog fields with source date | `© OpenStreetMap contributors`, linked copyright page, ODbL 1.0 | implemented on every OSM candidate card |

Google policies: <https://developers.google.com/maps/documentation/places/web-service/policies>

Google Nearby Search field-mask reference: <https://developers.google.com/maps/documentation/places/web-service/nearby-search>

OpenStreetMap copyright and ODbL: <https://www.openstreetmap.org/copyright>

## Cost estimate and operational cap

The live Google route uses Nearby Search (New) only; Place Details is not called in D1. The authoritative global list dated 2026-08-25 lists a 5,000-event monthly free cap, then USD $32 per 1,000 Nearby Search Pro requests and USD $17 per 1,000 Place Details Pro requests. See <https://developers.google.com/maps/billing-and-pricing/pricing>.

| scenario | maximum Google requests | estimate before account-wide free cap / volume tier |
| --- | ---: | ---: |
| one Preview server render with `externalArea` | 1 Nearby Search | USD $0.032 at the first paid Nearby Pro tier |
| 1,000 such Preview renders | 1,000 Nearby Search | USD $32 at the first paid Nearby Pro tier |
| Production | 0 | USD $0 |

Actual billed cost depends on the linked billing account's aggregate monthly usage and current price table. Enable budget alerts and a per-project quota before a live-key rollout. The Preview flag remains off by default.
