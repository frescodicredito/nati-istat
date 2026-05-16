# Bozza per cap 4 espanso: perché i modelli sovrastimano

**Stato:** bozza per prossima sessione, NON ancora integrata nel sito.
**Sostituisce/espande:** sezione corrente `web/components/chapters/Chapter4Assumptions.tsx`

## Contesto

L'utente ha chiesto: "ma questo sito spiega perché il dato viene sovrastimato? quali sono le ragioni per cui stimano una curva che va contro al trend?"

Il cap 4 attuale elenca 3 assunzioni di modello in bullet point ma non spiega:
- Da dove vengono metodologicamente
- Perché i demografi continuano ad adottarle nonostante il pattern di fallimento empirico documentato dal cap 3
- Quali interessi/inerzie istituzionali tengono in vita assunzioni smentite dai dati italiani

Questo è il **vero contenuto investigativo** che manca al sito. Per un'audience tecnica italiana attenta a dati e infografiche è quello che giustifica il tono affilato del long-read.

## Ricerca preliminare da fare nella prossima sessione

Fonti da cercare/verificare prima di scrivere:

### Letteratura accademica (in ordine di priorità)
1. **Bongaarts & Sobotka (2012)** "A Demographic Explanation for the Recent Rise in European Fertility" — il paper canonico sulla tempo distortion del TFR e il catch-up fertility. Spiega il framework concettuale che ISTAT/UN usano.
2. **Goldstein, Sobotka & Jasilioniene (2009)** "The End of Lowest-Low Fertility?" — paper che ha contribuito a creare l'aspettativa di mean reversion in EU. Da citare in modo equilibrato.
3. **Caltabiano, Castiglioni & Rosina** — demografi italiani specializzati su low fertility Italia. Cercare loro pubblicazioni recenti (2018-2024) sul fallimento del catch-up nelle coorti italiane post-1980.
4. **Lutz & Skirbekk (2014)** "How education drives demography" — vede TFT come funzione di education levels, NON di mean reversion.
5. **Vienna Institute of Demography / Wittgenstein Centre** — proiezioni alternative metodologicamente più moderne, basate su scenari di education + policy invece che mean reversion.

### Documenti ISTAT da rileggere
- ISTAT "Previsioni della popolazione residente 2024" report metodologico (PDF nel sito ISTAT)
- ISTAT "Previsioni della popolazione residente 2017" e 2021 (per confrontare evoluzione metodologica)
- Eurostat "EUROPOP2023 methodology" report

### Dati cohort completed fertility
- Human Fertility Database (HFD) — Italia, coorti 1940-1985: completed fertility osservato. Mostra che le coorti recenti NON stanno raggiungendo il TFT proiettato.
- Eurostat `demo_fcohort` per cohort fertility Italia.

## Struttura proposta per cap 4 espanso

### Sezione attuale → mantenere
- Grafico bande 50%+90% ISTAT + UN Medium (già lì, funziona)
- Le tre assunzioni in bullet point (mantenerle come "questo dice il modello")

### Sezione nuova → "Perché i modelli sovrastimano"

Tono: rigoroso, basato su letteratura, non polemico ma affilato.
Lunghezza target: ~400-600 parole + 1-2 sub-grafici se utili.

Sei punti da articolare:

#### 1. Mean reversion: un'eredità metodologica dei modelli globali

I modelli UN/Eurostat assumono che il TFT torni verso un livello "naturale" (~1,5 per paesi sviluppati a bassa fecondità). Funziona empiricamente per Svezia, Francia, USA, UK: tutti hanno avuto crolli seguiti da recuperi negli anni '80-'00. Per Italia, Spagna, Giappone, Corea — dove il recupero non è mai arrivato — il modello continua a ipotizzarlo. È un'estrapolazione cross-country che non considera specificità nazionali.

Citazione: Bongaarts & Sobotka (2012).

#### 2. Catch-up fertility: la trappola del TFT come indicatore di periodo

Il TFT misura il "fertility level" se le donne passassero tutta la vita riproduttiva con i tassi correnti. Se le donne posticipano il primo figlio da 28 a 32, il TFT crolla temporaneamente per ~5 anni anche senza alcun cambio reale nel numero finale di figli. I demografi assumono che dopo il posticipo arrivi il "catch-up" (donne 35-45 che hanno i figli posticipati). 

Per le coorti italiane nate dopo il 1980 questo catch-up non sta arrivando: i dati di completed cohort fertility da Human Fertility Database lo mostrano (coorte 1980 italiana: completed fertility ~1,4 vs proiezione che si aspettava ~1,55). Il modello, invece, continua a proiettare catch-up per le coorti future.

Da inserire: piccolo grafico cohort completed fertility 1940-1985 vs proiezione, se i dati HFD sono disponibili.

#### 3. Convergenza europea come bias di consenso istituzionale

UN, Eurostat e ISTAT condividono framework metodologici simili e si citano a vicenda. Una previsione italiana di "non-convergenza" romperebbe il consenso. C'è bias di gruppo professionale: nessun istituto vuole essere quello che proietta una crisi demografica più severa degli altri.

Verificabile guardando le scelte di scenario centrale di UN WPP per Italia 1990-2024: ogni release ha proiettato convergenza verso 1,5-1,7, ogni release ha rivisto al ribasso senza mai mettere in discussione l'assunzione di convergenza.

#### 4. Stima della componente straniere mal calibrata

I modelli proiettano TFT delle straniere "alto e stabile". I dati cap 2 mostrano l'opposto:
- TFT straniere in declino costante dal 2010 (assimilazione ai modelli locali, ricomposizione coorti)
- Flussi migratori netti italiani ridotti dal 2015
- Cambia anche la composizione: meno EU, più non-EU con TFT in alcuni casi inferiore

L'assunzione di "componente straniere stabile" è quella che ha più impatto cumulativo nelle proiezioni a 30+ anni — ed è anche quella più facilmente falsificabile, ma resiste.

#### 5. Aggiornamento tardivo e accumulo del bias

I modelli vengono pubblicati ogni 4-5 anni. Tra un update e l'altro il bias si accumula in modo asimmetrico: la proiezione sovrastima → la realtà arriva sotto → il nuovo modello parte da un punto più basso ma proietta lo stesso recupero relativo, accumulando errore. Il backtest del cap 3 documenta questo: bias Eurostat 2019 = +0,101 su 6 anni.

#### 6. Bias istituzionale silenzioso

Implicito ma rilevante (qui il tono va calibrato per non scivolare nel cospirativo). Una previsione di TFT in calo permanente costringe a politiche difficili (riforma pensioni, immigrazione strutturale, welfare familiare costoso). Una previsione di recupero modello dà respiro al policy maker.

Non è cospirazione, è un'inerzia istituzionale silenziosa documentata in letteratura economica generale (es. forecast economici sono sistematicamente ottimisti negli anni pre-elettorali, fenomeno ben noto). La demografia non fa eccezione.

Da citare con cautela: paper di Auerbach o altri su forecast bias.

## Constraint editoriali

- **Tono affilato non polemico** — vedi memory `feedback-tone-no-frasi-effetto`. Niente frasi ad effetto, niente accuse. Edge nei dati e nelle citazioni.
- **Citazioni academic-style** in parentesi (autore, anno) con bibliography in fondo o link a /metodologia
- **Verificabilità**: ogni claim su numeri deve avere fonte primaria. Per claim metodologici/concettuali, citazione bibliografica.
- **Lunghezza**: 400-600 parole nella parte nuova. Non di più — il cap 4 non deve diventare un saggio.
- **TFT** non TFR (sempre)
- **Decimali italiani** (1,46 non 1.46)

## Output atteso

1. Versione nuova di `web/components/chapters/Chapter4Assumptions.tsx`
2. Eventuale sub-grafico cohort completed fertility 1940-1985 (richiede integrazione D12 HFD nella pipeline — opzionale, fattibile in 1h)
3. Bibliografia condensata in `web/app/metodologia/page.tsx` sezione nuova "Riferimenti bibliografici"
4. Aggiornamento cap 4 opening in `web/content/chapters.ts` (~2 righe nuove)

## Stima effort

- Ricerca paper (lettura abstract + key findings): 60-90 min
- Integrazione D12 HFD nella pipeline (opzionale): 60 min
- Scrittura cap 4 espanso: 60-90 min
- Bibliografia + linking: 30 min
- Verifica + deploy: 30 min

**Totale stimato: 3.5-5 ore** per fare la cosa bene. Possibile in una sessione dedicata.

## Strategia di esecuzione

1. Prima la ricerca (paper + dati HFD se accessibile)
2. Bozza scritta in markdown a parte (rivedibile)
3. Solo dopo conferma dei contenuti, integrazione nel codice React
4. Deploy + visual audit
5. Aggiornamento HANDOFF se restano follow-up

## Riferimenti memory

- `feedback-tone-no-frasi-effetto` — tono affilato senza retorica
- `feedback-data-pipeline-rigor` — 6 vincoli baseline per affidabilità dati
