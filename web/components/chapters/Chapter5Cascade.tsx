"use client";

import { Chapter } from "./Chapter";
import { chapterContent } from "@/content/chapters";
import { formatItalian } from "@/lib/format";

/**
 * Cascade quantitativa: per ogni scenario TFT 2050, stima indicativa di
 * popolazione femminile in età fertile e indice di dipendenza derivato.
 *
 * I numeri sono backed-of-the-envelope basati su:
 * - Popolazione femminile 15-49 al 2025: ~12.0 milioni (ISTAT)
 * - Coorti future ridotte proporzionalmente al TFT degli ultimi decenni
 * - Indice di dipendenza approssimato come funzione lineare del rapporto
 *   pop_inattiva / pop_attiva, calibrato sui valori ISTAT scenari.
 *
 * Sono stime indicative, NON un modello macro completo. Vengono usate per
 * mostrare l'ordine di grandezza dell'effetto cascata.
 */

const CASCADE_SCENARIOS = [
  {
    label: "ISTAT mediano",
    tft2050: 1.36,
    tft2080: 1.46,
    activePop2050M: 31.8, // milioni in età 15-64 al 2050 (proiezione ISTAT)
    dependencyRatio2050: 88, // dipendenza per 100 in età lavorativa
    color: "#1e5180",
  },
  {
    label: "ISTAT lower 90%",
    tft2050: 1.18,
    tft2080: 1.12,
    activePop2050M: 30.4,
    dependencyRatio2050: 96,
    color: "#7b9fc4",
  },
  {
    label: "No-recovery (TFT costante 1,18)",
    tft2050: 1.18,
    tft2080: 1.18,
    activePop2050M: 30.5,
    dependencyRatio2050: 95,
    color: "#45BCCC",
  },
] as const;

export function Chapter5Cascade() {
  const baseline = CASCADE_SCENARIOS[0]!;

  return (
    <Chapter num={5} id="cap-5" title={chapterContent.c5.title} opening={chapterContent.c5.opening}>
      <div className="mx-auto max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          La proiezione del TFT entra in catena in ogni previsione economica
          di lungo periodo. La popolazione in età lavorativa al 2050-2080
          dipende dai TFT del decennio in corso più dalla mortalità e dai
          flussi migratori. Da quella popolazione discendono indice di
          dipendenza, spesa pensionistica sul PIL, equilibrio del sistema
          sanitario.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-[820px] px-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-fg-muted)]">
                <th className="py-3 text-left">Scenario</th>
                <th className="py-3 text-right">TFT 2050</th>
                <th className="py-3 text-right">TFT 2080</th>
                <th className="py-3 text-right">Pop. 15-64 al 2050</th>
                <th className="py-3 text-right">Dipendenza 2050</th>
              </tr>
            </thead>
            <tbody>
              {CASCADE_SCENARIOS.map((s) => {
                const isBaseline = s.label === baseline.label;
                const popDelta = ((s.activePop2050M - baseline.activePop2050M) / baseline.activePop2050M) * 100;
                const depDelta = s.dependencyRatio2050 - baseline.dependencyRatio2050;
                return (
                  <tr key={s.label} className="border-b border-[color:var(--color-border)]">
                    <td className="py-3">
                      <span className="inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: s.color }} />
                      <span className="ml-2">{s.label}</span>
                    </td>
                    <td className="py-3 text-right font-mono">{formatItalian(s.tft2050, 2)}</td>
                    <td className="py-3 text-right font-mono">{formatItalian(s.tft2080, 2)}</td>
                    <td className="py-3 text-right font-mono">
                      {formatItalian(s.activePop2050M, 1)}M
                      {!isBaseline && (
                        <span className="ml-1 text-xs text-[color:var(--color-fg-muted)]">
                          ({popDelta > 0 ? "+" : ""}{formatItalian(popDelta, 1)}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono">
                      {s.dependencyRatio2050}
                      {!isBaseline && (
                        <span className="ml-1 text-xs text-[color:var(--color-fg-muted)]">
                          ({depDelta > 0 ? "+" : ""}{depDelta})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
          Stime indicative back-of-the-envelope, calibrate sugli scenari ISTAT
          ufficiali. La popolazione 15-64 considera mortalità e migrazione
          costanti tra scenari (variando solo la fertilità). L&apos;indice di
          dipendenza è il rapporto tra non-attivi (0-14 + 65+) e popolazione
          attiva (15-64), per 100.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-[680px] px-6 text-base leading-relaxed">
        <p>
          Tra ISTAT mediano e scenario inferiore al 90% di confidenza la
          differenza al 2050 è di circa 1,4 milioni di persone in età
          lavorativa, con indice di dipendenza che cresce di 8 punti. Sembra
          poco; in pratica significa otto persone non-attive in più ogni cento
          attive, da finanziare con la stessa base contributiva.
        </p>
        <p>
          Lo scenario lower 90% è considerato realistico da ISTAT al 5% di
          probabilità. Il punto non è che sia il più probabile, ma che è
          credibile come base per stress test fiscali e demografici, e
          raramente entra nelle previsioni di policy.
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
