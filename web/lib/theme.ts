/**
 * Theme tokens centralizzati. Usati nei chart (Plot/D3) e nelle classi
 * Tailwind via CSS custom properties in globals.css.
 */

export const colors = {
  // Neutri
  bg: "#ffffff",
  fg: "#1a1a1a",
  fgMuted: "#5a5a5a",
  fgSubtle: "#888888",
  border: "#e5e5e5",
  surface: "#fafafa",

  // Accent: serie osservata storica
  historical: "#a8260b",

  // Accent: proiezioni ISTAT (gradiente per scenario)
  projectionBand: "#c8d8e8",
  projectionLower90: "#c8d8e8",
  projectionLower80: "#a8c0d8",
  projectionLower50: "#7b9fc4",
  projectionMediano: "#1e5180",
  projectionUpper50: "#7b9fc4",
  projectionUpper80: "#a8c0d8",
  projectionUpper90: "#c8d8e8",

  // Accent: scenari alternativi
  scenarioAlt: "#45BCCC",
  unScenario: "#888888",
} as const;

export const typography = {
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const spacing = {
  containerMax: "1200px",
  contentMax: "680px",
  chartMax: "960px",
} as const;
