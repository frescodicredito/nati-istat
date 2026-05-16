# SESSION-STATE — nati-istat

Snapshot runtime dettagliato. Cronologia inversa (più recente in alto).

---

## §1 — 16 maggio 2026 · sessione costruzione + perfezionamento

**Durata effettiva:** ~7-8 ore di lavoro continuo (con interrupt utente)

### Genesi del progetto

L'utente ha condiviso uno screenshot WhatsApp con amici (Marchello, Andrea Nuovo) sul grafico ISTAT proiezione TFT 2024 con la frase di Marchello "Hopium". Da lì la domanda "possiamo fare uno studio approfondito? una dashboard fighissima?". Brainstorming con superpowers skill, poi spec completo, poi plan 10 fasi, poi esecuzione.

### Commit principali deployati (in ordine cronologico)

| Hash | Descrizione | Fase |
|---|---|---|
| `58f8408` | init: design spec + README + gitignore | Phase 0 |
| `b243b4f` | feat(pipeline): Phase 1 - foundations + D1 TFT | Phase 1 |
| `7b6c542` | feat(pipeline): Phase 2 - D3 cittadinanza + D9 proiezioni | Phase 2 |
| `888ec37` | feat(pipeline): Phase 3 - transforms + validators | Phase 3 |
| `ab31990` | feat(web): Phase 4-5 - Next.js bootstrap + primitives | Phase 4-5 |
| `badb3fb` | feat(web): Phase 6-7 - capitoli 0-6 implementati | Phase 6-7 |
| `8f8a661` | feat(web): Phase 8 - /metodologia /dati + SEO | Phase 8 |
| `046d053` | feat: Phase 9 - deploy production Vercel | Phase 9 |
| `49c5341` | docs: README finale | Phase 10 |
| `cd1718a` | fix(ci): web build module-not-found + ruff format | Hotfix |
| `9121af5` | fix(web): outputFileTracingIncludes esterno root | Hotfix |
| `48c0795` | feat(pipeline): E1+E2 serie 1952-2024 + UN WPP | E1+E2 |
| `17a8976` | feat(web): E3 capitoli riscritti dati completi | E3 |
| `bde164b` | feat(web): E4 dark mode + mobile + format IT + favicon | E4 part 1 |
| `e34c4ea` | feat(web): PlotChart responsive ResizeObserver | E4 part 2 |
| `66dbf00` | fix: TFR → TFT disambiguare | TFR fix |
| `0e98cdb` | feat(pipeline): F1 Eurostat 2019/2023/2025 + backtest | F1 |
| `c203c54` | feat(web): F3+F4+F5 cap 5 cascade + Hero KPI + OG | F3-F5 |
| `17c557d` | feat(web): Hero ridisegnato fan chart killer | Hero v2 |
| `01be269` | polish(web): Hero compatta titolo + grafico | Hero v2.1 |
| `c313215` | fix(web): Hero fit-on-screen viewport + mobile | Hero v3 |
| `5b455cb` | WIP(web): Hero zoom 2000-2080 — work in progress | Hero v4 WIP |
| `7cb641f` | docs: handoff cap 4 spiegazione bias (priorita ALTA) | Docs |
| `9561445` | feat(web): cap 4 espanso + Hero finale pulito | Cap 4 + Hero v5 |

**Tag:** nessuno. Sessione 16 mag chiusa con cap 4 espanso (6 sezioni metodologiche su bias) e Hero finale (senza trend lineare estrapolato). Tutto live e verificato. Eligibile per `v1.0.0` se l'utente vuole taggare.

### Deploy / infra

- **Vercel project**: `frescodicreditos-projects/nati-istat`
  - Project ID: `prj_TOnIV1Vag3OmjHMVh4CbioObVJdt`
  - Org ID: `team_xBLXMQR66bHAYPkBL4cJF739`
  - Root directory: `web` (settata via API PATCH /v9/projects/{id})
  - Framework: nextjs (auto-detect)
  - URL: https://nati-istat.vercel.app
  - Auto-deploy on `main` push
- **GitHub repo**: https://github.com/frescodicredito/nati-istat (pubblico)
  - CI Actions: `data-validate.yml` + `web-check.yml` (entrambi verdi)
- **Vercel CLI**: aggiornata 48.4.0 → 54.1.0 via npm in inizio sessione
- **gh CLI**: scope `repo, workflow, gist, read:org` ok

### Scoperte critiche durante esecuzione

#### 1. ISTAT SDMX endpoint moderno
Il SDMX legacy `http://sdmx.istat.it/SDMXWS/rest/data/<dataset>` restituisce 500 per `DCIS_FECONDITA1` e simili nomi "puri". L'endpoint moderno è `https://esploradati.istat.it/SDMXWS/rest/`, e i dataset hanno IDs versionati:
- `25_326_DF_DCIS_FECONDITA1_5` (TFT per cittadinanza, 1999-2024)
- `25_944_DF_DCIS_ARCH_FEC_6` (TFT archive 1952-2024, totale Italia, filter `RESIDENCE_TERR=IT, BIRTH_ORDER=ALL, YEAR_BIRTH_MOTHER=ALL`)
- `165_889_DF_DCIS_PREVDEM1_3` (Demographic indicators projection 2024)

Soluzione: `sdmx1.Client('ISTAT')` gestisce automaticamente l'endpoint corretto. Salvare snapshot come CSV (più verificabile di SDMX-ML) + manifest JSON con sha256.

#### 2. Eurostat NAASFR per release proiezioni
PROJ_19/23/25_NDBI ("Demographic indicators") NON contiene TFR. Usare invece:
- PROJ_19NAASFR / PROJ_23NAASFR / PROJ_25NAASFR ("Assumptions for fertility rates by age")
- Filter `age=TOTAL` + `projection=BSL` (baseline) → TFT diretto in colonna `value`
- Tre release Italia coprono 2019-2100, 2022-2100, 2025-2100

#### 3. UN WPP COMPACT file ha solo Estimates + Medium
Il file `WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx` (26MB) NON contiene scenari Low/High. Per averli serve UN Data Portal API authenticated (registrazione obbligatoria) o file separati introvabili via curl.

#### 4. TFR vs TFT in italiano
"TFR" è acronimo internazionale demografico standard, MA in italiano popolare = Trattamento di Fine Rapporto. ISTAT stesso nei testi italiani usa "TFT" (Tasso di Fecondità Totale). Refactor globale TFR → TFT applicato in `web/` (lascia `tfr` lowercase per field name JS), pipeline mantiene `TFR` come codice indicator SDMX dove richiesto.

#### 5. Vercel rootDirectory in monorepo
`vercel.json` in root NON funziona se il progetto è in subfolder `web/`. Serve settare `rootDirectory: "web"` via Vercel API PATCH (no CLI command esiste). vercel.json va lasciato in subfolder, oppure rimosso del tutto se i settings sono via API.

#### 6. Vercel BotID blocca Lighthouse
Lighthouse cloud + curl bot user-agent ricevono 403 con `x-vercel-mitigated: challenge`. Test locale `pnpm start` su porta libera è l'unico modo per audit Lighthouse.

#### 7. Plot chart non responsive di default
Observable Plot riceve width/height fissi. Per responsive serve wrapper React con ResizeObserver che passa containerWidth a `Plot.plot()`. Senza, gli SVG hanno overflow e creano gap su mobile. Vedi `web/components/charts/PlotChart.tsx`.

#### 8. JSON con NaN non parseable da TypeScript
`pandas.to_dict(orient='records')` mantiene NaN. JSON con `NaN` non è parseable da `import` TypeScript. Soluzione: `json.loads(df.to_json(orient='records'))` converte NaN in `null`.

#### 9. Next.js `outputFileTracingIncludes` non accetta path fuori dal project root
Il glob `../data/processed/**/*.json` causa `TurbopackInternalError`. Soluzione: copiare i dati dentro `web/lib/_data/` via script `scripts/copy-data.mjs` (predev/prebuild).

### Decisioni architetturali principali

- **Stack**: Next.js 15 App Router + RSC + Tailwind v4 + Observable Plot + D3 raw per chart custom (vedi `docs/decisions/001-stack-choice.md`)
- **Charts**: Plot per editoriali standard, D3 raw per killer chart (`002-charts-library.md`)
- **Pipeline**: Python 3.12 + uv + sdmx1 + frozen snapshots committed (`003-data-pipeline.md`)
- **Hosting**: Vercel free tier, repo GitHub pubblico, CI via Actions

### Resources / IDs

- Vercel project ID: `prj_TOnIV1Vag3OmjHMVh4CbioObVJdt`
- Vercel org ID: `team_xBLXMQR66bHAYPkBL4cJF739`
- GitHub repo: `frescodicredito/nati-istat`
- Snapshot date: `2026-05-16` (in `data/raw/<source>/2026-05-16/`)
- Pipeline version riferita nei JSON audit trail: SHA del commit (es. `66dbf00`)

### Smoke test results (post commit 5b455cb)

- `curl https://nati-istat.vercel.app` → HTTP 200, ~36KB HTML
- `curl https://nati-istat.vercel.app/metodologia` → HTTP 200, ~42KB
- `curl https://nati-istat.vercel.app/dati` → HTTP 200
- `curl https://nati-istat.vercel.app/sitemap.xml` → HTTP 200
- `curl https://nati-istat.vercel.app/opengraph-image` → HTTP 200, image/png 42KB
- `gh run list --workflow=web-check.yml` → success (ultima run)
- `gh run list --workflow=data-validate.yml` → success (ultima run)

### Lighthouse mobile (locale `pnpm start` su porta libera)

| Metrica | Score | Note |
|---|---|---|
| Performance | 90 | LCP penalizzata da Hero chart edge runtime |
| Accessibility | 92 | 1 color-contrast minor + 1 aria-prohibited non identificati |
| Best Practices | 100 | |
| SEO | 100 | |

### Memory persistent salvate (brain-memory, se attivo)

- `feedback-tone-no-frasi-effetto`: tono affilato senza retorica facile per copy FDC
- `feedback-data-pipeline-rigor`: 6 vincoli baseline per affidabilità 100% verificabile

### Footer info dataset esposto sul sito

Footer `/` usa `tfrHistorical.audit.downloaded_at` → mostra "Dati aggiornati al: 2026-05-16"
