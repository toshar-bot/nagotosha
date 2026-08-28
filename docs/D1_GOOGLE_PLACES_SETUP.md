# D1 Google Places enablement — human-only checklist

Do not put an API key in source control, client variables, logs, screenshots, or this document. This checklist does not authorize Production activation.

## Required Google Cloud configuration

1. In the intended Google Cloud project, enable billing and **Places API (New)** only.
2. Create a server-only API key. Restrict it to the Places API (New); do not allow unrestricted API access.
3. Restrict the key to the intended server deployment path and review its project ownership. Do not put the key in a public client variable.
4. The current Field Mask uses **Nearby Search (New) Enterprise** fields. Record the exact effective quota and reviewer outside the repository; the current public rate is a 1,000-event free cap followed by US$35 per 1,000 billable events. A 500-request pre-free-allowance estimate is US$17.50, not a billing hard stop.
5. In Cloud Billing, create a ¥5,000 monthly budget with alert thresholds and named human recipients. An alerts-only budget does **not** stop billing; document the response owner and kill-switch procedure.
6. Confirm Google Maps attribution and the applicable Places policies for the exact live fields and links before turning on Preview display.

## Required durable counter decision

Places API quota is a rate quota, not a durable monthly 500-request counter. Before any Production Google activation, choose and independently approve one of:

- a durable shared daily/monthly request counter with atomic increment,
- provider/Cloud enforcement that demonstrably meets the monthly/daily cap, or
- a decision to keep Google Production permanently off.

Without this decision and proof, `GOOGLE_PRODUCTION_READY` remains `false` and Production Google must remain off.

## Preview-only activation sequence

After the Cloud controls and attribution review are complete, add these server-side values only to development or Vercel Preview:

```text
EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED=true
GOOGLE_PLACES_PROVIDER_ENABLED=true
GOOGLE_PLACES_PREVIEW_ENABLED=true
GOOGLE_PLACES_API_KEY=(server secret; never display or commit)
```

Do not set these values in Production. The master kill switch is `GOOGLE_PLACES_PROVIDER_ENABLED`; changing a budget does not replace setting it to `false` during an incident.

Open one Preview browser session at one of:

```text
/decision-functional-preview-v3?externalArea=meieki
/decision-functional-preview-v3?externalArea=sakae
/decision-functional-preview-v3?externalArea=osu
```

Verify that one request is made only for the first eligible browser session with an explicit valid `externalArea`, even when raw OSM coverage for that area is already three or more. Verify no retry after timeout/failure, no API key in client HTML/JS/network payloads, source attribution on every Google candidate, and formal plus OSM fallback after failure.

## Production activation checklist — currently blocked

- [ ] Cloud project owner verifies API restriction and minimum rate quota.
- [ ] Billing owner verifies the ¥5,000 budget alert and incident response owner.
- [ ] Durable shared daily/monthly counter or equivalent provider enforcement is tested.
- [ ] 500/month and 25/day caps are demonstrated, not inferred from process memory.
- [ ] Google attribution/policy review is recorded.
- [ ] Security review confirms no client key exposure or secret logs.
- [ ] Human approval explicitly changes the Production readiness decision.

Until every item is independently complete, do not set a Production Google flag or describe Google Production as ready.
