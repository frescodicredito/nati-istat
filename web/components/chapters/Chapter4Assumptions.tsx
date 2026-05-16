"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { projection2024, tfrHistorical } from "@/lib/data";
import { colors } from "@/lib/theme";

export function Chapter4Assumptions() {
  const historical = tfrHistorical.data;
  const mediano = projection2024.data.filter((d) => d.scenario === "mediano");
  const lower50 = projection2024.data.filter((d) => d.scenario === "lower_50");
  const upper50 = projection2024.data.filter((d) => d.scenario === "upper_50");
  const lower90 = projection2024.data.filter((d) => d.scenario === "lower_90");
  const upper90 = projection2024.data.filter((d) => d.scenario === "upper_90");

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

  return (
    <Chapter num={4} id="cap-4" title={chapterContent.c4.title} opening={chapterContent.c4.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <PlotChart
          alt="Proiezione 2024 con tutti gli intervalli di confidenza: banda 50% (più stretta), banda 90% (più ampia), mediana, e dato osservato."
          caption="Bande di confidenza ISTAT al 50% e al 90%. Lo scenario al 2080 secondo ISTAT può essere ovunque tra 1,12 e 1,82 con confidenza 90%."
          plotOptions={{
            width: 960,
            height: 420,
            marginTop: 30,
            marginRight: 20,
            marginBottom: 40,
            marginLeft: 50,
            y: { label: "TFR", grid: true, domain: [0.9, 1.95] },
            x: { label: null, tickFormat: (d: number) => String(d) },
            marks: [
              Plot.areaY(band90, {
                x: "year",
                y1: "lo",
                y2: "hi",
                fill: colors.projectionBand ?? "#c8d8e8",
                fillOpacity: 0.35,
              }),
              Plot.areaY(band50, {
                x: "year",
                y1: "lo",
                y2: "hi",
                fill: colors.projectionLower50,
                fillOpacity: 0.5,
              }),
              Plot.lineY(mediano, {
                x: "year",
                y: "value",
                stroke: colors.projectionMediano,
                strokeWidth: 2,
              }),
              Plot.lineY(historical, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2,
              }),
            ],
          }}
        />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>Tre le assunzioni di modello della release 2024:</p>
        <ul className="mt-4 ml-6 list-disc space-y-2">
          <li>
            <strong>Convergenza al target europeo</strong> — il TFR italiano
            converge gradualmente verso un livello compatibile con altri paesi
            EU con bassa fecondità (intorno a 1,4-1,5).
          </li>
          <li>
            <strong>Recupero della fecondità rinviata</strong> — le donne che
            hanno posticipato i figli in età 25-35 li avrebbero in età 35-45.
          </li>
          <li>
            <strong>Componente straniere stabile o crescente</strong> — la
            quota di donne in età fertile straniere resta significativa e
            sostiene il TFR aggregato.
          </li>
        </ul>
        <p>
          Tutte e tre sono ipotesi, non meccanismi osservati. Sul recupero
          della fecondità rinviata in particolare i dati cohort (capitolo 2)
          mostrano che le coorti italiane nate dopo il 1980 non stanno
          recuperando: stanno chiudendo la carriera riproduttiva con un
          numero medio di figli più basso, non più alto.
        </p>
      </div>
    </Chapter>
  );
}
