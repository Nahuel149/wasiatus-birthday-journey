# Wasiatus Birthday Journey

An interactive, cinematic birthday website for **Wasiatus Sadiyah's 35th birthday**, created with love by **Nahuel** and celebrating their family story with **Rayden**.

The site is intended to feel like a handcrafted luxury digital gift—not a conventional photo gallery. It will guide Wasiatus through memories, letters, music, photographs, videos, playful discoveries, and a final birthday surprise. It must remain easy to expand for future birthdays, anniversaries, trips, and family milestones.

## Project principles

- Emotional first: every technical and visual choice should strengthen the story.
- Personal, not repetitive: use “Wasiatus Sadiyah” normally and “My Boobie” sparingly in the most affectionate moments.
- Private-by-design content choices: only publish media that the family is comfortable placing on a public static host.
- Static and free: no backend, database, authentication, API keys, AI services, or recurring costs.
- Data-driven: adding memories should mean adding media, editing JSON, and pushing to GitHub.
- Progressive: the essential journey must work without music, video, map interactions, or advanced animation.
- Accessible and fast: motion, sound, image quality, and effects must never make the experience difficult to use.

## Proposed stack

- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- shadcn/ui primitives where useful
- Static JSON content
- Browser `localStorage` for favorites, achievements, and journey progress
- GitHub Pages with GitHub Actions deployment

## Documentation

1. [Product vision](docs/01-product-vision.md) — audience, goals, experience, scope, and success criteria
2. [Experience and content](docs/02-experience-and-content.md) — journey flow, pages, visual language, copy, and accessibility
3. [Technical architecture](docs/03-technical-architecture.md) — folder structure, component hierarchy, routes, state, search, and animation
4. [Data and content model](docs/04-data-and-content-model.md) — JSON shapes, examples, IDs, validation, and annual updates
5. [Media and performance](docs/05-media-and-performance.md) — image/video organization, optimization, loading, and Lighthouse strategy
6. [Deployment guide](docs/06-github-pages-deployment.md) — build, GitHub Pages, Actions, asset paths, and release checks
7. [Development roadmap](docs/07-development-roadmap.md) — phased plan from content preparation to the polished experience
8. [Content preparation checklist](docs/08-content-preparation-checklist.md) — what Nahuel should gather before and during development
9. [Remaining work](docs/09-remaining-work.md) — current completion status, open engineering tasks, and required personal content

10. [Quality assurance](docs/10-quality-assurance.md) — automated checks, scale testing, Lighthouse baseline, and launch QA

## Recommended MVP

The first meaningful release should include:

- A magical landing page with sound off by default
- A chapter-based story journey
- A timeline linked to memory detail views
- A fast, filterable photo gallery with a fullscreen viewer
- A love letter
- A smaller starter set of “Reasons I Love You”
- A final surprise that unlocks after the journey
- GitHub Pages deployment on every push to `main`

The remaining MVP work is now primarily real family content, representative-media load testing, accessibility/performance QA, and final deployment.

## Definition of success

The project succeeds when Wasiatus can open a single link on phone or desktop, immediately understand how to begin, move through the family story without technical friction, and reach a memorable final message. Nahuel must also be able to add a future memory without changing React components.

## Current implementation

The first working MVP is now included. It currently provides:

- A responsive cinematic landing page
- Six scroll-revealed journey chapters loaded from JSON
- Persistent journey progress and finale unlock
- Animated timeline and memory detail pages
- Searchable/filterable gallery with local favorites and lightbox
- Interactive illustrated places map linked to memories
- Keyboard-controlled cinematic slideshow with autoplay and immersive mode
- Love-letter layout with writing prompts
- Twelve animated starter “Reasons I Love You” cards
- Birthday finale with reduced-motion support
- Six persistent hidden hearts and ten achievement keepsakes
- Gallery layout switching, keyboard navigation, swipe, and zoom
- Hash-based routing that works with GitHub Pages
- Production build and Pages deployment workflow
- Responsive AVIF/WebP media optimization and content validation scripts
- Local video compression, poster generation, gallery, and slideshow integration
- Song-story page with optional local audio and a shared persistent player
- Vitest unit/component coverage and Playwright desktop/mobile journey tests
- Automated WCAG A/AA scans, 300-record gallery stress mode, and production bundle budgets

All photographs and the most personal story paragraphs are intentional placeholders. Replace these with real family material before publishing.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with:

```bash
npm run build
npm run preview
npm test
npm run test:e2e
npm run perf:budget
```

## Where to edit content

- `src/content/chapters.json` — journey chapters
- `src/content/memories.json` — memory stories, filters, people, and locations
- `src/content/reasons.json` — “Reasons I Love You” cards
- `src/content/songs.json` — song stories and optional audio paths
- `src/content/generated-videos.json` — generated by the video optimizer
- `src/pages/LetterPage.tsx` — temporary letter copy and writing prompts

The printable letter text now lives in `src/content/letter.json`; its page provides selectable paper designs, ornaments, A4/US Letter sizing, and Print/Save as PDF.

For the easiest handoff, place unsorted originals in `media-inbox/photos`, `media-inbox/videos`, `media-inbox/music`, `media-inbox/writing`, or `media-inbox/extras`. Those originals are ignored by Git. See [the media inbox guide](media-inbox/README.md) for the complete folder map.

The next development milestone is content production: selecting real family photographs, replacing story prompts, and adding the finished love letter.

## Add real photographs

1. Put selected source images in `media-source/photos/`.
2. Name each file after its memory ID, such as `hello-rayden.jpg`.
3. Optionally add accurate alt text in `media-source/metadata.json`; see `media-source/README.md`.
4. Generate safe web variants:

```bash
npm run media:optimize
npm run build
```

The same generated image automatically appears in the journey, gallery, detail page, places map, and cinematic slideshow. Source photographs are ignored by Git; only intentionally generated public derivatives should be published.

For short videos, place files in `media-source/videos/` and run:

```bash
npm run video:optimize
```

The generated clip appears in the Films page and replaces the matching photograph during that memory's cinema slide.

## Content safety checks

`npm run build` now validates:

- Duplicate content IDs
- Broken chapter, memory, place, and media relationships
- Missing generated files
- Missing story content and image alt text
- Invalid map positions

Memories without real photographs remain valid and display the decorative artwork fallback with a warning during validation.
