// gta6-clipper-01 entry program.
//
// The entry itself is the YouTube clip; this program has exactly one job:
// hand the clip's address to the grader. It first reads VIDEO.json and
// checks that its "url" really is a YouTube address — a corrupt file or an
// empty url fails loudly here instead of passing silently and letting the
// entry die on the grader's side without a trace. Then it copies VIDEO.json
// from the repository directory into the output directory, creating that
// directory first when it does not exist yet. No network, no clock, no
// state — running it twice produces the same bytes twice.
//
// Local run (the grader sets the same variables inside its container):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Where VIDEO.json lives: the harness points MAKEFUN_BOT_DIR at the repo;
// outside the harness, fall back to this file's own directory.
const repoDir = process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));

// Where the copy goes: MAKEFUN_OUTPUT_DIR when set, otherwise ./out.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";

const sourcePath = join(repoDir, "VIDEO.json");

// Validate before copying: VIDEO.json must parse, and its "url" must be a
// YouTube address in one of the shapes the house reads — a Shorts link, a
// watch link, or a youtu.be short link. Anything else is a broken entry, so
// say so on stderr and exit non-zero rather than copy it over.
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(sourcePath, "utf8"));
} catch (cause) {
  const detail = cause instanceof Error ? cause.message : String(cause);
  console.error(`main.ts: VIDEO.json is not readable JSON: ${detail}`);
  process.exit(1);
}

const url =
  parsed !== null && typeof parsed === "object"
    ? (parsed as { url?: unknown }).url
    : undefined;
const YOUTUBE_URL =
  /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)[\w-]+/;
if (typeof url !== "string" || !YOUTUBE_URL.test(url)) {
  console.error(
    `main.ts: VIDEO.json "url" must be a YouTube address ` +
      `(youtube.com/shorts/, youtube.com/watch?v= or youtu.be/), got: ${JSON.stringify(url ?? null)}`,
  );
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

try {
  copyFileSync(sourcePath, join(outputDir, "VIDEO.json"));
} catch (cause) {
  const detail = cause instanceof Error ? cause.message : String(cause);
  console.error(`main.ts: could not copy VIDEO.json into ${outputDir}: ${detail}`);
  process.exit(1);
}
