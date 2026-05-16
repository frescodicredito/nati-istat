# Pipeline

Pipeline dati per nati-istat. Scarica, processa, valida fonti demografiche da ISTAT, Eurostat, UN WPP.

## Setup

```bash
uv sync
```

Richiede `uv` (https://docs.astral.sh/uv/). Installa Python 3.12 automaticamente se non disponibile.

## Comandi

```bash
# Build completa (download + transform + validate + emit)
uv run python build.py

# Solo validation su snapshot esistenti (per CI, no network)
uv run python build.py --validate-only

# Solo trasformazioni (skip download, usa snapshot frozen)
uv run python build.py --no-download

# Test
uv run pytest
uv run pytest tests/         # solo unit
uv run pytest validators/    # solo validators (richiede JSON processed esistenti)

# Lint + format
uv run ruff check
uv run ruff format
```

## Struttura

- `sources/` — Downloader per ogni fonte (un modulo per fonte) + schema + helper snapshot
- `transforms/` — Trasformazioni pure su DataFrame (testabili in isolamento)
- `validators/` — Test pytest sui datapoint chiave (CI-enforced)
- `tests/` — Unit test su sources e transforms
- `build.py` — Orchestrator end-to-end

## Audit trail

Ogni JSON in `../data/processed/` è wrappato in:

```json
{
  "audit": {
    "source": "ISTAT DCIS_FECONDITA1",
    "source_url": "http://sdmx.istat.it/...",
    "downloaded_at": "2026-05-16T...",
    "pipeline_version": "<git-sha>",
    "transforms_applied": ["normalize_tfr_dataframe"],
    "validation_passed": true,
    "datapoint_count": 73
  },
  "data": [...]
}
```
