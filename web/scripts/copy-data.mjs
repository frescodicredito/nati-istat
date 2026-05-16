/**
 * Copia data/processed/ → web/public/data/ per static serving via /dati page.
 * Eseguito da `pnpm predev` e `pnpm prebuild`.
 */

import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const SRC = resolve(import.meta.dirname, "../../data/processed");
const DST = resolve(import.meta.dirname, "../public/data");

if (!existsSync(SRC)) {
  console.error(`[copy-data] Source missing: ${SRC}`);
  process.exit(1);
}

if (existsSync(DST)) {
  await rm(DST, { recursive: true, force: true });
}
await mkdir(DST, { recursive: true });
await cp(SRC, DST, { recursive: true });
console.log(`[copy-data] ${SRC} → ${DST}`);
