# D1 External Candidate Pool v1

## Source separation and Production boundary

| presentation kind | source of truth | may become formal automatically | Production availability | visible provenance |
| --- | --- | --- | --- | --- |
| `formal-reviewed` | existing Decision registry, evidence, freshness, and review gates | n/a | yes | existing Nagotosha presentation |
| `external-live-google` | one in-memory Places API (New) response | no | **off** | `Google Maps情報` |
| `external-catalog-osm` | normalized OSM development fixture | no | Preview/development only | `OpenStreetMap基礎情報` and ODbL attribution |

Provider data never supplies a formal verification, operator review, independent review, formal verified action, image right, or automatic candidate promotion. Formal candidate actions remain unchanged.

`GOOGLE_PRODUCTION_READY = false` is deliberate. Production is formal-only until the Cloud-side limits and a durable shared usage counter described below have been independently configured and reviewed. Missing, unknown, or false flags keep Google off.

## Selection and duplication contract

1. Formal candidates are selected first with the existing deterministic matcher.
2. External candidates can only fill a result below three candidates, up to three total.
3. Area is hard-filtered. `closed` records are excluded before presentation.
4. Strict budgets require a provider-known fixed/range price. Unknown or variable price is never assumed inexpensive.
5. Party, mood, and refinements remain unknown rather than being inferred as false.
6. Formal wins over an exact external duplicate. Google wins over an exact OSM duplicate, while its OSM provider link is retained in the presentation record.
7. Exact duplicate evidence is: an existing explicit provider/entity link, same provider/entity ID, same normalized phone, or same normalized website domain.
8. Matching name plus address/coordinates is assistance only. It stays `unresolved` and is never automatically merged.
9. Restore always recalculates against the active lookup, removing stale, removed, expired, and demo IDs.

The runtime reports `merged`, `distinct`, and `unresolved` outcomes; the coverage document records the fixture result separately from any future Google result.

## External actions and trust labels

External actions are rendered outside the formal verified-action gate.

| provider | allowed action | visible label | rules |
| --- | --- | --- | --- |
| Google | provider-returned `googleMapsUri` | Google Mapsで確認 | safe HTTP(S) only |
| Google | provider-returned `websiteUri` | ウェブサイトを見る | never called Nagotosha-verified official information |
| Google | provider-returned phone | 電話する | safe `tel:` only |
| OSM | canonical `https://www.openstreetmap.org/{type}/{id}` | OpenStreetMapで確認 | only a validated OSM type/positive ID can form this provider URL |
| OSM | OSM website/phone tags | ウェブサイトを見る / 電話する | safe value only; no guessed official URL |

Missing values render no action DOM. Every external candidate keeps its source badge. OSM presentation includes `© OpenStreetMap contributors` and ODbL attribution. Provider actions do not become formal verified actions.

## GA4 minimization

Existing event names and page-view behavior are unchanged. On an explicit external candidate interaction, the only added identity fields are:

```text
store_id = internal canonical external candidate ID
candidate_source = google | osm
```

Google Place IDs, OSM entity IDs, `providerEntityId`, provider URLs, phones, addresses, coordinates, raw responses, API keys, and user location are never sent. Hydration, reload, and popstate remain non-emitting paths.

## Google Places request safety

Google uses Nearby Search (New), server-only, with an explicit non-wildcard field mask. Ratings, reviews, AI summaries, and photos are not requested or stored.

The provider is eligible only when all of these are true:

1. The environment is development or Vercel Preview, never Production.
2. `EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED=true`.
3. `GOOGLE_PLACES_PROVIDER_ENABLED=true` (master kill switch).
4. `GOOGLE_PLACES_PREVIEW_ENABLED=true` (live-request opt-in).
5. Middleware grants a one-time HttpOnly session-cookie request marker.
6. Formal plus OSM has fewer than three candidates for the selected area.

The code makes at most one request for that browser session, retries zero times, and aborts at 2,500 ms. Provider failure, timeout, quota failure, missing attribution, no key, or invalid response falls back to formal plus OSM without breaking the flow. A client-supplied request marker is removed by middleware; only middleware can set the internal header used by the server component.

## Cost controls and unresolved hard limits

The initial operating proposal is: 500 Google requests/month, 25/day, one/session, and a ¥5,000 monthly budget. It is an operating target, not a current hard guarantee.

Google documents Places API (New) quotas as rate limits per method per project, while Cloud Billing alerts do not automatically stop usage or billing. Therefore Cloud rate quotas alone cannot express a reliable monthly 500-request cap. A Production rollout needs both Cloud settings and either a durable shared daily/monthly counter or an approved provider-side enforcement mechanism. D1 adds neither a database nor a paid KV service.

| control | D1 code status | Cloud / durable status |
| --- | --- | --- |
| master kill switch | implemented, default off | environment value intentionally unset |
| Production Google off | implemented | enforced by code |
| one browser session request | implemented with HttpOnly session cookie | not a global quota |
| retry 0 / 2.5s timeout | implemented | n/a |
| monthly 500 | not claimable from process memory | requires Cloud configuration plus durable counter/enforcement |
| daily 25 shared | not claimable from process memory | requires durable shared counter/enforcement |
| ¥5,000 budget | no code hard stop | human must create budget alert and response path |

At the current public price list, Nearby Search Pro has a 5,000-event free usage cap and lists US$32 per 1,000 billable events in the first paid tier. The 500-request operating target therefore has a **published-rate upper estimate of US$16/month before any free allowance, tax, or exchange-rate conversion**; billing-account-wide free usage means the actual incremental cost cannot be inferred from this repository. The ¥5,000 budget is an alert threshold, not a hard stop. See the official [Places usage/billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing), [pricing list](https://developers.google.com/maps/billing-and-pricing/pricing), and [Cloud budget behavior](https://cloud.google.com/billing/docs/how-to/budgets).

## Data minimization and licensing

The repository may contain only normalized OSM fixture data, OSM acquisition metadata, provider schema fixtures, and synthetic Google contract data. It must not contain raw PBF/Overpass payloads, Google live responses, Google photos, API keys, source archives, or temporary cache.

Google attribution and applicable Places policies are required before any live Preview display. OSM attribution is `© OpenStreetMap contributors` under ODbL. No Overpass/Nominatim request happens in application runtime.
