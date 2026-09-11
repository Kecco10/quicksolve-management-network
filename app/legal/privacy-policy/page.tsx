import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | QuickSolve Engineering Network",
  description: "Informativa sul trattamento dei dati personali di QuickSolve Engineering Network.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-800 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold text-[#0f3b2e] hover:underline">
          ← Torna alla home
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-[#0f3b2e]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Ultimo aggiornamento: 11 settembre 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">1. Titolare del trattamento</h2>
            <p className="mt-2">
              Il Titolare del trattamento è Francesco Nanni, titolare di QuickSolve Engineering Network,
              P.IVA IT04285011203, con sede in Via Matteotti 30/a, Dozza (BO).
            </p>
            <p>
              Per richieste relative alla protezione dei dati personali:{" "}
              <a
                className="font-medium text-[#0f3b2e] hover:underline"
                href="mailto:francesco.nanni@quicksolve.it"
              >
                francesco.nanni@quicksolve.it
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">2. Dati trattati</h2>
            <p className="mt-2">Attraverso il sito possono essere trattati, a seconda del servizio utilizzato:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>dati identificativi e di contatto, quali nome, cognome, e-mail e telefono;</li>
              <li>dati relativi all&apos;account e all&apos;autenticazione;</li>
              <li>
                informazioni professionali fornite dai progettisti, quali esperienza, competenze, software
                utilizzati, settori, disponibilità geografica, modalità di collaborazione e fascia economica;
              </li>
              <li>
                dati forniti dalle aziende nelle richieste, inclusi dati aziendali, dati del referente,
                caratteristiche professionali ricercate e descrizione della richiesta;
              </li>
              <li>
                dati relativi alla selezione dei profili e alla gestione del processo di verifica
                dell&apos;interesse e di introduzione tra Azienda e Professionista;
              </li>
              <li>
                dati amministrativi e fiscali necessari alla gestione di eventuali servizi a pagamento;
              </li>
              <li>dati tecnici e di utilizzo necessari al funzionamento, alla sicurezza e alla gestione del sito;</li>
              <li>
                dati relativi all&apos;interazione con il sito raccolti tramite strumenti di tracciamento,
                ove utilizzati e previo consenso quando richiesto.
              </li>
            </ul>
            <p className="mt-2">
              Si invita a non inserire nei campi liberi dati personali non necessari o categorie particolari
              di dati personali non richieste dal servizio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">3. Finalità e basi giuridiche</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-4">Finalità</th>
                    <th className="py-2 pr-4">Base giuridica</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pr-4">Registrazione, autenticazione e gestione dell&apos;account</td>
                    <td className="py-3 pr-4">Esecuzione del servizio richiesto e misure precontrattuali</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pr-4">Gestione dei profili professionali e delle richieste aziendali</td>
                    <td className="py-3 pr-4">Esecuzione del servizio richiesto e misure precontrattuali</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      Confronto dei parametri, generazione del livello di compatibilità e visualizzazione dei profili anonimi
                    </td>
                    <td className="py-3 pr-4">Esecuzione delle funzionalità richieste dall&apos;utente</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      Gestione delle selezioni, verifica di disponibilità e interesse e facilitazione dell&apos;introduzione
                    </td>
                    <td className="py-3 pr-4">
                      Esecuzione del servizio richiesto, misure precontrattuali e, ove applicabile, rapporto contrattuale
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pr-4">Gestione amministrativa, fiscale e contrattuale dei servizi a pagamento</td>
                    <td className="py-3 pr-4">Esecuzione del contratto e obblighi di legge</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pr-4">Sicurezza, prevenzione abusi e tutela dei diritti</td>
                    <td className="py-3 pr-4">Legittimo interesse del Titolare e, ove applicabile, obbligo di legge</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Misurazione pubblicitaria e marketing tramite strumenti non necessari</td>
                    <td className="py-3 pr-4">Consenso, quando richiesto dalla normativa applicabile</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">4. Matching, selezione e introduzione</h2>
            <p className="mt-2">
              QuickSolve utilizza le caratteristiche inserite dagli utenti per confrontare i requisiti delle
              richieste aziendali con i profili professionali presenti nel network e calcolare un livello di
              compatibilità.
            </p>
            <p className="mt-2">
              In una prima fase, i profili compatibili possono essere mostrati all&apos;azienda in forma anonima,
              senza rendere disponibili i dati di contatto direttamente identificativi del professionista.
            </p>
            <p className="mt-2">
              Se l&apos;azienda seleziona uno o più professionisti, QuickSolve può contattarli per verificarne
              disponibilità e interesse rispetto alla specifica opportunità. In caso di interesse reciproco,
              QuickSolve può comunicare alle parti i dati necessari per consentire il contatto e facilitare
              l&apos;introduzione.
            </p>
            <p className="mt-2">
              Il risultato del matching ha funzione di supporto alla ricerca e non costituisce una garanzia
              sull&apos;idoneità del professionista, sulla sua disponibilità futura o sull&apos;esito di un eventuale
              rapporto tra le parti.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">5. Modalità del trattamento e sicurezza</h2>
            <p className="mt-2">
              I dati sono trattati con strumenti informatici e misure organizzative e tecniche volte a
              proteggerli da accessi non autorizzati, perdita, divulgazione o modifica indebita. L&apos;accesso
              ai dati è limitato ai soggetti che ne hanno necessità per le finalità indicate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">6. Destinatari e fornitori</h2>
            <p className="mt-2">
              I dati possono essere trattati da fornitori tecnici utilizzati per l&apos;erogazione e la gestione
              del servizio, inclusi servizi di hosting, infrastruttura, database, autenticazione, sicurezza,
              strumenti di misurazione e, ove applicabile, servizi di pagamento. QuickSolve utilizza in
              particolare infrastrutture tecnologiche di Vercel e Supabase.
            </p>
            <p className="mt-2">
              LinkedIn può ricevere dati tecnici quando viene attivato il relativo Insight Tag, secondo le
              scelte di consenso applicabili.
            </p>
            <p className="mt-2">
              Nell&apos;ambito del servizio, le informazioni pertinenti alla specifica opportunità possono essere
              comunicate ai professionisti selezionati per verificarne disponibilità e interesse. Quando il
              processo prosegue verso l&apos;introduzione, i dati identificativi e di contatto necessari possono
              essere comunicati tra Azienda e Professionista per consentire la messa in contatto professionale.
            </p>
            <p className="mt-2">
              I dati possono inoltre essere comunicati a consulenti o autorità quando necessario per obblighi
              di legge, tutela dei diritti o richieste legittime. I dati non vengono diffusi indiscriminatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">7. Trasferimenti di dati fuori dallo SEE</h2>
            <p className="mt-2">
              Alcuni fornitori tecnologici possono comportare il trattamento di dati al di fuori dello Spazio
              Economico Europeo. In tali casi il trasferimento viene gestito sulla base degli strumenti previsti
              dal GDPR, quali decisioni di adeguatezza o garanzie appropriate applicabili al fornitore e al
              trattamento interessato.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">8. Conservazione</h2>
            <p className="mt-2">
              I dati vengono conservati per il tempo necessario a fornire il servizio e gestire l&apos;account,
              le richieste aziendali, le selezioni, le introduzioni e gli eventuali rapporti contrattuali con
              QuickSolve, nonché per gli ulteriori periodi necessari all&apos;adempimento di obblighi di legge
              o alla tutela dei diritti del Titolare.
            </p>
            <p className="mt-2">
              I dati basati sul consenso sono trattati fino alla revoca del consenso, salvo gli eventuali dati
              che debbano essere conservati per obblighi di legge o sulla base di ulteriori basi giuridiche.
              I tempi relativi ai singoli cookie e strumenti di tracciamento sono indicati nella Cookie Policy
              o nelle informazioni rese dai rispettivi fornitori.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">9. Diritti dell&apos;interessato</h2>
            <p className="mt-2">
              Nei casi previsti dal GDPR, l&apos;interessato può chiedere accesso ai propri dati, rettifica,
              cancellazione, limitazione del trattamento, portabilità, opposizione e revoca del consenso senza
              pregiudicare la liceità del trattamento precedente alla revoca.
            </p>
            <p className="mt-2">
              Le richieste possono essere inviate a{" "}
              <a
                className="font-medium text-[#0f3b2e] hover:underline"
                href="mailto:francesco.nanni@quicksolve.it"
              >
                francesco.nanni@quicksolve.it
              </a>. È inoltre possibile proporre reclamo al Garante per la protezione dei dati personali.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">10. Cookie e strumenti di tracciamento</h2>
            <p className="mt-2">
              Per informazioni sui cookie e sugli altri strumenti di tracciamento utilizzati dal sito consulta la{" "}
              <Link className="font-medium text-[#0f3b2e] hover:underline" href="/cookie-policy">
                Cookie Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">11. Aggiornamenti</h2>
            <p className="mt-2">
              La presente informativa può essere aggiornata per riflettere modifiche normative, tecniche o
              relative ai servizi offerti. La data dell&apos;ultimo aggiornamento è indicata in apertura.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
