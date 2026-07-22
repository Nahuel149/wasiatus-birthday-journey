import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const sourceDir = path.join(root, "media-inbox", "music");
const outputDir = path.join(root, "public", "media", "audio");
const ffmpeg = process.platform === "win32"
  ? path.join(process.env.USERPROFILE, "tools", "ffmpeg", "bin", "ffmpeg.exe")
  : "ffmpeg";

const tracks = [
  ["LAGU SELAMAT ULANG TAHUN  - Lagu Anak Anak.mp3", "birthday-indonesia.mp3"],
  ["My Chemical Romance - Welcome To The Black Parade [Official Music Video] [HD].mp3", "welcome-to-the-black-parade.mp3"],
  ["Sum 41 - In Too Deep (Official Music Video).mp3", "in-too-deep.mp3"],
  ["Simple Plan - Welcome To My Life (Official Video).mp3", "welcome-to-my-life.mp3"],
  ["All Time Low - Dear Maria, Count Me In (Official Music Video).mp3", "dear-maria-count-me-in.mp3"],
  ["SUM 41 video message to PUNKSPRING 2016.mp3", "punkspring-message.mp3"],
  ["好きだから ユイカMV.mp3", "suki-dakara.mp3"],
  ["Simple Plan - Boom (Official Video).mp3", "boom.mp3"],
];

await mkdir(outputDir, { recursive: true });

for (const [sourceName, outputName] of tracks) {
  const source = path.join(sourceDir, sourceName);
  const output = path.join(outputDir, outputName);
  await run(ffmpeg, [
    "-y", "-v", "error", "-i", source,
    "-vn", "-map_metadata", "-1",
    "-af", "loudnorm=I=-16:LRA=11:TP=-1.5",
    "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "2",
    "-id3v2_version", "3", "-write_id3v1", "0",
    output,
  ]);
  console.log(`Optimized ${sourceName} -> ${path.relative(root, output)}`);
}

console.log(`Generated ${tracks.length} browser-ready soundtrack files.`);
