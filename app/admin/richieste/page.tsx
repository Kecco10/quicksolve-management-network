"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type CollaborationType = "Full time" | "Part-time" | "Freelancer";
type ExperienceLevel = "Junior" | "Middle" | "Senior" | "Resp. ufficio tecnico";
type CompanySize = "Micro impresa" | "Piccola impresa" | "Media impresa" | "Grande impresa";
type RatedCad = { nome: string; livello: number };

type CompanyRequest = {
  id: number;
  codice: string;
  azienda: string;
  referente: string;
  email: string;
  telefono: string;
  linkedin?: string;
  dataRichiesta: string;
  jobTitle: string;
  tipologia: CollaborationType;
  budgetRange: string;
  esperienza: ExperienceLevel;
  regione: string;
  provincia: string;
  isRemote?: boolean;
  zonaOperativa: string;
  settorePrincipale: string;
  altroSettore?: string;
  experienceSectors: string[];
  cadRichiesti: RatedCad[];
  altroCad?: RatedCad[];
  companySize: CompanySize;
  employeeRange: string;
  jobDescription: string;
  note?: string;
  archived?: boolean;
  completed?: boolean;
  completedAt?: string;
  purchasePdfUrl?: string;
  completedPurchaseId?: string;
  completedSelectedCount?: number;
  completedPlanId?: string;
};

type RawRequest = Record<string, unknown>;

const ALL_REGIONS_OPTION = "Tutte le regioni";
const cadOptions = ["SolidWorks", "Inventor", "PTC Creo", "CATIA", "AutoCAD", "Solid Edge", "Modeling", "NX", "Altro"];
const employeeRangeOptions = ["24.000 - 30.000 €", "30.000 - 40.000 €", "40.000 - 50.000 €", "50.000 - 60.000 €", "> 60.000 €"];
const freelanceRangeOptions = ["15 - 20 €/h", "20 - 30 €/h", "30 - 40 €/h", "40 - 50 €/h", "> 50 €/h"];

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

const regionOptions = [ALL_REGIONS_OPTION, ...Object.keys(regionProvinceMap)];

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["true", "1", "si", "sì", "yes"].includes(value.trim().toLowerCase());
  return false;
}

function getFirst(raw: RawRequest, keys: string[]) {
  for (const key of keys) if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  return undefined;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map(asString).filter(Boolean)
    : [];
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeRequestType(value: unknown): CollaborationType {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("freelance") || normalized.includes("partita iva")) return "Freelancer";
  if (normalized.includes("part-time") || normalized.includes("part time")) return "Part-time";
  return "Full time";
}

function normalizeRequestExperience(value: unknown): ExperienceLevel {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("responsabile ufficio tecnico") || normalized.includes("resp. ufficio tecnico")) return "Resp. ufficio tecnico";
  if (normalized.includes("senior")) return "Senior";
  if (normalized.includes("middle")) return "Middle";
  return "Junior";
}

function normalizeCompanySize(value: unknown): CompanySize {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("grande") || normalized.includes("250-999") || normalized.includes("oltre 1000")) return "Grande impresa";
  if (normalized.includes("media") || normalized.includes("50-249")) return "Media impresa";
  if (normalized.includes("piccola") || normalized.includes("1-9") || normalized.includes("10-49")) return "Piccola impresa";
  return "Piccola impresa";
}

function normalizeCadArray(value: unknown): RatedCad[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const nome = asString(source.nome ?? source.name ?? source.label ?? source.software ?? source.cad);
      const livelloRaw = source.livello ?? source.level ?? source.rating ?? source.valore ?? 5;
      const livello = typeof livelloRaw === "number" ? livelloRaw : Number(livelloRaw);
      if (!nome) return null;
      return { nome, livello: Number.isFinite(livello) ? livello : 5 };
    })
    .filter((item): item is RatedCad => Boolean(item));
}

function normalizeDate(value: unknown) {
  const stringValue = asString(value);
  if (!stringValue) return "Non indicata";
  const parsed = new Date(stringValue);
  if (Number.isNaN(parsed.getTime())) return stringValue;
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(parsed);
}

function normalizeBudgetLabel(value: unknown) {
  const normalized = asString(value);
  if (!normalized) return "";

  const aliases: Record<string, string> = {
    "60.000+ €": "> 60.000 €",
    "50+ €/h": "> 50 €/h",
  };

  return aliases[normalized] ?? normalized;
}



function mapRequestFromApi(raw: RawRequest): CompanyRequest {
  const employeeRange = asString(getFirst(raw, ["employeerange", "employeeRange", "employee_range"]));
  const regione = asString(getFirst(raw, ["regione", "selectedRegion", "selected_region"]));
  const provincia = asString(getFirst(raw, ["provincia", "selectedProvince", "selected_province"]));
  const isRemote = asBoolean(getFirst(raw, ["isremote", "isRemote", "is_remote"]));
  const explicitZona = asString(getFirst(raw, ["zonaoperativa", "zonaOperativa", "zona_operativa"]));
  const zonaOperativa = explicitZona || [provincia, isRemote ? "Remoto" : ""].filter(Boolean).join(" + ") || (isRemote ? "Remoto" : "");

  return {
    id: Number(getFirst(raw, ["id"]) ?? 0),
    codice: asString(getFirst(raw, ["codice"])) || "RQ-000",
    azienda: asString(getFirst(raw, ["azienda", "companyName", "company_name", "companyname"])),
    referente: asString(getFirst(raw, ["referente", "contactName", "contact_name", "contactname"])),
    email: asString(getFirst(raw, ["email", "contactEmail", "contact_email", "contactemail"])),
    telefono: asString(getFirst(raw, ["telefono", "contactPhone", "contact_phone", "contactphone"])),
    linkedin: asString(getFirst(raw, ["linkedin"])) || undefined,
    dataRichiesta: normalizeDate(getFirst(raw, ["datarichiesta", "dataRichiesta", "data_richiesta", "created_at"])),
    jobTitle: asString(getFirst(raw, ["jobtitle", "jobTitle", "job_title", "contactRole", "contact_role", "contactrole"])),
    tipologia: normalizeRequestType(getFirst(raw, ["tipologia", "employmentType", "employment_type", "employmenttype"])),
    budgetRange: normalizeBudgetLabel(getFirst(raw, ["budgetrange", "budgetRange", "budget_range", "employeeEconomicRange", "employee_economic_range", "employeeeconomicrange", "freelanceEconomicRange", "freelance_economic_range", "freelanceeconomicrange"])),
    esperienza: normalizeRequestExperience(getFirst(raw, ["esperienza", "experienceLevel", "experience_level", "experiencelevel"])),
    regione,
    provincia,
    isRemote,
    zonaOperativa,
    settorePrincipale: asString(getFirst(raw, ["settoreprincipale", "settorePrincipale", "settore_principale", "companySector", "company_sector", "companysector"])),
    altroSettore: asString(getFirst(raw, ["altrosettore", "altroSettore", "altro_settore"])) || undefined,
    experienceSectors: uniqueStrings(
      asStringArray(getFirst(raw, ["experience_sectors", "experienceSectors"]))
    ),
    cadRichiesti: normalizeCadArray(getFirst(raw, ["cadrichiesti", "cadRichiesti", "cad_richiesti"])),
    altroCad: normalizeCadArray(getFirst(raw, ["altrocad", "altroCad", "altro_cad"])) || undefined,
    companySize: normalizeCompanySize(getFirst(raw, ["companysize", "companySize", "company_size"])),
    employeeRange,
    jobDescription: asString(getFirst(raw, ["jobdescription", "jobDescription", "job_description"])),
    note: asString(getFirst(raw, ["note"])) || undefined,
    archived: asBoolean(getFirst(raw, ["archived"])),
    completed: asBoolean(getFirst(raw, ["completed"])),
    completedAt:
      asString(getFirst(raw, ["completed_at", "completedAt"])) || undefined,
    purchasePdfUrl:
      asString(getFirst(raw, ["purchase_pdf_url", "purchasePdfUrl"])) || undefined,
    completedPurchaseId:
      asString(
        getFirst(raw, ["completed_purchase_id", "completedPurchaseId"])
      ) || undefined,
    completedSelectedCount: Number(
      getFirst(raw, ["completed_selected_count", "completedSelectedCount"]) ?? 0
    ) || undefined,
    completedPlanId:
      asString(getFirst(raw, ["completed_plan_id", "completedPlanId"])) || undefined,
  };
}

function sortRequestsByCodeDesc(requests: CompanyRequest[]) {
  return [...requests].sort((a, b) => Number(String(b.codice).replace(/\D/g, "")) - Number(String(a.codice).replace(/\D/g, "")));
}

function useOutsideClick<T extends HTMLElement>(ref: React.RefObject<T | null>, handler: () => void) {
  useEffect(() => {
    function listener(event: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function CustomDropdown({
  label,
  placeholder,
  value,
  options,
  disabled,
  isOpen,
  setIsOpen,
  onSelect,
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  disabled?: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelect: (value: string) => void;
  className?: string;
}) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div className={`relative min-w-0 ${className ?? ""}`} ref={dropdownRef}>
      <label className="mb-1.5 block text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-left text-sm outline-none transition focus:border-teal-700 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
      >
        <span className={value ? "text-neutral-900" : "text-neutral-500"}>{value || placeholder}</span>
        <svg className={`ml-2 h-4 w-4 shrink-0 text-neutral-500 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-500">Nessuna opzione disponibile</div>
          ) : (
            options.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${value === option ? "bg-teal-50 font-semibold text-teal-900" : "text-neutral-700 hover:bg-neutral-50"}`}
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "primary" | "soft" }) {
  const classes = tone === "primary" ? "border border-teal-700 bg-teal-700 text-white" : tone === "soft" ? "border border-teal-200 bg-teal-50 text-teal-800" : "border border-neutral-200 bg-neutral-100 text-neutral-700";
  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium leading-none ${classes}`}>{children}</span>;
}

function FilterField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`min-w-0 ${className ?? ""}`}><label className="mb-1.5 block text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</label>{children}</div>;
}

function uniqueCadNames(items: RatedCad[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.nome.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getOperationalTags(request: CompanyRequest) {
  const tags: string[] = [];
  if (request.provincia?.trim()) tags.push(request.provincia);
  if (request.isRemote || request.zonaOperativa.toLowerCase().includes("remoto") || request.zonaOperativa.toLowerCase().includes("remote")) tags.push("Remoto");
  return tags;
}

function getSectorLabel(request: CompanyRequest) {
  return [request.settorePrincipale, request.altroSettore].filter((item): item is string => Boolean(item?.trim())).join(" • ");
}

function getCadLabel(request: CompanyRequest) {
  const combined = [...request.cadRichiesti, ...(request.altroCad ?? [])];
  return combined.length > 0 ? combined : [];
}

export default function AdminRichiestePage() {
  const [activeRequests, setActiveRequests] = useState<CompanyRequest[]>([]);
  const [archivedRequests, setArchivedRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedCad, setSelectedCad] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedActiveIds, setSelectedActiveIds] = useState<number[]>([]);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState<number[]>([]);
  const [activeRequest, setActiveRequest] = useState<CompanyRequest | null>(null);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/company-requests", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Errore nel caricamento delle richieste.");
        const mappedRequests: CompanyRequest[] = Array.isArray(data?.requests) ? (data.requests as RawRequest[]).map((item: RawRequest) => mapRequestFromApi(item)) : [];
        setActiveRequests(sortRequestsByCodeDesc(mappedRequests.filter((item: CompanyRequest) => !item.archived)));
        setArchivedRequests(sortRequestsByCodeDesc(mappedRequests.filter((item: CompanyRequest) => item.archived)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore nel caricamento delle richieste.");
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveRequest(null);
        setIsRegionOpen(false);
        setIsProvinceOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const budgetOptions = useMemo(() => [...employeeRangeOptions, ...freelanceRangeOptions], []);
  const availableProvinceOptions = useMemo(() => {
    if (!selectedRegion || selectedRegion === ALL_REGIONS_OPTION) return [];
    return regionProvinceMap[selectedRegion] ?? [];
  }, [selectedRegion]);

  const filteredActiveRequests = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return activeRequests.filter((request) => {
      const fullSearchString = [request.codice, request.azienda, request.referente].join(" ").toLowerCase();
      const allCad = [...request.cadRichiesti.map((item) => item.nome), ...(request.altroCad ?? []).map((item) => item.nome)];
      const matchSearch = !term || fullSearchString.includes(term);
      const matchType = !selectedType || request.tipologia === selectedType;
      const matchBudget = !selectedBudget || request.budgetRange === selectedBudget;
      const matchExperience = !selectedExperience || request.esperienza === selectedExperience;
      const matchCad = !selectedCad || (selectedCad === "Altro" ? (request.altroCad ?? []).length > 0 : allCad.includes(selectedCad));
      const matchRegion = !selectedRegion || selectedRegion === ALL_REGIONS_OPTION || request.regione === selectedRegion;
      const matchProvince = !selectedProvince || request.provincia === selectedProvince;
      return matchSearch && matchType && matchBudget && matchExperience && matchCad && matchRegion && matchProvince;
    });
  }, [activeRequests, searchValue, selectedType, selectedBudget, selectedExperience, selectedCad, selectedRegion, selectedProvince]);

  const filteredArchivedRequests = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return archivedRequests.filter((request) => {
      const fullSearchString = [request.codice, request.azienda, request.referente].join(" ").toLowerCase();
      const allCad = [...request.cadRichiesti.map((item) => item.nome), ...(request.altroCad ?? []).map((item) => item.nome)];
      const matchSearch = !term || fullSearchString.includes(term);
      const matchType = !selectedType || request.tipologia === selectedType;
      const matchBudget = !selectedBudget || request.budgetRange === selectedBudget;
      const matchExperience = !selectedExperience || request.esperienza === selectedExperience;
      const matchCad = !selectedCad || (selectedCad === "Altro" ? (request.altroCad ?? []).length > 0 : allCad.includes(selectedCad));
      const matchRegion = !selectedRegion || selectedRegion === ALL_REGIONS_OPTION || request.regione === selectedRegion;
      const matchProvince = !selectedProvince || request.provincia === selectedProvince;
      return matchSearch && matchType && matchBudget && matchExperience && matchCad && matchRegion && matchProvince;
    });
  }, [archivedRequests, searchValue, selectedType, selectedBudget, selectedExperience, selectedCad, selectedRegion, selectedProvince]);

  const toggleActiveSelection = (id: number) => setSelectedActiveIds((prev) => (prev.includes(id) ? prev.filter((currentId) => currentId !== id) : [...prev, id]));
  const toggleArchivedSelection = (id: number) => setSelectedArchivedIds((prev) => (prev.includes(id) ? prev.filter((currentId) => currentId !== id) : [...prev, id]));

  async function updateArchived(ids: number[], archived: boolean) {
    const response = await fetch("/api/company-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, archived }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || "Errore durante l'aggiornamento delle richieste.");
  }
  async function deleteRequests(ids: number[]) {
    const response = await fetch("/api/company-requests", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || "Errore durante l'eliminazione delle richieste.");
  }

  const handleDeleteSelectedActive = async () => { if (selectedActiveIds.length === 0) return window.alert("Seleziona almeno una richiesta da eliminare."); if (!window.confirm(`Confermi l'eliminazione di ${selectedActiveIds.length} richiesta/e?`)) return; try { setActionLoading(true); setError(""); await deleteRequests(selectedActiveIds); setActiveRequests((prev) => prev.filter((request) => !selectedActiveIds.includes(request.id))); setSelectedActiveIds([]); if (activeRequest && selectedActiveIds.includes(activeRequest.id)) setActiveRequest(null); } catch (err) { setError(err instanceof Error ? err.message : "Errore durante l'eliminazione delle richieste."); } finally { setActionLoading(false); } };
  const handleDeleteSelectedArchived = async () => { if (selectedArchivedIds.length === 0) return window.alert("Seleziona almeno una richiesta da eliminare."); if (!window.confirm(`Confermi l'eliminazione di ${selectedArchivedIds.length} richiesta/e?`)) return; try { setActionLoading(true); setError(""); await deleteRequests(selectedArchivedIds); setArchivedRequests((prev) => prev.filter((request) => !selectedArchivedIds.includes(request.id))); setSelectedArchivedIds([]); if (activeRequest && selectedArchivedIds.includes(activeRequest.id)) setActiveRequest(null); } catch (err) { setError(err instanceof Error ? err.message : "Errore durante l'eliminazione delle richieste."); } finally { setActionLoading(false); } };
  const handleArchiveSelected = async () => { if (selectedActiveIds.length === 0) return window.alert("Seleziona almeno una richiesta attiva da archiviare."); try { setActionLoading(true); setError(""); await updateArchived(selectedActiveIds, true); const toArchive = activeRequests.filter((request) => selectedActiveIds.includes(request.id)).map((request) => ({ ...request, archived: true })); setArchivedRequests((prev) => sortRequestsByCodeDesc([...prev, ...toArchive])); setActiveRequests((prev) => sortRequestsByCodeDesc(prev.filter((request) => !selectedActiveIds.includes(request.id)))); setSelectedActiveIds([]); if (activeRequest && selectedActiveIds.includes(activeRequest.id)) setActiveRequest(null); } catch (err) { setError(err instanceof Error ? err.message : "Errore durante l'aggiornamento delle richieste."); } finally { setActionLoading(false); } };
  const handleRestoreSelected = async () => { if (selectedArchivedIds.length === 0) return window.alert("Seleziona almeno una richiesta archiviata da spostare in attive."); try { setActionLoading(true); setError(""); await updateArchived(selectedArchivedIds, false); const toRestore = archivedRequests.filter((request) => selectedArchivedIds.includes(request.id)).map((request) => ({ ...request, archived: false })); setActiveRequests((prev) => sortRequestsByCodeDesc([...prev, ...toRestore])); setArchivedRequests((prev) => sortRequestsByCodeDesc(prev.filter((request) => !selectedArchivedIds.includes(request.id)))); setSelectedArchivedIds([]); if (activeRequest && selectedArchivedIds.includes(activeRequest.id)) setActiveRequest(null); } catch (err) { setError(err instanceof Error ? err.message : "Errore durante l'aggiornamento delle richieste."); } finally { setActionLoading(false); } };
  const resetFilters = () => { setSearchValue(""); setSelectedType(""); setSelectedBudget(""); setSelectedExperience(""); setSelectedCad(""); setSelectedRegion(""); setSelectedProvince(""); setIsRegionOpen(false); setIsProvinceOpen(false); };

  return (
    <section className="-mt-2 min-w-0 space-y-3 sm:-mt-4 sm:space-y-4 md:-mt-4">
      <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex justify-end border-b border-neutral-200 pb-3"><Badge tone="soft">Admin richieste aziende</Badge></div>
        <div className="flex flex-wrap items-end gap-2">
          <FilterField label="Cerca richiesta" className="w-full min-[1280px]:w-[220px]"><input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Azienda o RQ" className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-teal-700" /></FilterField>
          <FilterField label="Contratto" className="w-full min-[1280px]:w-[132px]"><select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-2.5 py-2.5 text-sm outline-none transition focus:border-teal-700"><option value="">Tutti</option><option value="Full time">Full time</option><option value="Part-time">Part-time</option><option value="Freelancer">Freelancer</option></select></FilterField>
          <FilterField label="Budget" className="w-full min-[1280px]:w-[170px]"><select value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-2.5 py-2.5 text-sm outline-none transition focus:border-teal-700"><option value="">Tutti</option>{budgetOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></FilterField>
          <FilterField label="Esperienza" className="w-full min-[1280px]:w-[170px]"><select value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-2.5 py-2.5 text-sm outline-none transition focus:border-teal-700"><option value="">Tutte</option><option value="Junior">Junior</option><option value="Middle">Middle</option><option value="Senior">Senior</option><option value="Resp. ufficio tecnico">Resp. ufficio tecnico</option></select></FilterField>
          <FilterField label="CAD" className="w-full min-[1280px]:w-[120px]"><select value={selectedCad} onChange={(e) => setSelectedCad(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-2.5 py-2.5 text-sm outline-none transition focus:border-teal-700"><option value="">Tutti</option>{cadOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></FilterField>
          <CustomDropdown label="Regioni" placeholder="Seleziona regione" value={selectedRegion} options={regionOptions} className="w-full min-[1280px]:w-[180px]" isOpen={isRegionOpen} setIsOpen={(open) => { setIsRegionOpen(open); if (open) setIsProvinceOpen(false); }} onSelect={(value) => { setSelectedRegion(value); setSelectedProvince(""); }} />
          <div className="w-full min-[1280px]:w-[180px]">{selectedRegion && selectedRegion !== ALL_REGIONS_OPTION ? <CustomDropdown label="Provincia" placeholder="Seleziona provincia" value={selectedProvince} options={availableProvinceOptions} className="w-full" isOpen={isProvinceOpen} setIsOpen={(open) => { setIsProvinceOpen(open); if (open) setIsRegionOpen(false); }} onSelect={(value) => setSelectedProvince(value)} /> : <div className="min-h-[74px]" />}</div>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><div className="text-sm text-neutral-500">{filteredActiveRequests.length} richieste attive trovate su {activeRequests.length} presenti</div><button onClick={resetFilters} className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100">Reset filtri</button></div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"><h2 className="text-lg font-semibold text-neutral-900">Lista richieste aziende</h2><div className="flex flex-wrap items-center gap-2"><button onClick={handleArchiveSelected} disabled={actionLoading} className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60">Archivia</button><button onClick={handleDeleteSelectedActive} disabled={actionLoading} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">Cancella</button></div></div>
          <div className="flex flex-wrap items-center gap-2"><button type="button" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Attive ({activeRequests.length})</button></div>
        </div>
        <div className="p-4">
          <div className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 lg:grid lg:grid-cols-[42px_1.1fr_0.9fr_1fr_1.05fr_1.15fr_1.05fr] lg:gap-3 lg:px-2 lg:pb-3"><div className="text-center">Sel.</div><div className="text-center">Richiesta</div><div className="text-center">Esperienza</div><div className="text-center">Contratto</div><div className="text-center">Zona operativa</div><div className="text-center">CAD richiesti</div><div className="text-center">Settori</div></div>
          <div className="space-y-3">
            {!loading && filteredActiveRequests.map((request) => {
              const cadCompleti = uniqueCadNames([...request.cadRichiesti, ...(request.altroCad ?? [])]);
              const settoriCompleti = uniqueStrings(request.experienceSectors);
              const operationalTags = getOperationalTags(request);
              return (
                <div key={request.id} role="button" tabIndex={0} onClick={() => setActiveRequest(request)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveRequest(request); } }} className={`cursor-pointer rounded-2xl border p-3 transition hover:shadow-sm sm:p-4 ${
                  request.completed
                    ? "border-emerald-300 bg-emerald-50 hover:border-emerald-400"
                    : "border-neutral-200 bg-white hover:border-teal-300"
                }`}>
                  <div className="grid gap-4 lg:grid-cols-[42px_1.1fr_0.9fr_1fr_1.05fr_1.15fr_1.05fr] lg:items-start">
                    <div className="pt-1 text-center" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedActiveIds.includes(request.id)} onChange={() => toggleActiveSelection(request.id)} className="h-4 w-4 rounded border-neutral-300 text-teal-700 focus:ring-teal-700" /></div>
                    <div className="text-center"><p className="text-base font-semibold text-neutral-900">{request.azienda || "Azienda non indicata"}</p><p className="mt-1 text-sm text-neutral-500">{request.codice}</p></div>
                    <div className="text-center"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">Esperienza</p><p className="text-sm text-neutral-700">{request.esperienza || "Non indicata"}</p></div>
                    <div className="text-center"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">Contratto</p><div className="flex flex-col items-center gap-2"><Badge tone={request.tipologia === "Freelancer" ? "primary" : "neutral"}>{request.tipologia}</Badge><p className="text-sm text-neutral-700">{request.budgetRange || "Budget non indicato"}</p></div></div>
                    <div className="text-center"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">Zona operativa</p><div className="flex flex-wrap justify-center gap-2">{operationalTags.length > 0 ? operationalTags.map((item) => <Badge key={`${request.id}-${item}`} tone="soft">{item}</Badge>) : <Badge tone="soft">Non indicata</Badge>}</div></div>
                    <div className="text-center"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">CAD richiesti</p><div className="flex flex-wrap justify-center gap-2">{cadCompleti.length > 0 ? cadCompleti.map((item) => <Badge key={item.nome} tone={(request.altroCad?.some((cad) => cad.nome === item.nome) ? "soft" : "neutral")}>{item.nome}</Badge>) : <Badge tone="soft">Nessun CAD richiesto</Badge>}</div></div>
                    <div className="text-center"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">Settori</p><div className="flex flex-wrap justify-center gap-2">{settoriCompleti.length > 0 ? settoriCompleti.map((item) => <Badge key={item} tone="soft">{item}</Badge>) : <Badge tone="soft">Nessun settore associato</Badge>}</div></div>
                  </div>
                </div>
              );
            })}
            {!loading && filteredActiveRequests.length === 0 ? <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">Nessuna richiesta trovata con i filtri selezionati.</div> : null}
            {loading ? <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">Caricamento richieste...</div> : null}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <button type="button" onClick={() => setIsArchiveOpen((prev) => !prev)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-neutral-50">
          <div><h3 className="text-base font-semibold text-neutral-900">Archivio</h3></div>
          <div className="flex items-center gap-3"><Badge tone="neutral">Archiviate {archivedRequests.length}</Badge><svg className={`h-4 w-4 text-neutral-500 transition-transform ${isArchiveOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        </button>

        {isArchiveOpen ? (
          <div className="border-t border-neutral-200">
            <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button onClick={handleRestoreSelected} disabled={actionLoading} className="rounded-2xl border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60">Sposta in attive</button>
                <button onClick={handleDeleteSelectedArchived} disabled={actionLoading} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">Cancella</button>
              </div>
            </div>

            <div className="p-4">
              <div className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 lg:grid lg:grid-cols-[42px_1.1fr_0.9fr_1fr_1.05fr_1.15fr_1.05fr] lg:gap-3 lg:px-2 lg:pb-3">
                <div className="text-center">Sel.</div>
                <div className="text-center">Richiesta</div>
                <div className="text-center">Esperienza</div>
                <div className="text-center">Contratto</div>
                <div className="text-center">Zona operativa</div>
                <div className="text-center">CAD richiesti</div>
                <div className="text-center">Settori</div>
              </div>

              <div className="space-y-3">
                {filteredArchivedRequests.map((request) => {
                  const cadCompleti = uniqueCadNames([...request.cadRichiesti, ...(request.altroCad ?? [])]);
                  const settoriCompleti = uniqueStrings(request.experienceSectors);
                  const operationalTags = getOperationalTags(request);

                  return (
                    <div key={request.id} role="button" tabIndex={0} onClick={() => setActiveRequest(request)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveRequest(request); } }} className={`cursor-pointer rounded-2xl border p-3 transition hover:shadow-sm sm:p-4 ${
                  request.completed
                    ? "border-emerald-300 bg-emerald-50 hover:border-emerald-400"
                    : "border-neutral-200 bg-white hover:border-teal-300"
                }`}>
                      <div className="grid gap-4 lg:grid-cols-[42px_1.1fr_0.9fr_1fr_1.05fr_1.15fr_1.05fr] lg:items-start">
                        <div className="pt-1 text-center" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedArchivedIds.includes(request.id)} onChange={() => toggleArchivedSelection(request.id)} className="h-4 w-4 rounded border-neutral-300 text-teal-700 focus:ring-teal-700" />
                        </div>
                        <div className="text-center">
                          <p className="text-base font-semibold text-neutral-900">{request.azienda || "Azienda non indicata"}</p>
                          <p className="mt-1 text-sm text-neutral-500">{request.codice}</p>
                        </div>
                        <div className="text-center"><p className="text-sm text-neutral-700">{request.esperienza || "Non indicata"}</p></div>
                        <div className="text-center"><div className="flex flex-col items-center gap-2"><Badge tone={request.tipologia === "Freelancer" ? "primary" : "neutral"}>{request.tipologia}</Badge><p className="text-sm text-neutral-700">{request.budgetRange || "Budget non indicato"}</p></div></div>
                        <div className="text-center"><div className="flex flex-wrap justify-center gap-2">{operationalTags.length > 0 ? operationalTags.map((item) => <Badge key={`${request.id}-${item}`} tone="soft">{item}</Badge>) : <Badge tone="soft">Non indicata</Badge>}</div></div>
                        <div className="text-center"><div className="flex flex-wrap justify-center gap-2">{cadCompleti.length > 0 ? cadCompleti.map((item) => <Badge key={item.nome} tone={(request.altroCad?.some((cad) => cad.nome === item.nome) ? "soft" : "neutral")}>{item.nome}</Badge>) : <Badge tone="soft">Nessun CAD richiesto</Badge>}</div></div>
                        <div className="text-center"><div className="flex flex-wrap justify-center gap-2">{settoriCompleti.length > 0 ? settoriCompleti.map((item) => <Badge key={item} tone="soft">{item}</Badge>) : <Badge tone="soft">Nessun settore associato</Badge>}</div></div>
                      </div>
                    </div>
                  );
                })}
                {filteredArchivedRequests.length === 0 ? <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">Nessuna richiesta archiviata trovata con i filtri selezionati.</div> : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {activeRequest ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-4" onClick={() => setActiveRequest(null)}>
          <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">{activeRequest.azienda || "Azienda non indicata"}</h3>
                <p className="mt-1 text-sm text-neutral-500">{activeRequest.codice}</p>
              </div>
              <button onClick={() => setActiveRequest(null)} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100">Chiudi</button>
            </div>

            {activeRequest.completed ? (
              <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
                {activeRequest.purchasePdfUrl ? (
                  <a
                    href={activeRequest.purchasePdfUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-emerald-900 underline decoration-emerald-400 underline-offset-4 hover:text-emerald-700"
                  >
                    Richiesta completata
                    <span aria-hidden="true">↓</span>
                  </a>
                ) : (
                  <p className="text-sm font-bold text-emerald-900">
                    Richiesta completata
                  </p>
                )}

                <p className="mt-1 text-xs text-emerald-800">
                  {activeRequest.completedSelectedCount
                    ? `${activeRequest.completedSelectedCount} profili acquistati`
                    : "Pagamento completato"}
                  {activeRequest.completedAt
                    ? ` • ${normalizeDate(activeRequest.completedAt)}`
                    : ""}
                </p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Referente</p><p className="mt-1 text-sm text-neutral-900">{activeRequest.referente || "Non indicato"}</p></div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ruolo referente</p><p className="mt-1 text-sm text-neutral-900">{activeRequest.jobTitle || "Non indicato"}</p></div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Email referente</p><p className="mt-1 text-sm text-neutral-900">{activeRequest.email || "Non indicata"}</p></div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Telefono referente</p><p className="mt-1 text-sm text-neutral-900">{activeRequest.telefono || "Non indicato"}</p></div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Dimensione azienda</p><p className="mt-1 text-sm text-neutral-900">{activeRequest.companySize || "Non indicata"}</p></div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Range dipendenti</p><p className="mt-1 text-sm text-neutral-900">{activeRequest.employeeRange || "Non indicato"}</p></div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Settore azienda</p><p className="mt-1 text-sm text-neutral-900">{getSectorLabel(activeRequest) || "Non indicato"}</p></div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Data richiesta</p><p className="mt-1 text-sm text-neutral-900">{activeRequest.dataRichiesta || "Non indicata"}</p></div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Descrizione job</p><div className="mt-1 max-h-[8.8rem] overflow-y-auto pr-2 text-sm leading-6 text-neutral-900">{activeRequest.jobDescription || "Nessuna descrizione disponibile nel CRM."}</div></div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}