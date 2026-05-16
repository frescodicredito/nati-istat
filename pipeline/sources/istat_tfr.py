"""ISTAT D1: Tasso di Fecondità Totale Italia 1999-2024.

Dataset SDMX: 25_326_DF_DCIS_FECONDITA1_5 (Total fertility rate by event year
and mother's citizenship).

Lo stesso snapshot viene usato anche da D3 (decomposizione per cittadinanza)
con un filtro diverso — vedi istat_tfr_citizenship.py.

Filtro per D1: REF_AREA=IT + CITIZENSHIP=TOTAL.
"""

import pandas as pd

TFR_MIN_PLAUSIBLE = 0.5
TFR_MAX_PLAUSIBLE = 3.0


def normalize_tfr_dataframe(raw: pd.DataFrame) -> pd.DataFrame:
    """Filtra Italia totale e normalizza schema {year, tfr}.

    Schema input atteso (long-form da SDMX): colonne TIME_PERIOD, REF_AREA,
    CITIZENSHIP, value (più altre dimensioni ignorate).

    Schema output: year (int), tfr (float), sorted ascending.

    Raises:
        ValueError: se TFR fuori range plausibile [0.5, 3.0] o colonne assenti.
    """
    df = raw.copy()

    year_col = _find_column(df, ["TIME_PERIOD", "TIME", "ANNO", "year"])
    value_col = _find_column(df, ["value", "OBS_VALUE", "VALUE", "OBS_VAL"])

    # Filter Italia totale + citizenship TOTAL se le colonne esistono
    if "REF_AREA" in df.columns:
        df = df[df["REF_AREA"] == "IT"]
    if "CITIZENSHIP" in df.columns:
        df = df[df["CITIZENSHIP"] == "TOTAL"]

    df["year"] = pd.to_numeric(df[year_col], errors="coerce").astype("Int64")
    df["tfr"] = pd.to_numeric(df[value_col], errors="coerce")
    df = df.dropna(subset=["year", "tfr"])
    df["year"] = df["year"].astype(int)

    out_of_range = df[(df["tfr"] < TFR_MIN_PLAUSIBLE) | (df["tfr"] > TFR_MAX_PLAUSIBLE)]
    if not out_of_range.empty:
        raise ValueError(
            f"TFR fuori range [{TFR_MIN_PLAUSIBLE}, {TFR_MAX_PLAUSIBLE}]: "
            f"{out_of_range[['year', 'tfr']].head().to_dict(orient='records')}"
        )

    result = (
        df.groupby("year", as_index=False)
        .agg({"tfr": "mean"})
        .sort_values("year")
        .reset_index(drop=True)
    )
    return result[["year", "tfr"]]


def _find_column(df: pd.DataFrame, candidates: list) -> str:
    for c in candidates:
        if c in df.columns:
            return c
    raise ValueError(f"Nessuna delle colonne {candidates} trovata. Disponibili: {list(df.columns)}")
