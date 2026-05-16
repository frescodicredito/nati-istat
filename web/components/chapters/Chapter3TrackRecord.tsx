"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import {
  projection2024,
  projectionBacktest,
  projectionsArchive,
  tfrHistorical,
  unWpp,
} from "@/lib/data";
import { formatItalian, formatYear } from "@/lib/format";
import { colors } from "@/lib/theme";

const RELEASE_COLORS: Record<number, string> = {
  2019: "#c8d8e8",
  2023: "#7b9fc4",
  2025: "#1e5180",
};

export function Chapter3TrackRecord() {
  const historical = tfrHistorical.data.filter((d) => d.year >= 1999);
  const archiveAll = projectionsArchive.data;
  const istatMediano2024 = projection2024.data
    .filter((d) => d.scenario === "mediano")
    .map((d) => ({ release_year: 2024, year: d.year, tft: d.value }));
  const unMedium = unWpp.data
    .filter((d) => d.scenario === "medium" && d.year >= 2024)
    .map((d) => ({ year: d.year, value: d.value }));

  const allReleases = [
    ...archiveAll.map((d) => ({
      ...d,
      label: `Eurostat ${d.release_year}`,
    })),
    ...istatMediano2024.map((d) => ({
      ...d,
      label: "ISTAT 2024",
    })),
  ];

  const backtest = projectionBacktest.data;

  return (
    <Chapter num={3} id="cap-3" title={chapterContent.c3.title} opening={chapterContent.c3.opening}>
      <div className="mx-auto max-w-[1100px] px-6">
        <PlotChart
          alt="Confronto multi-release: TFT osservato 1999-2024 in rosso, e tre release di proiezioni Eurostat (2019, 2023, 2025) + ISTAT 2024 con varie sfumature di blu."
          caption={
            <>
              Ogni release di proiezione parte dal suo anno base e si estende fino al 2100. La
              serie osservata (rossa) copre il periodo 1999-2024. Dove proiezione e dato osservato
              si sovrappongono nasce il backtest empirico sotto.
            </>
          }
          plotOptions={{
            width: 1060,
            marginTop: 30,
            marginRight: 30,
            marginBottom: 40,
            marginLeft: 50,
            y: {
              label: "TFT (figli per donna)",
              grid: true,
              domain: [1.0, 1.7],
              tickFormat: (d: number) => formatItalian(d, 2),
            },
            x: { label: null, tickFormat: formatYear },
            color: {
              domain: ["Eurostat 2019", "Eurostat 2023", "Eurostat 2025", "ISTAT 2024"],
              range: [
                RELEASE_COLORS[2019]!,
                RELEASE_COLORS[2023]!,
                RELEASE_COLORS[2025]!,
                colors.projectionMediano,
              ],
              legend: true,
            },
            marks: [
              Plot.lineY(allReleases, {
                x: "year",
                y: "tft",
                stroke: "label",
                strokeWidth: 2,
                z: "label",
              }),
              Plot.lineY(historical, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2.6,
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
                text: ["Osservato 2024 = 1,18"],
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                fill: colors.historical,
                dx: -110,
                dy: 16,
              }),
            ],
          }}
        />
      </div>

      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Nel grafico ci sono quattro release di proiezioni: Eurostat 2019, 2023, 2025 e ISTAT
          2024. Ogni release parte dall'anno base in cui è stata pubblicata. Sui pochi anni in cui
          ciascuna proiezione si sovrappone con il dato osservato è possibile calcolare il bias
          empirico: differenza media tra valore proiettato e valore realizzato.
        </p>

        <div className="mt-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                <th className="py-2 text-left">Release</th>
                <th className="py-2 text-right">Anni testati</th>
                <th className="py-2 text-right">MAE</th>
                <th className="py-2 text-right">Bias firmato</th>
              </tr>
            </thead>
            <tbody>
              {backtest.map((row) => (
                <tr key={row.release_year} className="border-b border-[color:var(--color-border)]">
                  <td className="py-2.5 font-mono">Eurostat {row.release_year}</td>
                  <td className="py-2.5 text-right">
                    {row.n_overlap > 0
                      ? `${row.first_year}-${row.last_year} (${row.n_overlap})`
                      : "—"}
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    {row.mae !== null ? formatItalian(row.mae, 3) : "—"}
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    {row.signed_bias !== null
                      ? `${row.signed_bias > 0 ? "+" : ""}${formatItalian(row.signed_bias, 3)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-[color:var(--color-fg-muted)]">
            Bias positivo = la proiezione sovrastima il dato osservato. Tutte le release con
            sufficiente overlap mostrano bias positivo.
          </p>
        </div>

        <p className="mt-8">
          La release Eurostat 2019 ha sei anni di sovrapposizione con i dati realizzati e mostra
          un bias di +0,101 figli per donna. Significa che, in media, la proiezione di sei anni fa
          ha sovrastimato il TFT italiano di un decimo. La release 2023, più recente, ha bias
          ridotto a +0,038 ma sempre positivo. La release 2025, partendo dall'anno corrente, non
          ha ancora overlap.
        </p>
        <p>
          ISTAT 2024 (mediano blu scuro) parte dal punto osservato 2024 (1,18) ma proietta il
          recupero più rapido di tutte le release Eurostat. La differenza al 2080 tra ISTAT
          mediano e l'estensione lineare del trend osservato resta dell'ordine di 0,3 figli per
          donna.
        </p>
        <p>
          Il pattern empirico è coerente con la letteratura: le proiezioni di lungo periodo sul
          TFT in paesi a bassa fecondità tendono a sovra-stimare il dato realizzato per via
          dell'assunzione di mean reversion verso un livello stazionario più alto.
        </p>

        <div className="mt-12 grid grid-cols-3 gap-4 rounded border border-[color:var(--color-border)] p-5">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
              UN Medium 2080
            </div>
            <div className="mt-1 font-serif text-2xl">
              {formatItalian(unMedium.find((d) => d.year === 2080)?.value ?? 0, 2)}
            </div>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
              ISTAT mediano 2080
            </div>
            <div className="mt-1 font-serif text-2xl">
              {formatItalian(istatMediano2024.find((d) => d.year === 2080)?.tft ?? 0, 2)}
            </div>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
              Bias Eurostat 2019
            </div>
            <div className="mt-1 font-serif text-2xl text-[color:var(--color-historical)]">
              +{formatItalian(backtest.find((b) => b.release_year === 2019)?.signed_bias ?? 0, 3)}
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
