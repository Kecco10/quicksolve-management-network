"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  function handleBack() {
    window.close();

    // Fallback se la pagina non è stata aperta in una nuova scheda.
    window.setTimeout(() => {
      if (!window.closed) {
        router.push("/azienda");
      }
    }, 150);
  }

  return (
    <main className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-800 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl border border-[#d7e1ec] bg-white p-6 shadow-sm sm:p-9">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm font-semibold text-[#0d3158] hover:underline"
        >
          ← Torna alla pagina finale della richiesta
        </button>

        <h1 className="mt-6 text-3xl font-extrabold text-[#071b33]">
          Condizioni di Utilizzo - Aziende
        </h1>
        <p className="mt-2 text-sm text-slate-500">Versione 1.0 - 21 settembre 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">1. Oggetto</h2>
            <p className="mt-2">Le presenti condizioni regolano l&apos;invio di richieste aziendali e l&apos;utilizzo del servizio di matching e introduzione offerto da QuickSolve Management Network, gestito da Francesco Nanni, P.IVA IT04285011203.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">2. Invio gratuito della richiesta</h2>
            <p className="mt-2">L&apos;invio della richiesta è gratuito e non comporta alcun obbligo di acquisto. L&apos;azienda si impegna a fornire dati corretti e sufficienti alla valutazione della figura ricercata. A ogni richiesta validamente registrata può essere attribuito un codice RQ per la tracciabilità del processo.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">3. Risultati e profili anonimi</h2>
            <p className="mt-2">Dopo l&apos;invio della richiesta, il sistema effettua il matching e può mostrare all&apos;azienda i profili compatibili secondo le regole della piattaforma. La consultazione dei risultati e dei profili in forma non direttamente identificativa è gratuita e non genera alcun debito o impegno economico.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">4. Selezione e servizio a pagamento</h2>
            <p className="mt-2">L&apos;azienda può selezionare uno o più profili di interesse. QuickSolve può verificare la disponibilità e l&apos;interesse dei manager selezionati e, in caso di interesse reciproco, facilitare l&apos;introduzione tra le parti.</p>
            <p className="mt-2">Per il servizio di visibilità, matching e facilitazione all&apos;avvio della collaborazione può essere prevista una fee. L&apos;importo e le condizioni economiche applicabili vengono comunicati all&apos;azienda prima dell&apos;attivazione del servizio a pagamento e indicati nella relativa proposta commerciale o accordo. Nessun corrispettivo deriva dalla sola visualizzazione dei profili anonimi.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">5. Natura del corrispettivo e nessuna success fee</h2>
            <p className="mt-2">Il corrispettivo riguarda il servizio fornito da QuickSolve e non è collegato alla conclusione, alla durata o al valore economico dell&apos;eventuale collaborazione tra Azienda e Manager. Salvo eventuali servizi ulteriori oggetto di separato accordo, non sono previste percentuali sull&apos;assunzione o sull&apos;incarico, commissioni sul valore della collaborazione o compensi dipendenti dal suo esito.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">6. Ruolo di QuickSolve</h2>
            <p className="mt-2">QuickSolve fornisce un servizio di raccolta delle richieste, matching, visibilità dei profili e facilitazione dell&apos;introduzione. QuickSolve non è parte del rapporto professionale eventualmente concluso tra Azienda e Manager e non assume obblighi propri del datore di lavoro o del committente.</p>
            <p className="mt-2">La qualificazione giuridica delle attività concretamente svolte resta soggetta alla normativa applicabile; le presenti condizioni non intendono attribuire a QuickSolve attività riservate per legge a soggetti autorizzati.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">7. Matching e assenza di garanzia</h2>
            <p className="mt-2">I risultati del matching costituiscono uno strumento di supporto basato sui dati dichiarati dall&apos;azienda e dai manager presenti nel network. Non garantiscono disponibilità, interesse, veridicità assoluta delle informazioni, idoneità definitiva, assunzione, collaborazione o conclusione di un rapporto. L&apos;azienda resta responsabile delle proprie verifiche.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">8. Utilizzo dei dati ricevuti</h2>
            <p className="mt-2">I dati di contatto eventualmente ricevuti a seguito dell&apos;introduzione possono essere utilizzati esclusivamente per contattare e valutare il manager in relazione alla reale opportunità professionale oggetto della richiesta. È vietata la rivendita, la diffusione a soggetti non autorizzati, la creazione di banche dati autonome, l&apos;uso per marketing non richiesto o per finalità estranee.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">9. Rapporto tra Azienda e Manager</h2>
            <p className="mt-2">Dopo l&apos;introduzione, Azienda e Manager gestiscono autonomamente contatti, colloqui, verifiche, negoziazioni e l&apos;eventuale rapporto. Le condizioni dell&apos;eventuale collaborazione vengono concordate direttamente tra le parti. L&apos;azienda resta responsabile degli aspetti organizzativi, contrattuali, fiscali, retributivi, contributivi e di sicurezza applicabili al rapporto che deciderà di instaurare.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">10. Riservatezza</h2>
            <p className="mt-2">L&apos;azienda si impegna a non inserire nel form segreti industriali o informazioni riservate non necessarie alla prima valutazione. Le informazioni riservate scambiate successivamente devono essere trattate con adeguata confidenzialità e, quando opportuno, con NDA dedicato.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">11. Uso corretto e disponibilità</h2>
            <p className="mt-2">È vietato inviare richieste false o illecite, utilizzare la piattaforma per raccogliere dati sui manager senza reale finalità professionale, tentare accessi non autorizzati o interferire con il funzionamento del servizio. QuickSolve può aggiornare, sospendere o modificare funzionalità tecniche per esigenze operative, sicurezza o manutenzione.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">12. Privacy e modifiche</h2>
            <p className="mt-2">Il trattamento dei dati del referente e della richiesta è disciplinato dall&apos;Informativa Privacy Aziende. La versione visualizzata viene registrata al momento dell&apos;invio della richiesta. In caso di modifiche sostanziali alle condizioni potrà essere richiesta una nuova accettazione.</p>
            <p className="mt-2">Accettazione: l&apos;invio della richiesta può essere completato solo dopo l&apos;accettazione espressa della versione delle Condizioni di utilizzo visualizzata nel form.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
