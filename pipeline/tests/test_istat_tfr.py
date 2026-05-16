import pandas as pd
import pytest

from sources.istat_tfr import normalize_tfr_dataframe


def test_normalize_tfr_basic():
    raw = pd.DataFrame(
        {
            "TIME_PERIOD": ["2020", "2021", "2022", "2023", "2024"],
            "value": [1.24, 1.25, 1.24, 1.20, 1.18],
        }
    )
    result = normalize_tfr_dataframe(raw)
    assert list(result.columns) == ["year", "tfr"]
    assert result["year"].dtype.kind == "i"
    assert result["tfr"].iloc[-1] == 1.18


def test_normalize_tfr_validates_range():
    raw = pd.DataFrame(
        {
            "TIME_PERIOD": ["2020", "2021"],
            "value": [1.24, 99.0],
        }
    )
    with pytest.raises(ValueError, match="TFR fuori range"):
        normalize_tfr_dataframe(raw)


def test_normalize_tfr_sorts_by_year():
    raw = pd.DataFrame(
        {
            "TIME_PERIOD": ["2022", "2020", "2021"],
            "value": [1.24, 1.27, 1.25],
        }
    )
    result = normalize_tfr_dataframe(raw)
    assert list(result["year"]) == [2020, 2021, 2022]


def test_normalize_tfr_accepts_obs_value_column():
    """ISTAT a volte espone la colonna come OBS_VALUE."""
    raw = pd.DataFrame(
        {
            "TIME_PERIOD": ["2020", "2021"],
            "OBS_VALUE": [1.24, 1.25],
        }
    )
    result = normalize_tfr_dataframe(raw)
    assert len(result) == 2


def test_normalize_tfr_deduplicates_year_via_mean():
    """Se ci sono duplicati di anno (breakdown non aggregato), media."""
    raw = pd.DataFrame(
        {
            "TIME_PERIOD": ["2020", "2020", "2021"],
            "value": [1.20, 1.28, 1.25],
        }
    )
    result = normalize_tfr_dataframe(raw)
    assert len(result) == 2
    assert result.loc[result["year"] == 2020, "tfr"].iloc[0] == pytest.approx(1.24)
