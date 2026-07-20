# Source media drop zone

If your files are not organized yet, put everything in the matching `media-inbox/` folder first. Those folders are the safest and easiest handoff point; their contents are ignored by Git. The `media-source/` folders below are the prepared inputs used by the optimizers.

Place selected source photographs in `media-source/photos/`. These files are working originals and are ignored by Git by default to reduce accidental publication.

## Naming

Name each image after the memory it should represent:

```text
our-first-hello.jpg
the-days-between.png
our-promise.jpeg
hello-rayden.jpg
our-japan-chapter.jpg
tomorrows-together.jpg
```

Then run:

```bash
npm run media:optimize
```

The script strips metadata through re-encoding, creates AVIF and WebP variants at three sizes, and updates `src/content/generated-media.json`.

Optionally create `media-source/metadata.json` to provide accurate alt text:

```json
{
  "our-first-hello": {
    "alt": "Wasiatus and Nahuel smiling together during their first trip"
  }
}
```

Never place sensitive camera originals directly in `public/`.

## Videos

Place short source clips in `media-source/videos/` and name each one after its linked memory ID:

```text
our-first-hello.mov
hello-rayden.mp4
our-japan-chapter.mp4
```

Then run:

```bash
npm run video:optimize
```

This requires `ffmpeg` and `ffprobe`. The script removes source metadata, creates an H.264/AAC MP4 with fast-start enabled, prevents small clips from being enlarged, generates AVIF/WebP poster images, and updates `src/content/generated-videos.json`.

Optional `media-source/video-metadata.json`:

```json
{
  "hello-rayden": {
    "title": "Rayden's First Big Laugh",
    "description": "The afternoon we kept replaying all week.",
    "captions": "media/captions/hello-rayden.vtt"
  }
}
```

Caption paths must point to a file inside `public/`.
