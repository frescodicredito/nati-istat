"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { tfrHistorical } from "@/lib/data";
import { colors } from "@/lib/theme";

const EVENTS = [
  { year: 2008, tfr: 1.45, label: "Recupero 2008" },
  { year: 2024, tfr: 1.18, label: "Minimo 2024" },
];

export function Chapter1Starting() {
  return (
    <Chapter num={1} id="cap-1" title={chapterContent.c1.title} opening={chapterContent.c1.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <PlotChart
          alt="Tasso di fecondità totale italiano dal 1999 al 2024 con annotazioni sul picco 2008 e sul minimo 2024."
          caption="Fonte: ISTAT DCIS_FECONDITA1, download 2026-05-16. Dataset condiviso con i dati per cittadinanza del capitolo 2."
          plotOptions={{
            width: 960,
            height: 420,
            marginTop: 30,
            marginRight: 20,
            marginBottom: 40,
            marginLeft: 50,
            y: { label: "Figli per donna", grid: true, domain: [1.1, 1.55] },
            x: { label: null, tickFormat: (d: number) => String(d) },
            marks: [
              Plot.ruleY([1.18], {
                stroke: colors.fgSubtle,
                strokeDasharray: "2,3",
                strokeOpacity: 0.5,
              }),
              Plot.lineY(tfrHistorical.data, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2.2,
              }),
              Plot.dot(EVENTS, {
                x: "year",
                y: "tfr",
                r: 4,
                fill: colors.historical,
              }),
              Plot.text(EVENTS, {
                x: "year",
                y: "tfr",
                text: "label",
                dy: -14,
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fill: colors.fg,
                textAnchor: "middle",
              }),
            ],
          }}
        />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Tra il 1999 e il 2008 il TFR è risalito da 1,23 a 1,45. Da quel
          punto, declino sostanzialmente continuo: 2010=1,46, 2015=1,35,
          2020=1,24, 2023=1,20, 2024=1,18. Il dato 2024 è il valore più
          basso mai registrato — inferiore al minimo del 1995 (1,19), allora
          considerato il pavimento storico.
        </p>
        <p>
          Il prossimo capitolo scompone i 25 anni di osservazione per
          cittadinanza, mostrando perché la breve risalita 2003-2008 non era
          un cambio di paradigma.
        </p>
      </div>
    </Chapter>
  );
}
