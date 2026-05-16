"use client";

import * as Plot from "@observablehq/plot";

import { Chapter } from "./Chapter";
import { PlotChart } from "@/components/charts/PlotChart";
import { chapterContent } from "@/content/chapters";
import { projection2024, tfrHistorical, unWpp } from "@/lib/data";
import { formatItalian, formatYear } from "@/lib/format";
import { colors } from "@/lib/theme";

export function Chapter4Assumptions() {
  const historical = tfrHistorical.data.filter((d) => d.year >= 2000);
  const mediano = projection2024.data.filter((d) => d.scenario === "mediano");
  const lower50 = projection2024.data.filter((d) => d.scenario === "lower_50");
  const upper50 = projection2024.data.filter((d) => d.scenario === "upper_50");
  const lower90 = projection2024.data.filter((d) => d.scenario === "lower_90");
  const upper90 = projection2024.data.filter((d) => d.scenario === "upper_90");
  const unMedium = unWpp.data.filter((d) => d.scenario === "medium" && d.year >= 2024);

  const band50 = mediano.map((m) => ({
    year: m.year,
    lo: lower50.find((d) => d.year === m.year)?.value ?? m.value,
    hi: upper50.find((d) => d.year === m.year)?.value ?? m.value,
  }));
  const band90 = mediano.map((m) => ({
    year: m.year,
    lo: lower90.find((d) => d.year === m.year)?.value ?? m.value,
    hi: upper90.find((d) => d.year === m.year)?.value ?? m.value,
  }));

  const lower90_2080 = lower90.find((d) => d.year === 2080)?.value;
  const upper90_2080 = upper90.find((d) => d.year === 2080)?.value;
  const mediano_2080 = mediano.find((d) => d.year === 2080)?.value;

  return (
    <Chapter num={4} id="cap-4" title={chapterContent.c4.title} opening={chapterContent.c4.opening}>
      <div className="mx-auto max-w-[960px] px-6">
        <PlotChart
          alt="Proiezione ISTAT 2024 con bande di confidenza al 50% e al 90% sovrapposte alla mediana e al dato osservato. UN Medium come benchmark internazionale."
          caption={
            <>
              Banda interna 50%, banda esterna 90%. Il range al 2080 va da{" "}
              {lower90_2080 ? formatItalian(lower90_2080, 2) : "?"} a{" "}
              {upper90_2080 ? formatItalian(upper90_2080, 2) : "?"} con confidenza 90%.
            </>
          }
          plotOptions={{
            width: 960,
            height: 440,
            marginTop: 30,
            marginRight: 30,
            marginBottom: 40,
            marginLeft: 50,
            y: {
              label: "TFT",
              grid: true,
              domain: [0.9, 2.0],
              tickFormat: (d: number) => formatItalian(d, 2),
            },
            x: { label: null, tickFormat: formatYear },
            marks: [
              Plot.areaY(band90, {
                x: "year",
                y1: "lo",
                y2: "hi",
                fill: colors.projectionBand,
                fillOpacity: 0.3,
              }),
              Plot.areaY(band50, {
                x: "year",
                y1: "lo",
                y2: "hi",
                fill: colors.projectionLower50,
                fillOpacity: 0.4,
              }),
              Plot.lineY(unMedium, {
                x: "year",
                y: "value",
                stroke: colors.scenarioAlt,
                strokeWidth: 1.6,
                strokeDasharray: "4,3",
              }),
              Plot.lineY(mediano, {
                x: "year",
                y: "value",
                stroke: colors.projectionMediano,
                strokeWidth: 2.2,
              }),
              Plot.lineY(historical, {
                x: "year",
                y: "tfr",
                stroke: colors.historical,
                strokeWidth: 2.2,
              }),
            ],
          }}
        />
      </div>

      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Tre le assunzioni di modello della release ISTAT 2024, condivise nella sostanza
          anche da Eurostat e UN WPP:
        </p>
        <ul className="mt-4 ml-6 list-disc space-y-2">
          <li>
            <strong>Convergenza al target europeo</strong>: il TFT italiano converge
            gradualmente verso un livello compatibile con altri paesi EU a bassa fecondità
            (intorno a 1,4-1,5).
          </li>
          <li>
            <strong>Recupero della fecondità rinviata</strong>: le donne che hanno
            posticipato i figli in età 25-35 li avrebbero in età 35-45.
          </li>
          <li>
            <strong>Componente straniere stabile o crescente</strong>: la quota di donne
            in età fertile straniere resta significativa e sostiene il TFT aggregato.
          </li>
        </ul>
        <p>
          Lo scarto tra mediana e bande quantifica la dipendenza della traiettoria dalle
          assunzioni. Al 2080:
        </p>
        <ul className="mt-4 ml-6 list-disc space-y-1 font-mono text-sm">
          <li>Mediano: {mediano_2080 ? formatItalian(mediano_2080, 2) : "?"}</li>
          <li>Limite inferiore 90%: {lower90_2080 ? formatItalian(lower90_2080, 2) : "?"}</li>
          <li>Limite superiore 90%: {upper90_2080 ? formatItalian(upper90_2080, 2) : "?"}</li>
          <li>
            UN Medium:{" "}
            {unMedium.at(-1)?.value ? formatItalian(unMedium.at(-1)!.value, 2) : "?"}
          </li>
        </ul>
        <p>
          Lo scarto tra limiti inferiore e superiore al 90% è di{" "}
          {upper90_2080 && lower90_2080
            ? formatItalian(upper90_2080 - lower90_2080, 2)
            : "?"}{" "}
          figli per donna. È l'ammissione esplicita dell'incertezza del modello, raramente
          trasferita alle previsioni economiche derivate.
        </p>

        <h3 className="mt-16 mb-4 text-xl font-semibold">
          Da dove vengono queste assunzioni — e perché falliscono per l'Italia
        </h3>
        <p>
          Le assunzioni qui sopra non sono scelte ad hoc di ISTAT. Sono il nucleo
          metodologico condiviso da ISTAT, Eurostat e UN Population Division da almeno
          quindici anni. Conoscere la loro origine spiega perché continuano ad essere usate
          per l'Italia anche quando il dato osservato le smentisce.
        </p>

        <h4 className="mt-10 mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
          1. Mean reversion: eredità dei modelli cross-country
        </h4>
        <p>
          I modelli UN/Eurostat assumono che, nei paesi sviluppati, il TFT torni verso un
          livello "naturale" attorno a 1,5-1,8. L'assunzione viene dal pattern empirico
          osservato in Svezia, Francia, Stati Uniti, Regno Unito: tutti hanno avuto crolli
          della fecondità tra gli anni '70 e '90 seguiti da recuperi parziali. Il framework
          (Bongaarts &amp; Sobotka, 2012) è stato calibrato su quei casi e poi applicato
          orizzontalmente. Per Italia, Spagna, Giappone e Corea — paesi in cui il recupero
          non è mai arrivato — il modello continua comunque a ipotizzarlo. È
          un'estrapolazione che non distingue tra economie in cui il recupero è documentato
          e quelle in cui non lo è.
        </p>

        <h4 className="mt-10 mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
          2. Catch-up fertility: la trappola del TFT come indicatore di periodo
        </h4>
        <p>
          Il TFT è un indicatore di periodo, non di coorte: misura il numero di figli che
          una donna avrebbe se passasse tutta la vita riproduttiva con i tassi specifici
          per età osservati nell'anno corrente. Se le donne posticipano il primo figlio
          da 28 a 32 anni, il TFT crolla temporaneamente per ~5 anni anche senza alcun
          cambio reale nel numero finale di figli. I modelli (Goldstein, Sobotka &amp;
          Jasilioniene, 2009) assumono che dopo il posticipo arrivi il catch-up: donne in
          età 35-45 che recuperano i figli rinviati. Per le coorti italiane nate dopo il
          1980 i dati Human Fertility Database non confermano il catch-up atteso. Il
          posticipo, in Italia, si è tradotto in rinuncia parziale piuttosto che recupero.
        </p>

        <h4 className="mt-10 mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
          3. Convergenza europea come consenso istituzionale
        </h4>
        <p>
          UN, Eurostat e ISTAT condividono framework metodologici e si citano a vicenda.
          Una proiezione italiana di non-convergenza romperebbe il consenso. Nessun istituto
          vuole essere quello che proietta una crisi demografica più severa degli altri.
          Verificabile guardando le scelte di scenario centrale di UN WPP per l'Italia dal
          1990 ad oggi: ogni release ha proiettato convergenza verso 1,5-1,7, ogni release
          ha rivisto al ribasso senza mai mettere in discussione l'assunzione di convergenza
          stessa.
        </p>

        <h4 className="mt-10 mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
          4. Componente straniere mal calibrata
        </h4>
        <p>
          I modelli proiettano un TFT delle straniere alto e stabile. I dati del cap 2
          mostrano l'opposto: TFT delle straniere in declino costante dal 2010
          (assimilazione, ricomposizione delle coorti immigrate), flussi netti ridotti dal
          2015, e cambio nella composizione per origine — meno donne da paesi a fecondità
          alta, più da paesi a fecondità medio-bassa. L'assunzione di componente straniere
          stabile è quella con il maggior impatto cumulativo sulle proiezioni a trent'anni,
          ed è anche quella più facilmente falsificabile sui dati recenti. Resiste comunque.
        </p>

        <h4 className="mt-10 mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
          5. Aggiornamento tardivo e accumulo asimmetrico del bias
        </h4>
        <p>
          Le release di proiezione vengono pubblicate ogni quattro-cinque anni. Tra un
          aggiornamento e l'altro il bias si accumula in modo asimmetrico: la proiezione
          sovrastima, la realtà arriva sotto, la nuova release parte da un punto più basso
          ma proietta lo stesso recupero relativo, accumulando errore. Il backtest del cap
          3 lo documenta: bias Eurostat 2019 = +0,101 figli per donna su sei anni di
          sovrapposizione. La release 2023, più recente, mostra bias ridotto a +0,038 — ma
          sempre positivo, e calcolato su un orizzonte più breve.
        </p>

        <h4 className="mt-10 mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-fg-muted)]">
          6. Inerzia istituzionale
        </h4>
        <p>
          Una proiezione di TFT in calo permanente costringe a politiche difficili: riforma
          pensioni, immigrazione strutturale, welfare familiare costoso. Una proiezione di
          recupero modello dà respiro al decisore politico. Non è cospirazione: è
          un'osservazione applicabile per analogia ai forecast economici e demografici di
          lungo periodo. Il punto rilevante non è motivazionale: è che la metodologia di
          scenario centrale non incorpora un meccanismo di correzione quando il pattern
          empirico osservato cambia segno per quindici anni di fila.
        </p>

        <p className="mt-10">
          Il risultato pratico: lo scenario mediano ISTAT 2024 al 2080 è{" "}
          {mediano_2080 ? formatItalian(mediano_2080, 2) : "?"}. Il limite inferiore della
          banda 90% è {lower90_2080 ? formatItalian(lower90_2080, 2) : "?"} — sotto al dato
          osservato 2024 (1,18). La banda esiste, ma è raramente raccolta dalle proiezioni
          economiche derivate, che usano quasi sempre solo lo scenario centrale. Il
          prossimo capitolo mostra cosa cambia se invece si prendono sul serio gli scenari
          periferici.
        </p>

        <p className="mt-6 text-xs text-[color:var(--color-fg-muted)]">
          Riferimenti bibliografici nella{" "}
          <a className="underline underline-offset-2" href="/metodologia#bibliografia">
            sezione metodologia
          </a>
          .
        </p>
      </div>
    </Chapter>
  );
}
