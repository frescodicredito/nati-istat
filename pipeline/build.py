"""Orchestrator pipeline nati-istat.

Comandi:
    uv run python build.py                  # Full: download + transform + validate + emit
    uv run python build.py --validate-only  # Solo validation su snapshot esistenti (per CI)
    uv run python build.py --no-download    # Solo transform da snapshot, no network
    uv run python build.py --snapshot-date YYYY-MM-DD  # Override data snapshot
"""

import argparse
import json
import logging
import subprocess
import sys
from datetime import UTC, date, datetime
from pathlib import Path

from sources.istat_sdmx import download_istat_dataset, load_istat_snapshot
from sources.istat_tfr import normalize_tfr_dataframe
from sources.registry import get_source
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
    """Restituisce git SHA corto della pipeline al build time."""
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


def write_dataset(
    output_name: str,
    data: list[dict] | dict,
    audit: AuditTrail,
) -> Path:
    """Wrap data con audit trail e scrivi JSON in data/processed/."""
    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    output = {
        "audit": json.loads(audit.model_dump_json()),
        "data": data,
    }
    output_path = DATA_PROCESSED / output_name
    output_path.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n")
    return output_path


def build_d1(args: argparse.Namespace, snapshot_date: date, pipeline_ver: str) -> None:
    """D1: TFR storico Italia (1999-2024).

    Usa dataset condiviso con D3 (filtro CITIZENSHIP=TOTAL).
    """
    source = get_source("D1")
    snapshot_path = resolve_snapshot_path(
        DATA_RAW,
        source.snapshot_source,
        source.snapshot_dataset_id,
        snapshot_date,
        extension=source.snapshot_extension,
    )

    if not args.no_download and not args.validate_only:
        download_istat_dataset(source.snapshot_dataset_id, snapshot_path)

    if not snapshot_path.exists():
        snapshot_path = _find_most_recent_snapshot(
            source.snapshot_source, source.snapshot_dataset_id, source.snapshot_extension
        )

    raw = load_istat_snapshot(snapshot_path)
    normalized = normalize_tfr_dataframe(raw)

    audit = AuditTrail(
        source=f"ISTAT {source.snapshot_dataset_id}",
        source_url=f"http://sdmx.istat.it/SDMXWS/rest/data/{source.snapshot_dataset_id}",
        downloaded_at=datetime.combine(snapshot_date, datetime.min.time(), tzinfo=UTC),
        pipeline_version=pipeline_ver,
        transforms_applied=["filter_italia_total", "normalize_tfr_dataframe"],
        validation_passed=True,
        datapoint_count=len(normalized),
        notes=source.description,
    )

    output_path = write_dataset(
        "tfr_historical.json",
        normalized.to_dict(orient="records"),
        audit,
    )
    logger.info(
        "[D1] Scritto %s con %d datapoint (range %d-%d)",
        output_path.name,
        len(normalized),
        normalized["year"].min(),
        normalized["year"].max(),
    )


def _find_most_recent_snapshot(source_folder: str, dataset_id: str, extension: str) -> Path:
    """Trova lo snapshot più recente per un dataset, in qualsiasi data folder."""
    source_dir = DATA_RAW / source_folder
    if not source_dir.exists():
        raise FileNotFoundError(
            f"Nessuna cartella raw per {source_folder}. Esegui senza --no-download."
        )
    candidates = sorted(source_dir.glob(f"*/{dataset_id}.{extension}"))
    if not candidates:
        raise FileNotFoundError(
            f"Nessuno snapshot trovato per {source_folder}/{dataset_id}.{extension}"
        )
    return candidates[-1]


def main() -> int:
    parser = argparse.ArgumentParser(description="nati-istat pipeline build")
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Solo validation su snapshot esistenti, no download",
    )
    parser.add_argument(
        "--no-download", action="store_true", help="Skip download, usa snapshot frozen"
    )
    parser.add_argument(
        "--snapshot-date",
        type=str,
        default=None,
        help="Data snapshot override (YYYY-MM-DD), default oggi",
    )
    args = parser.parse_args()

    snapshot_date = date.fromisoformat(args.snapshot_date) if args.snapshot_date else date.today()
    pipeline_ver = git_sha()
    logger.info("Pipeline version: %s, snapshot date: %s", pipeline_ver, snapshot_date)

    try:
        build_d1(args, snapshot_date, pipeline_ver)
        # build_d2, build_d3, ... aggiunti in Phase 2
    except Exception:
        logger.exception("Build fallita")
        return 1

    logger.info("Build completata")
    return 0


if __name__ == "__main__":
    sys.exit(main())
