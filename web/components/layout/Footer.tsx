import Link from "next/link";

import { tfrHistorical } from "@/lib/data";

export function Footer() {
  const updated = tfrHistorical.audit.downloaded_at.slice(0, 10);
  return (
    <footer className="mt-32 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto max-w-[1200px] px-6 py-12 text-sm text-[color:var(--color-fg-muted)]">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-2 font-serif text-base font-semibold text-[color:var(--color-fg)]">
              TFT Italia
            </div>
            <p>
              Le proiezioni demografiche del tasso di fecondità totale italiano
              confrontate con i dati osservati 1952-2024.
            </p>
          </div>
          <div>
            <div className="mb-2 font-semibold text-[color:var(--color-fg)]">Risorse</div>
            <ul className="space-y-1">
              <li>
                <Link href="/metodologia" className="hover:underline">
                  Metodologia
                </Link>
              </li>
              <li>
                <Link href="/dati" className="hover:underline">
                  Dati &amp; download
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/frescodicredito/nati-istat"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Repo GitHub ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-2 font-semibold text-[color:var(--color-fg)]">Info</div>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://www.linkedin.com/in/francescodicredico"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Autore: Francesco Di Credico
                </a>
              </li>
              <li>Codice: MIT · Contenuti: CC-BY-SA 4.0</li>
              <li>Dati aggiornati al: {updated}</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
