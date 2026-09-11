"use client";

import { useEffect, useMemo, useState } from "react";
import { getCheckoutDesignerZone } from "@/lib/checkout-location-display";

type CompanyType =
  | "Piccola/media impresa"
  | "Grande azienda"
  | "Ufficio tecnico"
  | "Azienda di consulenza"
  | "Agenzia per il lavoro"
  | "Altro"
  | "";

type CompanySize =
  | "1-9 dipendenti"
  | "10-49 dipendenti"
  | "50-249 dipendenti"
  | "250-999 dipendenti"
  | "Oltre 1000 dipendenti"
  | "";

type EmploymentType =
  | "Impiegato full time"
  | "Impiegato part-time"
  | "Collaborazione freelance Partita IVA"
  | "";

type ProfileLevel =
  | "Junior"
  | "Middle"
  | "Senior"
  | "Responsabile ufficio tecnico"
  | "";

type CadSkill = {
  name: string;
  selected: boolean;
};


type MatchDesigner = {
  id: string;
  percentage: number;
  birthDate: string;
  studyTitle: string;
  studyTitleOther: string;
  experience: string;
  collaborationType: string;
  budgetRange: string;
  selectedRegion: string;
  selectedProvinceEntries: Array<{
    id?: string;
    region?: string;
    province?: string;
  }>;
  isRemote: boolean;
  cadSkills: Array<{ name: string; rating?: number }>;
  customCadSkills: Array<{ name: string; rating?: number }>;
  sectors: string[];
  sectorOther: string;
};

const COMPANY_PRIVACY_VERSION = "3.0-2026-09-11";
const COMPANY_TERMS_VERSION = "3.0-2026-09-11";
const COMPANY_PRIVACY_URL = "/legal/privacy-aziende";
const COMPANY_TERMS_URL = "/legal/condizioni-aziende";


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
];

const designerSoftwareOptions = [
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
];

const companySizeOptions: CompanySize[] = [
  "1-9 dipendenti",
  "10-49 dipendenti",
  "50-249 dipendenti",
  "250-999 dipendenti",
  "Oltre 1000 dipendenti",
];

const employeeRangeOptions = [
  "24.000 - 30.000 €",
  "30.000 - 40.000 €",
  "40.000 - 50.000 €",
  "50.000 - 60.000 €",
  "> 60.000 €",
];

const freelanceRangeOptions = [
  "15 - 20 €/h",
  "20 - 30 €/h",
  "30 - 40 €/h",
  "40 - 50 €/h",
  "> 50 €/h",
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

const stepTitles = [
  "Azienda",
  "Referente",
  "Figura richiesta",
  "Zona di lavoro",
  "Software richiesti",
];

export default function AziendaPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState<CompanyType>("");
  const [companyTypeOther, setCompanyTypeOther] = useState("");
  const [companySize, setCompanySize] = useState<CompanySize>("");
  const [companySector, setCompanySector] = useState("");
  const [companySectorOther, setCompanySectorOther] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [employmentType, setEmploymentType] = useState<EmploymentType>("");
  const [experienceLevel, setExperienceLevel] = useState<ProfileLevel>("");
  const [jobDescription, setJobDescription] = useState("");

  const [employeeEconomicRange, setEmployeeEconomicRange] = useState("");
  const [freelanceEconomicRange, setFreelanceEconomicRange] = useState("");

  const [experienceSectors, setExperienceSectors] = useState<string[]>([]);
  const [selectedSectorToAdd, setSelectedSectorToAdd] = useState("");

  const [workModes, setWorkModes] = useState<string[]>(["In presenza"]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");

  const [cadSkills, setCadSkills] = useState<CadSkill[]>(
    designerSoftwareOptions.map((name) => ({ name, selected: false }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [requestCode, setRequestCode] = useState("");
  const [matchResults, setMatchResults] = useState<MatchDesigner[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [selectedDesignerIds, setSelectedDesignerIds] = useState<string[]>([]);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSendingContactRequest, setIsSendingContactRequest] = useState(false);
  const [contactRequestError, setContactRequestError] = useState("");
  const [contactRequestSent, setContactRequestSent] = useState(false);

  const totalSteps = stepTitles.length;
  const progress = ((Math.min(currentStep, totalSteps - 1) + 1) / totalSteps) * 100;
  const selectedSoftware = cadSkills.filter((skill) => skill.selected);
  const hasRemote = workModes.includes("Remoto");
  const isFreelanceRequest = employmentType === "Collaborazione freelance Partita IVA";

  const selectedDesignerCount = selectedDesignerIds.length;

  const toggleDesignerSelection = (designerId: string) => {
    if (contactRequestSent) return;

    setSelectedDesignerIds((current) =>
      current.includes(designerId)
        ? current.filter((id) => id !== designerId)
        : [...current, designerId]
    );
  };


  async function sendContactRequest() {
    if (
      selectedDesignerIds.length === 0 ||
      isSendingContactRequest ||
      contactRequestSent
    ) {
      return;
    }

    setContactRequestError("");
    setIsSendingContactRequest(true);

    try {
      const response = await fetch("/api/company-contact-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestCode: requestCode || null,
          designerIds: selectedDesignerIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Impossibile inoltrare la richiesta."
        );
      }

      setContactRequestSent(true);
    } catch (error) {
      setContactRequestError(
        error instanceof Error
          ? error.message
          : "Impossibile inoltrare la richiesta."
      );
    } finally {
      setIsSendingContactRequest(false);
    }
  }

  const allowedCompanySizes = useMemo(() => {
    if (companyType === "Piccola/media impresa") return companySizeOptions.slice(0, 3);
    if (companyType === "Grande azienda") return companySizeOptions.slice(3);
    return companySizeOptions;
  }, [companyType]);

  const provinceOptions = useMemo(() => {
    if (!selectedRegion) return [];
    return regionProvinceMap[selectedRegion] ?? [];
  }, [selectedRegion]);

  useEffect(() => {
    if (companySize && !allowedCompanySizes.includes(companySize)) {
      setCompanySize("");
    }
  }, [companySize, allowedCompanySizes]);

  useEffect(() => {
    if (employmentType === "Impiegato full time" || employmentType === "Impiegato part-time") {
      setFreelanceEconomicRange("");
    }
    if (employmentType === "Collaborazione freelance Partita IVA") {
      setEmployeeEconomicRange("");
    }
  }, [employmentType]);

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          companyName.trim() !== "" &&
          companyType !== "" &&
          (companyType !== "Altro" || companyTypeOther.trim() !== "") &&
          companySize !== "" &&
          companySector !== "" &&
          (companySector !== "Altro" || companySectorOther.trim() !== "")
        );
      case 1:
        return (
          contactName.trim() !== "" &&
          contactRole.trim() !== "" &&
          contactPhone.trim() !== "" &&
          contactEmail.trim() !== ""
        );
      case 2: {
        const hasEconomicRange =
          ((employmentType === "Impiegato full time" || employmentType === "Impiegato part-time") &&
            employeeEconomicRange !== "") ||
          (employmentType === "Collaborazione freelance Partita IVA" &&
            freelanceEconomicRange !== "");

        return (
          employmentType !== "" &&
          experienceLevel !== "" &&
          experienceSectors.length > 0 &&
          hasEconomicRange &&
          jobDescription.trim() !== ""
        );
      }
      case 3:
        return selectedRegion !== "" && selectedProvince !== "";
      case 4:
        return (
          selectedSoftware.length > 0 &&
          privacyAcknowledged &&
          termsAccepted
        );
      default:
        return true;
    }
  }, [
    currentStep,
    companyName,
    companyType,
    companyTypeOther,
    companySize,
    companySector,
    companySectorOther,
    contactName,
    contactRole,
    contactPhone,
    contactEmail,
    employmentType,
    experienceLevel,
    experienceSectors.length,
    employeeEconomicRange,
    freelanceEconomicRange,
    jobDescription,
    selectedRegion,
    selectedProvince,
    selectedSoftware.length,
    privacyAcknowledged,
    termsAccepted,
  ]);

  function nextStep() {
    if (!canGoNext || isSubmitting) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }

  function prevStep() {
    if (isSubmitting) return;
    setCurrentStep((prev) => Math.max(prev - 1, 0));
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
        aria-disabled={disabled}
        className={`rounded-2xl border px-5 py-4 text-left transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70"
            : active
            ? "border-emerald-900 bg-emerald-50 text-emerald-950"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <span className="text-base font-semibold">{option}</span>
      </button>
    );
  }

  function toggleSoftware(name: string) {
    setCadSkills((prev) =>
      prev.map((skill) =>
        skill.name === name ? { ...skill, selected: !skill.selected } : skill
      )
    );
  }

  function toggleWorkMode(mode: string) {
    setWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((item) => item !== mode) : [...prev, mode]
    );
  }

  function handleSectorSelect(value: string) {
    if (!value) return;
    if (experienceSectors.includes(value)) {
      setSelectedSectorToAdd("");
      return;
    }
    setExperienceSectors((prev) => [...prev, value]);
    setSelectedSectorToAdd("");
  }

  function removeSector(sector: string) {
    setExperienceSectors((prev) => prev.filter((item) => item !== sector));
  }

  function calculateAge(birthDate: string) {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age -= 1;
    }

    return age >= 0 ? age : null;
  }

  function normalizeMatchResults(data: any): MatchDesigner[] {
    const rawMatches = Array.isArray(data?.matches)
      ? data.matches
      : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.designers)
      ? data.designers
      : [];

    return rawMatches
      .map((raw: any, index: number): MatchDesigner | null => {
        const candidate = raw?.candidate ?? raw?.profile ?? raw?.designer ?? raw;
        const percentage = Number(
          raw?.percentage ??
            raw?.matchPercentage ??
            raw?.score ??
            raw?.breakdown?.percentage ??
            candidate?.percentage ??
            0
        );

        if (!Number.isFinite(percentage) || percentage < 80) return null;

        return {
          id: String(candidate?.id ?? candidate?.user_id ?? raw?.id ?? index),
          percentage: Math.round(percentage),
          birthDate: String(candidate?.birth_date ?? candidate?.birthDate ?? ""),
          studyTitle: String(candidate?.study_title ?? candidate?.studyTitle ?? ""),
          studyTitleOther: String(
            candidate?.study_title_other ?? candidate?.studyTitleOther ?? ""
          ),
          experience: String(candidate?.experience ?? ""),
          collaborationType: String(
            candidate?.collaboration_type ?? candidate?.collaborationType ?? ""
          ),
          budgetRange: String(
            candidate?.budget_range ??
              candidate?.budgetRange ??
              candidate?.economic_range ??
              candidate?.economicRange ??
              raw?.budget_range ??
              raw?.budgetRange ??
              raw?.economic_range ??
              raw?.economicRange ??
              raw?.breakdown?.budget_range ??
              raw?.breakdown?.budgetRange ??
              raw?.breakdown?.budget?.designer ??
              raw?.breakdown?.budget?.candidate ??
              ""
          ),
          selectedRegion: String(
            candidate?.selected_region ?? candidate?.selectedRegion ?? ""
          ),
          selectedProvinceEntries: Array.isArray(
            candidate?.selected_province_entries ?? candidate?.selectedProvinceEntries
          )
            ? candidate?.selected_province_entries ??
              candidate?.selectedProvinceEntries
            : [],
          isRemote: Boolean(candidate?.is_remote ?? candidate?.isRemote),
          cadSkills: Array.isArray(candidate?.cad_skills ?? candidate?.cadSkills)
            ? candidate?.cad_skills ?? candidate?.cadSkills
            : [],
          customCadSkills: Array.isArray(
            candidate?.custom_cad_skills ?? candidate?.customCadSkills
          )
            ? candidate?.custom_cad_skills ?? candidate?.customCadSkills
            : [],
          sectors: Array.isArray(candidate?.sectors) ? candidate.sectors : [],
          sectorOther: String(candidate?.sector_other ?? candidate?.sectorOther ?? ""),
        };
      })
      .filter((item: MatchDesigner | null): item is MatchDesigner => item !== null)
      .sort((a: MatchDesigner, b: MatchDesigner) => b.percentage - a.percentage);
  }


  function getDesignerZone(designer: MatchDesigner) {
    return getCheckoutDesignerZone({
      selectedProvinceEntries: designer.selectedProvinceEntries,
      selectedRegion: designer.selectedRegion,
      isRemote: designer.isRemote,
      requestedProvince: selectedProvince,
    });
  }

  function getDesignerStudyTitle(designer: MatchDesigner) {
    if (designer.studyTitle === "Altro" && designer.studyTitleOther.trim()) {
      return designer.studyTitleOther;
    }

    return designer.studyTitle || "Non specificato";
  }

  function getDesignerCad(designer: MatchDesigner) {
    return [
      ...designer.cadSkills
        .filter((skill) => Number(skill.rating ?? 0) > 0)
        .map((skill) => ({
          name: skill.name,
          rating: Math.max(1, Math.min(5, Number(skill.rating ?? 0))),
        })),
      ...designer.customCadSkills
        .filter((skill) => skill.name?.trim() && Number(skill.rating ?? 0) > 0)
        .map((skill) => ({
          name: skill.name.trim(),
          rating: Math.max(1, Math.min(5, Number(skill.rating ?? 0))),
        })),
    ];
  }

  function getDesignerSectors(designer: MatchDesigner) {
    return [
      ...designer.sectors,
      ...(designer.sectorOther.trim() ? [designer.sectorOther.trim()] : []),
    ];
  }

  async function submitCompanyRequest() {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/company-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyType,
          companyTypeOther,
          companySize,
          companySector,
          companySectorOther,
          contactName,
          contactRole,
          contactPhone,
          contactEmail,
          employmentType,
          experienceLevel,
          jobDescription,
          employeeEconomicRange,
          freelanceEconomicRange,
          experienceSectors,
                cadSkills,
                selectedRegion,
          selectedProvince,
          isRemote: hasRemote,
          workModes,
          privacyAcknowledged,
          privacyVersion: COMPANY_PRIVACY_VERSION,
          termsAccepted,
          termsVersion: COMPANY_TERMS_VERSION,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Errore durante il salvataggio della richiesta.");

      const createdRequestId = Number(data?.request?.id);
      setRequestCode(data?.request?.codice ?? "");
      setMatchResults([]);
      setCurrentStep(5);

      // LinkedIn Ads - conversione "Richiesta aziendale inviata"
      if (
        typeof window !== "undefined" &&
        typeof (window as any).lintrk === "function"
      ) {
        (window as any).lintrk("track", {
          conversion_id: 29673770,
        });
      }

      if (Number.isFinite(createdRequestId)) {
        setIsLoadingMatches(true);

        try {
          const matchResponse = await fetch(
            `/api/matching/company-request/${createdRequestId}`,
            { cache: "no-store" }
          );

          const matchData = await matchResponse.json();

          if (matchResponse.ok) {
            setMatchResults(normalizeMatchResults(matchData));
          }
        } catch {
          setMatchResults([]);
        } finally {
          setIsLoadingMatches(false);
        }
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Errore durante l'invio della richiesta."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:py-10 [&_button:not(:disabled)]:cursor-pointer">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          {currentStep !== 5 && (
            <div className="mb-8">
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Step {currentStep + 1} di {totalSteps}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
                    {stepTitles[currentStep]}
                  </h1>
                </div>
                <div className="hidden rounded-2xl bg-slate-100 px-4 py-3 text-right md:block">
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
              <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-900 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {submitError && currentStep !== 5 && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {currentStep === 0 && (
            <section className="space-y-5">
              <p className="text-lg text-slate-600">
                Inserisci i dati principali della tua realtà aziendale.
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Ragione sociale
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Es. Alfa Engineering Srl"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Piccola/media impresa",
                  "Grande azienda",
                  "Ufficio tecnico",
                  "Azienda di consulenza",
                  "Agenzia per il lavoro",
                  "Altro",
                ].map((option) =>
                  renderChoiceButton(
                    option,
                    companyType === option,
                    () => setCompanyType(option as CompanyType)
                  )
                )}
              </div>

              {companyType === "Altro" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Specifica tipologia
                  </label>
                  <input
                    type="text"
                    value={companyTypeOther}
                    onChange={(e) => setCompanyTypeOther(e.target.value)}
                    placeholder="Es. Studio esterno specializzato"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>
              )}

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Dimensione azienda
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {companySizeOptions.map((option) =>
                    renderChoiceButton(
                      option,
                      companySize === option,
                      () => setCompanySize(option),
                      !allowedCompanySizes.includes(option)
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Settore
                </label>
                <select
                  value={companySector}
                  onChange={(e) => setCompanySector(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-900"
                  style={{ color: companySector ? "#0f172a" : "#94a3b8" }}
                >
                  <option value="" disabled style={{ color: "#94a3b8" }}>
                    Inserisci settore
                  </option>
                  {sectorOptions.map((sector) => (
                    <option key={sector} value={sector} style={{ color: "#0f172a" }}>
                      {sector}
                    </option>
                  ))}
                  <option value="Altro" style={{ color: "#0f172a" }}>
                    Altro
                  </option>
                </select>
              </div>

              {companySector === "Altro" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Specifica settore
                  </label>
                  <input
                    type="text"
                    value={companySectorOther}
                    onChange={(e) => setCompanySectorOther(e.target.value)}
                    placeholder="Es. Food, Pharma, Difesa..."
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>
              )}
            </section>
          )}

          {currentStep === 1 && (
            <section className="space-y-5">
              <p className="text-lg text-slate-600">
                Inserisci i riferimenti della persona che seguirà la richiesta.
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nome e Cognome
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Ruolo
                </label>
                <input
                  type="text"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  placeholder="Es. Responsabile ufficio tecnico"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Contatto Telefonico
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+39 333 1234567"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="nome@azienda.it"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                  />
                </div>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Tipo di impiego
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Impiegato full time",
                    "Impiegato part-time",
                    "Collaborazione freelance Partita IVA",
                  ].map((option) =>
                    renderChoiceButton(
                      option,
                      employmentType === option,
                      () => setEmploymentType(option as EmploymentType)
                    )
                  )}
                </div>
              </div>

              {employmentType !== "" && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Finestra economica
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {employmentType === "Collaborazione freelance Partita IVA"
                        ? "Range tariffa oraria previsto"
                        : "Range economico previsto"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Seleziona il range economico coerente con la figura che stai cercando.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {(employmentType === "Impiegato full time" ||
                      employmentType === "Impiegato part-time") &&
                      employeeRangeOptions.map((option) =>
                        renderChoiceButton(
                          option,
                          employeeEconomicRange === option,
                          () => setEmployeeEconomicRange(option)
                        )
                      )}

                    {employmentType === "Collaborazione freelance Partita IVA" &&
                      freelanceRangeOptions.map((option) =>
                        renderChoiceButton(
                          option,
                          freelanceEconomicRange === option,
                          () => setFreelanceEconomicRange(option)
                        )
                      )}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Esperienza richiesta
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ProfileLevel)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-900"
                  style={{ color: experienceLevel ? "#0f172a" : "#94a3b8" }}
                >
                  <option value="" style={{ color: "#94a3b8" }}>Seleziona esperienza</option>
                  <option value="Junior" style={{ color: "#0f172a" }}>Junior</option>
                  <option value="Middle" style={{ color: "#0f172a" }}>Middle</option>
                  <option value="Senior" style={{ color: "#0f172a" }}>Senior</option>
                  <option value="Responsabile ufficio tecnico" style={{ color: "#0f172a" }}>
                    Responsabile ufficio tecnico
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Settori di esperienza richiesti
                </label>

                <div className="flex flex-col gap-3">
                  <select
                    value={selectedSectorToAdd}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedSectorToAdd(value);
                      handleSectorSelect(value);
                    }}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-900"
                    style={{ color: selectedSectorToAdd ? "#0f172a" : "#94a3b8" }}
                  >
                    <option value="" style={{ color: "#94a3b8" }}>Seleziona settore</option>
                    {sectorOptions.map((sector) => (
                      <option key={sector} value={sector} style={{ color: "#0f172a" }}>
                        {sector}
                      </option>
                    ))}
                  </select>

                  {experienceSectors.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {experienceSectors.map((sector) => (
                        <div
                          key={sector}
                          className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900"
                        >
                          <span>{sector}</span>
                          <button
                            type="button"
                            onClick={() => removeSector(sector)}
                            className="text-emerald-900 hover:text-emerald-950"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Descrizione Job
                </label>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Descrivi brevemente attività richieste, obiettivi e contesto..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-900"
                />
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-5">
              <p className="text-lg text-slate-600">
                Seleziona la zona di lavoro. La provincia è obbligatoria; Remote è una disponibilità aggiuntiva.
              </p>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Zona di lavoro
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    Regione e provincia
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Regione
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedProvince("");
                      }}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-900"
                    >
                      <option value="">Seleziona regione</option>
                      {regionOptions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Provincia
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      disabled={!selectedRegion}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-900 disabled:bg-slate-100"
                    >
                      <option value="">Seleziona provincia</option>
                      {provinceOptions.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="mt-5 inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasRemote}
                    onChange={() => toggleWorkMode("Remoto")}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-900 focus:ring-emerald-900"
                  />
                  <span>Remote</span>
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-700">
                  Stato selezione:{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedProvince || selectedRegion || "Nessuna zona selezionata"}
                    {hasRemote ? " + Remote" : ""}
                  </span>
                </p>
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="space-y-5">
              <p className="text-lg text-slate-600">
                Seleziona i software richiesti per la figura o il progetto.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {cadSkills.map((skill) =>
                  renderChoiceButton(skill.name, skill.selected, () =>
                    toggleSoftware(skill.name)
                  )
                )}
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
                        href={COMPANY_PRIVACY_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-900 underline underline-offset-2"
                      >
                        Informativa Privacy Aziende
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
                        href={COMPANY_TERMS_URL}
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

              </div>
            </section>
          )}

          {currentStep === 5 && (
            <section className="space-y-8">
              {isLoadingMatches ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    Analisi dei profili in corso...
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Stiamo confrontando i requisiti della richiesta con i progettisti
                    presenti nel network QuickSolve.
                  </p>
                </div>
              ) : matchResults.length > 0 ? (
                <>
<div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Richiesta ricevuta
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-700 md:text-base">
                      La vostra richiesta è stata registrata correttamente. Di seguito potete consultare l&apos;elenco dei progettisti attualmente compatibili con i requisiti indicati.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-7">
                    <h2 className="text-2xl font-bold text-emerald-950">
                      Selezionate i professionisti di vostro interesse
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-700 md:text-base">
                      {isFreelanceRequest ? (
                        <>
                          QuickSolve offre un servizio di <strong>visibilità, matching e facilitazione all&apos;avvio della collaborazione</strong> con professionisti freelance della rete compatibili con la vostra richiesta.
                        </>
                      ) : (
                        <>
                          QuickSolve offre un servizio di <strong>visibilità, matching e facilitazione del contatto</strong> con professionisti della rete compatibili con la vostra ricerca.
                        </>
                      )}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700 md:text-base">
                      Selezionate uno o più profili di vostro interesse e inoltrate la richiesta a QuickSolve.
                    </p>
                  </div>
                </div>
                  <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...matchResults]
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((designer) => {
                      const age = calculateAge(designer.birthDate);
                      const cad = getDesignerCad(designer);
                      const sectors = getDesignerSectors(designer);
                      const isSelected = selectedDesignerIds.includes(designer.id);
                      const canSelect = !contactRequestSent;

                      return (
                        <button
                          key={designer.id}
                          type="button"
                          onClick={() => toggleDesignerSelection(designer.id)}
                          disabled={!canSelect}
                          className={`relative flex w-full self-start flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                            !canSelect
                              ? "cursor-default border-slate-200 opacity-65"
                              : isSelected
                              ? "border-emerald-700 bg-emerald-100 shadow-md ring-2 ring-emerald-300"
                              : "border-slate-200 hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-stretch gap-2 p-3 pb-2">
                            <div className={`relative flex min-w-0 flex-1 items-center rounded-xl px-3 py-2 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                  Contratto / collaborazione
                                </p>
                                <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                                  {designer.collaborationType || "Non specificato"}
                                </p>
                                <p className="mt-0.5 truncate text-xs font-medium text-emerald-800">
                                  {designer.budgetRange || "Range economico non specificato"}
                                </p>
                              </div>
                            </div>

                            <div className="flex w-[82px] shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-950 px-2 py-2 text-center text-white">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
                                Match
                              </p>
                              <p className="mt-0.5 text-xl font-bold">
                                {designer.percentage}%
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                            <div className={`rounded-xl px-3 py-2.5 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <p className="text-xs text-slate-500">Età</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {age !== null ? `${age} anni` : "Non disponibile"}
                              </p>
                            </div>

                            <div className={`rounded-xl px-3 py-2.5 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <p className="text-xs text-slate-500">Zona operativa</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {getDesignerZone(designer)}
                              </p>
                            </div>

                            <div className={`rounded-xl px-3 py-2.5 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <p className="text-xs text-slate-500">Titolo di studio</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {getDesignerStudyTitle(designer)}
                              </p>
                            </div>

                            <div className={`rounded-xl px-3 py-2.5 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <p className="text-xs text-slate-500">Esperienza</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {designer.experience || "Non specificata"}
                              </p>
                            </div>

                          </div>

                          <div className="space-y-4 border-t border-slate-100 p-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Software CAD
                              </p>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {cad.length > 0 ? (
                                  cad.map((software) => (
                                    <div
                                      key={`${software.name}-${software.rating}`}
                                      className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-emerald-950"
                                    >
                                      <p className="text-xs font-semibold">
                                        {software.name}
                                      </p>
                                      <p
                                        className="mt-0.5 whitespace-nowrap text-[11px] tracking-[0.08em] text-amber-500"
                                        aria-label={`${software.rating} stelle su 5`}
                                        title={`${software.rating}/5`}
                                      >
                                        {"★".repeat(software.rating)}
                                        <span className="text-slate-300">
                                          {"★".repeat(5 - software.rating)}
                                        </span>
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-sm text-slate-500">
                                    Non specificati
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Settori di esperienza
                              </p>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {sectors.length > 0 ? (
                                  sectors.map((sector) => (
                                    <span
                                      key={sector}
                                      className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                                    >
                                      {sector}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-slate-500">
                                    Non specificati
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                        </button>
                      );
                    })}
                  </div>

                  <div className="sticky bottom-4 z-20 rounded-3xl border border-emerald-900/10 bg-white/95 p-5 shadow-xl backdrop-blur">
                    {contactRequestSent ? (
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-950">
                          Richiesta inoltrata
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          La vostra selezione è stata inoltrata correttamente a QuickSolve.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {selectedDesignerCount} {selectedDesignerCount === 1 ? "profilo selezionato" : "profili selezionati"}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Selezionate i profili di vostro interesse e inoltrate la richiesta.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={sendContactRequest}
                          disabled={selectedDesignerCount === 0 || isSendingContactRequest}
                          className="rounded-2xl bg-emerald-950 px-6 py-3 font-semibold text-white transition enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isSendingContactRequest ? "Invio in corso..." : "Inoltra richiesta"}
                        </button>
                      </div>
                    )}

                    {contactRequestError && (
                      <p className="mt-3 text-center text-sm font-medium text-red-600">
                        {contactRequestError}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    Nessun progettista con compatibilità pari o superiore all'80%
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    La richiesta è stata registrata correttamente. Al momento non risultano
                    profili che superano la soglia minima prevista.
                  </p>
                </div>
              )}
            </section>
          )}

          {currentStep !== 5 && (
            <div
              className={`mt-10 border-t border-slate-200 pt-6 ${
                currentStep === 0
                  ? "flex justify-end"
                  : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              }`}
            >
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ← Indietro
                </button>
              )}

              <button
                type="button"
                onClick={currentStep === 4 ? submitCompanyRequest : nextStep}
                disabled={!canGoNext || isSubmitting}
                className="rounded-2xl bg-emerald-950 px-5 py-3 font-semibold text-white transition enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Avanti →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}