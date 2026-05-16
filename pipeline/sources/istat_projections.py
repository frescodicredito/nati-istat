"""ISTAT D9: Proiezioni demografiche 2024 (release base 2023).

Dataset SDMX: 165_889_DF_DCIS_PREVDEM1_3 (Demographic indicators).
Range temporale: 2024-2080. Indicator usato: TFR.

Scenari disponibili (FORECAST_INTERVAL):
- PROJMED: scenario mediano (riferimento)
- PROJLOW50, PROJLOW80, PROJLOW90: lower bounds confidence interval
- PROJUPP50, PROJUPP80, PROJUPP90: upper bounds
"""

import pandas as pd

SCENARIO_LABELS = {
    "PROJMED": "mediano",
    "PROJLOW50": "lower_50",
    "PROJLOW80": "lower_80",
    "PROJLOW90": "lower_90",
    "PROJUPP50": "upper_50",
    "PROJUPP80": "upper_80",
    "PROJUPP90": "upper_90",
}


def normalize_projection_2024(raw: pd.DataFrame, *, indicator: str = "TFR") -> pd.DataFrame:
    """Filtra per indicator e normalizza schema {year, scenario, value}.

    Args:
        raw: DataFrame snapshot da 165_889_DF_DCIS_PREVDEM1_3.
        indicator: Indicator code ISTAT (default "TFR").

    Returns:
        DataFrame con colonne {year, scenario, value}, sorted by scenario + year.
        Scenario in label leggibili (mediano, lower_50, upper_50, etc.).
    """
    df = raw.copy()
    if "REF_AREA" in df.columns:
        df = df[df["REF_AREA"] == "IT"]
    df = df[df["DATA_TYPE"] == indicator]
    df = df[df["FORECAST_INTERVAL"].isin(SCENARIO_LABELS.keys())]

    df["year"] = pd.to_numeric(df["TIME_PERIOD"], errors="coerce").astype("Int64")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna(subset=["year", "value"])
    df["year"] = df["year"].astype(int)
    df["scenario"] = df["FORECAST_INTERVAL"].map(SCENARIO_LABELS)

    return (
        df.groupby(["scenario", "year"], as_index=False)
        .agg({"value": "mean"})
        .sort_values(["scenario", "year"])
        .reset_index(drop=True)[["year", "scenario", "value"]]
    )
