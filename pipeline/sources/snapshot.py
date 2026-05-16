"""Helper per gestione snapshot raw frozen.

Layout: data/raw/<source>/<YYYY-MM-DD>/<dataset_id>.<ext>
"""

from datetime import date
from pathlib import Path


def resolve_snapshot_path(
    base_dir: Path,
    source: str,
    dataset_id: str,
    snapshot_date: date,
    extension: str = "xml",
) -> Path:
    """Risolve path per snapshot frozen e crea la cartella parent.

    Args:
        base_dir: Root della cartella raw (es. data/raw/)
        source: Categoria fonte (es. "istat", "eurostat", "un_wpp")
        dataset_id: Identificatore del dataset (es. "DCIS_FECONDITA1")
        snapshot_date: Data dello snapshot
        extension: Estensione del file (default "xml")

    Returns:
        Path al file snapshot.
    """
    folder = base_dir / source / snapshot_date.isoformat()
    folder.mkdir(parents=True, exist_ok=True)
    return folder / f"{dataset_id}.{extension}"
