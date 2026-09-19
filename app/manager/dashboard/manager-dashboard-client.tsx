"use client";

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SecondaryRole = {
  family: string;
  role: string;
};

type GeographicArea = {
  region: string;
  province: string;
};

type DbProfile = {
  id?: string;
  user_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  whatsapp_phone?: string | null;
  birth_date?: string | null;
  linkedin_url?: string | null;
  experience_band?: string | null;
  managerial_experience_band?: string | null;
  primary_role_family?: string | null;
  primary_role?: string | null;
  other_role?: string | null;
  secondary_roles?: SecondaryRole[] | null;
  competencies?: string[] | null;
  other_competency?: string | null;
  methodologies?: string[] | null;
  other_methodology?: string | null;
  company_revenue_band?: string | null;
  people_managed_band?: string | null;
  pnl_budget_band?: string | null;
  production_types?: string[] | null;
  sectors?: string[] | null;
  other_sector?: string | null;
  regions?: string[] | null;
  provinces?: string[] | null;
  geographic_areas?: GeographicArea[] | null;
  travel_available?: boolean | null;
  assignment_types?: string[] | null;
  days_per_week?: number | null;
  available_from?: string | null;
  vat_active?: boolean | null;
  professional_insurance?: boolean | null;
  insurance_limit?: string | null;
  certifications?: string | null;
  languages?: string | null;
  study_title?: string | null;
  daily_rate_band?: string | null;
  profile_status?: string | null;
  profile_visibility_enabled?: boolean | null;
};

type ManagerProfile = {
  firstName: string;
  lastName: string;
  email: string;
  whatsappPhone: string;
  birthDate: string;
  linkedinUrl: string;
  experienceBand: string;
  managerialExperienceBand: string;
  primaryRoleFamily: string;
  primaryRole: string;
  otherRole: string;
  secondaryRoles: SecondaryRole[];
  competencies: string[];
  otherCompetency: string;
  methodologies: string[];
  otherMethodology: string;
  companyRevenueBand: string;
  peopleManagedBand: string;
  pnlBudgetBand: string;
  productionTypes: string[];
  sectors: string[];
  otherSector: string;
  geographicAreas: GeographicArea[];
  travelAvailable: boolean;
  assignmentTypes: string[];
  daysPerWeek: number;
  availableFrom: string;
  vatActive: boolean;
  professionalInsurance: boolean;
  insuranceLimit: string;
  certifications: string;
  languages: string;
  studyTitle: string;
  dailyRateBand: string;
  profileStatus: string;
  isSearchActive: boolean;
};

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
  "AREA COMMERCIALE": ["Marketing", "Commerciale"],
  PROGETTI: ["Project Manager", "Program Manager", "PMO Manager"],
  "FUNZIONI DI SUPPORTO": [
    "CFO / Direttore Amministrativo",
    "Controller Industriale",
    "IT / Digital Manufacturing Manager",
    "HR Manager / Direttore del Personale",
    "Altro",
  ],
};

const experienceOptions = [
  { value: "less_than_6", label: "Meno di 6 anni" },
  { value: "6_10", label: "6–10 anni" },
  { value: "11_20", label: "11–20 anni" },
  { value: "over_20", label: "Oltre 20 anni" },
];

const managerialExperienceOptions = [
  { value: "less_than_3", label: "Meno di 3 anni" },
  { value: "3_10", label: "3–10 anni" },
  { value: "over_10", label: "Oltre 10 anni" },
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
  "Strategic sourcing e category management",
  "Negoziazione acquisti e gestione fornitori",
  "Marketing strategico e go-to-market",
  "Sviluppo commerciale e gestione rete vendita",
  "CRM, pipeline e sales management",
  "Altro",
];

const productionTypeOptions = ["ETO", "MTO", "ATO", "MTS", "Processo continuo"];

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
];

const assignmentTypeOptions = [
  "Temporary full time",
  "Fractional a giorni",
  "Progetto a termine",
  "Advisory",
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
  "Non applicabile / non gestito direttamente",
];

const dailyRateOptions = [
  "Fino a 400 € / giorno",
  "500 € / giorno",
  "600 € / giorno",
  "700 € / giorno",
  "800 € / giorno",
];

const studyTitleOptions = [
  "Diploma tecnico",
  "Laurea triennale",
  "Laurea magistrale / vecchio ordinamento",
  "Master / MBA",
  "Dottorato",
  "Altro",
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

function labelFor(
  value: string,
  options: Array<{ value: string; label: string }>
) {
  return options.find((item) => item.value === value)?.label || value || "-";
}

function mapDbToProfile(data: DbProfile | null, email: string): ManagerProfile {
  return {
    firstName: data?.first_name ?? "",
    lastName: data?.last_name ?? "",
    email: data?.email || email,
    whatsappPhone: data?.whatsapp_phone ?? "",
    birthDate: data?.birth_date ?? "",
    linkedinUrl: data?.linkedin_url ?? "",
    experienceBand: data?.experience_band ?? "",
    managerialExperienceBand: data?.managerial_experience_band ?? "",
    primaryRoleFamily: data?.primary_role_family ?? "",
    primaryRole: data?.primary_role ?? "",
    otherRole: data?.other_role ?? "",
    secondaryRoles: Array.isArray(data?.secondary_roles)
      ? data!.secondary_roles!.slice(0, 2)
      : [],
    competencies: Array.isArray(data?.competencies) ? data!.competencies! : [],
    otherCompetency: data?.other_competency ?? "",
    methodologies: Array.isArray(data?.methodologies) ? data!.methodologies! : [],
    otherMethodology: data?.other_methodology ?? "",
    companyRevenueBand: data?.company_revenue_band ?? "",
    peopleManagedBand: data?.people_managed_band ?? "",
    pnlBudgetBand: data?.pnl_budget_band ?? "",
    productionTypes: Array.isArray(data?.production_types)
      ? data!.production_types!
      : [],
    sectors: Array.isArray(data?.sectors) ? data!.sectors! : [],
    otherSector: data?.other_sector ?? "",
    geographicAreas: Array.isArray(data?.geographic_areas)
      ? data!.geographic_areas!
      : [],
    travelAvailable: data?.travel_available === true,
    assignmentTypes: Array.isArray(data?.assignment_types)
      ? data!.assignment_types!
      : [],
    daysPerWeek: Number(data?.days_per_week ?? 1),
    availableFrom: data?.available_from ?? "",
    vatActive: data?.vat_active === true,
    professionalInsurance: data?.professional_insurance === true,
    insuranceLimit: data?.insurance_limit ?? "",
    certifications: data?.certifications ?? "",
    languages: data?.languages ?? "",
    studyTitle: data?.study_title ?? "",
    dailyRateBand: data?.daily_rate_band ?? "",
    profileStatus: data?.profile_status ?? "registered",
    isSearchActive: data?.profile_visibility_enabled !== false,
  };
}

function profileToPayload(profile: ManagerProfile) {
  return {
    first_name: profile.firstName,
    last_name: profile.lastName,
    whatsapp_phone: profile.whatsappPhone,
    birth_date: profile.birthDate,
    linkedin_url: profile.linkedinUrl,
    experience_band: profile.experienceBand,
    managerial_experience_band: profile.managerialExperienceBand,
    primary_role_family: profile.primaryRoleFamily,
    primary_role: profile.primaryRole,
    other_role: profile.otherRole,
    secondary_roles: profile.secondaryRoles,
    competencies: profile.competencies,
    other_competency: profile.otherCompetency,
    methodologies: profile.methodologies,
    other_methodology: profile.otherMethodology,
    company_revenue_band: profile.companyRevenueBand,
    people_managed_band: profile.peopleManagedBand,
    pnl_budget_band: profile.pnlBudgetBand,
    production_types: profile.productionTypes,
    sectors: profile.sectors,
    other_sector: profile.otherSector,
    geographic_areas: profile.geographicAreas,
    travel_available: profile.travelAvailable,
    assignment_types: profile.assignmentTypes,
    days_per_week: profile.daysPerWeek,
    available_from: profile.availableFrom,
    vat_active: profile.vatActive,
    professional_insurance: profile.professionalInsurance,
    insurance_limit: profile.insuranceLimit,
    certifications: profile.certifications,
    languages: profile.languages,
    study_title: profile.studyTitle,
    daily_rate_band: profile.dailyRateBand,
  };
}

function formatItalianDate(value: string) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void
) {
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

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  sectionKey: string;
  editingSection: string | null;
  onEdit: (sectionKey: string) => void;
  onCancel: () => void;
  onSave: () => void;
  hideActions?: boolean;
  hideTitle?: boolean;
  className?: string;
};

function SectionCard({
  title,
  children,
  sectionKey,
  editingSection,
  onEdit,
  onCancel,
  onSave,
  hideActions = false,
  hideTitle = false,
  className = "",
}: SectionCardProps) {
  const isEditing = editingSection === sectionKey;

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm md:p-4 ${className}`}
    >
      {(!hideTitle || !hideActions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {!hideTitle ? (
            <h2 className="text-base font-bold text-slate-900 md:text-lg">
              {title}
            </h2>
          ) : (
            <div />
          )}

          {!hideActions && (
            <>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    className="rounded-xl bg-emerald-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900"
                  >
                    Salva
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onEdit(sectionKey)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Modifica
                </button>
              )}
            </>
          )}
        </div>
      )}

      {children}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
      {children}
    </span>
  );
}

function FieldCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value || "-"}</div>
    </div>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
        active
          ? "border-emerald-900 bg-emerald-50 text-emerald-950"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

export default function ManagerDashboardClient({
  userId,
  userEmail,
  initialData,
}: {
  userId: string;
  userEmail: string;
  initialData: DbProfile | null;
}) {
  void userId;

  const supabase = createClient();
  const initialProfile = mapDbToProfile(initialData, userEmail);

  const [profile, setProfile] = useState<ManagerProfile>(initialProfile);
  const [draft, setDraft] = useState<ManagerProfile>(initialProfile);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailabilitySaving, setIsAvailabilitySaving] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [searchAppearances, setSearchAppearances] = useState(0);
  const [companySelections, setCompanySelections] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const [areaRegion, setAreaRegion] = useState("");
  const [areaProvince, setAreaProvince] = useState("");

  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(accountMenuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardState() {
      try {
        setIsStatsLoading(true);
        const response = await fetch("/api/manager/dashboard", {
          method: "GET",
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Impossibile caricare la dashboard.");
        }

        if (cancelled) return;

        setSearchAppearances(Number(data.searchAppearances ?? 0));
        setCompanySelections(Number(data.companySelections ?? 0));

        const active = data.isSearchActive !== false;
        setProfile((prev) => ({ ...prev, isSearchActive: active }));
        setDraft((prev) => ({ ...prev, isSearchActive: active }));
      } catch (error) {
        if (!cancelled) {
          setFeedback(
            error instanceof Error
              ? error.message
              : "Impossibile caricare la dashboard."
          );
        }
      } finally {
        if (!cancelled) setIsStatsLoading(false);
      }
    }

    loadDashboardState();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateDraft<K extends keyof ManagerProfile>(
    key: K,
    value: ManagerProfile[K]
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(section: string) {
    setDraft(profile);
    setEditingSection(section);
    setFeedback("");
    setAreaRegion("");
    setAreaProvince("");
  }

  function cancelEdit() {
    setDraft(profile);
    setEditingSection(null);
    setFeedback("");
    setAreaRegion("");
    setAreaProvince("");
  }

  async function saveEdit() {
    try {
      setIsSaving(true);
      setFeedback("");

      const response = await fetch("/api/manager/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileToPayload(draft)),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Errore durante il salvataggio.");
      }

      const nextProfile = data.profile
        ? mapDbToProfile(data.profile, userEmail)
        : draft;

      setProfile(nextProfile);
      setDraft(nextProfile);
      setEditingSection(null);
      setFeedback("Profilo aggiornato con successo.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Errore durante il salvataggio."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function toggleArray(
    key:
      | "competencies"
      | "methodologies"
      | "productionTypes"
      | "sectors"
      | "assignmentTypes",
    value: string
  ) {
    setDraft((prev) => {
      const current = prev[key] as string[];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  }

  function updateSecondaryRole(index: number, field: keyof SecondaryRole, value: string) {
    setDraft((prev) => {
      const next = [...prev.secondaryRoles];
      while (next.length <= index) next.push({ family: "", role: "" });

      const updated = { ...next[index], [field]: value };
      if (field === "family") updated.role = "";
      next[index] = updated;

      return { ...prev, secondaryRoles: next.slice(0, 2) };
    });
  }

  function addGeographicArea() {
    if (!areaRegion || !areaProvince) return;

    setDraft((prev) => {
      const exists = prev.geographicAreas.some(
        (area) => area.region === areaRegion && area.province === areaProvince
      );

      if (exists) return prev;

      return {
        ...prev,
        geographicAreas: [
          ...prev.geographicAreas,
          { region: areaRegion, province: areaProvince },
        ],
      };
    });

    setAreaProvince("");
  }

  function removeGeographicArea(index: number) {
    setDraft((prev) => ({
      ...prev,
      geographicAreas: prev.geographicAreas.filter((_, i) => i !== index),
    }));
  }

  async function toggleSearchAvailability() {
    if (isAvailabilitySaving) return;

    const nextValue = !profile.isSearchActive;

    try {
      setIsAvailabilitySaving(true);
      setFeedback("");

      const response = await fetch("/api/manager/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSearchActive: nextValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Impossibile aggiornare la disponibilità."
        );
      }

      const confirmedValue = data.isSearchActive !== false;

      setProfile((prev) => ({ ...prev, isSearchActive: confirmedValue }));
      setDraft((prev) => ({ ...prev, isSearchActive: confirmedValue }));

      setFeedback(
        confirmedValue
          ? "Profilo attivo nelle ricerche aziendali."
          : "Profilo disattivato dalle ricerche aziendali."
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare la disponibilità."
      );
    } finally {
      setIsAvailabilitySaving(false);
    }
  }

  async function handleLogout() {
    setIsMenuOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/manager/login";
  }

  async function handleDeleteAccount() {
    setIsMenuOpen(false);

    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare definitivamente il tuo account QuickSolve Management Network? Il profilo non comparirà più nelle ricerche e non potrà essere recuperato."
    );

    if (!confirmed) return;

    try {
      setIsDeletingAccount(true);
      setFeedback("");

      const response = await fetch("/api/manager/dashboard", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Impossibile eliminare l'account.");
      }

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Impossibile eliminare l'account."
      );
      setIsDeletingAccount(false);
    }
  }

  const availableProvinces = areaRegion
    ? regionProvinceMap[areaRegion] ?? []
    : [];

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-4 md:px-4 md:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-3">
            <SectionCard
              title=""
              sectionKey="profile-summary"
              editingSection={editingSection}
              onEdit={startEdit}
              onCancel={cancelEdit}
              onSave={saveEdit}
              className="h-fit"
              hideActions
              hideTitle
            >
              <div className="relative space-y-3">
                <div ref={accountMenuRef} className="absolute right-0 top-0 z-30">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                    aria-label="Apri menu account"
                    aria-expanded={isMenuOpen}
                  >
                    <span className="flex flex-col gap-[3px]" aria-hidden="true">
                      <span className="block h-[2px] w-4 rounded bg-current" />
                      <span className="block h-[2px] w-4 rounded bg-current" />
                      <span className="block h-[2px] w-4 rounded bg-current" />
                    </span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Log-out
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeletingAccount ? "Eliminazione..." : "Elimina account"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="pr-12">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Dashboard manager
                  </p>
                  <h1 className="mt-2 text-lg font-bold leading-tight text-slate-900">
                    {profile.firstName} {profile.lastName}
                  </h1>
                </div>

                <FieldCard
                  label="Data di nascita"
                  value={formatItalianDate(profile.birthDate)}
                />

                {feedback ? (
                  <p
                    className={`text-xs font-medium ${
                      feedback.includes("Errore") ||
                      feedback.includes("Impossibile")
                        ? "text-rose-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {feedback}
                  </p>
                ) : null}

                {isSaving ? (
                  <p className="text-xs text-slate-500">Salvataggio in corso...</p>
                ) : null}
              </div>
            </SectionCard>

            <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm md:p-4">
              <h2 className="text-base font-bold text-slate-900 md:text-lg">
                Statistiche
              </h2>

              <div className="mt-3 space-y-2.5">
                <FieldCard
                  label="Visualizzazioni aziende"
                  value={isStatsLoading ? "…" : searchAppearances}
                />
                <FieldCard
                  label="Selezionato dalle aziende"
                  value={isStatsLoading ? "…" : companySelections}
                />

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Disponibilità nelle ricerche
                      </p>
                      <p
                        className={`mt-1 text-sm font-bold ${
                          profile.isSearchActive
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {profile.isSearchActive ? "Attivo" : "Non attivo"}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={profile.isSearchActive}
                      disabled={isAvailabilitySaving}
                      onClick={toggleSearchAvailability}
                      className={`relative h-7 w-14 shrink-0 rounded-full transition ${
                        profile.isSearchActive ? "bg-emerald-600" : "bg-rose-600"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                          profile.isSearchActive ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] leading-4 text-slate-500">
                    Se ti disattivi, il tuo profilo viene escluso dalle nuove
                    ricerche aziendali.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-3">
            <SectionCard
              title="Contatti"
              sectionKey="contacts"
              editingSection={editingSection}
              onEdit={startEdit}
              onCancel={cancelEdit}
              onSave={saveEdit}
              className="py-3"
            >
              {editingSection === "contacts" ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Numero di telefono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={draft.whatsappPhone}
                      onChange={(e) =>
                        updateDraft("whatsappPhone", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={draft.email}
                      disabled
                      className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={draft.linkedinUrl}
                      onChange={(e) => updateDraft("linkedinUrl", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-2.5 md:grid-cols-3">
                  <FieldCard label="WhatsApp" value={profile.whatsappPhone} />
                  <FieldCard label="Email" value={profile.email} />
                  <FieldCard label="LinkedIn" value={profile.linkedinUrl} />
                </div>
              )}
            </SectionCard>

            <div className="grid items-start gap-3 lg:grid-cols-2">
              <div className="space-y-3">
                <SectionCard
                                title="Esperienza"
                                sectionKey="experience"
                                editingSection={editingSection}
                                onEdit={startEdit}
                                onCancel={cancelEdit}
                                onSave={saveEdit}
                              >
                                {editingSection === "experience" ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Esperienza professionale totale
                                      </label>
                                      <select
                                        value={draft.experienceBand}
                                        onChange={(e) =>
                                          updateDraft("experienceBand", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                      >
                                        {experienceOptions.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Esperienza in ruoli manageriali
                                      </label>
                                      <select
                                        value={draft.managerialExperienceBand}
                                        onChange={(e) =>
                                          updateDraft("managerialExperienceBand", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                      >
                                        {managerialExperienceOptions.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid gap-3">
                                    <FieldCard
                                      label="Esperienza professionale"
                                      value={labelFor(profile.experienceBand, experienceOptions)}
                                    />
                                    <FieldCard
                                      label="Esperienza manageriale"
                                      value={labelFor(
                                        profile.managerialExperienceBand,
                                        managerialExperienceOptions
                                      )}
                                    />
                                  </div>
                                )}
                              </SectionCard>

                <SectionCard
                                title="Tariffa giornaliera"
                                sectionKey="daily-rate"
                                editingSection={editingSection}
                                onEdit={startEdit}
                                onCancel={cancelEdit}
                                onSave={saveEdit}
                              >
                                {editingSection === "daily-rate" ? (
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                      Fascia di tariffa giornaliera
                                    </label>
                                    <select
                                      value={draft.dailyRateBand}
                                      onChange={(e) =>
                                        updateDraft("dailyRateBand", e.target.value)
                                      }
                                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                    >
                                      {dailyRateOptions.map((option) => (
                                        <option key={option}>{option}</option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <FieldCard
                                    label="Fascia"
                                    value={profile.dailyRateBand}
                                  />
                                )}
                              </SectionCard>

                <SectionCard
                              title="Ruoli"
                              sectionKey="roles"
                              editingSection={editingSection}
                              onEdit={startEdit}
                              onCancel={cancelEdit}
                              onSave={saveEdit}
                            >
                              {editingSection === "roles" ? (
                                <div className="space-y-4">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Famiglia ruolo principale
                                      </label>
                                      <select
                                        value={draft.primaryRoleFamily}
                                        onChange={(e) => {
                                          updateDraft("primaryRoleFamily", e.target.value);
                                          updateDraft("primaryRole", "");
                                        }}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                      >
                                        <option value="">Seleziona</option>
                                        {Object.keys(roleFamilies).map((family) => (
                                          <option key={family}>{family}</option>
                                        ))}
                                      </select>
                                    </div>
                
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Ruolo principale
                                      </label>
                                      <select
                                        value={draft.primaryRole}
                                        onChange={(e) =>
                                          updateDraft("primaryRole", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                      >
                                        <option value="">Seleziona</option>
                                        {(roleFamilies[draft.primaryRoleFamily] ?? []).map(
                                          (role) => (
                                            <option key={role}>{role}</option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                  </div>
                
                                  {draft.primaryRole === "Altro" && (
                                    <input
                                      value={draft.otherRole}
                                      onChange={(e) => updateDraft("otherRole", e.target.value)}
                                      placeholder="Specifica il ruolo"
                                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                    />
                                  )}
                
                                  {[0, 1].map((index) => {
                                    const item = draft.secondaryRoles[index] ?? {
                                      family: "",
                                      role: "",
                                    };
                
                                    return (
                                      <div
                                        key={index}
                                        className="grid gap-3 rounded-xl bg-slate-50 p-3 md:grid-cols-2"
                                      >
                                        <div>
                                          <label className="mb-1 block text-sm font-medium text-slate-700">
                                            Ruolo secondario {index + 1} (facoltativo)
                                          </label>
                                          <select
                                            value={item.family}
                                            onChange={(e) =>
                                              updateSecondaryRole(index, "family", e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                          >
                                            <option value="">Nessuno</option>
                                            {Object.keys(roleFamilies).map((family) => (
                                              <option key={family}>{family}</option>
                                            ))}
                                          </select>
                                        </div>
                
                                        <div>
                                          <label className="mb-1 block text-sm font-medium text-slate-700">
                                            Ruolo
                                          </label>
                                          <select
                                            value={item.role}
                                            disabled={!item.family}
                                            onChange={(e) =>
                                              updateSecondaryRole(index, "role", e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100"
                                          >
                                            <option value="">Nessuno</option>
                                            {(roleFamilies[item.family] ?? []).map((role) => (
                                              <option key={role}>{role}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <FieldCard
                                    label="Ruolo principale"
                                    value={
                                      profile.primaryRole === "Altro"
                                        ? profile.otherRole || "Altro"
                                        : profile.primaryRole
                                    }
                                  />
                
                                  {profile.secondaryRoles.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {profile.secondaryRoles.map((item, index) => (
                                        <Chip key={`${item.family}-${item.role}-${index}`}>
                                          {item.role}
                                        </Chip>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </SectionCard>

                <SectionCard
                              title="Metodologie e strumenti"
                              sectionKey="methodologies"
                              editingSection={editingSection}
                              onEdit={startEdit}
                              onCancel={cancelEdit}
                              onSave={saveEdit}
                            >
                              {editingSection === "methodologies" ? (
                                <div className="space-y-3">
                                  <div className="grid gap-2 md:grid-cols-2">
                                    {methodologyOptions.map((option) => (
                                      <ToggleButton
                                        key={option}
                                        active={draft.methodologies.includes(option)}
                                        label={option}
                                        onClick={() => toggleArray("methodologies", option)}
                                      />
                                    ))}
                                  </div>
                
                                  {draft.methodologies.includes("Altro") && (
                                    <input
                                      value={draft.otherMethodology}
                                      onChange={(e) =>
                                        updateDraft("otherMethodology", e.target.value)
                                      }
                                      placeholder="Specifica altra metodologia"
                                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {profile.methodologies
                                    .filter((item) => item !== "Altro")
                                    .map((item) => (
                                      <Chip key={item}>{item}</Chip>
                                    ))}
                                  {profile.otherMethodology && (
                                    <Chip>{profile.otherMethodology}</Chip>
                                  )}
                                </div>
                              )}
                            </SectionCard>

                <SectionCard
                              title="Zone operative"
                              sectionKey="areas"
                              editingSection={editingSection}
                              onEdit={startEdit}
                              onCancel={cancelEdit}
                              onSave={saveEdit}
                            >
                              {editingSection === "areas" ? (
                                <div className="space-y-3">
                                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                    <select
                                      value={areaRegion}
                                      onChange={(e) => {
                                        setAreaRegion(e.target.value);
                                        setAreaProvince("");
                                      }}
                                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                                    >
                                      <option value="">Regione</option>
                                      {Object.keys(regionProvinceMap).map((region) => (
                                        <option key={region}>{region}</option>
                                      ))}
                                    </select>
                
                                    <select
                                      value={areaProvince}
                                      disabled={!areaRegion}
                                      onChange={(e) => setAreaProvince(e.target.value)}
                                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100"
                                    >
                                      <option value="">Provincia</option>
                                      {availableProvinces.map((province) => (
                                        <option key={province}>{province}</option>
                                      ))}
                                    </select>
                
                                    <button
                                      type="button"
                                      onClick={addGeographicArea}
                                      className="rounded-xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white"
                                    >
                                      Aggiungi
                                    </button>
                                  </div>
                
                                  <div className="flex flex-wrap gap-2">
                                    {draft.geographicAreas.map((area, index) => (
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
                
                                  <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                                    <input
                                      type="checkbox"
                                      checked={draft.travelAvailable}
                                      onChange={(e) =>
                                        updateDraft("travelAvailable", e.target.checked)
                                      }
                                    />
                                    Disponibile a trasferte
                                  </label>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {profile.geographicAreas.map((area, index) => (
                                    <Chip key={`${area.region}-${area.province}-${index}`}>
                                      {area.province}
                                    </Chip>
                                  ))}
                                  {profile.travelAvailable && <Chip>Disponibile a trasferte</Chip>}
                                </div>
                              )}
                            </SectionCard>
              </div>

              <div className="space-y-3">
                <SectionCard
                                title="Seniority"
                                sectionKey="seniority"
                                editingSection={editingSection}
                                onEdit={startEdit}
                                onCancel={cancelEdit}
                                onSave={saveEdit}
                              >
                                {editingSection === "seniority" ? (
                                  <div className="space-y-3">
                                    <select
                                      value={draft.companyRevenueBand}
                                      onChange={(e) =>
                                        updateDraft("companyRevenueBand", e.target.value)
                                      }
                                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                    >
                                      {revenueBandOptions.map((option) => (
                                        <option key={option}>{option}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={draft.peopleManagedBand}
                                      onChange={(e) =>
                                        updateDraft("peopleManagedBand", e.target.value)
                                      }
                                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                    >
                                      {peopleManagedOptions.map((option) => (
                                        <option key={option}>{option}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={draft.pnlBudgetBand}
                                      onChange={(e) =>
                                        updateDraft("pnlBudgetBand", e.target.value)
                                      }
                                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                    >
                                      {pnlBandOptions.map((option) => (
                                        <option key={option}>{option}</option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <div className="grid gap-3">
                                    <FieldCard
                                      label="Fatturato aziende"
                                      value={profile.companyRevenueBand}
                                    />
                                    <FieldCard
                                      label="Persone coordinate"
                                      value={profile.peopleManagedBand}
                                    />
                                    <FieldCard
                                      label="Budget / P&L gestito"
                                      value={profile.pnlBudgetBand}
                                    />
                                  </div>
                                )}
                              </SectionCard>


                <SectionCard
                                title="Contesto produttivo"
                                sectionKey="production"
                                editingSection={editingSection}
                                onEdit={startEdit}
                                onCancel={cancelEdit}
                                onSave={saveEdit}
                              >
                                {editingSection === "production" ? (
                                  <div className="grid gap-2">
                                    {productionTypeOptions.map((option) => (
                                      <ToggleButton
                                        key={option}
                                        active={draft.productionTypes.includes(option)}
                                        label={option}
                                        onClick={() => toggleArray("productionTypes", option)}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {profile.productionTypes.map((item) => (
                                      <Chip key={item}>{item}</Chip>
                                    ))}
                                  </div>
                                )}
                              </SectionCard>

                <SectionCard
                                title="Settori industriali"
                                sectionKey="sectors"
                                editingSection={editingSection}
                                onEdit={startEdit}
                                onCancel={cancelEdit}
                                onSave={saveEdit}
                              >
                                {editingSection === "sectors" ? (
                                  <div className="space-y-3">
                                    <div className="grid gap-2">
                                      {sectorOptions.map((option) => (
                                        <ToggleButton
                                          key={option}
                                          active={draft.sectors.includes(option)}
                                          label={option}
                                          onClick={() => toggleArray("sectors", option)}
                                        />
                                      ))}
                                    </div>
                
                                    <input
                                      value={draft.otherSector}
                                      onChange={(e) =>
                                        updateDraft("otherSector", e.target.value)
                                      }
                                      placeholder="Altro settore (facoltativo)"
                                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {profile.sectors.map((item) => (
                                      <Chip key={item}>{item}</Chip>
                                    ))}
                                    {profile.otherSector && <Chip>{profile.otherSector}</Chip>}
                                  </div>
                                )}
                              </SectionCard>

                <SectionCard
                              title="Disponibilità"
                              sectionKey="availability"
                              editingSection={editingSection}
                              onEdit={startEdit}
                              onCancel={cancelEdit}
                              onSave={saveEdit}
                            >
                              {editingSection === "availability" ? (
                                <div className="space-y-3">
                                  <div className="grid gap-2 md:grid-cols-2">
                                    {assignmentTypeOptions.map((option) => (
                                      <ToggleButton
                                        key={option}
                                        active={draft.assignmentTypes.includes(option)}
                                        label={option}
                                        onClick={() => toggleArray("assignmentTypes", option)}
                                      />
                                    ))}
                                  </div>
                
                                  <div className="grid gap-3 md:grid-cols-[110px_minmax(0,1fr)]">
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Giorni / settimana
                                      </label>
                                      <select
                                        value={draft.daysPerWeek}
                                        onChange={(e) =>
                                          updateDraft("daysPerWeek", Number(e.target.value))
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                      >
                                        {[1, 2, 3, 4, 5].map((day) => (
                                          <option key={day}>{day}</option>
                                        ))}
                                      </select>
                                    </div>
                
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Prima disponibilità
                                      </label>
                                      <input
                                        type="date"
                                        value={draft.availableFrom}
                                        onChange={(e) =>
                                          updateDraft("availableFrom", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                      />
                                    </div>
                
                
                                  </div>
                                </div>
                              ) : (
                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_110px]">
                                  <FieldCard
                                    label="Tipo incarico"
                                    value={profile.assignmentTypes.join(", ")}
                                  />
                                  <FieldCard
                                    label="Giorni / settimana"
                                    value={String(profile.daysPerWeek)}
                                  />
                                  <FieldCard
                                    label="Prima disponibilità"
                                    value={formatItalianDate(profile.availableFrom)}
                                  />
                                </div>
                              )}
                            </SectionCard>

                <SectionCard
                              title="Qualifiche"
                              sectionKey="qualifications"
                              editingSection={editingSection}
                              onEdit={startEdit}
                              onCancel={cancelEdit}
                              onSave={saveEdit}
                            >
                              {editingSection === "qualifications" ? (
                                <div className="space-y-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                                      <input type="checkbox" checked={draft.vatActive} disabled />
                                      P.IVA attiva
                                    </label>
                
                                    <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                                      <input
                                        type="checkbox"
                                        checked={draft.professionalInsurance}
                                        onChange={(e) =>
                                          updateDraft(
                                            "professionalInsurance",
                                            e.target.checked
                                          )
                                        }
                                      />
                                      RC professionale
                                    </label>
                                  </div>
                
                                  {draft.professionalInsurance && (
                                    <input
                                      value={draft.insuranceLimit}
                                      onChange={(e) =>
                                        updateDraft("insuranceLimit", e.target.value)
                                      }
                                      placeholder="Massimale RC"
                                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                    />
                                  )}
                
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Titolo di studio
                                      </label>
                                      <select
                                        value={draft.studyTitle}
                                        onChange={(e) =>
                                          updateDraft("studyTitle", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                      >
                                        {studyTitleOptions.map((option) => (
                                          <option key={option}>{option}</option>
                                        ))}
                                      </select>
                                    </div>
                
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Lingue e livello
                                      </label>
                                      <input
                                        value={draft.languages}
                                        onChange={(e) =>
                                          updateDraft("languages", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                      />
                                    </div>
                                  </div>
                
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                      Certificazioni
                                    </label>
                                    <textarea
                                      value={draft.certifications}
                                      onChange={(e) =>
                                        updateDraft("certifications", e.target.value)
                                      }
                                      rows={3}
                                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                  <FieldCard
                                    label="P.IVA"
                                    value={profile.vatActive ? "Attiva" : "Non attiva"}
                                  />
                                  <FieldCard
                                    label="RC professionale"
                                    value={
                                      profile.professionalInsurance
                                        ? profile.insuranceLimit
                                          ? `Sì · ${profile.insuranceLimit}`
                                          : "Sì"
                                        : "No"
                                    }
                                  />
                                  <FieldCard label="Titolo di studio" value={profile.studyTitle} />
                                  <FieldCard label="Lingue" value={profile.languages} />
                                  <div className="md:col-span-2">
                                    <FieldCard
                                      label="Certificazioni"
                                      value={profile.certifications}
                                    />
                                  </div>
                                </div>
                              )}
                            </SectionCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
