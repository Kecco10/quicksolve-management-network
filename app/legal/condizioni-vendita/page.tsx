import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Condizioni di Vendita | QuickSolve Management Network",
  description: "Condizioni generali dei servizi a pagamento di QuickSolve Management Network.",
};

const sections = [
  ["1. Ambito di applicazione", `Le presenti Condizioni di vendita disciplinano i servizi a pagamento forniti nell'ambito di QuickSolve Management Network, P.IVA IT04285011203. Il servizio è rivolto a soggetti che agiscono nell'esercizio della propria attività imprenditoriale o professionale e non è destinato a consumatori che acquistano per finalità estranee alla propria attività.`],
  ["2. Servizio", `L'invio di una richiesta aziendale, la registrazione dei manager e la visualizzazione dei profili compatibili in forma anonima sono gratuiti, secondo le funzionalità previste.\n\nQuickSolve offre servizi di visibilità, matching e facilitazione all'avvio della collaborazione tra aziende e manager compatibili. Il servizio può comprendere la selezione dei profili, la verifica della disponibilità e dell'interesse e, in caso di interesse reciproco, la facilitazione dell'introduzione tra le parti.`],
  ["3. Corrispettivo e IVA", `Per i servizi a pagamento è prevista una fee. L'importo applicabile, l'eventuale IVA e le specifiche condizioni economiche vengono comunicati al cliente prima dell'attivazione del servizio e indicati nella proposta commerciale, nell'accordo o nella documentazione applicabile. In questo modo il cliente può conoscere il corrispettivo dovuto prima di assumere l'impegno economico.`],
  ["4. Accettazione, fatturazione e pagamento", `Il servizio a pagamento viene attivato secondo le modalità indicate nella proposta commerciale o nell'accordo applicabile. QuickSolve emette la relativa fattura sulla base dei dati forniti dal cliente. Termini e modalità di pagamento sono quelli indicati nella proposta, nell'accordo o nella fattura.`],
  ["5. Natura del corrispettivo", `Il corrispettivo riguarda il servizio di visibilità, matching e facilitazione all'avvio della collaborazione fornito da QuickSolve. Non costituisce un corrispettivo per l'assunzione, l'incarico o il risultato finale del rapporto e non è collegato alla durata o al valore economico dell'eventuale collaborazione tra Azienda e Manager.`],
  ["6. Erogazione e introduzione", `QuickSolve svolge le attività previste dal servizio, incluse, ove applicabili, il matching, la verifica della disponibilità e dell'interesse dei manager selezionati e la facilitazione dell'introduzione. L'introduzione consente alle parti di entrare in contatto direttamente; le condizioni dell'eventuale collaborazione vengono concordate autonomamente tra Azienda e Manager.`],
  ["7. Assenza di garanzia e nessuna success fee", `QuickSolve non garantisce che le parti raggiungano un accordo, che venga concluso un rapporto o che questo abbia una determinata durata o risultato. Salvo eventuali servizi ulteriori espressamente concordati, non sono dovute percentuali sul valore di incarichi, collaborazioni o rapporti conclusi tra le parti né compensi dipendenti dal loro esito.`],
  ["8. Informazioni dei profili", `Le informazioni relative ai manager derivano dai dati presenti nel network e possono variare nel tempo. QuickSolve può verificarne disponibilità e interesse nell'ambito della specifica richiesta, ma non garantisce che tali condizioni rimangano invariate successivamente né la completezza di informazioni dipendenti dalle dichiarazioni degli utenti.`],
  ["9. Mancata o inesatta erogazione", `Eventuali anomalie relative all'erogazione devono essere segnalate fornendo gli elementi necessari a identificare il servizio. Ove il servizio non sia stato erogato per cause imputabili a QuickSolve, il caso sarà gestito secondo la normativa applicabile e le condizioni specificamente concordate.`],
  ["10. Uso dei dati di contatto", `I dati ottenuti nell'ambito dell'introduzione devono essere utilizzati esclusivamente per finalità professionali connesse alla richiesta gestita tramite QuickSolve e nel rispetto della normativa applicabile in materia di protezione dei dati personali. Non è consentita la rivendita, la diffusione indiscriminata o l'utilizzazione dei dati per finalità estranee al servizio.`],
  ["11. Coordinamento con altri documenti", `Le presenti Condizioni di vendita integrano le Condizioni di utilizzo, le informative privacy e gli eventuali accordi o proposte commerciali applicabili. In caso di contrasto sugli aspetti economici o sulle caratteristiche dello specifico servizio acquistato, prevalgono le condizioni espressamente indicate nella proposta commerciale o nell'accordo accettato dal cliente, salvo quanto inderogabilmente previsto dalla legge.`],
  ["12. Modifiche", `QuickSolve può aggiornare le presenti Condizioni per esigenze normative, tecniche o commerciali. Al singolo servizio si applica la versione resa disponibile al cliente al momento dell'accettazione, insieme alle eventuali condizioni specifiche contenute nella proposta commerciale o nell'accordo.`],
] as const;

export default function CondizioniVenditaPage() {
  return (
    <main className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-800 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl border border-[#d7e1ec] bg-white p-6 shadow-sm sm:p-8 md:p-10">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-[#0b2340] transition hover:text-[#164873]">
          ← Torna alla home
        </a>

        <h1 className="mt-6 text-3xl font-extrabold text-[#0b2340]">Condizioni di Vendita</h1>
        <p className="mt-2 text-sm text-slate-500">Versione 2.0 - 11 settembre 2026</p>

        <div className="mt-8 space-y-7 text-[15px] leading-7 text-slate-700">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-xl font-bold text-[#0b2340]">{title}</h2>
              {body.split("\n\n").map((paragraph) => (
                <p key={paragraph} className="mt-2">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
