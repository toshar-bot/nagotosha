# D1 External Candidate Pool v1 — OSM fixture coverage

Retrieved once on 2026-08-28 through the OpenStreetMap Nominatim read endpoint. This is a development fixture, not a live Production data feed.

| area | fixture records | runtime catalog cap | categories |
| --- | ---: | ---: | --- |
| 名駅・駅周辺 (`meieki`) | 108 | 50 | restaurant, cafe, fast_food, food_court, ice_cream |
| 栄・伏見 (`sakae`) | 127 | 50 | restaurant, cafe, fast_food, food_court, ice_cream |
| 大須・上前津 (`osu`) | 71 | 50 | restaurant, cafe, fast_food, food_court, ice_cream |
| total | 306 | 150 | all IDs unique across the three areas |

Each normalized OSM record contains only the provider contract:

- OSM ID/type, name, amenity, cuisine
- coordinates and provider-formatted address
- `opening_hours`, website, phone tags when present
- source retrieval time and ODbL attribution
- provider/unknown-field state

It does not assert current business status, a price, party/mood suitability, verified official action, phone action, image rights, or eligibility for formal recommendation.

## Filter support

| condition | external handling |
| --- | --- |
| area | hard filter |
| `closed` Google status | excluded |
| strict budget | requires known provider price; current OSM fixture has none, so strict-budget external DOM is zero |
| party / mood | soft, disclosed unknown; no inferred compatibility |
| refine conditions | soft, disclosed unknown; no inferred compatibility |
| formal overlap | formal only |
| provider outage | formal-only / available OSM fixture; no flow break |
