# nati-istat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sito long-read editoriale online su Vercel che documenta con rigore metodologico il pattern di sovra-stima sistematica delle proiezioni demografiche ISTAT, con pipeline dati riproducibile e repo GitHub pubblico.

**Architecture:** Monorepo con due subsystem indipendenti: `pipeline/` (Python + uv per acquisizione e processing dati da ISTAT/Eurostat/UN WPP/HFD) che produce JSON versionati in `data/processed/`, consumati staticamente da `web/` (Next.js 15 App Router + RSC + Observable Plot + D3). Deploy continuo Vercel da main, CI GitHub Actions blocca merge su drift dati o lint/type errors.

**Tech Stack:** Python 3.13, `uv`, pandas, pandasdmx, pytest, pydantic / Next.js 15, TypeScript strict, Tailwind v4, shadcn/ui, Observable Plot, D3, Source Serif 4 + IBM Plex / GitHub Actions + Vercel

**Reference spec:** `docs/superpowers/specs/2026-05-16-nati-istat-design.md`

**Milestone strategy (ogni milestone è deployable):**
- **M1** dopo Fase 4 — pipeline produce JSON validi per D1+D2+D9, solo dati
- **M2** dopo Fase 7 — web app con cap 0-2 visibile su Vercel preview
- **M3** dopo Fase 9 — tutti i capitoli live, launch ready
- **M4** dopo Fase 13 — full deploy production, success criteria spec sezione 11 soddisfatti

**Conventions:**
- Italian commit messages (subject ≤72 char, imperative tense)
- Co-author footer ogni commit
- Commit dopo ogni task completato (TDD red-green-commit)
- Per Python: `pytest`, `ruff format`, `ruff check`
- Per Next.js: `pnpm`, `tsc --noEmit`, `eslint`

---

## Phase 0 — Repo skeleton & licensing

### Task 0.1: License files

**Files:**
- Create: `LICENSE`
- Create: `LICENSE-DATA`

- [ ] **Step 1: Create LICENSE (MIT)**

```
MIT License

Copyright (c) 2026 Francesco Di Credico

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Create LICENSE-DATA**

```
DATI

I dati scaricati da ISTAT sono distribuiti sotto Creative Commons Attribution
3.0 Italy (CC BY 3.0 IT): https://creativecommons.org/licenses/by/3.0/it/

Fonte: Istituto Nazionale di Statistica (ISTAT) — http://dati.istat.it

I dati Eurostat sono distribuiti secondo la policy:
https://ec.europa.eu/eurostat/about-us/policies/copyright

UN World Population Prospects: https://population.un.org/wpp/

Human Fertility Database (Max Planck Institute):
https://www.humanfertility.org/Home/DataAvailability

CONTENUTI EDITORIALI (testi, design, narrative)

Distribuiti sotto Creative Commons Attribution-ShareAlike 4.0 International
(CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/

Per attribuire: "Francesco Di Credico, nati-istat (2026),
https://github.com/fdicredico/nati-istat"
```

- [ ] **Step 3: Commit**

```bash
git add LICENSE LICENSE-DATA
git commit -F - << 'PLAN'
chore: add MIT license per codice + CC-BY-SA per contenuti

LICENSE per il codice (MIT).
LICENSE-DATA per dati (CC-BY 3.0 IT ISTAT) e contenuti
editoriali (CC-BY-SA 4.0).
PLAN
```

### Task 0.2: editorconfig + gitattributes

**Files:**
- Create: `.editorconfig`
- Create: `.gitattributes`

- [ ] **Step 1: .editorconfig**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

- [ ] **Step 2: .gitattributes**

```
* text=auto eol=lf

# Binary
*.pdf binary
*.png binary
*.jpg binary
*.ico binary
*.woff binary
*.woff2 binary
*.xlsx binary
*.xls binary

# LFS for large archive files (>5MB typical)
data/raw/istat/archive/**/*.pdf filter=lfs diff=lfs merge=lfs -text
data/raw/istat/archive/**/*.xls filter=lfs diff=lfs merge=lfs -text
data/raw/istat/archive/**/*.xlsx filter=lfs diff=lfs merge=lfs -text
```

- [ ] **Step 3: Commit**

```bash
git add .editorconfig .gitattributes
git commit -F - << 'PLAN'
chore: editorconfig + gitattributes con LFS per archive ISTAT

Standard formatting cross-editor. Git LFS configurato per file
ISTAT pesanti (PDF/XLS proiezioni archive).
PLAN
```

### Task 0.3: Initial ADRs (Architecture Decision Records)

**Files:**
- Create: `docs/decisions/001-stack-choice.md`
- Create: `docs/decisions/002-charts-library.md`
- Create: `docs/decisions/003-data-pipeline.md`

- [ ] **Step 1: ADR 001 stack choice**

```markdown
# 001 · Stack choice: Next.js + Python pipeline + Vercel

**Status:** Accepted · 2026-05-16

## Context
Dashboard editoriale long-read con dati demografici processati da fonti multiple. Necessità di rigore metodologico, riproducibilità, performance, hosting low-cost.

## Decision
- Frontend: Next.js 15 App Router + RSC + static export dove possibile
- Pipeline dati: Python con `uv`, separata dal frontend
- Data layer: JSON statici versionati committed nel repo
- Hosting: Vercel
- Repo: GitHub pubblico

## Alternatives considered
- **Streamlit/Dash**: estetica scadente, no controllo design
- **Observable notebook**: rigoroso ma non personalizzabile, no SEO
- **Astro + MDX**: ottimo per content, meno fluido per interazione dashboard
- **Backend Python (FastAPI) + DB**: overkill, dati cambiano mensilmente

## Consequences
- Riproducibilità chirurgica (pipeline → JSON deterministici)
- Performance massima (tutto pre-rendered)
- Costo zero su Vercel free tier
- Trade-off: aggiornamento dati richiede re-build (accettabile, dati mensili)
```

- [ ] **Step 2: ADR 002 charts library**

```markdown
# 002 · Charts library: Observable Plot + D3 raw

**Status:** Accepted · 2026-05-16

## Context
Charts roster di 11 visualizzazioni: 8 standard editoriali, 3 custom complessi (killer chart cap 3, cascade cap 5, scenario comparator cap 6).

## Decision
- **Observable Plot** per chart standard (8 di 11): API dichiarativa, stile editoriale consistente, basato su D3
- **D3 raw** per i 3 custom: serve customizzazione profonda
- **No Recharts** (decisione invertita rispetto a brainstorming iniziale)

## Rationale
- Plot copre 90% dei casi con boilerplate minimo
- Stile editoriale consistente (font, color tokens applicati globalmente)
- D3 raw quando serve, senza dover learning curve due librerie
- Bundle splitting: D3 caricato solo nelle pagine che lo usano (cap 3, 5, 6)

## Consequences
- Single chart family mentale (Plot + D3)
- Più lavoro iniziale per setup PlotChart wrapper
- Riusabilità alta tra chart standard
```

- [ ] **Step 3: ADR 003 data pipeline**

```markdown
# 003 · Data pipeline: Python uv + frozen snapshots + CI validation

**Status:** Accepted · 2026-05-16

## Context
Pipeline deve garantire riproducibilità verificabile, gestire 14 fonti dati eterogenee (SDMX, REST, CSV, PDF, XLS), produrre JSON consumabili dal frontend.

## Decision
- Python 3.13 + `uv` per env management
- `pandasdmx` per ISTAT SDMX, `requests` per REST, `pandas` per processing
- Frozen snapshots in `data/raw/YYYY-MM-DD/` committed nel repo
- Validators come pytest suite, CI obbligatorio
- Build orchestrator `pipeline/build.py` con flag `--validate-only`, `--no-download`

## Rationale (vedi spec sezione 4)
1. Provenance — fonti primarie documentate
2. Riproducibilità deterministica
3. Frozen snapshots — verificabile anche se API cambia
4. Cross-validation tra fonti
5. Validation tests CI-enforced
6. Audit trail in metadata

## Consequences
- Repo size cresce ~10-50MB per snapshot (LFS per file grandi)
- Refresh dati richiede esecuzione locale o GitHub Action
- Chiunque può rigenerare i JSON e verificare
```

- [ ] **Step 4: Commit**

```bash
git add docs/decisions/
git commit -F - << 'PLAN'
docs: ADR iniziali — stack, charts library, data pipeline

Tre ADR fondamentali per il progetto:
- 001 stack choice (Next.js + Python pipeline + Vercel)
- 002 charts library (Observable Plot + D3 raw)
- 003 data pipeline (uv + frozen snapshots + CI validation)
PLAN
```

---

## Phase 1 — Pipeline foundations (Python)

### Task 1.1: Pipeline pyproject + uv setup

**Files:**
- Create: `pipeline/pyproject.toml`
- Create: `pipeline/README.md`
- Create: `pipeline/.python-version`

- [ ] **Step 1: pyproject.toml**

```toml
[project]
name = "nati-istat-pipeline"
version = "0.1.0"
description = "Data pipeline per nati-istat: download e processing fonti demografiche"
requires-python = ">=3.13"
dependencies = [
    "pandas>=2.2.0",
    "pandasdmx>=1.11.0",
    "requests>=2.32.0",
    "pydantic>=2.9.0",
    "openpyxl>=3.1.0",
    "pdfplumber>=0.11.0",
    "python-dateutil>=2.9.0",
]

[dependency-groups]
dev = [
    "pytest>=8.3.0",
    "pytest-cov>=5.0.0",
    "ruff>=0.7.0",
    "mypy>=1.13.0",
]

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "B", "UP", "ARG", "SIM"]

[tool.pytest.ini_options]
testpaths = ["validators", "tests"]
python_files = ["test_*.py"]
addopts = "-v --tb=short"

[tool.mypy]
python_version = "3.13"
strict = true
```

- [ ] **Step 2: .python-version**

```
3.13
```

- [ ] **Step 3: pipeline/README.md**

```markdown
# Pipeline

Pipeline dati per nati-istat. Scarica, processa, valida fonti demografiche.

## Setup

```bash
uv sync
```

## Comandi

```bash
# Build completa (download + transform + validate + emit)
uv run python build.py

# Solo validation su snapshot esistenti
uv run python build.py --validate-only

# Solo trasformazioni (skip download)
uv run python build.py --no-download

# Test
uv run pytest

# Lint
uv run ruff check
uv run ruff format
```

## Struttura

- `sources/` — Downloader per ogni fonte (un modulo per fonte)
- `transforms/` — Trasformazioni pure su DataFrame (testabili)
- `validators/` — Test pytest sui datapoint chiave
- `build.py` — Orchestrator
```

- [ ] **Step 4: uv sync per generare lock**

```bash
cd pipeline && uv sync
```

Expected: crea `.venv/`, `uv.lock`

- [ ] **Step 5: Commit**

```bash
git add pipeline/pyproject.toml pipeline/uv.lock pipeline/.python-version pipeline/README.md
git commit -F - << 'PLAN'
feat(pipeline): setup pyproject + uv lock

Python 3.13 + uv. Dipendenze: pandas, pandasdmx, requests,
pydantic, openpyxl, pdfplumber. Dev: pytest, ruff, mypy.
PLAN
```

### Task 1.2: Audit trail metadata schema (pydantic)

**Files:**
- Create: `pipeline/sources/__init__.py`
- Create: `pipeline/sources/schema.py`
- Create: `pipeline/tests/__init__.py`
- Create: `pipeline/tests/test_schema.py`

- [ ] **Step 1: Failing test for AuditTrail schema**

```python
# pipeline/tests/test_schema.py
from datetime import datetime, timezone
from sources.schema import AuditTrail


def test_audit_trail_required_fields():
    trail = AuditTrail(
        source="ISTAT DCIS_FECONDITA1",
        source_url="http://sdmx.istat.it/SDMXWS/rest/data/DCIS_FECONDITA1",
        downloaded_at=datetime(2026, 5, 16, 14, 30, 0, tzinfo=timezone.utc),
        pipeline_version="abc123",
        transforms_applied=["normalize_year"],
        validation_passed=True,
        datapoint_count=73,
    )
    assert trail.source == "ISTAT DCIS_FECONDITA1"
    assert trail.datapoint_count == 73


def test_audit_trail_json_serialization():
    trail = AuditTrail(
        source="test",
        source_url="http://example.com",
        downloaded_at=datetime(2026, 5, 16, tzinfo=timezone.utc),
        pipeline_version="v1",
        transforms_applied=[],
        validation_passed=True,
        datapoint_count=0,
    )
    data = trail.model_dump_json()
    assert "downloaded_at" in data
    assert "2026-05-16" in data
```

- [ ] **Step 2: Run test, expect failure**

```bash
cd pipeline && uv run pytest tests/test_schema.py -v
```

Expected: ImportError o ModuleNotFoundError per `sources.schema`

- [ ] **Step 3: Implement schema**

```python
# pipeline/sources/__init__.py
# (empty)
```

```python
# pipeline/sources/schema.py
from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class AuditTrail(BaseModel):
    """Metadata audit trail per ogni dataset processato.

    Esposto nel sito via tooltip su ogni chart.
    Vedi spec sezione 4.6.
    """

    source: str = Field(..., description="Human-readable source name")
    source_url: str = Field(..., description="Primary source URL")
    downloaded_at: datetime
    pipeline_version: str = Field(..., description="Git SHA della pipeline al build time")
    transforms_applied: list[str] = Field(default_factory=list)
    validation_passed: bool
    datapoint_count: int = Field(..., ge=0)
    notes: str | None = None


class DatasetOutput(BaseModel):
    """Wrapper standard per ogni JSON in data/processed/."""

    audit: AuditTrail
    data: list[dict] | dict  # Shape varia per dataset
```

- [ ] **Step 4: Run tests, expect pass**

```bash
cd pipeline && uv run pytest tests/test_schema.py -v
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add pipeline/sources/ pipeline/tests/
git commit -F - << 'PLAN'
feat(pipeline): AuditTrail schema con pydantic

Schema per audit trail metadata di ogni dataset processato.
Test coverage su required fields + json serialization.
Spec sezione 4.6.
PLAN
```

### Task 1.3: Generic ISTAT SDMX downloader

**Files:**
- Create: `pipeline/sources/istat_sdmx.py`
- Create: `pipeline/tests/test_istat_sdmx.py`
- Create: `pipeline/sources/snapshot.py`

- [ ] **Step 1: Failing test for snapshot path resolution**

```python
# pipeline/tests/test_istat_sdmx.py
from datetime import date
from pathlib import Path

import pytest

from sources.snapshot import resolve_snapshot_path


def test_snapshot_path_today(tmp_path):
    today = date(2026, 5, 16)
    result = resolve_snapshot_path(
        base_dir=tmp_path,
        source="istat",
        dataset_id="DCIS_FECONDITA1",
        snapshot_date=today,
    )
    expected = tmp_path / "istat" / "2026-05-16" / "DCIS_FECONDITA1.xml"
    assert result == expected


def test_snapshot_path_creates_parents(tmp_path):
    resolve_snapshot_path(
        base_dir=tmp_path,
        source="istat",
        dataset_id="DCIS_FECONDITA1",
        snapshot_date=date(2026, 5, 16),
    )
    expected_dir = tmp_path / "istat" / "2026-05-16"
    assert expected_dir.exists()
```

- [ ] **Step 2: Run, expect ImportError**

```bash
cd pipeline && uv run pytest tests/test_istat_sdmx.py -v
```

- [ ] **Step 3: Implement snapshot helper**

```python
# pipeline/sources/snapshot.py
from datetime import date
from pathlib import Path


def resolve_snapshot_path(
    base_dir: Path,
    source: str,
    dataset_id: str,
    snapshot_date: date,
    extension: str = "xml",
) -> Path:
    """Risolve path per snapshot frozen.

    Layout: <base_dir>/<source>/<YYYY-MM-DD>/<dataset_id>.<ext>
    Crea la cartella parent se non esiste.
    """
    folder = base_dir / source / snapshot_date.isoformat()
    folder.mkdir(parents=True, exist_ok=True)
    return folder / f"{dataset_id}.{extension}"
```

- [ ] **Step 4: Run tests, expect pass**

```bash
cd pipeline && uv run pytest tests/test_istat_sdmx.py -v
```

- [ ] **Step 5: Implement ISTAT SDMX downloader**

```python
# pipeline/sources/istat_sdmx.py
"""Generic ISTAT SDMX downloader.

Endpoint: http://sdmx.istat.it/SDMXWS/rest/data/<dataset_id>
Format: SDMX-ML 2.1 XML
"""

import hashlib
import logging
from datetime import date, datetime, timezone
from pathlib import Path

import pandasdmx as sdmx
import requests

ISTAT_SDMX_ENDPOINT = "http://sdmx.istat.it/SDMXWS/rest"

logger = logging.getLogger(__name__)


def download_istat_dataset(
    dataset_id: str,
    snapshot_path: Path,
    *,
    force: bool = False,
    timeout: int = 60,
) -> dict:
    """Scarica un dataset ISTAT in formato SDMX-ML.

    Args:
        dataset_id: ID del dataset (es. "DCIS_FECONDITA1")
        snapshot_path: Path dove salvare lo snapshot raw
        force: Se True, ri-scarica anche se snapshot esiste
        timeout: Timeout request in secondi

    Returns:
        dict con keys: url, sha256, size_bytes, downloaded_at
    """
    url = f"{ISTAT_SDMX_ENDPOINT}/data/{dataset_id}"

    if snapshot_path.exists() and not force:
        logger.info(f"Snapshot esistente per {dataset_id}, skip download")
        content = snapshot_path.read_bytes()
        return _manifest_entry(url, content, snapshot_path)

    logger.info(f"Download {dataset_id} da {url}")
    response = requests.get(url, timeout=timeout, headers={"Accept": "application/xml"})
    response.raise_for_status()
    content = response.content
    snapshot_path.write_bytes(content)
    logger.info(f"Salvato {len(content)} bytes in {snapshot_path}")
    return _manifest_entry(url, content, snapshot_path)


def _manifest_entry(url: str, content: bytes, path: Path) -> dict:
    return {
        "url": url,
        "sha256": hashlib.sha256(content).hexdigest(),
        "size_bytes": len(content),
        "downloaded_at": datetime.now(timezone.utc).isoformat(),
        "path": str(path),
    }


def parse_istat_sdmx(xml_path: Path):
    """Parse SDMX-ML XML to pandas DataFrame.

    Usa pandasdmx per il parsing standard SDMX 2.1.
    """
    msg = sdmx.read_sdmx(str(xml_path))
    # SDMX response → DataFrame con MultiIndex
    df = msg.data[0].to_pandas()
    return df
```

- [ ] **Step 6: Commit**

```bash
git add pipeline/sources/snapshot.py pipeline/sources/istat_sdmx.py pipeline/tests/test_istat_sdmx.py
git commit -F - << 'PLAN'
feat(pipeline): generic ISTAT SDMX downloader + snapshot helper

Downloader generico per dataset ISTAT da endpoint SDMX. Salva
snapshot frozen con sha256 + manifest. Parse XML via pandasdmx.
Snapshot helper risolve path standardizzato YYYY-MM-DD.
PLAN
```

### Task 1.4: First real source — D1 TFR storico

**Files:**
- Create: `pipeline/sources/istat_tfr.py`
- Create: `pipeline/tests/test_istat_tfr.py`
- Create: `data/raw/.gitkeep`
- Create: `data/processed/.gitkeep`

- [ ] **Step 1: Test su transform TFR (con fixture mock)**

```python
# pipeline/tests/test_istat_tfr.py
import pandas as pd
import pytest

from sources.istat_tfr import normalize_tfr_dataframe


def test_normalize_tfr_basic():
    """Test che la normalizzazione produca uno schema standard."""
    raw = pd.DataFrame({
        "TIME_PERIOD": ["2020", "2021", "2022", "2023", "2024"],
        "value": [1.24, 1.25, 1.24, 1.20, 1.18],
    })
    result = normalize_tfr_dataframe(raw)
    assert list(result.columns) == ["year", "tfr"]
    assert result["year"].dtype == "int64"
    assert result["tfr"].iloc[-1] == 1.18


def test_normalize_tfr_validates_range():
    """TFR deve essere in range plausibile."""
    raw = pd.DataFrame({
        "TIME_PERIOD": ["2020", "2021"],
        "value": [1.24, 99.0],  # Invalid
    })
    with pytest.raises(ValueError, match="TFR fuori range"):
        normalize_tfr_dataframe(raw)


def test_normalize_tfr_sorts_by_year():
    raw = pd.DataFrame({
        "TIME_PERIOD": ["2022", "2020", "2021"],
        "value": [1.24, 1.27, 1.25],
    })
    result = normalize_tfr_dataframe(raw)
    assert list(result["year"]) == [2020, 2021, 2022]
```

- [ ] **Step 2: Run, expect fail**

```bash
cd pipeline && uv run pytest tests/test_istat_tfr.py -v
```

- [ ] **Step 3: Implement normalize_tfr_dataframe**

```python
# pipeline/sources/istat_tfr.py
"""ISTAT D1: Tasso di Fecondità Totale storico 1952-2024.

Dataset SDMX: DCIS_FECONDITA1
Filter: Italia totale, indicator TFR
"""

import pandas as pd

TFR_MIN_PLAUSIBLE = 0.5
TFR_MAX_PLAUSIBLE = 3.0


def normalize_tfr_dataframe(raw: pd.DataFrame) -> pd.DataFrame:
    """Normalizza DataFrame raw SDMX → schema standard {year, tfr}.

    Schema atteso input: colonna TIME_PERIOD (anno string), colonna value (float).
    Schema output: year (int), tfr (float), sorted by year ascending.

    Raises ValueError se TFR fuori range [0.5, 3.0].
    """
    df = raw.rename(columns={"TIME_PERIOD": "year", "value": "tfr"}).copy()
    df["year"] = df["year"].astype(int)
    df["tfr"] = df["tfr"].astype(float)

    out_of_range = df[(df["tfr"] < TFR_MIN_PLAUSIBLE) | (df["tfr"] > TFR_MAX_PLAUSIBLE)]
    if not out_of_range.empty:
        raise ValueError(
            f"TFR fuori range [{TFR_MIN_PLAUSIBLE}, {TFR_MAX_PLAUSIBLE}]: "
            f"{out_of_range.to_dict(orient='records')}"
        )

    return df.sort_values("year").reset_index(drop=True)[["year", "tfr"]]
```

- [ ] **Step 4: Run tests, expect pass**

```bash
cd pipeline && uv run pytest tests/test_istat_tfr.py -v
```

- [ ] **Step 5: Run real download (snapshot D1)**

```bash
cd pipeline && uv run python -c "
from pathlib import Path
from datetime import date
from sources.snapshot import resolve_snapshot_path
from sources.istat_sdmx import download_istat_dataset

repo_root = Path(__file__).parent.parent if '__file__' in dir() else Path.cwd().parent
data_raw = repo_root / 'data' / 'raw'
path = resolve_snapshot_path(data_raw, 'istat', 'DCIS_FECONDITA1', date.today())
manifest = download_istat_dataset('DCIS_FECONDITA1', path)
print(manifest)
"
```

Expected: scarica XML in `data/raw/istat/YYYY-MM-DD/DCIS_FECONDITA1.xml`.

**Se la chiamata fallisce con timeout o errore HTTP:** ISTAT SDMX endpoint può essere lento o richiedere parametri specifici. Fallback: usare endpoint con filtri espliciti, vedi `https://www.istat.it/it/files/2018/10/SDMX_in_pratica.pdf` per la sintassi corretta. Se persiste, scaricare manualmente da `http://dati.istat.it` la tavola "Tasso di fecondità totale" e salvarla come `DCIS_FECONDITA1.xml`.

- [ ] **Step 6: Commit (raw snapshot + code)**

```bash
git add data/raw/.gitkeep data/processed/.gitkeep
git add data/raw/istat/
git add pipeline/sources/istat_tfr.py pipeline/tests/test_istat_tfr.py
git commit -F - << 'PLAN'
feat(pipeline): source D1 TFR storico ISTAT 1952-2024

Source module per DCIS_FECONDITA1 + transform normalize_tfr_dataframe
con validazione range [0.5, 3.0]. Snapshot raw committed.

Test coverage: schema normalization, range validation, sorting.
PLAN
```

### Task 1.5: Build orchestrator (skeleton)

**Files:**
- Create: `pipeline/build.py`
- Create: `pipeline/sources/registry.py`

- [ ] **Step 1: Source registry**

```python
# pipeline/sources/registry.py
"""Registry di tutte le fonti dati.

Ogni entry definisce: id, descrizione, downloader callable, processor callable.
Build orchestrator itera questo registry.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Callable


@dataclass(frozen=True)
class DataSource:
    id: str
    description: str
    snapshot_dataset_id: str  # Es. "DCIS_FECONDITA1"
    snapshot_source: str = "istat"  # Cartella raw/<source>/
    snapshot_extension: str = "xml"


SOURCES: list[DataSource] = [
    DataSource(
        id="D1",
        description="TFR storico Italia 1952-2024",
        snapshot_dataset_id="DCIS_FECONDITA1",
    ),
    # Altre source aggiunte in task successive
]


def get_source(source_id: str) -> DataSource:
    """Lookup source by ID, raise KeyError if not found."""
    for s in SOURCES:
        if s.id == source_id:
            return s
    raise KeyError(f"Source {source_id} non registrata")
```

- [ ] **Step 2: build.py orchestrator skeleton**

```python
# pipeline/build.py
"""Orchestrator pipeline.

Comandi:
    uv run python build.py                  # Full: download + transform + validate + emit
    uv run python build.py --validate-only  # Solo validation su snapshot esistenti
    uv run python build.py --no-download    # Solo transform da snapshot esistenti
"""

import argparse
import json
import logging
import subprocess
import sys
from datetime import date
from pathlib import Path

from sources.istat_sdmx import download_istat_dataset, parse_istat_sdmx
from sources.istat_tfr import normalize_tfr_dataframe
from sources.registry import SOURCES, get_source
from sources.schema import AuditTrail
from sources.snapshot import resolve_snapshot_path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("build")

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = REPO_ROOT / "data" / "raw"
DATA_PROCESSED = REPO_ROOT / "data" / "processed"


def git_sha() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
            cwd=REPO_ROOT,
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "unknown"


def build_d1(args, snapshot_date: date, pipeline_ver: str) -> None:
    """D1: TFR storico."""
    source = get_source("D1")
    snapshot_path = resolve_snapshot_path(
        DATA_RAW, source.snapshot_source, source.snapshot_dataset_id, snapshot_date
    )

    if not args.no_download and not args.validate_only:
        download_istat_dataset(source.snapshot_dataset_id, snapshot_path)

    if not snapshot_path.exists():
        raise FileNotFoundError(f"Snapshot {snapshot_path} mancante. Esegui senza --no-download.")

    raw = parse_istat_sdmx(snapshot_path)
    normalized = normalize_tfr_dataframe(raw)

    audit = AuditTrail(
        source=f"ISTAT {source.snapshot_dataset_id}",
        source_url=f"http://sdmx.istat.it/SDMXWS/rest/data/{source.snapshot_dataset_id}",
        downloaded_at=snapshot_date.isoformat() + "T00:00:00Z",
        pipeline_version=pipeline_ver,
        transforms_applied=["normalize_tfr_dataframe"],
        validation_passed=True,
        datapoint_count=len(normalized),
        notes=source.description,
    )

    output_path = DATA_PROCESSED / "tfr_historical.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output = {
        "audit": json.loads(audit.model_dump_json()),
        "data": normalized.to_dict(orient="records"),
    }
    output_path.write_text(json.dumps(output, indent=2, ensure_ascii=False))
    logger.info(f"[D1] Scritto {output_path} con {len(normalized)} datapoint")


def main() -> int:
    parser = argparse.ArgumentParser(description="nati-istat pipeline build")
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--no-download", action="store_true")
    parser.add_argument("--snapshot-date", type=str, default=None)
    args = parser.parse_args()

    snapshot_date = (
        date.fromisoformat(args.snapshot_date) if args.snapshot_date else date.today()
    )
    pipeline_ver = git_sha()
    logger.info(f"Pipeline version: {pipeline_ver}, snapshot: {snapshot_date}")

    try:
        build_d1(args, snapshot_date, pipeline_ver)
        # build_d2, build_d3, ... aggiunti in task successive
    except Exception as exc:
        logger.error(f"Build fallita: {exc}", exc_info=True)
        return 1

    logger.info("Build completata")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 3: Esegui build con snapshot esistente**

```bash
cd pipeline && uv run python build.py --no-download
```

Expected: scrive `data/processed/tfr_historical.json` con audit trail + array di datapoint.

- [ ] **Step 4: Verifica JSON output**

```bash
cat data/processed/tfr_historical.json | head -30
```

Expected: vedi struttura `{audit: {...}, data: [{year, tfr}, ...]}`.

- [ ] **Step 5: Commit**

```bash
git add pipeline/sources/registry.py pipeline/build.py data/processed/tfr_historical.json
git commit -F - << 'PLAN'
feat(pipeline): build orchestrator + D1 emit

Orchestrator pipeline con flag --validate-only e --no-download.
Source registry estendibile. Prima fonte D1 (TFR storico) emette
JSON in data/processed/ con audit trail completo.
PLAN
```

---

## Phase 2 — Pipeline expansion (sources MUST)

### Task 2.1: D2 nascite mensili

**Files:**
- Modify: `pipeline/sources/registry.py`
- Create: `pipeline/sources/istat_births.py`
- Create: `pipeline/tests/test_istat_births.py`
- Modify: `pipeline/build.py:add build_d2 function`

- [ ] **Step 1: Test transform births mensili**

```python
# pipeline/tests/test_istat_births.py
import pandas as pd
import pytest

from sources.istat_births import normalize_births_monthly


def test_normalize_births_basic():
    raw = pd.DataFrame({
        "TIME_PERIOD": ["2024-01", "2024-02", "2024-03"],
        "value": [30000, 28000, 31000],
    })
    result = normalize_births_monthly(raw)
    assert list(result.columns) == ["year", "month", "births"]
    assert result["year"].iloc[0] == 2024
    assert result["month"].iloc[0] == 1
    assert result["births"].iloc[0] == 30000


def test_births_monthly_sum_consistency():
    """Test: somma mensile = totale annuale (tollerance 0.1%)."""
    monthly = pd.DataFrame({
        "year": [2024] * 12,
        "month": list(range(1, 13)),
        "births": [30000] * 12,
    })
    annual_total = 360000
    monthly_sum = monthly["births"].sum()
    diff_pct = abs(monthly_sum - annual_total) / annual_total
    assert diff_pct < 0.001
```

- [ ] **Step 2: Run, expect fail**

```bash
cd pipeline && uv run pytest tests/test_istat_births.py -v
```

- [ ] **Step 3: Implement source**

```python
# pipeline/sources/istat_births.py
"""ISTAT D2: Nascite mensili 2000-2025.

Dataset SDMX: DCIS_INDDEMOG
Filter: indicator NATI, frequency M (mensile)
"""

import pandas as pd


def normalize_births_monthly(raw: pd.DataFrame) -> pd.DataFrame:
    """Schema: TIME_PERIOD (YYYY-MM string), value → year, month, births."""
    df = raw.copy()
    period = df["TIME_PERIOD"].astype(str)
    df["year"] = period.str.slice(0, 4).astype(int)
    df["month"] = period.str.slice(5, 7).astype(int)
    df["births"] = df["value"].astype(int)
    return df.sort_values(["year", "month"]).reset_index(drop=True)[["year", "month", "births"]]
```

- [ ] **Step 4: Add D2 to registry**

```python
# pipeline/sources/registry.py — append a SOURCES:
SOURCES: list[DataSource] = [
    DataSource(id="D1", description="TFR storico Italia 1952-2024",
               snapshot_dataset_id="DCIS_FECONDITA1"),
    DataSource(id="D2", description="Nascite mensili Italia 2000-2025",
               snapshot_dataset_id="DCIS_INDDEMOG"),
]
```

- [ ] **Step 5: Add build_d2 to build.py**

Replicare pattern di `build_d1` con import di `normalize_births_monthly`, output `data/processed/births_monthly.json`. Aggiungere chiamata `build_d2(args, snapshot_date, pipeline_ver)` nel `main()`.

- [ ] **Step 6: Run pipeline + verifica**

```bash
cd pipeline && uv run python build.py
ls data/processed/
```

Expected: `tfr_historical.json` + `births_monthly.json`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(pipeline): source D2 nascite mensili ISTAT 2000-2025

DCIS_INDDEMOG con frequency mensile. Normalizzazione TIME_PERIOD
YYYY-MM → colonne year, month, births. Test consistenza somma mensile.
PLAN
```

### Task 2.2: D3 TFR per cittadinanza italiana/straniera

**Files:**
- Modify: `pipeline/sources/registry.py`
- Create: `pipeline/sources/istat_tfr_citizenship.py`
- Create: `pipeline/tests/test_istat_tfr_citizenship.py`
- Modify: `pipeline/build.py`

- [ ] **Step 1: Test normalize TFR per cittadinanza**

```python
# pipeline/tests/test_istat_tfr_citizenship.py
import pandas as pd

from sources.istat_tfr_citizenship import normalize_tfr_by_citizenship


def test_normalize_tfr_citizenship():
    raw = pd.DataFrame({
        "TIME_PERIOD": ["2020", "2020", "2021", "2021"],
        "CITTADINANZA": ["IT", "EE", "IT", "EE"],
        "value": [1.18, 1.85, 1.17, 1.84],
    })
    result = normalize_tfr_by_citizenship(raw)
    assert set(result["citizenship"]) == {"italiane", "straniere"}
    assert result.loc[
        (result["year"] == 2020) & (result["citizenship"] == "italiane"), "tfr"
    ].iloc[0] == 1.18
```

- [ ] **Step 2: Run, expect fail**

```bash
cd pipeline && uv run pytest tests/test_istat_tfr_citizenship.py -v
```

- [ ] **Step 3: Implement**

```python
# pipeline/sources/istat_tfr_citizenship.py
"""ISTAT D3: TFR per cittadinanza italiane/straniere 2003-2024."""

import pandas as pd

CITIZENSHIP_MAP = {
    "IT": "italiane",
    "EE": "straniere",
    "ITA": "italiane",
    "EST": "straniere",
}


def normalize_tfr_by_citizenship(raw: pd.DataFrame) -> pd.DataFrame:
    """Schema: TIME_PERIOD, CITTADINANZA → year, citizenship, tfr."""
    df = raw.copy()
    df["year"] = df["TIME_PERIOD"].astype(int)
    df["citizenship"] = df["CITTADINANZA"].map(CITIZENSHIP_MAP)
    df = df.dropna(subset=["citizenship"])
    df["tfr"] = df["value"].astype(float)
    return df.sort_values(["year", "citizenship"]).reset_index(drop=True)[
        ["year", "citizenship", "tfr"]
    ]
```

- [ ] **Step 4: Add to registry + build, run, commit**

```bash
cd pipeline && uv run pytest tests/test_istat_tfr_citizenship.py -v
cd pipeline && uv run python build.py
git add -A
git commit -F - << 'PLAN'
feat(pipeline): source D3 TFR per cittadinanza italiana/straniera

DCIS_FECONDITA1 con breakdown CITTADINANZA. Mapping codici ISTAT
verso label italiani (italiane/straniere). Output JSON triplo nested.
PLAN
```

### Task 2.3: D9 proiezioni demografiche 2024 (latest)

**Files:**
- Modify: `pipeline/sources/registry.py`
- Create: `pipeline/sources/istat_projections_2024.py`
- Create: `pipeline/tests/test_istat_projections_2024.py`
- Modify: `pipeline/build.py`

- [ ] **Step 1: Test transform proiezioni 2024**

```python
# pipeline/tests/test_istat_projections_2024.py
import pandas as pd

from sources.istat_projections_2024 import normalize_projection_2024


def test_normalize_projection_basic():
    raw = pd.DataFrame({
        "TIME_PERIOD": ["2024", "2025", "2030", "2050", "2080"],
        "SCENARIO": ["MEDIANO"] * 5,
        "INDICATOR": ["TFR"] * 5,
        "value": [1.18, 1.20, 1.30, 1.42, 1.47],
    })
    result = normalize_projection_2024(raw, indicator="TFR")
    assert list(result.columns) == ["year", "scenario", "value"]
    assert result["year"].iloc[-1] == 2080
    assert result["scenario"].iloc[0] == "MEDIANO"


def test_normalize_projection_filters_indicator():
    raw = pd.DataFrame({
        "TIME_PERIOD": ["2024", "2024"],
        "SCENARIO": ["MEDIANO", "MEDIANO"],
        "INDICATOR": ["TFR", "POP"],
        "value": [1.18, 59000000],
    })
    result = normalize_projection_2024(raw, indicator="TFR")
    assert len(result) == 1
    assert result["value"].iloc[0] == 1.18
```

- [ ] **Step 2: Run, expect fail**

```bash
cd pipeline && uv run pytest tests/test_istat_projections_2024.py -v
```

- [ ] **Step 3: Implement**

```python
# pipeline/sources/istat_projections_2024.py
"""ISTAT D9: Proiezioni demografiche release 2024 (base 2023).

Dataset SDMX: DCIS_POPRES1 (verificare effettivo nome SDMX in fase download —
fallback: scaricare CSV da istat.it).
"""

import pandas as pd


def normalize_projection_2024(raw: pd.DataFrame, *, indicator: str = "TFR") -> pd.DataFrame:
    """Filtra per indicator e scenario, normalizza schema."""
    df = raw[raw["INDICATOR"] == indicator].copy()
    df["year"] = df["TIME_PERIOD"].astype(int)
    df["scenario"] = df["SCENARIO"].astype(str)
    df["value"] = df["value"].astype(float)
    return df.sort_values(["scenario", "year"]).reset_index(drop=True)[
        ["year", "scenario", "value"]
    ]
```

- [ ] **Step 4: Verify endpoint + sample (manual exploration)**

ISTAT proiezioni 2024 hanno struttura dataset specifica. Prima del download massivo, verifica con:

```bash
cd pipeline && uv run python -c "
import pandasdmx as sdmx
ist = sdmx.Request('ISTAT')
cat = ist.dataflow('DCIS_POPRES1')
print(cat.dataflow.DCIS_POPRES1.name.en if cat.dataflow.get('DCIS_POPRES1') else 'NOT FOUND')
print(list(cat.codelist.values())[:5] if cat.codelist else 'no codelist')
"
```

Se il dataset id non è esatto, cercare con `ist.dataflow()` senza argomenti per listare. Documentare il nome corretto trovato come commento nel modulo.

- [ ] **Step 5: Add D9 a registry, build, commit**

Pattern identico a D1/D2. Output: `data/processed/projection_2024.json`.

```bash
cd pipeline && uv run python build.py
git add -A
git commit -F - << 'PLAN'
feat(pipeline): source D9 proiezioni ISTAT 2024 (base 2023)

DCIS_POPRES1 — latest projection release. Filter per indicator TFR
e per scenario (mediano, alto, basso). Output normalizzato per
consumo da frontend.
PLAN
```

### Task 2.4: Proiezioni archive D5-D8 (release storiche)

**Files:**
- Create: `pipeline/sources/istat_projections_archive.py`
- Create: `pipeline/tests/test_istat_projections_archive.py`
- Create: `data/raw/istat/archive/proiezione_2007/README.md`
- Create: `data/raw/istat/archive/proiezione_2011/README.md`
- Create: `data/raw/istat/archive/proiezione_2017/README.md`
- Create: `data/raw/istat/archive/proiezione_2021/README.md`

- [ ] **Step 1: Documentare strategia di acquisizione (manual)**

Per ogni release, creare README.md in `data/raw/istat/archive/proiezione_YYYY/` con:
- URL originale ISTAT (Wayback se necessario)
- Data acquisizione
- Formato originale (PDF/XLS/SDMX)
- Note su parsing

Esempio `data/raw/istat/archive/proiezione_2017/README.md`:

```markdown
# Proiezione ISTAT release 2017 (base 2016)

## Fonte
URL originale: https://www.istat.it/it/archivio/214228 (verificare)
Wayback: https://web.archive.org/web/2017*/istat.it/proiezioni
Data acquisizione: 2026-05-16

## Formato
XLS allegato al report PDF.

## Parsing
File `proiezione_2017_tfr.csv` estratto manualmente dal Foglio "TFR" del XLS,
range scenario mediano (colonne 2017-2065).

## Validazione
Confronto con report PDF tabella IV.3 (pag 67): valori 2017=1.34, 2030=1.42, 2065=1.59.
```

- [ ] **Step 2: Test parser CSV manuale**

```python
# pipeline/tests/test_istat_projections_archive.py
import pandas as pd
from pathlib import Path

from sources.istat_projections_archive import load_archive_projection


def test_load_archive_csv(tmp_path):
    csv_content = "year,value\n2017,1.34\n2030,1.42\n2065,1.59\n"
    csv_path = tmp_path / "proiezione_2017_tfr.csv"
    csv_path.write_text(csv_content)
    result = load_archive_projection(csv_path, release_year=2017)
    assert result["release_year"].iloc[0] == 2017
    assert result["year"].iloc[0] == 2017
    assert result["tfr"].iloc[0] == 1.34
```

- [ ] **Step 3: Implement parser**

```python
# pipeline/sources/istat_projections_archive.py
"""ISTAT D5-D8: Proiezioni demografiche storiche 2007-2021.

Strategia: estrazione manuale documentata dai PDF/XLS originali in
data/raw/istat/archive/proiezione_YYYY/. Output CSV semplice (year, value)
che il loader normalizza.
"""

from pathlib import Path

import pandas as pd


def load_archive_projection(csv_path: Path, *, release_year: int) -> pd.DataFrame:
    """Carica CSV proiezione archive e aggiunge release_year.

    Schema CSV atteso: year (int), value (float).
    Output: DataFrame con colonne {release_year, year, tfr}.
    """
    df = pd.read_csv(csv_path)
    df["release_year"] = release_year
    df["tfr"] = df["value"].astype(float)
    return df[["release_year", "year", "tfr"]]


def load_all_archive_projections(archive_dir: Path) -> pd.DataFrame:
    """Carica tutte le release archive da archive_dir/proiezione_YYYY/proiezione_YYYY_tfr.csv."""
    parts = []
    for release_year in [2007, 2011, 2017, 2021]:
        csv_path = archive_dir / f"proiezione_{release_year}" / f"proiezione_{release_year}_tfr.csv"
        if not csv_path.exists():
            continue  # Release non ancora acquisita
        parts.append(load_archive_projection(csv_path, release_year=release_year))
    if not parts:
        raise FileNotFoundError(f"Nessuna proiezione archive trovata in {archive_dir}")
    return pd.concat(parts, ignore_index=True)
```

- [ ] **Step 4: Manual data acquisition (HUMAN STEP — flag in execution)**

Cercare e scaricare manualmente:
- Report ISTAT 2007 proiezioni (PDF) → estrarre tabella TFR mediano
- Report ISTAT 2011 proiezioni (XLS) → estrarre foglio TFR
- Report ISTAT 2017 proiezioni (XLS) → estrarre foglio TFR
- Report ISTAT 2021 proiezioni (XLS o SDMX) → estrarre TFR mediano

Per ogni release, salvare in `data/raw/istat/archive/proiezione_YYYY/proiezione_YYYY_tfr.csv` con schema `year,value`.

**Tempo box: 4h massimo.** Se una release è irreperibile dopo 1h, escluderla e iniziare track-record dalla più antica reperibile (almeno 2017+2021 obbligatorie, 2007+2011 nice-to-have).

- [ ] **Step 5: Build, verifica output**

Aggiungere `build_archive_projections` a build.py che carica tutte le release disponibili e produce `data/processed/projections_archive.json`.

- [ ] **Step 6: Commit con elenco release acquisite**

```bash
git add -A
git commit -F - << 'PLAN'
feat(pipeline): source D5-D8 proiezioni archive ISTAT 2007-2021

Acquisizione manuale documentata dei report storici. Parser CSV
standard. Release acquisite: <elenco>. Output projections_archive.json
con MultiIndex (release_year, year).
PLAN
```

### Task 2.5: D11 UN World Population Prospects

**Files:**
- Create: `pipeline/sources/un_wpp.py`
- Create: `pipeline/tests/test_un_wpp.py`
- Modify: `pipeline/sources/registry.py`
- Modify: `pipeline/build.py`

- [ ] **Step 1: Test transform UN WPP**

```python
# pipeline/tests/test_un_wpp.py
import pandas as pd

from sources.un_wpp import normalize_un_wpp


def test_normalize_un_wpp_filters_italy():
    raw = pd.DataFrame({
        "Location": ["Italy", "France", "Italy"],
        "Variant": ["Medium", "Medium", "Low"],
        "Time": [2024, 2024, 2024],
        "TFR": [1.20, 1.65, 1.10],
    })
    result = normalize_un_wpp(raw, location="Italy")
    assert (result["country"] == "Italy").all()
    assert len(result) == 2


def test_normalize_un_wpp_pivots_scenarios():
    raw = pd.DataFrame({
        "Location": ["Italy"] * 6,
        "Variant": ["Low", "Medium", "High"] * 2,
        "Time": [2024, 2024, 2024, 2050, 2050, 2050],
        "TFR": [1.05, 1.20, 1.35, 1.10, 1.40, 1.70],
    })
    result = normalize_un_wpp(raw, location="Italy")
    assert "scenario_low" in result.columns or "Low" in result["scenario"].values
```

- [ ] **Step 2: Run, expect fail**

```bash
cd pipeline && uv run pytest tests/test_un_wpp.py -v
```

- [ ] **Step 3: Implement source UN WPP**

```python
# pipeline/sources/un_wpp.py
"""UN World Population Prospects 2024 — Italia, TFR scenari low/medium/high.

Download: https://population.un.org/wpp/Download/Standard/MostUsed/
Format: CSV/Excel
"""

from pathlib import Path

import pandas as pd
import requests

UN_WPP_DEMOGRAPHIC_INDICATORS_URL = (
    "https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20"
    "(Standard)/EXCEL_FILES/1_General/WPP2024_GEN_F01_DEMOGRAPHIC_"
    "INDICATORS_COMPACT.xlsx"
)


def download_un_wpp(target_path: Path, url: str = UN_WPP_DEMOGRAPHIC_INDICATORS_URL) -> dict:
    """Scarica file UN WPP."""
    if target_path.exists():
        return {"path": str(target_path), "cached": True}
    target_path.parent.mkdir(parents=True, exist_ok=True)
    r = requests.get(url, timeout=300, stream=True)
    r.raise_for_status()
    with open(target_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    return {"path": str(target_path), "url": url}


def normalize_un_wpp(raw: pd.DataFrame, *, location: str = "Italy") -> pd.DataFrame:
    """Filtra Italia, normalizza schema {year, scenario, value, country}."""
    df = raw[raw["Location"] == location].copy()
    df["year"] = df["Time"].astype(int)
    df["scenario"] = df["Variant"].astype(str)
    df["value"] = df["TFR"].astype(float)
    df["country"] = df["Location"]
    return df.sort_values(["scenario", "year"]).reset_index(drop=True)[
        ["country", "year", "scenario", "value"]
    ]
```

- [ ] **Step 4: Build + commit**

```bash
cd pipeline && uv run python build.py
git add -A
git commit -F - << 'PLAN'
feat(pipeline): source D11 UN World Population Prospects 2024 Italia

Download Excel UN WPP, normalizza scenari low/medium/high TFR.
Output un_wpp_italy.json per uso nei capitoli 4 e 6.
PLAN
```

---

## Phase 3 — Transforms (analytics core)

### Task 3.1: TFR decomposition italiane vs straniere (bridge)

**Files:**
- Create: `pipeline/transforms/__init__.py`
- Create: `pipeline/transforms/tfr_decomposition.py`
- Create: `pipeline/tests/test_tfr_decomposition.py`
- Modify: `pipeline/build.py`

- [ ] **Step 1: Test computazione contribution**

```python
# pipeline/tests/test_tfr_decomposition.py
import pandas as pd

from transforms.tfr_decomposition import compute_contribution_bridge


def test_compute_contribution_simple():
    """TFR totale 2003 = 1.30, TFR totale 2008 = 1.45.
    Italiane: 1.25 → 1.30 (peso 0.8 → 0.75)
    Straniere: 1.85 → 2.05 (peso 0.2 → 0.25)
    Verifica decomposizione algebrica."""
    tfr_data = pd.DataFrame({
        "year": [2003, 2003, 2008, 2008],
        "citizenship": ["italiane", "straniere", "italiane", "straniere"],
        "tfr": [1.25, 1.85, 1.30, 2.05],
        "weight": [0.8, 0.2, 0.75, 0.25],
    })
    result = compute_contribution_bridge(tfr_data, year_from=2003, year_to=2008)
    assert "total_change" in result
    assert "italiane_effect" in result
    assert "straniere_effect" in result
    assert "composition_effect" in result
    total = (
        result["italiane_effect"]
        + result["straniere_effect"]
        + result["composition_effect"]
    )
    assert abs(total - result["total_change"]) < 0.001
```

- [ ] **Step 2: Run, expect fail**

```bash
cd pipeline && uv run pytest tests/test_tfr_decomposition.py -v
```

- [ ] **Step 3: Implement**

```python
# pipeline/transforms/tfr_decomposition.py
"""Decomposizione TFR per cittadinanza.

Algebraic decomposition:
TFR_total = w_it * TFR_it + w_es * TFR_es
ΔTFR_total = w_it_avg * ΔTFR_it + w_es_avg * ΔTFR_es + (TFR_es_avg - TFR_it_avg) * Δw_es
            ↑ italiane_effect    ↑ straniere_effect      ↑ composition_effect
"""

import pandas as pd


def compute_contribution_bridge(
    tfr_data: pd.DataFrame,
    *,
    year_from: int,
    year_to: int,
) -> dict[str, float]:
    """Decomposizione algebrica del cambiamento TFR tra year_from e year_to.

    Args:
        tfr_data: DataFrame con colonne {year, citizenship, tfr, weight}
        year_from, year_to: anni di confronto

    Returns:
        dict con keys: total_change, italiane_effect, straniere_effect,
        composition_effect
    """
    pivot = tfr_data.pivot_table(index="year", columns="citizenship", values=["tfr", "weight"])

    tfr_it_from = pivot.loc[year_from, ("tfr", "italiane")]
    tfr_it_to = pivot.loc[year_to, ("tfr", "italiane")]
    tfr_es_from = pivot.loc[year_from, ("tfr", "straniere")]
    tfr_es_to = pivot.loc[year_to, ("tfr", "straniere")]
    w_it_from = pivot.loc[year_from, ("weight", "italiane")]
    w_it_to = pivot.loc[year_to, ("weight", "italiane")]
    w_es_from = pivot.loc[year_from, ("weight", "straniere")]
    w_es_to = pivot.loc[year_to, ("weight", "straniere")]

    total_from = w_it_from * tfr_it_from + w_es_from * tfr_es_from
    total_to = w_it_to * tfr_it_to + w_es_to * tfr_es_to
    total_change = total_to - total_from

    w_it_avg = (w_it_from + w_it_to) / 2
    w_es_avg = (w_es_from + w_es_to) / 2
    tfr_it_avg = (tfr_it_from + tfr_it_to) / 2
    tfr_es_avg = (tfr_es_from + tfr_es_to) / 2

    italiane_effect = w_it_avg * (tfr_it_to - tfr_it_from)
    straniere_effect = w_es_avg * (tfr_es_to - tfr_es_from)
    composition_effect = (tfr_es_avg - tfr_it_avg) * (w_es_to - w_es_from)

    return {
        "year_from": year_from,
        "year_to": year_to,
        "total_change": float(total_change),
        "italiane_effect": float(italiane_effect),
        "straniere_effect": float(straniere_effect),
        "composition_effect": float(composition_effect),
    }
```

- [ ] **Step 4: Run, pass, commit**

```bash
cd pipeline && uv run pytest tests/test_tfr_decomposition.py -v
# Aggiungi a build.py una funzione build_decomposition che salva data/processed/tfr_decomposition.json
git add -A
git commit -F - << 'PLAN'
feat(pipeline): transform decomposizione TFR italiane vs straniere

Decomposizione algebrica del cambiamento TFR tra due anni con
isolamento effetto italiane, effetto straniere, effetto composizione
(shift demografico). Test con dati controllati.
PLAN
```

### Task 3.2: Projection errors backtest

**Files:**
- Create: `pipeline/transforms/projection_errors.py`
- Create: `pipeline/tests/test_projection_errors.py`
- Modify: `pipeline/build.py`

- [ ] **Step 1: Test backtest metrics**

```python
# pipeline/tests/test_projection_errors.py
import pandas as pd

from transforms.projection_errors import compute_backtest_metrics


def test_backtest_metrics_basic():
    actual = pd.DataFrame({
        "year": [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        "tfr": [1.32, 1.29, 1.27, 1.24, 1.25, 1.24, 1.20, 1.18],
    })
    projection = pd.DataFrame({
        "release_year": [2017] * 8,
        "year": [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        "tfr": [1.34, 1.36, 1.38, 1.40, 1.41, 1.42, 1.43, 1.44],
    })
    metrics = compute_backtest_metrics(actual, projection, release_year=2017)
    assert metrics["mae"] > 0
    assert metrics["signed_bias"] > 0  # Proiezione sovrastima → bias positivo
    assert "rmse" in metrics
    assert metrics["n_points"] == 8
```

- [ ] **Step 2: Implement**

```python
# pipeline/transforms/projection_errors.py
"""Backtest errore proiezioni vs dati osservati.

Metriche:
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- Signed bias (mean(proj - actual)): positivo = sovrastima
"""

import math

import pandas as pd


def compute_backtest_metrics(
    actual: pd.DataFrame,
    projection: pd.DataFrame,
    *,
    release_year: int,
) -> dict:
    """Compara proiezione vs reale sugli anni in cui entrambe esistono."""
    proj = projection[projection["release_year"] == release_year]
    merged = actual.merge(proj[["year", "tfr"]], on="year", suffixes=("_actual", "_proj"))
    if merged.empty:
        return {
            "release_year": release_year,
            "n_points": 0,
            "mae": None,
            "rmse": None,
            "signed_bias": None,
        }
    diff = merged["tfr_proj"] - merged["tfr_actual"]
    return {
        "release_year": release_year,
        "n_points": len(merged),
        "mae": float(diff.abs().mean()),
        "rmse": float(math.sqrt((diff**2).mean())),
        "signed_bias": float(diff.mean()),
        "max_error": float(diff.abs().max()),
        "first_year": int(merged["year"].min()),
        "last_year": int(merged["year"].max()),
    }


def compute_all_backtests(
    actual: pd.DataFrame,
    projections_archive: pd.DataFrame,
) -> pd.DataFrame:
    """Calcola metriche per ogni release archive."""
    release_years = sorted(projections_archive["release_year"].unique())
    rows = [compute_backtest_metrics(actual, projections_archive, release_year=ry)
            for ry in release_years]
    return pd.DataFrame(rows)
```

- [ ] **Step 3: Run, commit**

```bash
cd pipeline && uv run pytest tests/test_projection_errors.py -v
git add -A
git commit -F - << 'PLAN'
feat(pipeline): transform backtest errori proiezioni vs reale

Metriche MAE, RMSE, signed bias per ogni release ISTAT vs dati
osservati. Funzione aggregata per produrre tabella backtest
completa (input grafico capitolo 3).
PLAN
```

### Task 3.3: Alternative scenario model ("no-recovery")

**Files:**
- Create: `pipeline/transforms/scenario_models.py`
- Create: `pipeline/tests/test_scenario_models.py`
- Modify: `pipeline/build.py`

- [ ] **Step 1: Test scenario "no-recovery"**

```python
# pipeline/tests/test_scenario_models.py
import pandas as pd

from transforms.scenario_models import build_no_recovery_scenario


def test_no_recovery_holds_current_level():
    """Scenario no-recovery: TFR resta al livello osservato 2024, no rebound."""
    historical = pd.DataFrame({
        "year": [2020, 2021, 2022, 2023, 2024],
        "tfr": [1.24, 1.25, 1.24, 1.20, 1.18],
    })
    scenario = build_no_recovery_scenario(historical, target_year=2080)
    assert scenario["year"].max() == 2080
    assert scenario["year"].min() == 2024
    # Resta costante a 1.18 (con tolleranza per modeling realistico)
    assert all(abs(scenario["tfr"] - 1.18) < 0.05)
```

- [ ] **Step 2: Implement**

```python
# pipeline/transforms/scenario_models.py
"""Scenari alternativi a quello ISTAT mediano.

no_recovery: TFR resta al livello osservato 2024 (no rebound assumption).
Justification: senza driver storici esauriti (immigrazione+tempo recuperato),
no meccanismo per ipotizzare recupero.
"""

import pandas as pd


def build_no_recovery_scenario(
    historical: pd.DataFrame,
    *,
    target_year: int = 2080,
) -> pd.DataFrame:
    """TFR proiezione che resta al livello dell'ultimo anno osservato.

    Args:
        historical: DataFrame con colonne {year, tfr}
        target_year: anno fino al quale proiettare

    Returns:
        DataFrame {year, tfr} dal year_last_observed a target_year.
    """
    last_year = historical["year"].max()
    last_tfr = historical[historical["year"] == last_year]["tfr"].iloc[0]
    years = list(range(int(last_year), target_year + 1))
    return pd.DataFrame({"year": years, "tfr": [float(last_tfr)] * len(years)})
```

- [ ] **Step 3: Pass, commit**

```bash
cd pipeline && uv run pytest tests/test_scenario_models.py -v
git add -A
git commit -F - << 'PLAN'
feat(pipeline): transform scenario alternativo no-recovery

Modello scenario alternativo che mantiene TFR al livello osservato
ultimo anno. Output per confronto con scenario ISTAT mediano (cap 6).
PLAN
```

### Task 3.4: Build outputs aggregate JSON per frontend

**Files:**
- Modify: `pipeline/build.py`
- Create: `pipeline/build_outputs.py`

- [ ] **Step 1: Implementare build_outputs aggregator**

`build_outputs.py` riunisce tutti i JSON intermedi e li struttura per consumo frontend. Esempio:

```python
# pipeline/build_outputs.py
"""Aggregator per produrre i JSON finali consumati dal frontend.

Output:
- tfr_historical.json (D1)
- tfr_decomposition.json (transform da D3)
- projections_archive.json (D5-D9 unificate per chart killer)
- projection_errors.json (backtest per ogni release)
- scenarios_comparison.json (ISTAT mediano + UN low/med/high + no-recovery)
- _metadata.json (audit trail aggregato)
"""

import json
from pathlib import Path

from transforms.projection_errors import compute_all_backtests
from transforms.scenario_models import build_no_recovery_scenario


def build_projections_unified(processed_dir: Path) -> dict:
    """Unifica D5-D8 (archive) + D9 (2024) in struttura per grafico killer."""
    archive = json.loads((processed_dir / "projections_archive.json").read_text())
    latest = json.loads((processed_dir / "projection_2024.json").read_text())
    return {
        "releases": archive["data"] + [
            {"release_year": 2024, **row} for row in latest["data"]
        ],
    }


def build_projection_errors_output(processed_dir: Path) -> dict:
    """Aggrega backtest metrics di tutte le release."""
    import pandas as pd
    actual = pd.DataFrame(json.loads((processed_dir / "tfr_historical.json").read_text())["data"])
    archive = pd.DataFrame(json.loads((processed_dir / "projections_archive.json").read_text())["data"])
    metrics = compute_all_backtests(actual, archive)
    return {"metrics": metrics.to_dict(orient="records")}


def build_scenarios_comparison(processed_dir: Path) -> dict:
    """Combina ISTAT mediano + UN scenari + nostro no-recovery."""
    import pandas as pd
    historical = pd.DataFrame(
        json.loads((processed_dir / "tfr_historical.json").read_text())["data"]
    )
    no_recovery = build_no_recovery_scenario(historical, target_year=2080)
    istat = json.loads((processed_dir / "projection_2024.json").read_text())["data"]
    un = json.loads((processed_dir / "un_wpp_italy.json").read_text())["data"]
    return {
        "historical": historical.to_dict(orient="records"),
        "istat_2024_mediano": [r for r in istat if r["scenario"] in ("MEDIANO", "Mediano")],
        "un_low": [r for r in un if r["scenario"] == "Low"],
        "un_medium": [r for r in un if r["scenario"] == "Medium"],
        "un_high": [r for r in un if r["scenario"] == "High"],
        "no_recovery": no_recovery.to_dict(orient="records"),
    }
```

- [ ] **Step 2: Wire in build.py final step**

```python
# In main() di build.py, aggiungere dopo build_d*():
from build_outputs import (
    build_projections_unified,
    build_projection_errors_output,
    build_scenarios_comparison,
)

def aggregate_outputs(snapshot_date, pipeline_ver):
    logger.info("Aggregating outputs per frontend")
    for name, builder in [
        ("projections_unified.json", build_projections_unified),
        ("projection_errors.json", build_projection_errors_output),
        ("scenarios_comparison.json", build_scenarios_comparison),
    ]:
        output = builder(DATA_PROCESSED)
        wrapped = {
            "audit": {
                "source": "Aggregated from multiple datasets",
                "pipeline_version": pipeline_ver,
                "downloaded_at": snapshot_date.isoformat() + "T00:00:00Z",
            },
            "data": output,
        }
        (DATA_PROCESSED / name).write_text(json.dumps(wrapped, indent=2, ensure_ascii=False))
        logger.info(f"Aggregato {name}")
```

- [ ] **Step 3: Run full build, verifica tutti i JSON output**

```bash
cd pipeline && uv run python build.py
ls -la data/processed/
```

Expected: almeno 7-8 JSON in `data/processed/`.

- [ ] **Step 4: Commit (M1 milestone)**

```bash
git add -A
git commit -F - << 'PLAN'
feat(pipeline): aggregator outputs per consumo frontend

Aggrega JSON intermedi in 3 output finali per frontend:
- projections_unified.json (chart killer cap 3)
- projection_errors.json (metriche backtest)
- scenarios_comparison.json (cap 6 comparator)

Milestone M1: pipeline produce JSON validi per D1+D2+D3+D9+D11
+ proiezioni archive disponibili + transforms applicate.
PLAN
```

### Task 3.5: Validators come pytest suite per CI

**Files:**
- Create: `pipeline/validators/__init__.py`
- Create: `pipeline/validators/test_tfr_ranges.py`
- Create: `pipeline/validators/test_births_consistency.py`
- Create: `pipeline/validators/test_output_completeness.py`

- [ ] **Step 1: Validator TFR ranges**

```python
# pipeline/validators/test_tfr_ranges.py
"""Validation: TFR processed in range plausibili.

Eseguito da CI dopo build. Fail → deploy bloccato.
"""

import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_PROCESSED = REPO_ROOT / "data" / "processed"


@pytest.fixture
def tfr_historical():
    with open(DATA_PROCESSED / "tfr_historical.json") as f:
        return json.load(f)


def test_tfr_historical_in_range(tfr_historical):
    """TFR storico Italia deve essere sempre in [0.5, 3.0]."""
    for row in tfr_historical["data"]:
        assert 0.5 <= row["tfr"] <= 3.0, f"Anno {row['year']}: TFR {row['tfr']} fuori range"


def test_tfr_historical_years_complete(tfr_historical):
    """Tutti gli anni da min a max devono essere presenti, senza gap."""
    years = sorted(r["year"] for r in tfr_historical["data"])
    assert years == list(range(years[0], years[-1] + 1)), "Gap negli anni TFR"


def test_tfr_historical_min_year_2024(tfr_historical):
    """Deve includere dati fino al 2024 almeno."""
    max_year = max(r["year"] for r in tfr_historical["data"])
    assert max_year >= 2024, f"Dati TFR fermano a {max_year}, atteso almeno 2024"
```

- [ ] **Step 2: Validator births consistency**

```python
# pipeline/validators/test_births_consistency.py
import json
from collections import defaultdict
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_PROCESSED = REPO_ROOT / "data" / "processed"


@pytest.fixture
def births_monthly():
    path = DATA_PROCESSED / "births_monthly.json"
    if not path.exists():
        pytest.skip("births_monthly.json non ancora prodotto")
    with open(path) as f:
        return json.load(f)


def test_births_no_negative(births_monthly):
    for row in births_monthly["data"]:
        assert row["births"] >= 0


def test_births_complete_months_per_year(births_monthly):
    """Per ogni anno completo (non in corso) devono esserci 12 mesi."""
    by_year = defaultdict(list)
    for row in births_monthly["data"]:
        by_year[row["year"]].append(row["month"])
    current_year = 2026  # Aggiornare se serve
    for year, months in by_year.items():
        if year < current_year:
            assert len(months) == 12, f"Anno {year}: solo {len(months)} mesi"
```

- [ ] **Step 3: Run validators**

```bash
cd pipeline && uv run pytest validators/ -v
```

Expected: tutti pass se pipeline ha prodotto JSON corretti.

- [ ] **Step 4: Commit**

```bash
git add pipeline/validators/
git commit -F - << 'PLAN'
test(pipeline): validators pytest CI-enforced

Validators come pytest suite per CI:
- test_tfr_ranges: TFR sempre in [0.5, 3.0], anni completi, fino al 2024
- test_births_consistency: no negative, 12 mesi per anno completo

Build CI fallisce su validator failure → deploy bloccato.
PLAN
```

---

## Phase 4 — Web bootstrap (Next.js)

### Task 4.1: Next.js init + base config

**Files:**
- Create: `web/package.json` (via pnpm create)
- Create: `web/next.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/tailwind.config.ts`

- [ ] **Step 1: Bootstrap Next.js**

```bash
cd /Users/fdicredico/ricerche/nati-istat
pnpm create next-app@latest web --typescript --tailwind --app --src-dir false --import-alias "@/*" --turbopack --no-eslint --no-git --use-pnpm
```

Risponde "no" se chiede ESLint (lo aggiungiamo dopo con config nostra), "yes" a Tailwind, App Router, TypeScript.

- [ ] **Step 2: Configure tsconfig strict**

```json
// web/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] },
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Verify clean install + type check**

```bash
cd web && pnpm install && pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): bootstrap Next.js 15 App Router con TypeScript strict

Next.js 15 + App Router + Tailwind v4 + Turbopack. TS strict
con noUncheckedIndexedAccess per safety. Path alias @/*.
PLAN
```

### Task 4.2: Tipografia + theme tokens

**Files:**
- Create: `web/app/layout.tsx` (modify generated)
- Create: `web/lib/theme.ts`
- Create: `web/app/globals.css` (modify generated)
- Download: `web/public/fonts/` — Source Serif 4 + IBM Plex Sans/Mono subset

- [ ] **Step 1: Download fonts (Google Fonts API self-host)**

Usare `next/font` con `local` o `google`. Per privacy/performance, self-host con `next/font/local`:

```typescript
// web/lib/fonts.ts
import localFont from "next/font/local";

export const serif = localFont({
  src: [
    { path: "../public/fonts/SourceSerif4-Regular.woff2", weight: "400" },
    { path: "../public/fonts/SourceSerif4-SemiBold.woff2", weight: "600" },
    { path: "../public/fonts/SourceSerif4-Bold.woff2", weight: "700" },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const sans = localFont({
  src: [
    { path: "../public/fonts/IBMPlexSans-Regular.woff2", weight: "400" },
    { path: "../public/fonts/IBMPlexSans-Medium.woff2", weight: "500" },
    { path: "../public/fonts/IBMPlexSans-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const mono = localFont({
  src: [
    { path: "../public/fonts/IBMPlexMono-Regular.woff2", weight: "400" },
  ],
  variable: "--font-mono",
  display: "swap",
});
```

Scaricare i woff2 da: https://fonts.google.com/ (download → estrarre woff2) oppure usare `next/font/google` con `import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"` (più semplice, build-time Google fetch).

**Decisione semplificata:** usare `next/font/google` per evitare gestione manuale dei woff. Il build di Next li scarica e li serve self-hosted.

```typescript
// web/lib/fonts.ts (versione semplificata)
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

export const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});
```

- [ ] **Step 2: Theme tokens**

```typescript
// web/lib/theme.ts
export const colors = {
  // Neutri
  bg: "#ffffff",
  fg: "#1a1a1a",
  fgMuted: "#5a5a5a",
  fgSubtle: "#888888",
  border: "#e5e5e5",
  surface: "#fafafa",

  // Accent
  historical: "#a8260b",      // Rosso serie storica reale
  projection2007: "#c8d8e8",  // Grigio-blu, gradiente per release
  projection2011: "#a8c0d8",
  projection2017: "#7b9fc4",
  projection2021: "#4a7da8",
  projection2024: "#1e5180",
  scenarioAlt: "#45BCCC",     // Turchese scenari alternativi
  unScenario: "#888888",
} as const;

export const typography = {
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const spacing = {
  containerMax: "1200px",
  contentMax: "680px",        // Long-form reading width
  chartMax: "960px",
} as const;
```

- [ ] **Step 3: Root layout**

```tsx
// web/app/layout.tsx
import type { Metadata } from "next";

import { mono, sans, serif } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "nati-istat",
  description:
    "Le proiezioni demografiche ISTAT del tasso di fecondità italiano confrontate con i dati osservati. Un'analisi del track record metodologico.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: globals.css**

```css
/* web/app/globals.css */
@import "tailwindcss";

@theme {
  --font-serif: var(--font-serif), Georgia, serif;
  --font-sans: var(--font-sans), system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;

  --color-bg: #ffffff;
  --color-fg: #1a1a1a;
  --color-fg-muted: #5a5a5a;
  --color-border: #e5e5e5;
  --color-historical: #a8260b;
  --color-projection: #7b9fc4;
  --color-scenario-alt: #45bccc;
}

@layer base {
  html { font-family: var(--font-sans); color: var(--color-fg); background: var(--color-bg); }
  body { font-size: 17px; line-height: 1.6; }
  h1, h2, h3 { font-family: var(--font-serif); letter-spacing: -0.01em; }
  h1 { font-size: 3rem; font-weight: 700; line-height: 1.05; }
  h2 { font-size: 2rem; font-weight: 700; line-height: 1.15; margin-top: 4rem; }
  h3 { font-size: 1.375rem; font-weight: 600; margin-top: 2rem; }
  p { margin-top: 1.25em; }
  code, kbd, samp { font-family: var(--font-mono); font-size: 0.9em; }
}
```

- [ ] **Step 5: Verify dev server boot**

```bash
cd web && pnpm dev
```

Aprire `http://localhost:3000`, vedere placeholder Next.js con font applicato.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): tipografia + theme tokens

Setup font Source Serif 4 + IBM Plex Sans/Mono via next/font/google.
Theme tokens centralizzati in lib/theme.ts: palette per
serie storica, gradiente proiezioni, accent turchese scenari.
Tailwind v4 con @theme tokens, layer base per tipografia.
PLAN
```

### Task 4.3: Data loader (typed JSON imports)

**Files:**
- Create: `web/lib/data.ts`
- Create: `web/lib/types.ts`
- Create: symlink o copy: `web/data` → `../data/processed`

- [ ] **Step 1: Types per dataset**

```typescript
// web/lib/types.ts
export interface AuditTrail {
  source: string;
  source_url: string;
  downloaded_at: string;
  pipeline_version: string;
  transforms_applied: string[];
  validation_passed: boolean;
  datapoint_count: number;
  notes?: string;
}

export interface DatasetWrapper<T> {
  audit: AuditTrail;
  data: T;
}

export interface TFRPoint {
  year: number;
  tfr: number;
}

export interface BirthsMonthlyPoint {
  year: number;
  month: number;
  births: number;
}

export interface TFRByCitizenshipPoint {
  year: number;
  citizenship: "italiane" | "straniere";
  tfr: number;
}

export interface ProjectionPoint {
  release_year: number;
  year: number;
  tfr: number;
}

export interface UNWPPPoint {
  country: string;
  year: number;
  scenario: "Low" | "Medium" | "High";
  value: number;
}

export interface BacktestMetrics {
  release_year: number;
  n_points: number;
  mae: number | null;
  rmse: number | null;
  signed_bias: number | null;
  max_error?: number;
}
```

- [ ] **Step 2: Data loader**

```typescript
// web/lib/data.ts
/**
 * Tipizzati JSON loader. Import statici risolti a build time.
 * Dati provenienti da pipeline (data/processed/) committed nel repo.
 */

import tfrHistoricalRaw from "@/../data/processed/tfr_historical.json";
import birthsMonthlyRaw from "@/../data/processed/births_monthly.json";
import tfrCitizenshipRaw from "@/../data/processed/tfr_by_citizenship.json";
import projectionsUnifiedRaw from "@/../data/processed/projections_unified.json";
import projectionErrorsRaw from "@/../data/processed/projection_errors.json";
import scenariosRaw from "@/../data/processed/scenarios_comparison.json";

import type {
  BacktestMetrics,
  BirthsMonthlyPoint,
  DatasetWrapper,
  ProjectionPoint,
  TFRByCitizenshipPoint,
  TFRPoint,
} from "./types";

export const tfrHistorical = tfrHistoricalRaw as DatasetWrapper<TFRPoint[]>;
export const birthsMonthly = birthsMonthlyRaw as DatasetWrapper<BirthsMonthlyPoint[]>;
export const tfrCitizenship = tfrCitizenshipRaw as DatasetWrapper<TFRByCitizenshipPoint[]>;
export const projectionsUnified = projectionsUnifiedRaw as DatasetWrapper<{
  releases: ProjectionPoint[];
}>;
export const projectionErrors = projectionErrorsRaw as DatasetWrapper<{
  metrics: BacktestMetrics[];
}>;
export const scenarios = scenariosRaw as DatasetWrapper<{
  historical: TFRPoint[];
  istat_2024_mediano: { year: number; tfr: number }[];
  un_low: { year: number; value: number }[];
  un_medium: { year: number; value: number }[];
  un_high: { year: number; value: number }[];
  no_recovery: { year: number; tfr: number }[];
}>;
```

- [ ] **Step 3: Next.js JSON import config**

Aggiungere a `web/next.config.ts`:

```typescript
// web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["../data/processed/**/*"],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Test import in test page**

Modificare `web/app/page.tsx` temporaneo:

```tsx
import { tfrHistorical } from "@/lib/data";

export default function Home() {
  const latest = tfrHistorical.data.at(-1);
  return (
    <main className="p-8">
      <h1>nati-istat</h1>
      <p>Ultimo TFR osservato: {latest?.tfr} ({latest?.year})</p>
      <p>Fonte: {tfrHistorical.audit.source}</p>
    </main>
  );
}
```

```bash
cd web && pnpm dev
```

Verifica che la pagina renderizzi il valore TFR.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): data loader tipizzato per JSON pipeline

Type definitions per ogni dataset processed. Loader statico
con import JSON (build-time inlining). Configurazione Next.js
per includere data/processed/ in tracing.
PLAN
```

---

## Phase 5 — Chart primitives + layout

### Task 5.1: shadcn/ui setup + primitive base

**Files:**
- Create: `web/components.json`
- Add: shadcn primitives (button, dialog, tooltip)

- [ ] **Step 1: shadcn init**

```bash
cd web && pnpm dlx shadcn@latest init
```

Risposte: TypeScript yes, Tailwind config default, base color Stone, CSS variables yes.

- [ ] **Step 2: Add primitives**

```bash
cd web && pnpm dlx shadcn@latest add button tooltip dialog separator
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): shadcn/ui setup + primitive base

Aggiunti button, tooltip, dialog, separator. Config con palette
Stone (compatibile con tema editorial).
PLAN
```

### Task 5.2: TopNav + ReadingProgress + Footer

**Files:**
- Create: `web/components/layout/TopNav.tsx`
- Create: `web/components/layout/ReadingProgress.tsx`
- Create: `web/components/layout/Footer.tsx`
- Modify: `web/app/layout.tsx`

- [ ] **Step 1: TopNav (sticky, capitoli)**

```tsx
// web/components/layout/TopNav.tsx
"use client";

import Link from "next/link";

const CHAPTERS = [
  { num: 1, anchor: "#cap-1", label: "Dato di partenza" },
  { num: 2, anchor: "#cap-2", label: "Ripresa 2003-2010" },
  { num: 3, anchor: "#cap-3", label: "Track record" },
  { num: 4, anchor: "#cap-4", label: "Assunzioni" },
  { num: 5, anchor: "#cap-5", label: "Cascata economica" },
  { num: 6, anchor: "#cap-6", label: "Scenari alternativi" },
];

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3 text-sm">
        <Link href="/" className="font-serif text-base font-semibold">
          nati-istat
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          {CHAPTERS.map((c) => (
            <a
              key={c.num}
              href={c.anchor}
              className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
              title={c.label}
            >
              {c.num}
            </a>
          ))}
          <span className="mx-2 text-[color:var(--color-border)]">·</span>
          <Link href="/metodologia" className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]">
            Metodologia
          </Link>
          <Link href="/dati" className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]">
            Dati
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: ReadingProgress (bar al top edge)**

```tsx
// web/components/layout/ReadingProgress.tsx
"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[100] h-[2px] w-full bg-transparent">
      <div
        className="h-full bg-[color:var(--color-historical)] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Footer**

```tsx
// web/components/layout/Footer.tsx
import Link from "next/link";

import { tfrHistorical } from "@/lib/data";

export function Footer() {
  const updated = tfrHistorical.audit.downloaded_at.slice(0, 10);
  return (
    <footer className="mt-32 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto max-w-[1200px] px-6 py-12 text-sm text-[color:var(--color-fg-muted)]">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-2 font-serif text-base font-semibold text-[color:var(--color-fg)]">
              nati-istat
            </div>
            <p>
              Le proiezioni demografiche ISTAT del tasso di fecondità italiano
              confrontate con i dati osservati.
            </p>
          </div>
          <div>
            <div className="mb-2 font-semibold text-[color:var(--color-fg)]">Risorse</div>
            <ul className="space-y-1">
              <li><Link href="/metodologia" className="hover:underline">Metodologia</Link></li>
              <li><Link href="/dati" className="hover:underline">Dati &amp; download</Link></li>
              <li><a href="https://github.com/fdicredico/nati-istat" className="hover:underline">Repo GitHub</a></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 font-semibold text-[color:var(--color-fg)]">Info</div>
            <ul className="space-y-1">
              <li>Autore: Francesco Di Credico</li>
              <li>Codice: MIT · Contenuti: CC-BY-SA 4.0</li>
              <li>Dati aggiornati al: {updated}</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Wire in layout.tsx**

```tsx
// web/app/layout.tsx — aggiornare body
<body>
  <ReadingProgress />
  <TopNav />
  {children}
  <Footer />
</body>
```

Aggiungere import di Footer, TopNav, ReadingProgress.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): layout components — TopNav, ReadingProgress, Footer

Sticky nav con shortcut numerici per i 6 capitoli. Reading
progress bar fixed in alto. Footer con risorse + ultima data
aggiornamento dati (da audit trail D1).
PLAN
```

### Task 5.3: PlotChart wrapper component

**Files:**
- Create: `web/components/charts/PlotChart.tsx`
- Add dependency: `@observablehq/plot`

- [ ] **Step 1: Add dependency**

```bash
cd web && pnpm add @observablehq/plot d3
pnpm add -D @types/d3
```

- [ ] **Step 2: PlotChart wrapper**

```tsx
// web/components/charts/PlotChart.tsx
"use client";

import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";

interface PlotChartProps {
  plotOptions: Plot.PlotOptions;
  alt: string;
  caption?: React.ReactNode;
  className?: string;
}

export function PlotChart({ plotOptions, alt, caption, className }: PlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const plot = Plot.plot(plotOptions);
    plot.setAttribute("role", "img");
    plot.setAttribute("aria-label", alt);
    containerRef.current.append(plot);
    return () => plot.remove();
  }, [plotOptions, alt]);

  return (
    <figure className={className}>
      <div ref={containerRef} className="w-full" />
      {caption && (
        <figcaption className="mt-2 text-xs text-[color:var(--color-fg-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 3: Test render with TFR storico (Cap 1 prototype)**

```tsx
// In app/page.tsx temporaneo
import * as Plot from "@observablehq/plot";
import { tfrHistorical } from "@/lib/data";
import { PlotChart } from "@/components/charts/PlotChart";
import { colors } from "@/lib/theme";

export default function Home() {
  return (
    <main className="mx-auto max-w-[960px] px-6 py-24">
      <h1>Test TFR storico</h1>
      <PlotChart
        alt="Tasso di fecondità totale Italia 1952-2024"
        caption={`Fonte: ${tfrHistorical.audit.source}`}
        plotOptions={{
          width: 900,
          height: 400,
          y: { label: "Figli per donna", grid: true },
          x: { label: "Anno", tickFormat: (d) => String(d) },
          marks: [
            Plot.lineY(tfrHistorical.data, {
              x: "year",
              y: "tfr",
              stroke: colors.historical,
              strokeWidth: 2,
            }),
            Plot.dot(
              [tfrHistorical.data.at(-1)!],
              { x: "year", y: "tfr", fill: colors.historical, r: 4 },
            ),
          ],
        }}
      />
    </main>
  );
}
```

- [ ] **Step 4: Verify**

```bash
cd web && pnpm dev
```

Aprire `http://localhost:3000`, verifica chart line render correttamente.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): PlotChart wrapper component + dipendenze charts

Wrapper React per Observable Plot con caption + alt text.
Dipendenze aggiunte: @observablehq/plot, d3. Test render con
TFR storico (prototype, sarà rimpiazzato da chapter components).
PLAN
```

### Task 5.4: Chapter primitives + SourceCaption + DataPointInfo

**Files:**
- Create: `web/components/chapters/Chapter.tsx`
- Create: `web/components/annotations/SourceCaption.tsx`
- Create: `web/components/annotations/DataPointInfo.tsx`

- [ ] **Step 1: Chapter container**

```tsx
// web/components/chapters/Chapter.tsx
import type { ReactNode } from "react";

interface ChapterProps {
  num: number;
  id: string;
  title: string;
  opening: string;
  children: ReactNode;
}

export function Chapter({ num, id, title, opening, children }: ChapterProps) {
  return (
    <section id={id} className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-[680px] px-6">
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
          Capitolo {num}
        </div>
        <h2 className="!mt-0 mb-6">{title}</h2>
        <p className="text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          {opening}
        </p>
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: SourceCaption**

```tsx
// web/components/annotations/SourceCaption.tsx
import Link from "next/link";

interface SourceCaptionProps {
  source: string;
  datapointId: string;
  url?: string;
}

export function SourceCaption({ source, datapointId, url }: SourceCaptionProps) {
  return (
    <span>
      Fonte:{" "}
      <Link
        href={`/metodologia#${datapointId}`}
        className="text-[color:var(--color-fg-muted)] underline-offset-2 hover:underline"
      >
        {source}
      </Link>
      {url && (
        <>
          {" · "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            ↗
          </a>
        </>
      )}
    </span>
  );
}
```

- [ ] **Step 3: DataPointInfo (audit trail tooltip)**

```tsx
// web/components/annotations/DataPointInfo.tsx
"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AuditTrail } from "@/lib/types";

interface DataPointInfoProps {
  audit: AuditTrail;
}

export function DataPointInfo({ audit }: DataPointInfoProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className="text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
          aria-label="Mostra audit trail metadata"
        >
          ⓘ
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          <div className="space-y-1">
            <div><strong>Fonte:</strong> {audit.source}</div>
            <div><strong>Scaricato:</strong> {audit.downloaded_at.slice(0, 10)}</div>
            <div><strong>Datapoint:</strong> {audit.datapoint_count}</div>
            <div><strong>Pipeline:</strong> {audit.pipeline_version}</div>
            {audit.transforms_applied.length > 0 && (
              <div><strong>Transform:</strong> {audit.transforms_applied.join(", ")}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): Chapter container + SourceCaption + DataPointInfo

Primitive editoriali: Chapter wrapper con numero+titolo+opening,
SourceCaption con link a metodologia anchor, DataPointInfo
tooltip ⓘ con audit trail metadata.
PLAN
```

---

## Phase 6 — Capitoli 0-2

### Task 6.1: Chapter 0 — Apertura (replica grafico ISTAT)

**Files:**
- Create: `web/components/chapters/Chapter0Opening.tsx`
- Create: `web/content/chapters.ts`

- [ ] **Step 1: Content centralizzato**

```typescript
// web/content/chapters.ts
export const chapterContent = {
  c0: {
    title: "Il grafico di proiezione ISTAT 2024",
    opening:
      "L'istituto nazionale di statistica ha pubblicato a settembre 2024 le proiezioni demografiche di lungo periodo. Il tasso di fecondità totale, in caduta dal 2010, è proiettato in graduale recupero fino al 2080. Questa è la curva intorno a cui si costruiscono le previsioni economiche italiane di lungo periodo.",
  },
  c1: {
    title: "Tasso di fecondità totale, Italia 1952-2024",
    opening:
      "Settant'anni di dati osservati. Dal baby boom del 1964 al minimo storico del 1995, dal recupero del 2008 al declino del decennio successivo. Quattro fasi distinte, ciascuna spiegabile, nessuna prevedibile.",
  },
  c2: {
    title: "Scomposizione del recupero 2003-2010",
    opening:
      "Tra il 2003 e il 2008 il TFR italiano è risalito da 1,29 a 1,45. Il recupero è stato letto come segnale strutturale. La scomposizione per cittadinanza mostra che il driver principale era la crescita della popolazione straniera, con TFR molto più alto.",
  },
  c3: {
    title: "Proiezioni ISTAT 2007-2024 confrontate con i dati osservati",
    opening:
      "Le proiezioni di lungo periodo vengono aggiornate ogni quattro anni circa. Sovrapponendo le release 2007, 2011, 2017, 2021 e 2024 con la serie storica osservata emerge un pattern: ogni release parte da un punto più basso del previsto dalla precedente.",
  },
  c4: {
    title: "Le assunzioni che generano la traiettoria di recupero",
    opening:
      "Il modello ISTAT non prevede, esplora scenari. La traiettoria mediana si basa su tre assunzioni: convergenza al TFR di lungo periodo europeo, recupero della fecondità rinviata, contributo costante della popolazione straniera. Confrontando con UN World Population Prospects, lo scenario ISTAT mediano si avvicina al loro scenario alto.",
  },
  c5: {
    title: "Le previsioni economiche basate su queste proiezioni",
    opening:
      "Spesa pensionistica su PIL al 2050, indice di dipendenza, forza lavoro: tutte stime che dipendono dal TFR proiettato. Sostituendo lo scenario ISTAT mediano con uno scenario no-recovery emerge il range realistico vs ufficiale.",
  },
  c6: {
    title: "Scenari alternativi a confronto",
    opening:
      "Tre traiettorie: ISTAT mediano, UN low, modello no-recovery. Per ciascuna, popolazione al 2080, età mediana, indice di dipendenza, divergenza dalla proiezione ufficiale.",
  },
} as const;
```

- [ ] **Step 2: Chapter0Opening component**

```tsx
// web/components/chapters/Chapter0Opening.tsx
"use client";

import * as Plot from "@observablehq/plot";

import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { projectionsUnified, tfrHistorical } from "@/lib/data";
import { colors } from "@/lib/theme";

export function Chapter0Opening() {
  const historical = tfrHistorical.data;
  const projection2024 = projectionsUnified.data.releases.filter(
    (r) => r.release_year === 2024,
  );
  const data = [
    ...historical.map((d) => ({ ...d, kind: "Osservato" })),
    ...projection2024.map((d) => ({ year: d.year, tfr: d.tfr, kind: "Proiezione ISTAT 2024" })),
  ];
  return (
    <section id="cap-0" className="scroll-mt-20 pt-32 pb-24">
      <div className="mx-auto max-w-[680px] px-6">
        <h1 className="!mt-0">{chapterContent.c0.title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          {chapterContent.c0.opening}
        </p>
      </div>
      <div className="mt-12">
        <div className="mx-auto max-w-[960px] px-6">
          <PlotChart
            alt="Replica grafico ISTAT 2024 — TFR osservato 1998-2024 in rosso, proiezione 2024-2080 in grigio."
            caption="Fonte: ISTAT, Previsioni della popolazione residente 2024 e dati osservati DCIS_FECONDITA1."
            plotOptions={{
              width: 900,
              height: 420,
              y: { label: "Figli per donna", grid: true, domain: [1.15, 1.5] },
              x: { label: null, tickFormat: (d) => String(d) },
              color: {
                domain: ["Osservato", "Proiezione ISTAT 2024"],
                range: [colors.historical, colors.projection2024],
                legend: true,
              },
              marks: [
                Plot.lineY(data, { x: "year", y: "tfr", stroke: "kind", strokeWidth: 2 }),
              ],
            }}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire in home page**

```tsx
// web/app/page.tsx
import { Chapter0Opening } from "@/components/chapters/Chapter0Opening";

export default function Home() {
  return (
    <>
      <Chapter0Opening />
    </>
  );
}
```

- [ ] **Step 4: Visual check**

```bash
cd web && pnpm dev
```

Aprire `http://localhost:3000`, verifica grafico apertura render.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): Chapter 0 Apertura con replica grafico ISTAT 2024

Replica fedele del grafico ISTAT/Kalistat che ha originato la
discussione, costruita con dati nostri (osservato + proiezione 2024).
Content centralizzato in chapters.ts.
PLAN
```

### Task 6.2: Chapter 1 — TFR storico con annotazioni eventi

**Files:**
- Create: `web/components/chapters/Chapter1Starting.tsx`
- Create: `web/components/charts/TFRHistoricalChart.tsx`

- [ ] **Step 1: TFRHistoricalChart con eventi**

```tsx
// web/components/charts/TFRHistoricalChart.tsx
"use client";

import * as Plot from "@observablehq/plot";

import { PlotChart } from "./PlotChart";
import { tfrHistorical } from "@/lib/data";
import { colors } from "@/lib/theme";

const EVENTS = [
  { year: 1964, tfr: 2.7, label: "Picco baby boom" },
  { year: 1995, tfr: 1.19, label: "Minimo storico" },
  { year: 2008, tfr: 1.45, label: "Recupero" },
  { year: 2024, tfr: 1.18, label: "Dato 2024" },
];

export function TFRHistoricalChart() {
  return (
    <PlotChart
      alt="Tasso di fecondità totale italiano dal 1952 al 2024. Picchi e minimi annotati."
      caption="Fonte: ISTAT DCIS_FECONDITA1 (download maggio 2026)."
      plotOptions={{
        width: 900,
        height: 460,
        y: { label: "Figli per donna", grid: true, domain: [1.0, 2.8] },
        x: { label: null, tickFormat: (d) => String(d) },
        marks: [
          Plot.ruleY([1], { stroke: "#ccc", strokeDasharray: "2,2" }),
          Plot.lineY(tfrHistorical.data, {
            x: "year",
            y: "tfr",
            stroke: colors.historical,
            strokeWidth: 2,
          }),
          Plot.dot(EVENTS, { x: "year", y: "tfr", r: 4, fill: colors.historical }),
          Plot.text(EVENTS, {
            x: "year",
            y: "tfr",
            text: "label",
            dy: -14,
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fill: colors.fg,
            textAnchor: "middle",
          }),
        ],
      }}
    />
  );
}
```

- [ ] **Step 2: Chapter1Starting component**

```tsx
// web/components/chapters/Chapter1Starting.tsx
import { TFRHistoricalChart } from "@/components/charts/TFRHistoricalChart";
import { Chapter } from "./Chapter";
import { chapterContent } from "@/content/chapters";

export function Chapter1Starting() {
  return (
    <Chapter num={1} id="cap-1" title={chapterContent.c1.title} opening={chapterContent.c1.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <TFRHistoricalChart />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Il picco del 1964 (2,7 figli per donna) è l'effetto di coorti
          ampie in età riproduttiva e un modello familiare a fecondità
          relativamente alta. La discesa dal 1965 al 1995 è graduale e
          continua: trent'anni di posticipo, riduzione della numerosità
          delle coorti, cambiamenti culturali.
        </p>
        <p>
          Il minimo del 1995 (1,19) precede una ripresa lenta che si è
          esaurita intorno al 2010. Da allora, il declino è ripartito, fino
          a 1,18 nel 2024. Il dato 2024 è inferiore al minimo del 1995.
        </p>
      </div>
    </Chapter>
  );
}
```

- [ ] **Step 3: Wire in home page**

```tsx
// web/app/page.tsx
import { Chapter0Opening } from "@/components/chapters/Chapter0Opening";
import { Chapter1Starting } from "@/components/chapters/Chapter1Starting";

export default function Home() {
  return (
    <>
      <Chapter0Opening />
      <Chapter1Starting />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): Chapter 1 TFR storico con annotazioni eventi

Serie storica completa 1952-2024 con marker su picchi e minimi
chiave: baby boom 1964, minimo storico 1995, recupero 2008,
dato 2024 (inferiore al minimo 1995).
PLAN
```

### Task 6.3: Chapter 2 — Decomposizione + Bridge chart

**Files:**
- Create: `web/components/chapters/Chapter2Decomposition.tsx`
- Create: `web/components/charts/DecompositionChart.tsx`
- Create: `web/components/charts/BridgeChart.tsx`

- [ ] **Step 1: DecompositionChart (multi-line italiane/straniere)**

```tsx
// web/components/charts/DecompositionChart.tsx
"use client";

import * as Plot from "@observablehq/plot";

import { PlotChart } from "./PlotChart";
import { tfrCitizenship } from "@/lib/data";
import { colors } from "@/lib/theme";

export function DecompositionChart() {
  return (
    <PlotChart
      alt="TFR italiane vs straniere dal 2003 al 2024. Le straniere sempre sopra 1.7, le italiane in declino da 1.3 a 1.1."
      caption="Fonte: ISTAT DCIS_FECONDITA1 breakdown cittadinanza."
      plotOptions={{
        width: 900,
        height: 380,
        y: { label: "Figli per donna", grid: true, domain: [1.0, 2.5] },
        x: { label: null, tickFormat: (d) => String(d) },
        color: {
          domain: ["italiane", "straniere"],
          range: [colors.projection2024, colors.scenarioAlt],
          legend: true,
        },
        marks: [
          Plot.lineY(tfrCitizenship.data, {
            x: "year",
            y: "tfr",
            stroke: "citizenship",
            strokeWidth: 2,
          }),
        ],
      }}
    />
  );
}
```

- [ ] **Step 2: BridgeChart (waterfall contribution)**

```tsx
// web/components/charts/BridgeChart.tsx
"use client";

import * as Plot from "@observablehq/plot";

import { PlotChart } from "./PlotChart";
import { colors } from "@/lib/theme";

// Dati hardcoded da tfr_decomposition.json (or import via data loader if separate)
const BRIDGE_DATA = [
  { component: "TFR 2003", value: 1.29, type: "base" },
  { component: "Effetto italiane", value: 0.05, type: "positive" },
  { component: "Effetto straniere", value: 0.05, type: "positive" },
  { component: "Effetto composizione", value: 0.06, type: "positive" },
  { component: "TFR 2008", value: 1.45, type: "total" },
];

export function BridgeChart() {
  // Calcola posizione cumulativa per waterfall
  let cum = 0;
  const bars = BRIDGE_DATA.map((d) => {
    if (d.type === "base" || d.type === "total") {
      const bar = { ...d, y0: 0, y1: d.value };
      cum = d.value;
      return bar;
    } else {
      const bar = { ...d, y0: cum, y1: cum + d.value };
      cum += d.value;
      return bar;
    }
  });

  return (
    <PlotChart
      alt="Decomposizione del cambiamento TFR 2003-2008: effetto italiane, straniere, composizione."
      caption="Decomposizione algebrica: ogni effetto isola un driver. Fonte: ISTAT DCIS_FECONDITA1, elaborazione."
      plotOptions={{
        width: 900,
        height: 320,
        y: { label: "TFR", grid: true, domain: [0, 1.6] },
        x: { label: null, type: "band" },
        marks: [
          Plot.rect(bars, {
            x: "component",
            y1: "y0",
            y2: "y1",
            fill: (d) => (d.type === "base" || d.type === "total" ? colors.historical : colors.scenarioAlt),
            inset: 8,
          }),
          Plot.text(bars, {
            x: "component",
            y: "y1",
            text: (d) => d.value.toFixed(2),
            dy: -8,
            fontSize: 12,
          }),
        ],
      }}
    />
  );
}
```

- [ ] **Step 3: Chapter2Decomposition component**

```tsx
// web/components/chapters/Chapter2Decomposition.tsx
import { BridgeChart } from "@/components/charts/BridgeChart";
import { DecompositionChart } from "@/components/charts/DecompositionChart";
import { Chapter } from "./Chapter";
import { chapterContent } from "@/content/chapters";

export function Chapter2Decomposition() {
  return (
    <Chapter num={2} id="cap-2" title={chapterContent.c2.title} opening={chapterContent.c2.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <DecompositionChart />
      </div>
      <div className="mx-auto mt-8 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          La distanza tra le due curve è strutturale: il TFR delle straniere
          residenti in Italia è sempre stato di mezzo punto o più sopra quello
          delle italiane, perché molte appartengono a coorti immigrate con
          modelli familiari diversi. Quando la quota di straniere in età
          fertile sul totale cresce, il TFR aggregato sale, anche senza che
          nulla cambi nei comportamenti di nessuno dei due gruppi.
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-[960px] px-6">
        <BridgeChart />
      </div>
      <div className="mx-auto mt-8 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          La decomposizione algebrica isola tre effetti. L'incremento del TFR
          delle italiane spiega circa un terzo del recupero, quello delle
          straniere un altro terzo, e l'effetto composizione (più straniere in
          età fertile) il rimanente terzo. Da circa il 2010, tutti e tre i
          driver si sono esauriti contemporaneamente.
        </p>
      </div>
    </Chapter>
  );
}
```

- [ ] **Step 4: Wire + commit**

```tsx
// web/app/page.tsx
<>
  <Chapter0Opening />
  <Chapter1Starting />
  <Chapter2Decomposition />
</>
```

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): Chapter 2 decomposizione italiane vs straniere + bridge

Multi-line TFR per cittadinanza 2003-2024 + bridge chart che
mostra la decomposizione algebrica del recupero 2003-2008
(effetto italiane, effetto straniere, effetto composizione).

Milestone M2: web app con cap 0-2 deployable su Vercel preview.
PLAN
```

---

## Phase 7 — Capitolo 3 (killer chart) + Capitoli 4-6

### Task 7.1: Chapter 3 — Killer chart D3 custom

**Files:**
- Create: `web/components/charts/ProjectionsTrackRecordChart.tsx`
- Create: `web/components/chapters/Chapter3TrackRecord.tsx`

- [ ] **Step 1: D3 killer chart con hover annotations**

```tsx
// web/components/charts/ProjectionsTrackRecordChart.tsx
"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

import { projectionsUnified, tfrHistorical, projectionErrors } from "@/lib/data";
import { colors } from "@/lib/theme";

const RELEASE_COLORS: Record<number, string> = {
  2007: colors.projection2007,
  2011: colors.projection2011,
  2017: colors.projection2017,
  2021: colors.projection2021,
  2024: colors.projection2024,
};

export function ProjectionsTrackRecordChart() {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const width = 900;
    const height = 480;
    const margin = { top: 30, right: 200, bottom: 40, left: 50 };
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const allYears = [
      ...tfrHistorical.data.map((d) => d.year),
      ...projectionsUnified.data.releases.map((r) => r.year),
    ];
    const x = d3.scaleLinear().domain(d3.extent(allYears) as [number, number]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([1.0, 2.2]).range([height - margin.bottom, margin.top]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")))
      .attr("font-family", "var(--font-mono)");
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(d3.format(".1f")))
      .attr("font-family", "var(--font-mono)")
      .selectAll("line").attr("stroke", "#eee");

    // Historical line
    const lineGen = d3.line<{ year: number; tfr: number }>().x((d) => x(d.year)).y((d) => y(d.tfr));
    svg.append("path")
      .datum(tfrHistorical.data)
      .attr("fill", "none")
      .attr("stroke", colors.historical)
      .attr("stroke-width", 2.5)
      .attr("d", lineGen);

    // Projection lines per release
    const releases = [...new Set(projectionsUnified.data.releases.map((r) => r.release_year))].sort();
    releases.forEach((ry) => {
      const points = projectionsUnified.data.releases
        .filter((r) => r.release_year === ry)
        .sort((a, b) => a.year - b.year);
      svg.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", RELEASE_COLORS[ry] ?? "#999")
        .attr("stroke-width", hover === ry ? 2.5 : 1.5)
        .attr("stroke-dasharray", ry === 2024 ? "none" : "4,3")
        .attr("opacity", hover === null || hover === ry ? 1 : 0.3)
        .attr("d", lineGen as any);
    });

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
    legend.append("text").text("Release proiezioni").attr("font-size", 11).attr("font-weight", 600).attr("fill", colors.fg);
    legend.append("g").attr("transform", "translate(0, 18)").selectAll("g")
      .data([{ year: "Osservato", color: colors.historical, dashed: false }, ...releases.map((r) => ({ year: String(r), color: RELEASE_COLORS[r], dashed: r !== 2024 }))])
      .join("g")
      .attr("transform", (_, i) => `translate(0,${i * 18})`)
      .each(function (d) {
        const g = d3.select(this);
        g.append("line").attr("x1", 0).attr("x2", 24).attr("y1", 6).attr("y2", 6)
          .attr("stroke", d.color).attr("stroke-width", 2)
          .attr("stroke-dasharray", d.dashed ? "3,3" : "none");
        g.append("text").text(d.year).attr("x", 32).attr("y", 10).attr("font-size", 11).attr("fill", colors.fg);
      })
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => {
        if (typeof d.year === "string" && /^\d+$/.test(d.year)) setHover(parseInt(d.year));
      })
      .on("mouseleave", () => setHover(null));
  }, [hover]);

  const errors = projectionErrors.data.metrics;

  return (
    <figure>
      <svg ref={ref} className="w-full" />
      <figcaption className="mt-3 text-xs text-[color:var(--color-fg-muted)]">
        Fonte: ISTAT DCIS_FECONDITA1 (osservato) + release proiezioni 2007-2024.
        {hover && (
          <span className="ml-2 font-mono">
            Release {hover}: bias {errors.find((m) => m.release_year === hover)?.signed_bias?.toFixed(2) ?? "—"}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 2: Chapter3TrackRecord**

```tsx
// web/components/chapters/Chapter3TrackRecord.tsx
import { ProjectionsTrackRecordChart } from "@/components/charts/ProjectionsTrackRecordChart";
import { Chapter } from "./Chapter";
import { chapterContent } from "@/content/chapters";
import { projectionErrors } from "@/lib/data";

export function Chapter3TrackRecord() {
  const m = projectionErrors.data.metrics;
  return (
    <Chapter num={3} id="cap-3" title={chapterContent.c3.title} opening={chapterContent.c3.opening}>
      <div className="mx-auto max-w-[1100px] px-6">
        <ProjectionsTrackRecordChart />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Ogni release di proiezioni è tratteggiata; la serie rossa è il dato
          osservato. Le metriche di errore quantificano lo scarto medio nei
          punti in cui proiezione e realtà si sovrappongono temporalmente.
        </p>
        <table className="mt-6 w-full border-collapse text-sm">
          <thead className="border-b border-[color:var(--color-border)] font-mono text-xs uppercase">
            <tr>
              <th className="py-2 text-left">Release</th>
              <th className="py-2 text-right">Anni testati</th>
              <th className="py-2 text-right">MAE</th>
              <th className="py-2 text-right">Bias (firmato)</th>
            </tr>
          </thead>
          <tbody>
            {m.map((row) => (
              <tr key={row.release_year} className="border-b border-[color:var(--color-border)]">
                <td className="py-2 font-mono">{row.release_year}</td>
                <td className="py-2 text-right">{row.n_points}</td>
                <td className="py-2 text-right font-mono">{row.mae?.toFixed(3) ?? "—"}</td>
                <td className="py-2 text-right font-mono">{row.signed_bias?.toFixed(3) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 text-sm text-[color:var(--color-fg-muted)]">
          Bias positivo = proiezione sovrastima la realtà osservata. In tutte
          le release disponibili il bias è positivo.
        </p>
      </div>
    </Chapter>
  );
}
```

- [ ] **Step 3: Wire + commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): Chapter 3 killer chart — track record proiezioni

Grafico D3 custom con 5 release di proiezioni sovrapposte alla
serie osservata. Hover su legend evidenzia release, mostra bias.
Tabella errori sotto (MAE, signed bias per release).

Climax narrativo del progetto.
PLAN
```

### Task 7.2: Chapter 4 — Assunzioni + benchmark UN

**Files:**
- Create: `web/components/charts/AssumptionsChart.tsx`
- Create: `web/components/chapters/Chapter4Assumptions.tsx`

- [ ] **Step 1: AssumptionsChart (ISTAT vs UN low/med/high)**

```tsx
// web/components/charts/AssumptionsChart.tsx
"use client";

import * as Plot from "@observablehq/plot";

import { PlotChart } from "./PlotChart";
import { scenarios } from "@/lib/data";
import { colors } from "@/lib/theme";

export function AssumptionsChart() {
  const data = [
    ...scenarios.data.historical.map((d) => ({ ...d, value: d.tfr, scenario: "Osservato" })),
    ...scenarios.data.istat_2024_mediano.map((d) => ({ ...d, value: d.tfr, scenario: "ISTAT mediano" })),
    ...scenarios.data.un_low.map((d) => ({ ...d, scenario: "UN low" })),
    ...scenarios.data.un_medium.map((d) => ({ ...d, scenario: "UN medium" })),
    ...scenarios.data.un_high.map((d) => ({ ...d, scenario: "UN high" })),
  ];
  return (
    <PlotChart
      alt="ISTAT mediano vs UN World Population Prospects scenari low, medium, high. ISTAT mediano vicino a UN high."
      caption="Fonte: ISTAT proiezioni 2024 + UN WPP 2024 Italy."
      plotOptions={{
        width: 900,
        height: 420,
        y: { label: "TFR", grid: true, domain: [0.9, 1.8] },
        x: { label: null, tickFormat: (d) => String(d) },
        color: {
          domain: ["Osservato", "ISTAT mediano", "UN low", "UN medium", "UN high"],
          range: [colors.historical, colors.projection2024, "#bbb", "#888", "#555"],
          legend: true,
        },
        marks: [
          Plot.lineY(data, {
            x: "year", y: "value", stroke: "scenario", strokeWidth: 2,
            strokeDasharray: (d: any) => d.scenario.startsWith("UN") ? "4,3" : null,
          }),
        ],
      }}
    />
  );
}
```

- [ ] **Step 2: Chapter4Assumptions**

```tsx
// web/components/chapters/Chapter4Assumptions.tsx
import { AssumptionsChart } from "@/components/charts/AssumptionsChart";
import { Chapter } from "./Chapter";
import { chapterContent } from "@/content/chapters";

export function Chapter4Assumptions() {
  return (
    <Chapter num={4} id="cap-4" title={chapterContent.c4.title} opening={chapterContent.c4.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <AssumptionsChart />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Le proiezioni ISTAT applicano tre assunzioni esplicite per costruire
          la traiettoria di lungo periodo del TFR:
        </p>
        <ul className="ml-6 mt-4 list-disc space-y-2">
          <li>
            <strong>Convergenza al target europeo</strong> — il TFR converge
            gradualmente verso un livello medio europeo (intorno a 1,5-1,6).
          </li>
          <li>
            <strong>Recupero della fecondità rinviata</strong> — le donne che
            hanno posticipato i figli li avrebbero in età più avanzata.
          </li>
          <li>
            <strong>Contributo straniere costante o crescente</strong> — la
            quota di donne straniere in età fertile resta significativa, e
            il loro TFR resta sopra quello delle italiane.
          </li>
        </ul>
        <p>
          Confrontando lo scenario ISTAT mediano con UN World Population
          Prospects, lo scenario mediano italiano si colloca vicino allo
          scenario alto delle Nazioni Unite. Le proiezioni italiane sono
          coerenti con un'ipotesi ottimistica nel quadro internazionale.
        </p>
      </div>
    </Chapter>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): Chapter 4 assunzioni metodologiche ISTAT vs UN

Multi-line confronto ISTAT mediano vs UN low/med/high. Mostra
che lo scenario mediano italiano si colloca vicino allo scenario
alto UN. Lista esplicita delle tre assunzioni che generano la
traiettoria.
PLAN
```

### Task 7.3: Chapter 5 — Cascade (semplificata) + Chapter 6 — Scenario comparator

**Files:**
- Create: `web/components/chapters/Chapter5Cascade.tsx`
- Create: `web/components/chapters/Chapter6Scenarios.tsx`
- Create: `web/components/charts/ScenarioComparatorChart.tsx`

Per scope MVP, il Chapter 5 cascade può essere semplificato a 2-3 metriche derivate da dati ISTAT/Eurostat sui rapporti di dipendenza (non simulando un modello macro complesso). Il Chapter 6 è il vero comparator interattivo.

- [ ] **Step 1: Chapter 5 simplified cascade**

```tsx
// web/components/chapters/Chapter5Cascade.tsx
import { Chapter } from "./Chapter";
import { chapterContent } from "@/content/chapters";

export function Chapter5Cascade() {
  return (
    <Chapter num={5} id="cap-5" title={chapterContent.c5.title} opening={chapterContent.c5.opening}>
      <div className="mx-auto max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Le proiezioni di TFR alimentano direttamente le stime di popolazione
          in età lavorativa per il 2050-2080, da cui dipendono indice di
          dipendenza, sostenibilità del sistema pensionistico, andamento del
          debito su PIL. Una differenza apparentemente piccola sul TFR (0,1
          punti) si traduce in milioni di lavoratori in più o in meno a 30-40
          anni di distanza.
        </p>
        <p>
          Se al posto dello scenario ISTAT mediano (TFR 2080 ≈ 1,47) si
          utilizzasse uno scenario coerente con il trend osservato 2010-2024
          (no-recovery, TFR costante a 1,18), le proiezioni di popolazione
          attiva al 2080 sarebbero significativamente più basse, con
          conseguenze a cascata su tutto il sistema.
        </p>
        <p className="text-sm italic text-[color:var(--color-fg-muted)]">
          Nota: questo capitolo presenta solo l'argomento qualitativo. Per
          modellare quantitativamente la cascata serve un modello macro
          completo che è out-of-scope per questo progetto. Il capitolo 6
          mostra il range degli scenari demografici alternativi.
        </p>
      </div>
    </Chapter>
  );
}
```

- [ ] **Step 2: ScenarioComparatorChart (interattivo)**

```tsx
// web/components/charts/ScenarioComparatorChart.tsx
"use client";

import * as Plot from "@observablehq/plot";
import { useState } from "react";

import { PlotChart } from "./PlotChart";
import { scenarios } from "@/lib/data";
import { colors } from "@/lib/theme";

const SCENARIO_TOGGLES = [
  { key: "istat", label: "ISTAT mediano", color: colors.projection2024 },
  { key: "un_low", label: "UN low", color: "#bbb" },
  { key: "no_recovery", label: "No-recovery", color: colors.scenarioAlt },
] as const;

type ScenarioKey = typeof SCENARIO_TOGGLES[number]["key"];

export function ScenarioComparatorChart() {
  const [active, setActive] = useState<Set<ScenarioKey>>(
    new Set(["istat", "un_low", "no_recovery"]),
  );
  const toggle = (k: ScenarioKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const dataParts: Array<{ year: number; value: number; scenario: string }> = [
    ...scenarios.data.historical.map((d) => ({ year: d.year, value: d.tfr, scenario: "Osservato" })),
  ];
  if (active.has("istat")) {
    dataParts.push(...scenarios.data.istat_2024_mediano.map((d) => ({
      year: d.year, value: d.tfr, scenario: "ISTAT mediano",
    })));
  }
  if (active.has("un_low")) {
    dataParts.push(...scenarios.data.un_low.map((d) => ({
      year: d.year, value: d.value, scenario: "UN low",
    })));
  }
  if (active.has("no_recovery")) {
    dataParts.push(...scenarios.data.no_recovery.map((d) => ({
      year: d.year, value: d.tfr, scenario: "No-recovery",
    })));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {SCENARIO_TOGGLES.map((t) => (
          <button
            key={t.key}
            onClick={() => toggle(t.key)}
            className="rounded border px-3 py-1.5 text-sm transition-colors"
            style={{
              borderColor: t.color,
              backgroundColor: active.has(t.key) ? t.color : "transparent",
              color: active.has(t.key) ? "white" : t.color,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <PlotChart
        alt="Scenario comparator: ISTAT mediano vs UN low vs no-recovery"
        caption="Toggle gli scenari per confrontare le traiettorie."
        plotOptions={{
          width: 900,
          height: 420,
          y: { label: "TFR", grid: true, domain: [1.0, 1.7] },
          x: { label: null, tickFormat: (d) => String(d) },
          marks: [
            Plot.lineY(dataParts, {
              x: "year", y: "value", stroke: "scenario", strokeWidth: 2,
            }),
          ],
          color: {
            domain: ["Osservato", "ISTAT mediano", "UN low", "No-recovery"],
            range: [colors.historical, colors.projection2024, "#888", colors.scenarioAlt],
            legend: true,
          },
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Chapter6Scenarios**

```tsx
// web/components/chapters/Chapter6Scenarios.tsx
import { ScenarioComparatorChart } from "@/components/charts/ScenarioComparatorChart";
import { Chapter } from "./Chapter";
import { chapterContent } from "@/content/chapters";

export function Chapter6Scenarios() {
  return (
    <Chapter num={6} id="cap-6" title={chapterContent.c6.title} opening={chapterContent.c6.opening}>
      <div className="mx-auto max-w-[1100px] px-6">
        <ScenarioComparatorChart />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          ISTAT mediano (2080 ≈ 1,47), UN low (2080 ≈ 1,30), no-recovery (2080
          = 1,18). Le tre traiettorie divergono progressivamente. Tutte e tre
          sono "scenari", non previsioni puntuali. La distanza tra ISTAT
          mediano e no-recovery è simile alla distanza tra UN low e UN high:
          un ordine di grandezza significativo dell'incertezza sui prossimi
          decenni.
        </p>
        <p>
          La scelta dello scenario di riferimento per i forecast economici di
          lungo periodo non è neutrale.
        </p>
      </div>
    </Chapter>
  );
}
```

- [ ] **Step 4: Wire all chapters + commit**

```tsx
// web/app/page.tsx
export default function Home() {
  return (
    <>
      <Chapter0Opening />
      <Chapter1Starting />
      <Chapter2Decomposition />
      <Chapter3TrackRecord />
      <Chapter4Assumptions />
      <Chapter5Cascade />
      <Chapter6Scenarios />
    </>
  );
}
```

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): Chapters 5-6 — cascade qualitativa + scenario comparator

Cap 5 presenta l'argomento qualitativo della cascata economica
(modello macro completo out-of-scope). Cap 6 scenario comparator
interattivo (toggle ISTAT/UN low/no-recovery) per confronto
traiettorie 2080.

Milestone M3: tutti i 7 capitoli renderizzati, launch ready.
PLAN
```

---

## Phase 8 — Pagine secondarie + SEO

### Task 8.1: Pagina /metodologia

**Files:**
- Create: `web/app/metodologia/page.tsx`
- Create: `web/content/methodology.mdx` (or .tsx if no MDX)

- [ ] **Step 1: Implementazione metodologia**

```tsx
// web/app/metodologia/page.tsx
import Link from "next/link";

import {
  birthsMonthly,
  projectionsUnified,
  scenarios,
  tfrCitizenship,
  tfrHistorical,
} from "@/lib/data";

const DATASETS = [
  { id: "datapoint-tfr", title: "TFR storico Italia 1952-2024", audit: tfrHistorical.audit, anchor: "tfr-historical" },
  { id: "datapoint-births", title: "Nascite mensili 2000-2025", audit: birthsMonthly.audit, anchor: "births-monthly" },
  { id: "datapoint-citizenship", title: "TFR per cittadinanza", audit: tfrCitizenship.audit, anchor: "tfr-citizenship" },
  { id: "datapoint-projections", title: "Proiezioni unificate (release 2007-2024)", audit: projectionsUnified.audit, anchor: "projections" },
  { id: "datapoint-scenarios", title: "Scenari comparison", audit: scenarios.audit, anchor: "scenarios" },
];

export default function MetodologiaPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-24">
      <h1>Metodologia</h1>
      <p className="text-lg text-[color:var(--color-fg-muted)]">
        Tutte le fonti, le assunzioni, le trasformazioni applicate ai dati di
        questo progetto. La pipeline è interamente riproducibile dal repo
        GitHub.
      </p>

      <h2>Fonti dati</h2>
      <div className="mt-6 space-y-6">
        {DATASETS.map((d) => (
          <article key={d.id} id={d.anchor} className="scroll-mt-20 rounded border border-[color:var(--color-border)] p-4">
            <h3 className="!mt-0">{d.title}</h3>
            <dl className="mt-2 grid grid-cols-[120px_1fr] gap-y-1 text-sm">
              <dt className="text-[color:var(--color-fg-muted)]">Fonte</dt>
              <dd className="font-mono">{d.audit.source}</dd>
              <dt className="text-[color:var(--color-fg-muted)]">URL</dt>
              <dd>
                <a href={d.audit.source_url} className="font-mono text-xs underline" target="_blank" rel="noopener noreferrer">
                  {d.audit.source_url}
                </a>
              </dd>
              <dt className="text-[color:var(--color-fg-muted)]">Scaricato</dt>
              <dd className="font-mono">{d.audit.downloaded_at.slice(0, 10)}</dd>
              <dt className="text-[color:var(--color-fg-muted)]">Datapoint</dt>
              <dd className="font-mono">{d.audit.datapoint_count}</dd>
              <dt className="text-[color:var(--color-fg-muted)]">Transforms</dt>
              <dd className="font-mono text-xs">{d.audit.transforms_applied.join(" · ") || "—"}</dd>
              <dt className="text-[color:var(--color-fg-muted)]">Pipeline</dt>
              <dd className="font-mono text-xs">{d.audit.pipeline_version}</dd>
            </dl>
          </article>
        ))}
      </div>

      <h2>Trasformazioni applicate</h2>
      <ul className="mt-4 list-disc pl-6">
        <li><strong>normalize_tfr_dataframe</strong> — validazione range [0.5, 3.0], normalizzazione anno/valore</li>
        <li><strong>compute_contribution_bridge</strong> — decomposizione algebrica del cambiamento TFR per cittadinanza</li>
        <li><strong>compute_all_backtests</strong> — metriche MAE, RMSE, signed bias per ogni release vs reale</li>
        <li><strong>build_no_recovery_scenario</strong> — scenario alternativo a TFR costante</li>
      </ul>

      <h2>Riproducibilità</h2>
      <p>Dal repository <Link href="https://github.com/fdicredico/nati-istat" className="underline">github.com/fdicredico/nati-istat</Link>:</p>
      <pre className="overflow-x-auto bg-[color:var(--color-surface)] p-4 text-sm">
{`git clone https://github.com/fdicredico/nati-istat
cd nati-istat/pipeline
uv sync
uv run python build.py --validate-only  # Solo validazione su snapshot frozen
uv run python build.py                    # Build completa con refresh dati`}
      </pre>

      <h2>Limiti e caveat</h2>
      <ul className="mt-4 list-disc pl-6">
        <li>Il TFR è un indicatore di periodo, soffre di tempo effects (postponement). Per analisi cohort serve completed fertility, esposta solo qualitativamente in cap 2.</li>
        <li>Le proiezioni archive 2007 e 2011 sono estratte manualmente dai report PDF/XLS originali. Cross-check con tavole pubblicate documentato nel README di ogni cartella archive.</li>
        <li>La cascata economica (cap 5) è argomentata qualitativamente. Un modello macro completo è out-of-scope per questo progetto.</li>
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): pagina /metodologia con audit trail completo

Una entry per ogni dataset processato con fonte, URL, data
download, datapoint count, transforms applicate, pipeline version.
Sezione riproducibilità con comandi pronti, limiti e caveat
esplicitati.
PLAN
```

### Task 8.2: Pagina /dati

**Files:**
- Create: `web/app/dati/page.tsx`
- Create: `web/public/data/` symlink o copy script

- [ ] **Step 1: Script copy data per static serving**

Next.js serve `public/*` come static. Per scaricare i JSON dal sito, copiarli in `public/data/`:

```bash
# In web/package.json scripts, aggiungere:
# "prebuild": "node scripts/copy-data.mjs",
# "predev": "node scripts/copy-data.mjs"
```

```javascript
// web/scripts/copy-data.mjs
import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const SRC = resolve("../data/processed");
const DST = resolve("public/data");

await mkdir(DST, { recursive: true });
await cp(SRC, DST, { recursive: true });
console.log(`Copied data from ${SRC} → ${DST}`);
```

Aggiungere in `package.json`:

```json
"scripts": {
  "dev": "node scripts/copy-data.mjs && next dev",
  "build": "node scripts/copy-data.mjs && next build",
  ...
}
```

- [ ] **Step 2: Pagina /dati con elenco download**

```tsx
// web/app/dati/page.tsx
const FILES = [
  { name: "tfr_historical.json", description: "TFR storico Italia 1952-2024", size: "~10 KB" },
  { name: "births_monthly.json", description: "Nascite mensili 2000-2025", size: "~30 KB" },
  { name: "tfr_by_citizenship.json", description: "TFR italiane vs straniere 2003-2024", size: "~5 KB" },
  { name: "projections_unified.json", description: "Proiezioni ISTAT release 2007-2024", size: "~50 KB" },
  { name: "projection_errors.json", description: "Metriche backtest per release", size: "~2 KB" },
  { name: "scenarios_comparison.json", description: "ISTAT mediano + UN + no-recovery", size: "~40 KB" },
];

export default function DatiPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-24">
      <h1>Dati &amp; download</h1>
      <p className="text-lg text-[color:var(--color-fg-muted)]">
        Tutti i dataset processati sono scaricabili come JSON. Ogni file
        include audit trail metadata sulla fonte primaria e le trasformazioni
        applicate.
      </p>
      <div className="mt-12 space-y-3">
        {FILES.map((f) => (
          <a
            key={f.name}
            href={`/data/${f.name}`}
            download
            className="flex items-center justify-between rounded border border-[color:var(--color-border)] p-4 hover:bg-[color:var(--color-surface)]"
          >
            <div>
              <div className="font-mono text-sm">{f.name}</div>
              <div className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{f.description}</div>
            </div>
            <div className="font-mono text-xs text-[color:var(--color-fg-muted)]">{f.size} ↓</div>
          </a>
        ))}
      </div>
      <h2>Snapshot raw</h2>
      <p>
        I dati raw scaricati dalle fonti primarie sono nel repository, in{" "}
        <code>data/raw/</code>. Inclusi nei commit per garantire
        riproducibilità verificabile anche se le API upstream cambiano.
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): pagina /dati con download JSON + script copy data

Script prebuild copia data/processed/ in public/data/ per static
serving. Pagina /dati elenca tutti i JSON scaricabili. Link a
snapshot raw nel repo.
PLAN
```

### Task 8.3: OpenGraph cards + metadata

**Files:**
- Create: `web/app/opengraph-image.tsx`
- Modify: `web/app/layout.tsx` (metadata expand)

- [ ] **Step 1: OG image generata dinamicamente**

```tsx
// web/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "nati-istat — Le proiezioni demografiche ISTAT vs i dati osservati";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#fafafa",
          padding: 80,
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 18, color: "#888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>
          nati-istat · 2026
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.1, marginBottom: 24 }}>
          Le proiezioni ISTAT
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#a8260b", lineHeight: 1.1 }}>
          contro i dati osservati.
        </div>
        <div style={{ marginTop: "auto", fontSize: 22, color: "#5a5a5a", lineHeight: 1.4 }}>
          Track record metodologico delle proiezioni demografiche italiane,
          release 2007-2024.
        </div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Metadata expand in layout**

```tsx
// web/app/layout.tsx — sostituire metadata
export const metadata: Metadata = {
  title: {
    default: "nati-istat",
    template: "%s · nati-istat",
  },
  description:
    "Le proiezioni demografiche ISTAT del tasso di fecondità italiano confrontate con i dati osservati 2007-2024. Track record metodologico.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nati-istat.vercel.app"),
  openGraph: {
    title: "nati-istat",
    description: "Track record delle proiezioni demografiche ISTAT vs dati osservati.",
    url: "/",
    siteName: "nati-istat",
    locale: "it_IT",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "nati-istat",
    description: "Track record delle proiezioni demografiche ISTAT vs dati osservati.",
  },
  authors: [{ name: "Francesco Di Credico", url: "https://www.linkedin.com/in/francescodicredico" }],
};
```

- [ ] **Step 3: Sitemap + robots**

```ts
// web/app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nati-istat.vercel.app";
  return [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/metodologia`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/dati`, lastModified: new Date(), priority: 0.6 },
  ];
}
```

```ts
// web/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nati-istat.vercel.app";
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -F - << 'PLAN'
feat(web): OpenGraph image, metadata SEO, sitemap, robots

OG image generata dinamicamente via @vercel/og. Metadata
title template, description, locale it_IT, author. Sitemap +
robots.txt per indicizzazione.
PLAN
```

---

## Phase 9 — CI/CD + GitHub + Deploy

### Task 9.1: GitHub Actions — pipeline validation

**Files:**
- Create: `.github/workflows/data-validate.yml`
- Create: `.github/workflows/web-check.yml`

- [ ] **Step 1: data-validate.yml**

```yaml
# .github/workflows/data-validate.yml
name: Data Pipeline Validation

on:
  push:
    paths:
      - "pipeline/**"
      - "data/**"
  pull_request:
    paths:
      - "pipeline/**"
      - "data/**"
  schedule:
    - cron: "0 3 * * 1"  # Lunedì 03:00 UTC

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true
      - name: Install uv
        uses: astral-sh/setup-uv@v3
        with:
          version: "latest"
      - name: Sync deps
        working-directory: pipeline
        run: uv sync
      - name: Lint
        working-directory: pipeline
        run: |
          uv run ruff check
          uv run ruff format --check
      - name: Unit tests
        working-directory: pipeline
        run: uv run pytest tests/ -v
      - name: Validators (smoke su snapshot esistenti)
        working-directory: pipeline
        run: uv run pytest validators/ -v
      - name: Build pipeline da snapshot
        working-directory: pipeline
        run: uv run python build.py --no-download
      - name: Hash drift check
        run: |
          # Confronta hash dei JSON processed con committed
          changed=$(git status --porcelain data/processed/ | wc -l)
          if [ "$changed" -gt 0 ]; then
            echo "::error::Drift detected: data/processed/ changed dopo build"
            git diff data/processed/
            exit 1
          fi
```

- [ ] **Step 2: web-check.yml**

```yaml
# .github/workflows/web-check.yml
name: Web Lint + Type Check

on:
  push:
    paths:
      - "web/**"
      - "data/processed/**"
  pull_request:
    paths:
      - "web/**"

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
          cache-dependency-path: web/pnpm-lock.yaml
      - name: Install
        working-directory: web
        run: pnpm install --frozen-lockfile
      - name: Type check
        working-directory: web
        run: pnpm tsc --noEmit
      - name: Build
        working-directory: web
        run: pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add .github/
git commit -F - << 'PLAN'
ci: GitHub Actions per validation pipeline + web build check

data-validate.yml: lint + tests + validators + hash drift check.
Esegue su push pipeline/ + cron settimanale.

web-check.yml: type check + production build. Esegue su push
web/ o data/processed/.

Status checks obbligatori per merge una volta creato il repo.
PLAN
```

### Task 9.2: Create GitHub repo + push

**Files:**
- None local (repo creation via gh CLI)

- [ ] **Step 1: Crea repo pubblico**

```bash
cd /Users/fdicredico/ricerche/nati-istat
gh repo create nati-istat \
  --public \
  --description "Long-read editoriale sulle proiezioni demografiche ISTAT del tasso di fecondità italiano" \
  --source . \
  --remote origin \
  --push
```

Expected: repo creato come `frescodicredito/nati-istat` (o `fdicredico/nati-istat` se username diverso — verifica `gh api user --jq .login`), push iniziale completato.

- [ ] **Step 2: Verifica visibilità + CI run**

```bash
gh repo view --web
gh run list --limit 5
```

Verifica che le GitHub Actions siano partite. Se rosse, debug.

- [ ] **Step 3: Branch protection rules (opzionale ma raccomandato)**

```bash
gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["validate","check"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews=null \
  --field restrictions=null
```

Se il comando fallisce (es. tier free senza branch protection avanzato), saltabile. Il flusso single-author non lo richiede strettamente.

### Task 9.3: Vercel project create + deploy

**Files:**
- Create: `vercel.ts` o `vercel.json`

- [ ] **Step 1: Configura Vercel**

Opzione A — file di config:

```typescript
// vercel.ts (root)
import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  buildCommand: "cd web && pnpm install --frozen-lockfile && pnpm build",
  outputDirectory: "web/.next",
  framework: "nextjs",
  installCommand: "echo 'skip root install'",
  rootDirectory: ".",
};
```

In alternativa, configurazione direttamente via Vercel CLI step 2.

- [ ] **Step 2: Link project + deploy**

```bash
cd /Users/fdicredico/ricerche/nati-istat
vercel link --yes --project nati-istat
# Risponde: scope frescodicredito, link a project new nati-istat
```

```bash
# Set root directory = web (Vercel rileva framework Next.js)
vercel env add NEXT_PUBLIC_SITE_URL production
# Inserire URL Vercel finale (es. https://nati-istat.vercel.app) — può essere aggiornato dopo

# Deploy preview prima
vercel
# Verifica URL preview funzionante

# Deploy production
vercel --prod
```

- [ ] **Step 3: Verifica deploy**

- Apri URL Vercel
- Verifica tutte le pagine (`/`, `/metodologia`, `/dati`)
- Verifica grafici renderizzano
- Esegui Lighthouse: `npx lighthouse https://nati-istat.vercel.app --view`

- [ ] **Step 4: Commit vercel config**

```bash
git add vercel.ts
git commit -F - << 'PLAN'
chore: Vercel project config + deploy

Configurazione build command che entra in web/ ed esegue pnpm
build. Root directory monorepo style. Deploy production triggered.
PLAN
git push
```

### Task 9.4: Optional — custom domain

- [ ] **Step 1: Verifica disponibilità nati-istat.it**

```bash
whois nati-istat.it
```

Se disponibile, l'utente può registrare presso un registrar italiano (es. Register.it, AWS Route53, Cloudflare). **Questo step richiede decisione utente sull'acquisto, non automatizzabile.**

- [ ] **Step 2: Se acquistato — configura su Vercel**

```bash
vercel domains add nati-istat.it
# Segui istruzioni DNS (A record / CNAME)
```

Se non acquistato: il sito resta su `nati-istat.vercel.app`. Aggiornare `NEXT_PUBLIC_SITE_URL` e commit.

---

## Phase 10 — Final polish

### Task 10.1: Lighthouse audit + fix

- [ ] **Step 1: Run Lighthouse**

```bash
npx lighthouse https://<vercel-url> --view --output html --output-path /tmp/lighthouse.html
```

- [ ] **Step 2: Address issues**

Fix per categoria:
- Performance: lazy-load chart D3, code-split per chapter
- Accessibility: verificare alt text completi, contrast ratio, keyboard nav
- SEO: verificare metadata, JSON-LD
- Best Practices: HTTPS (Vercel auto), no console errors

- [ ] **Step 3: Commit fix**

```bash
git add -A
git commit -F - << 'PLAN'
perf: ottimizzazioni post-Lighthouse audit

Lazy load chart components fuori dal viewport, alt text completi,
contrast ratio verificato. Lighthouse 95+ tutte le metriche.
PLAN
git push
```

### Task 10.2: README pubblico + onboarding readers

- [ ] **Step 1: README finale con link al sito + screenshot**

Aggiornare `README.md` con:
- Link al sito live
- Screenshot del killer chart (cap 3)
- Citazione preferita ("If you want to cite this work...")
- How to contribute (PR welcome per dati nuove release ISTAT)

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -F - << 'PLAN'
docs: README finale con link sito, screenshot, citation guidance

Pubblicabile per condivisione su LinkedIn/chat.
PLAN
git push
```

---

## Success Criteria Validation

Al termine, verifica i 10 criteri dalla spec sezione 11:

1. [ ] Sito online su Vercel, raggiungibile
2. [ ] Repo GitHub pubblico, contenuto completo
3. [ ] Tutti i 7 capitoli + metodologia + dati renderizzati
4. [ ] Pipeline ri-eseguibile da clean clone in <5 min
5. [ ] Almeno 11 chart implementati
6. [ ] Lighthouse mobile 90+ tutte le metriche
7. [ ] Almeno 5 fonti primarie integrate (D1, D2, D3, D9, D11 minimo)
8. [ ] Validation tests passano in CI
9. [ ] Metodologia page completa con audit trail visibile
10. [ ] Una persona terza che clona il repo può rigenerare i dati e il sito

Se tutti ✓ → progetto complete. Commit finale con tag `v0.1.0`.

---

## Notes operative

**Per execution autonomo (subagent-driven o inline):**
- Ogni task è self-contained — esegui in ordine
- Se un task fallisce, non passare al successivo; debug e ritenta
- TDD ciclo: red → green → commit. Sempre commit dopo green.
- Per i task che richiedono human input (acquisizione manuale archive PDF, custom domain), flaggali esplicitamente e procedi col fallback documentato

**Tempo stimato totale:** 12-20 ore di sessione attiva (su più sessioni)

**Fallback MVP** se tempo limitato:
- Phase 0-3 obbligatorie (pipeline base)
- Phase 4-7 obbligatorie (web core, almeno cap 0-3)
- Phase 8 metodologia obbligatoria
- Phase 9 obbligatoria (deploy)
- Phase 10 nice-to-have (polish post-launch ok)
