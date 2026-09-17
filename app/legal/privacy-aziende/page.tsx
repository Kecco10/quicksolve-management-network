import Link from "next/link";

export const metadata = {
  title: "Informativa Privacy Aziende | QuickSolve Management Network",
  description:
    "Informativa privacy dedicata alle aziende che utilizzano QuickSolve Management Network.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-800 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl border border-[#d7e1ec] bg-white p-6 shadow-sm sm:p-9">
        <Link
          href="/"
          className="text-sm font-semibold text-[#164873] hover:underline"
        >
          ← Torna alla home
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-[#071b33]">
          Informativa Privacy - Aziende
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Informativa sul trattamento dei dati personali comunicati dalle
          aziende e dai relativi referenti tramite QuickSolve Management
          Network.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              1. Titolare del trattamento
            </h2>

            <p className="mt-2">
              Il Titolare del trattamento è Francesco Nanni, P.IVA
              IT04285011203, gestore di QuickSolve Management Network.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              2. Dati trattati
            </h2>

            <p className="mt-2">
              Nell&apos;ambito dell&apos;invio e della gestione di una richiesta
              aziendale possono essere trattati dati relativi all&apos;azienda,
              al referente e all&apos;esigenza professionale comunicata.
            </p>

            <p className="mt-2">
              In particolare, possono essere raccolti dati quali denominazione
              aziendale, tipologia e dimensione dell&apos;azienda, settore di
              attività, nome e cognome del referente, ruolo aziendale, indirizzo
              e-mail, numero di telefono e le informazioni necessarie a
              descrivere la richiesta.
            </p>

            <p className="mt-2">
              Possono inoltre essere trattate informazioni relative al profilo
              manageriale ricercato, tra cui ruolo, esperienza, competenze,
              contesto aziendale, settori, metodologie, area geografica,
              disponibilità richiesta, modalità dell&apos;incarico,
              tempistiche, requisiti professionali ed eventuali note fornite
              dall&apos;azienda.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              3. Finalità del trattamento
            </h2>

            <p className="mt-2">
              I dati sono trattati per ricevere, registrare e gestire la
              richiesta dell&apos;azienda; comprenderne le esigenze;
              ricontattare il referente per eventuali approfondimenti;
              organizzare e classificare internamente la richiesta; valutare
              profili manageriali potenzialmente coerenti con le esigenze
              comunicate e gestire le eventuali successive fasi di contatto e
              introduzione.
            </p>

            <p className="mt-2">
              I dati possono inoltre essere trattati per finalità connesse alla
              sicurezza del servizio, alla prevenzione di utilizzi impropri,
              alla gestione di richieste di assistenza e all&apos;adempimento
              di obblighi previsti dalla legge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              4. Valutazione della compatibilità
            </h2>

            <p className="mt-2">
              Le informazioni contenute nella richiesta possono essere
              confrontate con le caratteristiche professionali e le
              disponibilità dei manager presenti nel network al fine di
              individuare profili potenzialmente coerenti con
              l&apos;esigenza aziendale.
            </p>

            <p className="mt-2">
              Le modalità tecniche e organizzative utilizzate per supportare
              tale valutazione possono evolvere nel tempo in funzione dello
              sviluppo del servizio.
            </p>

            <p className="mt-2">
              L&apos;eventuale individuazione di un profilo non costituisce una
              garanzia di idoneità allo specifico incarico e non sostituisce le
              valutazioni che spettano all&apos;azienda e al professionista
              interessato.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              5. Base giuridica
            </h2>

            <p className="mt-2">
              Il trattamento dei dati necessari a ricevere e gestire la
              richiesta dell&apos;azienda è effettuato per dare seguito a una
              richiesta dell&apos;interessato o dell&apos;organizzazione per
              conto della quale il referente opera e, ove applicabile, per
              l&apos;esecuzione di misure precontrattuali adottate su richiesta
              dell&apos;interessato.
            </p>

            <p className="mt-2">
              Ulteriori trattamenti possono essere effettuati quando necessari
              per adempiere a obblighi di legge o per perseguire legittimi
              interessi del Titolare, nel rispetto dei requisiti previsti dalla
              normativa applicabile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              6. Natura del conferimento
            </h2>

            <p className="mt-2">
              Il conferimento dei dati indicati come necessari nel modulo è
              richiesto per consentire l&apos;invio e la gestione della
              richiesta.
            </p>

            <p className="mt-2">
              Il mancato conferimento delle informazioni necessarie può rendere
              impossibile completare l&apos;invio o valutare adeguatamente
              l&apos;esigenza aziendale.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              7. Modalità del trattamento e sicurezza
            </h2>

            <p className="mt-2">
              I dati sono trattati con strumenti informatici e, quando
              necessario, con modalità organizzative adeguate alle finalità del
              servizio.
            </p>

            <p className="mt-2">
              Sono adottate misure tecniche e organizzative finalizzate a
              proteggere i dati da accessi non autorizzati, perdita,
              divulgazione, alterazione o utilizzi non compatibili con le
              finalità dichiarate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              8. Destinatari e fornitori tecnici
            </h2>

            <p className="mt-2">
              I dati possono essere trattati dal Titolare e da soggetti
              autorizzati coinvolti nella gestione del servizio.
            </p>

            <p className="mt-2">
              Per il funzionamento della piattaforma possono inoltre essere
              utilizzati fornitori di servizi tecnologici, hosting,
              infrastruttura, autenticazione, database, sicurezza o altri
              servizi strettamente necessari all&apos;operatività di QuickSolve
              Management Network.
            </p>

            <p className="mt-2">
              I dati possono essere comunicati ad altri soggetti quando ciò sia
              necessario per adempiere a obblighi di legge o richieste
              legittime delle autorità competenti.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              9. Condivisione delle informazioni con i manager
            </h2>

            <p className="mt-2">
              Nell&apos;ambito della gestione di una specifica opportunità,
              alcune informazioni relative all&apos;esigenza aziendale possono
              essere utilizzate per verificare la compatibilità e
              l&apos;interesse di manager potenzialmente pertinenti.
            </p>

            <p className="mt-2">
              La comunicazione di informazioni identificative o di contatto
              viene limitata a quanto necessario per la gestione del processo
              e delle eventuali fasi di introduzione tra le parti.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              10. Conservazione dei dati
            </h2>

            <p className="mt-2">
              I dati sono conservati per il periodo necessario alla gestione
              della richiesta e delle eventuali attività successive, nonché
              per il tempo ulteriore eventualmente necessario per adempiere a
              obblighi di legge, tutelare diritti o gestire esigenze
              amministrative e di sicurezza.
            </p>

            <p className="mt-2">
              I tempi di conservazione possono variare in funzione della natura
              dei dati, dello stato della richiesta e degli obblighi
              applicabili.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              11. Trasferimenti di dati
            </h2>

            <p className="mt-2">
              Alcuni fornitori tecnologici utilizzati per l&apos;erogazione del
              servizio possono trattare dati attraverso infrastrutture situate
              anche al di fuori dello Spazio Economico Europeo.
            </p>

            <p className="mt-2">
              Quando applicabile, tali trasferimenti sono gestiti sulla base
              degli strumenti e delle garanzie previsti dalla normativa in
              materia di protezione dei dati personali.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              12. Diritti dell&apos;interessato
            </h2>

            <p className="mt-2">
              Nei casi previsti dalla normativa, l&apos;interessato può
              richiedere l&apos;accesso ai propri dati personali, la rettifica,
              la cancellazione, la limitazione del trattamento, la portabilità
              dei dati e può opporsi al trattamento quando ne ricorrono i
              presupposti.
            </p>

            <p className="mt-2">
              L&apos;interessato ha inoltre il diritto di proporre reclamo
              all&apos;Autorità Garante per la protezione dei dati personali
              qualora ritenga che il trattamento avvenga in violazione della
              normativa applicabile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              13. Contatti
            </h2>

            <p className="mt-2">
              Per richieste relative al trattamento dei dati personali è
              possibile utilizzare i canali di contatto messi a disposizione
              da QuickSolve Management Network.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              14. Aggiornamenti dell&apos;informativa
            </h2>

            <p className="mt-2">
              La presente informativa può essere aggiornata in caso di
              modifiche normative, tecniche o organizzative del servizio. La
              versione pubblicata su questa pagina è quella disponibile agli
              utenti al momento della consultazione.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-[#d7e1ec] pt-6">
          <Link
            href="/azienda"
            className="inline-flex rounded-xl bg-[#0b2340] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12385f]"
          >
            Torna alla richiesta aziendale
          </Link>

          <Link
            href="/legal/privacy-policy"
            className="inline-flex rounded-xl border border-[#d7e1ec] bg-white px-5 py-3 text-sm font-bold text-[#0b2340] transition hover:bg-[#eef3f8]"
          >
            Privacy Policy generale
          </Link>
        </div>
      </article>
    </main>
  );
}