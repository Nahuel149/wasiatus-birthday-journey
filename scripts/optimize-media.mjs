import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "media-source", "photos");
const outputDir = path.join(root, "public", "media", "images");
const manifestPath = path.join(root, "src", "content", "generated-media.json");
const metadataPath = path.join(root, "media-source", "metadata.json");
const accepted = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const sizes = { thumbnail: 480, medium: 960, large: 1920 };

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return nested.flat();
}

async function readOptionalMetadata() {
  try {
    return JSON.parse(await readFile(metadataPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

await mkdir(outputDir, { recursive: true });
const metadata = await readOptionalMetadata();
const files = (await walk(sourceDir)).filter((file) => accepted.has(path.extname(file).toLowerCase()));
const manifest = [];

for (const file of files) {
  const id = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const pipeline = sharp(file).rotate();
  const info = await pipeline.metadata();
  if (!info.width || !info.height) throw new Error(`Could not read dimensions for ${file}`);

  const sources = {};
  for (const [sizeName, width] of Object.entries(sizes)) {
    for (const format of ["avif", "webp"]) {
      const filename = `${id}-${width}.${format}`;
      const destination = path.join(outputDir, filename);
      const image = sharp(file).rotate().resize({ width, withoutEnlargement: true });
      if (format === "avif") await image.avif({ quality: sizeName === "large" ? 72 : 66 }).toFile(destination);
      else await image.webp({ quality: sizeName === "large" ? 82 : 76 }).toFile(destination);
      sources[`${sizeName}${format[0].toUpperCase()}${format.slice(1)}`] = `media/images/${filename}`;
    }
  }

  manifest.push({
    id: `${id}-image`,
    memoryId: id,
    kind: "image",
    alt: metadata[id]?.alt ?? `Photo for ${id.replaceAll("-", " ")}`,
    width: info.width,
    height: info.height,
    sources,
  });
  console.log(`Optimized ${path.relative(root, file)}`);
}

manifest.sort((a, b) => a.memoryId.localeCompare(b.memoryId));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Generated ${manifest.length} media record${manifest.length === 1 ? "" : "s"}.`);
