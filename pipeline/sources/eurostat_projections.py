"""Eurostat EUROPOP: release storiche di proiezioni demografiche TFT.

Dataset SDMX disponibili:
- PROJ_19NAASFR — release 2019 (base 2019, copre 2019-2100)
- PROJ_23NAASFR — release 2023 (base 2022, copre 2022-2100)
- PROJ_25NAASFR — release 2025 (base 2024, copre 2025-2100)

Strategia: per ogni release, filter age=TOTAL + projection=BSL (baseline).
Il valore è il TFT proiettato per quella release a partire dal suo anno base.

Confronto multi-release contro dato osservato = backtest empirico del bias
delle proiezioni di lungo periodo.
"""

import hashlib
import json
import logging
from datetime import UTC, datetime
from pathlib import Path

import pandas as pd
import sdmx

logger = logging.getLogger(__name__)

EUROSTAT_RELEASES = [
    {"release_year": 2019, "dataset": "PROJ_19NAASFR"},
    {"release_year": 2023, "dataset": "PROJ_23NAASFR"},
    {"release_year": 2025, "dataset": "PROJ_25NAASFR"},
]


def download_eurostat_releases(snapshot_dir: Path, *, force: bool = False) -> dict:
    """Scarica tutte le release Eurostat NAASFR per Italia, salva CSV.gz."""
    snapshot_dir.mkdir(parents=True, exist_ok=True)
    client = sdmx.Client("ESTAT")
    manifest = {}

    for rel in EUROSTAT_RELEASES:
        target = snapshot_dir / f"{rel['dataset']}.csv.gz"
        if target.exists() and not force:
            logger.info("Snapshot esistente per %s, riuso", rel["dataset"])
            manifest[rel["dataset"]] = {"filename": target.name, "cached": True}
            continue

        logger.info("Download Eurostat %s (release %s)", rel["dataset"], rel["release_year"])
        msg = client.data(rel["dataset"], key={"geo": "IT"})
        df = sdmx.to_pandas(msg).reset_index()
        df.to_csv(target, index=False)
        content = target.read_bytes()
        manifest[rel["dataset"]] = {
            "url": f"https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/{rel['dataset']}",
            "release_year": rel["release_year"],
            "sha256": hashlib.sha256(content).hexdigest(),
            "size_bytes": len(content),
            "downloaded_at": datetime.now(UTC).isoformat(),
            "rows": len(df),
        }
        logger.info("Salvato %d righe per %s", len(df), rel["dataset"])

    manifest_path = snapshot_dir / "_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


def normalize_eurostat_release(snapshot_path: Path, release_year: int) -> pd.DataFrame:
    """Estrai TFT per una release: filter age=TOTAL + projection=BSL.

    Returns DataFrame con colonne {release_year, year, tft}.
    """
    df = pd.read_csv(snapshot_path)
    df = df[(df["age"] == "TOTAL") & (df["projection"] == "BSL")].copy()
    df["year"] = pd.to_numeric(df["TIME_PERIOD"], errors="coerce").astype("Int64")
    df["tft"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna(subset=["year", "tft"])
    df["year"] = df["year"].astype(int)
    df["release_year"] = release_year
    return df.sort_values("year").reset_index(drop=True)[["release_year", "year", "tft"]]


def load_all_releases(snapshot_dir: Path) -> pd.DataFrame:
    """Carica tutte le release Eurostat e concatena."""
    parts = []
    for rel in EUROSTAT_RELEASES:
        target = snapshot_dir / f"{rel['dataset']}.csv.gz"
        if not target.exists():
            logger.warning("Snapshot %s mancante", target)
            continue
        parts.append(normalize_eurostat_release(target, rel["release_year"]))
    if not parts:
        raise FileNotFoundError(f"Nessuna release Eurostat in {snapshot_dir}")
    return pd.concat(parts, ignore_index=True)
