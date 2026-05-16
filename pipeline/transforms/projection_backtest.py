"""Backtest delle proiezioni: confronto release vs dato osservato.

Per ogni release archive (Eurostat 2019, 2023, 2025), calcola metriche
di errore sui punti dove proiezione e realtà si sovrappongono temporalmente:
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- Signed bias (mean(proj - actual)): positivo = sovra-stima
- Errore al primo anno proiezione (start-year accuracy)
"""

import math

import pandas as pd


def compute_release_backtest(
    actual: pd.DataFrame,
    projection: pd.DataFrame,
    *,
    release_year: int,
) -> dict:
    """Backtest una singola release vs dato osservato.

    Args:
        actual: DataFrame {year, tfr} (osservato).
        projection: DataFrame {release_year, year, tft} (multi-release).
        release_year: release da testare.

    Returns:
        dict con metriche.
    """
    proj = projection[projection["release_year"] == release_year].copy()
    proj = proj.rename(columns={"tft": "tft_proj"})
    actual_renamed = actual.rename(columns={"tfr": "tft_actual"})

    merged = actual_renamed.merge(proj[["year", "tft_proj"]], on="year")
    if merged.empty:
        return {
            "release_year": release_year,
            "n_overlap": 0,
            "first_year": None,
            "last_year": None,
            "mae": None,
            "rmse": None,
            "signed_bias": None,
            "max_abs_error": None,
        }

    diff = merged["tft_proj"] - merged["tft_actual"]
    return {
        "release_year": release_year,
        "n_overlap": int(len(merged)),
        "first_year": int(merged["year"].min()),
        "last_year": int(merged["year"].max()),
        "mae": float(diff.abs().mean()),
        "rmse": float(math.sqrt((diff**2).mean())),
        "signed_bias": float(diff.mean()),
        "max_abs_error": float(diff.abs().max()),
    }


def compute_all_backtests(
    actual: pd.DataFrame,
    projections: pd.DataFrame,
) -> pd.DataFrame:
    release_years = sorted(projections["release_year"].unique())
    rows = [
        compute_release_backtest(actual, projections, release_year=int(ry))
        for ry in release_years
    ]
    return pd.DataFrame(rows)
