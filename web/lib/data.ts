/**
 * Tipizzato JSON loader. Import statici risolti a build time.
 *
 * I file in lib/_data/ sono copiati da pipeline/data/processed/ via
 * scripts/copy-data.mjs (predev/prebuild). Sono gitignored: la fonte
 * canonica resta data/processed/ nel repo root.
 */

import birthsCitizenshipRaw from "./_data/tfr_by_citizenship.json";
import projection2024Raw from "./_data/projection_2024.json";
import scenariosRaw from "./_data/scenarios_comparison.json";
import tfrHistoricalRaw from "./_data/tfr_historical.json";
import unWppRaw from "./_data/un_wpp_italy.json";

import type {
  DatasetWrapper,
  ProjectionPoint,
  ScenariosComparison,
  TFRByCitizenshipPoint,
  TFRPoint,
  UNWPPPoint,
} from "./types";

export const tfrHistorical = tfrHistoricalRaw as unknown as DatasetWrapper<TFRPoint[]>;
export const tfrCitizenship = birthsCitizenshipRaw as unknown as DatasetWrapper<
  TFRByCitizenshipPoint[]
>;
export const projection2024 = projection2024Raw as unknown as DatasetWrapper<ProjectionPoint[]>;
export const scenarios = scenariosRaw as unknown as DatasetWrapper<ScenariosComparison>;
export const unWpp = unWppRaw as unknown as DatasetWrapper<UNWPPPoint[]>;
