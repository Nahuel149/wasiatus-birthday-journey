# Technical Architecture

## Architecture summary

The app is a static React single-page application. Vite builds source code, validated JSON, and optimized media into deployable files. React reads all content locally. GitHub Actions performs the build and publishes the result to GitHub Pages.

```text
JSON content + optimized media
            ↓
     validation/build step
            ↓
 React pages, search index, and UI state
            ↓
       static Vite output
            ↓
        GitHub Pages
```

No runtime server is required. Favorites, achievements, audio preference, and journey progress are stored in the visitor's browser.

## Suggested repository structure

```text
wasiatus-birthday-journey/
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml
├─ docs/
├─ public/
│  ├─ fonts/
│  ├─ audio/
│  └─ icons/
├─ content/
│  ├─ site.json
│  ├─ chapters.json
│  ├─ memories.json
│  ├─ media.json
│  ├─ locations.json
│  ├─ reasons.json
│  ├─ songs.json
│  ├─ letter.md
│  └─ achievements.json
├─ media-source/                 # originals; exclude from deployed build
│  ├─ photos/
│  ├─ videos/
│  └─ audio/
├─ public/media/                 # generated, web-optimized assets
│  ├─ images/
│  │  ├─ thumbnails/
│  │  ├─ medium/
│  │  └─ large/
│  ├─ videos/
│  └─ posters/
├─ scripts/
│  ├─ optimize-media.mjs
│  ├─ validate-content.mjs
│  └─ generate-search-index.mjs
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ router.tsx
│  │  └─ providers.tsx
│  ├─ components/
│  │  ├─ common/
│  │  ├─ journey/
│  │  ├─ gallery/
│  │  ├─ timeline/
│  │  ├─ media/
│  │  ├─ map/
│  │  ├─ finale/
│  │  └─ effects/
│  ├─ pages/
│  ├─ features/
│  │  ├─ achievements/
│  │  ├─ favorites/
│  │  ├─ progress/
│  │  ├─ search/
│  │  └─ sound/
│  ├─ content/
│  │  ├─ loadContent.ts
│  │  ├─ schemas.ts
│  │  └─ selectors.ts
│  ├─ hooks/
│  ├─ lib/
│  ├─ styles/
│  ├─ types/
│  └─ main.tsx
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

If original family media should not live in Git history, keep `media-source/` outside the repository and commit only selected web-ready outputs. Do not assume a private repository makes a deployed Pages site private.

## Component hierarchy

```text
App
├─ AppProviders
│  ├─ SoundProvider
│  ├─ ProgressProvider
│  └─ MotionPreferenceProvider
├─ AppShell
│  ├─ Header / JourneyNavigation
│  ├─ RouteTransition
│  │  ├─ LandingPage
│  │  │  ├─ Hero
│  │  │  ├─ AmbientEffects
│  │  │  └─ BeginJourneyButton
│  │  ├─ JourneyPage
│  │  │  ├─ ChapterSection × N
│  │  │  │  ├─ ChapterIntro
│  │  │  │  ├─ MemoryCard × N
│  │  │  │  └─ ChapterTransition
│  │  ├─ TimelinePage
│  │  │  └─ TimelineEvent × N
│  │  ├─ MemoryPage
│  │  │  ├─ MemoryHero
│  │  │  ├─ StoryBody
│  │  │  └─ RelatedMedia
│  │  ├─ GalleryPage
│  │  │  ├─ GalleryToolbar
│  │  │  ├─ FilterPanel
│  │  │  ├─ VirtualizedGallery
│  │  │  └─ MediaLightbox
│  │  ├─ MapPage
│  │  │  ├─ WorldMap
│  │  │  └─ LocationPopover
│  │  ├─ LetterPage
│  │  ├─ ReasonsPage
│  │  ├─ MusicPage
│  │  ├─ SlideshowPage
│  │  ├─ AchievementsPage
│  │  └─ FinalePage
│  ├─ SoundControl
│  └─ Footer
└─ ToastRegion
```

## Routing strategy

GitHub Pages does not provide arbitrary SPA rewrite rules. Choose one of these approaches during setup:

### Recommended: hash routing

URLs such as `/#/gallery` work reliably on project Pages without a redirect workaround. This is the simplest choice for a personal static gift.

### Alternative: browser routing with fallback

Use a generated `404.html` redirect technique and configure the Vite base path. This produces cleaner URLs but adds a deployment-specific workaround that must be tested on direct refresh.

## State ownership

| State | Location | Persistence |
|---|---|---|
| Memories, media, chapters | Static content modules/JSON | Build artifact |
| Current route/filter/query | URL | Shareable/bookmarkable |
| Lightbox index, open cards | Component state | Session only |
| Sound enabled and volume | Sound provider | `localStorage` |
| Favorites | Favorites feature | `localStorage` |
| Journey completion | Progress feature | `localStorage` |
| Achievements/easter eggs | Achievements feature | `localStorage` |
| Reduced-motion preference | OS media query, optional override | OS/browser |

Version persisted data, for example `birthdayJourney:v1:favorites`, so future schema changes can migrate or safely reset it.

## Search implementation

For 100–300 media records and a modest number of memories, an in-browser normalized index is sufficient; no search service is needed.

### Build-time index fields

- `id`
- normalized title
- year derived from date
- normalized people names
- category
- location name
- tags
- description
- story excerpt

### Query behavior

1. Trim and lowercase the query.
2. Remove diacritics for matching while preserving original display text.
3. Split into terms.
4. Apply selected structured filters first.
5. Match all terms across the combined searchable fields.
6. Rank exact title/tag matches above description/story matches.

At this scale, a simple precomputed token string per item is likely enough. Add a small fuzzy-search library only if typo tolerance proves valuable; avoid loading one by default.

Keep search/filter computation in `useMemo`, defer keystroke updates if rendering becomes noticeable, and virtualize or incrementally render the resulting gallery when necessary.

## Content loading and validation

- Define TypeScript types and runtime schemas for all JSON files.
- Validate duplicate IDs, broken relationships, invalid dates, absent media files, missing alt text, and invalid map positions during CI.
- Fail the build on broken required content.
- Warn, rather than fail, for optional captions or incomplete future entries.
- Create selectors such as `getMemoryById`, `getMediaForMemory`, `getMemoriesByChapter`, and `getLocationsWithMemories` so pages do not reimplement relationships.

## Animation architecture

Use three layers:

1. **Global transitions** — route and chapter transitions controlled centrally.
2. **Reveal primitives** — reusable `FadeIn`, `SlideIn`, `Stagger`, and `ParallaxImage` components.
3. **Feature effects** — landing particles, timeline progress, card flips, confetti, and fireworks, loaded only where needed.

Rules:

- Centralize duration/easing tokens.
- Prefer CSS for simple hover/focus micro-interactions.
- Use Framer Motion for coordinated entrance, layout, and gesture animation.
- Lazy-load heavy or page-specific effects.
- Disable parallax, particles, smooth scroll, and large transitions in reduced-motion mode.
- Do not make content visibility depend permanently on JavaScript animation state.

## Static-only feature implementation

| Feature | Implementation |
|---|---|
| Favorites | Set of media IDs in `localStorage` |
| Achievements | Rules evaluated from local progress events |
| Finale unlock | Derived from completed required chapters; manual fallback link |
| World map | Local SVG with percentage-positioned buttons |
| Search | Build-generated index loaded in browser |
| Slideshow | Local ordered media, timer, and HTML media elements |
| Secret password | Cosmetic client-side reveal only; never described as security |
| Music | Local audio when legally permitted, optional external embeds otherwise |

## Testing strategy

- Unit tests for content selectors, search normalization/ranking, progress rules, and persisted-state migration
- Component tests for gallery filters, reason-card keyboard behavior, sound controls, and finale unlock
- End-to-end smoke tests for landing → journey → finale, direct route refresh, mobile navigation, and lightbox controls
- Automated content validation in every build
- Manual testing on at least one iPhone-class device, one Android-class device, and desktop keyboard navigation

