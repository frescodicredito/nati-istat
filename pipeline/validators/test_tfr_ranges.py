"""Validation: TFR processed in range plausibili e completi.

Eseguito da CI dopo build. Fail → deploy bloccato.
"""

import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_PROCESSED = REPO_ROOT / "data" / "processed"


@pytest.fixture
def tfr_historical():
    path = DATA_PROCESSED / "tfr_historical.json"
    if not path.exists():
        pytest.fail(f"Missing {path}. Run `python build.py` first.")
    return json.loads(path.read_text())


def test_tfr_historical_in_range(tfr_historical):
    """TFR storico Italia deve essere sempre in [0.5, 3.0]."""
    for row in tfr_historical["data"]:
        assert 0.5 <= row["tfr"] <= 3.0, f"Anno {row['year']}: TFR {row['tfr']} fuori range"


def test_tfr_historical_years_complete(tfr_historical):
    """Tutti gli anni da min a max devono essere presenti, senza gap."""
    years = sorted(r["year"] for r in tfr_historical["data"])
    assert years == list(range(years[0], years[-1] + 1)), "Gap negli anni TFR"


def test_tfr_historical_includes_2024(tfr_historical):
    """Deve includere il dato 2024 almeno."""
    years = [r["year"] for r in tfr_historical["data"]]
    assert 2024 in years, f"Manca 2024. Max year: {max(years)}"


def test_tfr_historical_audit_complete(tfr_historical):
    audit = tfr_historical["audit"]
    assert audit["source_url"].startswith("http")
    assert audit["datapoint_count"] == len(tfr_historical["data"])
    assert audit["validation_passed"] is True
    assert len(audit["transforms_applied"]) > 0
