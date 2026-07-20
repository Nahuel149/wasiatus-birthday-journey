# Quality Assurance

The application now has repeatable unit, component, browser, accessibility, scale, and production-build checks. These checks use placeholder content and must be repeated after the final family media is added.

## Automated checks

Run the local engineering suite:

```bash
npm test
npm run test:e2e
npm run build
npm run perf:budget
```

The current baseline is:

- 23 Vitest tests across 7 files
- 18 Playwright tests across desktop Chromium and Pixel 7 emulation
- WCAG A/AA scans on landing, gallery, music, and films
- Landing → journey → unlocked finale coverage
- Gallery lightbox keyboard navigation and focus restoration
- Shareable gallery query-state coverage
- 300-record stress coverage with 60-record batches
- JavaScript budget: 500 KB raw and 160 KB gzip
- CSS budget: 100 KB raw and 25 KB gzip

The stress dataset is available locally at:

```text
/#/gallery?loadTest=300
```

It creates deterministic copies in memory; it does not add placeholder records to the content JSON.

## GitHub Pages verification

Build using the same repository subpath as GitHub Actions, then inspect it:

```powershell
$env:GITHUB_ACTIONS='true'
npm run build
npm run pages:path
npm run perf:budget
npm run preview -- --base /wasiatus-birthday-journey/
```

The reusable workflow template in `docs/deploy-pages-workflow.yml` runs unit tests, browser journeys, WCAG scans, production build checks, bundle budgets, and the Pages-path assertion before uploading an artifact. It can be moved to `.github/workflows/deploy-pages.yml` after the GitHub credential has `workflow` scope. Until then, the verified build is published from the `gh-pages` branch.

## Lighthouse baseline

The placeholder-content gallery currently measures:

| Profile | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 99 | 100 | 100 | 100 |

The mobile baseline recorded 1.7 s FCP/LCP, 40 ms total blocking time, and 0 cumulative layout shift. Desktop recorded 0.4 s FCP/LCP, 0 ms total blocking time, and 0 cumulative layout shift.

These scores are not a promise for the final release because real photographs, video, audio, captions, and copy will change transfer size and layout. Re-run Lighthouse and playback testing after those assets are generated.

## Manual launch checks still required

- Test VoiceOver or NVDA with the final wording and alt text.
- Test at least one real iPhone/Android phone and one desktop browser.
- Rotate a real phone and verify the gallery viewer, map, and cinema.
- Throttle or interrupt final audio/video requests and confirm the recovery experience.
- Review every final photograph crop, alt text, video caption, and transcript.
- Confirm the privacy strategy before publishing any family media.
