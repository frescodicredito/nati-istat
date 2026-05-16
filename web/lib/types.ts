/**
 * Tipi tipizzati per i JSON prodotti dalla pipeline Python.
 *
 * Manteniti in sync con pipeline/sources/schema.py (AuditTrail) e con
 * la shape effettiva dei JSON in data/processed/.
 */

export interface AuditTrail {
  source: string;
  source_url: string;
  downloaded_at: string;
  pipeline_version: string;
  transforms_applied: string[];
  validation_passed: boolean;
  datapoint_count: number;
  notes?: string;
}

export interface DatasetWrapper<T> {
  audit: AuditTrail;
  data: T;
}

export interface TFRPoint {
  year: number;
  tfr: number;
}

export interface TFRByCitizenshipPoint {
  year: number;
  citizenship: "italiane" | "straniere";
  tfr: number;
}

export type ProjectionScenario =
  | "mediano"
  | "lower_50"
  | "lower_80"
  | "lower_90"
  | "upper_50"
  | "upper_80"
  | "upper_90";

export interface ProjectionPoint {
  year: number;
  scenario: ProjectionScenario;
  value: number;
}

export interface UNWPPPoint {
  year: number;
  scenario: "medium" | "estimates" | "low" | "high";
  value: number;
}

export interface ScenariosComparison {
  historical: TFRPoint[];
  istat_mediano: { year: number; value: number }[];
  istat_lower_50: { year: number; value: number }[];
  istat_upper_50: { year: number; value: number }[];
  istat_lower_90: { year: number; value: number }[];
  istat_upper_90: { year: number; value: number }[];
  un_medium?: { year: number; value: number }[];
  no_recovery: TFRPoint[];
}
