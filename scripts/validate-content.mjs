import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readJson = async (name) => JSON.parse(await readFile(path.join(root, "src", "content", name), "utf8"));
const [chapters, memories, reasons, media, places, videos, songs] = await Promise.all([
  readJson("chapters.json"),
  readJson("memories.json"),
  readJson("reasons.json"),
  readJson("generated-media.json"),
  readJson("places.json"),
  readJson("generated-videos.json"),
  readJson("songs.json"),
]);

const errors = [];
const warnings = [];
const duplicateValues = (values) => values.filter((value, index) => values.indexOf(value) !== index);
const memoryIds = new Set(memories.map((item) => item.id));
const chapterIds = new Set(chapters.map((item) => item.id));

for (const [label, values] of [
  ["chapter IDs", chapters.map((item) => item.id)],
  ["memory IDs", memories.map((item) => item.id)],
  ["reason IDs", reasons.map((item) => item.id)],
  ["reason numbers", reasons.map((item) => item.number)],
  ["media IDs", media.map((item) => item.id)],
  ["place IDs", places.map((item) => item.id)],
  ["video IDs", videos.map((item) => `${item.memoryId}-video`)],
  ["song IDs", songs.map((item) => item.id)],
]) {
  const duplicates = duplicateValues(values);
  if (duplicates.length) errors.push(`Duplicate ${label}: ${[...new Set(duplicates)].join(", ")}`);
}

for (const chapter of chapters) {
  if (!memoryIds.has(chapter.memoryId)) errors.push(`Chapter ${chapter.id} references missing memory ${chapter.memoryId}`);
}

for (const memory of memories) {
  if (!chapterIds.has(memory.chapterId)) errors.push(`Memory ${memory.id} references missing chapter ${memory.chapterId}`);
  if (!memory.title || !memory.summary || !memory.story?.length) errors.push(`Memory ${memory.id} lacks required copy`);
}

for (const place of places) {
  if (place.x < 0 || place.x > 100 || place.y < 0 || place.y > 100) errors.push(`Place ${place.id} has an invalid map position`);
  for (const memoryId of place.memoryIds) if (!memoryIds.has(memoryId)) errors.push(`Place ${place.id} references missing memory ${memoryId}`);
}

for (const item of media) {
  if (!memoryIds.has(item.memoryId)) errors.push(`Media ${item.id} references missing memory ${item.memoryId}`);
  if (!item.alt) errors.push(`Media ${item.id} has no alt text`);
  if (item.alt.startsWith("Photo for ")) warnings.push(`Media ${item.id} still uses generated alt text`);
  for (const source of Object.values(item.sources)) {
    try { await access(path.join(root, "public", source)); }
    catch { errors.push(`Media ${item.id} references missing file ${source}`); }
  }
}

for (const video of videos) {
  const videoId = `${video.memoryId}-video`;
  if (!memoryIds.has(video.memoryId)) errors.push(`Video ${videoId} references missing memory ${video.memoryId}`);
  if (!video.title || !video.description) errors.push(`Video ${videoId} lacks required copy`);
  const sources = [`media/videos/${video.memoryId}.mp4`, `media/posters/${video.memoryId}-poster.webp`, video.captions].filter(Boolean);
  for (const source of sources) {
    try { await access(path.join(root, "public", source)); }
    catch { errors.push(`Video ${videoId} references missing file ${source}`); }
  }
}

for (const song of songs) {
  if (song.memoryId && !memoryIds.has(song.memoryId)) errors.push(`Song ${song.id} references missing memory ${song.memoryId}`);
  if (!song.title || !song.artist || !song.story) errors.push(`Song ${song.id} lacks required copy`);
  if (song.audioPath) {
    try { await access(path.join(root, "public", song.audioPath)); }
    catch { errors.push(`Song ${song.id} references missing audio ${song.audioPath}`); }
  }
  if (!song.audioPath && !song.externalUrl) warnings.push(`Song ${song.id} has story copy but no playable source yet`);
}

for (const memory of memories) {
  if (!media.some((item) => item.memoryId === memory.id)) warnings.push(`Memory ${memory.id} still uses the artwork fallback`);
}

for (const warning of warnings) console.warn(`Warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`Error: ${error}`);
  process.exit(1);
}

console.log(`Validated ${chapters.length} chapters, ${memories.length} memories, ${reasons.length} reasons, ${media.length} images, ${videos.length} videos, ${songs.length} songs, and ${places.length} places.`);
