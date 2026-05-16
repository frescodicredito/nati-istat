import Link from "next/link";

import { ThemeToggle } from "./ThemeToggle";

const CHAPTERS = [
  { num: 1, anchor: "#cap-1", label: "Dato di partenza" },
  { num: 2, anchor: "#cap-2", label: "Ripresa 2003-2010" },
  { num: 3, anchor: "#cap-3", label: "Track record" },
  { num: 4, anchor: "#cap-4", label: "Assunzioni" },
  { num: 5, anchor: "#cap-5", label: "Cascata economica" },
  { num: 6, anchor: "#cap-6", label: "Scenari" },
];

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg)]/70">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6">
        <Link href="/" className="font-serif text-base font-semibold tracking-tight">
          TFT Italia
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {CHAPTERS.map((c) => (
            <a
              key={c.num}
              href={c.anchor}
              title={c.label}
              className="inline-flex h-7 w-7 items-center justify-center rounded font-mono text-xs text-[color:var(--color-fg-subtle)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-fg)]"
            >
              {c.num}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/metodologia"
            className="hidden px-2 py-1 text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)] sm:block"
          >
            Metodologia
          </Link>
          <Link
            href="/dati"
            className="hidden px-2 py-1 text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)] sm:block"
          >
            Dati
          </Link>
          <Link
            href="/metodologia"
            className="px-2 py-1 text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)] sm:hidden"
            aria-label="Metodologia"
          >
            Met.
          </Link>
          <Link
            href="/dati"
            className="px-2 py-1 text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)] sm:hidden"
            aria-label="Dati"
          >
            Dati
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
