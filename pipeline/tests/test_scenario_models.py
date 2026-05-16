import pandas as pd

from transforms.scenario_models import build_no_recovery_scenario


def test_no_recovery_holds_current_level():
    historical = pd.DataFrame(
        {
            "year": [2020, 2021, 2022, 2023, 2024],
            "tfr": [1.24, 1.25, 1.24, 1.20, 1.18],
        }
    )
    scenario = build_no_recovery_scenario(historical, target_year=2080)
    assert scenario["year"].max() == 2080
    assert scenario["year"].min() == 2024
    assert (scenario["tfr"] == 1.18).all()


def test_no_recovery_returns_int_years():
    historical = pd.DataFrame({"year": [2024], "tfr": [1.18]})
    scenario = build_no_recovery_scenario(historical, target_year=2030)
    assert scenario["year"].dtype.kind == "i"
    assert len(scenario) == 7  # 2024..2030 inclusive
