"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { tfrCitizenship } from "@/lib/data";
import { formatItalian, formatYear } from "@/lib/format";
import { colors } from "@/lib/theme";

export function Chapter2Decomposition() {
  return (
    <Chapter num={2} id="cap-2" title={chapterContent.c2.title} opening={chapterContent.c2.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <PlotChart
          alt="TFR italiane vs straniere dal 1999 al 2024. Le straniere sempre sopra 1.7 nei primi anni, in declino verso 1.7. Le italiane in declino lento da 1.2 a 1.1."
          caption="Fonte: ISTAT DCIS_FECONDITA1 con breakdown CITTADINANZA (italiane=ITL, straniere=FRG)."
          plotOptions={{
            width: 960,
            height: 380,
            marginTop: 30,
            marginRight: 20,
            marginBottom: 40,
            marginLeft: 50,
            y: {
              label: "Figli per donna",
              grid: true,
              domain: [1.0, 2.9],
              tickFormat: (d: number) => formatItalian(d, 1),
            },
            x: { label: null, tickFormat: formatYear },
            color: {
              domain: ["italiane", "straniere"],
              range: [colors.projectionMediano, colors.scenarioAlt],
              legend: true,
            },
            marks: [
              Plot.lineY(tfrCitizenship.data, {
                x: "year",
                y: "tfr",
                stroke: "citizenship",
                strokeWidth: 2.2,
              }),
            ],
          }}
        />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          La distanza tra le due curve è strutturale: il TFR delle straniere
          residenti in Italia è stato per anni mezzo punto o più sopra quello
          delle italiane, perché molte appartengono a coorti immigrate con
          modelli familiari diversi.
        </p>
        <p>
          Tra il 2003 e il 2008 sono cresciute due cose: il TFR delle straniere
          ha continuato a essere alto e il loro peso sul totale è aumentato
          con i nuovi flussi migratori. La risalita aggregata del TFR italiano
          in quegli anni è stata in larga misura un effetto composizione, non
          un cambiamento di comportamento.
        </p>
        <p>
          Da circa il 2010 entrambi i driver si sono esauriti: il TFR delle
          straniere è in declino (assimilazione ai modelli locali), i flussi
          migratori netti si sono ridotti, le coorti di donne italiane in età
          fertile diventano numericamente sempre più piccole.
        </p>
      </div>
    </Chapter>
  );
}
