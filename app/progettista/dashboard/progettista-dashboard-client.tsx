"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type StudyTitle =
  | "Diploma di maturità"
  | "Laurea Triennale"
  | "Laurea Magistrale"
  | "Altro"
  | "";

type ExperienceLevel =
  | "0-2 anni"
  | "3-5 anni"
  | "6-10 anni"
  | "10+ anni"
  | "";

type CollaborationType =
  | "Dipendente full time"
  | "Dipendente part-time"
  | "Freelancer partita IVA"
  | "";

type CadSkill = {
  name: string;
  rating: number;
};

type CustomCadSkill = {
  id: string;
  name: string;
  rating: number;
};

type SelectedProvinceItem = {
  id: string;
  region: string;
  province: string;
};

type ProgettistaProfile = {
  firstName: string;
  lastName: string;
  birthDate: string;
  studyTitle: StudyTitle;
  studyTitleOther: string;
  experience: ExperienceLevel;
  cadSkills: CadSkill[];
  customCadSkills: CustomCadSkill[];
  sectors: string[];
  sectorOther: string;
  isAllItaly: boolean;
  isRemote: boolean;
  selectedRegion: string;
  selectedProvinceEntries: SelectedProvinceItem[];
  collaborationType: CollaborationType;
  budgetRange: string;
  whatsapp: string;
  email: string;
  linkedin: string;
  profileStatus: string;
  isSearchActive: boolean;
};

type DbProfile = {
  first_name: string;
  last_name: string;
  birth_date: string | null;
  study_title: string;
  study_title_other: string;
  experience: string;
  cad_skills: CadSkill[] | null;
  custom_cad_skills: CustomCadSkill[] | null;
  sectors: string[] | null;
  sector_other: string;
  is_all_italy: boolean;
  is_remote: boolean;
  selected_region: string;
  selected_province_entries: Array<SelectedProvinceItem | string> | null;
  // Legacy field used by older registrations, if still present in old rows.
  selected_provinces?: string[] | null;
  collaboration_type: string;
  budget_range: string;
  whatsapp: string;
  email: string;
  linkedin: string;
  profile_status: string;
  is_search_active?: boolean | null;
};

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
  "60.000+ €",
];

const freelanceRangeOptions = [
  "15 - 20 €/h",
  "20 - 30 €/h",
  "30 - 40 €/h",
  "40 - 50 €/h",
  "50+ €/h",
];

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

const regionOptions = Object.keys(regionProvinceMap);

function createCustomCadSkill(): CustomCadSkill {
  return {
    id: `cad-custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    rating: 0,
  };
}

function createProvinceEntry(region: string, province: string): SelectedProvinceItem {
  return {
    id: `province-${region}-${province}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    region,
    province,
  };
}

function createStableProvinceEntry(
  region: string,
  province: string
): SelectedProvinceItem {
  const safeId = `province-${region}-${province}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: safeId || `province-${Date.now()}`,
    region,
    province,
  };
}

function normalizeProvinceEntries(
  value: unknown,
  fallbackRegion: string,
  legacyProvinces?: unknown
): SelectedProvinceItem[] {
  const source =
    Array.isArray(value) && value.length > 0
      ? value
      : Array.isArray(legacyProvinces)
      ? legacyProvinces
      : [];

  const normalized = source
    .map((item): SelectedProvinceItem | null => {
      if (typeof item === "string") {
        const province = item.trim();
        if (!province) return null;
        return createStableProvinceEntry(fallbackRegion, province);
      }

      if (!item || typeof item !== "object") return null;

      const raw = item as Record<string, unknown>;
      const province =
        typeof raw.province === "string" ? raw.province.trim() : "";
      const region =
        typeof raw.region === "string" && raw.region.trim()
          ? raw.region.trim()
          : fallbackRegion;

      if (!province) return null;

      const id =
        typeof raw.id === "string" && raw.id.trim()
          ? raw.id.trim()
          : createStableProvinceEntry(region, province).id;

      return { id, region, province };
    })
    .filter((item): item is SelectedProvinceItem => Boolean(item));

  const seen = new Set<string>();
  return normalized.filter((item) => {
    const key = `${item.region.toLowerCase()}::${item.province.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createEmptyProfile(email: string): ProgettistaProfile {
  return {
    firstName: "",
    lastName: "",
    birthDate: "",
    studyTitle: "",
    studyTitleOther: "",
    experience: "",
    cadSkills: cadOptions.map((name) => ({ name, rating: 0 })),
    customCadSkills: [createCustomCadSkill()],
    sectors: [],
    sectorOther: "",
    isAllItaly: false,
    isRemote: false,
    selectedRegion: "",
    selectedProvinceEntries: [],
    collaborationType: "",
    budgetRange: "",
    whatsapp: "",
    email,
    linkedin: "",
    profileStatus: "In compilazione",
    isSearchActive: true,
  };
}

function mapDbToProfile(data: DbProfile | null, email: string): ProgettistaProfile {
  if (!data) return createEmptyProfile(email);

  return {
    firstName: data.first_name ?? "",
    lastName: data.last_name ?? "",
    birthDate: data.birth_date ?? "",
    studyTitle: (data.study_title as StudyTitle) || "",
    studyTitleOther: data.study_title_other ?? "",
    experience: (data.experience as ExperienceLevel) || "",
    cadSkills: (() => {
      const savedCadSkills = Array.isArray(data.cad_skills) ? data.cad_skills : [];

      /*
       * Mostra sempre in dashboard tutti i software CAD presenti
       * nell'elenco di registrazione, mantenendo il rating già salvato.
       * In questo modo il progettista può aggiungere in seguito un software
       * che ha imparato a utilizzare senza doverlo inserire come "Altro".
       */
      return cadOptions.map((name) => {
        const savedSkill = savedCadSkills.find((skill) => skill.name === name);

        return {
          name,
          rating: savedSkill?.rating ?? 0,
        };
      });
    })(),
    customCadSkills:
      Array.isArray(data.custom_cad_skills) && data.custom_cad_skills.length > 0
        ? data.custom_cad_skills
        : [createCustomCadSkill()],
    sectors: Array.isArray(data.sectors) ? data.sectors : [],
    sectorOther: data.sector_other ?? "",
    isAllItaly: Boolean(data.is_all_italy),
    isRemote: Boolean(data.is_remote),
    selectedRegion: data.selected_region ?? "",
    selectedProvinceEntries: normalizeProvinceEntries(
      data.selected_province_entries,
      data.selected_region ?? "",
      data.selected_provinces
    ),
    collaborationType: (data.collaboration_type as CollaborationType) || "",
    budgetRange: data.budget_range ?? "",
    whatsapp: data.whatsapp ?? "",
    email: data.email || email,
    linkedin: data.linkedin ?? "",
    profileStatus: data.profile_status ?? "In compilazione",
    isSearchActive: data.is_search_active !== false,
  };
}

function mapProfileToDb(profile: ProgettistaProfile, userId: string) {
  const normalizedProvinceEntries = profile.isAllItaly
    ? []
    : normalizeProvinceEntries(
        profile.selectedProvinceEntries,
        profile.selectedRegion
      );

  return {
    user_id: userId,
    first_name: profile.firstName,
    last_name: profile.lastName,
    birth_date: profile.birthDate || null,
    study_title: profile.studyTitle || null,
    study_title_other: profile.studyTitleOther,
    experience: profile.experience || null,
    cad_skills: profile.cadSkills,
    custom_cad_skills: profile.customCadSkills.filter((item) => item.name.trim()),
    sectors: profile.sectors,
    sector_other: profile.sectorOther,
    is_all_italy: profile.isAllItaly,
    is_remote: profile.isRemote,
    selected_region: profile.isAllItaly ? "" : profile.selectedRegion,
    selected_province_entries: normalizedProvinceEntries,
    collaboration_type: profile.collaborationType || null,
    budget_range: profile.budgetRange,
    whatsapp: profile.whatsapp,
    email: profile.email,
    linkedin: profile.linkedin,
    profile_status: profile.profileStatus,
  };
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
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
}

type CustomDropdownProps = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  disabled?: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelect: (value: string) => void;
};

function CustomDropdown({
  label,
  placeholder,
  value,
  options,
  disabled,
  isOpen,
  setIsOpen,
  onSelect,
}: CustomDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>

      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <span className={value ? "text-slate-900" : "text-slate-500"}>
          {value || placeholder}
        </span>
        <span className="text-slate-500">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">Nessuna opzione disponibile</div>
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
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  value === option
                    ? "bg-emerald-50 font-semibold text-emerald-950"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
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

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  sectionKey: string;
  editingSection: string | null;
  onEdit: (sectionKey: string) => void;
  onCancel: () => void;
  onSave: () => void;
  className?: string;
  hideActions?: boolean;
  hideTitle?: boolean;
};

function SectionCard({
  title,
  children,
  sectionKey,
  editingSection,
  onEdit,
  onCancel,
  onSave,
  className = "",
  hideActions = false,
  hideTitle = false,
}: SectionCardProps) {
  const isEditing = editingSection === sectionKey;

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm md:p-4 ${className}`}>
      {(!hideTitle || !hideActions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {!hideTitle ? (
            <h2 className="text-base font-bold text-slate-900 md:text-lg">{title}</h2>
          ) : (
            <div />
          )}

          {!hideActions && (
            <>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onCancel}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onSave}
                    className="rounded-xl bg-emerald-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900"
                  >
                    Salva
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
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

export default function ProgettistaDashboardClient({
  userId,
  userEmail,
  initialData,
}: {
  userId: string;
  userEmail: string;
  initialData: DbProfile | null;
}) {
  const supabase = createClient();
  const initialProfile = mapDbToProfile(initialData, userEmail);

  const [profile, setProfile] = useState<ProgettistaProfile>(initialProfile);
  const [draft, setDraft] = useState<ProgettistaProfile>(initialProfile);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [searchAppearances, setSearchAppearances] = useState(0);
  const [companySelections, setCompanySelections] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isAvailabilitySaving, setIsAvailabilitySaving] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nextProfile = mapDbToProfile(initialData, userEmail);
    setProfile(nextProfile);
    setDraft(nextProfile);
  }, [initialData, userEmail]);

  useOutsideClick(accountMenuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardStats() {
      try {
        setIsStatsLoading(true);

        const response = await fetch("/api/progettista/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Impossibile caricare le statistiche.");
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
              : "Impossibile caricare le statistiche."
          );
        }
      } finally {
        if (!cancelled) setIsStatsLoading(false);
      }
    }

    loadDashboardStats();

    return () => {
      cancelled = true;
    };
  }, []);

  function formatItalianDate(value: string) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function startEdit(section: string) {
    setDraft(profile);
    setEditingSection(section);
    setFeedback("");
    setIsRegionOpen(false);
    setIsProvinceOpen(false);
  }

  function cancelEdit() {
    setDraft(profile);
    setEditingSection(null);
    setFeedback("");
    setIsRegionOpen(false);
    setIsProvinceOpen(false);
  }

  async function saveEdit() {
    setIsSaving(true);
    setFeedback("");

    const payload = mapProfileToDb(draft, userId);
    const { error } = await supabase
      .from("progettista_profiles")
      .upsert(payload, { onConflict: "user_id" });

    setIsSaving(false);

    if (error) {
      setFeedback("Errore durante il salvataggio. Riprova.");
      return;
    }

    setProfile(draft);
    setEditingSection(null);
    setIsRegionOpen(false);
    setIsProvinceOpen(false);
    setFeedback("Profilo aggiornato con successo.");
  }

  function updateDraft<K extends keyof ProgettistaProfile>(
    key: K,
    value: ProgettistaProfile[K]
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSector(sector: string) {
    setDraft((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter((item) => item !== sector)
        : [...prev.sectors, sector],
    }));
  }

  function updateCadRating(name: string, rating: number) {
    setDraft((prev) => ({
      ...prev,
      cadSkills: prev.cadSkills.map((skill) =>
        skill.name === name
          ? { ...skill, rating: skill.rating === rating ? 0 : rating }
          : skill
      ),
    }));
  }

  function updateCustomCadName(id: string, value: string) {
    setDraft((prev) => ({
      ...prev,
      customCadSkills: prev.customCadSkills.map((skill) =>
        skill.id === id ? { ...skill, name: value } : skill
      ),
    }));
  }

  function updateCustomCadRating(id: string, rating: number) {
    setDraft((prev) => ({
      ...prev,
      customCadSkills: prev.customCadSkills.map((skill) =>
        skill.id === id
          ? { ...skill, rating: skill.rating === rating ? 0 : rating }
          : skill
      ),
    }));
  }

  function addCustomCadSkill() {
    setDraft((prev) => ({
      ...prev,
      customCadSkills: [...prev.customCadSkills, createCustomCadSkill()],
    }));
  }

  function removeCustomCadSkill(id: string) {
    setDraft((prev) => ({
      ...prev,
      customCadSkills:
        prev.customCadSkills.length === 1
          ? [createCustomCadSkill()]
          : prev.customCadSkills.filter((skill) => skill.id !== id),
    }));
  }

  function removeAllItaly() {
    setDraft((prev) => ({
      ...prev,
      isAllItaly: false,
      selectedRegion: "",
      selectedProvinceEntries: [],
    }));
    setIsRegionOpen(false);
    setIsProvinceOpen(false);
  }

  function handleRegionChange(region: string) {
    setDraft((prev) => ({
      ...prev,
      selectedRegion: region,
    }));
  }

  function addProvince(province: string) {
    if (!province || draft.isAllItaly || !draft.selectedRegion) return;

    setDraft((prev) => {
      const alreadyExists = prev.selectedProvinceEntries.some(
        (item) => item.region === prev.selectedRegion && item.province === province
      );

      if (alreadyExists) return prev;

      return {
        ...prev,
        selectedProvinceEntries: [
          ...prev.selectedProvinceEntries,
          createProvinceEntry(prev.selectedRegion, province),
        ],
      };
    });
  }

  function removeProvince(id: string) {
    setDraft((prev) => ({
      ...prev,
      selectedProvinceEntries: prev.selectedProvinceEntries.filter(
        (item) => item.id !== id
      ),
    }));
  }

  async function toggleSearchAvailability() {
    if (isAvailabilitySaving) return;

    const nextValue = !profile.isSearchActive;
    setIsAvailabilitySaving(true);
    setFeedback("");

    try {
      const response = await fetch("/api/progettista/dashboard", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isSearchActive: nextValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Impossibile aggiornare la disponibilità."
        );
      }

      const confirmedValue = data.isSearchActive !== false;

      setProfile((prev) => ({
        ...prev,
        isSearchActive: confirmedValue,
      }));
      setDraft((prev) => ({
        ...prev,
        isSearchActive: confirmedValue,
      }));

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
    window.location.href = "/login";
  }

  async function handleDeleteAccount() {
    setIsMenuOpen(false);

    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare definitivamente il tuo account QuickSolve? Il profilo non comparirà più nelle ricerche e non potrai recuperarlo."
    );

    if (!confirmed) return;

    try {
      setIsDeletingAccount(true);
      setFeedback("");

      const response = await fetch("/api/progettista/dashboard", {
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

  function renderStars(value: number) {
    return "★".repeat(value) + "☆".repeat(5 - value);
  }

  function renderStarButtonsForBaseCad(name: string, value: number) {
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= value;
          return (
            <button
              key={star}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => updateCadRating(name, star)}
              className={`h-8 w-8 rounded-lg border text-sm font-bold transition ${
                active
                  ? "border-emerald-700 bg-emerald-100 text-emerald-900"
                  : "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
    );
  }

  function renderStarButtonsForCustomCad(id: string, value: number) {
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= value;
          return (
            <button
              key={star}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => updateCustomCadRating(id, star)}
              className={`h-8 w-8 rounded-lg border text-sm font-bold transition ${
                active
                  ? "border-emerald-700 bg-emerald-100 text-emerald-900"
                  : "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
    );
  }

  const finalStudyTitle =
    profile.studyTitle === "Altro" ? profile.studyTitleOther : profile.studyTitle;

  const selectedBaseCad = useMemo(
    () => profile.cadSkills.filter((skill) => skill.rating > 0),
    [profile.cadSkills]
  );

  const selectedCustomCad = useMemo(
    () =>
      profile.customCadSkills.filter(
        (skill) => skill.name.trim() !== "" && skill.rating > 0
      ),
    [profile.customCadSkills]
  );

  const availableProvinceOptions = draft.selectedRegion
    ? regionProvinceMap[draft.selectedRegion].filter(
        (province) =>
          !draft.selectedProvinceEntries.some(
            (item) =>
              item.region === draft.selectedRegion && item.province === province
          )
      )
    : [];

  const budgetOptions =
    draft.collaborationType === "Freelancer partita IVA"
      ? freelanceRangeOptions
      : draft.collaborationType === "Dipendente full time" ||
        draft.collaborationType === "Dipendente part-time"
      ? employeeRangeOptions
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
                    Dashboard progettista
                  </p>
                  <h1 className="mt-2 text-lg font-bold leading-tight text-slate-900">
                    {profile.firstName} {profile.lastName}
                  </h1>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Data di nascita</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatItalianDate(profile.birthDate)}
                  </p>
                </div>

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
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                    Visualizzazioni aziende
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {isStatsLoading ? "…" : searchAppearances}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Selezionato dalle aziende</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {isStatsLoading ? "…" : companySelections}
                  </p>
                </div>

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
                      aria-label="Disponibilità nelle ricerche aziendali"
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
                      value={draft.whatsapp}
                      onChange={(e) => updateDraft("whatsapp", e.target.value)}
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
                      onChange={(e) => updateDraft("email", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={draft.linkedin}
                      onChange={(e) => updateDraft("linkedin", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-2.5 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">WhatsApp</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {profile.whatsapp || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {profile.email || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">LinkedIn</p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                      {profile.linkedin || "-"}
                    </p>
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Modalità di collaborazione"
              sectionKey="collaboration"
              editingSection={editingSection}
              onEdit={startEdit}
              onCancel={cancelEdit}
              onSave={saveEdit}
            >
              {editingSection === "collaboration" ? (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {collaborationOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          updateDraft("collaborationType", option);
                          updateDraft("budgetRange", "");
                        }}
                        className={`rounded-xl border px-4 py-2.5 text-left transition ${
                          draft.collaborationType === option
                            ? "border-emerald-900 bg-emerald-50 text-emerald-950"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm font-semibold md:text-base">{option}</span>
                      </button>
                    ))}
                  </div>

                  {draft.collaborationType !== "" && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        {draft.collaborationType === "Freelancer partita IVA"
                          ? "Range economico indicativo"
                          : "RAL indicativa"}
                      </label>
                      <select
                        value={draft.budgetRange}
                        onChange={(e) => updateDraft("budgetRange", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-900"
                      >
                        <option value="">
                          {draft.collaborationType === "Freelancer partita IVA"
                            ? "Seleziona il tuo range orario"
                            : "Seleziona la tua RAL indicativa"}
                        </option>
                        {budgetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Modalità</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {profile.collaborationType || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Range economico</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {profile.budgetRange || "-"}
                    </p>
                  </div>
                </div>
              )}
            </SectionCard>

            <div className="grid gap-3 lg:grid-cols-2">
              <SectionCard
                title="Titolo di studio"
                sectionKey="study"
                editingSection={editingSection}
                onEdit={startEdit}
                onCancel={cancelEdit}
                onSave={saveEdit}
              >
                {editingSection === "study" ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      {studyTitleOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => updateDraft("studyTitle", option)}
                          className={`rounded-xl border px-4 py-2.5 text-left transition ${
                            draft.studyTitle === option
                              ? "border-emerald-900 bg-emerald-50 text-emerald-950"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-sm font-semibold md:text-base">{option}</span>
                        </button>
                      ))}
                    </div>

                    {draft.studyTitle === "Altro" && (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Specifica il titolo di studio
                        </label>
                        <input
                          type="text"
                          value={draft.studyTitleOther}
                          onChange={(e) => updateDraft("studyTitleOther", e.target.value)}
                          placeholder="Es. Diploma tecnico industriale meccanico"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-900"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Titolo di studio</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {finalStudyTitle || "-"}
                    </p>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Esperienza"
                sectionKey="experience"
                editingSection={editingSection}
                onEdit={startEdit}
                onCancel={cancelEdit}
                onSave={saveEdit}
              >
                {editingSection === "experience" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {experienceOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => updateDraft("experience", option)}
                        className={`rounded-xl border px-4 py-2.5 text-left transition ${
                          draft.experience === option
                            ? "border-emerald-900 bg-emerald-50 text-emerald-950"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm font-semibold md:text-base">{option}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Esperienza professionale</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {profile.experience || "-"}
                    </p>
                  </div>
                )}
              </SectionCard>
            </div>

            <SectionCard
              title="Software CAD"
              sectionKey="cad"
              editingSection={editingSection}
              onEdit={startEdit}
              onCancel={cancelEdit}
              onSave={saveEdit}
            >
              {editingSection === "cad" ? (
                <div className="space-y-3">
                  <div className="space-y-3">
                    {draft.cadSkills.map((skill) => (
                      <div
                        key={skill.name}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{skill.name}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              Riclicca la stessa stellina per deselezionare
                            </p>
                          </div>

                          <div>{renderStarButtonsForBaseCad(skill.name, skill.rating)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900">Altro</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Inserisci software CAD aggiuntivi.
                        </p>
                      </div>

                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={addCustomCadSkill}
                        className="rounded-xl bg-emerald-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900"
                      >
                        Aggiungi
                      </button>
                    </div>

                    <div className="space-y-3">
                      {draft.customCadSkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-700">
                                Altro software CAD
                              </label>
                              <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => updateCustomCadName(skill.id, e.target.value)}
                                placeholder="Es. Tekla, Revit, MicroStation..."
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-900"
                              />
                            </div>

                            <div>
                              <p className="mb-1.5 text-sm font-medium text-slate-700">Livello</p>
                              {renderStarButtonsForCustomCad(skill.id, skill.rating)}
                            </div>

                            <div>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => removeCustomCadSkill(skill.id)}
                                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Rimuovi
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedBaseCad.map((skill) => (
                      <div key={skill.name} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-base font-semibold text-slate-900">{skill.name}</p>
                        <p className="mt-1.5 text-sm text-amber-500">{renderStars(skill.rating)}</p>
                      </div>
                    ))}
                  </div>

                  {selectedCustomCad.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-500">Altro</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {selectedCustomCad.map((skill) => (
                          <div key={skill.id} className="rounded-xl bg-slate-50 p-3">
                            <p className="text-base font-semibold text-slate-900">{skill.name}</p>
                            <p className="mt-1.5 text-sm text-amber-500">{renderStars(skill.rating)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <div className="grid gap-3 lg:grid-cols-2">
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
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
                      {sectorOptions.map((sector) => (
                        <button
                          key={sector}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleSector(sector)}
                          className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                            draft.sectors.includes(sector)
                              ? "border-emerald-900 bg-emerald-50 text-emerald-950"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Altro settore
                      </label>
                      <input
                        type="text"
                        value={draft.sectorOther}
                        onChange={(e) => updateDraft("sectorOther", e.target.value)}
                        placeholder="Es. Food, Pharma, Difesa..."
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.sectors.map((sector) => (
                      <span
                        key={sector}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {sector}
                      </span>
                    ))}
                    {profile.sectorOther.trim() !== "" && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                        {profile.sectorOther}
                      </span>
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
                    <div className="flex flex-wrap gap-3">
                      {draft.isAllItaly && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={removeAllItaly}
                          className="rounded-xl border border-emerald-900 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-950 transition hover:bg-emerald-100"
                        >
                          Tutta Italia ×
                        </button>
                      )}

                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => updateDraft("isRemote", !draft.isRemote)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          draft.isRemote
                            ? "border-emerald-900 bg-emerald-50 text-emerald-950"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        Remote
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <CustomDropdown
                        label="Regione"
                        placeholder="Seleziona una regione"
                        value={draft.selectedRegion}
                        options={regionOptions}
                        disabled={draft.isAllItaly}
                        isOpen={isRegionOpen}
                        setIsOpen={(open) => {
                          setIsRegionOpen(open);
                          if (open) setIsProvinceOpen(false);
                        }}
                        onSelect={handleRegionChange}
                      />

                      <CustomDropdown
                        label="Provincia"
                        placeholder={
                          draft.isAllItaly
                            ? "Disabilitato perché hai selezionato Tutta Italia"
                            : draft.selectedRegion
                            ? "Seleziona una provincia"
                            : "Prima seleziona una regione"
                        }
                        value=""
                        options={availableProvinceOptions}
                        disabled={draft.isAllItaly || !draft.selectedRegion}
                        isOpen={isProvinceOpen}
                        setIsOpen={(open) => {
                          setIsProvinceOpen(open);
                          if (open) setIsRegionOpen(false);
                        }}
                        onSelect={addProvince}
                      />
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-sm text-slate-500">Province selezionate</p>

                      {draft.isAllItaly ? (
                        <p className="mt-1.5 text-sm text-slate-700">
                          Hai selezionato Tutta Italia.
                        </p>
                      ) : draft.selectedProvinceEntries.length === 0 ? (
                        <p className="mt-1.5 text-sm text-slate-700">
                          Nessuna provincia selezionata.
                        </p>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {draft.selectedProvinceEntries.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => removeProvince(item.id)}
                              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                            >
                              {item.province} ×
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.isAllItaly && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                        Tutta Italia
                      </span>
                    )}
                    {profile.isRemote && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                        Remote
                      </span>
                    )}
                    {profile.selectedProvinceEntries.map((item) => (
                      <span
                        key={item.id}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {item.province}
                      </span>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}