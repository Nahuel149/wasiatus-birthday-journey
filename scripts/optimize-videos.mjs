import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "media-source", "videos");
const videoDir = path.join(root, "public", "media", "videos");
const posterDir = path.join(root, "public", "media", "posters");
const manifestPath = path.join(root, "src", "content", "generated-videos.json");
const metadataPath = path.join(root, "media-source", "video-metadata.json");
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobe = process.env.FFPROBE_PATH || "ffprobe";
const accepted = new Set([".mp4", ".mov", ".m4v", ".webm"]);

async function readOptionalMetadata() {
  try { return JSON.parse(await readFile(metadataPath, "utf8")); }
  catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function run(command, args, capture = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: process.platform === "win32" && !command.toLowerCase().endsWith(".exe"),
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (capture) {
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
    }
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(`${command} exited with ${code}${stderr ? `: ${stderr}` : ""}`)));
  });
}

await Promise.all([mkdir(videoDir, { recursive: true }), mkdir(posterDir, { recursive: true })]);
const metadata = await readOptionalMetadata();
const files = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && accepted.has(path.extname(entry.name).toLowerCase()))
  .map((entry) => path.join(sourceDir, entry.name));
const manifest = [];

for (const file of files) {
  const id = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const outputVideo = path.join(videoDir, `${id}.mp4`);
  const temporaryPoster = path.join(posterDir, `${id}-poster.png`);
  const posterAvif = path.join(posterDir, `${id}-poster.avif`);
  const posterWebp = path.join(posterDir, `${id}-poster.webp`);

  await run(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y", "-i", file,
    "-map_metadata", "-1",
    "-movflags", "+faststart",
    "-vf", "scale=min(1920\\,iw):-2",
    "-c:v", "libx264", "-preset", "medium", "-crf", "23",
    "-c:a", "aac", "-b:a", "128k",
    outputVideo,
  ]);

  await run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", "0.1", "-i", outputVideo, "-frames:v", "1", "-update", "1", temporaryPoster]);
  await Promise.all([
    sharp(temporaryPoster).resize({ width: 1280, withoutEnlargement: true }).avif({ quality: 68 }).toFile(posterAvif),
    sharp(temporaryPoster).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 78 }).toFile(posterWebp),
  ]);
  await unlink(temporaryPoster);

  const probe = JSON.parse(await run(ffprobe, [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height:format=duration",
    "-of", "json", outputVideo,
  ], true));
  const stream = probe.streams?.[0];
  const itemMetadata = metadata[id] ?? {};

  manifest.push({
    id: `${id}-video`,
    memoryId: id,
    kind: "video",
    title: itemMetadata.title ?? id.replaceAll("-", " "),
    description: itemMetadata.description ?? `Video connected to ${id.replaceAll("-", " ")}`,
    src: `media/videos/${id}.mp4`,
    posterAvif: `media/posters/${id}-poster.avif`,
    posterWebp: `media/posters/${id}-poster.webp`,
    width: stream?.width ?? 1920,
    height: stream?.height ?? 1080,
    durationSeconds: Number(probe.format?.duration ?? 0),
    ...(itemMetadata.captions ? { captions: itemMetadata.captions } : {}),
  });
  console.log(`Optimized ${path.relative(root, file)}`);
}

manifest.sort((a, b) => a.memoryId.localeCompare(b.memoryId));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Generated ${manifest.length} video record${manifest.length === 1 ? "" : "s"}.`);
