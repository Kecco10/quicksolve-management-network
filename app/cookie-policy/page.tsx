import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | QuickSolve Management Network",
  description:
    "Informativa sui cookie e sugli strumenti di tracciamento di QuickSolve Management Network.",
};

export default function CookiePolicyPage() {
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
          Cookie Policy
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Informativa relativa all&apos;utilizzo di cookie e tecnologie
          analoghe nell&apos;ambito di QuickSolve Management Network.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              1. Titolare
            </h2>

            <p className="mt-2">
              Il Titolare è Francesco Nanni, gestore di QuickSolve Management
              Network, P.IVA IT04285011203.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              2. Cosa sono i cookie
            </h2>

            <p className="mt-2">
              I cookie sono piccoli file di testo che possono essere memorizzati
              sul dispositivo dell&apos;utente durante la navigazione. Possono
              essere utilizzati per consentire il corretto funzionamento del
              sito, mantenere una sessione autenticata, ricordare determinate
              preferenze o, quando previsto, raccogliere informazioni
              sull&apos;utilizzo del servizio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              3. Cookie tecnici e necessari
            </h2>

            <p className="mt-2">
              QuickSolve Management Network può utilizzare cookie o strumenti
              tecnici strettamente necessari al funzionamento del sito e delle
              sue funzionalità, inclusi quelli necessari per la sicurezza,
              l&apos;autenticazione e la gestione delle sessioni.
            </p>

            <p className="mt-2">
              Questi strumenti sono utilizzati nella misura necessaria a
              fornire il servizio richiesto dall&apos;utente e non richiedono
              un consenso preventivo quando rientrano nelle categorie previste
              dalla normativa applicabile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              4. Strumenti di terze parti
            </h2>

            <p className="mt-2">
              Alcune funzionalità tecniche del servizio possono essere
              fornite tramite infrastrutture o servizi di terze parti necessari
              all&apos;erogazione, alla sicurezza, all&apos;autenticazione o
              all&apos;hosting della piattaforma.
            </p>

            <p className="mt-2">
              L&apos;eventuale introduzione futura di strumenti di analisi,
              profilazione, marketing o altre tecnologie non strettamente
              necessarie sarà gestita nel rispetto degli obblighi informativi
              e, quando richiesto, previo consenso dell&apos;utente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              5. Gestione delle preferenze
            </h2>

            <p className="mt-2">
              L&apos;utente può inoltre gestire o eliminare i cookie attraverso
              le impostazioni del proprio browser. La disattivazione di cookie
              tecnici o necessari può compromettere il corretto funzionamento
              di alcune funzionalità del sito.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              6. Dati personali
            </h2>

            <p className="mt-2">
              Per maggiori informazioni sul trattamento dei dati personali è
              possibile consultare la{" "}
              <Link
                href="/legal/privacy-policy"
                className="font-semibold text-[#164873] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0b2340]">
              7. Aggiornamenti
            </h2>

            <p className="mt-2">
              La presente Cookie Policy può essere aggiornata in caso di
              modifiche al sito, ai servizi utilizzati o alla normativa
              applicabile. La versione pubblicata su questa pagina è quella
              attualmente disponibile agli utenti.
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-[#d7e1ec] pt-6">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-[#0b2340] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12385f]"
          >
            Torna a QuickSolve Management Network
          </Link>
        </div>
      </article>
    </main>
  );
}