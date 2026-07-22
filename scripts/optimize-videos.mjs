import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "media-source", "videos");
const videoDir = path.join(root, "public", "media", "videos");
const posterDir = path.join(root, "public", "media", "posters");
const manifestPath = path.join(root, "src", "content", "generated-videos.json");
const galleryManifestPath = path.join(root, "public", "media", "video-manifest.json");
const metadataPath = path.join(root, "media-source", "video-metadata.json");
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobe = process.env.FFPROBE_PATH || "ffprobe";
const accepted = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const manifestOnly = process.argv.includes("--manifest-only");
const onlyId = process.argv.find((argument) => argument.startsWith("--only="))?.slice(7);

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
  const posterWebp = path.join(posterDir, `${id}-poster.webp`);
  const itemMetadata = metadata[id] ?? {};
  const memoryId = Object.hasOwn(itemMetadata, "memoryId") ? itemMetadata.memoryId : id;
  const inputArgs = ["-hide_banner", "-loglevel", "error", "-y"];
  if (Number.isFinite(itemMetadata.sourceStartSeconds)) inputArgs.push("-ss", String(itemMetadata.sourceStartSeconds));
  inputArgs.push("-i", file);
  if (Number.isFinite(itemMetadata.sourceDurationSeconds)) inputArgs.push("-t", String(itemMetadata.sourceDurationSeconds));

  const shouldOptimize = !manifestOnly && (!onlyId || onlyId === id);
  if (shouldOptimize) {
    await run(ffmpeg, [
      ...inputArgs,
      "-map_metadata", "-1",
      "-movflags", "+faststart",
      "-vf", `${itemMetadata.rotate === 90 ? "transpose=clock," : itemMetadata.rotate === -90 ? "transpose=cclock," : itemMetadata.rotate === 180 ? "hflip,vflip," : ""}scale='min(1920\\,iw)':'min(1440\\,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`,
      "-c:v", "libx264", "-preset", "medium", "-crf", "23",
      "-c:a", "aac", "-b:a", "128k",
      outputVideo,
    ]);

    await run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(itemMetadata.posterTimeSeconds ?? .1), "-i", outputVideo, "-frames:v", "1", "-update", "1", temporaryPoster]);
    await sharp(temporaryPoster).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 78 }).toFile(posterWebp);
    await unlink(temporaryPoster);
  }

  const probe = JSON.parse(await run(ffprobe, [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height:format=duration",
    "-of", "json", outputVideo,
  ], true));
  const stream = probe.streams?.[0];
  manifest.push({
    slug: id,
    ...(memoryId ? { memoryId } : {}),
    title: itemMetadata.title ?? id.replaceAll("-", " "),
    description: itemMetadata.description ?? `Video connected to ${id.replaceAll("-", " ")}`,
    width: stream?.width ?? 1920,
    height: stream?.height ?? 1080,
    durationSeconds: Number(probe.format?.duration ?? 0),
    ...(itemMetadata.capturedAt ? { capturedAt: itemMetadata.capturedAt } : {}),
    ...(itemMetadata.captions ? { captions: itemMetadata.captions } : {}),
  });
  console.log(`${shouldOptimize ? "Optimized" : "Indexed"} ${path.relative(root, file)}`);
}

manifest.sort((a, b) => (a.capturedAt ?? a.memoryId).localeCompare(b.capturedAt ?? b.memoryId));
const connectedManifest = manifest
  .filter((item) => item.memoryId)
  .map(({ slug, ...item }) => slug === item.memoryId ? item : { slug, ...item });
await Promise.all([
  writeFile(galleryManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
  writeFile(manifestPath, `${JSON.stringify(connectedManifest, null, 2)}\n`, "utf8"),
]);
console.log(`Generated ${manifest.length} gallery records and ${connectedManifest.length} timeline-linked records.`);
