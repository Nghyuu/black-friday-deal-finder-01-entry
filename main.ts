// Entry program for Bargain Beacon, a Black Friday deal finder
// (Node 22, standard library only).
//
// It hands the site in: copies this repository's app/ and screenshots/ into
// the output directory named by MAKEFUN_OUTPUT_DIR and writes dossier.json
// there with buildDossier from the kit's vendored library. The variable must
// be set; there is no fallback directory, so a run outside the grader never
// writes into this repo or anywhere else.
//
//   MAKEFUN_OUTPUT_DIR=/tmp/bf-out node main.ts
//
// The grader runs as a different user than the one owning /output, so every
// chmod is wrapped in try/catch: a failed chmod on a file must never abort
// the run, and the output directory itself is never chmodded, never removed,
// and never created by anything but a recursive mkdir.

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));

const outputDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outputDir) {
  throw new Error('MAKEFUN_OUTPUT_DIR is not set; refusing to write anywhere else');
}

function safeChmod(path, mode) {
  try {
    chmodSync(path, mode);
  } catch {
    // The output directory may belong to another user; a chmod failure
    // must not stop the hand-in.
  }
}

// Make every copied output file world-readable; directories are left alone
// (the grader owns /output, so chmodding it would fail with EPERM).
function chmodFilesRecursive(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) chmodFilesRecursive(path);
    else safeChmod(path, 0o644);
  }
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
}
chmodFilesRecursive(join(outputDir, 'app'));
chmodFilesRecursive(shotsDir);

const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
safeChmod(dossierPath, 0o644);
console.log(`Bargain Beacon handed in: app/ + screenshots/ copied to ${outputDir}, dossier.json written.`);
