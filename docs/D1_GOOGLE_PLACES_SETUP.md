# D1 Google Places Preview setup — human action required

Do not add a key to source control, client-side variables, logs, screenshots, or this document.

1. In the Google Cloud project, enable **Places API (New)** and billing.
2. Create a server-restricted key with an API restriction for Places API (New); set a conservative quota and billing budget alert.
3. Add `GOOGLE_PLACES_API_KEY` only to the Preview server environment.
4. Add `EXTERNAL_CANDIDATE_POOL_PREVIEW_ENABLED=true` only to Preview/development. Do not set it in Production.
5. Confirm the deployed Preview has the required Google Maps attribution treatment before displaying any live Google content. Do not add or store Google photos in this phase.
6. Open the existing Preview route with one optional server-side area parameter:

   ```text
   /decision-functional-preview-v3?externalArea=meieki
   /decision-functional-preview-v3?externalArea=sakae
   /decision-functional-preview-v3?externalArea=osu
   ```

7. Verify the request is server-side, no key appears in HTML/JS/network payloads, one render makes at most one Nearby Search request, and provider failure leaves the formal flow usable.

The production branch does not read this feature flag for candidate source selection; it stays formal-only.
