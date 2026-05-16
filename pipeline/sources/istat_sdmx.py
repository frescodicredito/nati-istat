"""Generic ISTAT SDMX downloader via sdmx1 Client.

Strategia: usa sdmx1.Client('ISTAT') che gestisce gli headers e quirks
dell'endpoint ISTAT (notoriamente inaffidabile su raw HTTP).

Snapshot salvato come CSV human-verifiable (più accessibile di SDMX-ML
per verifica manuale, dimensioni minori, perfettamente riproducibile).
Manifest JSON adiacente con URL upstream, timestamp, sha256.
"""

import hashlib
import json
import logging
from datetime import UTC, datetime
from pathlib import Path

import pandas as pd
import sdmx

logger = logging.getLogger(__name__)


def download_istat_dataset(
    dataset_id: str,
    snapshot_path: Path,
    *,
    force: bool = False,
) -> dict:
    """Scarica un dataset ISTAT via sdmx1 e salva CSV snapshot + manifest.

    Args:
        dataset_id: Dataflow ID ISTAT (es. "25_326_DF_DCIS_FECONDITA1_5")
        snapshot_path: Path output CSV (manifest salvato accanto con suffisso .manifest.json)
        force: Se True, ri-scarica anche se snapshot esiste

    Returns:
        Manifest dict: {url, sha256, size_bytes, downloaded_at, path, dataset_id}
    """
    manifest_path = snapshot_path.with_suffix(snapshot_path.suffix + ".manifest.json")

    if snapshot_path.exists() and manifest_path.exists() and not force:
        logger.info("Snapshot esistente per %s, riuso", dataset_id)
        return json.loads(manifest_path.read_text())

    logger.info("Download %s via sdmx1 Client ISTAT", dataset_id)
    client = sdmx.Client("ISTAT")
    msg = client.data(dataset_id)
    df = sdmx.to_pandas(msg).reset_index()

    snapshot_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(snapshot_path, index=False)
    content = snapshot_path.read_bytes()

    manifest = {
        "dataset_id": dataset_id,
        "url": f"http://sdmx.istat.it/SDMXWS/rest/data/{dataset_id}",
        "sha256": hashlib.sha256(content).hexdigest(),
        "size_bytes": len(content),
        "downloaded_at": datetime.now(UTC).isoformat(),
        "path": str(snapshot_path),
        "rows": len(df),
        "columns": list(df.columns),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    logger.info("Salvato %d righe in %s", len(df), snapshot_path)
    return manifest


def load_istat_snapshot(snapshot_path: Path) -> pd.DataFrame:
    """Carica snapshot CSV come DataFrame long-form."""
    return pd.read_csv(snapshot_path)
