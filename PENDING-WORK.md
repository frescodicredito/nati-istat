# PENDING-WORK — nati-istat

**Ultimo aggiornamento:** 16 maggio 2026

---

## 🔴 Blocchi prioritari

### 1. Cap 4 — vera spiegazione metodologica del bias (priorità ALTA)
- **Cosa**: espandere il cap 4 con una vera analisi delle ragioni per cui i modelli ISTAT/Eurostat/UN sovrastimano sistematicamente il TFT italiano. Oggi il cap 4 elenca 3 assunzioni in bullet point ma non spiega da dove vengono né perché falliscono per l'Italia.
- **Perché bloccato**: richiede sessione dedicata con ricerca su letteratura accademica + scrittura curata. Non è un quick fix.
- **Single entry point**: `docs/superpowers/specs/2026-05-16-cap4-spiegazione-bias-bozza.md` — spec completa con 6 punti da articolare, fonti da consultare, struttura editoriale, constraint di tono
- **Effort post-sblocco**: 3.5-5 ore (ricerca paper 1-1.5h + scrittura 1.5h + integrazione 1h + deploy)
- **Trigger sblocco**: prossima sessione dedicata
- **Raccomandazione**: bozza markdown prima → conferma utente sui contenuti → integrazione codice. Eseguire PRIMA di Hero design (è il vero gap di contenuto, non solo design).

### 2. Hero design finale (priorità media)
- **Cosa**: rifare bene la sezione Hero (above-the-fold) del sito
- **Perché bloccato**: feedback utente "fai un'analisi e cura molto questa parte". Iterazioni multiple in sessione corrente non hanno trovato la versione definitiva. Stato corrente è WIP commit `5b455cb` non visualmente verificato (issue noti: asse X potenzialmente tagliato).
- **Single entry point**: `web/components/Hero.tsx` + `HANDOFF-SESSION-NEXT.md` sezione "Blocco residuo 2"
- **Effort post-sblocco**: 1-2 ore di iterazione visiva con browser audit
- **Trigger sblocco**: dopo cap 4 (così il Hero può eventualmente puntare al nuovo cap 4 come "spiegazione" oltre che "dimostrazione")
- **Raccomandazione**: visual audit live (Chrome MCP) → mockup statici 2-3 versioni → allineamento con utente → implementazione

---

## 🟡 5 minuti

### Verifica deploy WIP commit 5b455cb
- **Cosa**: aprire sito live e capire se Hero zoom 2000-2080 funziona o ha bug visivi (asse X tagliato, etc.)
- **Effort**: 5 min con Chrome MCP
- **Esito atteso**: lista bug → entra in lista 🔴 Hero design

### Pulire commit WIP se sostituito
- **Cosa**: se la prossima sessione cambia Hero, considerare squash dei commit `01be269`+`c313215`+`5b455cb` in unico commit pulito
- **Effort**: 5 min `git rebase -i`
- **Trigger**: completamento Hero finale

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

## ✅ Recentemente chiuso (sessione 16 maggio 2026)

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
