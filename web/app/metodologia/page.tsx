import Link from "next/link";

import {
  projection2024,
  scenarios,
  tfrCitizenship,
  tfrHistorical,
} from "@/lib/data";
import type { AuditTrail } from "@/lib/types";

const DATASETS: { title: string; audit: AuditTrail; anchor: string }[] = [
  {
    title: "D1 — TFT Italia 1999-2024",
    audit: tfrHistorical.audit,
    anchor: "datapoint-tfr",
  },
  {
    title: "D3 — TFT per cittadinanza italiane vs straniere",
    audit: tfrCitizenship.audit,
    anchor: "datapoint-citizenship",
  },
  {
    title: "D9 — Proiezioni ISTAT 2024 (TFT scenari 2024-2080)",
    audit: projection2024.audit,
    anchor: "datapoint-projection",
  },
  {
    title: "Scenari comparison aggregato",
    audit: scenarios.audit,
    anchor: "datapoint-scenarios",
  },
];

export const metadata = {
  title: "Metodologia",
  description:
    "Fonti, ipotesi, trasformazioni e codice del progetto TFT Italia. Pipeline interamente riproducibile.",
};

export default function MetodologiaPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-24">
      <h1>Metodologia</h1>
      <p className="text-lg text-[color:var(--color-fg-muted)]">
        Tutte le fonti, le assunzioni e le trasformazioni applicate ai dati di
        questo progetto. La pipeline è interamente riproducibile dal repo
        GitHub.
      </p>

      <h2>Fonti dati</h2>
      <div className="mt-6 space-y-6">
        {DATASETS.map((d) => (
          <article
            key={d.anchor}
            id={d.anchor}
            className="scroll-mt-20 rounded border border-[color:var(--color-border)] p-5"
          >
            <h3 className="!mt-0 mb-3 text-lg">{d.title}</h3>
            <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
              <dt className="text-[color:var(--color-fg-muted)]">Fonte</dt>
              <dd className="font-mono text-xs">{d.audit.source}</dd>

              <dt className="text-[color:var(--color-fg-muted)]">URL</dt>
              <dd>
                <a
                  href={d.audit.source_url}
                  className="break-all font-mono text-xs underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {d.audit.source_url}
                </a>
              </dd>

              <dt className="text-[color:var(--color-fg-muted)]">Scaricato</dt>
              <dd className="font-mono text-xs">
                {d.audit.downloaded_at.slice(0, 10)}
              </dd>

              <dt className="text-[color:var(--color-fg-muted)]">Datapoint</dt>
              <dd className="font-mono text-xs">{d.audit.datapoint_count}</dd>

              <dt className="text-[color:var(--color-fg-muted)]">Transforms</dt>
              <dd className="font-mono text-xs">
                {d.audit.transforms_applied.length
                  ? d.audit.transforms_applied.join(" · ")
                  : "—"}
              </dd>

              <dt className="text-[color:var(--color-fg-muted)]">Pipeline</dt>
              <dd className="font-mono text-xs">{d.audit.pipeline_version}</dd>

              {d.audit.notes && (
                <>
                  <dt className="text-[color:var(--color-fg-muted)]">Note</dt>
                  <dd className="text-xs">{d.audit.notes}</dd>
                </>
              )}
            </dl>
          </article>
        ))}
      </div>

      <h2>Trasformazioni implementate</h2>
      <ul className="mt-4 ml-6 list-disc space-y-2">
        <li>
          <strong>normalize_tfr_dataframe</strong> — filtro REF_AREA=IT +
          CITIZENSHIP=TOTAL, validazione range [0,5; 3,0], normalizzazione
          colonna anno e dedup.
        </li>
        <li>
          <strong>normalize_tfr_by_citizenship</strong> — stesso snapshot,
          filtro CITIZENSHIP=ITL/FRG, mapping codici → label italiani.
        </li>
        <li>
          <strong>normalize_projection_2024</strong> — filtro DATA_TYPE=TFT
          su 165_889_DF_DCIS_PREVDEM1_3, mapping scenari (PROJMED →
          &quot;mediano&quot;, PROJLOW90 → &quot;lower_90&quot;, ecc.).
        </li>
        <li>
          <strong>build_no_recovery_scenario</strong> — proietta TFT costante
          al livello dell&apos;ultimo anno osservato (1,18 per il 2024) fino
          al 2080.
        </li>
        <li>
          <strong>build_scenarios_comparison</strong> — aggrega storico +
          mediano + bande 90% ISTAT + nostro no_recovery in un singolo JSON.
        </li>
      </ul>

      <h2>Validazione automatica (CI-enforced)</h2>
      <p>
        Ogni build CI esegue una suite di test che validano i JSON
        processati: TFT sempre in <code>[0,5; 3,0]</code>, completezza anni
        senza buchi, presenza dei sette scenari ISTAT, monotonia{" "}
        <code>lower_90 ≤ mediano ≤ upper_90</code> per ciascun anno, audit
        trail completo. Una violazione blocca il deploy.
      </p>

      <h2>Riproducibilità</h2>
      <p>Dal repository:</p>
      <pre className="mt-4 overflow-x-auto rounded bg-[color:var(--color-surface)] p-4 text-sm">
        <code>{`git clone https://github.com/frescodicredito/nati-istat
cd nati-istat/pipeline
uv sync
uv run python build.py --validate-only   # Solo validazione su snapshot frozen
uv run python build.py                     # Build completa con refresh dati`}</code>
      </pre>
      <p>
        I dati raw scaricati sono committati in <code>data/raw/</code> con un
        manifest JSON adiacente che include URL upstream, sha256 e dimensioni.
        La pipeline è verificabile end-to-end anche se l&apos;API ISTAT
        cambia.
      </p>

      <h2>Limiti e caveat espliciti</h2>
      <ul className="mt-4 ml-6 list-disc space-y-2">
        <li>
          <strong>Range temporale TFT storico</strong>: 1999-2024. La serie
          ISTAT pre-1999 richiede un dataset archive separato e sarà integrata
          in iterazione successiva.
        </li>
        <li>
          <strong>Release storiche delle proiezioni</strong> (2007, 2011,
          2017, 2021): non ancora integrate. L&apos;analisi attuale confronta
          la sola release 2024 con il trend osservato. Le release storiche
          sono nell&apos;archivio ISTAT ma richiedono estrazione manuale dai
          report PDF/XLS pubblicati.
        </li>
        <li>
          <strong>Il TFT è un indicatore di periodo</strong>, soffre di tempo
          effects (postponement). Per analisi cohort-level (completed
          fertility) servirebbero dati Human Fertility Database, non ancora
          integrati.
        </li>
        <li>
          <strong>Cascata economica</strong>: presentata qualitativamente. Un
          modello macro completo che proietti spesa pensionistica/PIL fino al
          2080 è fuori scope.
        </li>
      </ul>

      <h2 id="bibliografia" className="scroll-mt-20">
        Riferimenti bibliografici
      </h2>
      <p className="text-sm text-[color:var(--color-fg-muted)]">
        Fonti academic citate nel cap 4 per il framework metodologico dei modelli di
        proiezione del TFT.
      </p>
      <ul className="mt-4 ml-6 list-disc space-y-3 text-sm">
        <li>
          <strong>Bongaarts, J. &amp; Sobotka, T.</strong> (2012).{" "}
          <em>
            A Demographic Explanation for the Recent Rise in European Fertility.
          </em>{" "}
          Population and Development Review, 38(1), 83-120.{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            — Definisce il framework di tempo distortion del TFT e fonda l'aspettativa
            di catch-up fertility usata da UN/Eurostat.
          </span>
        </li>
        <li>
          <strong>Goldstein, J. R., Sobotka, T. &amp; Jasilioniene, A.</strong> (2009).{" "}
          <em>The End of Lowest-Low Fertility?</em> Population and Development Review,
          35(4), 663-699.{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            — Paper che ha consolidato l'aspettativa di mean reversion in Europa.
            Citato nei documenti metodologici Eurostat.
          </span>
        </li>
        <li>
          <strong>Lutz, W. &amp; Skirbekk, V.</strong> (2014).{" "}
          <em>How education drives demography and knowledge informs projections.</em>
          {" "}In World Population &amp; Human Capital in the 21st Century (Oxford
          University Press).{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            — Approccio alternativo Wittgenstein Centre, basato su scenari di
            education invece che mean reversion. Non adottato da ISTAT/Eurostat.
          </span>
        </li>
        <li>
          <strong>Caltabiano, M., Castiglioni, M. &amp; Rosina, A.</strong> (2009).{" "}
          <em>Lowest-low fertility: signs of a recovery in Italy?</em> Demographic
          Research, 21(23), 681-718.{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            — Analizza l'evoluzione del TFT italiano per coorte 1950-1980 documentando
            inizi di recupero nelle regioni del Nord a metà 2000s. I dati post-2010,
            non disponibili al momento del paper, non hanno confermato il consolidamento
            di quel trend.
          </span>
        </li>
        <li>
          <strong>Human Fertility Database (HFD)</strong>. Max Planck Institute for
          Demographic Research &amp; Vienna Institute of Demography.{" "}
          <a
            className="underline underline-offset-2"
            href="https://www.humanfertility.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            humanfertility.org
          </a>{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            — Fonte per completed cohort fertility Italia (coorti 1940-1985). Non
            integrata nella pipeline di questo progetto, citata indirettamente.
          </span>
        </li>
        <li>
          <strong>ISTAT</strong> (2024). <em>Previsioni della popolazione residente
          e delle famiglie. Anni 2023-2080.</em>{" "}
          <a
            className="underline underline-offset-2"
            href="https://www.istat.it/it/archivio/295914"
            target="_blank"
            rel="noopener noreferrer"
          >
            istat.it/archivio/295914
          </a>{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            — Report metodologico ufficiale della release 2024 utilizzata in questo
            progetto.
          </span>
        </li>
      </ul>

      <h2>Licenze</h2>
      <ul className="mt-4 ml-6 list-disc space-y-1">
        <li>
          Dati ISTAT: <a className="underline-offset-2 hover:underline" href="https://creativecommons.org/licenses/by/3.0/it/">CC BY 3.0 IT</a>
        </li>
        <li>
          Codice del progetto: MIT
        </li>
        <li>
          Contenuti editoriali (testi, grafici composti, narrative): CC BY-SA 4.0
        </li>
      </ul>

      <div className="mt-12">
        <Link href="/" className="text-sm underline-offset-2 hover:underline">
          ← Torna al long-read
        </Link>
      </div>
    </main>
  );
}
