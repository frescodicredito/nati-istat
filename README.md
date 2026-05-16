# nati-istat

Long-read editoriale e dashboard analitica sulle proiezioni demografiche ISTAT del tasso di fecondità italiano e le previsioni economiche che vi si basano.

**Stato:** in costruzione · maggio 2026

## Struttura repo

- `docs/` — Design spec, methodology, decisions
- `pipeline/` — Pipeline Python per acquisizione e processing dati (ISTAT, Eurostat, UN WPP, HFD)
- `data/raw/` — Snapshot frozen dei dataset scaricati (committed per riproducibilità)
- `data/processed/` — Output pipeline (JSON consumati dal frontend)
- `web/` — Next.js 15 app (frontend dashboard)
- `.github/workflows/` — CI per validazione pipeline e deploy

## Riproducibilità

```bash
git clone https://github.com/frescodicredito/nati-istat
cd nati-istat

# Rigenera dati processed da snapshot frozen
cd pipeline && uv sync && uv run python build.py --validate-only

# Build sito locale
cd ../web && pnpm install && pnpm dev
```

## Licenze

- Codice: MIT (vedi `LICENSE`)
- Contenuti editoriali: CC-BY-SA 4.0
- Dati ISTAT: CC-BY 3.0 IT (vedi `LICENSE-DATA`)

## Autore

Francesco Di Credico — [LinkedIn](https://www.linkedin.com/in/francescodicredico)
