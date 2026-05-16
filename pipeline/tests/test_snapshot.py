from datetime import date

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


def test_snapshot_path_custom_extension(tmp_path):
    result = resolve_snapshot_path(
        base_dir=tmp_path,
        source="un_wpp",
        dataset_id="DEMOGRAPHIC_INDICATORS",
        snapshot_date=date(2024, 1, 1),
        extension="xlsx",
    )
    assert result.suffix == ".xlsx"
