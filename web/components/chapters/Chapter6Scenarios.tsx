"use client";

import * as Plot from "@observablehq/plot";
import { useState } from "react";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { scenarios } from "@/lib/data";
import { formatItalian, formatYear } from "@/lib/format";
import { colors } from "@/lib/theme";

type ScenarioKey =
  | "istat_mediano"
  | "istat_lower_90"
  | "istat_upper_90"
  | "un_medium"
  | "no_recovery";

const TOGGLES: { key: ScenarioKey; label: string; color: string }[] = [
  { key: "istat_mediano", label: "ISTAT mediano", color: colors.projectionMediano },
  { key: "istat_lower_90", label: "ISTAT lower 90%", color: colors.projectionLower50 },
  { key: "istat_upper_90", label: "ISTAT upper 90%", color: colors.projectionBand },
  { key: "un_medium", label: "UN WPP Medium", color: colors.scenarioAlt },
  { key: "no_recovery", label: "No-recovery", color: "#d97706" },
];

export function Chapter6Scenarios() {
  const [active, setActive] = useState<Set<ScenarioKey>>(
    new Set(["istat_mediano", "istat_lower_90", "un_medium", "no_recovery"]),
  );

  const toggle = (k: ScenarioKey) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const data = scenarios.data;
  const recent = data.historical.filter((d) => d.year >= 1980);

  const series: { year: number; value: number; scenario: string }[] = [
    ...recent.map((d) => ({ year: d.year, value: d.tfr, scenario: "Osservato" })),
  ];
  if (active.has("istat_mediano")) {
    series.push(...data.istat_mediano.map((d) => ({ ...d, scenario: "ISTAT mediano" })));
  }
  if (active.has("istat_lower_90")) {
    series.push(...data.istat_lower_90.map((d) => ({ ...d, scenario: "ISTAT lower 90%" })));
  }
  if (active.has("istat_upper_90")) {
    series.push(...data.istat_upper_90.map((d) => ({ ...d, scenario: "ISTAT upper 90%" })));
  }
  if (active.has("un_medium") && data.un_medium) {
    series.push(...data.un_medium.map((d) => ({ ...d, scenario: "UN WPP Medium" })));
  }
  if (active.has("no_recovery")) {
    series.push(
      ...data.no_recovery.map((d) => ({ year: d.year, value: d.tfr, scenario: "No-recovery" })),
    );
  }

  const endpoints: { label: string; value: string; color: string }[] = [];
  const addEndpoint = (
    key: ScenarioKey,
    label: string,
    value: number | undefined,
    color: string,
  ) => {
    if (active.has(key) && value !== undefined) {
      endpoints.push({ label, value: value.toFixed(2), color });
    }
  };
  addEndpoint("istat_mediano", "ISTAT mediano (2080)", data.istat_mediano.at(-1)?.value, colors.projectionMediano);
  addEndpoint("istat_lower_90", "ISTAT lower 90% (2080)", data.istat_lower_90.at(-1)?.value, colors.projectionLower50);
  addEndpoint("istat_upper_90", "ISTAT upper 90% (2080)", data.istat_upper_90.at(-1)?.value, colors.projectionBand);
  if (active.has("un_medium") && data.un_medium) {
    addEndpoint("un_medium", "UN WPP Medium (2080)", data.un_medium.find((d) => d.year === 2080)?.value, colors.scenarioAlt);
  }
  addEndpoint("no_recovery", "No-recovery (2080)", data.no_recovery.at(-1)?.tfr, "#d97706");

  return (
    <Chapter num={6} id="cap-6" title={chapterContent.c6.title} opening={chapterContent.c6.opening}>
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {TOGGLES.map((t) => {
            const isActive = active.has(t.key);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => toggle(t.key)}
                className="rounded border px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: t.color,
                  backgroundColor: isActive ? t.color : "transparent",
                  color: isActive ? "#fff" : t.color,
                }}
                aria-pressed={isActive}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <PlotChart
          alt="Scenario comparator: ISTAT mediano, ISTAT lower 90%, ISTAT upper 90%, UN WPP Medium, no-recovery."
          caption="Toggle gli scenari per confrontare. La serie osservata mostra dal 1980 per leggibilità."
          plotOptions={{
            width: 1060,
            height: 460,
            marginTop: 30,
            marginRight: 30,
            marginBottom: 40,
            marginLeft: 50,
            y: {
              label: "TFR",
              grid: true,
              domain: [0.9, 2.0],
              tickFormat: (d: number) => formatItalian(d, 2),
            },
            x: { label: null, tickFormat: formatYear },
            color: {
              domain: [
                "Osservato",
                "ISTAT mediano",
                "ISTAT lower 90%",
                "ISTAT upper 90%",
                "UN WPP Medium",
                "No-recovery",
              ],
              range: [
                colors.historical,
                colors.projectionMediano,
                colors.projectionLower50,
                colors.projectionBand,
                colors.scenarioAlt,
                "#d97706",
              ],
              legend: true,
            },
            marks: [
              Plot.lineY(series, {
                x: "year",
                y: "value",
                stroke: "scenario",
                strokeWidth: 2,
              }),
            ],
          }}
        />
        {endpoints.length > 0 && (
          <div className="mx-auto mt-6 grid max-w-[680px] gap-2 text-sm">
            {endpoints.map((e) => (
              <div
                key={e.label}
                className="flex items-baseline justify-between border-b border-[color:var(--color-border)] py-2"
              >
                <span className="flex items-center gap-2 text-[color:var(--color-fg-muted)]">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                  {e.label}
                </span>
                <span className="font-mono text-base">{e.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          La distanza tra ISTAT mediano (1,46) e no-recovery (1,18) al 2080 è
          di 0,28 figli per donna. La distanza tra ISTAT upper 90% (1,82) e
          ISTAT lower 90% (1,12) è di 0,70 figli per donna — sette decimi, in
          un indicatore che oscilla tipicamente in pochi decimi. È l'ampiezza
          dell'incertezza intrinseca al modello, formalizzata da ISTAT stesso
          con gli intervalli di confidenza.
        </p>
        <p>
          La scelta dello scenario di riferimento per i forecast economici di
          lungo periodo non è neutrale: la proiezione mediana, una delle molte
          possibili dentro l'intervallo di confidenza ISTAT, viene
          tipicamente trattata come previsione puntuale.
        </p>
      </div>
    </Chapter>
  );
}
