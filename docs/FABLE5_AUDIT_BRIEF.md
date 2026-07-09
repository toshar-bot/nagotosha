# Fable 5 Audit Brief: Nagotosha

Updated: 2026-07-09

## Purpose

This brief summarizes the current state of Nagotosha for a Fable 5 re-audit. The goal is to get an outside review of the next 30-day roadmap, article strategy, partner/store acquisition flow, and whether the current public-facing state is ready for broader announcement or sales outreach.

## Current Public URL

- Next/Vercel version: https://app.nagotosha.com/
- Existing WordPress origin: https://nagotosha.com/

Current operating assumption:

- `nagotosha.com` remains the WordPress site.
- `app.nagotosha.com` is the production-like Next/Vercel front end for the new Nagotosha experience.

## Technical State

- Vercel Production is connected to `app.nagotosha.com`.
- WordPress REST API integration is working from Vercel runtime.
- XSERVER REST API access restriction was turned off to resolve Vercel runtime 403 responses.
- GA4 tracking is installed.
- Google Search Console ownership verification is complete.
- `sitemap.xml` is live and has been submitted.
- `/partner` has been improved for store owners and collaborators.
- Article experiences are rendered through the Next `ArticleExperience` layer where appropriate.
- Related article thumbnails and feature card images have been improved so cards do not rely on placeholder text or empty camera-icon thumbnails.

Key confirmation URLs:

- https://app.nagotosha.com/
- https://app.nagotosha.com/sitemap.xml
- https://app.nagotosha.com/partner
- https://app.nagotosha.com/partner/ad-policy
- https://app.nagotosha.com/partner/report-sample
- https://app.nagotosha.com/partner/wordpress-status

## Article Types and Current Examples

### Store

Store articles are single-location articles with shop cards, quick cards, map links, official links, related articles, and store information.

- `/article/92` - PASTA MANIA 鶴舞店
- `/article/32` - 七宝麻辣湯 新栄店

### News

News articles are event, facility, or commercial update articles that are not single-store templates.

- `/article/39` - JR名古屋タカシマヤ デリシャスコート リニューアル

### Guide

Guide articles are evergreen or semi-evergreen utility articles that should be easy to scan on mobile.

- `/article/73` - 名古屋の手土産ガイド
- `/article/66` - 名古屋のモーニング文化ガイド
- `/article/58` - 雨の日の名古屋 屋内スポットガイド

### Feature

Feature articles are seasonal or editorial collections with a stronger visual/editorial role than standard posts.

- `/article/79` - 名古屋ビアガーデン特集2026

### Safe Archive

Safe archive articles are lower-priority posts that have been cleaned up for accuracy and image safety, but do not need a custom layout immediately.

- `/article/8` - はなまる 冷レモンきしめん

## Store / Partner Flow

Primary partner page:

- https://app.nagotosha.com/partner

Current partner positioning:

- First listing is free.
- Instagram DM consultation is available.
- Email consultation is available.
- Published examples are shown.
- Store owners can understand what to send before applying.
- `/partner/ad-policy` and `/partner/report-sample` are available as trust-supporting pages.

Current store-owner value proposition:

- Store introduction article
- Photo placement
- Google Maps link
- Official URL / Instagram link
- Related article and new-open roundup links
- Placement in Nagotosha article/new-open areas where appropriate

## Current Production Policy

Nagotosha is not aiming to be a text-only newspaper-style site. It is being shaped as a visual, mobile-first local media product.

Current article production rules:

- Do not prioritize articles that only work without images.
- Every new article candidate should have a safe visual plan.
- Preferred image sources:
  - official images with confirmed permission or usage terms
  - PR images with clear credit
  - existing WordPress media already owned/cleared
  - generated images only for roundup/illustrative fallback cases where appropriate
- All images need clear credit/source notation.
- Official images require usage-condition checks before being copied into WordPress or used as eyecatches.
- If image usage is unclear, the article should be paused or downgraded.
- Articles without strong, safe visuals should be lower priority.
- Top page redesign should wait until the article inventory is larger and Fable 5 audit feedback is available.

## Recent Image / Card Improvements

The following visual-navigation issue has been addressed:

- Removed placeholder labels such as "高層フロアのイメージ", "屋上BBQのイメージ", and "駅近テラスのイメージ" from visible article cards.
- `/article/79` feature cards now use real images.
- Related article cards now show thumbnails.
- Empty camera-icon-only related thumbnails have been removed.
- Production confirmation was completed on `app.nagotosha.com`.

## Current Issues / Open Questions

Primary current issues:

- More article inventory is needed before a stronger public push.
- Image usage rules need to be enforced consistently.
- Fable 5 re-audit is needed before major public announcement decisions.
- Top page improvements should be prioritized after audit feedback.
- Instagram announcement timing is not yet decided.
- Store sales/outreach timing is not yet decided.
- A repeatable article production pipeline is still being refined.

Known non-blocking working-tree items:

- Some untracked eyecatch assets remain outside current commits.
- Some draft helper scripts remain untracked.
- These should not be mixed into unrelated commits without a separate decision.

## Candidate Direction Under Review

Recent candidate research emphasized that image availability must come first. For example, Nagoya Port Aquarium's Summer Night Aquarium is promising editorially, but official image usage needs confirmation before article production.

Important rule for future candidates:

- Do not proceed just because a topic can be written without images.
- Proceed only when a safe, sourceable, visually useful image plan exists.

## Questions for Fable 5

Please audit the current state and answer:

1. Is `app.nagotosha.com` ready for a public announcement, or should announcement wait?
2. Is Nagotosha ready to begin store-owner outreach?
3. What should the next 30 days focus on?
4. Which article categories should be prioritized first?
5. Which top page improvements matter most after the current article base?
6. What is the best order for monetization?
7. How should the image rules be formalized for article production?
8. Should store articles, seasonal guides, or evergreen guides be the next growth focus?
9. What minimum article count and quality bar should be reached before Instagram promotion?
10. What should be removed, simplified, or delayed?

## Suggested Audit Output

Useful outputs from Fable 5:

- 30-day roadmap
- Article category priority
- Top page improvement priority
- Store-owner outreach readiness score
- Public announcement readiness score
- Image policy checklist
- Content production checklist
- Revenue path recommendation
