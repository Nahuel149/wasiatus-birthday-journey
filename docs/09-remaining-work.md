# Remaining Work

This is the finish-line checklist after the working MVP, media pipelines, shared audio, achievements, automated testing, accessibility checks, and gallery scale work were implemented.

## What is already implemented

- React, TypeScript, Vite, Tailwind CSS, and Framer Motion foundation
- Responsive landing page and six-chapter journey
- Timeline, individual memory pages, places map, slideshow, letter, reasons, and finale
- JSON-driven memories, chapters, reasons, places, songs, and generated media
- Persistent chapter progress, favorites, discoveries, activities, and ten achievements
- Responsive AVIF/WebP photograph optimizer
- Local video compression, poster generation, video gallery, and slideshow playback
- Song-story page with optional local audio and a shared persistent player
- Searchable gallery, full-screen keyboard/swipe viewer, zoom, and shareable filter URLs
- Graceful failed-image fallback
- 300-record gallery stress mode with 60-item incremental rendering and `content-visibility`
- 23 passing Vitest unit/component tests across 7 files
- 18 passing Playwright checks across desktop and mobile Chromium
- Automated WCAG A/AA scans for landing, gallery, music, and films
- Production bundle budgets and GitHub Pages subpath verification
- Placeholder-content Lighthouse baseline documented in `10-quality-assurance.md`

## Completed engineering priorities

- [x] Photograph and video optimization pipelines
- [x] Local video gallery/player and slideshow integration
- [x] Music stories and shared local-audio player
- [x] Search, achievement, and content relationship unit tests
- [x] Browser-persisted progress and audio component tests
- [x] Landing → journey → finale and gallery end-to-end tests
- [x] 300-record gallery load test and incremental rendering
- [x] URL-backed gallery query, category, favorites, and layout state
- [x] Automated keyboard-focus journeys and WCAG A/AA scanning
- [x] GitHub Pages `/wasiatus-birthday-journey/` asset-base assertion
- [x] JavaScript, CSS, and HTML bundle budgets
- [x] Desktop and mobile placeholder-content Lighthouse baseline

## Launch quality still required

- [ ] Re-run Lighthouse against the final production media set
- [ ] Perform a final manual screen-reader review with the finished copy and alt text
- [ ] Test slow and failed playback with the final video/audio files
- [ ] Test at least one real phone, orientation changes, and touch zoom/swipe
- [x] Confirm the privacy/sharing strategy: public, unlisted GitHub Pages link is acceptable
- [ ] Deploy from the intended repository after the privacy decision
- [ ] Optionally add offline/PWA caching after content is stable

## Nice-to-have polish

- [ ] Optional night/dark theme tied to later story chapters
- [ ] Optional locally bundled font files
- [ ] More personal easter eggs tied to real memories
- [x] Printable letter studio with selectable design, ornament, paper size, draft guidance, and dedication

## Content required from Nahuel

These items cannot be completed faithfully without personal source material:

- [ ] Birthday date and intended reveal deadline
- [ ] Privacy decision: public Pages link, selective media, or local presentation
- [ ] 30–50 MVP photographs, eventually expanding toward 100–300
- [ ] Selected short videos
- [ ] Correct dates, locations, and people for every memory
- [ ] Final stories for the six chapters
- [ ] Final love letter in Nahuel's voice
- [ ] Eighty-eight additional reasons if the deck should reach 100
- [ ] Music/song list and why each song matters
- [ ] Audio files only where publication rights permit
- [ ] Accurate alt text and captions/transcripts
- [ ] Final map locations and safe display labels
- [ ] Final hero image and finale family image or Rayden contribution

## Recommended next sequence

1. Gather and sort the first 30–50 photographs.
2. Replace the six core story prompts and love-letter placeholders.
3. Run the photograph optimizer and review every crop on mobile.
4. Add the first real videos through the completed video pipeline/player.
5. Add the real music stories and authorized audio files to the completed player.
6. Re-run media-dependent performance, playback, and screen-reader checks.
7. Choose the privacy strategy, then deploy.

The remaining work is now mostly personal content, final-media QA, privacy, and deployment—not missing application infrastructure.
