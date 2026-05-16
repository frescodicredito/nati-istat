import { tfrHistorical } from "@/lib/data";
import { formatItalian } from "@/lib/format";

export function Hero() {
  const data = tfrHistorical.data;
  const latest = data.at(-1);
  const minHistorical = data.reduce((min, p) => (p.tfr < min.tfr ? p : min), data[0]!);
  const isLatestMin = latest && minHistorical && latest.tfr === minHistorical.tfr;

  return (
    <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[820px] px-6">
        <div className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
          Tasso di fecondità totale · Italia · {latest?.year}
        </div>
        <div className="font-serif text-7xl font-bold leading-none tracking-tight text-[color:var(--color-historical)] sm:text-[10rem]">
          {latest && formatItalian(latest.tfr, 2)}
        </div>
        <div className="mt-6 max-w-[560px] font-serif text-2xl leading-tight text-[color:var(--color-fg)] sm:text-3xl">
          figli per donna.{" "}
          {isLatestMin ? (
            <span className="text-[color:var(--color-fg-muted)]">
              Il valore più basso mai registrato in Italia, dal 1952 in poi.
            </span>
          ) : (
            <span className="text-[color:var(--color-fg-muted)]">
              Minimo storico {minHistorical?.year}: {formatItalian(minHistorical?.tfr ?? 0, 2)}.
            </span>
          )}
        </div>
        <div className="mt-10 max-w-[640px] text-base leading-relaxed text-[color:var(--color-fg-muted)]">
          ISTAT proietta un recupero progressivo fino a 1,46 nel 2080. Le release Eurostat 2019 e
          2023, fatti i conti, hanno tutte sovra-stimato il dato osservato. Questo è il track
          record empirico e le sue implicazioni.
        </div>
      </div>
    </section>
  );
}
