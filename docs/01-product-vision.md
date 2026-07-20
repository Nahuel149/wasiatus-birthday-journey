# Product Vision

## One-sentence concept

A beautiful interactive journey through Nahuel and Wasiatus Sadiyah's relationship and family life with Rayden, presented as a private-feeling, cinematic birthday gift that can grow with them every year.

## The emotional promise

The experience should help Wasiatus laugh, smile, feel loved, cry happy tears, and relive the moments that shaped the family. The primary product is not the gallery or the animation; it is the feeling that Nahuel carefully selected, remembered, and told their story.

## Audience

### Primary

- Wasiatus Sadiyah, on her 35th birthday

### Secondary

- Nahuel, as the author and long-term maintainer
- Rayden and close family, if Nahuel chooses to share it

## Goals

1. Create an unforgettable, deeply personal birthday experience.
2. Celebrate the relationship between Nahuel and Wasiatus and their family with Rayden.
3. Combine stories, photographs, videos, and music into one coherent journey.
4. Make yearly additions simple and data-driven.
5. Keep hosting and operation free, static, and maintainable.
6. Deliver a polished experience on mobile, tablet, and desktop.

## Non-goals

- A social network or public community
- User accounts, uploads, comments, or cloud synchronization
- A general-purpose content management system
- A server, database, API, AI integration, or paid service
- Perfect secrecy for published media; GitHub Pages assets are accessible to anyone who has or discovers the URL

## Experience pillars

### 1. Story before archive

Curated chapters lead the experience. The full gallery is available, but it should not be the first or most important screen.

### 2. Intimacy through restraint

Use a small number of elegant typefaces, soft animation, generous spacing, and selected emotional lines. “My Boobie” should appear only at meaningful peaks such as the welcome, love letter, and ending.

### 3. Family as a shared journey

Rayden is part of the main narrative rather than a separate appendix. Pregnancy, birth, family adventures, and future dreams should show how the couple's story expanded.

### 4. Discovery and delight

Hidden hearts, optional easter eggs, card reveals, and the final unlock reward exploration without blocking the main story.

### 5. A living keepsake

Content should be separated from presentation so a new year, trip, anniversary, or family milestone can be added without redesigning the site.

## Constraints

- Entirely static output hosted by GitHub Pages
- No secrets or environment-dependent APIs
- Background sound off by default; browsers generally require a user gesture before playback
- All core content usable without sound
- Good experience on a mid-range mobile device and slower connection
- Support approximately 100–300 photographs and several short videos

## Success criteria

### Emotional

- The first screen clearly feels made specifically for Wasiatus.
- The story has an intentional beginning, rising emotional arc, and ending.
- Every major chapter contains meaningful text, not just media.
- Personal phrases feel handwritten and selective rather than templated.

### Functional

- All key routes work on direct load and refresh on GitHub Pages.
- Gallery filters and client-side search return correct results.
- Images lazy-load and the initial page does not download the full library.
- The journey works with keyboard, touch, and reduced-motion preferences.
- Progress and favorites persist locally on the same browser.

### Maintainability

- A new memory can be added through JSON and media files.
- Content is validated during the build.
- A push to `main` builds and deploys automatically.
- Documentation explains the annual update workflow.

## Privacy decision required before publishing

GitHub Pages is not an authenticated private photo host. An unlisted-looking URL is obscurity, not access control, and a “secret password” implemented only in browser code cannot protect the files. Before deployment, Nahuel should deliberately choose one of these approaches:

1. Publish only media and details safe to be public.
2. Use lower-resolution/selective media and omit sensitive dates or locations.
3. Keep the finished static build local and present it from a device instead of publishing it.

This decision should be made before the full photo collection is committed.

