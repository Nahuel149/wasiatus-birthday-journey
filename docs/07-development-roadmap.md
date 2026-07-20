# Development Roadmap

## Guiding sequence

Build the emotional spine and the real content pipeline first. Add spectacle only after the journey is complete, readable, responsive, and fast with representative media.

## Phase 0 — Decisions and content inventory

### Outcomes

- Decide whether the site will be public, selectively published, or presented locally.
- Confirm the birthday date and launch deadline.
- Select the most important story chapters.
- Gather a representative set of real photos and videos.
- Draft the love letter and initial reasons.

### Tasks

- [ ] Confirm privacy/sharing approach
- [ ] Confirm repository and final URL name
- [ ] Create a chronological memory spreadsheet or draft JSON
- [ ] Select 5–10 hero memories and 30–50 MVP photographs
- [ ] Select no more than a few MVP video clips
- [ ] Write rough chapter stories in Nahuel's natural voice
- [ ] Decide which audio can legally and comfortably be published

### Exit condition

There is enough real content to design the experience without placeholder-driven decisions.

## Phase 1 — Foundation and deployable skeleton

### Outcomes

- React/Vite/TypeScript project runs locally.
- Tailwind, motion primitives, routing, and content validation are configured.
- A minimal build deploys successfully to GitHub Pages.

### Tasks

- [x] Scaffold application and code quality tools
- [x] Configure Vite base path and routing
- [x] Establish design tokens, fonts, and responsive layout primitives
- [x] Define TypeScript/runtime content schemas
- [x] Add sample content and selectors
- [x] Add CI build/deployment workflow
- [ ] Test the deployed URL on mobile

### Exit condition

The app can be deployed repeatedly with one push, and invalid content fails the build.

## Phase 2 — Emotional MVP

### Outcomes

- Landing, journey, timeline, memory detail, letter, starter reasons, and finale form one complete gift.

### Tasks

- [x] Build landing hero and explicit sound control
- [x] Build reusable chapter and memory components
- [x] Create timeline and memory detail route
- [x] Add love letter reading experience
- [x] Add 12–20 strong reason cards with accessible list fallback
- [x] Track required chapter completion locally
- [x] Build finale unlock and manual recovery path
- [x] Add reduced-motion behavior throughout

### Exit condition

A user can complete the full story on phone and desktop without opening the gallery.

## Phase 3 — Media pipeline and gallery

### Outcomes

- Real images are optimized reproducibly.
- The gallery stays smooth at the expected final media count.

### Tasks

- [x] Implement source naming and media derivative generation
- [x] Strip public metadata and create image variants
- [x] Generate video poster images and compressed clips
- [x] Build gallery grid/masonry toggle
- [x] Add search, generated filters, and favorites
- [x] Build accessible fullscreen lightbox with swipe, zoom, and keyboard navigation
- [ ] Load-test with at least 300 generated/representative records

### Exit condition

The initial route remains light, the gallery is responsive, and no full-resolution library is fetched unnecessarily.

## Phase 4 — Exploration features

### Outcomes

- Map, music stories, easter eggs, and achievements add delight without weakening the core.

### Tasks

- [x] Add local SVG world map and linked memory pins
- [x] Add song-story page with graceful unavailable state
- [x] Add hidden hearts and a small number of meaningful easter eggs
- [x] Add achievement rules and progress view
- [x] Ensure all hidden interactions have accessible alternatives where needed

### Exit condition

Optional features remain understandable, fast, and non-blocking.

## Phase 5 — Cinematic polish

### Outcomes

- The experience feels cohesive and premium rather than effect-heavy.

### Tasks

- [x] Add deliberate chapter transitions and limited parallax
- [x] Refine typography, spacing, crops, gradients, and micro-interactions
- [x] Add fullscreen slideshow with photo timing
- [x] Add short finale confetti sequence
- [x] Tune mobile particle counts and effect loading
- [ ] Add dark/night theme only if it enhances the narrative

### Exit condition

Every effect has a narrative purpose and the site remains smooth on target mobile hardware.

## Phase 6 — Content completion and launch QA

### Outcomes

- Final personal content replaces all placeholders.
- Privacy, accessibility, performance, and deployment checks pass.

### Tasks

- [ ] Proofread names, dates, locations, and personal stories
- [ ] Check affectionate nickname usage for warmth and restraint
- [ ] Add alt text, captions, and video transcripts where needed
- [ ] Audit accidental sensitive details and media metadata
- [ ] Test keyboard, touch, zoom, orientation change, and reduced motion
- [ ] Test slow/failed media loading
- [ ] Run production Lighthouse and bundle analysis
- [ ] Ask one trusted person to test navigation without spoilers
- [ ] Freeze content and create a launch tag/archive

### Exit condition

The production URL has been tested from a clean browser on the device Wasiatus is most likely to use.

## Post-launch annual maintenance

- Add a new chapter or extend an existing year.
- Preserve stable IDs and old links.
- Migrate versioned local progress only when required.
- Re-run content validation and full mobile smoke tests.
- Archive a private copy of source media separately from the deployable repository.
- Review dependencies and deployment actions before each major annual update.

## Priority guardrails

If time becomes limited, reduce scope in this order:

1. Postpone achievements and complex easter eggs.
2. Postpone the map and music embeds.
3. Reduce the gallery count while retaining the best photographs.
4. Simplify animation and slideshow behavior.

Do not cut the love letter, the strongest memories, mobile usability, privacy review, or the final birthday message.
