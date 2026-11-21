// gta6-clipper-01 entry program.
//
// The entry itself is the YouTube clip; this program has exactly one job:
// hand the clip's address to the grader. It copies VIDEO.json from the
// repository directory into the output directory, creating that directory
// first when it does not exist yet. No network, no clock, no state — running
// it twice produces the same bytes twice.
//
// Local run (the grader sets the same variables inside its container):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Where VIDEO.json lives: the harness points MAKEFUN_BOT_DIR at the repo;
// outside the harness, fall back to this file's own directory.
const repoDir = process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));

// Where the copy goes: MAKEFUN_OUTPUT_DIR when set, otherwise ./out.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";

mkdirSync(outputDir, { recursive: true });

try {
  copyFileSync(join(repoDir, "VIDEO.json"), join(outputDir, "VIDEO.json"));
} catch (cause) {
  const detail = cause instanceof Error ? cause.message : String(cause);
  console.error(`main.ts: could not copy VIDEO.json into ${outputDir}: ${detail}`);
  process.exit(1);
}
