import { gzipSync } from "node:zlib";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const distDirectory = path.resolve("dist");
const limits = {
  javascript: { raw: 500 * 1024, gzip: 160 * 1024 },
  css: { raw: 100 * 1024, gzip: 25 * 1024 },
  html: { raw: 15 * 1024, gzip: 6 * 1024 },
};

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const nested = await Promise.all(entries.map(async (entry) => {
    const filePath = path.join(directory, entry);
    return (await stat(filePath)).isDirectory() ? collectFiles(filePath) : [filePath];
  }));
  return nested.flat();
}

const files = await collectFiles(distDirectory);
const groups = {
  javascript: files.filter((file) => file.endsWith(".js")),
  css: files.filter((file) => file.endsWith(".css")),
  html: files.filter((file) => file.endsWith(".html")),
};

let failed = false;
for (const [name, group] of Object.entries(groups)) {
  const contents = await Promise.all(group.map((file) => readFile(file)));
  const raw = contents.reduce((total, content) => total + content.byteLength, 0);
  const gzip = contents.reduce((total, content) => total + gzipSync(content).byteLength, 0);
  const limit = limits[name];
  const okay = raw <= limit.raw && gzip <= limit.gzip;
  failed ||= !okay;
  console.log(`${okay ? "PASS" : "FAIL"} ${name}: ${(raw / 1024).toFixed(1)} KB raw / ${(gzip / 1024).toFixed(1)} KB gzip`);
}

if (failed) process.exitCode = 1;
