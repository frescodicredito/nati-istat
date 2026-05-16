"""UN World Population Prospects 2024 — TFR Italia, scenari Low/Medium/High.

Download Excel file (26MB) da https://population.un.org/wpp/, filtra
righe Italia e variant rilevanti, salva snapshot CSV compresso con
solo i dati necessari.
"""

import logging
from datetime import UTC, datetime
from pathlib import Path

import pandas as pd
import requests

UN_WPP_URL = (
    "https://population.un.org/wpp/assets/Excel%20Files/"
    "1_Indicator%20(Standard)/EXCEL_FILES/1_General/"
    "WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx"
)

logger = logging.getLogger(__name__)

UN_VARIANTS = {
    "Estimates": "estimates",
    "Medium": "medium",
    "Low": "low",
    "High": "high",
    "Constant fertility": "constant_fertility",
    "No change": "no_change",
}


def download_un_wpp(snapshot_path: Path, *, force: bool = False) -> dict:
    """Scarica Excel UN WPP, filtra Italia TFR, salva snapshot CSV.gz."""
    if snapshot_path.exists() and not force:
        logger.info("Snapshot UN WPP esistente, riuso")
        return {"path": str(snapshot_path), "cached": True}

    snapshot_path.parent.mkdir(parents=True, exist_ok=True)
    logger.info("Download UN WPP Excel (~26MB) da %s", UN_WPP_URL)

    cache_xlsx = snapshot_path.parent / "_wpp_full.xlsx"
    if not cache_xlsx.exists():
        with requests.get(UN_WPP_URL, stream=True, timeout=300) as r:
            r.raise_for_status()
            with open(cache_xlsx, "wb") as f:
                for chunk in r.iter_content(chunk_size=1 << 16):
                    f.write(chunk)
        logger.info("Salvato Excel raw (%d bytes)", cache_xlsx.stat().st_size)

    logger.info("Parsing Excel — sheet 'Estimates' + 'Medium variant'")
    sheets = pd.read_excel(cache_xlsx, sheet_name=None, header=16, engine="openpyxl")
    parts = []
    for sheet_name, df in sheets.items():
        if "ISO3 Alpha-code" not in df.columns:
            continue
        italy = df[df["ISO3 Alpha-code"] == "ITA"].copy()
        if italy.empty:
            continue
        italy["sheet"] = sheet_name
        parts.append(italy)
    full = pd.concat(parts, ignore_index=True) if parts else pd.DataFrame()
    logger.info("Filtered Italia rows: %d (combined sheets)", len(full))

    full.to_csv(snapshot_path, index=False)
    cache_xlsx.unlink()
    logger.info("Salvato CSV.gz: %d bytes", snapshot_path.stat().st_size)
    return {
        "path": str(snapshot_path),
        "url": UN_WPP_URL,
        "downloaded_at": datetime.now(UTC).isoformat(),
        "rows": len(full),
    }


def normalize_un_wpp_tfr(raw: pd.DataFrame) -> pd.DataFrame:
    """Estrai TFR Italia per scenario, schema {year, scenario, value}.

    Args:
        raw: DataFrame full dello snapshot UN WPP filtrato Italia.

    Returns:
        DataFrame con colonne {year, scenario, value} per ogni anno-scenario.
    """
    df = raw.copy()

    # Trova colonna TFR e Variant
    tfr_col = None
    for col in df.columns:
        if "Total Fertility Rate" in str(col):
            tfr_col = col
            break
    if tfr_col is None:
        raise ValueError(f"Colonna TFR non trovata. Colonne: {list(df.columns)[:30]}")

    variant_col = "Variant"
    year_col = "Year"

    df = df[[year_col, variant_col, tfr_col]].copy()
    df.columns = ["year", "variant", "value"]
    df = df.dropna(subset=["year", "value"])
    df["year"] = pd.to_numeric(df["year"], errors="coerce").astype("Int64")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna(subset=["year", "value"])
    df["year"] = df["year"].astype(int)

    df["scenario"] = df["variant"].map(UN_VARIANTS).fillna(df["variant"].astype(str))

    return (
        df.groupby(["scenario", "year"], as_index=False)
        .agg({"value": "mean"})
        .sort_values(["scenario", "year"])
        .reset_index(drop=True)[["year", "scenario", "value"]]
    )
