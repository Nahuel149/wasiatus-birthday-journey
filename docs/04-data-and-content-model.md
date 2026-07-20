# Data and Content Model

## Modeling rules

- Use stable lowercase kebab-case IDs; never use array indexes as identifiers.
- Keep relationships by ID rather than copying full objects.
- Use ISO dates: `YYYY-MM-DD`, `YYYY-MM`, or `YYYY` depending on what is honestly known.
- Treat uncertain dates explicitly rather than inventing exact dates.
- Store display strings in content, not inside React components.
- Keep media metadata separate from memory stories so one photo can appear in multiple experiences.
- Validate every JSON file during the build.

## Memory schema

```ts
type DatePrecision = "day" | "month" | "year" | "approximate";

interface Memory {
  id: string;
  chapterId: string;
  title: string;
  date: string;
  datePrecision: DatePrecision;
  sortDate: string;
  locationId?: string;
  people: string[];
  category: string;
  tags: string[];
  summary: string;
  story: string;
  heroMediaId: string;
  mediaIds: string[];
  featured: boolean;
  favorite: boolean;
  timeline: boolean;
  order?: number;
}
```

Example:

```json
{
  "id": "rayden-birth",
  "chapterId": "becoming-a-family",
  "title": "The Day We Became Three",
  "date": "2020-04-12",
  "datePrecision": "day",
  "sortDate": "2020-04-12",
  "locationId": "tokyo-japan",
  "people": ["Wasiatus", "Nahuel", "Rayden"],
  "category": "family",
  "tags": ["birth", "parenthood", "firsts"],
  "summary": "The day our love became a family story.",
  "story": "Replace this placeholder with Nahuel's real memory and details.",
  "heroMediaId": "rayden-birth-001",
  "mediaIds": ["rayden-birth-001", "rayden-birth-002"],
  "featured": true,
  "favorite": true,
  "timeline": true,
  "order": 1
}
```

## Media schema

```ts
type MediaKind = "image" | "video";

interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  date?: string;
  datePrecision?: DatePrecision;
  locationId?: string;
  people: string[];
  category: string;
  tags: string[];
  favorite: boolean;
  description?: string;
  story?: string;
  alt: string;
  sources: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    original?: string;
    poster?: string;
    video?: string;
  };
  width?: number;
  height?: number;
  durationSeconds?: number;
  focalPoint?: { x: number; y: number };
}
```

Example image:

```json
{
  "id": "kyoto-trip-001",
  "kind": "image",
  "title": "A Quiet Morning in Kyoto",
  "date": "2024-10",
  "datePrecision": "month",
  "locationId": "kyoto-japan",
  "people": ["Wasiatus", "Nahuel"],
  "category": "travel",
  "tags": ["Japan", "Kyoto", "autumn"],
  "favorite": true,
  "description": "Wasiatus and Nahuel walking together in Kyoto.",
  "story": "Replace this placeholder with why the morning mattered.",
  "alt": "Wasiatus and Nahuel smiling together on an autumn street in Kyoto",
  "sources": {
    "thumbnail": "/media/images/thumbnails/kyoto-trip-001.avif",
    "medium": "/media/images/medium/kyoto-trip-001.avif",
    "large": "/media/images/large/kyoto-trip-001.avif"
  },
  "width": 4032,
  "height": 3024,
  "focalPoint": { "x": 0.5, "y": 0.4 }
}
```

Asset paths should be resolved through a base-path helper so they work under a GitHub Pages project subpath. Do not concatenate root-relative URLs blindly.

## Chapter schema

```ts
interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  introduction: string;
  memoryIds: string[];
  theme?: "light" | "blush" | "gold" | "night";
  transitionText?: string;
  requiredForFinale: boolean;
}
```

Suggested initial chapters:

```json
[
  { "id": "how-we-met", "number": 1, "title": "Where It Began" },
  { "id": "falling-in-love", "number": 2, "title": "The Little Moments" },
  { "id": "choosing-each-other", "number": 3, "title": "I Choose You" },
  { "id": "becoming-a-family", "number": 4, "title": "And Then There Were Three" },
  { "id": "our-life-in-japan", "number": 5, "title": "The Life We Built" },
  { "id": "future-dreams", "number": 6, "title": "Still to Come" }
]
```

The abbreviated example above is planning data, not valid final `chapters.json`; the actual file must include every required interface field.

## Location schema

```ts
interface Location {
  id: string;
  name: string;
  country: string;
  coordinates?: { latitude: number; longitude: number };
  mapPosition: { xPercent: number; yPercent: number };
  memoryIds: string[];
  mediaIds?: string[];
}
```

The SVG uses `mapPosition`. Geographic coordinates are optional metadata for future use and do not require a map API.

## Reason schema

```ts
interface LoveReason {
  id: string;
  number: number;
  reason: string;
  detail?: string;
  category?: "you" | "us" | "family" | "everyday" | "future";
  mediaId?: string;
}
```

Example:

```json
{
  "id": "reason-001",
  "number": 1,
  "reason": "I love the way you smile.",
  "detail": "Especially when you're trying not to laugh and Rayden notices first.",
  "category": "you",
  "mediaId": "wasiatus-smile-001"
}
```

## Song schema

```ts
interface SongStory {
  id: string;
  title: string;
  artist: string;
  story: string;
  mediaId?: string;
  audioPath?: string;
  externalUrl?: string;
  order: number;
}
```

`audioPath` is appropriate only for audio Nahuel has the right to publish. `externalUrl` should be an optional enhancement, never the only way to understand why a song matters.

## Site configuration

```ts
interface SiteConfig {
  birthdayPerson: string;
  age: number;
  author: string;
  family: string[];
  title: string;
  subtitle: string;
  affectionateName: string;
  birthdayDate: string;
  defaultSoundOn: false;
  requiredChapterIds: string[];
  easterEggCount: number;
}
```

## Content validation rules

The validation script should reject:

- Duplicate IDs or reason numbers
- A relationship pointing to a missing memory, media item, location, or chapter
- Missing required title, summary, story, or alt text
- Invalid or impossible dates
- Invalid enum values
- Image paths that do not exist
- `mapPosition` values outside 0–100
- Missing dimensions for images used in the gallery
- Missing poster images for video items

It should warn about:

- Memories with no location
- Reasons without supporting detail
- Overly long summaries
- Media unused by any memory or gallery category
- A chapter with no featured image
- Potentially sensitive exact location or date metadata

## Annual update workflow

1. Create a content branch.
2. Select and back up original media privately.
3. Name source files using stable descriptive IDs.
4. Run the media optimizer to generate web variants and posters.
5. Add media records and their alt text.
6. Add or update memory and chapter records.
7. Run validation and preview locally.
8. Check the experience on mobile.
9. Merge to `main`; deployment runs automatically.

