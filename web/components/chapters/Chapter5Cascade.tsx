import { Chapter } from "./Chapter";
import { chapterContent } from "@/content/chapters";

export function Chapter5Cascade() {
  return (
    <Chapter num={5} id="cap-5" title={chapterContent.c5.title} opening={chapterContent.c5.opening}>
      <div className="mx-auto max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          La proiezione del tasso di fecondità entra in catena in ogni
          previsione economica di lungo periodo. La popolazione in età
          lavorativa al 2050-2080 dipende dai TFT del decennio in corso più
          dalla mortalità e dai flussi migratori. Da quella popolazione
          discendono indice di dipendenza, spesa pensionistica sul PIL,
          equilibrio del sistema sanitario.
        </p>
        <p>
          Un esempio concreto: se al posto della proiezione ISTAT mediana
          (TFT 2080 ≈ 1,46) si utilizzasse una traiettoria coerente con il
          trend osservato 2014-2024 (lower_90 ≈ 1,12), la stima di donne in
          età fertile al 2050 sarebbe inferiore del 7-12% rispetto allo
          scenario ufficiale. L'effetto si propaga in modo non-lineare nei
          decenni successivi.
        </p>
        <p>
          Lo scenario inferiore al 90% di confidenza è considerato realistico
          da ISTAT al 5% di probabilità. Il punto non è che sia il più
          probabile, ma che è la base credibile per stress test fiscali e
          demografici, e raramente entra nelle previsioni di policy.
        </p>
        <p className="text-sm italic text-[color:var(--color-fg-muted)]">
          Un modello macro completo che proietti la cascata fino a spesa
          pensionistica e debito su PIL è oltre lo scope di questo progetto.
          Il capitolo successivo confronta le sole traiettorie demografiche
          alternative.
        </p>
      </div>
    </Chapter>
  );
}
