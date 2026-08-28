# D1 External Candidate Pool v1 — normalized OSM fixture coverage

Retrieved once on 2026-08-28 from OpenStreetMap-derived source data. This is a normalized development fixture, not a live Production feed. Fixture size: 419,371 bytes (about 409.5 KiB). No raw PBF, raw Overpass response, Google live response, photo, source archive, or temporary cache is committed.

## Area coverage before the runtime 50-record cap

| area | unique candidates | category counts | name | coordinates | address | opening hours | price | website | phone | closed excluded |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 名駅・駅周辺 (`meieki`) | 108 | restaurant 50; fast_food 42; cafe 16 | 108 (100%) | 108 (100%) | 108 (100%) | 18 (16.7%) | 0 (0%) | 8 (7.4%) | 18 (16.7%) | 0 |
| 栄・伏見 (`sakae`) | 127 | restaurant 48; fast_food 48; cafe 29; ice_cream 2 | 127 (100%) | 127 (100%) | 127 (100%) | 30 (23.6%) | 0 (0%) | 17 (13.4%) | 23 (18.1%) | 0 |
| 大須・上前津 (`osu`) | 71 | fast_food 21; restaurant 42; cafe 8 | 71 (100%) | 71 (100%) | 71 (100%) | 19 (26.8%) | 0 (0%) | 3 (4.2%) | 18 (25.4%) | 0 |
| total | 306 | all IDs unique | 306 (100%) | 306 (100%) | 306 (100%) | 67 (21.9%) | 0 (0%) | 28 (9.2%) | 59 (19.3%) | 0 |

At runtime, exactly the first 50 normalized records per area are available to the external catalog: 150 total. The 50-record cap is a bounded Preview/development fixture policy, not a claim that the data is current.

## Deduplication and no-match interpretation

The fixture has 306 unique external IDs. Runtime deduplication evaluates exact formal/provider links, provider entity IDs, phone, and website domain before an external candidate is presented. Name/address assistance never auto-merges; it is counted as `unresolved` and remains visibly provider-sourced.

For the runtime-capped 150-record OSM catalog against the active formal-nine
registry, the same 256 complete-condition combinations produce the following
fixture result (not a claim about Google):

| selector source | matched | no-match | data-unavailable | external fill present |
| --- | ---: | ---: | ---: | ---: |
| formal only | 137 | 119 | 0 | 0 |
| formal + OSM | 157 | 99 | 0 | 56 |

OSM therefore improves external fallback coverage for 20 formal-only no-match
combinations in this fixture (119 to 99). This is not a claim that party/mood
complete-match quality improved: external party and mood remain unverified.
It also fills a remaining slot in 56 matched combinations without replacing a
formal candidate. Exact dedupe against the formal-nine set reports `merged: 1`,
`distinct: 149`, and `unresolved: 0`; the normalized OSM acquisition itself
has no duplicate external IDs. Google is disabled by default, so no Google
improvement is reported.

The verified D1 fixture covers these required cases:

- exact phone collision: formal wins and external is merged/suppressed;
- exact Google/OSM provider collision: Google presentation wins and keeps both provider links;
- name/address assistance: candidate remains `unresolved`, never auto-merged;
- no formal/external duplicate ID in the normalized OSM fixture;
- no closed OSM records in this acquisition snapshot.

`formal-only` and `formal + OSM` must be compared by the selector under the same conditions. The fixture does not claim an observed Google improvement because Google live requests are disabled by default. With strict budget, OSM price coverage is 0%, so external OSM candidates correctly contribute 0 candidates rather than being inferred as low-cost.

## Source and field limitations

The fixture retains only OSM ID/type, name, amenity/cuisine, coordinates, provider-formatted address, OSM opening-hours/website/phone tags when present, retrieved time, ODbL attribution, and unknown-field state. It does not assert current business status, price, party/mood suitability, verified official/phone actions, image rights, or eligibility for formal recommendation.

Every OSM candidate visibly carries `© OpenStreetMap contributors` and ODbL attribution. An OSM website or phone tag can appear only as a provider action and is never presented as Nagotosha-verified official data.
