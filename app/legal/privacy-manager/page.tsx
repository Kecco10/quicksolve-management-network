import Link from "next/link";

export const metadata = {
  title: "Informativa Privacy Manager | QuickSolve Management Network",
  description:
    "Informativa privacy dedicata ai manager iscritti a QuickSolve Management Network.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-800 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl border border-[#d7e1ec] bg-white p-6 shadow-sm sm:p-9">
        <Link
          href="/"
          className="text-sm font-semibold text-[#0d3158] hover:underline"
        >
          ← Torna alla home
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-[#071b33]">
          Informativa Privacy - Manager
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Versione 1.0 - 21 settembre 2026
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">
              1. Titolare del trattamento
            </h2>
            <p className="mt-2">
              Il Titolare del trattamento è Francesco Nanni, P.IVA
              IT04285011203, gestore di QuickSolve Management Network.
            </p>
            <p className="mt-2">
              Per richieste relative alla protezione dei dati personali:{" "}
              <a
                className="font-medium text-[#0d3158] hover:underline"
                href="mailto:francesco.nanni@quicksolve.it"
              >
                francesco.nanni@quicksolve.it
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">
              2. Dati trattati
            </h2>
            <p className="mt-2">
              Sono trattati i dati forniti durante la registrazione e
              l&apos;uso della piattaforma: dati anagrafici e di contatto,
              credenziali/account, informazioni relative all&apos;esperienza
              professionale e manageriale, ruoli ricoperti, tipologia di
              collaborazione, disponibilità e zone operative, settori,
              metodologie e strumenti professionali, aspettative economiche,
              LinkedIn se indicato, nonché dati tecnici necessari al
              funzionamento, alla sicurezza e alla prevenzione degli abusi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">3. Finalità</h2>
            <p className="mt-2">
              I dati sono trattati per creare e gestire il profilo; consentire
              accesso e aggiornamento tramite dashboard; effettuare il matching
              con le richieste aziendali; mostrare alle aziende compatibili un
              profilo professionale inizialmente privo dei dati di contatto
              direttamente identificativi; registrare le selezioni effettuate
              dalle aziende; contattare il manager selezionato per verificarne
              disponibilità e interesse rispetto alla specifica opportunità; in
              caso di interesse reciproco, consentire e facilitare
              l&apos;introduzione con l&apos;azienda; gestire assistenza,
              sicurezza, eventuali servizi a pagamento, fatturazione e
              adempimenti amministrativi o di legge.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">
              4. Basi giuridiche
            </h2>
            <p className="mt-2">
              I trattamenti necessari alla registrazione, alla gestione del
              profilo, al matching, alla verifica dell&apos;interesse e
              all&apos;erogazione delle funzionalità richieste sono svolti
              nell&apos;ambito dell&apos;esecuzione del servizio e delle misure
              contrattuali o precontrattuali connesse.
            </p>
            <p className="mt-2">
              Ulteriori trattamenti possono basarsi su obblighi di legge o sul
              legittimo interesse del Titolare alla sicurezza, alla prevenzione
              degli abusi e alla tutela dei propri diritti. Ove una specifica
              attività richieda il consenso, questo sarà richiesto
              separatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">
              5. Matching, profilo anonimo e introduzione
            </h2>
            <p className="mt-2">
              Il sistema confronta i dati professionali del manager con i
              requisiti inseriti dalle aziende per individuare profili con
              caratteristiche compatibili con la specifica richiesta.
              L&apos;azienda può visualizzare informazioni professionali utili
              alla valutazione senza ricevere, in questa fase, i dati di
              contatto direttamente identificativi.
            </p>
            <p className="mt-2">
              Se l&apos;azienda seleziona il profilo, QuickSolve può contattare
              il manager per verificarne disponibilità e interesse. Solo quando
              il processo prosegue verso la messa in contatto, QuickSolve può
              comunicare alle parti i dati identificativi e di contatto
              necessari, quali nome, cognome, e-mail, telefono/WhatsApp e, se
              disponibile e pertinente, collegamento LinkedIn.
            </p>
            <p className="mt-2">
              Il matching è uno strumento di supporto e non garantisce
              l&apos;esito di un rapporto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">
              6. Destinatari e limiti di utilizzo
            </h2>
            <p className="mt-2">
              I dati possono essere trattati da fornitori tecnici necessari alla
              piattaforma, inclusi servizi di hosting, database, autenticazione,
              infrastruttura, sicurezza e, ove applicabile, pagamento.
            </p>
            <p className="mt-2">
              I dati identificativi e di contatto possono essere comunicati
              all&apos;azienda interessata quando, a seguito della selezione e
              della verifica dell&apos;interesse, si procede
              all&apos;introduzione professionale. Le aziende destinatarie
              devono utilizzare i dati ricevuti esclusivamente per valutare e
              gestire il possibile rapporto professionale e non possono
              rivenderli, diffonderli, creare banche dati autonome o utilizzarli
              per finalità estranee.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">
              7. Trasferimenti
            </h2>
            <p className="mt-2">
              Qualora fornitori tecnici trattino dati al di fuori dello Spazio
              Economico Europeo, il trattamento avverrà mediante gli strumenti e
              le garanzie previsti dalla normativa applicabile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">
              8. Conservazione
            </h2>
            <p className="mt-2">
              I dati sono conservati per il tempo necessario a gestire il
              profilo e il servizio richiesto. In caso di cancellazione del
              profilo, i dati vengono eliminati o anonimizzati salvo quanto
              debba essere conservato per obblighi di legge, tutela di diritti,
              gestione di operazioni o contatti già avvenuti o tempi tecnici di
              backup e sicurezza.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">9. Diritti</h2>
            <p className="mt-2">
              L&apos;interessato può esercitare, quando applicabili, i diritti
              di accesso, rettifica, cancellazione, limitazione, opposizione e
              portabilità, nonché revocare il consenso ove utilizzato e proporre
              reclamo al Garante per la protezione dei dati personali. Le
              richieste possono essere inviate a{" "}
              <a
                className="font-medium text-[#0d3158] hover:underline"
                href="mailto:francesco.nanni@quicksolve.it"
              >
                francesco.nanni@quicksolve.it
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0d3158]">
              10. Aggiornamenti
            </h2>
            <p className="mt-2">
              La versione dell&apos;informativa visualizzata al momento della
              registrazione viene registrata insieme alla presa visione. Le
              future modifiche sostanziali saranno rese disponibili attraverso
              la piattaforma o altri canali appropriati.
            </p>
            <p className="mt-2">
              Presa visione: nel form di registrazione il manager dichiara di
              aver letto questa informativa. La presa visione
              dell&apos;informativa privacy è distinta dall&apos;accettazione
              delle Condizioni di utilizzo.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}