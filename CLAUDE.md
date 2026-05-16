# nati-istat — Claude Code instructions

> **SESSION HANDOFF**: se stai riprendendo il lavoro in una nuova sessione,
> leggi prima `HANDOFF-SESSION-NEXT.md` per il punto di ingresso.

## Documenti di riferimento

### Priorità MASSIMA (leggi sempre, in questo ordine)

1. `HANDOFF-SESSION-NEXT.md` — **entry point primario** per riprendere lavoro in nuove sessioni
2. `PENDING-WORK.md` — checklist viva pending strutturata per stato
3. `SESSION-STATE.md` — snapshot runtime completo (cronologia inversa)

### Riferimenti progetto

- `docs/superpowers/specs/2026-05-16-nati-istat-design.md` — design spec completo
- `docs/superpowers/plans/2026-05-16-nati-istat-implementation.md` — plan implementation 10 fasi
- `docs/decisions/` — 3 ADR (stack, charts, pipeline)
- `README.md` — overview pubblico del progetto

## Project context in una riga

Long-read editoriale + dashboard analitica online (https://nati-istat.vercel.app) sulle proiezioni demografiche ISTAT del tasso di fecondità totale italiano (TFT). Confronto multi-release Eurostat 2019/2023/2025 + ISTAT 2024 vs dato osservato 1952-2024, con backtest empirico che dimostra bias sistematico di sovra-stima.

## Stack veloce

- **Pipeline dati**: `pipeline/` Python 3.12 + uv + sdmx1 + pandas (5 fonti integrate, 22 test)
- **Frontend**: `web/` Next.js 15 App Router + TypeScript + Tailwind v4 + Observable Plot
- **Hosting**: Vercel (rootDirectory=`web`), GitHub repo pubblico
- **CI**: GitHub Actions data-validate + web-check

## Convenzioni progetto

- **TFT** non TFR (in italiano TFR = Trattamento Fine Rapporto, ambiguo). Tasso di Fecondità Totale.
- **Decimali italiani** ovunque nel frontend: 1,46 non 1.46 (vedi `web/lib/format.ts`)
- **Mobile-first responsive** chart via ResizeObserver
- **Dark mode** con localStorage + prefers-color-scheme
- **TypeScript strict** + noUncheckedIndexedAccess
- **Pipeline deterministica**: snapshot frozen committed in `data/raw/`, output in `data/processed/`

## Comandi essenziali

```bash
# Pipeline
cd pipeline && uv sync && uv run python build.py --no-download

# Web dev
cd web && pnpm install && pnpm dev   # http://localhost:3000

# Web build + Lighthouse locale
cd web && pnpm build && (PORT=3001 pnpm start &); sleep 3
npx --yes lighthouse "http://localhost:3001" --quiet \
  --chrome-flags="--headless --no-sandbox" \
  --form-factor=mobile --throttling-method=simulate \
  --output=json --output-path=/tmp/lh.json

# Deploy manuale
vercel deploy --prod --yes
```

## Scoperte critiche (vedi anche SESSION-STATE.md §1)

- **ISTAT SDMX moderno** è su `esploradati.istat.it`, dataset ID versionati (es. `25_944_DF_DCIS_ARCH_FEC_6`)
- **Eurostat PROJ_NAASFR** ha TFT per release: filter `age=TOTAL` + `projection=BSL`
- **UN WPP COMPACT** ha solo Estimates + Medium (no Low/High senza API auth)
- **Vercel BotID** blocca Lighthouse esterno: usare `pnpm start` locale
- **Vercel rootDirectory** in monorepo va settato via API PATCH, non vercel.json
- **Plot non responsive** di default: wrapper con ResizeObserver è obbligatorio
