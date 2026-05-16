/**
 * Tipizzato JSON loader. Import statici risolti a build time da
 * data/processed/ committed nel repo.
 */

import birthsCitizenshipRaw from "@/../data/processed/tfr_by_citizenship.json";
import projection2024Raw from "@/../data/processed/projection_2024.json";
import scenariosRaw from "@/../data/processed/scenarios_comparison.json";
import tfrHistoricalRaw from "@/../data/processed/tfr_historical.json";

import type {
  DatasetWrapper,
  ProjectionPoint,
  ScenariosComparison,
  TFRByCitizenshipPoint,
  TFRPoint,
} from "./types";

export const tfrHistorical = tfrHistoricalRaw as unknown as DatasetWrapper<TFRPoint[]>;
export const tfrCitizenship = birthsCitizenshipRaw as unknown as DatasetWrapper<
  TFRByCitizenshipPoint[]
>;
export const projection2024 = projection2024Raw as unknown as DatasetWrapper<ProjectionPoint[]>;
export const scenarios = scenariosRaw as unknown as DatasetWrapper<ScenariosComparison>;
