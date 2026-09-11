"use client";

import { useMemo, useState } from "react";

type ExperienceBand =
  | "Meno di 6 anni"
  | "6–10 anni"
  | "11–20 anni"
  | "Oltre 20 anni";

type RoleFamily = keyof typeof roleFamilies;

const PRIVACY_VERSION = "1.0-2026-09-11";
const PRIVACY_URL = "/legal/privacy-manager";

const roleFamilies = {
  DIREZIONE: [
    "General Manager / Direttore Generale",
    "COO / Direttore Operations",
    "Plant Manager / Direttore di Stabilimento",
    "Restructuring Manager / CRO",
  ],
  "PRODUZIONE E INDUSTRIALIZZAZIONE": [
    "Production Manager / Responsabile di Produzione",
    "Responsabile di Reparto",
    "Industrialization Manager / Responsabile Industrializzazione",
    "Process Engineering Manager / Responsabile Tempi e Metodi",
    "Lean Manager / Continuous Improvement Manager",
    "Maintenance Manager / Responsabile Manutenzione",
    "HSE Manager / Responsabile Sicurezza e Ambiente",
  ],
  "TECNICO E SVILUPPO PRODOTTO": [
    "Technical Manager / Responsabile Ufficio Tecnico",
    "Engineering Manager",
    "R&D Manager",
    "Product Manager",
  ],
  "QUALITÀ": [
    "Quality Manager",
    "Responsabile Sistemi di Gestione (ISO / IATF)",
    "Supplier Quality Manager",
  ],
  "SUPPLY CHAIN": [
    "Supply Chain Manager",
    "Responsabile Pianificazione e Programmazione della Produzione",
    "Purchasing Manager / Responsabile Acquisti",
    "Logistics Manager / Responsabile Logistica e Magazzini",
    "Materials Manager",
  ],
  PROGETTI: ["Project Manager", "Program Manager", "PMO Manager"],
  "FUNZIONI DI SUPPORTO": [
    "CFO / Direttore Amministrativo",
    "Controller Industriale",
    "IT / Digital Manufacturing Manager",
    "HR Manager / Direttore del Personale",
    "Altro",
  ],
} as const;

const experienceOptions: ExperienceBand[] = [
  "Meno di 6 anni",
  "6–10 anni",
  "11–20 anni",
  "Oltre 20 anni",
];

const regionProvinceMap: Record<string, string[]> = {
  Abruzzo: ["L'Aquila", "Chieti", "Pescara", "Teramo"],
  Basilicata: ["Matera", "Potenza"],
  Calabria: ["Catanzaro", "Cosenza", "Crotone", "Reggio Calabria", "Vibo Valentia"],
  Campania: ["Avellino", "Benevento", "Caserta", "Napoli", "Salerno"],
  "Emilia-Romagna": ["Bologna", "Ferrara", "Forlì-Cesena", "Modena", "Parma", "Piacenza", "Ravenna", "Reggio Emilia", "Rimini"],
  "Friuli-Venezia Giulia": ["Gorizia", "Pordenone", "Trieste", "Udine"],
  Lazio: ["Frosinone", "Latina", "Rieti", "Roma", "Viterbo"],
  Liguria: ["Genova", "Imperia", "La Spezia", "Savona"],
  Lombardia: ["Bergamo", "Brescia", "Como", "Cremona", "Lecco", "Lodi", "Mantova", "Milano", "Monza e Brianza", "Pavia", "Sondrio", "Varese"],
  Marche: ["Ancona", "Ascoli Piceno", "Fermo", "Macerata", "Pesaro e Urbino"],
  Molise: ["Campobasso", "Isernia"],
  Piemonte: ["Alessandria", "Asti", "Biella", "Cuneo", "Novara", "Torino", "Verbano-Cusio-Ossola", "Vercelli"],
  Puglia: ["Bari", "Barletta-Andria-Trani", "Brindisi", "Foggia", "Lecce", "Taranto"],
  Sardegna: ["Cagliari", "Nuoro", "Oristano", "Sassari", "Sud Sardegna"],
  Sicilia: ["Agrigento", "Caltanissetta", "Catania", "Enna", "Messina", "Palermo", "Ragusa", "Siracusa", "Trapani"],
  Toscana: ["Arezzo", "Firenze", "Grosseto", "Livorno", "Lucca", "Massa-Carrara", "Pisa", "Pistoia", "Prato", "Siena"],
  "Trentino-Alto Adige": ["Bolzano", "Trento"],
  Umbria: ["Perugia", "Terni"],
  "Valle d'Aosta": ["Aosta"],
  Veneto: ["Belluno", "Padova", "Rovigo", "Treviso", "Venezia", "Verona", "Vicenza"],
};

const regionOptions = Object.keys(regionProvinceMap);

function formatPersonName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("it-IT")
    .replace(/(^|[\s'-])\p{L}/gu, (match) => match.toLocaleUpperCase("it-IT"));
}

export default function ManagerPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [experience, setExperience] = useState<ExperienceBand | "">("");
  const [roleFamily, setRoleFamily] = useState<RoleFamily | "">("");
  const [primaryRole, setPrimaryRole] = useState("");
  const [otherRole, setOtherRole] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [visibilityConsent, setVisibilityConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const roleOptions = useMemo(
    () => (roleFamily ? [...roleFamilies[roleFamily]] : []),
    [roleFamily]
  );

  const passwordValid = password.length >= 6 && password === confirmPassword;
  const roleValid = primaryRole !== "" && (primaryRole !== "Altro" || otherRole.trim() !== "");

  const canSubmit =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    passwordValid &&
    experience !== "" &&
    roleFamily !== "" &&
    roleValid &&
    region !== "" &&
    province !== "" &&
    privacyAcknowledged &&
    visibilityConsent;

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return;

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formatPersonName(firstName),
          last_name: formatPersonName(lastName),
          email: email.trim().toLowerCase(),
          password,
          experience_band: experience,
          primary_role_family: roleFamily,
          primary_role: primaryRole === "Altro" ? otherRole.trim() : primaryRole,
          other_role: primaryRole === "Altro" ? otherRole.trim() : undefined,
          region,
          province,
          privacy_acknowledged: privacyAcknowledged,
          privacy_version: PRIVACY_VERSION,
          profile_visibility_consent: visibilityConsent,
          profile_visibility_version: PRIVACY_VERSION,
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(data?.message || "Errore durante la registrazione.");
      }

      setSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Si è verificato un errore durante la registrazione."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-900">
            ✓
          </div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">Registrazione completata</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Il tuo account Management Network è stato creato. Il profilo professionale è ancora
            da completare: dalla dashboard potrai aggiungere competenze, seniority, disponibilità,
            contesto produttivo e qualificazioni.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-900">
              QuickSolve · Management Network
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Crea il tuo profilo manager
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-7 text-slate-600">
              Inizia con i dati essenziali. Dopo la registrazione potrai completare il profilo
              professionale dalla tua area personale.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-emerald-950">Fase 1 · Registrazione rapida</p>
                <p className="mt-1 text-sm text-emerald-900/70">
                  Inserisci solo le informazioni necessarie per creare l&apos;account.
                </p>
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-900">
                Profilo 25%
              </span>
            </div>
          </div>

          {submitError && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {submitError}
            </div>
          )}

          <section className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Dati personali</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Nome">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setFirstName(formatPersonName(firstName))}
                    className={inputClass}
                    placeholder="Es. Marco"
                  />
                </Field>

                <Field label="Cognome">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setLastName(formatPersonName(lastName))}
                    className={inputClass}
                    placeholder="Es. Rossi"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="nome@email.com"
                  />
                </Field>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Esperienza e ruolo principale</h2>

              <div className="mt-4">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Anni di esperienza professionale
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {experienceOptions.map((option) => (
                    <ChoiceButton
                      key={option}
                      active={experience === option}
                      onClick={() => setExperience(option)}
                    >
                      {option}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Famiglia professionale">
                  <select
                    value={roleFamily}
                    onChange={(e) => {
                      setRoleFamily(e.target.value as RoleFamily | "");
                      setPrimaryRole("");
                      setOtherRole("");
                    }}
                    className={inputClass}
                  >
                    <option value="">Seleziona la famiglia</option>
                    {Object.keys(roleFamilies).map((family) => (
                      <option key={family} value={family}>
                        {family}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Ruolo principale">
                  <select
                    value={primaryRole}
                    disabled={!roleFamily}
                    onChange={(e) => {
                      setPrimaryRole(e.target.value);
                      if (e.target.value !== "Altro") setOtherRole("");
                    }}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                  >
                    <option value="">
                      {roleFamily ? "Seleziona il ruolo" : "Prima seleziona la famiglia"}
                    </option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {primaryRole === "Altro" && (
                <div className="mt-4">
                  <Field label="Specifica il ruolo">
                    <input
                      type="text"
                      value={otherRole}
                      onChange={(e) => setOtherRole(e.target.value)}
                      className={inputClass}
                      placeholder="Inserisci il tuo ruolo"
                    />
                  </Field>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Area geografica</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Regione">
                  <select
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setProvince("");
                    }}
                    className={inputClass}
                  >
                    <option value="">Seleziona la regione</option>
                    {regionOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Provincia">
                  <select
                    value={province}
                    disabled={!region}
                    onChange={(e) => setProvince(e.target.value)}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                  >
                    <option value="">
                      {region ? "Seleziona la provincia" : "Prima seleziona la regione"}
                    </option>
                    {region &&
                      regionProvinceMap[region].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                  </select>
                </Field>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Accesso</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Minimo 6 caratteri"
                  />
                </Field>

                <Field label="Conferma password">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Ripeti la password"
                  />
                </Field>
              </div>

              {password && password.length < 6 && (
                <p className="mt-2 text-sm text-rose-600">
                  La password deve contenere almeno 6 caratteri.
                </p>
              )}

              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-sm text-rose-600">Le password non coincidono.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-bold text-slate-900">Privacy e visibilità</h2>

              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={privacyAcknowledged}
                    onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-900 focus:ring-emerald-900"
                  />
                  <span>
                    Dichiaro di aver letto l&apos;
                    <a
                      href={PRIVACY_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-900 underline underline-offset-2"
                    >
                      Informativa Privacy Management Network
                    </a>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={visibilityConsent}
                    onChange={(e) => setVisibilityConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-900 focus:ring-emerald-900"
                  />
                  <span>
                    Acconsento separatamente alla visibilità del mio profilo professionale
                    strutturato alle aziende potenzialmente compatibili, inizialmente senza i miei
                    dati di contatto direttamente identificativi.
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-2xl bg-emerald-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Registrazione in corso..." : "Crea account e continua"}
              </button>

              <p className="mt-3 text-center text-sm text-slate-500">
                Dopo la registrazione completerai il profilo professionale dalla dashboard.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-900";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-5 py-4 text-left text-lg font-semibold transition ${
        active
          ? "border-emerald-900 bg-emerald-50 text-emerald-950"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
