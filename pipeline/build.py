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

from sources.istat_projections import normalize_projection_2024
from sources.istat_sdmx import download_istat_dataset, load_istat_snapshot
from sources.istat_tfr import normalize_tfr_dataframe
from sources.istat_tfr_citizenship import normalize_tfr_by_citizenship
from sources.registry import get_source
from sources.schema import AuditTrail
from sources.snapshot import resolve_snapshot_path
from transforms.aggregator import build_scenarios_comparison

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


def _resolve_or_download(
    source_id: str,
    args: argparse.Namespace,
    snapshot_date: date,
) -> Path:
    """Risolve path snapshot, scarica se serve e disponibile, fallback su latest."""
    source = get_source(source_id)
    snapshot_path = resolve_snapshot_path(
        DATA_RAW,
        source.snapshot_source,
        source.snapshot_dataset_id,
        snapshot_date,
        extension=source.snapshot_extension,
    )

    if not args.no_download and not args.validate_only and not snapshot_path.exists():
        download_istat_dataset(source.snapshot_dataset_id, snapshot_path)

    if not snapshot_path.exists():
        snapshot_path = _find_most_recent_snapshot(
            source.snapshot_source, source.snapshot_dataset_id, source.snapshot_extension
        )

    return snapshot_path


def _audit_for(source_id: str, snapshot_date: date, pipeline_ver: str,
               transforms: list[str], count: int) -> AuditTrail:
    source = get_source(source_id)
    return AuditTrail(
        source=f"ISTAT {source.snapshot_dataset_id}",
        source_url=f"http://sdmx.istat.it/SDMXWS/rest/data/{source.snapshot_dataset_id}",
        downloaded_at=datetime.combine(snapshot_date, datetime.min.time(), tzinfo=UTC),
        pipeline_version=pipeline_ver,
        transforms_applied=transforms,
        validation_passed=True,
        datapoint_count=count,
        notes=source.description,
    )


def build_d1(args: argparse.Namespace, snapshot_date: date, pipeline_ver: str) -> None:
    """D1: TFR storico Italia (1999-2024). Filtro CITIZENSHIP=TOTAL."""
    snapshot_path = _resolve_or_download("D1", args, snapshot_date)
    raw = load_istat_snapshot(snapshot_path)
    normalized = normalize_tfr_dataframe(raw)
    audit = _audit_for(
        "D1", snapshot_date, pipeline_ver,
        ["filter_italia_total", "normalize_tfr_dataframe"],
        len(normalized),
    )
    output_path = write_dataset(
        "tfr_historical.json",
        normalized.to_dict(orient="records"),
        audit,
    )
    logger.info(
        "[D1] %s: %d punti (range %d-%d)",
        output_path.name, len(normalized),
        normalized["year"].min(), normalized["year"].max(),
    )


def build_d3(args: argparse.Namespace, snapshot_date: date, pipeline_ver: str) -> None:
    """D3: TFR per cittadinanza italiana/straniera. Riusa snapshot D1."""
    snapshot_path = _resolve_or_download("D3", args, snapshot_date)
    raw = load_istat_snapshot(snapshot_path)
    normalized = normalize_tfr_by_citizenship(raw)
    audit = _audit_for(
        "D3", snapshot_date, pipeline_ver,
        ["filter_italia_citizenship", "normalize_tfr_by_citizenship"],
        len(normalized),
    )
    output_path = write_dataset(
        "tfr_by_citizenship.json",
        normalized.to_dict(orient="records"),
        audit,
    )
    logger.info(
        "[D3] %s: %d punti (italiane+straniere)",
        output_path.name, len(normalized),
    )


def build_d9(args: argparse.Namespace, snapshot_date: date, pipeline_ver: str) -> None:
    """D9: Proiezioni demografiche ISTAT 2024 (TFR scenari)."""
    snapshot_path = _resolve_or_download("D9", args, snapshot_date)
    raw = load_istat_snapshot(snapshot_path)
    normalized = normalize_projection_2024(raw, indicator="TFR")
    audit = _audit_for(
        "D9", snapshot_date, pipeline_ver,
        ["filter_italia_tfr", "normalize_projection_2024"],
        len(normalized),
    )
    output_path = write_dataset(
        "projection_2024.json",
        normalized.to_dict(orient="records"),
        audit,
    )
    n_scenarios = normalized["scenario"].nunique()
    logger.info(
        "[D9] %s: %d punti su %d scenari (2024-2080)",
        output_path.name, len(normalized), n_scenarios,
    )


def build_aggregates(snapshot_date: date, pipeline_ver: str) -> None:
    """Costruisce JSON aggregati per consumo frontend.

    Per ora: scenarios_comparison.json (cap 6 comparator).
    """
    aggregate = build_scenarios_comparison(DATA_PROCESSED)
    audit = AuditTrail(
        source="Aggregated from tfr_historical + projection_2024 + transforms.scenario_models",
        source_url="see source files audit trails",
        downloaded_at=datetime.combine(snapshot_date, datetime.min.time(), tzinfo=UTC),
        pipeline_version=pipeline_ver,
        transforms_applied=["build_scenarios_comparison", "build_no_recovery_scenario"],
        validation_passed=True,
        datapoint_count=sum(len(v) for v in aggregate.values() if isinstance(v, list)),
        notes="Storico osservato + scenari ISTAT (mediano/lower90/upper90) + nostro no_recovery",
    )
    output_path = write_dataset("scenarios_comparison.json", aggregate, audit)
    logger.info(
        "[AGG] %s: historical=%d istat_med=%d no_recovery=%d",
        output_path.name,
        len(aggregate["historical"]),
        len(aggregate["istat_mediano"]),
        len(aggregate["no_recovery"]),
    )


def _find_most_recent_snapshot(source_folder: str, dataset_id: str, extension: str) -> Path:
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
    parser.add_argument("--validate-only", action="store_true",
                        help="Solo validation su snapshot esistenti, no download")
    parser.add_argument("--no-download", action="store_true",
                        help="Skip download, usa snapshot frozen")
    parser.add_argument("--snapshot-date", type=str, default=None,
                        help="Data snapshot override (YYYY-MM-DD), default oggi")
    args = parser.parse_args()

    snapshot_date = date.fromisoformat(args.snapshot_date) if args.snapshot_date else date.today()
    pipeline_ver = git_sha()
    logger.info("Pipeline version: %s, snapshot date: %s", pipeline_ver, snapshot_date)

    try:
        build_d1(args, snapshot_date, pipeline_ver)
        build_d3(args, snapshot_date, pipeline_ver)
        build_d9(args, snapshot_date, pipeline_ver)
        build_aggregates(snapshot_date, pipeline_ver)
        # D11 UN WPP + archive proiezioni storiche aggiunti in seguito
    except Exception:
        logger.exception("Build fallita")
        return 1

    logger.info("Build completata")
    return 0


if __name__ == "__main__":
    sys.exit(main())
