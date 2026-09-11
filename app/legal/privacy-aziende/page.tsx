import Link from "next/link";

export const metadata = {
  title: "Informativa Privacy Aziende | QuickSolve Engineering Network",
  description: "Informativa privacy dedicata alle aziende che utilizzano QuickSolve Engineering Network.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-800 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold text-[#0f3b2e] hover:underline">
          ← Torna alla home
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-[#0f3b2e]">Informativa Privacy - Aziende</h1>
        <p className="mt-2 text-sm text-slate-500">Versione 3.0 - 11 settembre 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">1. Titolare del trattamento</h2>
            <p className="mt-2">Il Titolare del trattamento è Francesco Nanni, P.IVA IT04285011203, gestore di QuickSolve Engineering Network.</p>
            <p className="mt-2">Per richieste relative alla protezione dei dati personali: <a className="font-medium text-[#0f3b2e] hover:underline" href="mailto:francesco.nanni@quicksolve.it">francesco.nanni@quicksolve.it</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">2. Dati trattati</h2>
            <p className="mt-2">Sono trattati i dati inseriti nella richiesta, inclusi ragione sociale o denominazione, caratteristiche e settore dell&apos;azienda, dati del referente, requisiti della figura cercata, descrizione della richiesta, zona e modalità di lavoro, budget o range economico, settori di esperienza e software richiesti, oltre ai dati tecnici necessari al servizio.</p>
            <p className="mt-2">Se viene attivato un servizio a pagamento, possono inoltre essere trattati i dati necessari alla gestione contrattuale, amministrativa e fiscale.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">3. Finalità</h2>
            <p className="mt-2">I dati sono utilizzati per ricevere e registrare gratuitamente la richiesta; attribuire un codice RQ ove previsto; effettuare il matching con i profili presenti nel network; mostrare i profili compatibili in forma non direttamente identificativa; registrare i profili selezionati dall&apos;azienda; contattare i professionisti selezionati per verificarne disponibilità e interesse; in caso di interesse reciproco, facilitare l&apos;introduzione tra le parti; gestire assistenza, sicurezza, eventuali servizi a pagamento, fatturazione e adempimenti amministrativi o di legge.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">4. Basi giuridiche</h2>
            <p className="mt-2">Il trattamento necessario alla gestione della richiesta, al matching, alla verifica dell&apos;interesse e all&apos;erogazione delle funzionalità del servizio avviene per dare seguito alla richiesta dell&apos;azienda e alle relative misure contrattuali o precontrattuali.</p>
            <p className="mt-2">Ulteriori trattamenti possono basarsi su obblighi di legge e sul legittimo interesse del Titolare alla sicurezza, alla prevenzione degli abusi e alla tutela dei propri diritti.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">5. Matching e risultati</h2>
            <p className="mt-2">I requisiti della richiesta vengono confrontati con i profili presenti nel network. Dopo l&apos;invio, l&apos;azienda può ricevere risultati di compatibilità e visualizzare gratuitamente informazioni professionali dei progettisti senza ottenere, in questa fase, i loro dati di contatto direttamente identificativi.</p>
            <p className="mt-2">Il matching è una valutazione automatizzata di supporto e non garantisce disponibilità, interesse, idoneità definitiva o conclusione di un rapporto.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">6. Selezione, verifica dell'interesse e introduzione</h2>
            <p className="mt-2">L&apos;azienda può selezionare uno o più profili di interesse. QuickSolve può quindi contattare i professionisti selezionati per verificarne disponibilità e interesse rispetto alla specifica richiesta.</p>
            <p className="mt-2">In caso di interesse reciproco e prosecuzione del servizio, QuickSolve può comunicare alle parti i dati necessari alla messa in contatto professionale. I dati ricevuti devono essere utilizzati esclusivamente per la finalità professionale collegata alla richiesta e non possono essere rivenduti, diffusi, utilizzati per creare banche dati autonome o impiegati per finalità incompatibili.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">7. Destinatari e fornitori</h2>
            <p className="mt-2">I dati dell&apos;azienda e del referente possono essere trattati da fornitori tecnici necessari alla piattaforma, inclusi servizi di hosting, database, infrastruttura, sicurezza e, ove applicabile, pagamento.</p>
            <p className="mt-2">Informazioni pertinenti alla specifica opportunità possono essere comunicate ai professionisti selezionati nella misura necessaria alla verifica dell&apos;interesse e al processo di introduzione.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">8. Riservatezza delle informazioni aziendali</h2>
            <p className="mt-2">L&apos;azienda non dovrebbe inserire nel form informazioni industriali particolarmente sensibili, segreti industriali, disegni o documentazione tecnica non necessari alla prima valutazione. Eventuali informazioni riservate possono essere gestite successivamente con adeguate misure di riservatezza o NDA.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">9. Trasferimenti e conservazione</h2>
            <p className="mt-2">Qualora fornitori tecnici trattino dati al di fuori dello Spazio Economico Europeo, il trattamento avverrà mediante gli strumenti e le garanzie previsti dalla normativa applicabile.</p>
            <p className="mt-2">I dati sono conservati per il tempo necessario alla gestione della richiesta, del servizio e dei rapporti conseguenti, salvo obblighi di legge, tutela di diritti e tempi tecnici di backup e sicurezza.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">10. Diritti e aggiornamenti</h2>
            <p className="mt-2">Gli interessati possono esercitare, quando applicabili, i diritti previsti dalla normativa privacy e proporre reclamo al Garante per la protezione dei dati personali. Le richieste possono essere inviate a <a className="font-medium text-[#0f3b2e] hover:underline" href="mailto:francesco.nanni@quicksolve.it">francesco.nanni@quicksolve.it</a>.</p>
            <p className="mt-2">La versione dell&apos;informativa visualizzata al momento dell&apos;invio viene registrata insieme alla presa visione.</p>
            <p className="mt-2">Presa visione: prima dell&apos;invio della richiesta il referente dichiara di aver letto questa informativa. La presa visione è distinta dall&apos;accettazione delle Condizioni di utilizzo.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
