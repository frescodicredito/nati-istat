# nati-istat — Design Spec

| | |
|---|---|
| **Stato** | Approvato — pronto per implementation plan |
| **Data** | 16 maggio 2026 |
| **Autore** | Francesco Di Credico (con assistenza Claude) |
| **Tipo** | Long-read investigativo + dashboard analitica |
| **Output finale** | Sito web online su Vercel, repo pubblico su GitHub |

---

## 1. Goal & non-goal

### Goal

Costruire una dashboard editoriale online che documenti, con rigore metodologico verificabile, il pattern sistematico di sovra-stima delle proiezioni demografiche ISTAT sul tasso di fecondità italiano (TFR), e le implicazioni a cascata sulle previsioni economiche che vi si basano.

Il deliverable è un sito statico a singola pagina long-read scrollabile, con sezione metodologia e download dati, deployato su Vercel da repo GitHub pubblico, riproducibile end-to-end da chiunque cloni il repo.

### Non-goal (esplicito)

- ❌ Policy recommendations sulla natalità ("ecco cosa dovrebbe fare lo Stato")
- ❌ Analisi sociologica delle cause del calo della natalità
- ❌ Confronti deep-dive con paesi non-EU (Corea, Giappone)
- ❌ Dashboard esplorativa con filtri liberi (sarebbe diluizione: vogliamo una tesi, non un tool)
- ❌ Real-time data (rebuild manuale o cron mensile è sufficiente)
- ❌ Backend, database, autenticazione, commenti, social interaction on-site
- ❌ Mobile app, PWA installabile

---

## 2. Purpose, audience, tono, estetica

### Purpose
Investigativo argomentativo: smontare la narrativa ottimistica delle proiezioni demografiche ISTAT mostrando il loro track record empirico (release 2007/2011/2017/2021/2024 confrontate con i dati osservati) e decostruendo le ipotesi metodologiche che producono la curva di recupero.

### Audience
Italiano. Pubblico tecnico-curioso non specialista (amici, cerchia LinkedIn estesa). Spiegazioni medio-tecniche, intuizione visiva privilegiata su formule. Apertura a versione EN in futuro tramite `next-intl` (scaffolding predisposto, non attivato).

### Tono
**Rigoroso anche se affilato.** L'edge sta nei numeri e nelle annotazioni fattuali, non nei titoli o nella retorica. I titoli sono descrittivi ("Le proiezioni ISTAT 2007-2024 confrontate con i dati osservati"), non click-bait. Le annotazioni sono fattuali ("la release 2017 proiettava 1,35 per il 2024, il dato osservato è 1,18").

### Estetica
**OWID/Research-dashboard come base** (tipografia pulita, palette controllata, layout informativo prima di tutto) **con tocchi editorial** per le sezioni narrative chiave (serif per headline narrative, annotazioni a margine). **Eleganza prioritaria** come constraint trasversale — impaginazione curata, generous whitespace, gerarchie visive nitide.

Type system:
- **Source Serif 4** — headline narrative dei capitoli
- **IBM Plex Sans** — body, UI, sottotitoli, navigazione
- **IBM Plex Mono** — numeri in tabelle, codice, dati inline
- Self-hosted, subset per glyph IT + numeri + simboli necessari

Palette:
- Neutri: bianchi e grigi (light mode), inverso per dark mode
- Accent 1 (rosso `#a8260b`) — serie storica reale ("history")
- Accent 2 (grigio-blu `#7b9fc4` / `#a8c0d8` / `#c8d8e8`) — proiezioni ISTAT (gradiente per release)
- Accent 3 (turchese `#45BCCC`) — scenari alternativi nostri / UN

---

## 3. Arco narrativo

Single long-read scroll-driven con sticky chapter nav. 7 capitoli (0-6) + pagina metodologia. Tempo di lettura stimato 10-12 minuti.

| # | Capitolo | Titolo | Grafico chiave |
|---|---|---|---|
| 0 | Apertura | Il grafico di proiezione ISTAT 2024 | Replica fedele grafico Kalistat + zoom punto giunzione 2024 |
| 1 | Il dato di partenza | Tasso di fecondità totale, Italia 1952–2024 | Serie storica con annotazioni eventi (1964 picco baby boom, 1995 minimo storico 1,19, 2008 recupero 1,45, 2010→ declino) |
| 2 | La ripresa 2003–2010 | Scomposizione del recupero: italiane, straniere, tempo recuperato | Multi-line per cittadinanza + bridge chart contribution al picco 2008 |
| 3 | Track record delle proiezioni | Proiezioni ISTAT 2007–2024 confrontate con i dati osservati | **Grafico centrale**: 5 release proiezioni sovrapposte + reale, con metriche di errore quantificate |
| 4 | Le assunzioni del modello | Le ipotesi che generano la traiettoria di recupero | Decostruzione: convergenza al target, fecondità rinviata, contributo straniere + benchmark UN WPP low/med/high |
| 5 | Le previsioni dipendenti | Forecast economici basati su queste proiezioni | Cascade chart TFR → popolazione attiva → indice dipendenza → spesa pensionistica/PIL |
| 6 | Scenari alternativi | Tre traiettorie a confronto: ISTAT mediano, UN low, modello no-recovery | Comparatore interattivo: popolazione 2080, età mediana, indice dipendenza per scenario |

Pagina separata: `/metodologia` — fonti, ipotesi, codice, riproducibilità.

**Pattern editoriale per capitolo:**
- Anchor visibile in sticky nav
- Opening sentence (una sola, descrittiva)
- Primary chart edge-to-edge
- 1-3 annotazioni inline fattuali
- Paragrafo di supporto (~150 parole max)
- Eventuale secondary chart o small multiples
- Caption: "Fonte: ISTAT ⓘ" → link a `/metodologia#datapoint-xxx`

**Climax narrativo:** capitolo 3 (il grafico killer delle 5 release). Capitoli 0-2 costruiscono contesto, capitoli 4-6 estraggono implicazioni.

---

## 4. Pilastro metodologico

Colonna portante del progetto: se i nostri dati o le nostre trasformazioni sono criticabili, l'intero argomento crolla. Sei vincoli operativi non-negoziabili sulla data pipeline.

### 4.1 Provenance (fonti primarie documentate)
Ogni datapoint pubblicato ha fonte primaria documentata: codice tavola ISTAT/Eurostat, URL, data download. Nessun aggregator non verificabile. Visibile via icona "ⓘ" sui grafici nel sito.

### 4.2 Riproducibilità deterministica
Pipeline Python con `pyproject.toml` + `uv.lock` committati. Stesso input → stesso output bit-per-bit. Test CI verifica.

### 4.3 Frozen snapshots
Raw data scaricati committati nel repo (`data/raw/YYYY-MM-DD/`). Pipeline verificabile anche se ISTAT cambia API o ritira dataset. Trade-off accettato: repo size cresce ~10-50 MB per snapshot, accettabile per il valore di verifica.

### 4.4 Cross-validation
Dove esistono fonti multiple per lo stesso indicatore (TFR ISTAT vs Eurostat vs HFD), confronto pubblicato in pagina metodologia. Discrepanze documentate e spiegate.

### 4.5 Validation tests
Regole automatiche sui datapoint chiave:
- TFR italiano sempre in `[0.5, 3.0]`
- Nascite mensili devono sommare al totale annuale ±0.1%
- Serie storiche con buchi vietate (almeno NaN esplicito)
- Proiezioni archive devono coprire orizzonti documentati
- Hash dei file processed deterministico tra build

Build CI fallisce se un test fallisce. Deploy bloccato.

### 4.6 Audit trail
Ogni JSON processato esce con metadata:
```json
{
  "source": "ISTAT DCIS_FECONDITA1",
  "source_url": "http://sdmx.istat.it/...",
  "downloaded_at": "2026-05-16T14:30:00Z",
  "pipeline_version": "git_sha_xxx",
  "transforms_applied": ["normalize_year", "compute_decomposition"],
  "validation_passed": true,
  "datapoint_count": 73
}
```

Esposti nel sito (tooltip ⓘ sui chart) e nella pagina metodologia.

### 4.7 Conseguenze architetturali
- **Livello dati separato e indipendente** (cartella `pipeline/` Python) produce artefatti versionati (`data/processed/*.json` con hash). Frontend consuma solo artefatti versionati.
- **Tre click max** dal claim numerico nel testo alla fonte primaria: claim → anchor metodologia → URL ISTAT.
- **Statistical caveats esposti**, non nascosti. Esempio: il TFR è un indicatore di periodo che soffre di tempo effects — questo è spiegato in metodologia ed evocato nel cap 2.

---

## 5. Information Architecture

### Pagine
- `/` — Home (the long-read, 7 capitoli + footer)
- `/metodologia` — Fonti, ipotesi, codice, riproducibilità (long-form)
- `/dati` — Download CSV/JSON di tutti i dataset, links a snapshot raw, instructions per replicate

### Sticky UI persistente
- Top nav: logo + numeri capitoli (1-6) + "Metodologia" + "Dati" + share button
- Reading progress bar al bordo superiore
- Footer: licenza, autore, repo GitHub, ultima data di aggiornamento dati

### Pattern componente capitolo
```
<Chapter id="3" title="Track record delle proiezioni">
  <ChapterAnchor />
  <OpeningSentence />
  <PrimaryChart>
    <ChartTitle />
    <ChartVisualization />
    <ChartAnnotations />
    <ChartCaption sourceId="datapoint-xxx" />
  </PrimaryChart>
  <SupportingProse maxWords={150} />
  <SecondaryChart? />
  <ChapterShare />
</Chapter>
```

### Responsiveness
Mobile-first. Su mobile i chart sono edge-to-edge, le annotazioni laterali diventano tooltip onTap, la sticky nav si trasforma in dropdown menu. Test su iPhone SE width (375px) come breakpoint minimo.

### Accessibility
- Contrast WCAG AA minimo
- Alt text descrittivo per ogni chart (descrive il pattern, non solo "grafico")
- Navigazione keyboard completa
- Reduced motion respect (`prefers-reduced-motion`)
- Screen reader: caption + table fallback per chart serio

---

## 6. Data pipeline

### 6.1 Fonti (14 dataset)

| ID | Fonte | Cosa | Formato | Refresh |
|---|---|---|---|---|
| D1 | ISTAT dati.istat.it | TFR storico 1952-2024 | SDMX `DCIS_FECONDITA1` | Annuale |
| D2 | ISTAT | Nascite mensili 2000-2025 | SDMX `DCIS_INDDEMOG` | Mensile |
| D3 | ISTAT | TFR per cittadinanza italiana/straniera | SDMX `DCIS_FECONDITA1` filtered | Annuale |
| D4 | ISTAT | Età media madre al parto | SDMX | Annuale |
| D5 | ISTAT archivio | Proiezioni release 2007 (base 2005) | PDF + tabelle storiche | One-shot historical |
| D6 | ISTAT archivio | Proiezioni release 2011 (base 2010) | XLS | One-shot |
| D7 | ISTAT archivio | Proiezioni release 2017 (base 2016) | XLS + SDMX | One-shot |
| D8 | ISTAT archivio | Proiezioni release 2021 (base 2020) | SDMX + report PDF | One-shot |
| D9 | ISTAT | Proiezioni release 2024 (base 2023) | SDMX `DCIS_POPRES1` | Latest |
| D10 | Eurostat | EUROPOP proiezioni EU armonizzate | REST API JSON | Triennale |
| D11 | UN | World Population Prospects 2024 | CSV download | Biennale |
| D12 | Max Planck HFD | Human Fertility Database Italia | TXT download | Annuale |
| D13 | ISTAT | Conti satellite pensioni | SDMX | Annuale |
| D14 | Banca d'Italia | Proiezioni macro lungo periodo | PDF + tabelle | Periodic |

### 6.2 Struttura pipeline

```
pipeline/
├── pyproject.toml          # uv-managed, locked
├── uv.lock
├── README.md
├── sources/
│   ├── __init__.py
│   ├── istat_sdmx.py       # Generic ISTAT SDMX downloader
│   ├── istat_tfr.py        # TFR historical (D1, D3)
│   ├── istat_births.py     # Births monthly (D2)
│   ├── istat_age.py        # Mother age (D4)
│   ├── istat_projections_2024.py  # D9 (latest, full SDMX)
│   ├── istat_projections_archive.py  # D5-D8 (PDF/XLS parsers)
│   ├── eurostat.py         # D10
│   ├── un_wpp.py           # D11
│   ├── hfd.py              # D12
│   ├── istat_pensions.py   # D13
│   └── bankitalia.py       # D14
├── transforms/
│   ├── __init__.py
│   ├── tfr_decomposition.py    # italiane/straniere bridge
│   ├── projection_errors.py    # backtesting per release: MAE, RMSE, signed bias
│   ├── scenario_models.py      # nostro "no-recovery" scenario
│   └── cascade_economic.py     # TFR → forza lavoro → dipendenza → pensioni
├── validators/
│   ├── __init__.py
│   ├── test_tfr_ranges.py
│   ├── test_population_consistency.py
│   ├── test_projection_completeness.py
│   └── test_output_determinism.py
├── outputs/                # Produced JSON, mirrored to data/processed/
│   └── (gitignored, built by build.py)
└── build.py                # Orchestrator: download → transform → validate → emit
```

### 6.3 Frozen snapshots layout

```
data/
├── raw/
│   ├── istat/
│   │   ├── 2026-05-16/
│   │   │   ├── DCIS_FECONDITA1.xml
│   │   │   ├── DCIS_INDDEMOG.xml
│   │   │   ├── DCIS_POPRES1_projections_2024.xml
│   │   │   └── _manifest.json   # source URLs + sha256 hashes
│   │   └── archive/
│   │       ├── proiezione_2007/
│   │       │   ├── source.pdf
│   │       │   └── extracted_tables.csv  # manual extraction documented
│   │       ├── proiezione_2011/
│   │       ├── proiezione_2017/
│   │       └── proiezione_2021/
│   ├── eurostat/2026-05-16/
│   ├── un_wpp/2024/
│   ├── hfd/2026-05-16/
│   └── bankitalia/...
└── processed/
    ├── tfr_historical.json
    ├── tfr_decomposition.json
    ├── projections_archive.json
    ├── projection_errors.json
    ├── scenarios_comparison.json
    ├── cascade_economic.json
    ├── eurostat_comparison.json
    └── _metadata.json   # audit trail aggregato
```

### 6.4 CI sui dati

**GitHub Action `.github/workflows/data-validate.yml`** — trigger on push to `pipeline/` o `data/` + weekly cron (lunedì 03:00 UTC):
1. `cd pipeline && uv sync`
2. `cd pipeline && uv run python build.py --validate-only` (no download, valida snapshot esistenti)
3. `cd pipeline && uv run pytest validators/`
4. Compare hash di `data/processed/*.json` con committed: fail su drift
5. Status check obbligatorio per merge

**GitHub Action `.github/workflows/data-refresh.yml`** — monthly cron (1° del mese):
1. Re-download ISTAT/Eurostat/UN
2. Run pipeline completa
3. Diff vs committed
4. Se diff → apre PR automatica con label `data-update`

### 6.5 Comando di build locale

```bash
# Setup (una tantum)
cd pipeline && uv sync

# Build completa (download + transform + validate + emit) — da dentro pipeline/
uv run python build.py

# Solo validation su snapshot esistenti (per CI)
uv run python build.py --validate-only

# Solo trasformazioni (skip download)
uv run python build.py --no-download
```

---

## 7. Stack tecnico & struttura repo

### 7.1 Layout repo

```
nati-istat/
├── README.md                       # Project description + reproduce + sources
├── LICENSE                         # Code MIT, content CC-BY-SA 4.0
├── LICENSE-DATA                    # Note licenza dati ISTAT (CC-BY 3.0 IT)
├── .gitignore
├── .gitattributes                  # LFS per archive PDF/XLS se grandi
├── .editorconfig
├── docs/
│   ├── superpowers/
│   │   ├── specs/
│   │   │   └── 2026-05-16-nati-istat-design.md
│   │   └── plans/
│   │       └── (generated by writing-plans)
│   ├── methodology.md              # Full methodology source-of-truth
│   ├── sources.md                  # Data sources catalog
│   └── decisions/
│       ├── 001-stack-choice.md
│       ├── 002-charts-library.md
│       └── 003-data-pipeline.md
├── pipeline/                       # Python data pipeline (sezione 6)
├── data/
│   ├── raw/                        # Frozen snapshots
│   └── processed/                  # Outputs pipeline
├── web/                            # Next.js app
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, theme provider
│   │   ├── page.tsx                # Home long-read (compose chapters)
│   │   ├── metodologia/page.tsx
│   │   ├── dati/page.tsx
│   │   ├── globals.css
│   │   └── opengraph-image.tsx     # OG default
│   ├── components/
│   │   ├── chapters/
│   │   │   ├── Chapter0Opening.tsx
│   │   │   ├── Chapter1Starting.tsx
│   │   │   ├── Chapter2Decomposition.tsx
│   │   │   ├── Chapter3TrackRecord.tsx
│   │   │   ├── Chapter4Assumptions.tsx
│   │   │   ├── Chapter5Cascade.tsx
│   │   │   └── Chapter6Scenarios.tsx
│   │   ├── charts/
│   │   │   ├── PlotChart.tsx       # Observable Plot wrapper
│   │   │   ├── TFRHistoricalChart.tsx
│   │   │   ├── DecompositionChart.tsx
│   │   │   ├── BridgeChart.tsx
│   │   │   ├── ProjectionsTrackRecordChart.tsx  # KILLER, D3 custom
│   │   │   ├── AssumptionsChart.tsx
│   │   │   ├── CascadeChart.tsx                  # D3 custom
│   │   │   ├── PensionsForecastChart.tsx
│   │   │   └── ScenarioComparatorChart.tsx       # D3 + React state
│   │   ├── ui/                     # shadcn primitives (button, dialog, etc.)
│   │   ├── layout/
│   │   │   ├── TopNav.tsx
│   │   │   ├── ReadingProgress.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ShareButton.tsx
│   │   └── annotations/
│   │       ├── ChartAnnotation.tsx
│   │       ├── DataPointInfo.tsx   # ⓘ tooltip
│   │       └── SourceCaption.tsx
│   ├── lib/
│   │   ├── data.ts                 # Typed JSON loaders
│   │   ├── theme.ts                # Color tokens, type scale, spacing
│   │   ├── analytics.ts            # Plausible wrapper
│   │   └── utils.ts                # cn(), formatters IT
│   ├── content/
│   │   ├── chapters.ts             # Title, opening, prose per capitolo (typed)
│   │   └── methodology.mdx         # Long-form methodology page
│   └── public/
│       ├── fonts/                  # Source Serif 4, IBM Plex Sans/Mono subset
│       ├── og/                     # Pre-generated OG cards
│       └── favicon.ico
├── .github/
│   ├── workflows/
│   │   ├── data-validate.yml
│   │   ├── data-refresh.yml
│   │   ├── web-lint-typecheck.yml
│   │   └── deploy-preview.yml
│   └── PULL_REQUEST_TEMPLATE.md
└── vercel.ts                       # Vercel project config (typed)
```

### 7.2 Decisioni tecniche locked

**Frontend:**
- Next.js 15 App Router + TypeScript strict + RSC + static export dove possibile
- Tailwind CSS v4 + shadcn/ui (solo componenti necessari)
- Observable Plot per grafici editoriali standard (C0, C1, C2a, C2b, C4a, C4b, C5b, M1)
- D3 raw per chart custom (C3 killer chart, C5a cascade, C6 comparator)
- Niente Recharts (decisione invertita: Plot copre tutto + meno stack splitting)

**Tipografia:**
- Source Serif 4 (headline narrative)
- IBM Plex Sans (body, UI)
- IBM Plex Mono (numeri, codice)
- Self-hosted, subset glyph IT + numeri + simboli necessari

**Theming:**
- Light mode primario
- Dark mode opzionale (toggle in nav)
- Palette: neutri + 3 accent (rosso storico, grigio-blu proiezioni, turchese scenari)

**State management:**
- Nessuno globale
- Local UI state per chart interattivi (hover, tooltip, scenario toggle in C6)
- URL anchor per deep-link a capitolo specifico

**Animations:**
- Minime e motivate (rivelare layer su scroll-in-view)
- Niente decorative
- `motion` library solo se serve; reduced-motion rispettato

**Analytics:**
- Plausible (self-hosted o cloud — verifica costo)
- No cookie banner necessario, privacy-first
- Eventi tracked: scroll depth per capitolo, share click, CSV download click

**Pipeline Python:**
- Python 3.13
- `uv` per env management
- `pandas`, `pandasdmx` (ISTAT SDMX), `requests`, `pydantic` (validation schemas), `pytest`

### 7.3 i18n

`next-intl` scaffolded ma una sola lingua attiva (IT). Tutti i testi in `content/chapters.ts` strutturati con chiavi per facilitare future EN translation senza refactor.

---

## 8. Charts roster

| ID | Cap | Tipo | Tech | Source data |
|---|---|---|---|---|
| C0 | Apertura | Line chart fedele Kalistat + zoom annotato | Plot | D1, D9 |
| C1 | 1 | Line 1952-2024 con event annotations | Plot | D1 |
| C2a | 2 | Multi-line italiane/straniere 2003-24 | Plot | D3 |
| C2b | 2 | Bridge chart contribution al picco 2008 | Plot | D3 |
| **C3** | **3** | **5 release proiezioni + reale, hover annotation** | **D3 custom** | D1, D5-D9 |
| C4a | 4 | ISTAT vs UN WPP low/med/high con bande | Plot | D9, D11 |
| C4b | 4 | Small multiples decostruzione ipotesi | Plot | D9 + D3 + D4 |
| C5a | 5 | Cascade chart TFR → derivati | D3 custom | D1 + D9 + D13 |
| C5b | 5 | Forecast cone spesa pensioni/PIL | Plot | D13 + D14 |
| C6 | 6 | Scenario comparator interattivo | D3 + React | D9, D11, scenario model |
| M1 | Metodo | Source map table | Plot table | metadata.json |

**Requisiti comuni a tutti i chart:**
- Responsive (mobile-first, edge-to-edge)
- Alt text descrittivo
- Caption con fonte + ID datapoint (link a metodologia)
- Download CSV del dato sottostante
- Tooltip ⓘ con metadata audit trail (sezione 4.6)
- Fallback statico PNG per no-JS

---

## 9. Performance, SEO, deploy, error handling

### 9.1 Performance budget

- Lighthouse mobile target: Performance 95+, Accessibility 95+, Best Practices 95+, SEO 95+
- JSON dati totali serviti: <500 KB compressed (pipeline emette gzipped)
- Code-split per capitolo: chart components lazy-loaded quando entrano in viewport
- No client-side data fetching
- Font subset: solo glyph italiani + numeri + simboli necessari
- LCP <2.5s su 3G simulato
- CLS <0.05

### 9.2 SEO + social

- OG cards via `@vercel/og` (statiche pre-build, una per capitolo)
- Title + meta description per capitolo (anchor URL deep-linkable e indicizzati)
- JSON-LD `Article` per home, `Dataset` per `/dati`, `Article` con `citation` per `/metodologia`
- Sitemap auto-generato
- robots.txt permissive (contenuto è il punto)
- canonical URL impostato

### 9.3 Deploy

- Repo: GitHub pubblico `fdicredico/nati-istat`
- Hosting: Vercel collegato a GitHub
- Branch strategy: `main` (prod), feature branches → PR → preview Vercel → merge
- Dominio: tentativo `nati-istat.it`, fallback `nati-istat.vercel.app`
- CI obbligatori per merge: data-validate, web-lint-typecheck

### 9.4 Error handling

- Pipeline fail → CI fail → deploy bloccato (mai dati corrotti in prod)
- Frontend chart render fail → fallback PNG pre-rendered + link metodologia
- Browser senza JS → contenuto leggibile (RSC), chart sostituiti da PNG + caption descrittiva
- Errori 404 / pagina non trovata → custom 404 con link home

---

## 10. Risks & mitigations

| Rischio | Probabilità | Impatto | Mitigation |
|---|---|---|---|
| ISTAT proiezioni archive (2007-2011) non più online | Media | Alto | Snapshot frozen in `data/raw/istat/archive/`. Documentare con manifest provenance dove possibile (Wayback Machine, citazioni paper) |
| Estrazione PDF proiezioni 2007 imprecisa | Media | Medio | Estrazione manuale documentata, validation cross-check con report originale, peer-review da terzi prima di pubblicare |
| Discrepanze ISTAT vs Eurostat su stessi indicatori | Alta | Basso | Già previsto in cap 4 + pagina metodologia: discrepanze documentate apertamente |
| Critica metodologica "non state confrontando come si deve" | Media | Alto | Cap 4 spiega correttamente cosa fa ISTAT prima di criticare. Backtesting con metriche standard (MAE, RMSE, signed bias). Repo aperto, chiunque può fare PR |
| Vercel free tier limiti bandwidth se diventa virale | Bassa | Basso | Sito statico minimo, cache aggressive. Eventuale upgrade Pro se serve |
| `nati-istat.it` non disponibile | Media | Basso | Fallback `vercel.app` subdomain, decisione su acquisto dominio post-launch in base a traction |
| Cambiamenti API ISTAT durante sviluppo | Media | Medio | Frozen snapshots significa che pipeline funziona anche se API cambia. Refresh script aggiorna snapshot |
| Bias di selezione (scegliamo solo release che fanno bella figura nostra tesi) | Bassa ma critica | Critico | Mostriamo TUTTE le release accessibili (2007/2011/2017/2021/2024), non solo quelle che confermano. Trasparenza totale |

---

## 11. Success criteria

Il progetto è "complete" quando:

1. ✅ Sito online su Vercel, raggiungibile
2. ✅ Repo GitHub pubblico, contenuto completo (codice + dati + snapshot)
3. ✅ Tutti i 7 capitoli + metodologia + dati renderizzati correttamente
4. ✅ Pipeline Python ri-eseguibile da clean clone in <5 min: `cd pipeline && uv sync && uv run python build.py`
5. ✅ Almeno 11 chart implementati (roster sezione 8)
6. ✅ Lighthouse mobile 90+ tutte le metriche (95+ target)
7. ✅ Almeno 5 fonti primarie integrate (D1, D2, D9, D11, D12 minimo)
8. ✅ Validation tests passano in CI
9. ✅ Metodologia page completa con audit trail visibile
10. ✅ Una persona terza che clona il repo può rigenerare i dati e il sito

### Definizione di "MVP shippable"
Se per vincoli di tempo non riusciamo a integrare tutte le 14 fonti, il sito è shippable con:
- D1, D2, D9 (TFR storico + nascite + proiezioni 2024) — MUST
- D3 (decomposizione cittadinanza) — MUST per cap 2
- D5-D8 (proiezioni archive) — almeno 2 release oltre la 2024 per cap 3
- D11 (UN WPP) — MUST per cap 4 e cap 6
- D13 (pensioni) — nice-to-have per cap 5, può essere semplificato
- D4, D10, D12, D14 — nice-to-have

Capitoli 5 (cascade) può essere ridotto in scope se D13/D14 sono problematici (resta cap 5 ma con grafici più semplici).

---

## 12. Open questions (da risolvere in plan o execution)

- **Dominio:** verificare disponibilità `nati-istat.it`. Decisione di acquisto: post-launch in base a traction.
- **Analytics:** Plausible self-hosted vs cloud (~$9/mese). Decidere durante deploy.
- **PDF parsing proiezioni 2007/2011:** valutare se esiste alternativa SDMX nascosta o se serve estrazione manuale. Tempo budget: max 4h, altrimenti escludere release più vecchie e iniziare track-record da 2017.
- **Author credit:** "Francesco Di Credico" diretto, o pseudonym/handle separato? Default: diretto + link a LinkedIn nel footer.
- **Newsletter signup?** Out of scope per ora, valutare post-launch.

---

## 13. Riferimenti

### Standard e linee guida applicate
- WCAG 2.1 AA accessibility
- Schema.org JSON-LD (Article, Dataset, Citation)
- Vercel deployment best practices
- Italian writing style guidelines (CLAUDE.md FDC standards)

### Fonti esterne di metodologia
- ISTAT "Previsioni della popolazione residente e delle famiglie", report metodologici 2017, 2021, 2024
- Eurostat "Population projections methodology" (EUROPOP)
- UN DESA "World Population Prospects: Methodology"
- Vienna Institute of Demography / Human Fertility Database documentation

### Inspirazione editoriale e visiva
- Our World in Data (dashboard rigor + clarity)
- Pudding (essay scrolly storytelling — solo riferimento per pattern, non per estetica)
- Financial Times Visual Journalism (chart annotations, editorial tone)
- FiveThirtyEight (track record analysis pattern)
