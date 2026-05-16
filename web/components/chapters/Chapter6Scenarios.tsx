"use client";

import * as Plot from "@observablehq/plot";
import { useState } from "react";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { scenarios } from "@/lib/data";
import { colors } from "@/lib/theme";

type ScenarioKey = "istat_mediano" | "istat_lower_90" | "no_recovery";

const TOGGLES: { key: ScenarioKey; label: string; color: string }[] = [
  { key: "istat_mediano", label: "ISTAT mediano", color: colors.projectionMediano },
  { key: "istat_lower_90", label: "ISTAT lower 90%", color: colors.projectionLower50 },
  { key: "no_recovery", label: "No-recovery", color: colors.scenarioAlt },
];

export function Chapter6Scenarios() {
  const [active, setActive] = useState<Set<ScenarioKey>>(
    new Set(["istat_mediano", "istat_lower_90", "no_recovery"]),
  );

  const toggle = (k: ScenarioKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const data = scenarios.data;

  const series: { year: number; value: number; scenario: string }[] = [
    ...data.historical.map((d) => ({ year: d.year, value: d.tfr, scenario: "Osservato" })),
  ];
  if (active.has("istat_mediano")) {
    series.push(...data.istat_mediano.map((d) => ({ ...d, scenario: "ISTAT mediano" })));
  }
  if (active.has("istat_lower_90")) {
    series.push(
      ...data.istat_lower_90.map((d) => ({ ...d, scenario: "ISTAT lower 90%" })),
    );
  }
  if (active.has("no_recovery")) {
    series.push(...data.no_recovery.map((d) => ({ year: d.year, value: d.tfr, scenario: "No-recovery" })));
  }

  // Endpoint summary 2080
  const endpoints: { label: string; value: string }[] = [];
  if (active.has("istat_mediano")) {
    endpoints.push({
      label: "ISTAT mediano (2080)",
      value: (data.istat_mediano.at(-1)?.value ?? 0).toFixed(2),
    });
  }
  if (active.has("istat_lower_90")) {
    endpoints.push({
      label: "ISTAT lower 90% (2080)",
      value: (data.istat_lower_90.at(-1)?.value ?? 0).toFixed(2),
    });
  }
  if (active.has("no_recovery")) {
    endpoints.push({
      label: "No-recovery (2080)",
      value: (data.no_recovery.at(-1)?.tfr ?? 0).toFixed(2),
    });
  }

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
          alt="Confronto scenari demografici alternativi: ISTAT mediano, ISTAT lower 90%, no-recovery."
          caption="Toggle gli scenari per confrontare. Tutte le traiettorie partono dal dato osservato 2024 (1,18)."
          plotOptions={{
            width: 1060,
            height: 460,
            marginTop: 30,
            marginRight: 20,
            marginBottom: 40,
            marginLeft: 50,
            y: { label: "TFR", grid: true, domain: [0.95, 1.6] },
            x: { label: null, tickFormat: (d: number) => String(d) },
            color: {
              domain: ["Osservato", "ISTAT mediano", "ISTAT lower 90%", "No-recovery"],
              range: [
                colors.historical,
                colors.projectionMediano,
                colors.projectionLower50,
                colors.scenarioAlt,
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
              <div key={e.label} className="flex items-baseline justify-between border-b border-[color:var(--color-border)] py-2">
                <span className="text-[color:var(--color-fg-muted)]">{e.label}</span>
                <span className="font-mono text-base">{e.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          La distanza tra ISTAT mediano e no-recovery al 2080 è di circa 0,28
          figli per donna: lo stesso ordine di grandezza della differenza tra
          il TFR italiano del 1995 (1,19) e quello del picco 2008 (1,45). In
          cinquantacinque anni di proiezione il modello produce un range di
          incertezza paragonabile all'intera oscillazione storica registrata
          negli ultimi venticinque anni.
        </p>
        <p>
          La scelta dello scenario di riferimento per i forecast economici di
          lungo periodo non è neutrale: la proiezione mediana, una delle
          molte possibili dentro l'intervallo di confidenza ISTAT, finisce
          per essere trattata come previsione puntuale.
        </p>
      </div>
    </Chapter>
  );
}
