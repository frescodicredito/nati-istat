import { tfrHistorical } from "@/lib/data";

export default function Home() {
  const latest = tfrHistorical.data.at(-1);
  return (
    <main className="mx-auto max-w-[680px] px-6 py-24">
      <h1>nati-istat</h1>
      <p className="text-lg text-[color:var(--color-fg-muted)]">
        Le proiezioni demografiche ISTAT del tasso di fecondità italiano,
        confrontate con i dati osservati.
      </p>
      <p>
        <strong>Smoke test</strong> — ultimo TFR osservato:{" "}
        <code>{latest?.tfr.toFixed(2)}</code> nel <code>{latest?.year}</code>.
        Fonte: <code>{tfrHistorical.audit.source}</code>. Pipeline:{" "}
        <code>{tfrHistorical.audit.pipeline_version}</code>.
      </p>
      <p className="text-sm text-[color:var(--color-fg-muted)]">
        Capitoli e grafici in costruzione nelle prossime fasi.
      </p>
    </main>
  );
}
