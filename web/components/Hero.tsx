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

  // Hero focus: divergenza tra il dato osservato 2000-2024 e le quattro
  // release di proiezione 2019-2024 che convergono tutte verso un recupero.
  // Niente trend lineare extrapolato: 56 anni di estrapolazione non sono
  // difendibili e producono una linea fuori dominio.
  const recentHistorical = historical.filter((d) => d.year >= 2000);
  const istatMediano = projection2024.data
    .filter((d) => d.scenario === "mediano" && d.year <= 2080)
    .map((d) => ({ release_year: 2024, year: d.year, tft: d.value }));
  const archiveAll = projectionsArchive.data.filter((d) => d.year <= 2080);
  const allProjections = [
    ...archiveAll.map((d) => ({ ...d, label: `Eurostat ${d.release_year}` })),
    ...istatMediano.map((d) => ({ ...d, label: "ISTAT 2024" })),
  ];

  const bias2019 = projectionBacktest.data.find((b) => b.release_year === 2019)?.signed_bias ?? 0;
  const projection2080 = istatMediano.find((d) => d.year === 2080)?.tft ?? 0;
  const eurostat2025_2080 = archiveAll
    .filter((d) => d.release_year === 2025)
    .reduce((max, d) => (d.year > max.year ? d : max), { year: 0, tft: 0, release_year: 2025 });

  return (
    <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-6 pb-3 sm:pt-10">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)] sm:text-xs">
          Tasso di fecondità totale, Italia · 2000 → 2080
        </div>
        <h1 className="!mt-0 max-w-[860px] font-serif text-[1.7rem] leading-[1.05] tracking-tight sm:text-4xl lg:text-[2.75rem]">
          Tutte le previsioni proiettano un recupero.{" "}
          <span className="text-[color:var(--color-fg-muted)]">Il dato osservato no.</span>
        </h1>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 pb-6">
        <PlotChart
          aspectRatio={0.42}
          maxHeight={420}
          alt="Tasso di fecondità totale italiano dal 2000 al 2024 in rosso (osservato, in calo da 1,45 a 1,18), poi quattro release di proiezione Eurostat 2019/2023/2025 e ISTAT 2024 che divergono tutte verso l'alto fino al 2080."
          plotOptions={{
            marginTop: 28,
            marginRight: 28,
            marginBottom: 36,
            marginLeft: 40,
            y: {
              label: "Figli per donna",
              grid: true,
              domain: [1.05, 1.6],
              tickFormat: (d: number) => formatItalian(d, 2),
            },
            x: {
              label: null,
              tickFormat: (d: number) => String(Math.round(d)),
              domain: [2000, 2080],
              ticks: [2000, 2010, 2020, 2024, 2030, 2040, 2050, 2060, 2070, 2080],
            },
            color: {
              domain: [
                "Osservato",
                "Eurostat 2019",
                "Eurostat 2023",
                "Eurostat 2025",
                "ISTAT 2024",
              ],
              range: [
                colors.historical,
                RELEASE_COLORS[2019]!,
                RELEASE_COLORS[2023]!,
                RELEASE_COLORS[2025]!,
                colors.projectionMediano,
              ],
              legend: true,
            },
            marks: [
              // Linea verticale "anno corrente" — separa osservato da proiezione
              Plot.ruleX([2024], {
                stroke: colors.fgSubtle,
                strokeDasharray: "2,3",
                strokeOpacity: 0.5,
              }),
              // Le 4 release proiezione
              Plot.lineY(allProjections, {
                x: "year",
                y: "tft",
                stroke: "label",
                strokeWidth: 2,
                z: "label",
              }),
              // Dato osservato 2000-2024
              Plot.lineY(
                recentHistorical.map((d) => ({ ...d, label: "Osservato" })),
                {
                  x: "year",
                  y: "tfr",
                  stroke: "label",
                  strokeWidth: 2.8,
                  z: "label",
                },
              ),
              // Punto + label sul 2024
              Plot.dot([{ year: latest?.year, tfr: latest?.tfr }], {
                x: "year",
                y: "tfr",
                r: 5,
                fill: colors.historical,
              }),
              Plot.text([{ year: latest?.year, tfr: latest?.tfr }], {
                x: "year",
                y: "tfr",
                text: [`2024: ${latest && formatItalian(latest.tfr, 2)}`],
                dx: -8,
                dy: 16,
                textAnchor: "end",
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                fill: colors.historical,
              }),
              // Label proiezioni al 2080
              Plot.text(
                [
                  {
                    year: 2080,
                    value: projection2080,
                    label: `ISTAT → ${formatItalian(projection2080, 2)}`,
                  },
                ],
                {
                  x: "year",
                  y: "value",
                  text: "label",
                  dx: -6,
                  dy: -8,
                  textAnchor: "end",
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  fontWeight: 600,
                  fill: colors.projectionMediano,
                },
              ),
              Plot.text(
                [
                  {
                    year: 2080,
                    value: eurostat2025_2080.tft,
                    label: `Eurostat 2025 → ${formatItalian(eurostat2025_2080.tft, 2)}`,
                  },
                ],
                {
                  x: "year",
                  y: "value",
                  text: "label",
                  dx: -6,
                  dy: 14,
                  textAnchor: "end",
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  fontWeight: 600,
                  fill: RELEASE_COLORS[2025]!,
                },
              ),
            ],
          }}
        />
      </div>

      <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px bg-[color:var(--color-border)] sm:grid-cols-4">
          <KpiCell
            label="TFT 2024"
            value={latest && formatItalian(latest.tfr, 2)}
            sub={`min storico (era ${minHistorical?.year}: ${formatItalian(minHistorical?.tfr ?? 0, 2)})`}
            accent={colors.historical}
          />
          <KpiCell
            label="ISTAT mediano 2080"
            value={formatItalian(projection2080, 2)}
            sub={`recupero proiettato +${formatItalian(projection2080 - (latest?.tfr ?? 0), 2)}`}
            accent={colors.projectionMediano}
          />
          <KpiCell
            label="Bias Eurostat 2019"
            value={`+${formatItalian(bias2019, 3)}`}
            sub="sovra-stima media su 6 anni di overlap"
            accent={colors.historical}
          />
          <KpiCell
            label="Anni di dati"
            value="73"
            sub="ISTAT archive 1952-2024, fonte primaria"
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
    <div className="bg-[color:var(--color-bg)] px-4 py-4 sm:px-5 sm:py-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
        {label}
      </div>
      <div
        className="mt-1.5 font-serif text-2xl font-bold leading-none sm:text-[1.875rem]"
        style={{ color: accent ?? "var(--color-fg)" }}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[11px] leading-snug text-[color:var(--color-fg-muted)] sm:text-xs">
        {sub}
      </div>
    </div>
  );
}
