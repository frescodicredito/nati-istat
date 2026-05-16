# 003 · Data pipeline: Python uv + frozen snapshots + CI validation

**Status:** Accepted · 2026-05-16

## Context

Pipeline deve garantire **riproducibilità verificabile da terzi**, gestire 14 fonti dati eterogenee (SDMX, REST JSON, CSV, PDF, XLS), produrre JSON consumabili dal frontend.

Il progetto smonta proiezioni ISTAT — se i nostri dati o le trasformazioni sono criticabili, l'intero argomento crolla. Standard scientifico, non blog-post standard.

## Decision

- **Python 3.13** + `uv` per env management (lockfile deterministico, install ~10x più veloce di pip)
- `pandasdmx` per ISTAT SDMX, `requests` per REST, `pandas` per processing, `pdfplumber` per PDF archive
- **Frozen snapshots** in `data/raw/YYYY-MM-DD/` committed nel repo
- **Validators** come pytest suite, CI obbligatorio
- **Build orchestrator** `pipeline/build.py` con flag `--validate-only`, `--no-download`

## Rationale (sei vincoli operativi, vedi spec sezione 4)

1. **Provenance** — fonti primarie documentate
2. **Riproducibilità deterministica** — stesso input → stesso output bit-per-bit
3. **Frozen snapshots** — verificabile anche se API upstream cambia
4. **Cross-validation** tra fonti dove disponibili
5. **Validation tests** CI-enforced
6. **Audit trail** in metadata di ogni JSON

## Consequences

- Repo size cresce ~10-50MB per snapshot (LFS per file grandi via .gitattributes)
- Refresh dati richiede esecuzione locale o GitHub Action mensile
- Chiunque può rigenerare i JSON e verificare con `git clone && cd pipeline && uv sync && uv run python build.py --validate-only`
- Pipeline e frontend disaccoppiati: il frontend non sa nulla del processing, vede solo JSON con shape tipizzata
