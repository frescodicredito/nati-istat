"use client";

import * as Plot from "@observablehq/plot";
import { useEffect, useRef, useState } from "react";

interface PlotChartProps {
  plotOptions: Plot.PlotOptions;
  alt: string;
  caption?: React.ReactNode;
  className?: string;
  /**
   * Aspect ratio ottimale (height/width). Usato per calcolare height dinamica
   * dal container width. Default 0.45 (≈ 16:7.2). Override per chart particolari.
   */
  aspectRatio?: number;
  /**
   * Larghezza minima sotto la quale il chart resta a quella misura e si
   * scrolla orizzontale. Default 320 (mobile-safe).
   */
  minWidth?: number;
  /**
   * Cap massimo sull'altezza in pixel. Utile per chart Hero che devono
   * stare nel viewport. Se omesso, height = width * aspectRatio.
   */
  maxHeight?: number;
}

/**
 * React wrapper per Observable Plot. Responsive via ResizeObserver:
 * il chart re-renderizza con la larghezza del container ogni volta che
 * cambia (resize, theme switch, mount).
 */
export function PlotChart({
  plotOptions,
  alt,
  caption,
  className,
  aspectRatio = 0.45,
  minWidth = 320,
  maxHeight,
}: PlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const onTheme = () => setThemeVersion((v) => v + 1);
    window.addEventListener("theme-change", onTheme);
    return () => window.removeEventListener("theme-change", onTheme);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(Math.max(minWidth, Math.round(entry.contentRect.width)));
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [minWidth]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || width === 0) return;
    let dynamicHeight = plotOptions.height ?? Math.round(width * aspectRatio);
    if (maxHeight !== undefined) dynamicHeight = Math.min(dynamicHeight, maxHeight);
    const opts: Plot.PlotOptions = {
      ...plotOptions,
      width,
      height: dynamicHeight,
    };
    const plot = Plot.plot(opts);
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
  }, [plotOptions, alt, width, themeVersion, aspectRatio]);

  const placeholderStyle: React.CSSProperties = maxHeight
    ? { maxHeight: `${maxHeight}px`, aspectRatio: `1 / ${aspectRatio}` }
    : { aspectRatio: `1 / ${aspectRatio}` };

  return (
    <figure className={className}>
      <div ref={containerRef} className="w-full" style={placeholderStyle} />
      {caption && (
        <figcaption className="mt-3 px-6 text-xs leading-relaxed text-[color:var(--color-fg-muted)] sm:px-0">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
