"use client";

import { useEffect, useMemo, useState } from "react";

type StudyTitle =
  | "Diploma di maturità"
  | "Laurea Triennale"
  | "Laurea Magistrale"
  | "Altro";

type ExperienceLevel = "0-2 anni" | "3-5 anni" | "6-10 anni" | "10+ anni";

type CollaborationType =
  | "Dipendente full time"
  | "Dipendente part-time"
  | "Freelancer partita IVA";

type CadSkill = { name: string; rating: number };
type CustomCadSkill = { name: string; rating: number };

type SelectedProvinceEntry = {
  id: string;
  region: string;
  province: string;
};

const DESIGNER_PRIVACY_VERSION = "3.0-2026-09-11";
const DESIGNER_TERMS_VERSION = "3.0-2026-09-11";
const DESIGNER_PRIVACY_URL = "/legal/privacy-progettisti";
const DESIGNER_TERMS_URL = "/legal/condizioni-progettisti";

type DesignerSignupPayload = {
  first_name: string;
  last_name: string;
  birth_date: string;
  study_title: StudyTitle;
  study_title_other?: string;
  experience: ExperienceLevel;
  collaboration_type: CollaborationType;
  budget_range: string;
  selected_region?: string;
  selected_province_entries: SelectedProvinceEntry[];
  // Legacy compatibility: the API still accepts this while old clients exist.
  selected_provinces?: string[];
  is_all_italy: boolean;
  is_remote: boolean;
  sectors: string[];
  sector_other?: string;
  cad_skills: CadSkill[];
  custom_cad_skills: CustomCadSkill[];
  email: string;
  whatsapp: string;
  linkedin?: string;
  password: string;
  privacy_acknowledged: boolean;
  privacy_version: string;
  terms_accepted: boolean;
  terms_version: string;
};

const stepTitles = [
  "Titolo di studio",
  "Esperienza",
  "Tipologia di collaborazione",
  "Software CAD",
  "Settori industriali",
  "Zone operative",
  "Contatti e accesso",
  "Riepilogo",
  "Stato candidatura",
] as const;

const studyTitleOptions: StudyTitle[] = [
  "Diploma di maturità",
  "Laurea Triennale",
  "Laurea Magistrale",
  "Altro",
];

const experienceOptions: ExperienceLevel[] = [
  "0-2 anni",
  "3-5 anni",
  "6-10 anni",
  "10+ anni",
];

const collaborationOptions: CollaborationType[] = [
  "Dipendente full time",
  "Dipendente part-time",
  "Freelancer partita IVA",
];

const employeeRangeOptions = [
  "18.000 - 24.000 €",
  "24.000 - 30.000 €",
  "30.000 - 40.000 €",
  "40.000 - 50.000 €",
  "50.000 - 60.000 €",
  "60.000 €+",
];

const freelanceRangeOptions = [
  "15 - 20 €/h",
  "20 - 30 €/h",
  "30 - 40 €/h",
  "40 - 50 €/h",
  "50 €/h+",
];

const cadOptions = [
  "SolidWorks",
  "Inventor",
  "PTC Creo",
  "CATIA",
  "AutoCAD",
  "Solid Edge",
  "Modeling",
  "NX",
  "Fusion 360",
  "Blender",
  "Revit",
] as const;

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

const regionOptions = Object.keys(regionProvinceMap);

function buildProvinceEntries(
  region: string,
  provinces: string[]
): SelectedProvinceEntry[] {
  if (!region) return [];

  return provinces.map((province) => ({
    id: `province-${region}-${province}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    region,
    province,
  }));
}

function formatPersonName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("it-IT")
    .replace(/(^|[\s'-])\p{L}/gu, (match) =>
      match.toLocaleUpperCase("it-IT")
    );
}

export default function ProgettistaPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [studyTitle, setStudyTitle] = useState<StudyTitle>("Diploma di maturità");
  const [studyTitleOther, setStudyTitleOther] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel>("0-2 anni");
  const [collaborationType, setCollaborationType] = useState<CollaborationType>("Dipendente full time");
  const [budgetRange, setBudgetRange] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorOther, setSectorOther] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [isRemote, setIsRemote] = useState(false);
  const [cadSkills, setCadSkills] = useState<CadSkill[]>(
    cadOptions.map((name) => ({ name, rating: 0 }))
  );
  const [customCadSkills, setCustomCadSkills] = useState<CustomCadSkill[]>([
    { name: "", rating: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Popup referral mostrato solo dopo una registrazione completata con successo.
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const referralUrl = "https://engineering.quicksolve.it/progettista";
  const referralMessage =
    "Ciao! Mi sono iscritto a QuickSolve Engineering Network, un network dedicato a mettere in contatto progettisti meccanici e aziende. L'iscrizione è gratuita, se può interessarti: " +
    referralUrl;

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(referralMessage)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(
    "QuickSolve Engineering Network"
  )}&body=${encodeURIComponent(referralMessage)}`;

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  }

  useEffect(() => {
    setBudgetRange("");
  }, [collaborationType]);

  const totalSteps = stepTitles.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const topTitle = stepTitles[currentStep];
  const passwordsMatch = password === confirmPassword;
  const passwordLongEnough = password.trim().length >= 6;

  const validCustomCadSkills = customCadSkills.filter(
    (skill) => skill.name.trim() !== "" && skill.rating > 0
  );

  const budgetOptions = useMemo(() => {
    if (collaborationType === "Freelancer partita IVA") return freelanceRangeOptions;
    return employeeRangeOptions;
  }, [collaborationType]);

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 0:
        if (studyTitle === "Altro") return studyTitleOther.trim() !== "";
        return true;
      case 1:
        return true;
      case 2:
        return budgetRange.trim() !== "";
      case 3:
        return cadSkills.some((skill) => skill.rating > 0) || validCustomCadSkills.length > 0;
      case 4:
        return sectors.length > 0 || sectorOther.trim() !== "";
      case 5:
        // La provincia è sempre obbligatoria. Remote è solo una disponibilità aggiuntiva.
        return selectedProvinces.length > 0;
      case 6:
        return (
          firstName.trim() !== "" &&
          lastName.trim() !== "" &&
          birthDate.trim() !== "" &&
          whatsapp.trim() !== "" &&
          email.trim() !== "" &&
          passwordLongEnough &&
          confirmPassword.trim() !== "" &&
          passwordsMatch
        );
      case 7:
        return privacyAcknowledged && termsAccepted;
      default:
        return true;
    }
  }, [
    currentStep,
    studyTitle,
    studyTitleOther,
    budgetRange,
    cadSkills,
    validCustomCadSkills,
    sectors,
    sectorOther,
    isRemote,
    selectedProvinces,
    firstName,
    lastName,
    birthDate,
    whatsapp,
    email,
    passwordLongEnough,
    confirmPassword,
    passwordsMatch,
    privacyAcknowledged,
    termsAccepted,
  ]);

  function nextStep() {
    if (!canGoNext) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }

  function prevStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  function updateCadRating(name: string, rating: number) {
    setCadSkills((prev) =>
      prev.map((skill) =>
        skill.name === name
          ? { ...skill, rating: skill.rating === rating ? 0 : rating }
          : skill
      )
    );
  }

  function addProvince(province: string) {
    setSelectedProvinces((prev) => (prev.includes(province) ? prev : [...prev, province]));
  }

  function removeProvince(province: string) {
    setSelectedProvinces((prev) => prev.filter((item) => item !== province));
  }

  function addCustomCadSkill() {
    setCustomCadSkills((prev) => [...prev, { name: "", rating: 0 }]);
  }

  function updateCustomCadName(index: number, value: string) {
    setCustomCadSkills((prev) =>
      prev.map((skill, i) => (i === index ? { ...skill, name: value } : skill))
    );
  }

  function updateCustomCadRating(index: number, rating: number) {
    setCustomCadSkills((prev) =>
      prev.map((skill, i) =>
        i === index ? { ...skill, rating: skill.rating === rating ? 0 : rating } : skill
      )
    );
  }

  function removeCustomCadSkill(index: number) {
    setCustomCadSkills((prev) => {
      if (prev.length === 1) return [{ name: "", rating: 0 }];
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleFinalSubmit() {
    if (isSubmitting) return;

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const payload: DesignerSignupPayload = {
        first_name: formatPersonName(firstName),
        last_name: formatPersonName(lastName),
        birth_date: birthDate,
        study_title: studyTitle,
        study_title_other: studyTitleOther.trim() || undefined,
        experience,
        collaboration_type: collaborationType,
        budget_range: budgetRange,
        selected_region: selectedRegion || undefined,
        selected_province_entries: buildProvinceEntries(selectedRegion, selectedProvinces),
        selected_provinces: selectedProvinces,
        is_all_italy: false,
        is_remote: isRemote,
        sectors,
        sector_other: sectorOther.trim() || undefined,
        cad_skills: cadSkills.filter((skill) => skill.rating > 0),
        custom_cad_skills: validCustomCadSkills,
        email,
        whatsapp,
        linkedin: linkedin.trim() || undefined,
        password,
        privacy_acknowledged: privacyAcknowledged,
        privacy_version: DESIGNER_PRIVACY_VERSION,
        terms_accepted: termsAccepted,
        terms_version: DESIGNER_TERMS_VERSION,
      };

      const response = await fetch("/api/progettisti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(data?.message || "Errore durante la creazione del profilo.");
      }

      setCurrentStep(8);
      setLinkCopied(false);
      setSharePopupOpen(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Si è verificato un errore durante l'invio della candidatura."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderChoiceButton(
    option: string,
    active: boolean,
    onClick: () => void,
    disabled = false
  ) {
    return (
      <button
        key={option}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`rounded-2xl border px-5 py-4 text-left transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : active
            ? "border-emerald-900 bg-emerald-50 text-emerald-950"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <span className="text-lg font-semibold">{option}</span>
      </button>
    );
  }

  function renderStarButtons(value: number, onChange: (rating: number) => void) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= value;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`h-11 w-11 rounded-xl border text-lg font-bold transition ${
                active
                  ? "border-emerald-700 bg-emerald-100 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
    );
  }

  const selectedCad = cadSkills.filter((skill) => skill.rating > 0);
  const finalStudyTitle = studyTitle === "Altro" ? studyTitleOther : studyTitle;

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-900">
              QuickSolve · Registrazione progettista
            </p>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">
                  Step {currentStep + 1} di {totalSteps}
                </p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
                  {topTitle}
                </h1>
              </div>

              <div className="hidden rounded-2xl bg-slate-100 px-4 py-3 text-right md:block">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Completamento</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(progress)}%</p>
              </div>
            </div>
          </div>

          <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {currentStep === 0 && (
            <section className="space-y-4">
              <p className="text-lg text-slate-600">Seleziona il tuo titolo di studio principale.</p>
              <div className="grid gap-3">
                {studyTitleOptions.map((option) =>
                  renderChoiceButton(option, studyTitle === option, () => setStudyTitle(option))
                )}
              </div>
              {studyTitle === "Altro" && (
                <div>
                  <label htmlFor="studyTitleOther" className="mb-2 block text-sm font-medium text-slate-700">
                    Specifica il percorso di studi
                  </label>
                  <input
                    id="studyTitleOther"
                    type="text"
                    value={studyTitleOther}
                    onChange={(e) => setStudyTitleOther(e.target.value)}
                    placeholder="Es. Diploma tecnico industriale meccanico"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>
              )}
            </section>
          )}

          {currentStep === 1 && (
            <section className="space-y-4">
              <p className="text-lg text-slate-600">Indica la tua esperienza professionale.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {experienceOptions.map((option) =>
                  renderChoiceButton(option, experience === option, () => setExperience(option))
                )}
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-5">
              <p className="text-lg text-slate-600">
                Scegli la tipologia di collaborazione che preferisci e indica il range economico.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {collaborationOptions.map((option) =>
                  renderChoiceButton(option, collaborationType === option, () =>
                    setCollaborationType(option)
                  )
                )}
              </div>
              <div>
                <label htmlFor="budgetRange" className="mb-2 block text-sm font-medium text-slate-700">
                  {collaborationType === "Freelancer partita IVA"
                    ? "Range economico indicativo"
                    : "RAL indicativa"}
                </label>
                <select
                  id="budgetRange"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  style={{ color: budgetRange ? "#0f172a" : "#94a3b8" }}
                >
                  <option value="" style={{ color: "#94a3b8" }}>
                    {collaborationType === "Freelancer partita IVA"
                      ? "Seleziona il tuo range orario"
                      : "Seleziona la tua RAL indicativa"}
                  </option>
                  {budgetOptions.map((option) => (
                    <option key={option} value={option} style={{ color: "#0f172a" }}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-5">
              <p className="text-lg text-slate-600">Valuta il tuo livello sui software CAD che utilizzi.</p>
              <div className="space-y-4">
                {cadSkills.map((skill) => (
                  <div key={skill.name} className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{skill.name}</h3>
                        <p className="text-sm text-slate-500">Assegna un punteggio da 1 a 5 stelle</p>
                      </div>
                      {renderStarButtons(skill.rating, (rating) => updateCadRating(skill.name, rating))}
                    </div>
                  </div>
                ))}

                {customCadSkills.map((skill, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 p-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                      <div>
                        <label htmlFor={`customCad-${index}`} className="mb-2 block text-sm font-bold text-slate-700">
                          Altro software CAD
                        </label>
                        <input
                          id={`customCad-${index}`}
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateCustomCadName(index, e.target.value)}
                          placeholder="Specifica altro software"
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-900"
                        />
                      </div>
                      <div>
                        {renderStarButtons(skill.rating, (rating) => updateCustomCadRating(index, rating))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={addCustomCadSkill}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                      >
                        Aggiungi un altro software
                      </button>

                      {customCadSkills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCustomCadSkill(index)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="space-y-5">
              <p className="text-lg text-slate-600">Seleziona i settori in cui hai esperienza.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {sectorOptions.map((option) =>
                  renderChoiceButton(option, sectors.includes(option), () =>
                    setSectors((prev) =>
                      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
                    )
                  )
                )}
              </div>
              <div>
                <label htmlFor="sectorOther" className="mb-2 block text-sm font-medium text-slate-700">
                  Altro settore
                </label>
                <input
                  id="sectorOther"
                  type="text"
                  value={sectorOther}
                  onChange={(e) => setSectorOther(e.target.value)}
                  placeholder="Es. Food, Pharma, Difesa..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                />
              </div>
            </section>
          )}

          {currentStep === 5 && (
            <section className="space-y-6">
              <p className="text-lg text-slate-600">Indica le tue zone operative.</p>
              <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-900 focus:ring-emerald-900"
                />
                <span>Remote</span>
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="selectedRegion" className="mb-2 block text-sm font-medium text-slate-700">
                    Seleziona una regione
                  </label>
                  <select
                    id="selectedRegion"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">Scegli una regione</option>
                    {regionOptions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="provinceSelect" className="mb-2 block text-sm font-medium text-slate-700">
                    Province della regione
                  </label>
                  <select
                    id="provinceSelect"
                    value=""
                    disabled={!selectedRegion}
                    onChange={(e) => {
                      const province = e.target.value;
                      if (province) addProvince(province);
                    }}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {selectedRegion
                        ? "Seleziona una provincia"
                        : "Prima seleziona una regione"}
                    </option>
                    {selectedRegion &&
                      regionProvinceMap[selectedRegion].map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700">Province selezionate</p>
                {selectedProvinces.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Seleziona almeno una provincia per continuare.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedProvinces.map((province) => (
                      <button
                        key={province}
                        type="button"
                        onClick={() => removeProvince(province)}
                        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                      >
                        {province}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {currentStep === 6 && (
            <section className="space-y-5">
              <p className="text-lg text-slate-600">Inserisci i tuoi contatti e crea l'accesso al profilo.</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-700">Nome</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setFirstName(formatPersonName(firstName))}
                    placeholder="Es. Marco"
                    autoCapitalize="words"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-700">Cognome</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setLastName(formatPersonName(lastName))}
                    placeholder="Es. Rossi"
                    autoCapitalize="words"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label htmlFor="birthDate" className="mb-2 block text-sm font-medium text-slate-700">Data di nascita</label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium text-slate-700">
                    Numero di telefono WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+39 333 1234567"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@email.com"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="mb-2 block text-sm font-medium text-slate-700">
                    LinkedIn opzionale
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://www.linkedin.com/in/tuo-profilo"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                  {!passwordLongEnough && password.length > 0 && (
                    <p className="mt-2 text-sm text-rose-600">La password deve contenere almeno 6 caratteri.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                    Conferma password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ripeti la password"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-2 text-sm text-rose-600">Le password non coincidono.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {currentStep === 7 && (
            <section className="space-y-6">
              <p className="text-lg text-slate-600">Questo è il riepilogo finale del tuo profilo.</p>

              {submitError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {submitError}
                </div>
              )}

              <div className="grid gap-4">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Titolo di studio</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{finalStudyTitle}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Esperienza</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{experience}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Tipologia di collaborazione</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{collaborationType}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Range economico</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{budgetRange}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Software CAD</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCad.map((skill) => (
                      <span key={skill.name} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        {skill.name} · {"★".repeat(skill.rating)}
                      </span>
                    ))}
                    {validCustomCadSkills.map((skill, index) => (
                      <span key={`${skill.name}-${index}`} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        {skill.name} · {"★".repeat(skill.rating)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Settori industriali</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sectors.map((sector) => (
                      <span key={sector} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        {sector}
                      </span>
                    ))}
                    {sectorOther.trim() && (
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        {sectorOther}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Zone operative</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {isRemote && (
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        Remote
                      </span>
                    )}
                    {selectedProvinces.map((province) => (
                      <span key={province} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        {province}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Contatti</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>Nome: {firstName}</p>
                    <p>Cognome: {lastName}</p>
                    <p>Data di nascita: {birthDate}</p>
                    <p>WhatsApp: {whatsapp}</p>
                    <p>Email: {email}</p>
                    {linkedin.trim() && <p className="break-all">LinkedIn: {linkedin}</p>}
                    <p>Accesso profilo: attivazione immediata senza conferma email</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-900">
                    Privacy e condizioni
                  </p>

                  <div className="mt-4 space-y-4 text-sm text-slate-700">
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
                          href={DESIGNER_PRIVACY_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-emerald-900 underline underline-offset-2"
                        >
                          Informativa Privacy Progettisti
                        </a>
                        .
                      </span>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-900 focus:ring-emerald-900"
                      />
                      <span>
                        Accetto le{" "}
                        <a
                          href={DESIGNER_TERMS_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-emerald-900 underline underline-offset-2"
                        >
                          Condizioni di utilizzo QuickSolve Engineering Network
                        </a>
                        .
                      </span>
                    </label>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Il profilo professionale può essere mostrato alle aziende compatibili
                    inizialmente senza i dati di contatto direttamente identificativi.
                    Se un&apos;azienda seleziona il profilo, QuickSolve può contattarti per
                    verificarne disponibilità e interesse. In caso di interesse reciproco,
                    QuickSolve può facilitare l&apos;introduzione tra le parti secondo quanto
                    indicato nell&apos;Informativa Privacy e nelle Condizioni di utilizzo.
                  </p>
                </div>
              </div>
            </section>
          )}

          {currentStep === 8 && (
            <section className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-4xl text-emerald-900">✓</span>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-slate-900">Profilo creato correttamente</h2>
                <div className="mx-auto mt-4 max-w-2xl space-y-3 text-lg text-slate-600">
                  <p>Il tuo profilo è stato registrato nel sistema QuickSolve.</p>
                  <p>Puoi accedere al tuo profilo tramite area login.</p>
                </div>
              </div>
            </section>
          )}

          {currentStep !== 8 && (
            <div className="mt-10 border-t border-slate-200 pt-6">
              <div className={currentStep === 0 ? "flex justify-end" : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Indietro
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={currentStep === 7 ? handleFinalSubmit : nextStep}
                  disabled={!canGoNext || isSubmitting}
                  className="rounded-2xl bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {currentStep === 7 ? (isSubmitting ? "Invio in corso..." : "Completa candidatura") : "Continua"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>

      {/* =====================================================
          POPUP CONDIVISIONE
          Si apre automaticamente solo dopo una registrazione riuscita.
      ====================================================== */}
      {sharePopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
          onClick={() => setSharePopupOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSharePopupOpen(false)}
              aria-label="Chiudi"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ×
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✓
            </div>

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Profilo registrato!
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Conosci un altro progettista meccanico che potrebbe essere
              interessato? Aiutaci a far crescere il network.
            </p>

            <div className="mt-6 grid gap-3">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Condividi su WhatsApp
              </a>

              <a
                href={emailShareUrl}
                className="flex w-full items-center justify-center rounded-2xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Invita via email
              </a>

              <button
                type="button"
                onClick={copyReferralLink}
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {linkCopied ? "Link copiato ✓" : "Copia link"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSharePopupOpen(false)}
              className="mt-5 text-sm font-medium text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline"
            >
              Non ora
            </button>
          </div>
        </div>
      )}
    </>
  );
}