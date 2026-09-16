"use client";

import { useMemo, useState } from "react";

type SecondaryRole = {
  family: string;
  role: string;
};

type GeographicArea = {
  region: string;
  province: string;
};

const companyTypes = [
  "Piccola/media impresa",
  "Grande azienda",
  "Altro",
];

const companySizes = [
  "1-9 dipendenti",
  "10-49 dipendenti",
  "50-249 dipendenti",
  "250-999 dipendenti",
  "Oltre 1000 dipendenti",
];

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
];

const roleFamilies: Record<string, string[]> = {
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
  PROGETTI: [
    "Project Manager",
    "Program Manager",
    "PMO Manager",
  ],
  "FUNZIONI DI SUPPORTO": [
    "CFO / Direttore Amministrativo",
    "Controller Industriale",
    "IT / Digital Manufacturing Manager",
    "HR Manager / Direttore del Personale",
    "Altro",
  ],
};

const experienceOptions = [
  "Meno di 6 anni",
  "6–10 anni",
  "11–20 anni",
  "Oltre 20 anni",
];

const managerialExperienceOptions = [
  "Meno di 3 anni",
  "3–10 anni",
  "Oltre 10 anni",
];

const competencyOptions = [
  "Direzione operations e di stabilimento",
  "Produzione e industrializzazione",
  "Pianificazione e programmazione (S&OP, MPS, MRP)",
  "Supply chain e logistica",
  "Acquisti e gestione fornitori",
  "Qualità e sistemi di gestione",
  "Manutenzione e affidabilità",
  "Ufficio tecnico e progettazione",
  "R&S e innovazione di prodotto",
  "Sicurezza e ambiente (HSE)",
  "Controllo di gestione industriale e costificazione",
  "Project e program management",
  "Organizzazione e people management",
  "Sistemi informativi industriali (ERP / MES)",
  "Altro",
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
  "Altro",
];

const revenueBandOptions = [
  "Fino a 10 M€",
  "10–50 M€",
  "50–100 M€",
  "100–250 M€",
  "Oltre 250 M€",
];

const peopleManagedOptions = [
  "Fino a 10 persone",
  "11–30 persone",
  "31–70 persone",
  "71–150 persone",
  "Oltre 150 persone",
];

const pnlBandOptions = [
  "Fino a 1 M€",
  "1–5 M€",
  "5–20 M€",
  "20–50 M€",
  "Oltre 50 M€",
  "Non rilevante per la ricerca",
];

const productionTypeOptions = [
  "ETO",
  "MTO",
  "ATO",
  "MTS",
  "Processo continuo",
];

const assignmentTypeOptions = [
  "Temporary full time",
  "Fractional a giorni",
  "Progetto a termine",
  "Advisory",
];

const daysPerWeekOptions = ["1", "2", "3", "4", "5"];

const dailyRateOptions = [
  "Fino a 500 € / giorno",
  "500–700 € / giorno",
  "700–900 € / giorno",
  "900–1.200 € / giorno",
  "Oltre 1.200 € / giorno",
];

const regionProvinceMap: Record<string, string[]> = {
  Abruzzo: ["L'Aquila", "Chieti", "Pescara", "Teramo"],
  Basilicata: ["Matera", "Potenza"],
  Calabria: ["Catanzaro", "Cosenza", "Crotone", "Reggio Calabria", "Vibo Valentia"],
  Campania: ["Avellino", "Benevento", "Caserta", "Napoli", "Salerno"],
  "Emilia-Romagna": [
    "Bologna",
    "Ferrara",
    "Forlì-Cesena",
    "Modena",
    "Parma",
    "Piacenza",
    "Ravenna",
    "Reggio Emilia",
    "Rimini",
  ],
  "Friuli-Venezia Giulia": ["Gorizia", "Pordenone", "Trieste", "Udine"],
  Lazio: ["Frosinone", "Latina", "Rieti", "Roma", "Viterbo"],
  Liguria: ["Genova", "Imperia", "La Spezia", "Savona"],
  Lombardia: [
    "Bergamo",
    "Brescia",
    "Como",
    "Cremona",
    "Lecco",
    "Lodi",
    "Mantova",
    "Milano",
    "Monza e Brianza",
    "Pavia",
    "Sondrio",
    "Varese",
  ],
  Marche: ["Ancona", "Ascoli Piceno", "Fermo", "Macerata", "Pesaro e Urbino"],
  Molise: ["Campobasso", "Isernia"],
  Piemonte: [
    "Alessandria",
    "Asti",
    "Biella",
    "Cuneo",
    "Novara",
    "Torino",
    "Verbano-Cusio-Ossola",
    "Vercelli",
  ],
  Puglia: ["Bari", "Barletta-Andria-Trani", "Brindisi", "Foggia", "Lecce", "Taranto"],
  Sardegna: ["Cagliari", "Nuoro", "Oristano", "Sassari", "Sud Sardegna"],
  Sicilia: [
    "Agrigento",
    "Caltanissetta",
    "Catania",
    "Enna",
    "Messina",
    "Palermo",
    "Ragusa",
    "Siracusa",
    "Trapani",
  ],
  Toscana: [
    "Arezzo",
    "Firenze",
    "Grosseto",
    "Livorno",
    "Lucca",
    "Massa-Carrara",
    "Pisa",
    "Pistoia",
    "Prato",
    "Siena",
  ],
  "Trentino-Alto Adige": ["Bolzano", "Trento"],
  Umbria: ["Perugia", "Terni"],
  "Valle d'Aosta": ["Aosta"],
  Veneto: ["Belluno", "Padova", "Rovigo", "Treviso", "Venezia", "Verona", "Vicenza"],
};

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      ) : null}
    </div>
  );
}

function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? "border-emerald-900 bg-emerald-50 text-emerald-950"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function AziendaPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [companyTypeOther, setCompanyTypeOther] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companySector, setCompanySector] = useState("");
  const [companySectorOther, setCompanySectorOther] = useState("");

  // STEP 2
  const [primaryRoleFamily, setPrimaryRoleFamily] = useState("");
  const [primaryRole, setPrimaryRole] = useState("");
  const [otherRole, setOtherRole] = useState("");
  const [secondaryRoles, setSecondaryRoles] = useState<SecondaryRole[]>([
    { family: "", role: "" },
    { family: "", role: "" },
  ]);
  const [missionDescription, setMissionDescription] = useState("");

  // STEP 3
  const [experienceBand, setExperienceBand] = useState("");
  const [managerialExperienceBand, setManagerialExperienceBand] = useState("");
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [otherCompetency, setOtherCompetency] = useState("");
  const [methodologies, setMethodologies] = useState<string[]>([]);
  const [otherMethodology, setOtherMethodology] = useState("");
  const [companyRevenueBand, setCompanyRevenueBand] = useState("");
  const [peopleManagedBand, setPeopleManagedBand] = useState("");
  const [pnlBudgetBand, setPnlBudgetBand] = useState("");
  const [productionTypes, setProductionTypes] = useState<string[]>([]);
  const [requiredSectors, setRequiredSectors] = useState<string[]>([]);
  const [otherRequiredSector, setOtherRequiredSector] = useState("");

  // STEP 4
  const [assignmentTypes, setAssignmentTypes] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dailyRateBand, setDailyRateBand] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [geographicAreas, setGeographicAreas] = useState<GeographicArea[]>([]);
  const [travelRequired, setTravelRequired] = useState(false);

  // STEP 5
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const progress = currentStep * 20;

  const provinceOptions = useMemo(
    () => (region ? regionProvinceMap[region] ?? [] : []),
    [region]
  );

  function toggleArray(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  function updateSecondaryRole(
    index: number,
    key: keyof SecondaryRole,
    value: string
  ) {
    setSecondaryRoles((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [key]: value,
        ...(key === "family" ? { role: "" } : {}),
      };
      return next;
    });
  }

  function addGeographicArea() {
    if (!region || !province) return;

    const exists = geographicAreas.some(
      (item) => item.region === region && item.province === province
    );

    if (!exists) {
      setGeographicAreas((prev) => [...prev, { region, province }]);
    }

    setProvince("");
  }

  function removeGeographicArea(index: number) {
    setGeographicAreas((prev) => prev.filter((_, i) => i !== index));
  }

  function isStepValid(step: number) {
    switch (step) {
      case 1:
        return (
          companyName.trim() &&
          companyType &&
          (companyType !== "Altro" || companyTypeOther.trim()) &&
          companySize &&
          companySector &&
          (companySector !== "Altro" || companySectorOther.trim())
        );

      case 2:
        return (
          primaryRoleFamily &&
          primaryRole &&
          (primaryRole !== "Altro" || otherRole.trim()) &&
          missionDescription.trim()
        );

      case 3:
        return (
          experienceBand &&
          managerialExperienceBand &&
          competencies.length > 0 &&
          methodologies.length > 0 &&
          companyRevenueBand &&
          peopleManagedBand &&
          pnlBudgetBand &&
          productionTypes.length > 0 &&
          requiredSectors.length > 0
        );

      case 4:
        return (
          assignmentTypes.length > 0 &&
          daysPerWeek &&
          startDate &&
          dailyRateBand &&
          geographicAreas.length > 0
        );

      case 5:
        return (
          contactName.trim() &&
          contactRole.trim() &&
          contactEmail.trim() &&
          contactPhone.trim() &&
          privacyAccepted &&
          termsAccepted
        );

      default:
        return false;
    }
  }

  function nextStep() {
    if (!isStepValid(currentStep)) {
      setSubmitError("Completa i campi obbligatori prima di proseguire.");
      return;
    }

    setSubmitError("");
    setCurrentStep((prev) => Math.min(5, prev + 1));
  }

  function previousStep() {
    setSubmitError("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  async function submitRequest() {
    if (!isStepValid(5)) {
      setSubmitError("Completa i campi obbligatori prima di inviare la richiesta.");
      return;
    }

    const payload = {
      company_name: companyName.trim(),
      company_type: companyType,
      company_type_other:
        companyType === "Altro" ? companyTypeOther.trim() : "",
      company_size: companySize,
      company_sector:
        companySector === "Altro"
          ? companySectorOther.trim()
          : companySector,

      primary_role_family: primaryRoleFamily,
      primary_role: primaryRole,
      other_role: primaryRole === "Altro" ? otherRole.trim() : "",
      secondary_roles: secondaryRoles.filter(
        (item) => item.family && item.role
      ),
      mission_description: missionDescription.trim(),

      experience_band: experienceBand,
      managerial_experience_band: managerialExperienceBand,
      competencies,
      other_competency: competencies.includes("Altro")
        ? otherCompetency.trim()
        : "",
      methodologies,
      other_methodology: methodologies.includes("Altro")
        ? otherMethodology.trim()
        : "",
      company_revenue_band: companyRevenueBand,
      people_managed_band: peopleManagedBand,
      pnl_budget_band: pnlBudgetBand,
      production_types: productionTypes,
      sectors: requiredSectors,
      other_sector: requiredSectors.includes("Altro")
        ? otherRequiredSector.trim()
        : "",

      assignment_types: assignmentTypes,
      days_per_week: Number(daysPerWeek),
      start_date: startDate,
      daily_rate_band: dailyRateBand,
      geographic_areas: geographicAreas,
      regions: Array.from(new Set(geographicAreas.map((item) => item.region))),
      provinces: geographicAreas.map((item) => item.province),
      travel_required: travelRequired,

      contact_name: contactName.trim(),
      contact_role: contactRole.trim(),
      contact_email: contactEmail.trim(),
      contact_phone: contactPhone.trim(),
      privacy_accepted: privacyAccepted,
      terms_accepted: termsAccepted,
    };

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch("/api/manager-company-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Non è stato possibile inviare la richiesta."
        );
      }

      setSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Non è stato possibile inviare la richiesta."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
            QuickSolve Management Network
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Richiesta inviata
          </h1>
          <p className="mt-3 text-slate-600">
            La richiesta è stata registrata correttamente.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
              QuickSolve Management Network
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              Richiesta aziendale
            </h1>
          </div>

          <div className="min-w-[120px] text-right">
            <p className="text-sm font-semibold text-slate-700">
              Step {currentStep} di 5
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-950">
              {progress}%
            </p>
          </div>
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          {currentStep === 1 && (
            <>
              <SectionTitle
                title="Azienda"
                subtitle="Inserisci i dati principali della tua realtà aziendale."
              />

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Ragione sociale
                  </label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Tipologia azienda
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {companyTypes.map((option) => (
                      <ChoiceButton
                        key={option}
                        active={companyType === option}
                        onClick={() => setCompanyType(option)}
                      >
                        {option}
                      </ChoiceButton>
                    ))}
                  </div>

                  {companyType === "Altro" && (
                    <input
                      value={companyTypeOther}
                      onChange={(e) => setCompanyTypeOther(e.target.value)}
                      placeholder="Specifica tipologia"
                      className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-900"
                    />
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Dimensione azienda
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {companySizes.map((option) => (
                      <ChoiceButton
                        key={option}
                        active={companySize === option}
                        onClick={() => setCompanySize(option)}
                      >
                        {option}
                      </ChoiceButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Settore
                  </label>
                  <select
                    value={companySector}
                    onChange={(e) => setCompanySector(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-900"
                  >
                    <option value="">Inserisci settore</option>
                    {sectorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {companySector === "Altro" && (
                    <input
                      value={companySectorOther}
                      onChange={(e) => setCompanySectorOther(e.target.value)}
                      placeholder="Specifica settore"
                      className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-900"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <SectionTitle title="Profilo ricercato" />

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Area del ruolo
                    </label>
                    <select
                      value={primaryRoleFamily}
                      onChange={(e) => {
                        setPrimaryRoleFamily(e.target.value);
                        setPrimaryRole("");
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                    >
                      <option value="">Seleziona area</option>
                      {Object.keys(roleFamilies).map((family) => (
                        <option key={family} value={family}>
                          {family}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Ruolo principale ricercato
                    </label>
                    <select
                      value={primaryRole}
                      disabled={!primaryRoleFamily}
                      onChange={(e) => setPrimaryRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 disabled:bg-slate-100"
                    >
                      <option value="">Seleziona ruolo</option>
                      {(roleFamilies[primaryRoleFamily] ?? []).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {primaryRole === "Altro" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Specifica il ruolo
                    </label>
                    <input
                      value={otherRole}
                      onChange={(e) => setOtherRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="mb-3 text-sm font-semibold text-slate-800">
                        Ruolo secondario {index + 1} (facoltativo)
                      </p>

                      <div className="space-y-3">
                        <select
                          value={secondaryRoles[index].family}
                          onChange={(e) =>
                            updateSecondaryRole(
                              index,
                              "family",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                        >
                          <option value="">Nessuno</option>
                          {Object.keys(roleFamilies).map((family) => (
                            <option key={family} value={family}>
                              {family}
                            </option>
                          ))}
                        </select>

                        <select
                          value={secondaryRoles[index].role}
                          disabled={!secondaryRoles[index].family}
                          onChange={(e) =>
                            updateSecondaryRole(
                              index,
                              "role",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 disabled:bg-slate-100"
                        >
                          <option value="">Nessuno</option>
                          {(
                            roleFamilies[secondaryRoles[index].family] ?? []
                          ).map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Obiettivo dell'incarico / esigenza aziendale
                  </label>
                  <textarea
                    value={missionDescription}
                    onChange={(e) => setMissionDescription(e.target.value)}
                    rows={5}
                    placeholder="Descrivi in modo sintetico il problema da risolvere, il risultato atteso o il progetto da gestire."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-900"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <SectionTitle title="Esperienza e competenze richieste" />

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Esperienza professionale
                    </label>
                    <select
                      value={experienceBand}
                      onChange={(e) => setExperienceBand(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                    >
                      <option value="">Seleziona</option>
                      {experienceOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Esperienza in ruoli manageriali
                    </label>
                    <select
                      value={managerialExperienceBand}
                      onChange={(e) =>
                        setManagerialExperienceBand(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                    >
                      <option value="">Seleziona</option>
                      {managerialExperienceOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Aree di competenza
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {competencyOptions.map((option) => (
                      <ChoiceButton
                        key={option}
                        active={competencies.includes(option)}
                        onClick={() =>
                          toggleArray(option, setCompetencies)
                        }
                      >
                        {option}
                      </ChoiceButton>
                    ))}
                  </div>

                  {competencies.includes("Altro") && (
                    <input
                      value={otherCompetency}
                      onChange={(e) => setOtherCompetency(e.target.value)}
                      placeholder="Specifica altra competenza"
                      className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    />
                  )}
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Metodologie e strumenti
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {methodologyOptions.map((option) => (
                      <ChoiceButton
                        key={option}
                        active={methodologies.includes(option)}
                        onClick={() =>
                          toggleArray(option, setMethodologies)
                        }
                      >
                        {option}
                      </ChoiceButton>
                    ))}
                  </div>

                  {methodologies.includes("Altro") && (
                    <input
                      value={otherMethodology}
                      onChange={(e) => setOtherMethodology(e.target.value)}
                      placeholder="Specifica altra metodologia"
                      className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    />
                  )}
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Seniority richiesta
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Fatturato aziende gestite
                      </label>
                      <select
                        value={companyRevenueBand}
                        onChange={(e) => setCompanyRevenueBand(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                      >
                        <option value="">Seleziona</option>
                        {revenueBandOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Persone coordinate
                      </label>
                      <select
                        value={peopleManagedBand}
                        onChange={(e) => setPeopleManagedBand(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                      >
                        <option value="">Seleziona</option>
                        {peopleManagedOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Budget / P&amp;L gestito
                      </label>
                      <select
                        value={pnlBudgetBand}
                        onChange={(e) => setPnlBudgetBand(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                      >
                        <option value="">Seleziona</option>
                        {pnlBandOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-800">
                      Contesto produttivo
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {productionTypeOptions.map((option) => (
                        <ChoiceButton
                          key={option}
                          active={productionTypes.includes(option)}
                          onClick={() =>
                            toggleArray(option, setProductionTypes)
                          }
                        >
                          {option}
                        </ChoiceButton>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-800">
                      Settori di esperienza richiesti
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {sectorOptions.map((option) => (
                        <ChoiceButton
                          key={option}
                          active={requiredSectors.includes(option)}
                          onClick={() =>
                            toggleArray(option, setRequiredSectors)
                          }
                        >
                          {option}
                        </ChoiceButton>
                      ))}
                    </div>

                    {requiredSectors.includes("Altro") && (
                      <input
                        value={otherRequiredSector}
                        onChange={(e) =>
                          setOtherRequiredSector(e.target.value)
                        }
                        placeholder="Specifica altro settore"
                        className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <SectionTitle title="Incarico e area geografica" />

              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Tipo di incarico
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {assignmentTypeOptions.map((option) => (
                      <ChoiceButton
                        key={option}
                        active={assignmentTypes.includes(option)}
                        onClick={() =>
                          toggleArray(option, setAssignmentTypes)
                        }
                      >
                        {option}
                      </ChoiceButton>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Giorni alla settimana
                    </label>
                    <select
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                    >
                      <option value="">Seleziona</option>
                      {daysPerWeekOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Data indicativa di avvio
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Budget giornaliero
                    </label>
                    <select
                      value={dailyRateBand}
                      onChange={(e) => setDailyRateBand(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                    >
                      <option value="">Seleziona</option>
                      {dailyRateOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Area geografica dell'incarico
                  </p>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <select
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setProvince("");
                      }}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                    >
                      <option value="">Regione</option>
                      {Object.keys(regionProvinceMap).map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>

                    <select
                      value={province}
                      disabled={!region}
                      onChange={(e) => setProvince(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 disabled:bg-slate-100"
                    >
                      <option value="">Provincia</option>
                      {provinceOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={addGeographicArea}
                      className="rounded-xl bg-emerald-950 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Aggiungi
                    </button>
                  </div>

                  {geographicAreas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {geographicAreas.map((area, index) => (
                        <button
                          key={`${area.region}-${area.province}-${index}`}
                          type="button"
                          onClick={() => removeGeographicArea(index)}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                        >
                          {area.province} ×
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={travelRequired}
                    onChange={(e) => setTravelRequired(e.target.checked)}
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Sono previste trasferte
                  </span>
                </label>
              </div>
            </>
          )}

          {currentStep === 5 && (
            <>
              <SectionTitle title="Referente e invio" />

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Nome e cognome referente
                    </label>
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Ruolo del referente
                    </label>
                    <input
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-0.5 h-5 w-5"
                    />
                    <span className="text-sm text-slate-700">
                      Dichiaro di aver preso visione dell'informativa privacy.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 h-5 w-5"
                    />
                    <span className="text-sm text-slate-700">
                      Accetto le condizioni del servizio.
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          {submitError ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {submitError}
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 1}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Indietro
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="rounded-xl bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Avanti
              </button>
            ) : (
              <button
                type="button"
                onClick={submitRequest}
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Invio in corso..." : "Invia richiesta"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
