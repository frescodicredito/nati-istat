import Link from "next/link";

interface SourceCaptionProps {
  source: string;
  datapointId: string;
  sourceUrl?: string;
}

export function SourceCaption({ source, datapointId, sourceUrl }: SourceCaptionProps) {
  return (
    <span>
      Fonte:{" "}
      <Link
        href={`/metodologia#${datapointId}`}
        className="font-mono text-[color:var(--color-fg-muted)] underline-offset-2 hover:underline"
      >
        {source}
      </Link>
      {sourceUrl && (
        <>
          {" · "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            aria-label="Fonte primaria, apre in nuova scheda"
          >
            ↗
          </a>
        </>
      )}
    </span>
  );
}
