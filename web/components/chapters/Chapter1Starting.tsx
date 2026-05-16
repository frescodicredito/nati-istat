"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { tfrHistorical } from "@/lib/data";
import { formatItalian, formatYear } from "@/lib/format";
import { colors } from "@/lib/theme";

const EVENTS = [
  { year: 1964, tfr: 2.7, label: "Baby boom 1964 · 2,7", anchor: "start", dx: 8 },
  { year: 1995, tfr: 1.19, label: "Minimo 1995 · 1,19", anchor: "middle", dx: 0 },
  { year: 2008, tfr: 1.45, label: "Recupero 2008 · 1,45", anchor: "middle", dx: 0 },
  { year: 2024, tfr: 1.18, label: "2024 · 1,18", anchor: "end", dx: -8 },
];

export function Chapter1Starting() {
  return (
    <Chapter num={1} id="cap-1" title={chapterContent.c1.title} opening={chapterContent.c1.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <PlotChart
          alt="Tasso di fecondità totale italiano dal 1952 al 2024 con annotazioni su baby boom 1964 (2,7), minimo 1995 (1,19), recupero 2008 (1,45), minimo 2024 (1,18)."
          caption="Fonte: ISTAT archive DCIS_ARCH_FEC, 73 datapoint annuali. La linea orizzontale al livello 2,1 indica la soglia di rimpiazzo generazionale."
          plotOptions={{
            width: 960,
            height: 460,
            marginTop: 30,
            marginRight: 40,
            marginBottom: 40,
            marginLeft: 50,
            y: {
              label: "Figli per donna",
              grid: true,
              domain: [1.0, 2.95],
              tickFormat: (d: number) => formatItalian(d, 1),
            },
            x: { label: null, tickFormat: formatYear },
            marks: [
              Plot.ruleY([2.1], {
                stroke: colors.fgSubtle,
                strokeDasharray: "3,3",
                strokeOpacity: 0.6,
              }),
              Plot.text([{ year: 1956, value: 2.1 }], {
                x: "year",
                y: "value",
                text: ["Soglia rimpiazzo 2,1"],
                dy: -6,
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                fill: colors.fgSubtle,
                textAnchor: "start",
              }),
              Plot.lineY(tfrHistorical.data, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2.2,
              }),
              ...EVENTS.map((ev) =>
                Plot.dot([ev], {
                  x: "year",
                  y: "tfr",
                  r: 4,
                  fill: colors.historical,
                }),
              ),
              ...EVENTS.map((ev) =>
                Plot.text([ev], {
                  x: "year",
                  y: "tfr",
                  text: "label",
                  dy: -14,
                  dx: ev.dx,
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  fontWeight: 500,
                  fill: colors.fg,
                  textAnchor: ev.anchor as "start" | "middle" | "end",
                }),
              ),
            ],
          }}
        />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Il TFT italiano scende dalla soglia di rimpiazzo generazionale (2,1)
          intorno al 1976 e non ci ritorna più. La discesa dura trent'anni, dal
          1965 al 1995, riflettendo cambiamenti culturali (modelli familiari,
          ingresso femminile nel mercato del lavoro, posticipo dell'età del
          primo figlio) ed economici.
        </p>
        <p>
          La risalita 2003-2008 da 1,29 a 1,45 è il primo recupero strutturale
          dal dopoguerra. La spiegazione, mostrata nel capitolo successivo, sta
          per metà nella crescita della popolazione straniera in età fertile.
          Dal 2010 il declino riparte: 2015=1,35, 2020=1,24, 2024=1,18, valore
          inferiore al precedente minimo storico del 1995.
        </p>
      </div>
    </Chapter>
  );
}
