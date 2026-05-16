# 001 · Stack choice: Next.js + Python pipeline + Vercel

**Status:** Accepted · 2026-05-16

## Context

Dashboard editoriale long-read con dati demografici processati da fonti multiple. Necessità di rigore metodologico, riproducibilità verificabile, performance, hosting low-cost. Audience: italiano tecnico-curioso non specialista.

## Decision

- **Frontend**: Next.js 15 App Router + RSC + static export dove possibile
- **Pipeline dati**: Python con `uv`, separata dal frontend in `pipeline/`
- **Data layer**: JSON statici versionati committed nel repo
- **Hosting**: Vercel
- **Repo**: GitHub pubblico

## Alternatives considered

- **Streamlit / Dash** — estetica scadente, no controllo design, sembra "demo accademica"
- **Observable notebook** — rigoroso ma non personalizzabile, no SEO, no controllo UX
- **Astro + MDX** — ottimo per content-heavy, meno fluido per interazione dashboard
- **Backend Python (FastAPI) + DB** — overkill, dati cambiano mensilmente, no real-time needed

## Consequences

- **Riproducibilità chirurgica**: pipeline → JSON deterministici → frontend statico
- **Performance massima**: tutto pre-rendered, no client-side data fetching
- **Costo zero** su Vercel free tier
- **Trade-off**: aggiornamento dati richiede re-build (accettabile, dati mensili)
- **Conseguenza architetturale**: pipeline e frontend sono due sub-progetti indipendenti che si vedono solo via interfaccia file (JSON in `data/processed/`)
