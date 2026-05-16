/**
 * Formattazioni italiane (decimal comma, thousands dot).
 */

export function formatItalian(value: number, decimals = 2): string {
  return value.toLocaleString("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatYear(value: number): string {
  return String(Math.round(value));
}
