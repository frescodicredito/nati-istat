"use client";

import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";

interface PlotChartProps {
  plotOptions: Plot.PlotOptions;
  alt: string;
  caption?: React.ReactNode;
  className?: string;
}

/**
 * React wrapper per Observable Plot.
 * Renderizza il chart in un container ref, lo monta su useEffect e
 * lo smonta su cleanup. Accessibilità: role="img" + aria-label.
 */
export function PlotChart({ plotOptions, alt, caption, className }: PlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const plot = Plot.plot(plotOptions);
    plot.setAttribute("role", "img");
    plot.setAttribute("aria-label", alt);
    plot.style.maxWidth = "100%";
    plot.style.height = "auto";
    plot.style.fontFamily = "var(--font-sans)";
    node.append(plot);
    return () => {
      plot.remove();
    };
  }, [plotOptions, alt]);

  return (
    <figure className={className}>
      <div ref={containerRef} className="w-full" />
      {caption && (
        <figcaption className="mt-3 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
