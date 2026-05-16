"""ISTAT D1: Tasso di Fecondità Totale storico 1952-2024.

Dataset SDMX: 25_944_DF_DCIS_ARCH_FEC_6 (Total fertility rate by event year
and birth order, dall'archivio storico ISTAT).

Filtro applicato: RESIDENCE_TERR=IT, BIRTH_ORDER=ALL, YEAR_BIRTH_MOTHER=ALL.
YEAR_EVENT è l'anno effettivo del TFR.
"""

import pandas as pd

TFR_MIN_PLAUSIBLE = 0.5
TFR_MAX_PLAUSIBLE = 3.5  # Innalzato per baby boom 1964 (~2.7)


def normalize_tfr_dataframe(raw: pd.DataFrame) -> pd.DataFrame:
    """Filtra Italia totale e normalizza schema {year, tfr}.

    Schema input: long-form SDMX con colonne YEAR_EVENT, RESIDENCE_TERR,
    BIRTH_ORDER, YEAR_BIRTH_MOTHER, MOTHER_AGE, value (+ altre ignorate).

    Schema output: year (int), tfr (float), sorted ascending. Range
    atteso: 1952-2024.

    Raises:
        ValueError: se TFR fuori range plausibile [0.5, 3.5].
    """
    df = raw.copy()

    # Filtra prima per riduzione cardinalità
    if "RESIDENCE_TERR" in df.columns:
        df = df[df["RESIDENCE_TERR"] == "IT"]
    if "BIRTH_ORDER" in df.columns:
        df = df[df["BIRTH_ORDER"] == "ALL"]
    if "YEAR_BIRTH_MOTHER" in df.columns:
        df = df[df["YEAR_BIRTH_MOTHER"] == "ALL"]

    year_col = _find_column(df, ["YEAR_EVENT", "TIME_PERIOD", "TIME", "ANNO", "year"])
    value_col = _find_column(df, ["value", "OBS_VALUE", "VALUE", "OBS_VAL"])

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

    return (
        df.groupby("year", as_index=False)
        .agg({"tfr": "mean"})
        .sort_values("year")
        .reset_index(drop=True)[["year", "tfr"]]
    )


def _find_column(df: pd.DataFrame, candidates: list) -> str:
    for c in candidates:
        if c in df.columns:
            return c
    raise ValueError(f"Nessuna delle colonne {candidates} trovata. Disponibili: {list(df.columns)}")
