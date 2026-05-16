"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { projection2024, tfrHistorical, unWpp } from "@/lib/data";
import { formatItalian, formatYear } from "@/lib/format";
import { colors } from "@/lib/theme";

export function Chapter3TrackRecord() {
  const historical = tfrHistorical.data;
  const last25 = historical.filter((d) => d.year >= 1999);
  const mediano = projection2024.data.filter((d) => d.scenario === "mediano");
  const lower90 = projection2024.data.filter((d) => d.scenario === "lower_90");
  const upper90 = projection2024.data.filter((d) => d.scenario === "upper_90");
  const unMedium = unWpp.data.filter((d) => d.scenario === "medium" && d.year >= 2024);

  const band = mediano.map((m) => {
    const lo = lower90.find((d) => d.year === m.year)?.value;
    const hi = upper90.find((d) => d.year === m.year)?.value;
    return { year: m.year, lo: lo ?? m.value, hi: hi ?? m.value, mediano: m.value };
  });

  // Trend lineare ultimi 10 anni
  const last10 = historical.slice(-10);
  const xs = last10.map((d) => d.year);
  const ys = last10.map((d) => d.tfr);
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * (ys[i] ?? 0), 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trend = Array.from({ length: 2080 - 2024 + 1 }, (_, i) => {
    const year = 2024 + i;
    return { year, value: Math.max(0.5, intercept + slope * year) };
  });

  return (
    <Chapter num={3} id="cap-3" title={chapterContent.c3.title} opening={chapterContent.c3.opening}>
      <div className="mx-auto max-w-[1100px] px-6">
        <PlotChart
          alt="Confronto TFR osservato 1999-2024, proiezione ISTAT 2024 con banda 90% confidenza, scenario UN Medium 2024-2080, trend lineare osservato 2014-2024 esteso."
          caption="Banda grigio-blu: intervallo di confidenza ISTAT al 90%. ISTAT mediano e UN Medium convergono entrambi verso un recupero del TFR. Il trend lineare osservato (tratteggiato grigio) e il limite inferiore al 90% ISTAT (bordo basso della banda) si collocano molto più in basso."
          plotOptions={{
            width: 1060,
            height: 480,
            marginTop: 30,
            marginRight: 30,
            marginBottom: 40,
            marginLeft: 50,
            y: {
              label: "TFR (figli per donna)",
              grid: true,
              domain: [0.9, 1.7],
              tickFormat: (d: number) => formatItalian(d, 2),
            },
            x: { label: null, tickFormat: formatYear },
            marks: [
              Plot.areaY(band, {
                x: "year",
                y1: "lo",
                y2: "hi",
                fill: colors.projectionBand,
                fillOpacity: 0.35,
              }),
              Plot.lineY(trend, {
                x: "year",
                y: "value",
                stroke: colors.fgSubtle,
                strokeWidth: 1.4,
                strokeDasharray: "4,3",
              }),
              Plot.text([{ year: 2070, value: trend[trend.length - 12]?.value ?? 1 }], {
                x: "year",
                y: "value",
                text: ["Trend 2014-2024 esteso"],
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fill: colors.fgMuted,
                dy: -12,
              }),
              Plot.lineY(unMedium, {
                x: "year",
                y: "value",
                stroke: colors.scenarioAlt,
                strokeWidth: 1.8,
                strokeDasharray: "5,3",
              }),
              Plot.text([{ year: 2076, value: unMedium.at(-25)?.value ?? 1.4 }], {
                x: "year",
                y: "value",
                text: ["UN Medium"],
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                fill: colors.scenarioAlt,
                dy: 14,
              }),
              Plot.lineY(mediano, {
                x: "year",
                y: "value",
                stroke: colors.projectionMediano,
                strokeWidth: 2.4,
              }),
              Plot.text([{ year: 2078, value: mediano[mediano.length - 3]?.value ?? 1.45 }], {
                x: "year",
                y: "value",
                text: ["ISTAT mediano"],
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                fill: colors.projectionMediano,
                dy: -12,
              }),
              Plot.lineY(last25, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2.4,
              }),
              Plot.dot([{ year: 2024, tfr: 1.18 }], {
                x: "year",
                y: "tfr",
                r: 4,
                fill: colors.historical,
              }),
              Plot.text([{ year: 2024, tfr: 1.18 }], {
                x: "year",
                y: "tfr",
                text: ["Osservato: 1,18"],
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                fill: colors.historical,
                dx: -90,
                dy: 18,
              }),
            ],
          }}
        />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Lo scenario mediano ISTAT al 2080 vale 1,46. Lo scenario Medium UN
          WPP per l'Italia, costruito con metodologia diversa e indipendente,
          arriva a 1,43. La coerenza tra le due stime ufficiali è alta, ed è
          spesso citata come conferma della loro affidabilità.
        </p>
        <p>
          Il problema è metodologico: entrambe le proiezioni applicano
          un'ipotesi di convergenza al lungo periodo (mean reversion verso
          livelli più alti) che non emerge dal trend osservato. Il dato
          osservato 2014-2024 esteso linearmente al 2080 dà 0,95. Lo scenario
          inferiore al 90% di confidenza di ISTAT (bordo basso della banda
          grigia) si ferma a 1,12. Tra 1,12 e 1,46 ci sono 0,34 figli per
          donna di differenza, accumulati in cinquantasei anni di scarto tra
          modello e dato.
        </p>
        <p className="text-sm italic text-[color:var(--color-fg-muted)]">
          Le release storiche delle proiezioni ISTAT (2007, 2011, 2017, 2021)
          non sono accessibili via SDMX moderno. Saranno integrate in
          un'iterazione successiva via estrazione dai report PDF originali per
          un confronto multi-release del track record (pattern noto in
          letteratura: bias sistematico al rialzo).
        </p>
      </div>
    </Chapter>
  );
}
