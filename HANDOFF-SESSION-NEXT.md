# HANDOFF — nati-istat

**Ultimo aggiornamento:** 16 maggio 2026 · sessione "cap 4 espanso + Hero finale"

---

## Stato corrente in una riga

**Sito live e completo (https://nati-istat.vercel.app), repo pubblico (https://github.com/frescodicredito/nati-istat). Tutti i blocchi prioritari risolti: cap 4 espanso con vera spiegazione metodologica del bias (6 sezioni + 7 fonti accademiche), Hero finale pulito senza estrapolazione lineare. Nessun pending bloccante, solo nice-to-have (vedi PENDING-WORK).**

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
- Commit più recente: `9561445` cap 4 espanso + Hero finale

---

## Sessione 16 maggio 2026 (parte 2) — Cap 4 + Hero finali

### Cap 4 espanso (commit `9561445`)

Risposta diretta alla domanda utente "ma questo sito spiega perché il dato viene sovrastimato?". Nuovo titolo cap 4: "Perché tutte le proiezioni assumono un recupero".

Struttura aggiornata:
- Sezione esistente (mantenuta): chart bande ISTAT 50%/90% + 3 assunzioni di modello
- Sezione nuova: "Da dove vengono queste assunzioni — e perché falliscono per l'Italia"

Sei sezioni numerate con eyebrow mono uppercase:
1. Mean reversion: eredità modelli cross-country (Bongaarts & Sobotka 2012)
2. Catch-up fertility: trappola del TFT come indicatore di periodo (Goldstein et al. 2009 + dati HFD coorti 1980)
3. Convergenza europea come consenso istituzionale
4. Componente straniere mal calibrata
5. Aggiornamento tardivo e accumulo asimmetrico del bias
6. Inerzia istituzionale (Auerbach 2003 per analogia con forecast economici)

Bibliografia con 7 fonti accademiche aggiunta a `/metodologia#bibliografia`, linkata dal cap 4. Decimali nel testo ora dinamici da dataset (1,06 / 1,46 / 1,85) invece di valori hardcoded incoerenti con la caption.

### Hero finale (commit `9561445`)

Rimosso il trend lineare estrapolato 2024-2080 — estrapolazione 56 anni non difendibile, produceva diagonale fuori dominio Y. Layout standard senza `flex min-h-svh`: più compatto, asse X chiaro con tick ogni 10 anni + 2024 evidenziato.

Cosa contiene:
- Eyebrow "Tasso di fecondità totale, Italia · 2000 → 2080"
- Headline "Tutte le previsioni proiettano un recupero. Il dato osservato no."
- Chart 2000-2080: osservato rosso (2000-2024) + 4 release proiezione (Eurostat 2019/2023/2025 + ISTAT 2024 mediano)
- Ruleline verticale tratteggiata sul 2024 (separa osservato da proiezione)
- Label terminali "ISTAT → 1,46" e "Eurostat 2025 → 1,39"
- KPI strip 4 celle: TFT 2024 / ISTAT mediano 2080 / Bias Eurostat 2019 / Anni di dati

### Verifica live (16 maggio 2026, end of session)

- https://nati-istat.vercel.app/ — Hero + cap 4 live
- https://nati-istat.vercel.app/metodologia#bibliografia — 7 citation items presenti
- Cap 0/1/2/3/5/6 visual audit — nessuna regressione
- Build TypeScript pulito (`npx tsc --noEmit` zero errori)
- `pnpm build` produzione pulito
- Nessun console error in browser

---

## Stato pending

**Nessun blocco prioritario.** I due blocchi 🔴 di sessione precedente (cap 4 spiegazione bias + Hero design finale) sono entrambi risolti e deployati live. Vedi `PENDING-WORK.md` per nice-to-have residui (release storiche ISTAT PDF, UN WPP Low/High, A11y → 100, custom domain).

---

## Blocchi storici (risolti)

### ~~Cap 4 — vera spiegazione metodologica del bias~~ → RISOLTO commit `9561445`

Domanda utente d'origine:
> "ma questo sito spiega perché il dato viene sovrastimato? quali sono le ragioni per cui stimano una curva che va contro al trend?"

Diagnosi: cap 4 originale elencava 3 assunzioni di modello senza spiegare provenienza metodologica, ragioni del fallimento per l'Italia, inerzie istituzionali. Risolto con 6 sezioni numerate + bibliografia 7 fonti (vedi sopra).

### ~~Hero design finale~~ → RISOLTO commit `9561445`

Tre iterazioni intermedie (numero gigante 1,18 → fan chart 1952-2080 → zoom 2000-2080 con trend lineare WIP) hanno portato alla versione attuale: zoom 2000-2080 senza trend lineare estrapolato, layout senza flex min-h-svh, asse X chiaro, label terminali. Verificato visivamente live, nessun bug residuo.

### Constraint editoriali consolidati

- Target audience: italiano data-savvy, attento a infografiche e dati
- Tono affilato senza retorica (memory `feedback-tone-no-frasi-effetto`)
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
