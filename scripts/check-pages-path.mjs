import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const expectedBase = "/wasiatus-birthday-journey/assets/";

if (!html.includes(expectedBase)) {
  console.error(`GitHub Pages asset base missing. Expected ${expectedBase} in dist/index.html.`);
  process.exitCode = 1;
} else {
  console.log(`PASS GitHub Pages assets use ${expectedBase}`);
}
