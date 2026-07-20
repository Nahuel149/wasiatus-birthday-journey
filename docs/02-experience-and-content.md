# Experience and Content Design

## Narrative arc

The site should feel like one continuous gift with optional side paths.

1. **Invitation** — a magical but fast landing screen.
2. **Beginning** — how Nahuel and Wasiatus met and first connected.
3. **Falling in love** — first date, funny moments, trips, and small rituals.
4. **Choosing each other** — commitment, wedding, and shared decisions.
5. **Becoming a family** — pregnancy, Rayden's birth, and parenthood.
6. **Building a life** — moving to Japan and family adventures.
7. **What I love now** — love letter, reasons, music, and everyday memories.
8. **The future** — dreams and promises.
9. **Birthday finale** — unlocked celebration and final message.

## Information architecture

| Route | Purpose | Priority |
|---|---|---:|
| `/` | Landing and “Begin Our Journey” | MVP |
| `/journey` | Guided chapter experience | MVP |
| `/timeline` | Chronological overview and memory entry points | MVP |
| `/memories/:id` | A focused memory story | MVP |
| `/gallery` | Searchable/filterable photo and video library | MVP |
| `/letter` | Nahuel's love letter | MVP |
| `/reasons` | Animated “Reasons I Love You” cards | MVP-lite |
| `/finale` | Locked birthday ending | MVP |
| `/map` | Places and linked memories | Phase 2 |
| `/music` | Songs and the story behind each one | Phase 2 |
| `/slideshow` | Fullscreen cinematic playback | Phase 3 |
| `/achievements` | Exploration progress and discoveries | Phase 3 |

For the most cinematic presentation, the main journey can be one long scroll while the other routes remain directly accessible from a subtle navigation menu.

## Landing page

### Required content

- Fullscreen romantic background using a compressed hero image or lightweight gradient
- Soft floating hearts and particles with reduced-motion fallback
- Title: **Happy 35th Birthday ❤️**
- Line: **To my beautiful wife, Wasiatus Sadiyah**
- Subtitle: **This is the story of us.**
- Primary action: **Begin Our Journey**
- Sound toggle labelled clearly; off by default
- Signature: **From Nahuel, with all my love.**

### Optional rotating phrases

- “Welcome, My Boobie ❤️”
- “You make every day worth living.”
- “Every memory with you is my favorite.”
- “I'm so lucky to have you.”

Show no more than one supporting phrase at a time. Respect `prefers-reduced-motion` and avoid rapid text rotation.

## Journey chapter pattern

Each chapter may contain:

- Chapter number and short title
- Date or date range
- One hero photograph
- A short emotional introduction
- One to four memory cards
- Optional inline video with a poster image
- Location label where appropriate and safe
- A small personal detail, joke, or quote
- A transition sentence leading to the next chapter

Avoid giving every chapter the same layout. Alternate image position, full-bleed moments, quiet text sections, and small collages while retaining consistent typography and controls.

## Timeline

- Vertical on mobile; alternating or centered layout on larger screens
- Animate the progress line based on scroll position
- Show year, title, thumbnail, and category at rest
- Clicking an event opens the canonical memory detail route
- Provide a non-animated fallback and visible focus states
- Never hide essential content until an animation completes

## Gallery

### Browsing modes

- Default responsive masonry-like layout
- Optional uniform grid toggle
- Category chips and compact filters
- Search field
- Fullscreen lightbox with zoom, swipe, arrow-key navigation, captions, and close button
- Favorite control saved in `localStorage`

### Filters generated from metadata

- Year
- Category
- People
- Location
- Tags
- Favorites

Use filter values that are actually populated; do not show empty choices. Keep current filters in URL query parameters so a gallery state can be bookmarked.

## Map without external APIs

Use a locally bundled SVG world map with positioned pins. Each location record contains normalized `x` and `y` percentages and links to memories. This avoids map API keys, external tiles, network dependence, and recurring costs. It is illustrative rather than a navigation-grade geographic map.

## Love letter

- Warm paper texture implemented with CSS or a small local image
- Calm typography and a constrained reading width
- Typing reveal only for the opening line; the complete letter must remain immediately accessible to assistive technologies
- Optional piano track, never autoplayed
- Printed/saved version should remain readable through print styles

The final letter should be written by Nahuel in his own voice. Editing can improve clarity, but specific memories and natural wording matter more than polished generic romance.

## “Reasons I Love You”

- Begin with 12–20 strong reasons for the MVP; expand to 100 later
- Card deck with click/tap and keyboard reveal
- Optional category tags: personality, family, everyday life, laughter, dreams
- Avoid near-duplicates written only to reach the number 100
- Provide a “show all” accessible list in addition to animated cards

## Music

Embedding Spotify or YouTube introduces external services, cookies, availability dependencies, and internet access. The strongest match for the static/no-external-dependency goal is locally hosted, legally usable audio with a cover photo and story. If embeds are selected, treat them as optional enhancements and show the written song story even when the embed cannot load.

## Finale

Unlock when the guided journey is completed, with a discreet way for Nahuel to preview it during development.

Sequence:

1. A quiet pause and transition
2. “One more thing…”
3. Confetti and lightweight canvas/SVG fireworks
4. Optional birthday music after user interaction
5. Final message:

> Happy 35th Birthday, My Boobie.
>
> Thank you for choosing me every day.
>
> I love you forever. ❤️
>
> Love, Nahuel

Use effects for a short, controlled burst rather than an endless animation.

## Easter eggs and achievements

Good static-only ideas:

- Hidden hearts in selected chapters
- A long-press reveal on a meaningful photo
- A secret “first message” card
- A Konami-style key sequence on desktop
- A family doodle that comes alive when tapped
- Achievements for completing chapters, reading the letter, viewing timeline events, and finding hearts

All progress can be stored locally. Achievements should feel playful, not turn the gift into a checklist. The finale must remain reachable if a browser loses its saved progress.

## Visual language

### Palette

- Ivory: `#FFFDF8`
- Cream: `#F7EFE3`
- Blush: `#F4D6DC`
- Rose: `#B96B78`
- Deep wine: `#5A2732`
- Soft gold: `#C8A45D`
- Ink: `#2A2224`

Gold should be an accent, not body text. Confirm contrast before finalizing exact shades.

### Typography

- Display: an elegant local or bundled serif
- Body/UI: a highly readable sans serif
- Handwritten accent: at most one style, used for signatures or tiny annotations

Self-host font files to avoid runtime calls and reduce privacy/availability issues. Limit font weights.

### Motion rules

- Motion expresses reveal, depth, and continuity—not constant activity.
- Use transform and opacity for most transitions.
- Keep interactive feedback quick; reserve slow motion for chapter entrances and the finale.
- Pause or reduce particles when the tab is hidden.
- Implement a complete reduced-motion mode.

## Accessibility requirements

- Semantic headings and landmarks
- Keyboard access for cards, filters, lightbox, map pins, and media controls
- Visible focus states
- Text alternatives for meaningful photographs
- Captions or transcripts for videos with important speech
- Sufficient text contrast, including over photographs
- Minimum comfortable tap targets
- No essential information communicated by color alone
- Sound always controllable and off initially
- Animations compatible with `prefers-reduced-motion`

