/**
 * Contenuto editoriale dei capitoli: titoli, opening, prose.
 * Centralizzato qui per consentire future traduzione (next-intl) e
 * tenere i componenti chart puliti dalla narrazione.
 */

export const chapterContent = {
  c0: {
    title: "Il grafico di proiezione ISTAT 2024",
    opening:
      "ISTAT ha pubblicato a settembre 2024 le previsioni della popolazione residente di lungo periodo. Il tasso di fecondità totale, in caduta dal 2010, è proiettato in graduale recupero fino al 2080. È la curva intorno a cui si costruiscono le previsioni economiche italiane.",
  },
  c1: {
    title: "Tasso di fecondità totale, Italia 1999-2024",
    opening:
      "Venticinque anni di dati osservati. Una breve risalita tra il 2003 e il 2008, poi quindici anni di declino fino al minimo di 1,18 nel 2024, inferiore al precedente minimo storico del 1995 (1,19).",
  },
  c2: {
    title: "Scomposizione: italiane e straniere",
    opening:
      "Il TFR delle donne straniere residenti in Italia è strutturalmente più alto di quello delle italiane. Quando la quota di straniere in età fertile cresce, il TFR aggregato sale, anche senza che nulla cambi nei comportamenti di nessuno dei due gruppi.",
  },
  c3: {
    title: "La proiezione 2024 confrontata con il trend osservato",
    opening:
      "La release 2024 parte da 1,18 nel suo primo anno e proietta un recupero costante fino a 1,46 nel 2080. Lo scenario inferiore al 90% di confidenza (il limite basso considerato realistico da ISTAT) rappresenta in pratica la pura estensione del trend osservato.",
  },
  c4: {
    title: "Le assunzioni che generano la traiettoria di recupero",
    opening:
      "Il modello ISTAT non prevede, esplora scenari. La traiettoria mediana si basa su tre assunzioni esplicite. Lo scarto tra mediana e limite inferiore al 90% indica quanta dipendenza dalle assunzioni regge la previsione di lungo periodo.",
  },
  c5: {
    title: "Le previsioni economiche basate su queste proiezioni",
    opening:
      "Spesa pensionistica su PIL al 2050, indice di dipendenza, forza lavoro. Tutte stime che dipendono dal TFR proiettato. Una differenza apparentemente piccola sul TFR si traduce in milioni di lavoratori in più o in meno a 30-40 anni di distanza.",
  },
  c6: {
    title: "Scenari alternativi a confronto",
    opening:
      "Quattro traiettorie nello stesso grafico: il dato osservato, lo scenario ISTAT mediano, il limite inferiore al 90% di ISTAT, e un modello no-recovery (TFR costante al livello 2024). Le distanze al 2080 quantificano il range di incertezza.",
  },
} as const;
