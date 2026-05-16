"""ISTAT D3: TFR per cittadinanza italiane vs straniere.

Stesso snapshot CSV di D1 (25_326_DF_DCIS_FECONDITA1_5), filtrato in modo
diverso: CITIZENSHIP=ITL (italiane) o FRG (straniere), invece di TOTAL.

Output: serie temporale separate per ciascun gruppo, range 1999-2024.
"""

import pandas as pd

CITIZENSHIP_LABELS = {
    "ITL": "italiane",
    "FRG": "straniere",
}


def normalize_tfr_by_citizenship(raw: pd.DataFrame) -> pd.DataFrame:
    """Filtra Italia, separa per cittadinanza italiana/straniera.

    Args:
        raw: DataFrame snapshot ISTAT con colonne TIME_PERIOD, REF_AREA, CITIZENSHIP, value.

    Returns:
        DataFrame con colonne {year, citizenship, tfr}, sorted.
        Citizenship values: "italiane" | "straniere" (mai TOTAL).
    """
    df = raw.copy()
    if "REF_AREA" in df.columns:
        df = df[df["REF_AREA"] == "IT"]
    df = df[df["CITIZENSHIP"].isin(CITIZENSHIP_LABELS.keys())]

    df["year"] = pd.to_numeric(df["TIME_PERIOD"], errors="coerce").astype("Int64")
    df["tfr"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna(subset=["year", "tfr"])
    df["year"] = df["year"].astype(int)
    df["citizenship"] = df["CITIZENSHIP"].map(CITIZENSHIP_LABELS)

    return (
        df.groupby(["year", "citizenship"], as_index=False)
        .agg({"tfr": "mean"})
        .sort_values(["year", "citizenship"])
        .reset_index(drop=True)[["year", "citizenship", "tfr"]]
    )
