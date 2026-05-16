"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { projection2024, tfrHistorical } from "@/lib/data";
import { colors } from "@/lib/theme";

export function Chapter3TrackRecord() {
  const historical = tfrHistorical.data;
  const mediano = projection2024.data.filter((d) => d.scenario === "mediano");
  const lower90 = projection2024.data.filter((d) => d.scenario === "lower_90");
  const upper90 = projection2024.data.filter((d) => d.scenario === "upper_90");

  // Banda confidence: pivot lower/upper per year
  const band = mediano.map((m) => {
    const lo = lower90.find((d) => d.year === m.year)?.value;
    const hi = upper90.find((d) => d.year === m.year)?.value;
    return { year: m.year, lo: lo ?? m.value, hi: hi ?? m.value, mediano: m.value };
  });

  // Extension del trend osservato lineare (semplice projection ultima decade)
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
          alt="Confronto tra TFR osservato 1999-2024, proiezione ISTAT 2024 mediana con banda 90% confidenza, e trend lineare osservato 2014-2024 esteso."
          caption={
            <>
              Banda grigio-blu: intervallo di confidenza al 90% della proiezione ISTAT 2024.
              Linea tratteggiata: estensione lineare del trend osservato 2014-2024. Il limite
              inferiore al 90% di ISTAT coincide approssimativamente con la prosecuzione del
              trend osservato. Lo scenario mediano si discosta progressivamente.
            </>
          }
          plotOptions={{
            width: 1060,
            height: 460,
            marginTop: 30,
            marginRight: 20,
            marginBottom: 40,
            marginLeft: 50,
            y: { label: "TFR (figli per donna)", grid: true, domain: [0.9, 1.65] },
            x: { label: null, tickFormat: (d: number) => String(d) },
            marks: [
              // Banda 90% confidence
              Plot.areaY(band, {
                x: "year",
                y1: "lo",
                y2: "hi",
                fill: colors.projectionBand ?? "#c8d8e8",
                fillOpacity: 0.4,
              }),
              // Trend lineare osservato esteso
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
                text: ["Trend osservato esteso"],
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fill: colors.fgMuted,
                dy: -10,
              }),
              // Mediana ISTAT
              Plot.lineY(mediano, {
                x: "year",
                y: "value",
                stroke: colors.projectionMediano,
                strokeWidth: 2.2,
              }),
              Plot.text([{ year: 2078, value: mediano[mediano.length - 3]?.value ?? 1.45 }], {
                x: "year",
                y: "value",
                text: ["ISTAT mediano"],
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                fill: colors.projectionMediano,
                dy: -10,
              }),
              // Osservato
              Plot.lineY(historical, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2.2,
              }),
              Plot.text([{ year: 2024, tfr: 1.18 }], {
                x: "year",
                y: "tfr",
                text: ["Osservato → 2024 = 1,18"],
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                fill: colors.historical,
                dx: -100,
                dy: 12,
              }),
            ],
          }}
        />
      </div>
      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Lo scenario mediano ISTAT al 2080 è 1,46. Lo scenario inferiore al
          90% di confidenza è 1,12: praticamente l'estensione del trend
          osservato negli ultimi dieci anni. La distanza tra mediano e limite
          inferiore quantifica quanto la proiezione ufficiale dipende dalle
          ipotesi di recupero (cap 4).
        </p>
        <p>
          Il limite superiore al 90% (non mostrato) arriva a 1,82 nel 2080:
          ben sopra la sostituzione (2,1) sarebbe servito per stabilizzare la
          popolazione. Nessuna evidenza nei dati osservati supporta questa
          traiettoria.
        </p>
        <p className="text-sm italic text-[color:var(--color-fg-muted)]">
          In una versione successiva di questo lavoro verranno aggiunte anche
          le release storiche delle proiezioni ISTAT (2007, 2011, 2017, 2021)
          per un confronto multi-release. Il pattern atteso, già documentato
          da ricerche demografiche europee, è una sovra-stima sistematica delle
          release più vecchie rispetto al dato realizzato.
        </p>
      </div>
    </Chapter>
  );
}
