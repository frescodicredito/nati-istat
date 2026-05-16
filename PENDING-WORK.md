# PENDING-WORK — nati-istat

**Ultimo aggiornamento:** 16 maggio 2026 (fine sessione cap 4 + Hero finali)

---

## Stato

**Nessun blocco prioritario.** Sito live e completo su https://nati-istat.vercel.app. Tutti i blocchi 🔴 di sessione precedente risolti (cap 4 espanso commit `9561445`, Hero finale commit `9561445`).

---

## 🟢 Pianificato (nice-to-have, post-Hero)

### Release storiche ISTAT proiezioni 2007/2011 via PDF
- **Cosa**: estrarre tabelle TFT da report PDF ISTAT pubblicati 2007 e 2011 (non in SDMX moderno)
- **Perché**: estendere il backtest Eurostat (oggi 2 release con overlap) a 4 release con overlap più lungo (2007 release ha 17 anni di overlap con dato osservato)
- **Effort**: 3-4 ore (download PDF, parsing pdfplumber, validation manuale, integrazione sources/istat_projections_archive.py)
- **Single entry point**: aggiungere modulo `pipeline/sources/istat_projections_pdf_archive.py`
- **Impatto**: trasforma backtest da "2 release" a "4 release" → narrativa più forte cap 3

### UN WPP Low/High via API authenticated
- **Cosa**: ottenere scenari Low e High UN per Italia, oggi solo Medium
- **Perché**: cap 4 e cap 6 con benchmark internazionale completo
- **Effort**: 1-2 ore (registrazione UN Data Portal, token, modifica un_wpp.py)
- **Single entry point**: `pipeline/sources/un_wpp.py`

### A11y → 100 Lighthouse
- **Cosa**: identificare e fixare il color-contrast residuo (e aria-prohibited-attr se ancora presente)
- **Effort**: 30-60 min (Chrome DevTools accessibility tree, fix CSS)
- **Single entry point**: `web/app/globals.css` + `web/components/Hero.tsx`

### Cap 5 cascade: modello economico più rigoroso
- **Cosa**: passare da "back-of-the-envelope" a stima derivata da modello demografico semplice (popolazione attiva proiettata da TFT + mortalità + migrazione)
- **Effort**: 4-6 ore (richiede ricerca metodologica)
- **Single entry point**: nuovo `pipeline/transforms/cascade_economic.py`

### Custom domain nati-istat.it
- **Cosa**: registrare dominio + configurare DNS su Vercel
- **Trigger**: decisione utente sull'acquisto (~€10-15/anno)
- **Effort**: 30 min se acquistato

---

## ⏸ Deferred su trigger esterno

### Refresh dati mensile
- **Cosa**: re-download ISTAT/Eurostat/UN, rebuild, deploy
- **Trigger**: GitHub Actions cron workflow `data-refresh.yml` (programmato ma non ancora attivato — manca lo workflow file)
- **Stato**: workflow `data-validate.yml` già attivo ma non fa download
- **Single entry point**: creare `.github/workflows/data-refresh.yml` con cron mensile + PR auto

### Translation EN
- **Cosa**: copy in inglese, scaffolding `next-intl` predisposto
- **Trigger**: decisione utente su pubblico internazionale (target attuale italiano)
- **Stato**: scaffolding non ancora messo, content/chapters.ts ha keys ma una sola lingua

---

## Recentemente chiuso (sessione 16 maggio 2026 parte 2)

- **Cap 4 espanso** con 6 sezioni metodologiche sul bias (commit `9561445`):
  mean reversion, catch-up fertility, convergenza europea, componente straniere
  mal calibrata, aggiornamento tardivo, inerzia istituzionale. Bibliografia 7 fonti
  accademiche in `/metodologia#bibliografia`. Decimali nel testo ora dinamici dal
  dataset (allinea con la caption).
- **Hero finale** (commit `9561445`): rimosso trend lineare estrapolato (56 anni di
  estrapolazione non difendibili), layout senza flex min-h-svh, asse X chiaro
  2000-2080 con tick ogni 10 anni + 2024 evidenziato, label terminali ISTAT e
  Eurostat 2025, ruleline verticale tratteggiata sul 2024.

## Recentemente chiuso (sessione 16 maggio 2026 parte 1)

- F1: Release Eurostat 2019/2023/2025 + backtest empirico (commit `0e98cdb`)
- F2: UN WPP — tentato, scartato (portal SPA, fallback UN Medium ok)
- F3: Cap 5 cascade quantitativa (tabella what-if 3 scenari) — incluso in `c203c54`
- F4: Hero KPI + OG image dinamica con sparkline — incluso in `c203c54`
- F5: Color contrast WCAG AA + dedup legend cap 6 — incluso in `c203c54`
- TFR → TFT renaming completo (`66dbf00`)
- Dark mode toggle persistente (`bde164b`)
- Mobile responsive PlotChart con ResizeObserver (`e34c4ea`)
- Capitoli 0-6 riscritti con serie 1952-2024 + UN WPP (`17a8976`)
- Cap 1 esteso 1952-2024 con annotazioni eventi storici (`17a8976`)
- Cap 3 multi-release Eurostat con backtest table (`0e98cdb`)
- Validators pytest CI-enforced (commit Phase 3)
- Pipeline foundations + 4 source ISTAT/Eurostat/UN (commits Phase 1-3)
- Web bootstrap Next.js 15 + 7 capitoli + /metodologia + /dati (commits Phase 4-8)
- GitHub repo + Vercel deploy production (commit Phase 9)
