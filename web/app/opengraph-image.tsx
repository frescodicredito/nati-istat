import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "nati-istat — Le proiezioni demografiche ISTAT del tasso di fecondità italiano vs i dati osservati";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#fafafa",
          padding: 80,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "#888",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          nati-istat · maggio 2026
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Le proiezioni ISTAT del tasso di
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: "#a8260b",
            lineHeight: 1.05,
          }}
        >
          fecondità italiano contro i dati.
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: 22,
            color: "#5a5a5a",
            lineHeight: 1.4,
          }}
        >
          Track record metodologico delle proiezioni demografiche italiane.
          Release 2024 e scenari alternativi.
        </div>
      </div>
    ),
    { ...size },
  );
}
