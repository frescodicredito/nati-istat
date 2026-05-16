"""Validation: scenari proiezione coerenti e monotonici dove atteso."""

import json
from collections import defaultdict
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_PROCESSED = REPO_ROOT / "data" / "processed"


@pytest.fixture
def projection():
    path = DATA_PROCESSED / "projection_2024.json"
    if not path.exists():
        pytest.fail(f"Missing {path}. Run `python build.py` first.")
    return json.loads(path.read_text())


def test_projection_covers_full_horizon(projection):
    """Range 2024-2080 atteso per ogni scenario."""
    by_scenario = defaultdict(list)
    for row in projection["data"]:
        by_scenario[row["scenario"]].append(row["year"])
    for sc, years in by_scenario.items():
        assert min(years) == 2024, f"Scenario {sc} non inizia da 2024"
        assert max(years) == 2080, f"Scenario {sc} non finisce a 2080"
        assert len(years) == 2080 - 2024 + 1, f"Scenario {sc} ha buchi"


def test_projection_scenarios_present(projection):
    """Tutti i 7 scenari ISTAT presenti."""
    scenarios = {r["scenario"] for r in projection["data"]}
    expected = {"mediano", "lower_50", "lower_80", "lower_90",
                "upper_50", "upper_80", "upper_90"}
    assert expected <= scenarios


def test_projection_lower_le_mediano_le_upper(projection):
    """Per ogni anno: lower_90 ≤ mediano ≤ upper_90."""
    by_year_sc = defaultdict(dict)
    for row in projection["data"]:
        by_year_sc[row["year"]][row["scenario"]] = row["value"]
    for _year, sc_values in by_year_sc.items():
        if all(k in sc_values for k in ["lower_90", "mediano", "upper_90"]):
            assert sc_values["lower_90"] <= sc_values["mediano"] + 1e-6
            assert sc_values["mediano"] <= sc_values["upper_90"] + 1e-6


def test_projection_tfr_in_range(projection):
    """TFR proiettato in range plausibile [0.5, 3.0]."""
    for row in projection["data"]:
        assert 0.5 <= row["value"] <= 3.0, f"{row}: TFR fuori range"


def test_scenarios_comparison_present():
    path = DATA_PROCESSED / "scenarios_comparison.json"
    assert path.exists()
    data = json.loads(path.read_text())["data"]
    for key in ["historical", "istat_mediano", "istat_lower_90", "istat_upper_90", "no_recovery"]:
        assert key in data, f"Manca {key} in scenarios_comparison"
        assert len(data[key]) > 0
