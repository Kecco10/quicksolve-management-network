import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | QuickSolve Engineering Network",
  description: "Informativa sui cookie e sugli strumenti di tracciamento di QuickSolve Engineering Network.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-800 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold text-[#0f3b2e] hover:underline">
          ← Torna alla home
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-[#0f3b2e]">Cookie Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Ultimo aggiornamento: 5 settembre 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">1. Titolare</h2>
            <p className="mt-2">
              Il Titolare è Francesco Nanni, QuickSolve Engineering Network, P.IVA IT04285011203,
              Via Matteotti 30/a, Dozza (BO).
            </p>
            <p>
              Contatto:{" "}
              <a className="font-medium text-[#0f3b2e] hover:underline" href="mailto:francesco.nanni@quicksolve.it">
                francesco.nanni@quicksolve.it
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">2. Cosa sono cookie e strumenti di tracciamento</h2>
            <p className="mt-2">
              I cookie sono piccoli file o informazioni che possono essere memorizzati sul dispositivo
              dell&apos;utente durante la navigazione. Tecnologie analoghe, come pixel, tag e local storage,
              possono essere utilizzate per finalità tecniche, di sicurezza, misurazione o marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">3. Strumenti tecnici e necessari</h2>
            <p className="mt-2">
              Il sito utilizza o può utilizzare tecnologie strettamente necessarie per consentire funzioni quali
              navigazione, autenticazione, sicurezza, mantenimento della sessione e corretto funzionamento della
              piattaforma. Per gli strumenti strettamente necessari non viene richiesto il consenso quando la
              normativa ne consente l&apos;utilizzo senza consenso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">4. LinkedIn Insight Tag</h2>
            <p className="mt-2">
              QuickSolve utilizza LinkedIn Insight Tag (Partner ID 9587202), uno strumento di LinkedIn impiegato
              per misurare le performance delle campagne pubblicitarie, le conversioni e ottenere informazioni
              aggregate sull&apos;interazione con il sito. Il tag può utilizzare cookie, pixel e tecnologie
              analoghe e comportare la trasmissione a LinkedIn di informazioni tecniche relative alla visita e
              al dispositivo.
            </p>
            <p className="mt-2">
              Trattandosi di uno strumento non strettamente necessario al funzionamento del sito, la sua
              attivazione deve essere subordinata al consenso dell&apos;utente quando richiesto dalla normativa
              applicabile. L&apos;utente deve poter rifiutare o revocare tale scelta senza perdere l&apos;accesso
              alle funzionalità essenziali del sito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">5. Fornitori tecnici</h2>
            <p className="mt-2">
              La piattaforma utilizza servizi tecnologici di Vercel e Supabase per funzioni quali hosting,
              infrastruttura, database e autenticazione. Tali servizi possono utilizzare tecnologie tecniche
              necessarie alla sicurezza e al funzionamento dei servizi erogati.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">6. Gestione delle preferenze</h2>
            <p className="mt-2">
              Gli strumenti di tracciamento non necessari devono essere attivati solo in conformità alle
              preferenze espresse dall&apos;utente. Quando il sistema di gestione del consenso è disponibile,
              l&apos;utente può accettare, rifiutare o modificare le proprie preferenze tramite l&apos;apposito
              comando presente sul sito.
            </p>
            <p className="mt-2">
              È inoltre possibile gestire o eliminare i cookie attraverso le impostazioni del proprio browser.
              La disabilitazione delle tecnologie strettamente necessarie può compromettere alcune funzionalità
              della piattaforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">7. Servizi di terze parti</h2>
            <p className="mt-2">
              Per informazioni aggiornate sui cookie e sulle tecnologie utilizzate dai servizi di terze parti,
              sulle relative durate e sulle modalità di trattamento, si invita a consultare le informative
              pubblicate direttamente dai rispettivi fornitori.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                className="font-medium text-[#0f3b2e] hover:underline"
                href="https://www.linkedin.com/legal/cookie-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cookie Policy LinkedIn ↗
              </a>
              <a
                className="font-medium text-[#0f3b2e] hover:underline"
                href="https://www.linkedin.com/legal/l/cookie-table"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tabella cookie LinkedIn ↗
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f3b2e]">8. Aggiornamenti</h2>
            <p className="mt-2">
              Questa Cookie Policy può essere aggiornata in caso di modifiche ai servizi o agli strumenti
              utilizzati dal sito. È pertanto consigliato consultarla periodicamente.
            </p>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-slate-800">Nota tecnica</p>
            <p className="mt-1">
              La presenza della Cookie Policy non sostituisce il meccanismo di consenso: gli strumenti di
              marketing non necessari devono essere configurati in modo da non essere caricati prima del
              consenso, quando questo è richiesto.
            </p>
          </section>

          <p className="border-t border-slate-200 pt-5 text-sm">
            Consulta anche la{" "}
            <Link className="font-medium text-[#0f3b2e] hover:underline" href="/privacy">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </article>
    </main>
  );
}
