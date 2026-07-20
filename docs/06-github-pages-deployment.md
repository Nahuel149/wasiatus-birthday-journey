# GitHub Pages Deployment Guide

## Deployment model

Push source and content to GitHub. A GitHub Actions workflow installs dependencies, validates content, builds the Vite app, and deploys the generated `dist` folder to GitHub Pages. Once configured, future updates require only content/media changes and a push.

## Vite base path

For a project repository named `wasiatus-birthday-journey`, the deployed URL normally includes the repository name. Configure Vite accordingly:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/wasiatus-birthday-journey/"
});
```

If the final repository name changes, update `base`. A helper should prepend `import.meta.env.BASE_URL` to content-driven public asset paths.

## Recommended routing

Use hash routing for the simplest reliable Pages behavior:

```text
https://username.github.io/wasiatus-birthday-journey/#/gallery
```

If clean browser routes are important, add and test a `404.html` fallback/redirect strategy before launch. Directly open and refresh every important route on the deployed site.

## Suggested package scripts

```json
{
  "scripts": {
    "dev": "vite",
    "validate": "node scripts/validate-content.mjs",
    "media:optimize": "node scripts/optimize-media.mjs",
    "build": "npm run validate && tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

The optimization command should normally be run when new source media is added. CI should validate committed derivatives rather than re-encoding hundreds of assets on every deploy unless reproducibility and build time are acceptable.

## GitHub Actions workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

Action versions should be reviewed when implementation begins because supported releases can change.

## One-time repository setup

1. Create the repository with the final name.
2. Push the project to `main`.
3. Open repository **Settings → Pages**.
4. Select **GitHub Actions** as the source.
5. Run or wait for the deployment workflow.
6. Open the generated Pages URL.
7. Test direct load, refresh, mobile layout, and all media.

The repository visibility and Pages-site visibility are separate privacy concerns. Confirm current GitHub behavior and the intended sharing model before uploading family media.

## Build process

```text
npm ci
  ↓
unit/content tests
  ↓
JSON and file validation
  ↓
TypeScript compile + Vite production build
  ↓
upload dist artifact
  ↓
deploy to GitHub Pages
```

## Asset-path rules

- Never assume the app is served from `/`.
- Test images referenced from JSON under the repository subpath.
- Prefer imports for source-controlled UI artwork and a base-path helper for public media.
- Avoid filename spaces and case-only differences; deployment runs on a case-sensitive environment.
- Use lowercase kebab-case IDs and filenames.
- Do not commit secret keys; the project should not need any.

## Release checklist

- [ ] Content validation passes
- [ ] Tests pass
- [ ] Production build succeeds locally
- [ ] No camera originals or unintended private files are staged
- [ ] GPS/EXIF metadata removed from published images
- [ ] Vite `base` matches the repository name
- [ ] All JSON media relationships resolve
- [ ] Landing audio is off by default
- [ ] Reduced-motion mode works
- [ ] Gallery works with keyboard, touch, and a large dataset
- [ ] Direct Pages URL and route refresh work
- [ ] Finale unlock and fallback work
- [ ] Mobile load tested with a cleared cache
- [ ] All published music, images, and video are appropriate to share

## Updating in a future year

1. Add optimized media derivatives.
2. Update JSON content and relevant chapter text.
3. Preview and validate locally.
4. Push to `main`.
5. Confirm the GitHub Actions deployment succeeded.

There should be no manual server upload or database migration.

