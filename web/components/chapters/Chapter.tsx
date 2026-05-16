import type { ReactNode } from "react";

interface ChapterProps {
  num: number;
  id: string;
  title: string;
  opening: string;
  children: ReactNode;
}

export function Chapter({ num, id, title, opening, children }: ChapterProps) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-[color:var(--color-border)] py-24">
      <div className="mx-auto max-w-[680px] px-6">
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
          Capitolo {num.toString().padStart(2, "0")}
        </div>
        <h2 className="!mt-0 mb-6">{title}</h2>
        <p className="text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
          {opening}
        </p>
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}
