"use client";

import * as Plot from "@observablehq/plot";

import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { projection2024, tfrHistorical } from "@/lib/data";
import { colors } from "@/lib/theme";

export function Chapter0Opening() {
  // Replica fedele del grafico ISTAT/Kalistat: range 1998-2080, focus moderno
  const historical = tfrHistorical.data.filter((d) => d.year >= 1998);
  const mediano = projection2024.data.filter((d) => d.scenario === "mediano");

  const data = [
    ...historical.map((d) => ({ year: d.year, value: d.tfr, kind: "Osservato" })),
    ...mediano.map((d) => ({ year: d.year, value: d.value, kind: "Proiezione ISTAT 2024" })),
  ];

  return (
    <section id="cap-0" className="scroll-mt-20 pt-24 pb-16">
      <div className="mx-auto max-w-[680px] px-6">
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
          Apertura
        </div>
        <h1 className="!mt-0">{chapterContent.c0.title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          {chapterContent.c0.opening}
        </p>
      </div>
      <div className="mt-12">
        <div className="mx-auto max-w-[960px] px-6">
          <PlotChart
            alt="Replica grafico ISTAT: TFR osservato 1999-2024 in rosso, proiezione mediana 2024 in blu."
            caption={
              <>
                Fonte: ISTAT DCIS_FECONDITA1 (osservato) + 165_889_DF_DCIS_PREVDEM1_3
                (proiezione 2024, scenario mediano).
              </>
            }
            plotOptions={{
              width: 960,
              height: 420,
              marginTop: 30,
              marginRight: 20,
              marginBottom: 40,
              marginLeft: 50,
              y: {
                label: "Figli per donna",
                grid: true,
                domain: [1.15, 1.5],
              },
              x: {
                label: null,
                tickFormat: (d: number) => String(d),
              },
              color: {
                domain: ["Osservato", "Proiezione ISTAT 2024"],
                range: [colors.historical, colors.projectionMediano],
                legend: true,
              },
              marks: [
                Plot.ruleY([1.18], {
                  stroke: colors.fgSubtle,
                  strokeDasharray: "2,3",
                  strokeOpacity: 0.6,
                }),
                Plot.text([{ x: 2002, y: 1.18 }], {
                  x: "x",
                  y: "y",
                  text: ["1,18"],
                  dy: -8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fill: colors.fgSubtle,
                }),
                Plot.lineY(data, {
                  x: "year",
                  y: "value",
                  stroke: "kind",
                  strokeWidth: 2.2,
                }),
                Plot.dot(
                  [{ year: 2024, value: 1.18, kind: "Osservato" }],
                  { x: "year", y: "value", fill: colors.historical, r: 4 },
                ),
              ],
            }}
          />
        </div>
      </div>
    </section>
  );
}
