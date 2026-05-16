"use client";

import * as Plot from "@observablehq/plot";
import { useEffect, useRef, useState } from "react";

interface PlotChartProps {
  plotOptions: Plot.PlotOptions;
  alt: string;
  caption?: React.ReactNode;
  className?: string;
}

/**
 * React wrapper per Observable Plot. Renderizza il chart in un container ref,
 * lo monta su useEffect e lo smonta su cleanup.
 *
 * Si re-monta su evento "theme-change" così picks up new CSS variables
 * (axis text color, grid color) dopo il toggle dark mode.
 */
export function PlotChart({ plotOptions, alt, caption, className }: PlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onTheme = () => setVersion((v) => v + 1);
    window.addEventListener("theme-change", onTheme);
    return () => window.removeEventListener("theme-change", onTheme);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const plot = Plot.plot(plotOptions);
    plot.setAttribute("role", "img");
    plot.setAttribute("aria-label", alt);
    plot.style.maxWidth = "100%";
    plot.style.height = "auto";
    plot.style.fontFamily = "var(--font-sans)";
    plot.style.background = "transparent";
    node.append(plot);
    return () => {
      plot.remove();
    };
  }, [plotOptions, alt, version]);

  return (
    <figure className={className}>
      <div ref={containerRef} className="w-full overflow-x-auto" />
      {caption && (
        <figcaption className="mt-3 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
