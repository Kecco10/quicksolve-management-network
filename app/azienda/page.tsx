"use client";

import { useMemo, useState } from "react";

const PRIVACY_VERSION = "1.0-2026-09-21";
const TERMS_VERSION = "1.0-2026-09-21";
const PRIVACY_URL = "/legal/privacy-aziende";
const TERMS_URL = "/legal/condizioni-aziende";

type ExperienceBand =
  | "Meno di 6 anni"
  | "6–10 anni"
  | "11–20 anni"
  | "Oltre 20 anni";

type ManagerialExperienceBand =
  | "Meno di 3 anni"
  | "3–10 anni"
  | "Oltre 10 anni";

type RoleFamily = keyof typeof roleFamilies;

const stepTitles = [
  "Azienda",
  "Esigenza e referente",
  "Manager ricercato",
  "Contesto dell'incarico",
  "Modalità e invio",
] as const;

const companyTypeOptions = [
  "Piccola/media impresa",
  "Grande azienda",
  "Altro",
] as const;

const companySizeOptions = [
  "1-9 dipendenti",
  "10-49 dipendenti",
  "50-249 dipendenti",
  "250-999 dipendenti",
  "Oltre 1000 dipendenti",
] as const;

const sectorOptions = [
  "Automotive",
  "Macchine automatiche",
  "Packaging",
  "Carpenteria",
  "Impiantistica",
  "Oil & Gas",
  "Energia",
  "Navale",
  "Aerospace",
  "Biomedicale",
  "Railway",
  "Altro",
] as const;

const requestReasonOptions = [
  "Crescita / aumento capacità produttiva",
  "Miglioramento performance operative",
  "Riduzione costi",
  "Riorganizzazione aziendale / operations",
  "Turnaround / situazione di crisi",
  "Avvio nuovo stabilimento / linea produttiva",
  "Trasferimento / rilocalizzazione produttiva",
  "Implementazione nuovo sistema o processo",
  "Gestione progetto / commessa",
  "Sostituzione temporanea di una figura manageriale",
  "Supporto alla direzione",
  "Altro",
] as const;

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
  QUALITÀ: [
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
  "AREA COMMERCIALE": ["Marketing", "Commerciale"],
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

const managerialExperienceOptions: ManagerialExperienceBand[] = [
  "Meno di 3 anni",
  "3–10 anni",
  "Oltre 10 anni",
];


const methodologyOptions = [
  "Lean Manufacturing (VSM, 5S, SMED, Kanban, Kaizen)",
  "World Class Manufacturing",
  "TPM",
  "Six Sigma (Green / Black Belt)",
  "Theory of Constraints",
  "Problem solving strutturato (8D, A3, FMEA)",
  "Cost reduction e make or buy",
  "Design to Cost / DFMA",
  "Riprogettazione layout e flussi",
  "Implementazione o migrazione ERP",
  "Industria 4.0 / MES / IoT industriale",
  "Start-up di stabilimento e trasferimenti produttivi",
  "Turnaround e ristrutturazione operativa",
  "Post-merger integration",
  "Relazioni sindacali e gestione del cambiamento",
  "Gestione commesse ETO / project manufacturing",
  "Strategic sourcing e category management",
  "Negoziazione acquisti e gestione fornitori",
  "Marketing strategico e go-to-market",
  "Sviluppo commerciale e gestione rete vendita",
  "CRM, pipeline e sales management",
  "Altro",
] as const;

const productionTypeOptions = [
  "ETO",
  "MTO",
  "ATO",
  "MTS",
  "Processo continuo",
] as const;

const peopleManagedOptions = [
  "Fino a 10 persone",
  "11–30 persone",
  "31–70 persone",
  "71–150 persone",
  "Oltre 150 persone",
] as const;

const pnlBandOptions = [
  "Fino a 1 M€",
  "1–5 M€",
  "5–20 M€",
  "20–50 M€",
  "Oltre 50 M€",
  "Non applicabile / non gestito direttamente",
] as const;

const assignmentTypeOptions = [
  "Temporary full time",
  "Fractional a giorni",
  "Progetto a termine",
  "Advisory",
] as const;

const dailyRateOptions = [
  "< 700 € / giorno",
  "> 700 € / giorno",
] as const;

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
    .replace(/(^|[\s'-])\p{L}/gu, (match) =>
      match.toLocaleUpperCase("it-IT")
    );
}

function toggleInList(value: string, current: string[], max?: number) {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }
  if (max && current.length >= max) return current;
  return [...current, value];
}

export default function CompanyRequestPage() {
  const [currentStep, setCurrentStep] = useState(0);

  // STEP 1 — Azienda
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [otherCompanyType, setOtherCompanyType] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companySector, setCompanySector] = useState("");
  const [otherCompanySector, setOtherCompanySector] = useState("");

  // STEP 2 — Esigenza e referente
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [otherRequestReason, setOtherRequestReason] = useState("");
  const [requestObjective, setRequestObjective] = useState("");

  // STEP 3 — Manager ricercato
  const [roleFamily, setRoleFamily] = useState<RoleFamily | "">("");
  const [primaryRole, setPrimaryRole] = useState("");
  const [otherRole, setOtherRole] = useState("");

  const [secondaryRoleFamily1, setSecondaryRoleFamily1] =
    useState<RoleFamily | "">("");
  const [secondaryRole1, setSecondaryRole1] = useState("");
  const [secondaryOtherRole1, setSecondaryOtherRole1] = useState("");

  const [secondaryRoleFamily2, setSecondaryRoleFamily2] =
    useState<RoleFamily | "">("");
  const [secondaryRole2, setSecondaryRole2] = useState("");
  const [secondaryOtherRole2, setSecondaryOtherRole2] = useState("");

  const [experience, setExperience] = useState<ExperienceBand[]>([]);
  const [managerialExperience, setManagerialExperience] =
    useState<ManagerialExperienceBand[]>([]);
  const [peopleManagedBand, setPeopleManagedBand] = useState("");
  const [pnlBand, setPnlBand] = useState("");

  // STEP 4 — Contesto
  const [productionTypes, setProductionTypes] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [otherSector, setOtherSector] = useState("");
  const [methodologies, setMethodologies] = useState<string[]>([]);
  const [otherMethodology, setOtherMethodology] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [travelRequirements, setTravelRequirements] = useState<string[]>([]);

  // STEP 5 — Modalità
  const [assignmentTypes, setAssignmentTypes] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dailyRateBand, setDailyRateBand] = useState("");
  const [requiredCertifications, setRequiredCertifications] = useState("");
  const [requiredLanguages, setRequiredLanguages] = useState("");
  const [finalNotes, setFinalNotes] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestCode, setRequestCode] = useState("");
  const [submitError, setSubmitError] = useState("");

  const roleOptions = useMemo(
    () => (roleFamily ? [...roleFamilies[roleFamily]] : []),
    [roleFamily]
  );

  const secondaryRoleOptions1 = useMemo(
    () =>
      secondaryRoleFamily1
        ? [...roleFamilies[secondaryRoleFamily1]]
        : [],
    [secondaryRoleFamily1]
  );

  const secondaryRoleOptions2 = useMemo(
    () =>
      secondaryRoleFamily2
        ? [...roleFamilies[secondaryRoleFamily2]]
        : [],
    [secondaryRoleFamily2]
  );

  const normalizedPrimaryRole =
    primaryRole === "Altro" ? otherRole.trim() : primaryRole;

  const normalizedSecondaryRole1 =
    secondaryRole1 === "Altro"
      ? secondaryOtherRole1.trim()
      : secondaryRole1;

  const normalizedSecondaryRole2 =
    secondaryRole2 === "Altro"
      ? secondaryOtherRole2.trim()
      : secondaryRole2;

  const primaryRoleValid = Boolean(roleFamily && normalizedPrimaryRole);

  const secondaryRole1Valid =
    secondaryRoleFamily1 === "" ||
    Boolean(secondaryRole1 && normalizedSecondaryRole1);

  const secondaryRole2Valid =
    secondaryRoleFamily2 === "" ||
    Boolean(secondaryRole2 && normalizedSecondaryRole2);

  const methodologiesValid =
    methodologies.length > 0 &&
    (!methodologies.includes("Altro") || otherMethodology.trim() !== "");

  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          companyName.trim() !== "" &&
          companyType !== "" &&
          (companyType !== "Altro" || otherCompanyType.trim() !== "") &&
          companySize !== "" &&
          companySector !== "" &&
          (companySector !== "Altro" || otherCompanySector.trim() !== "")
        );

      case 1:
        return (
          contactFirstName.trim() !== "" &&
          contactLastName.trim() !== "" &&
          contactRole.trim() !== "" &&
          contactEmail.trim() !== "" &&
          contactPhone.trim() !== "" &&
          requestReason !== "" &&
          (requestReason !== "Altro" || otherRequestReason.trim() !== "") &&
          requestObjective.trim() !== ""
        );

      case 2:
        return (
          primaryRoleValid &&
          secondaryRole1Valid &&
          secondaryRole2Valid &&
          experience.length > 0 &&
          managerialExperience.length > 0 &&
          peopleManagedBand !== "" &&
          pnlBand !== ""
        );

      case 3:
        return (
          productionTypes.length > 0 &&
          sectors.length > 0 &&
          (!sectors.includes("Altro") || otherSector.trim() !== "") &&
          methodologiesValid &&
          region !== "" &&
          province !== ""
        );

      case 4:
        return (
          assignmentTypes.length > 0 &&
          daysPerWeek !== "" &&
          startDate !== "" &&
          dailyRateBand !== "" &&
          privacyAcknowledged &&
          termsAccepted
        );

      default:
        return false;
    }
  }, [
    currentStep,
    companyName,
    companyType,
    otherCompanyType,
    companySize,
    companySector,
    otherCompanySector,
    contactFirstName,
    contactLastName,
    contactRole,
    contactEmail,
    contactPhone,
    requestReason,
    otherRequestReason,
    requestObjective,
    primaryRoleValid,
    secondaryRole1Valid,
    secondaryRole2Valid,
    experience,
    managerialExperience,
    peopleManagedBand,
    pnlBand,
    productionTypes,
    sectors,
    otherSector,
    methodologiesValid,
    region,
    province,
    assignmentTypes,
    daysPerWeek,
    startDate,
    dailyRateBand,
    privacyAcknowledged,
    termsAccepted,
  ]);

  const progress = ((currentStep + 1) / stepTitles.length) * 100;

  const availableCompanySizeOptions = useMemo(() => {
    if (companyType === "Piccola/media impresa") {
      return companySizeOptions.slice(0, 3);
    }
    if (companyType === "Grande azienda") {
      return companySizeOptions.slice(3);
    }
    if (companyType === "Altro") {
      return companySizeOptions;
    }
    return [];
  }, [companyType]);

  function nextStep() {
    if (!canContinue) return;
    setCurrentStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!canContinue || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    const secondaryRoles = [
      secondaryRoleFamily1 && secondaryRole1
        ? {
            family: secondaryRoleFamily1,
            role: secondaryRole1,
            other_role:
              secondaryRole1 === "Altro" ? secondaryOtherRole1.trim() : null,
          }
        : null,
      secondaryRoleFamily2 && secondaryRole2
        ? {
            family: secondaryRoleFamily2,
            role: secondaryRole2,
            other_role:
              secondaryRole2 === "Altro" ? secondaryOtherRole2.trim() : null,
          }
        : null,
    ].filter(Boolean);

    try {
      const response = await fetch("/api/company-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: companyName.trim(),
          company_type: companyType,
          other_company_type:
            companyType === "Altro" ? otherCompanyType.trim() : "",
          company_size: companySize,
          company_sector: companySector,
          other_company_sector:
            companySector === "Altro" ? otherCompanySector.trim() : "",

          contact_first_name: contactFirstName.trim(),
          contact_last_name: contactLastName.trim(),
          contact_role: contactRole.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          request_reason: requestReason,
          other_request_reason:
            requestReason === "Altro" ? otherRequestReason.trim() : "",
          request_objective: requestObjective.trim(),

          role_family: roleFamily,
          primary_role: primaryRole,
          other_role: primaryRole === "Altro" ? otherRole.trim() : "",
          secondary_roles: secondaryRoles,
          experience_band: experience.join(" | "),
          experience_bands: experience,
          managerial_experience_band: managerialExperience.join(" | "),
          managerial_experience_bands: managerialExperience,
          people_managed_band: peopleManagedBand,
          pnl_band: pnlBand,
          production_types: productionTypes,
          sectors,
          other_sector: sectors.includes("Altro") ? otherSector.trim() : "",
          methodologies,
          other_methodology:
            methodologies.includes("Altro") ? otherMethodology.trim() : "",
          region,
          province,
          travel_required: travelRequirements.length > 0,
          travel_requirements: travelRequirements,

          assignment_types: assignmentTypes,
          days_per_week: Number(daysPerWeek),
          start_date: startDate,
          daily_rate_band: dailyRateBand,
          required_certifications: requiredCertifications.trim(),
          required_languages: requiredLanguages.trim(),
          final_notes: finalNotes.trim(),
          privacy_acknowledged: privacyAcknowledged,
          privacy_version: PRIVACY_VERSION,
          terms_accepted: termsAccepted,
          terms_version: TERMS_VERSION,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossibile inviare la richiesta.");
      }

      setRequestCode(data.request?.request_code ?? "");
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Errore invio richiesta aziendale:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Impossibile inviare la richiesta. Riprova."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f0f8] text-4xl text-[#0b2340]">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Richiesta inviata
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Abbiamo ricevuto la richiesta. Il team QuickSolve la prenderà in carico al più presto.
          </p>

          {requestCode && (
            <div className="mt-5 inline-flex rounded-xl bg-[#eef3f8] px-4 py-2 text-sm font-bold text-[#0b2340]">
              Codice richiesta: {requestCode}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setCurrentStep(0);
              setRequestCode("");
              setSubmitError("");
            }}
            className="mt-7 block w-full rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 sm:mx-auto sm:w-fit"
          >
            Torna al wizard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0b2340]">
                QuickSolve · Management Network
              </p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                Richiedi un manager
              </h1>
            </div>

            <div className="inline-flex w-fit shrink-0 items-center gap-3 self-start rounded-xl border border-[#d7e1ec] bg-[#eef3f8] px-4 py-2.5 text-sm font-semibold text-[#071b33] shadow-sm sm:mb-1 sm:self-auto">
              <span>Step {currentStep + 1} di 5</span>
              <span className="h-4 w-px bg-[#d7e1ec]" />
              <span className="font-bold">{Math.round(progress)}%</span>
            </div>
          </div>

          {currentStep === 0 && (
            <section className="space-y-7">
              <SectionTitle
                title="Azienda"
                subtitle="Inserisci i dati principali della tua realtà aziendale."
              />

              <Field label="Ragione sociale">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  placeholder="Inserisci ragione sociale"
                />
              </Field>

              <ChoiceSection title="Tipologia azienda">
                <div className="grid gap-3 md:grid-cols-2">
                  {companyTypeOptions.map((option) => (
                    <ChoiceButton
                      key={option}
                      active={companyType === option}
                      onClick={() => {
                        setCompanyType(option);
                        setCompanySize("");
                        if (option !== "Altro") setOtherCompanyType("");
                      }}
                    >
                      {option}
                    </ChoiceButton>
                  ))}
                </div>
              </ChoiceSection>

              {companyType === "Altro" && (
                <Field label="Specifica tipologia azienda">
                  <input
                    value={otherCompanyType}
                    onChange={(e) => setOtherCompanyType(e.target.value)}
                    className={inputClass}
                    placeholder="Inserisci tipologia"
                  />
                </Field>
              )}

              <ChoiceSection title="Dimensione azienda">
                {companyType === "" ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">
                    Seleziona prima la tipologia azienda.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableCompanySizeOptions.map((option) => (
                      <ChoiceButton
                        key={option}
                        active={companySize === option}
                        onClick={() => setCompanySize(option)}
                      >
                        {option}
                      </ChoiceButton>
                    ))}
                  </div>
                )}
              </ChoiceSection>

              <Field label="Settore">
                <select
                  value={companySector}
                  onChange={(e) => {
                    setCompanySector(e.target.value);
                    if (e.target.value !== "Altro") setOtherCompanySector("");
                  }}
                  className={inputClass}
                >
                  <option value="">Inserisci settore</option>
                  {sectorOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              {companySector === "Altro" && (
                <Field label="Specifica settore">
                  <input
                    value={otherCompanySector}
                    onChange={(e) => setOtherCompanySector(e.target.value)}
                    className={inputClass}
                    placeholder="Inserisci settore"
                  />
                </Field>
              )}
            </section>
          )}

          {currentStep === 1 && (
            <section className="space-y-7">
              <SectionTitle
                title="Esigenza e referente"
                subtitle="Indicaci chi possiamo contattare e il motivo principale della richiesta."
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-900">
                  Referente aziendale
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Nome">
                    <input
                      value={contactFirstName}
                      onChange={(e) => setContactFirstName(e.target.value)}
                      onBlur={() =>
                        setContactFirstName(formatPersonName(contactFirstName))
                      }
                      className={inputClass}
                      placeholder="Es. Marco"
                    />
                  </Field>

                  <Field label="Cognome">
                    <input
                      value={contactLastName}
                      onChange={(e) => setContactLastName(e.target.value)}
                      onBlur={() =>
                        setContactLastName(formatPersonName(contactLastName))
                      }
                      className={inputClass}
                      placeholder="Es. Rossi"
                    />
                  </Field>

                  <Field label="Ruolo / funzione">
                    <input
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      className={inputClass}
                      placeholder="Es. CEO, HR Director, Operations Director"
                    />
                  </Field>

                  <Field label="Email aziendale">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className={inputClass}
                      placeholder="nome@azienda.it"
                    />
                  </Field>

                  <Field label="Telefono / WhatsApp">
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+39 333 1234567"
                    />
                  </Field>
                </div>
              </div>

              <ChoiceSection title="Motivo principale della richiesta">
                <div className="grid gap-3 md:grid-cols-2">
                  {requestReasonOptions.map((option) => (
                    <ChoiceButton
                      key={option}
                      active={requestReason === option}
                      onClick={() => {
                        setRequestReason(option);
                        if (option !== "Altro") setOtherRequestReason("");
                      }}
                    >
                      {option}
                    </ChoiceButton>
                  ))}
                </div>
              </ChoiceSection>

              {requestReason === "Altro" && (
                <Field label="Specifica il motivo">
                  <input
                    value={otherRequestReason}
                    onChange={(e) => setOtherRequestReason(e.target.value)}
                    className={inputClass}
                    placeholder="Descrivi brevemente il motivo"
                  />
                </Field>
              )}

              <Field label="Obiettivo dell'incarico">
                <textarea
                  value={requestObjective}
                  onChange={(e) =>
                    setRequestObjective(e.target.value.slice(0, 1000))
                  }
                  className={`${inputClass} min-h-36 resize-y`}
                  placeholder="Descrivi il risultato che l'azienda vuole ottenere..."
                />
                <p className="mt-2 text-right text-xs text-slate-500">
                  {requestObjective.length}/1000
                </p>
              </Field>
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-7">
              <SectionTitle
                title="Manager ricercato"
                subtitle="Definisci il profilo professionale e il livello di esperienza richiesto."
              />

              <RoleSelector
                title="Ruolo principale"
                family={roleFamily}
                role={primaryRole}
                otherRole={otherRole}
                roleOptions={roleOptions}
                onFamilyChange={(value) => {
                  setRoleFamily(value);
                  setPrimaryRole("");
                  setOtherRole("");
                }}
                onRoleChange={(value) => {
                  setPrimaryRole(value);
                  if (value !== "Altro") setOtherRole("");
                }}
                onOtherRoleChange={setOtherRole}
                required
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-6">
                  <RoleSelector
                    title="Ruolo secondario 1 (facoltativo)"
                    family={secondaryRoleFamily1}
                    role={secondaryRole1}
                    otherRole={secondaryOtherRole1}
                    roleOptions={secondaryRoleOptions1}
                    onFamilyChange={(value) => {
                      setSecondaryRoleFamily1(value);
                      setSecondaryRole1("");
                      setSecondaryOtherRole1("");
                    }}
                    onRoleChange={(value) => {
                      setSecondaryRole1(value);
                      if (value !== "Altro") setSecondaryOtherRole1("");
                    }}
                    onOtherRoleChange={setSecondaryOtherRole1}
                  />

                  <RoleSelector
                    title="Ruolo secondario 2 (facoltativo)"
                    family={secondaryRoleFamily2}
                    role={secondaryRole2}
                    otherRole={secondaryOtherRole2}
                    roleOptions={secondaryRoleOptions2}
                    onFamilyChange={(value) => {
                      setSecondaryRoleFamily2(value);
                      setSecondaryRole2("");
                      setSecondaryOtherRole2("");
                    }}
                    onRoleChange={(value) => {
                      setSecondaryRole2(value);
                      if (value !== "Altro") setSecondaryOtherRole2("");
                    }}
                    onOtherRoleChange={setSecondaryOtherRole2}
                  />
                </div>
              </div>

              <ChoiceSection title="Esperienza professionale richiesta">
                <div className="grid gap-3 sm:grid-cols-2">
                  {experienceOptions.map((option) => (
                    <ChoiceButton
                      key={option}
                      active={experience.includes(option)}
                      onClick={() =>
                        setExperience((current) =>
                          toggleInList(option, current) as ExperienceBand[]
                        )
                      }
                    >
                      {option}
                    </ChoiceButton>
                  ))}
                </div>
              </ChoiceSection>

              <ChoiceSection title="Esperienza richiesta in ruoli manageriali">
                <div className="grid gap-3 sm:grid-cols-3">
                  {managerialExperienceOptions.map((option) => (
                    <ChoiceButton
                      key={option}
                      active={managerialExperience.includes(option)}
                      onClick={() =>
                        setManagerialExperience((current) =>
                          toggleInList(option, current) as ManagerialExperienceBand[]
                        )
                      }
                    >
                      {option}
                    </ChoiceButton>
                  ))}
                </div>
              </ChoiceSection>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Esperienza nella gestione di team">
                  <select
                    value={peopleManagedBand}
                    onChange={(e) => setPeopleManagedBand(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleziona fascia</option>
                    {peopleManagedOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Esperienza nella gestione di budget / P&L">
                  <select
                    value={pnlBand}
                    onChange={(e) => setPnlBand(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleziona fascia</option>
                    {pnlBandOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
              </div>

            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-7">
              <SectionTitle
                title="Contesto dell'incarico"
                subtitle="Descrivi il contesto produttivo, le metodologie rilevanti e la sede dell'intervento."
              />

              <MultiSelectSection
                title="Tipologia produttiva"
                subtitle="Seleziona una o più tipologie."
                options={productionTypeOptions}
                values={productionTypes}
                onToggle={(value) =>
                  setProductionTypes((current) =>
                    toggleInList(value, current)
                  )
                }
              />

              <MultiSelectSection
                title="Settori industriali rilevanti"
                subtitle="Indica i settori in cui è richiesta esperienza."
                options={sectorOptions}
                values={sectors}
                onToggle={(value) =>
                  setSectors((current) => toggleInList(value, current))
                }
              />

              {sectors.includes("Altro") && (
                <Field label="Specifica altro settore">
                  <input
                    value={otherSector}
                    onChange={(e) => setOtherSector(e.target.value)}
                    className={inputClass}
                    placeholder="Es. Food & Beverage, Chimico, Farmaceutico..."
                  />
                </Field>
              )}

              <MultiSelectSection
                title="Metodologie e strumenti"
                subtitle="Seleziona le metodologie o gli strumenti rilevanti per l'incarico."
                options={methodologyOptions}
                values={methodologies}
                onToggle={(value) =>
                  setMethodologies((current) =>
                    toggleInList(value, current)
                  )
                }
              />

              {methodologies.includes("Altro") && (
                <Field label="Specifica altra metodologia o strumento">
                  <input
                    value={otherMethodology}
                    onChange={(e) => setOtherMethodology(e.target.value)}
                    className={inputClass}
                    placeholder="Descrivi metodologia o strumento"
                  />
                </Field>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-900">
                  Sede principale dell'incarico
                </h3>

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
                        {region
                          ? "Seleziona la provincia"
                          : "Prima seleziona la regione"}
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

                <div className="mt-5">
                  <MultiSelectSection
                    title="Trasferte richieste"
                    subtitle="Seleziona una o più aree geografiche in cui il manager dovrà essere disponibile a trasferte."
                    options={[
                      "Trasferte in Italia",
                      "Trasferte in Europa",
                      "Trasferte extra Europa",
                    ]}
                    values={travelRequirements}
                    onToggle={(value) =>
                      setTravelRequirements((current) =>
                        toggleInList(value, current)
                      )
                    }
                  />
                </div>
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="space-y-7">
              <SectionTitle
                title="Modalità dell'incarico"
                subtitle="Definisci disponibilità, impegno previsto e fascia economica."
              />

              <MultiSelectSection
                title="Tipo di incarico"
                subtitle="Puoi selezionare più modalità compatibili."
                options={assignmentTypeOptions}
                values={assignmentTypes}
                onToggle={(value) =>
                  setAssignmentTypes((current) =>
                    toggleInList(value, current)
                  )
                }
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Giorni a settimana richiesti">
                  <select
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleziona</option>
                    {[1, 2, 3, 4, 5].map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Data prevista di inizio">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <Field label="Budget indicativo / tariffa giornaliera">
                  <select
                    value={dailyRateBand}
                    onChange={(e) => setDailyRateBand(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleziona fascia</option>
                    {dailyRateOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Certificazioni richieste (facoltativo)">
                  <textarea
                    value={requiredCertifications}
                    onChange={(e) =>
                      setRequiredCertifications(e.target.value)
                    }
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="Es. Six Sigma Black Belt, PMP, ISO, IATF..."
                  />
                </Field>

                <Field label="Lingue richieste (facoltativo)">
                  <textarea
                    value={requiredLanguages}
                    onChange={(e) => setRequiredLanguages(e.target.value)}
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="Es. Inglese C1, Tedesco B2..."
                  />
                </Field>
              </div>

              <Field label="Note finali (facoltativo)">
                <textarea
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value.slice(0, 1500))}
                  className={`${inputClass} min-h-36 resize-y`}
                  placeholder="Aggiungi eventuali informazioni utili per comprendere meglio l'incarico..."
                />
                <p className="mt-2 text-right text-xs text-slate-500">
                  {finalNotes.length}/1500
                </p>
              </Field>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Privacy e condizioni
                </h2>

                <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={privacyAcknowledged}
                      onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b2340] focus:ring-[#0b2340]"
                    />
                    <span>
                      Dichiaro di aver letto l&apos;
                      <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="font-semibold text-[#0b2340] underline underline-offset-2">
                        Informativa Privacy Aziende
                      </a>.
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b2340] focus:ring-[#0b2340]"
                    />
                    <span>
                      Accetto espressamente le{" "}
                      <a href={TERMS_URL} target="_blank" rel="noreferrer" className="font-semibold text-[#0b2340] underline underline-offset-2">
                        Condizioni di Utilizzo Aziende
                      </a>.
                    </span>
                  </label>
                </div>
              </div>

              {submitError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {submitError}
                </div>
              )}
            </section>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="rounded-2xl border border-slate-300 px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Indietro
            </button>

            {currentStep < stepTitles.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canContinue}
                className="rounded-2xl bg-[#0b2340] px-7 py-3.5 font-semibold text-white transition hover:bg-[#12385f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Avanti
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canContinue || isSubmitting}
                className="rounded-2xl bg-[#0b2340] px-7 py-3.5 font-semibold text-white transition hover:bg-[#12385f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Invio in corso..." : "Invia richiesta"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0b2340] focus:ring-2 focus:ring-[#0b2340]/10";

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-3xl leading-7 text-slate-600">{subtitle}</p>
    </div>
  );
}

function ChoiceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
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
      className={`rounded-2xl border px-5 py-4 text-left font-semibold transition ${
        active
          ? "border-[#0b2340] bg-[#eef3f8] text-[#071b33]"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function MultiSelectSection({
  title,
  subtitle,
  options,
  values,
  onToggle,
}: {
  title: string;
  subtitle: string;
  options: readonly string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const active = values.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                active
                  ? "border-[#0b2340] bg-[#eef3f8] text-[#071b33]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                  active
                    ? "border-[#0b2340] bg-[#0b2340] text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {active ? "✓" : ""}
              </span>

              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoleSelector({
  title,
  family,
  role,
  otherRole,
  roleOptions,
  onFamilyChange,
  onRoleChange,
  onOtherRoleChange,
  required = false,
}: {
  title: string;
  family: RoleFamily | "";
  role: string;
  otherRole: string;
  roleOptions: string[];
  onFamilyChange: (value: RoleFamily | "") => void;
  onRoleChange: (value: string) => void;
  onOtherRoleChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <h3 className="font-bold text-slate-900">{title}</h3>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <Field label="Famiglia professionale">
          <select
            value={family}
            onChange={(e) =>
              onFamilyChange(e.target.value as RoleFamily | "")
            }
            className={inputClass}
          >
            <option value="">
              {required ? "Seleziona la famiglia" : "Nessuna"}
            </option>

            {Object.keys(roleFamilies).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ruolo">
          <select
            value={role}
            disabled={!family}
            onChange={(e) => onRoleChange(e.target.value)}
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
          >
            <option value="">
              {family
                ? "Seleziona il ruolo"
                : "Prima seleziona la famiglia"}
            </option>

            {roleOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {role === "Altro" && (
        <div className="mt-4">
          <Field label="Specifica il ruolo">
            <input
              value={otherRole}
              onChange={(e) => onOtherRoleChange(e.target.value)}
              className={inputClass}
              placeholder="Inserisci il ruolo"
            />
          </Field>
        </div>
      )}
    </div>
  );
}
