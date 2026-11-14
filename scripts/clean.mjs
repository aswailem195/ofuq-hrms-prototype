import { rmSync } from "node:fs";

const generatedPaths = [
  "dist",
  "playwright-report",
  "test-results",
  "tmp",
  "tsconfig.tsbuildinfo",
];

for (const path of generatedPaths) {
  rmSync(new URL(`../${path}`, import.meta.url), {
    recursive: true,
    force: true,
  });
}

console.log("Fichiers temporaires et sorties générées nettoyés.");
