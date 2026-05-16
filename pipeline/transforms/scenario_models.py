"""Scenari alternativi a quello ISTAT mediano.

no_recovery: TFR resta al livello osservato ultimo anno disponibile.
Justification: senza driver storici esauriti (immigrazione + tempo recuperato),
non c'è meccanismo demografico per ipotizzare un recupero. Vedi cap 4 del sito.
"""

import pandas as pd


def build_no_recovery_scenario(
    historical: pd.DataFrame,
    *,
    target_year: int = 2080,
) -> pd.DataFrame:
    """TFR proiezione costante al livello dell'ultimo anno osservato.

    Args:
        historical: DataFrame con colonne {year, tfr}.
        target_year: anno fino al quale proiettare (incluso).

    Returns:
        DataFrame {year, tfr} dall'ultimo anno osservato a target_year.
    """
    last_year = int(historical["year"].max())
    last_tfr = float(historical[historical["year"] == last_year]["tfr"].iloc[0])
    years = list(range(last_year, target_year + 1))
    return pd.DataFrame({"year": years, "tfr": [last_tfr] * len(years)})
