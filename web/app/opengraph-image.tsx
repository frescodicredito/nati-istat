import { ImageResponse } from "next/og";

import { tfrHistorical } from "@/lib/data";
import { formatItalian } from "@/lib/format";

export const runtime = "edge";
export const alt =
  "TFT Italia — Le proiezioni del tasso di fecondità confrontate con il dato osservato";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const data = tfrHistorical.data;
  const latest = data.at(-1);
  const recent = data.filter((d) => d.year >= 1990);

  // Mini sparkline path da serie 1990-2024
  const xMin = recent[0]!.year;
  const xMax = recent.at(-1)!.year;
  const yMin = Math.min(...recent.map((d) => d.tfr));
  const yMax = Math.max(...recent.map((d) => d.tfr));
  const width = 1000;
  const height = 180;
  const xScale = (y: number) => ((y - xMin) / (xMax - xMin)) * width;
  const yScale = (v: number) => height - ((v - yMin) / (yMax - yMin)) * height;
  const points = recent.map((d) => `${xScale(d.year).toFixed(1)},${yScale(d.tfr).toFixed(1)}`).join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#fafafa",
          padding: 70,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "#888",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          TFT Italia · maggio 2026
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
          <div style={{ fontSize: 140, fontWeight: 700, color: "#a8260b", lineHeight: 0.95 }}>
            {latest && formatItalian(latest.tfr, 2)}
          </div>
          <div style={{ fontSize: 28, color: "#5a5a5a", lineHeight: 1.3, maxWidth: 520 }}>
            figli per donna in Italia nel {latest?.year}.<br />
            Minimo dal 1952.
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 30 }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline points={points} fill="none" stroke="#a8260b" strokeWidth="3" />
          </svg>
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: 22,
            color: "#1a1a1a",
            lineHeight: 1.4,
            fontStyle: "italic",
          }}
        >
          Le proiezioni del tasso di fecondità italiano contro il dato osservato.
          Track record empirico e implicazioni economiche.
        </div>
      </div>
    ),
    { ...size },
  );
}
