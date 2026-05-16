/**
 * Copia data/processed/ in due posti dentro web/:
 *  - web/lib/_data/    — per import statici (build-time inlining via lib/data.ts)
 *  - web/public/data/  — per static serving (pagina /dati, download diretti)
 *
 * Eseguito da `pnpm predev` e `pnpm prebuild`.
 * I due target sono gitignored.
 */

import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const SRC = resolve(import.meta.dirname, "../../data/processed");
const TARGETS = [
  resolve(import.meta.dirname, "../lib/_data"),
  resolve(import.meta.dirname, "../public/data"),
];

if (!existsSync(SRC)) {
  console.error(`[copy-data] Source missing: ${SRC}`);
  process.exit(1);
}

for (const dst of TARGETS) {
  if (existsSync(dst)) {
    await rm(dst, { recursive: true, force: true });
  }
  await mkdir(dst, { recursive: true });
  await cp(SRC, dst, { recursive: true });
  console.log(`[copy-data] ${SRC} → ${dst}`);
}
