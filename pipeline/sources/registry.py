"""Registry di tutte le fonti dati del progetto.

Ogni entry definisce: ID interno, descrizione, dataset ID upstream, source
folder. Build orchestrator itera questo registry per ogni source MUST.

Note: D1 e D3 condividono lo stesso snapshot (25_326_DF_DCIS_FECONDITA1_5),
filtrato diversamente. La pipeline scarica una volta sola.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class DataSource:
    id: str
    description: str
    snapshot_dataset_id: str
    snapshot_source: str = "istat"
    snapshot_extension: str = "csv.gz"
    optional: bool = False


SOURCES: list[DataSource] = [
    DataSource(
        id="D1",
        description="TFR storico Italia 1952-2024 (archive completo)",
        snapshot_dataset_id="25_944_DF_DCIS_ARCH_FEC_6",
    ),
    DataSource(
        id="D3",
        description="TFR per cittadinanza italiana/straniera 1999-2024",
        snapshot_dataset_id="25_326_DF_DCIS_FECONDITA1_5",
    ),
    DataSource(
        id="D9",
        description="Proiezioni demografiche ISTAT 2024 (base 2023), TFR scenari",
        snapshot_dataset_id="165_889_DF_DCIS_PREVDEM1_3",
    ),
    DataSource(
        id="D11",
        description="UN World Population Prospects 2024 - TFR Italia scenari",
        snapshot_dataset_id="WPP2024_DEMOGRAPHIC_INDICATORS_ITALY",
        snapshot_source="un_wpp",
        snapshot_extension="csv.gz",
    ),
]


def get_source(source_id: str) -> DataSource:
    """Lookup source by ID, raise KeyError if not found."""
    for s in SOURCES:
        if s.id == source_id:
            return s
    raise KeyError(f"Source {source_id} non registrata")
