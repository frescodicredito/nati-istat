"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { projection2024, tfrHistorical, unWpp } from "@/lib/data";
import { colors } from "@/lib/theme";

export function Chapter4Assumptions() {
  const historical = tfrHistorical.data.filter((d) => d.year >= 2000);
  const mediano = projection2024.data.filter((d) => d.scenario === "mediano");
  const lower50 = projection2024.data.filter((d) => d.scenario === "lower_50");
  const upper50 = projection2024.data.filter((d) => d.scenario === "upper_50");
  const lower90 = projection2024.data.filter((d) => d.scenario === "lower_90");
  const upper90 = projection2024.data.filter((d) => d.scenario === "upper_90");
  const unMedium = unWpp.data.filter((d) => d.scenario === "medium" && d.year >= 2024);

  const band50 = mediano.map((m) => ({
    year: m.year,
    lo: lower50.find((d) => d.year === m.year)?.value ?? m.value,
    hi: upper50.find((d) => d.year === m.year)?.value ?? m.value,
  }));
  const band90 = mediano.map((m) => ({
    year: m.year,
    lo: lower90.find((d) => d.year === m.year)?.value ?? m.value,
    hi: upper90.find((d) => d.year === m.year)?.value ?? m.value,
  }));

  const lower90_2080 = lower90.find((d) => d.year === 2080)?.value;
  const upper90_2080 = upper90.find((d) => d.year === 2080)?.value;
  const mediano_2080 = mediano.find((d) => d.year === 2080)?.value;

  return (
    <Chapter num={4} id="cap-4" title={chapterContent.c4.title} opening={chapterContent.c4.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <PlotChart
          alt="Proiezione ISTAT 2024 con bande di confidenza al 50% e al 90% sovrapposte alla mediana e al dato osservato. UN Medium come benchmark internazionale."
          caption="Banda interna 50%, banda esterna 90%. Il range al 2080 va da 1,12 a 1,82 con confidenza 90%."
          plotOptions={{
            width: 960,
            height: 440,
            marginTop: 30,
            marginRight: 30,
            marginBottom: 40,
            marginLeft: 50,
            y: { label: "TFR", grid: true, domain: [0.9, 2.0] },
            x: { label: null, tickFormat: (d: number) => String(d) },
            marks: [
              Plot.areaY(band90, {
                x: "year",
                y1: "lo",
                y2: "hi",
                fill: colors.projectionBand,
                fillOpacity: 0.3,
              }),
              Plot.areaY(band50, {
                x: "year",
                y1: "lo",
                y2: "hi",
                fill: colors.projectionLower50,
                fillOpacity: 0.4,
              }),
              Plot.lineY(unMedium, {
                x: "year",
                y: "value",
                stroke: colors.scenarioAlt,
                strokeWidth: 1.6,
                strokeDasharray: "4,3",
              }),
              Plot.lineY(mediano, {
                x: "year",
                y: "value",
                stroke: colors.projectionMediano,
                strokeWidth: 2.2,
              }),
              Plot.lineY(historical, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2.2,
              }),
            ],
          }}
        />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>Tre le assunzioni di modello della release ISTAT 2024:</p>
        <ul className="mt-4 ml-6 list-disc space-y-2">
          <li>
            <strong>Convergenza al target europeo</strong>: il TFR italiano
            converge gradualmente verso un livello compatibile con altri paesi
            EU a bassa fecondità (intorno a 1,4-1,5).
          </li>
          <li>
            <strong>Recupero della fecondità rinviata</strong>: le donne che
            hanno posticipato i figli in età 25-35 li avrebbero in età 35-45.
          </li>
          <li>
            <strong>Componente straniere stabile o crescente</strong>: la quota
            di donne in età fertile straniere resta significativa e sostiene
            il TFR aggregato.
          </li>
        </ul>
        <p>
          Lo scarto tra mediana e bande quantifica quanto la traiettoria
          dipende dalle assunzioni. Al 2080:
        </p>
        <ul className="mt-4 ml-6 list-disc space-y-1 font-mono text-sm">
          <li>Mediano: {mediano_2080?.toFixed(2) ?? "?"}</li>
          <li>Limite inferiore 90%: {lower90_2080?.toFixed(2) ?? "?"}</li>
          <li>Limite superiore 90%: {upper90_2080?.toFixed(2) ?? "?"}</li>
          <li>UN Medium: {unMedium.at(-1)?.value.toFixed(2) ?? "?"}</li>
        </ul>
        <p>
          Lo scarto tra limiti inferiore e superiore al 90% è di{" "}
          {upper90_2080 && lower90_2080
            ? (upper90_2080 - lower90_2080).toFixed(2)
            : "?"}{" "}
          figli per donna. È l'ammissione esplicita dell'incertezza del
          modello, raramente trasferita alle previsioni economiche derivate.
        </p>
      </div>
    </Chapter>
  );
}
