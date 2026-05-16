import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[680px] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
        Errore 404
      </div>
      <h1 className="!mt-0 mb-6">Pagina non trovata</h1>
      <p className="text-lg text-[color:var(--color-fg-muted)]">
        L&apos;indirizzo richiesto non esiste, oppure è stato spostato.
      </p>
      <div className="mt-12 flex gap-4 text-sm">
        <Link
          href="/"
          className="rounded border border-[color:var(--color-fg)] px-4 py-2 transition-colors hover:bg-[color:var(--color-fg)] hover:text-[color:var(--color-bg)]"
        >
          Torna al long-read
        </Link>
        <Link
          href="/dati"
          className="rounded border border-[color:var(--color-border)] px-4 py-2 text-[color:var(--color-fg-muted)] transition-colors hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg)]"
        >
          Dati &amp; download
        </Link>
      </div>
    </main>
  );
}
