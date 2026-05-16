"use client";

import * as Plot from "@observablehq/plot";

import { PlotChart } from "@/components/charts/PlotChart";
import {
  projection2024,
  projectionBacktest,
  projectionsArchive,
  tfrHistorical,
} from "@/lib/data";
import { formatItalian } from "@/lib/format";
import { colors } from "@/lib/theme";

const RELEASE_COLORS: Record<number, string> = {
  2019: "#c8d8e8",
  2023: "#a8c0d8",
  2025: "#7b9fc4",
};

export function Hero() {
  const historical = tfrHistorical.data;
  const latest = historical.at(-1);
  const minHistorical = historical.reduce(
    (min, p) => (p.tfr < min.tfr ? p : min),
    historical[0]!,
  );
  const istatMediano = projection2024.data
    .filter((d) => d.scenario === "mediano")
    .map((d) => ({ release_year: 2024, year: d.year, tft: d.value }));
  const archiveAll = projectionsArchive.data;
  const allProjections = [
    ...archiveAll.map((d) => ({ ...d, label: `Eurostat ${d.release_year}` })),
    ...istatMediano.map((d) => ({ ...d, label: "ISTAT 2024" })),
  ];

  const bias2019 = projectionBacktest.data.find((b) => b.release_year === 2019)?.signed_bias ?? 0;
  const projection2080 = istatMediano.find((d) => d.year === 2080)?.tft ?? 0;

  return (
    <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto max-w-[1200px] px-6 pt-10 pb-4 sm:pt-14">
        <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
          Tasso di fecondità totale, Italia · 1952–2080
        </div>
        <h1 className="!mt-0 max-w-[820px] font-serif text-3xl leading-[1.05] tracking-tight sm:text-5xl">
          Le proiezioni si alzano.{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            Il dato no.
          </span>
        </h1>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-8">
        <PlotChart
          aspectRatio={0.4}
          alt="Tasso di fecondità totale italiano dal 1952 al 2024 in rosso (osservato), poi quattro linee di proiezione di varie release Eurostat (2019, 2023, 2025) e ISTAT (2024) che divergono verso l'alto fino al 2100."
          plotOptions={{
            marginTop: 30,
            marginRight: 30,
            marginBottom: 36,
            marginLeft: 50,
            y: {
              label: "Figli per donna",
              grid: true,
              domain: [1.0, 2.85],
              tickFormat: (d: number) => formatItalian(d, 1),
            },
            x: { label: null, tickFormat: (d: number) => String(Math.round(d)) },
            color: {
              domain: ["Eurostat 2019", "Eurostat 2023", "Eurostat 2025", "ISTAT 2024", "Osservato"],
              range: [
                RELEASE_COLORS[2019]!,
                RELEASE_COLORS[2023]!,
                RELEASE_COLORS[2025]!,
                colors.projectionMediano,
                colors.historical,
              ],
              legend: true,
            },
            marks: [
              Plot.ruleY([2.1], {
                stroke: colors.fgSubtle,
                strokeDasharray: "3,3",
                strokeOpacity: 0.5,
              }),
              Plot.text([{ year: 1956, value: 2.1 }], {
                x: "year",
                y: "value",
                text: ["Soglia rimpiazzo 2,1"],
                dy: -8,
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                fill: colors.fgSubtle,
                textAnchor: "start",
              }),
              Plot.lineY(allProjections, {
                x: "year",
                y: "tft",
                stroke: "label",
                strokeWidth: 1.6,
                z: "label",
              }),
              Plot.lineY(historical, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2.6,
              }),
              Plot.dot([{ year: latest?.year, tfr: latest?.tfr }], {
                x: "year",
                y: "tfr",
                r: 5,
                fill: colors.historical,
              }),
              Plot.text([{ year: latest?.year, tfr: latest?.tfr }], {
                x: "year",
                y: "tfr",
                text: [`Osservato ${latest?.year} = ${latest && formatItalian(latest.tfr, 2)}`],
                dx: -10,
                dy: 16,
                textAnchor: "end",
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                fill: colors.historical,
              }),
            ],
          }}
        />
      </div>

      <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px bg-[color:var(--color-border)] sm:grid-cols-4">
          <KpiCell
            label="TFT osservato 2024"
            value={latest && formatItalian(latest.tfr, 2)}
            sub={`Min storico (era ${minHistorical?.year}: ${formatItalian(minHistorical?.tfr ?? 0, 2)})`}
            accent={colors.historical}
          />
          <KpiCell
            label="ISTAT mediano 2080"
            value={formatItalian(projection2080, 2)}
            sub={`Recupero proiettato di +${formatItalian(projection2080 - (latest?.tfr ?? 0), 2)}`}
            accent={colors.projectionMediano}
          />
          <KpiCell
            label="Bias Eurostat 2019"
            value={`+${formatItalian(bias2019, 3)}`}
            sub="Sovra-stima media su 6 anni di overlap"
            accent={colors.historical}
          />
          <KpiCell
            label="Anni di dati"
            value="73"
            sub="ISTAT archive 1952–2024, fonte primaria"
          />
        </div>
      </div>
    </section>
  );
}

function KpiCell({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="bg-[color:var(--color-bg)] px-5 py-6 sm:px-6 sm:py-7">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
        {label}
      </div>
      <div
        className="mt-2 font-serif text-3xl font-bold sm:text-[2.25rem]"
        style={{ color: accent ?? "var(--color-fg)" }}
      >
        {value}
      </div>
      <div className="mt-2 text-xs leading-snug text-[color:var(--color-fg-muted)]">
        {sub}
      </div>
    </div>
  );
}
