# Deployment Notes

## Current Production State

As of 2026-07-05, `https://nagotosha.com/` is served directly by WordPress.

Observed production signals:

- `https://nagotosha.com/` returns WordPress HTML.
- The production HTML includes `wp-content`.
- The production HTML does not include `/_next/`.
- The response header includes `Link: <https://nagotosha.com/wp-json/>`.
- `https://nagotosha.com/article/83` returns the WordPress 404 page.
- `https://nagotosha.com/article/92` returns the WordPress 404 page.

As of 2026-07-06, the Next.js version of Nagotosha is available on a production-like subdomain:

- `https://app.nagotosha.com/`
- `https://app.nagotosha.com/article/92`
- `https://app.nagotosha.com/article/83`
- `https://app.nagotosha.com/article/32`
- `https://app.nagotosha.com/article/79`
- `https://app.nagotosha.com/partner/wordpress-status`

Current role split:

- `https://nagotosha.com/` remains the WordPress site on XSERVER.
- `https://app.nagotosha.com/` is the Next.js/Vercel version of Nagotosha.
- The main `nagotosha.com` DNS and WordPress frontend have not been moved to Vercel.

The `app.nagotosha.com` DNS record is:

```txt
app CNAME 11f72c0d57b143c1.vercel-dns-017.com.
```

Vercel status:

- Project: `toshar-bots-projects/nagotosha`
- `app.nagotosha.com` is attached to the `nagotosha` project.
- `app.nagotosha.com` is a Production alias.
- Vercel domain verification reported `configured-correctly`.
- The Production deployment used for the 2026-07-06 check was `dpl_Xr4HJxEfA4d4LFYwr3ueaKEMSJ7G`.

Vercel environment variables:

- `WORDPRESS_API_BASE` is set.
- `WORDPRESS_REVALIDATE_SECONDS` is set.
- `WORDPRESS_USERNAME` and `WORDPRESS_APP_PASSWORD` are not set in Vercel and should not be set for public REST reads.

XSERVER / WordPress REST note:

- XSERVER's REST API access restriction is OFF for `nagotosha.com`.
- Turning this restriction back ON may make Vercel runtime requests to WordPress REST return `403 Forbidden`.
- This restriction was the cause of the previous Vercel runtime WordPress REST failure.

Verified on 2026-07-06:

- `/partner/wordpress-status` showed API configured, 3 posts fetched, and WordPress posts usable.
- `/article/92` rendered from `wp-92`.
- `/article/83` rendered from `wp-83`.
- `/article/32` rendered from `wp-32`.
- `/article/79` rendered from `wp-79`.
- PASTA MANIA appeared in the home latest/ranking areas.
- PASTA MANIA appeared in the home new-open horizontal carousel.
- 390px and 430px viewport checks showed no page-level horizontal overflow for `/`, `/article/92`, `/article/83`, `/article/32`, and `/article/79`.
- No console errors from `app.nagotosha.com` were observed during the final browser check.

For now, use `https://app.nagotosha.com` as the public/shareable URL for the Next.js version.
Do not move the main `nagotosha.com` domain yet.
Routing `nagotosha.com/article/*` to Next.js should be considered later after the subdomain has been stable.

Rollback for the subdomain setup:

1. Remove or change the `app` CNAME record in XSERVER DNS.
2. Remove `app.nagotosha.com` from Vercel Project Domains if needed.
3. `nagotosha.com` itself is unaffected by this rollback because it remains on WordPress/XSERVER.

Local development is different:

- `http://localhost:3000/article/83` is served by Next.js.
- `http://localhost:3000/article/92` is served by Next.js locally.

## Local Production Mode Check

Checked on 2026-07-05:

- `npm run build` succeeded.
- `npm run start` served the local production build.
- `http://localhost:3000/article/83` rendered successfully in local production mode.
- `http://localhost:3000/article/92` rendered successfully in local production mode.
- 390px and 430px browser checks did not show page-level horizontal overflow for `/article/83` or `/article/92`.
- Browser console errors were not observed for `/article/83` or `/article/92` during the local production check.

This confirms the Next.js production build can render these routes locally.
It does not mean the same routes are available on `https://nagotosha.com`, because the production domain is still served by WordPress.

## Why `/article/83` and `/article/92` 404 in Production

The Next.js route `app/article/[id]/page.tsx` exists only in the Next app.
The production domain currently routes requests to WordPress, not to the Next.js server.

Therefore:

- `/article/83` is interpreted by WordPress and becomes a WordPress 404.
- `/article/92` is interpreted by WordPress and becomes a WordPress 404.
- The existing Next.js article experience is not currently exposed on `nagotosha.com`.

## Development Preview Fallback

Some article IDs can be displayed locally with development-only preview data.
This is useful for reviewing layouts before a WordPress post is public.

Important:

- Development preview is only enabled when `NODE_ENV === "development"`.
- Preview data must not be treated as production content.
- Preview-only articles will not be visible in production unless the post exists publicly in WordPress and the request reaches Next.js.

## Draft WordPress Posts

`getWordPressPostById` uses unauthenticated WordPress REST API requests.
Unauthenticated REST requests cannot read draft posts.

That means:

- Draft posts are not available to production Next.js through the public REST API.
- A post must be published before production Next.js can fetch it through public REST.
- Post 92 status should be confirmed in WordPress before deciding its public URL and link strategy.

## Requirements for `/article/<id>` in Production

All three conditions are required:

1. The Next.js app is deployed to a production runtime such as Node.js hosting or Vercel.
2. The target WordPress post is published and available through public WordPress REST API.
3. Requests for `/article/*` are routed to the deployed Next.js app.

If any one of these is missing, `/article/<id>` will not work in production.

## Migration Options

### A. Route the Entire `nagotosha.com` Domain to Next.js

Next.js becomes the full frontend.
WordPress remains the CMS/API.

Pros:

- Clean long-term architecture.
- All routes can share the same Next.js design system.

Risks:

- Existing WordPress URLs may break if rewrites and redirects are incomplete.
- This is too large for the first migration step.

Recommendation:

- Avoid as the initial move.

### B. Route Only `/article/*` to Next.js

Keep WordPress as the main site for now, but proxy `/article/*` to the deployed Next.js app.

Pros:

- Lower risk than replacing the whole site.
- Enables the Next article experience on production.
- Existing WordPress post URLs can continue working.

Risks:

- Requires nginx, hosting, or proxy configuration.
- Needs careful cache and header handling.

Recommendation:

- Good second step after validating a Next production deployment.

### C. Deploy Next.js First on a Preview Subdomain

Example:

- `app.nagotosha.com`
- `preview.nagotosha.com`
- A Vercel preview URL

Pros:

- Safest way to validate production behavior.
- Does not affect the current WordPress site.
- Allows testing public WordPress REST fetches and article layouts.

Risks:

- Requires a separate domain or preview deployment.
- Internal links should be reviewed before public promotion.

Recommendation:

- Preferred first step.

### D. Continue Publishing Through WordPress URLs for Now

Publish articles through normal WordPress permalink URLs.

Pros:

- Fastest and safest for immediate content publication.
- No routing or deployment changes required.

Risks:

- Next.js `ArticleExperience` layouts are not visible in production.
- Store/news/feature templates only remain available locally until Next is deployed.

Recommendation:

- Acceptable short-term fallback.

## Recommended Migration Path

Recommended sequence:

1. Deploy the Next.js app to a preview host or subdomain.
2. Configure production environment variables there.
3. Confirm published WordPress posts render through `/article/<id>`.
4. Confirm draft posts remain unavailable through public REST.
5. Route `/article/*` to Next.js after validation.
6. Keep WordPress permalink URLs live until redirects and SEO behavior are fully reviewed.

In short:

`C -> B`

Avoid `A` until the Next frontend is ready to own the full site.

## Post 92 Handling

Post 92 is the PASTA MANIA Tsurumai single-shop article.

Current state:

- WordPress post exists, but its current status should be confirmed before publication planning.
- Local Next.js can display `/article/92`.
- Local production mode displayed `/article/92` successfully during the 2026-07-05 check.
- Production Next.js would not be able to fetch Post 92 while it is draft.
- Production `https://nagotosha.com/article/92` currently reaches WordPress and returns 404.

Before publishing Post 92:

- Decide whether the public destination should be the WordPress permalink or the Next `/article/92` route.
- If the destination is `/article/92`, deploy Next and route `/article/*` first.
- If the destination is the WordPress permalink, publish in WordPress and link to the WordPress URL.

## Pre-Publish Checklist

Before exposing a Next article route in production:

- Next.js production build succeeds.
- Next.js production server can fetch public WordPress REST posts.
- `WORDPRESS_API_BASE` is set in the production runtime.
- The target WordPress post is published.
- The target route is not relying on development preview fallback.
- `/article/<id>` is routed to Next.js.
- Existing WordPress URLs remain accessible.
- Internal links do not point to unavailable draft routes.
- Open Graph image and featured media behavior are checked.
- Mobile widths such as 390px and 430px have no page-level horizontal overflow.

## Required Environment Variables

For public article rendering:

- `WORDPRESS_API_BASE`
- `WORDPRESS_REVALIDATE_SECONDS`

`WORDPRESS_API_BASE` should point to the WordPress REST API base, for example:

```txt
https://nagotosha.com/wp-json/wp/v2
```

Authentication variables such as `WORDPRESS_USERNAME` and `WORDPRESS_APP_PASSWORD` are not required for public REST reads.
They are only needed for controlled WordPress write operations such as draft creation or media upload scripts.

Never commit real credentials.
