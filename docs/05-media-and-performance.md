# Media and Performance Strategy

## Core principle

The browser should never download all 100–300 full-size photographs or every video at startup. The landing and first chapter receive priority; everything else loads only as it approaches the viewport or the user requests it.

## Media organization

Keep original files separate from generated web assets.

```text
media-source/
├─ photos/
│  ├─ 2015-how-we-met/
│  ├─ 2018-wedding/
│  ├─ 2020-rayden/
│  └─ 2024-japan/
├─ videos/
└─ audio/

public/media/
├─ images/
│  ├─ thumbnails/   # gallery browsing
│  ├─ medium/       # cards and most mobile layouts
│  └─ large/        # hero and fullscreen viewer
├─ posters/         # video poster frames
└─ videos/          # compressed delivery files
```

Use content IDs for final filenames, for example `kyoto-trip-001.avif`, rather than camera filenames such as `IMG_4821.JPG`.

## Image pipeline

For every selected image:

1. Auto-rotate based on source metadata.
2. Remove unnecessary EXIF/GPS metadata before publishing.
3. Generate a small thumbnail, medium display size, and large viewer size.
4. Encode AVIF and/or WebP, with a JPEG fallback only if browser support requirements demand it.
5. Record intrinsic width and height to prevent layout shift.
6. Preserve a focal point for responsive crops.
7. Run a visual review of faces, skin tone, sharpness, and crop.

Suggested starting widths—not hard requirements—are approximately 400 px for thumbnails, 1000 px for medium images, and 1800–2200 px for large viewing. Adjust quality by visual testing rather than using one setting blindly.

Use `<picture>`/`srcset` and `sizes` so mobile devices do not download desktop-sized files. Reserve eager loading and high fetch priority for the one true landing hero; use native lazy loading for below-the-fold images.

## Gallery rendering

- Render a small initial batch and append more with an intersection observer, or use virtualization if measurement proves necessary.
- Do not mount 300 motion-heavy cards at once.
- Animate card containers, not each image pixel layer.
- Decode upcoming lightbox neighbors in advance.
- Keep only the selected lightbox item and nearby items at large resolution.
- Use stable dimensions/aspect ratios to avoid reflow.
- Consider CSS columns for a simple masonry effect; test keyboard order because visual column order can differ from reading order.

## Video pipeline

- Keep videos short and intentionally selected.
- Compress to broadly supported MP4/H.264 as the compatibility baseline.
- Add WebM only if its size savings justify another asset.
- Generate a lightweight poster image for every clip.
- Use `preload="metadata"` or `preload="none"`, never preload all video files.
- Load the video source only when the player is opened or near the viewport.
- Never autoplay video with sound.
- Include captions or a transcript when speech carries emotional meaning.

Large video files can dominate repository and transfer size. If the collection becomes too heavy for a comfortable Git workflow or Pages delivery, reduce the number/duration, compress more aggressively, or present selected videos locally. Avoid Git LFS as a casual solution for Pages assets without verifying how the deployed files will be served.

## Audio

- Sound off by default
- Enable only after a clear user action
- Persist preference locally
- Pause or lower ambience when a video starts
- Provide a single, always reachable sound control
- Compress local ambience and avoid loading it before consent
- Confirm publishing rights for every local music file

## Code loading

- Split pages with dynamic imports.
- Load map, slideshow, confetti/fireworks, and lightbox code only when required.
- Keep the landing bundle small.
- Import icons individually.
- Avoid large animation, date, map, or search libraries for features the platform can handle directly.
- Analyze the production bundle before launch.

## Animation performance

- Prefer `transform` and `opacity`.
- Avoid animating large blurred backgrounds continuously on mobile.
- Limit concurrent particles and lower their count on small screens.
- Stop ambient animation in background tabs.
- Avoid scroll listeners that run unthrottled; use intersection observers and Framer Motion scroll primitives carefully.
- Test on a real mobile device rather than relying only on desktop emulation.

## Caching and updates

Vite's hashed JS/CSS assets can be cached for a long time. Media filenames should remain stable only when content is unchanged; if an image is replaced, either use the build pipeline to fingerprint it or update its filename/version. A service worker/offline app is an optional later phase because it introduces cache invalidation complexity.

## Performance budgets

Set budgets before polishing:

- Initial route loads only the hero and essential UI assets.
- No video downloads during initial page load.
- No gallery large image loads until selected.
- Reserve dimensions for all visible media.
- Keep long tasks and animation jank absent on target mobile hardware.
- Prevent layout shift when fonts, images, or chapter content load.

Exact kilobyte thresholds should be chosen after representative media is available. Measure the production build over a throttled mobile profile.

## Lighthouse and manual checks

Run Lighthouse against the production build and review:

- Performance
- Accessibility
- Best practices
- SEO basics, even if discoverability is not desired

Also manually check:

- First load on a cleared mobile cache
- Slow connection behavior
- Image crop and color quality
- Swipe/zoom responsiveness
- Keyboard gallery navigation
- Reduced-motion mode
- Sound off and sound interruption behavior
- Direct route refresh on the deployed Pages URL

## Privacy and file hygiene

- Strip GPS/EXIF metadata from public derivatives.
- Avoid sensitive addresses, medical information, documents, or school details in filenames and captions.
- Publish only selected derivatives, not camera originals.
- Check reflections, background screens, mail, tickets, and other accidental personal information in photographs.
- Remember that browser-side passwords cannot hide already-deployed static assets.

