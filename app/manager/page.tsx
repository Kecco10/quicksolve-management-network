"use client";

import { useMemo, useState } from "react";

type ExperienceBand =
  | "Meno di 6 anni"
  | "6–10 anni"
  | "11–20 anni"
  | "Oltre 20 anni";

type ManagerialExperienceBand = "Meno di 3 anni" | "3–10 anni" | "Oltre 10 anni";
type RoleFamily = keyof typeof roleFamilies;

const PRIVACY_VERSION = "1.0-2026-09-21";
const TERMS_VERSION = "1.0-2026-09-21";
const PRIVACY_URL = "/legal/privacy-manager";
const TERMS_URL = "/legal/condizioni-manager";

const stepTitles = [
  "Identità ed esperienza",
  "Ruoli e competenze",
  "Seniority e contesto",
  "Disponibilità e qualifiche",
  "Economico e privacy",
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

const productionTypeOptions = ["ETO", "MTO", "ATO", "MTS", "Processo continuo"] as const;

const sectorOptions = [
  "Automotive",
  "Macchine automatiche",
  "Carpenteria",
  "Packaging",
  "Impiantistica",
  "Oil & Gas",
  "Aerospace",
  "Energia",
  "Navale",
  "Biomedicale",
  "Railway",
] as const;

const assignmentTypeOptions = [
  "Temporary full time",
  "Fractional a giorni",
  "Progetto a termine",
  "Advisory",
] as const;

const revenueBandOptions = [
  "Fino a 10 M€",
  "10–50 M€",
  "50–100 M€",
  "100–250 M€",
  "Oltre 250 M€",
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

const dailyRateOptions = [
  "Fino a 400 € / giorno",
  "500 € / giorno",
  "600 € / giorno",
  "700 € / giorno",
  "800 € / giorno",
] as const;

const studyTitleOptions = [
  "Diploma tecnico",
  "Laurea triennale",
  "Laurea magistrale / vecchio ordinamento",
  "Master / MBA",
  "Dottorato",
  "Altro",
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
    .replace(/(^|[\s'-])\p{L}/gu, (match) => match.toLocaleUpperCase("it-IT"));
}

function toggleInList(value: string, current: string[], max?: number) {
  if (current.includes(value)) return current.filter((item) => item !== value);
  if (max && current.length >= max) return current;
  return [...current, value];
}

export default function ManagerPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [experience, setExperience] = useState<ExperienceBand | "">("");
  const [managerialExperience, setManagerialExperience] = useState<ManagerialExperienceBand | "">("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<Array<{ region: string; province: string }>>([]);

  const [roleFamily, setRoleFamily] = useState<RoleFamily | "">("");
  const [primaryRole, setPrimaryRole] = useState("");
  const [otherRole, setOtherRole] = useState("");
  const [secondaryRoleFamily1, setSecondaryRoleFamily1] = useState<RoleFamily | "">("");
  const [secondaryRole1, setSecondaryRole1] = useState("");
  const [secondaryOtherRole1, setSecondaryOtherRole1] = useState("");
  const [secondaryRoleFamily2, setSecondaryRoleFamily2] = useState<RoleFamily | "">("");
  const [secondaryRole2, setSecondaryRole2] = useState("");
  const [secondaryOtherRole2, setSecondaryOtherRole2] = useState("");
  const [methodologies, setMethodologies] = useState<string[]>([]);
  const [otherMethodology, setOtherMethodology] = useState("");

  const [revenueBand, setRevenueBand] = useState("");
  const [peopleManagedBand, setPeopleManagedBand] = useState("");
  const [pnlBand, setPnlBand] = useState("");
  const [productionTypes, setProductionTypes] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [otherSector, setOtherSector] = useState("");

  const [assignmentTypes, setAssignmentTypes] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [travelAvailable, setTravelAvailable] = useState(false);
  const [vatActive, setVatActive] = useState<"" | "Sì" | "No">("");
  const [professionalInsurance, setProfessionalInsurance] = useState<"" | "Sì" | "No">("");
  const [insuranceLimit, setInsuranceLimit] = useState("");
  const [certifications, setCertifications] = useState("");
  const [languages, setLanguages] = useState("");
  const [studyTitle, setStudyTitle] = useState("");
  const [otherStudyTitle, setOtherStudyTitle] = useState("");

  const [dailyRateBand, setDailyRateBand] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [visibilityConsent, setVisibilityConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const roleOptions = useMemo(() => (roleFamily ? [...roleFamilies[roleFamily]] : []), [roleFamily]);
  const secondaryRoleOptions1 = useMemo(
    () => (secondaryRoleFamily1 ? [...roleFamilies[secondaryRoleFamily1]] : []),
    [secondaryRoleFamily1]
  );
  const secondaryRoleOptions2 = useMemo(
    () => (secondaryRoleFamily2 ? [...roleFamilies[secondaryRoleFamily2]] : []),
    [secondaryRoleFamily2]
  );

  const passwordValid = password.length >= 6 && password === confirmPassword;
  const normalizedPrimaryRole = primaryRole === "Altro" ? otherRole.trim() : primaryRole;
  const normalizedSecondaryRole1 = secondaryRole1 === "Altro" ? secondaryOtherRole1.trim() : secondaryRole1;
  const normalizedSecondaryRole2 = secondaryRole2 === "Altro" ? secondaryOtherRole2.trim() : secondaryRole2;

  const secondaryRoles = [
    secondaryRoleFamily1 && normalizedSecondaryRole1
      ? { family: secondaryRoleFamily1, role: normalizedSecondaryRole1 }
      : null,
    secondaryRoleFamily2 && normalizedSecondaryRole2
      ? { family: secondaryRoleFamily2, role: normalizedSecondaryRole2 }
      : null,
  ].filter((item): item is { family: RoleFamily; role: string } => Boolean(item));

  const primaryRoleValid = Boolean(roleFamily && normalizedPrimaryRole);
  const secondaryRole1Valid =
    secondaryRoleFamily1 === "" || Boolean(secondaryRole1 && normalizedSecondaryRole1);
  const secondaryRole2Valid =
    secondaryRoleFamily2 === "" || Boolean(secondaryRole2 && normalizedSecondaryRole2);

  const methodologiesValid =
    methodologies.length > 0 &&
    (!methodologies.includes("Altro") || otherMethodology.trim() !== "");

  const studyTitleValid = studyTitle !== "" && (studyTitle !== "Altro" || otherStudyTitle.trim() !== "");

  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          experience !== "" &&
          managerialExperience !== "" &&
          selectedAreas.length > 0
        );
      case 1:
        return primaryRoleValid && secondaryRole1Valid && secondaryRole2Valid && methodologiesValid;
      case 2:
        return revenueBand !== "" && peopleManagedBand !== "" && pnlBand !== "" && productionTypes.length > 0 && (sectors.length > 0 || otherSector.trim() !== "");
      case 3:
        return (
          assignmentTypes.length > 0 &&
          daysPerWeek !== "" &&
          availableFrom !== "" &&
          vatActive === "Sì" &&
          professionalInsurance !== "" &&
          (professionalInsurance !== "Sì" || insuranceLimit.trim() !== "") &&
          studyTitleValid &&
          dailyRateBand !== ""
        );
      case 4:
        return (
          firstName.trim() !== "" &&
          lastName.trim() !== "" &&
          email.trim() !== "" &&
          whatsappPhone.trim() !== "" &&
          birthDate !== "" &&
          passwordValid &&
          privacyAcknowledged &&
          termsAccepted &&
          visibilityConsent
        );
      default:
        return false;
    }
  }, [
    currentStep,
    firstName,
    lastName,
    email,
    whatsappPhone,
    birthDate,
    passwordValid,
    experience,
    managerialExperience,
    selectedAreas,
    primaryRoleValid,
    secondaryRole1Valid,
    secondaryRole2Valid,
    methodologiesValid,
    revenueBand,
    peopleManagedBand,
    pnlBand,
    productionTypes,
    sectors,
    otherSector,
    assignmentTypes,
    daysPerWeek,
    availableFrom,
    vatActive,
    professionalInsurance,
    insuranceLimit,
    studyTitleValid,
    dailyRateBand,
    privacyAcknowledged,
    termsAccepted,
    visibilityConsent,
  ]);

  const progress = ((currentStep + 1) / stepTitles.length) * 100;

  function nextStep() {
    if (!canContinue) return;
    setSubmitError("");
    setCurrentStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setSubmitError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeProvince(regionToRemove: string, provinceToRemove: string) {
    setSelectedAreas((current) =>
      current.filter(
        (area) =>
          !(area.region === regionToRemove && area.province === provinceToRemove)
      )
    );
  }


  async function handleSubmit() {
    if (!canContinue || isSubmitting) return;

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
          whatsapp_phone: whatsappPhone.trim(),
          birth_date: birthDate,
          linkedin_url: linkedinUrl.trim() || undefined,
          experience_band: experience,
          managerial_experience_band: managerialExperience,
          region: selectedAreas[0]?.region ?? "",
          province: selectedAreas[0]?.province ?? "",
          regions: Array.from(new Set(selectedAreas.map((area) => area.region))),
          provinces: selectedAreas.map((area) => area.province),
          geographic_areas: selectedAreas,
          primary_role_family: roleFamily,
          primary_role: normalizedPrimaryRole,
          other_role: primaryRole === "Altro" ? otherRole.trim() : undefined,
          secondary_roles: secondaryRoles,
          methodologies: methodologies.filter((item) => item !== "Altro"),
          other_methodology: methodologies.includes("Altro") ? otherMethodology.trim() : undefined,
          company_revenue_band: revenueBand,
          people_managed_band: peopleManagedBand,
          pnl_budget_band: pnlBand,
          production_types: productionTypes,
          sectors,
          other_sector: otherSector.trim() || undefined,
          assignment_types: assignmentTypes,
          days_per_week: Number(daysPerWeek),
          available_from: availableFrom,
          travel_available: travelAvailable,
          vat_active: vatActive === "Sì",
          professional_insurance: professionalInsurance === "Sì",
          insurance_limit: professionalInsurance === "Sì" ? insuranceLimit.trim() : undefined,
          certifications: certifications.trim() || undefined,
          languages: languages.trim() || undefined,
          study_title: studyTitle === "Altro" ? otherStudyTitle.trim() : studyTitle,
          daily_rate_band: dailyRateBand,
          privacy_acknowledged: privacyAcknowledged,
          privacy_version: PRIVACY_VERSION,
          terms_accepted: termsAccepted,
          terms_version: TERMS_VERSION,
          profile_visibility_consent: visibilityConsent,
          profile_visibility_version: PRIVACY_VERSION,
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(data?.message || "Errore durante la registrazione.");
      setSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Si è verificato un errore durante la registrazione.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f0f8] text-4xl text-[#0b2340]">✓</div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">Registrazione completata</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Il tuo profilo QuickSolve Management Network è stato registrato. Potrai aggiornarlo dalla tua area personale quando cambieranno disponibilità, competenze o informazioni professionali.
          </p>
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0b2340]">QuickSolve · Management Network</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Crea il tuo profilo manageriale</h1>
            </div>

            <div className="inline-flex w-fit shrink-0 items-center gap-3 self-start rounded-xl border border-[#d7e1ec] bg-[#eef3f8] px-4 py-2.5 text-sm font-semibold text-[#071b33] shadow-sm sm:mb-1 sm:self-auto">
              <span>Step {currentStep + 1} di 5</span>
              <span className="h-4 w-px bg-[#d7e1ec]" />
              <span className="font-bold">{Math.round(progress)}%</span>
            </div>
          </div>

          {submitError && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{submitError}</div>}

          {currentStep === 0 && (
            <section className="space-y-6">
              <SectionTitle title="Esperienza e area geografica" subtitle="" />
              <ChoiceSection title="Anni di esperienza professionale">
                <div className="grid gap-3 sm:grid-cols-2">{experienceOptions.map((option) => <ChoiceButton key={option} active={experience === option} onClick={() => setExperience(option)}>{option}</ChoiceButton>)}</div>
              </ChoiceSection>
              <ChoiceSection title="Anni di esperienza in ruoli manageriali">
                <div className="grid gap-3 sm:grid-cols-3">{managerialExperienceOptions.map((option) => <ChoiceButton key={option} active={managerialExperience === option} onClick={() => setManagerialExperience(option)}>{option}</ChoiceButton>)}</div>
              </ChoiceSection>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-900">Area geografica</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Provincia">
                    <select
                      value={province}
                      disabled={!region}
                      onChange={(e) => {
                        const selectedProvince = e.target.value;
                        setProvince("");

                        if (!region || !selectedProvince) return;

                        setSelectedAreas((current) => {
                          const alreadySelected = current.some(
                            (area) =>
                              area.region === region &&
                              area.province === selectedProvince
                          );

                          if (alreadySelected) return current;

                          return [
                            ...current,
                            { region, province: selectedProvince },
                          ];
                        });
                      }}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                    >
                      <option value="">
                        {region ? "Seleziona la provincia" : "Prima seleziona la regione"}
                      </option>
                      {region &&
                        regionProvinceMap[region].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                  </Field>
                </div>

                {selectedAreas.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Province selezionate
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAreas.map((area) => (
                        <div
                          key={`${area.region}-${area.province}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d7e1ec] bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          <span>{area.province}</span>
                          <button
                            type="button"
                            onClick={() => removeProvince(area.region, area.province)}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
                            aria-label={`Rimuovi ${area.province}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={travelAvailable}
                    onChange={(e) => setTravelAvailable(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#0b2340] focus:ring-[#164873]"
                  />
                  <span className="text-sm font-semibold text-slate-800">Disponibile a trasferte</span>
                </label>
              </div>
            </section>
          )}

          {currentStep === 1 && (
            <section className="space-y-7">
              <SectionTitle title="Ruoli e competenze" subtitle="" />
              <RoleSelector title="Ruolo principale" family={roleFamily} role={primaryRole} otherRole={otherRole} roleOptions={roleOptions} onFamilyChange={(value) => { setRoleFamily(value); setPrimaryRole(""); setOtherRole(""); }} onRoleChange={(value) => { setPrimaryRole(value); if (value !== "Altro") setOtherRole(""); }} onOtherRoleChange={setOtherRole} required />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-6">
                  <RoleSelector title="Ruolo secondario 1 (facoltativo)" family={secondaryRoleFamily1} role={secondaryRole1} otherRole={secondaryOtherRole1} roleOptions={secondaryRoleOptions1} onFamilyChange={(value) => { setSecondaryRoleFamily1(value); setSecondaryRole1(""); setSecondaryOtherRole1(""); }} onRoleChange={(value) => { setSecondaryRole1(value); if (value !== "Altro") setSecondaryOtherRole1(""); }} onOtherRoleChange={setSecondaryOtherRole1} />
                  <RoleSelector title="Ruolo secondario 2 (facoltativo)" family={secondaryRoleFamily2} role={secondaryRole2} otherRole={secondaryOtherRole2} roleOptions={secondaryRoleOptions2} onFamilyChange={(value) => { setSecondaryRoleFamily2(value); setSecondaryRole2(""); setSecondaryOtherRole2(""); }} onRoleChange={(value) => { setSecondaryRole2(value); if (value !== "Altro") setSecondaryOtherRole2(""); }} onOtherRoleChange={setSecondaryOtherRole2} />
                </div>
              </div>


              <MultiSelectSection title="Metodologie e strumenti" subtitle="" options={methodologyOptions} values={methodologies} onToggle={(value) => setMethodologies((current) => toggleInList(value, current))} />
              {methodologies.includes("Altro") && <Field label="Specifica altra metodologia o strumento"><input value={otherMethodology} onChange={(e) => setOtherMethodology(e.target.value)} className={inputClass} placeholder="Descrivi metodologia o strumento" /></Field>}
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-7">
              <SectionTitle title="Seniority e contesto produttivo" subtitle="" />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Fatturato aziende in cui hai operato"><select value={revenueBand} onChange={(e) => setRevenueBand(e.target.value)} className={inputClass}><option value="">Seleziona fascia</option>{revenueBandOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Numero massimo di persone coordinate"><select value={peopleManagedBand} onChange={(e) => setPeopleManagedBand(e.target.value)} className={inputClass}><option value="">Seleziona fascia</option>{peopleManagedOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Budget o P&L gestito"><select value={pnlBand} onChange={(e) => setPnlBand(e.target.value)} className={inputClass}><option value="">Seleziona fascia</option>{pnlBandOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
              </div>

              <MultiSelectSection title="Tipologia produttiva" subtitle="" options={productionTypeOptions} values={productionTypes} onToggle={(value) => setProductionTypes((current) => toggleInList(value, current))} />
              <MultiSelectSection title="Settori industriali" subtitle="" options={sectorOptions} values={sectors} onToggle={(value) => setSectors((current) => toggleInList(value, current))} />
              <Field label="Altro settore"><input value={otherSector} onChange={(e) => setOtherSector(e.target.value)} className={inputClass} placeholder="Es. Food & Beverage, Chimico, Farmaceutico..." /></Field>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-7">
              <SectionTitle title="Disponibilità e qualifiche" subtitle="" />
              <MultiSelectSection title="Tipo di incarico" subtitle="" options={assignmentTypeOptions} values={assignmentTypes} onToggle={(value) => setAssignmentTypes((current) => toggleInList(value, current))} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Giorni a settimana disponibili"><select value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} className={inputClass}><option value="">Seleziona</option>{[1,2,3,4,5].map((day) => <option key={day} value={day}>{day}</option>)}</select></Field>
                <Field label="Data di prima disponibilità"><input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className={inputClass} /></Field>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <Field label="Fascia di tariffa giornaliera">
                  <select value={dailyRateBand} onChange={(e) => setDailyRateBand(e.target.value)} className={inputClass}>
                    <option value="">Seleziona fascia</option>
                    {dailyRateOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-900">Qualificazione B2B</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="P.IVA attiva"><select value={vatActive} onChange={(e) => setVatActive(e.target.value as "" | "Sì" | "No")} className={inputClass}><option value="">Seleziona</option><option>Sì</option><option>No</option></select></Field>
                  <Field label="Copertura RC professionale"><select value={professionalInsurance} onChange={(e) => { setProfessionalInsurance(e.target.value as "" | "Sì" | "No"); if (e.target.value !== "Sì") setInsuranceLimit(""); }} className={inputClass}><option value="">Seleziona</option><option>Sì</option><option>No</option></select></Field>
                </div>
                {vatActive === "No" && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Profilo non registrabile nel network professionale.</strong> QuickSolve Management Network opera su rapporti B2B: per completare la registrazione è necessaria una P.IVA attiva.</div>}
                {professionalInsurance === "Sì" && <div className="mt-4"><Field label="Massimale RC professionale"><input value={insuranceLimit} onChange={(e) => setInsuranceLimit(e.target.value)} className={inputClass} placeholder="Es. 1.000.000 €" /></Field></div>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Certificazioni"><textarea value={certifications} onChange={(e) => setCertifications(e.target.value)} className={`${inputClass} min-h-28 resize-y`} placeholder="Es. Six Sigma Black Belt, PMP, ISO, IATF, PED / EN 13445..." /></Field>
                <Field label="Lingue e livello"><textarea value={languages} onChange={(e) => setLanguages(e.target.value)} className={`${inputClass} min-h-28 resize-y`} placeholder="Es. Inglese C1, Tedesco B2..." /></Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Titolo di studio"><select value={studyTitle} onChange={(e) => { setStudyTitle(e.target.value); if (e.target.value !== "Altro") setOtherStudyTitle(""); }} className={inputClass}><option value="">Seleziona</option>{studyTitleOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
                {studyTitle === "Altro" ? <Field label="Specifica titolo di studio"><input value={otherStudyTitle} onChange={(e) => setOtherStudyTitle(e.target.value)} className={inputClass} placeholder="Inserisci titolo" /></Field> : <div />}
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="space-y-7">
              <SectionTitle title="Dati personali e accesso" subtitle="" />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 pb-5 pt-0">
<div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Field label="Nome"><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} onBlur={() => setFirstName(formatPersonName(firstName))} className={inputClass} placeholder="Es. Marco" /></Field>
                  <Field label="Cognome"><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} onBlur={() => setLastName(formatPersonName(lastName))} className={inputClass} placeholder="Es. Rossi" /></Field>
                  <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="nome@email.com" /></Field>
                  <Field label="Numero di telefono WhatsApp">
                    <input
                      type="tel"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+39 333 1234567"
                    />
                  </Field>

                  <Field label="Data di nascita">
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="LinkedIn (opzionale)">
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className={inputClass}
                      placeholder="https://www.linkedin.com/in/..."
                    />
                  </Field>
                  <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Minimo 6 caratteri" /></Field>
                  <Field label="Conferma password"><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="Ripeti la password" /></Field>
                </div>
                {password && password.length < 6 && <p className="mt-3 text-sm text-rose-600">La password deve contenere almeno 6 caratteri.</p>}
                {confirmPassword && password !== confirmPassword && <p className="mt-3 text-sm text-rose-600">Le password non coincidono.</p>}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-bold text-slate-900">Privacy, condizioni e visibilità</h2>
                <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
                  <label className="flex items-start gap-3"><input type="checkbox" checked={privacyAcknowledged} onChange={(e) => setPrivacyAcknowledged(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b2340] focus:ring-[#0b2340]" /><span>Dichiaro di aver letto l&apos;<a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="font-semibold text-[#0b2340] underline underline-offset-2">Informativa Privacy Manager</a>.</span></label>
                  <label className="flex items-start gap-3"><input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b2340] focus:ring-[#0b2340]" /><span>Accetto espressamente le <a href={TERMS_URL} target="_blank" rel="noreferrer" className="font-semibold text-[#0b2340] underline underline-offset-2">Condizioni di Utilizzo Manager</a>.</span></label>
                  <label className="flex items-start gap-3"><input type="checkbox" checked={visibilityConsent} onChange={(e) => setVisibilityConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b2340] focus:ring-[#0b2340]" /><span>Acconsento separatamente alla visibilità del mio profilo professionale strutturato alle aziende potenzialmente compatibili, inizialmente senza i miei dati di contatto direttamente identificativi.</span></label>
                </div>
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
            <button type="button" onClick={previousStep} disabled={currentStep === 0 || isSubmitting} className="rounded-2xl border border-slate-300 px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Indietro</button>
            {currentStep < stepTitles.length - 1 ? (
              <button type="button" onClick={nextStep} disabled={!canContinue} className="rounded-2xl bg-[#0b2340] px-7 py-3.5 font-semibold text-white transition hover:bg-[#12385f] disabled:cursor-not-allowed disabled:opacity-40">Avanti</button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={!canContinue || isSubmitting} className="rounded-2xl bg-[#0b2340] px-7 py-3.5 font-semibold text-white transition hover:bg-[#12385f] disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? "Registrazione in corso..." : "Crea il profilo manageriale"}</button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const inputClass = "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0b2340] focus:ring-2 focus:ring-[#0b2340]/10";

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h2 className="text-2xl font-bold text-slate-900">{title}</h2><p className="mt-2 max-w-3xl leading-7 text-slate-600">{subtitle}</p></div>;
}

function ChoiceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-2xl border px-5 py-4 text-left font-semibold transition ${active ? "border-[#0b2340] bg-[#eef3f8] text-[#071b33]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>{children}</button>;
}

function MultiSelectSection({ title, subtitle, options, values, onToggle }: { title: string; subtitle: string; options: readonly string[]; values: string[]; onToggle: (value: string) => void }) {
  return (
    <div>
      <div className="mb-3"><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const active = values.includes(option);
          return <button key={option} type="button" onClick={() => onToggle(option)} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${active ? "border-[#0b2340] bg-[#eef3f8] text-[#071b33]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${active ? "border-[#0b2340] bg-[#0b2340] text-white" : "border-slate-300 bg-white"}`}>{active ? "✓" : ""}</span><span>{option}</span></button>;
        })}
      </div>
    </div>
  );
}

function RoleSelector({ title, family, role, otherRole, roleOptions, onFamilyChange, onRoleChange, onOtherRoleChange, required = false }: { title: string; family: RoleFamily | ""; role: string; otherRole: string; roleOptions: string[]; onFamilyChange: (value: RoleFamily | "") => void; onRoleChange: (value: string) => void; onOtherRoleChange: (value: string) => void; required?: boolean }) {
  return (
    <div>
      <h3 className="font-bold text-slate-900">{title}{required ? "" : ""}</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <Field label="Famiglia professionale"><select value={family} onChange={(e) => onFamilyChange(e.target.value as RoleFamily | "")} className={inputClass}><option value="">{required ? "Seleziona la famiglia" : "Nessuna"}</option>{Object.keys(roleFamilies).map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
        <Field label="Ruolo"><select value={role} disabled={!family} onChange={(e) => onRoleChange(e.target.value)} className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}><option value="">{family ? "Seleziona il ruolo" : "Prima seleziona la famiglia"}</option>{roleOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
      </div>
      {role === "Altro" && <div className="mt-4"><Field label="Specifica il ruolo"><input value={otherRole} onChange={(e) => onOtherRoleChange(e.target.value)} className={inputClass} placeholder="Inserisci il ruolo" /></Field></div>}
    </div>
  );
}
