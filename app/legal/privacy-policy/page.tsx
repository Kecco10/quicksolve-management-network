import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | QuickSolve Management Network",
  description:
    "Informativa generale sul trattamento dei dati personali di QuickSolve Management Network.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Informativa generale sul trattamento dei dati personali nell&apos;ambito
          di QuickSolve Management Network.
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
              2. Ambito dell&apos;informativa
            </h2>

            <p className="mt-2">
              La presente Privacy Policy descrive in termini generali le
              modalità con cui vengono trattati i dati personali degli utenti
              che visitano o utilizzano QuickSolve Management Network.
            </p>

            <p className="mt-2">
              Per specifiche categorie di utenti o funzionalità possono essere
              disponibili informative dedicate, che integrano la presente
              informativa generale.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              3. Categorie di dati trattati
            </h2>

            <p className="mt-2">
              In funzione delle modalità di utilizzo del servizio possono
              essere trattati dati identificativi e di contatto, dati relativi
              all&apos;azienda o all&apos;attività professionale, informazioni
              relative a richieste aziendali, profili professionali dei
              manager, esperienze, competenze, disponibilità e altre
              informazioni fornite direttamente dagli utenti.
            </p>

            <p className="mt-2">
              Possono inoltre essere trattati dati tecnici connessi
              all&apos;utilizzo del sito, alla sicurezza, alle sessioni di
              autenticazione e al corretto funzionamento della piattaforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              4. Finalità del trattamento
            </h2>

            <p className="mt-2">
              I dati personali possono essere trattati per consentire
              l&apos;utilizzo del sito e delle sue funzionalità; gestire la
              registrazione e l&apos;accesso dei manager; gestire e aggiornare
              i profili professionali; ricevere e gestire le richieste delle
              aziende; valutare la possibile coerenza tra esigenze aziendali e
              profili presenti nel network; gestire eventuali contatti e
              introduzioni tra le parti; fornire assistenza e garantire la
              sicurezza del servizio.
            </p>

            <p className="mt-2">
              I dati possono inoltre essere trattati per adempiere a obblighi
              amministrativi, fiscali, contabili o di legge quando tali
              obblighi risultino applicabili.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              5. Base giuridica
            </h2>

            <p className="mt-2">
              A seconda della finalità e del contesto, il trattamento può
              essere basato sull&apos;esecuzione di un contratto o di misure
              precontrattuali richieste dall&apos;interessato, sul rispetto di
              obblighi di legge, sul perseguimento di un legittimo interesse
              del Titolare oppure sul consenso dell&apos;interessato quando
              questo sia richiesto dalla normativa applicabile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              6. Dati dei manager
            </h2>

            <p className="mt-2">
              I manager che si registrano al network possono fornire dati
              identificativi e di contatto, informazioni relative alla propria
              esperienza professionale e manageriale, ruoli ricoperti,
              competenze, settori di esperienza, responsabilità gestite,
              disponibilità, preferenze relative agli incarichi e altre
              informazioni necessarie alla creazione e alla gestione del
              profilo.
            </p>

            <p className="mt-2">
              Tali informazioni possono essere utilizzate per gestire il
              profilo del manager e per valutare la possibile coerenza con
              richieste provenienti dalle aziende.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              7. Dati delle aziende e dei referenti
            </h2>

            <p className="mt-2">
              Le aziende possono fornire informazioni relative alla propria
              organizzazione, ai referenti incaricati e alle caratteristiche
              del profilo manageriale ricercato e dell&apos;incarico.
            </p>

            <p className="mt-2">
              Per maggiori informazioni è disponibile l&apos;{" "}
              <Link
                href="/legal/privacy-aziende"
                className="font-semibold text-[#164873] hover:underline"
              >
                Informativa Privacy Aziende
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              8. Valutazione delle richieste e dei profili
            </h2>

            <p className="mt-2">
              Le informazioni relative alle richieste aziendali e ai profili
              professionali possono essere utilizzate per individuare
              potenziali corrispondenze tra le esigenze espresse dalle aziende
              e le caratteristiche dei manager presenti nel network.
            </p>

            <p className="mt-2">
              Le modalità tecniche e organizzative utilizzate a supporto di
              tali valutazioni possono evolvere con lo sviluppo del servizio.
              L&apos;eventuale individuazione di una corrispondenza non
              costituisce una garanzia di idoneità professionale né determina
              automaticamente la conclusione di un rapporto tra le parti.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              9. Modalità del trattamento e sicurezza
            </h2>

            <p className="mt-2">
              I dati sono trattati prevalentemente mediante strumenti
              informatici e con misure tecniche e organizzative finalizzate a
              proteggerli da accessi non autorizzati, perdita, alterazione,
              divulgazione o utilizzi non compatibili con le finalità del
              trattamento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              10. Destinatari dei dati
            </h2>

            <p className="mt-2">
              I dati possono essere trattati dal Titolare, da soggetti
              autorizzati e da fornitori necessari al funzionamento del
              servizio, quali fornitori di infrastruttura tecnologica, hosting,
              database, autenticazione, sicurezza e altri servizi tecnici.
            </p>

            <p className="mt-2">
              Nell&apos;ambito della gestione delle opportunità professionali,
              determinate informazioni possono inoltre essere comunicate alle
              aziende o ai manager interessati nella misura necessaria a
              verificare interesse e disponibilità e a gestire eventuali
              successive fasi di introduzione.
            </p>

            <p className="mt-2">
              I dati possono essere comunicati alle autorità o ad altri
              soggetti quando ciò sia richiesto dalla legge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              11. Trasferimenti di dati
            </h2>

            <p className="mt-2">
              Alcuni fornitori tecnologici utilizzati dal servizio possono
              trattare dati attraverso infrastrutture situate anche al di fuori
              dello Spazio Economico Europeo.
            </p>

            <p className="mt-2">
              Quando applicabile, tali trasferimenti sono gestiti utilizzando
              gli strumenti e le garanzie previsti dalla normativa in materia
              di protezione dei dati personali.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              12. Conservazione
            </h2>

            <p className="mt-2">
              I dati sono conservati per il periodo necessario al perseguimento
              delle finalità per cui sono stati raccolti e, quando necessario,
              per periodi ulteriori richiesti dalla legge, dalla tutela dei
              diritti del Titolare o da esigenze amministrative e di
              sicurezza.
            </p>

            <p className="mt-2">
              I tempi di conservazione possono differire in funzione della
              categoria dei dati e del rapporto dell&apos;utente con il
              servizio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              13. Diritti degli interessati
            </h2>

            <p className="mt-2">
              Nei casi previsti dalla normativa, gli interessati possono
              richiedere l&apos;accesso ai propri dati personali, la rettifica,
              la cancellazione, la limitazione del trattamento e la
              portabilità, nonché opporsi al trattamento quando ne ricorrono i
              presupposti.
            </p>

            <p className="mt-2">
              Quando il trattamento è basato sul consenso, l&apos;interessato
              può revocarlo in qualsiasi momento, senza pregiudicare la
              liceità del trattamento effettuato prima della revoca.
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
              14. Cookie
            </h2>

            <p className="mt-2">
              Le informazioni relative all&apos;utilizzo di cookie e tecnologie
              analoghe sono disponibili nella{" "}
              <Link
                href="/cookie-policy"
                className="font-semibold text-[#164873] hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              15. Contatti
            </h2>

            <p className="mt-2">
              Per richieste relative al trattamento dei dati personali è
              possibile utilizzare i canali di contatto messi a disposizione
              da QuickSolve Management Network.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              16. Aggiornamenti
            </h2>

            <p className="mt-2">
              La presente Privacy Policy può essere aggiornata per riflettere
              modifiche normative, tecniche, organizzative o funzionali del
              servizio. La versione pubblicata su questa pagina è quella
              disponibile agli utenti al momento della consultazione.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-[#d7e1ec] pt-6">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-[#0b2340] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12385f]"
          >
            Torna a QuickSolve Management Network
          </Link>

          <Link
            href="/legal/privacy-aziende"
            className="inline-flex rounded-xl border border-[#d7e1ec] bg-white px-5 py-3 text-sm font-bold text-[#0b2340] transition hover:bg-[#eef3f8]"
          >
            Privacy Aziende
          </Link>
        </div>
      </article>
    </main>
  );
}