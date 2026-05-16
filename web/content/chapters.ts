/**
 * Contenuto editoriale dei capitoli: titoli, opening, prose.
 * Centralizzato per consentire futura traduzione (next-intl).
 */

export const chapterContent = {
  c0: {
    title: "Il grafico di proiezione ISTAT 2024",
    opening:
      "ISTAT ha pubblicato a settembre 2024 le previsioni della popolazione residente di lungo periodo. Il tasso di fecondità totale (TFT — figli per donna), in caduta dal 2010, è proiettato in graduale recupero fino al 2080. È la curva intorno a cui si costruiscono le previsioni economiche italiane.",
  },
  c1: {
    title: "Tasso di fecondità totale, Italia 1952-2024",
    opening:
      "Settantatré anni di dati osservati. Dal baby boom del 1964 (2,7 figli per donna) al minimo del 1995 (1,19), dalla risalita del 2008 (1,45) al declino del decennio successivo. Il dato 2024 (1,18) è il valore più basso mai registrato.",
  },
  c2: {
    title: "Scomposizione: italiane e straniere",
    opening:
      "Il TFT delle donne straniere residenti in Italia è strutturalmente più alto di quello delle italiane. Quando la quota di straniere in età fertile cresce, il TFT aggregato sale, anche senza che nulla cambi nei comportamenti di nessuno dei due gruppi.",
  },
  c3: {
    title: "La proiezione 2024 confrontata con osservato e benchmark",
    opening:
      "La release 2024 di ISTAT proietta un recupero del TFT fino a 1,46 nel 2080. Le Nazioni Unite, nello scenario Medium per l'Italia, arrivano a 1,43. Entrambe le proiezioni si discostano progressivamente dal trend osservato negli ultimi dieci anni.",
  },
  c4: {
    title: "Le bande di incertezza della proiezione ISTAT",
    opening:
      "Le proiezioni di lungo periodo sono per costruzione scenari, non previsioni puntuali. ISTAT pubblica intervalli di confidenza al 50% e al 90% attorno allo scenario mediano. Lo scarto tra mediana e bande quantifica la dipendenza della traiettoria dalle assunzioni di modello.",
  },
  c5: {
    title: "Le previsioni economiche basate su queste proiezioni",
    opening:
      "Spesa pensionistica su PIL al 2050, indice di dipendenza, forza lavoro. Tutte stime che dipendono dal TFT proiettato. Una differenza apparentemente piccola sul TFT si traduce in milioni di lavoratori in più o in meno a 30-40 anni di distanza.",
  },
  c6: {
    title: "Scenari alternativi a confronto",
    opening:
      "Quattro traiettorie nello stesso grafico: il dato osservato 1952-2024, lo scenario ISTAT mediano, lo scenario UN Medium come benchmark internazionale, e un modello no-recovery (TFT costante al livello 2024). Le distanze al 2080 quantificano il range di incertezza.",
  },
} as const;
