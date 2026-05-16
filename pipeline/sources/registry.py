"""Registry di tutte le fonti dati del progetto.

Ogni entry definisce: ID interno, descrizione human-readable, dataset ID
upstream, source folder per snapshot.

Build orchestrator itera questo registry per ciascuna source MUST.
Sources opzionali (D4, D10, D12, D13, D14) marcate con `optional=True`.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class DataSource:
    id: str
    description: str
    snapshot_dataset_id: str
    snapshot_source: str = "istat"
    snapshot_extension: str = "xml"
    optional: bool = False


SOURCES: list[DataSource] = [
    DataSource(
        id="D1",
        description="TFR Italia 1999-2024 (dataset condiviso con D3)",
        snapshot_dataset_id="25_326_DF_DCIS_FECONDITA1_5",
        snapshot_extension="csv",
    ),
    # D2 nascite mensili, D3 cittadinanza (stesso snapshot di D1), D9 proiezioni in Phase 2
]


def get_source(source_id: str) -> DataSource:
    """Lookup source by ID, raise KeyError if not found."""
    for s in SOURCES:
        if s.id == source_id:
            return s
    raise KeyError(f"Source {source_id} non registrata")
