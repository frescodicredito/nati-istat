"use client";

import { useState } from "react";

import type { AuditTrail } from "@/lib/types";

interface DataPointInfoProps {
  audit: AuditTrail;
}

/**
 * Tooltip ⓘ con audit trail metadata, mostrato on click/hover.
 * Hand-rolled invece di shadcn per bundle minimo.
 */
export function DataPointInfo({ audit }: DataPointInfoProps) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[10px] text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-fg)]"
        aria-label="Mostra audit trail metadata"
        aria-expanded={open}
      >
        ⓘ
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute top-full left-0 z-50 mt-1 w-72 rounded border border-[color:var(--color-border)] bg-white p-3 text-left text-xs shadow-lg"
        >
          <span className="block space-y-1">
            <span className="block">
              <strong>Fonte:</strong> {audit.source}
            </span>
            <span className="block">
              <strong>Scaricato:</strong> {audit.downloaded_at.slice(0, 10)}
            </span>
            <span className="block">
              <strong>Datapoint:</strong> {audit.datapoint_count}
            </span>
            <span className="block">
              <strong>Pipeline:</strong> <code>{audit.pipeline_version}</code>
            </span>
            {audit.transforms_applied.length > 0 && (
              <span className="block">
                <strong>Transforms:</strong> {audit.transforms_applied.join(" · ")}
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  );
}
