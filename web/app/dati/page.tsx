import Link from "next/link";

const FILES = [
  {
    name: "tfr_historical.json",
    description: "TFT Italia 1999-2024, dato osservato annuale",
  },
  {
    name: "tfr_by_citizenship.json",
    description: "TFT per cittadinanza italiana/straniera 1999-2024",
  },
  {
    name: "projection_2024.json",
    description: "Proiezione ISTAT 2024, TFT per scenario 2024-2080 (7 scenari)",
  },
  {
    name: "scenarios_comparison.json",
    description: "Storico + ISTAT mediano + lower/upper 90% + no_recovery (aggregato)",
  },
];

export const metadata = {
  title: "Dati & download",
  description:
    "Download dei dataset JSON di nati-istat. Audit trail incluso in ogni file.",
};

export default function DatiPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-24">
      <h1>Dati &amp; download</h1>
      <p className="text-lg text-[color:var(--color-fg-muted)]">
        Tutti i dataset processati sono scaricabili come JSON. Ogni file
        include audit trail metadata con fonte primaria, data di download,
        versione pipeline e trasformazioni applicate.
      </p>

      <h2>Download diretti</h2>
      <div className="mt-6 space-y-3">
        {FILES.map((f) => (
          <a
            key={f.name}
            href={`/data/${f.name}`}
            download
            className="flex items-center justify-between rounded border border-[color:var(--color-border)] p-4 transition-colors hover:bg-[color:var(--color-surface)]"
          >
            <div>
              <div className="font-mono text-sm">{f.name}</div>
              <div className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                {f.description}
              </div>
            </div>
            <div className="font-mono text-xs text-[color:var(--color-fg-muted)]">
              JSON ↓
            </div>
          </a>
        ))}
      </div>

      <h2>Snapshot raw</h2>
      <p>
        I dati raw scaricati dalle fonti primarie sono nel repository, in{" "}
        <code>data/raw/</code>. Formato: CSV gzipped + manifest JSON con sha256.
        Sono committati per garantire riproducibilità verificabile anche se le
        API upstream cambiano.
      </p>
      <p>
        <a
          className="underline-offset-2 hover:underline"
          href="https://github.com/frescodicredito/nati-istat/tree/main/data/raw"
          target="_blank"
          rel="noopener noreferrer"
        >
          Browse snapshot raw su GitHub ↗
        </a>
      </p>

      <h2>Riproducibilità</h2>
      <p>
        Per rigenerare i JSON da zero (richiede{" "}
        <a className="underline-offset-2 hover:underline" href="https://docs.astral.sh/uv/">uv</a> installato):
      </p>
      <pre className="mt-4 overflow-x-auto rounded bg-[color:var(--color-surface)] p-4 text-sm">
        <code>{`git clone https://github.com/frescodicredito/nati-istat
cd nati-istat/pipeline
uv sync
uv run python build.py --validate-only`}</code>
      </pre>

      <h2>Schema dati</h2>
      <p>
        Ogni JSON segue lo schema <code>{`{audit, data}`}</code>:
      </p>
      <pre className="mt-4 overflow-x-auto rounded bg-[color:var(--color-surface)] p-4 text-xs">
        <code>{`{
  "audit": {
    "source": "ISTAT 25_326_DF_DCIS_FECONDITA1_5",
    "source_url": "http://sdmx.istat.it/SDMXWS/rest/data/...",
    "downloaded_at": "2026-05-16T00:00:00Z",
    "pipeline_version": "<git-sha>",
    "transforms_applied": ["filter_italia_total", "normalize_tfr_dataframe"],
    "validation_passed": true,
    "datapoint_count": 26,
    "notes": "..."
  },
  "data": [ { "year": 2024, "tfr": 1.18 }, ... ]
}`}</code>
      </pre>

      <div className="mt-12">
        <Link href="/" className="text-sm underline-offset-2 hover:underline">
          ← Torna al long-read
        </Link>
        <span className="mx-2 text-[color:var(--color-fg-subtle)]">·</span>
        <Link href="/metodologia" className="text-sm underline-offset-2 hover:underline">
          Metodologia
        </Link>
      </div>
    </main>
  );
}
