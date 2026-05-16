"""Aggregator per produrre i JSON finali consumati dal frontend.

Costruisce strutture dati composite a partire dai source JSON intermedi.

Output principale:
- scenarios_comparison.json: storico + ISTAT mediano + ISTAT lower/upper 90%
  + nostro no_recovery. Consumato dal capitolo 6 (scenario comparator).
"""

import json
from pathlib import Path

import pandas as pd

from transforms.scenario_models import build_no_recovery_scenario


def _load_data(processed_dir: Path, name: str) -> dict:
    return json.loads((processed_dir / name).read_text())


def build_scenarios_comparison(processed_dir: Path) -> dict:
    """Combina storico osservato + scenari ISTAT + nostro no-recovery.

    Returns:
        dict con keys:
        - historical: lista [{year, tfr}]
        - istat_mediano: lista [{year, value}]
        - istat_lower_90: lista [{year, value}]
        - istat_upper_90: lista [{year, value}]
        - no_recovery: lista [{year, tfr}]
    """
    historical_raw = _load_data(processed_dir, "tfr_historical.json")["data"]
    projection_raw = _load_data(processed_dir, "projection_2024.json")["data"]

    historical_df = pd.DataFrame(historical_raw)
    no_recovery = build_no_recovery_scenario(historical_df, target_year=2080)

    def _scenario_data(scenario: str) -> list[dict]:
        return [
            {"year": int(r["year"]), "value": float(r["value"])}
            for r in projection_raw
            if r["scenario"] == scenario
        ]

    return {
        "historical": [
            {"year": int(r["year"]), "tfr": float(r["tfr"])} for r in historical_raw
        ],
        "istat_mediano": _scenario_data("mediano"),
        "istat_lower_90": _scenario_data("lower_90"),
        "istat_upper_90": _scenario_data("upper_90"),
        "no_recovery": no_recovery.to_dict(orient="records"),
    }
