# HANDOFF — nati-istat

**Ultimo aggiornamento:** 16 maggio 2026 · sessione "perfezionamento finale"

---

## Stato corrente in una riga

**Sito live e completo (https://nati-istat.vercel.app), repo pubblico (https://github.com/frescodicredito/nati-istat). Due blocchi residui prioritari: (1) Hero design da rifare bene visivamente, (2) cap 4 da espandere con vera spiegazione metodologica del bias.**

---

## Sessione 16 maggio 2026 — completato

Sessione molto lunga (~7-8 ore di lavoro effettivo) di costruzione end-to-end + perfezionamento. Tutto deployato su Vercel.

### Brainstorming + spec + plan
- Spec design completo: `docs/superpowers/specs/2026-05-16-nati-istat-design.md`
- Plan implementation 10 fasi: `docs/superpowers/plans/2026-05-16-nati-istat-implementation.md`

### Pipeline dati Python (uv + pandas + sdmx1)
- 5 fonti integrate via SDMX moderno:
  - **D1** ISTAT TFT 1952-2024 (`25_944_DF_DCIS_ARCH_FEC_6`, 73 punti)
  - **D3** ISTAT TFT cittadinanza italiane/straniere (riusa snapshot)
  - **D9** ISTAT proiezioni 2024 (`165_889_DF_DCIS_PREVDEM1_3`, 7 scenari)
  - **D10** Eurostat 3 release proiezioni (PROJ_19/23/25 NAASFR) → backtest empirico
  - **D11** UN WPP 2024 (Medium variant, scenari Low/High non scaricabili)
- 22 test Python (11 unit + 11 validators)
- Snapshot frozen committed in `data/raw/` (gzip CSV)
- Backtest empirico Eurostat: bias +0.101 (2019), +0.038 (2023) — pattern di sovra-stima dimostrato

### Frontend Next.js 15 (App Router + RSC + Tailwind 4 + Plot)
- 7 capitoli editoriali (cap 0-6) + Hero in apertura
- Pagina /metodologia con audit trail completo per ogni dataset
- Pagina /dati con download diretti JSON
- Dark mode con toggle persistente (localStorage + prefers-color-scheme)
- Mobile responsive (PlotChart con ResizeObserver, KPI grid)
- TFR → **TFT** ovunque (per disambiguare con Trattamento Fine Rapporto)
- TickFormat italiano (1,5 invece di 1.5)
- OG image dinamica con sparkline
- Favicon dinamico, 404 custom
- Sticky nav, ReadingProgress bar
- CI verde (data-validate + web-check workflows)

### Lighthouse mobile (locale)
- Performance 90+, Accessibility 92+, Best Practices 100, SEO 100

### Deploy ed infra
- Vercel project `nati-istat` con rootDirectory=`web` settata via API
- Repo `github.com/frescodicredito/nati-istat` pubblico, CI Actions verdi
- Commit più recente: `5b455cb` WIP Hero zoom 2000-2080

---

## Blocchi residui prioritari

### 🔴 1. Cap 4 — vera spiegazione metodologica del bias (NUOVO, priorità ALTA)

**Domanda utente che ha fatto emergere il gap:**
> "ma questo sito spiega perché il dato viene sovrastimato? quali sono le ragioni per cui stimano una curva che va contro al trend?"

**Diagnosi:** il cap 4 attuale elenca 3 assunzioni di modello in bullet point ma non spiega:
- Da dove vengono metodologicamente quelle assunzioni
- Perché i demografi continuano ad adottarle nonostante il bias documentato dal cap 3
- Quali inerzie istituzionali tengono in vita assunzioni smentite dai dati italiani

Questo è il **vero contenuto investigativo che manca al sito**. Per il target audience italiano data-savvy è quello che giustifica il tono affilato del long-read.

**Specifica completa di cosa scrivere e come:** `docs/superpowers/specs/2026-05-16-cap4-spiegazione-bias-bozza.md`

Quella spec contiene:
- 6 punti metodologici da articolare (mean reversion, catch-up fertility, convergenza, componente straniere mal calibrata, aggiornamento tardivo, bias istituzionale)
- Letteratura di riferimento da consultare (Bongaarts & Sobotka, Goldstein, Lutz, Caltabiano, Wittgenstein Centre)
- Struttura editoriale proposta
- Constraint di tono (rigoroso, non polemico, citazioni academic-style)
- Stima effort: 3.5-5 ore in sessione dedicata
- Strategia esecuzione: prima ricerca, poi bozza markdown, poi integrazione codice React

**Single entry point:** `docs/superpowers/specs/2026-05-16-cap4-spiegazione-bias-bozza.md` + `web/components/chapters/Chapter4Assumptions.tsx`

### 🔴 2. Hero design — feedback visivo non risolto

L'utente ha visto il Hero in due iterazioni e ha espresso feedback esplicito:

**Iterazione 1 — numero gigante "1,18"**
> "non mi piace molto la hero di partenza, mi sembra un po' banale. Era più figo il grafico, oppure non ci sono altre soluzioni d'impatto? il target è molto attento ai dati e infografiche"

**Iterazione 2 — fan chart 1952-2080**
> "ma sei sicuro che abbia senso questa roba? perché 'fino al 1980'? è significativo questo grafico come inizio?"
> "mancano anche gli anni sulle ascisse"
> "fai un'analisi e cura molto questa parte della nostra dashboard"

**Iterazione 3 in produzione adesso (commit 5b455cb)** — Hero zoom 2000-2080 con:
- Headline "Tutte le previsioni proiettano un recupero. Il dato osservato no."
- Chart focused 2000-2080 (no più drop storico 1965-1995)
- 4 release proiezione + osservato + trend lineare esteso tratteggiato
- KPI strip 4 celle sotto

**NON è ancora verificato visivamente** se il commit 5b455cb funziona davvero. Issue noti potenziali:
- Asse X tick label tagliate dal flex container min-h-svh (utente ha segnalato in iterazione precedente)
- Possibile sovrapposizione legend Plot con title sopra
- Possibile compressione verticale chart se viewport piccola

→ **Single entry point**: `web/components/Hero.tsx`

### Cosa fare nella prossima sessione

1. **Aprire https://nati-istat.vercel.app dal browser** (Chrome MCP o manuale) e fare visual audit del Hero attuale
2. **Identificare i bug visivi residui** (asse X tagliato, etc.)
3. **Decidere strategia Hero finale**, opzioni tra cui scegliere:
   - **A) Mantenere zoom 2000-2080** ma fixare bug visivi (margins, height, label visibility)
   - **B) Hero misto**: 30% top con headline + KPI, 70% sotto con grafico statico ben curato (no flex viewport)
   - **C) Hero scrollytelling**: animazione che mostra il dato osservato che cala mentre proiezioni divergono (richiede framer-motion o custom)
   - **D) Hero con DUE chart side-by-side**: TFT storico 1952-2024 a sinistra (compresso) + zoom proiezioni 2024-2080 a destra
4. **Mockup veloce** (anche solo screenshot) e confronto con utente prima di implementare
5. **Solo dopo** scelta, implementare + deploy + verifica

### Constraint da rispettare
- Target audience: italiano data-savvy, attento a infografiche e dati
- Tono affilato senza retorica (vedi memory `feedback-tone-no-frasi-effetto`)
- TFT acronimo italiano (NON TFR — disambigua con Trattamento Fine Rapporto)
- Decimali italiani (1,46 NON 1.46)
- Mobile-first, dark mode supportato, A11y WCAG AA
- Niente client-side data fetching (tutto static)

---

## Fatti rilevanti per chi riprende

### URLs operativi
- **Sito**: https://nati-istat.vercel.app (deploy automatico su push main)
- **Repo**: https://github.com/frescodicredito/nati-istat
- **Vercel project**: `frescodicreditos-projects/nati-istat`, rootDirectory=`web`

### Comandi essenziali
```bash
# Pipeline (rigenera dati)
cd pipeline && uv sync && uv run python build.py --no-download

# Web dev locale
cd web && pnpm install && pnpm dev   # http://localhost:3000

# Build production locale
cd web && pnpm build && pnpm start

# Deploy manuale (oltre al GitHub auto-deploy)
vercel deploy --prod --yes

# Lighthouse local (Vercel BotID blocca audit esterni)
cd web && pnpm build && (pnpm start &); sleep 3
npx --yes lighthouse "http://localhost:3000" --quiet \
  --chrome-flags="--headless --no-sandbox" \
  --form-factor=mobile --throttling-method=simulate \
  --output=json --output-path=/tmp/lh.json
```

### Auth verificata
- ✅ `gh auth status` → frescodicredito (scopes repo+workflow)
- ✅ `vercel whoami` → frescodicredito (CLI 54.1.0)

### Problemi noti accettati
- **Vercel BotID** restituisce 403 a Lighthouse esterno. Soluzione: test locale `pnpm start` su porta libera.
- **UN WPP Low/High** non integrati: portale UN è SPA, scraping fallisce. UN Medium scaricato dal file COMPACT 26MB.
- **Release storiche ISTAT proiezioni** (2007/2011/2017/2021): non disponibili via SDMX moderno. Sostituite da Eurostat 2019/2023/2025 (PROJ_NAASFR), che sono comparabili e funzionano.
- **Color-contrast lighthouse**: 1 elemento minore non identificato. A11y resta a 92, non 100.
- **Custom domain `nati-istat.it`**: decisione utente deferred, attualmente su `vercel.app`.

---

## Documenti correlati nel progetto

- `PENDING-WORK.md` — checklist viva per stato
- `SESSION-STATE.md` — snapshot dettagliato runtime
- `docs/superpowers/specs/2026-05-16-nati-istat-design.md` — spec completo
- `docs/superpowers/plans/2026-05-16-nati-istat-implementation.md` — plan 10 fasi
- `docs/decisions/` — 3 ADR (stack, charts, pipeline)
- `docs/methodology.md` — non scritto, vive in `/metodologia` page (`web/app/metodologia/page.tsx`)
