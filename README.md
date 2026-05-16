# nati-istat

Long-read editoriale e dashboard analitica sulle proiezioni demografiche ISTAT del tasso di fecondità italiano confrontate con i dati osservati.

**🌐 Sito live: https://nati-istat.vercel.app**

## Cosa fa

Documenta con rigore metodologico la traiettoria della proiezione ISTAT 2024 del tasso di fecondità totale italiano e mostra:
- il dato osservato 1999-2024 (TFR 2024 = 1,18, minimo storico)
- la decomposizione per cittadinanza italiana vs straniera
- la proiezione mediana 2024 con bande di confidenza al 50% e 90%
- il confronto tra scenario mediano, lower 90% e un modello no-recovery alternativo

Pipeline Python interamente riproducibile, frontend Next.js statico su Vercel, dati e snapshot raw committati nel repo.

## Struttura

```
nati-istat/
├── docs/
│   ├── superpowers/
│   │   ├── specs/2026-05-16-nati-istat-design.md
│   │   └── plans/2026-05-16-nati-istat-implementation.md
│   └── decisions/                # ADR
├── pipeline/                     # Python uv pipeline
│   ├── sources/                  # ISTAT SDMX downloader + transforms per fonte
│   ├── transforms/               # Trasformazioni pure (scenari, aggregator)
│   ├── validators/               # pytest CI-enforced
│   ├── tests/                    # unit test
│   └── build.py                  # orchestrator
├── data/
│   ├── raw/istat/YYYY-MM-DD/     # snapshot frozen (CSV gzipped + manifest)
│   └── processed/                # JSON output consumati dal frontend
├── web/                          # Next.js 16 App Router
│   ├── app/                      # routes
│   ├── components/               # chapters, charts, layout, annotations
│   ├── content/chapters.ts       # contenuto editoriale centralizzato
│   └── lib/                      # data loader, fonts, theme, types
└── .github/workflows/            # CI data-validate + web-check
```

## Riproducibilità

Requisiti: [uv](https://docs.astral.sh/uv/), Node.js 20+, pnpm.

```bash
git clone https://github.com/frescodicredito/nati-istat
cd nati-istat

# Rigenera JSON da snapshot frozen
cd pipeline && uv sync && uv run python build.py --validate-only

# Build sito locale (predev copia data/processed/ in web/public/data/)
cd ../web && pnpm install && pnpm dev
# → apri http://localhost:3000
```

Per il refresh completo dei dati (richiede network ISTAT):

```bash
cd pipeline && uv run python build.py
```

## Fonti dati integrate

| ID | Fonte | Cosa | Anni |
|---|---|---|---|
| D1 | ISTAT `25_326_DF_DCIS_FECONDITA1_5` | TFR Italia totale | 1999-2024 |
| D3 | ISTAT (stesso snapshot di D1) | TFR per cittadinanza italiane/straniere | 1999-2024 |
| D9 | ISTAT `165_889_DF_DCIS_PREVDEM1_3` | Proiezioni demografiche 2024 (7 scenari) | 2024-2080 |

### Fonti pianificate (iterazioni successive)

- **D2** — Nascite mensili ISTAT (utile per grafico mensile)
- **D5-D8** — Release archive proiezioni storiche (2007, 2011, 2017, 2021) per il "killer chart" multi-release
- **D10** — Eurostat EUROPOP per benchmark europeo
- **D11** — UN World Population Prospects per scenari alternativi
- **D12** — Human Fertility Database per cohort completed fertility

## Pilastri metodologici

1. **Provenance** — ogni datapoint linka alla fonte primaria
2. **Riproducibilità deterministica** — `uv sync` lockato
3. **Frozen snapshots** — raw CSV + manifest committati
4. **Cross-validation** — pianificata (manca D10/D11)
5. **Validation tests** — `pytest` validators CI-enforced
6. **Audit trail** — metadata in ogni JSON e tooltip sui chart

## Lighthouse (live site)

| Metrica | Score |
|---|---|
| Performance | 93 |
| Accessibility | 91 |
| Best Practices | 100 |
| SEO | 100 |

## Licenze

- **Codice**: MIT (`LICENSE`)
- **Contenuti editoriali**: CC BY-SA 4.0
- **Dati ISTAT**: CC BY 3.0 IT (`LICENSE-DATA`)

## Autore

Francesco Di Credico — [LinkedIn](https://www.linkedin.com/in/francescodicredico)

Generato con assistenza di Claude (Anthropic) seguendo il flow brainstorming → spec → plan → execute documentato in `docs/superpowers/`.
