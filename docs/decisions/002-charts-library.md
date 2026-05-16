# 002 · Charts library: Observable Plot + D3 raw

**Status:** Accepted · 2026-05-16

## Context

Charts roster di 11 visualizzazioni:
- 8 standard editoriali (line, multi-line, bridge, small multiples, forecast cone)
- 3 custom complessi: killer chart cap 3 (5 release proiezioni con hover annotation), cascade cap 5, scenario comparator cap 6

## Decision

- **Observable Plot** per chart standard (8 di 11): API dichiarativa, stile editoriale consistente, basato su D3
- **D3 raw** per i 3 custom: customizzazione profonda necessaria
- **No Recharts** (decisione invertita rispetto a brainstorming iniziale)

## Rationale

- Plot copre 90% dei casi con boilerplate minimo
- Stile editoriale consistente (font, color tokens applicati globalmente via theme)
- D3 raw quando serve, senza dover imparare due librerie diverse
- Bundle splitting: D3 caricato solo nelle pagine che lo usano (cap 3, 5, 6) via dynamic import

## Consequences

- Single chart family mentale (Plot + D3, stessa famiglia)
- Più lavoro iniziale per setup PlotChart wrapper React-friendly
- Riusabilità alta tra chart standard
- Bundle frontend leggero: D3 + Plot ≈ 80 KB gzipped
