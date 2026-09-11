"use client";

import { useEffect, useMemo, useState } from "react";

type CollaborationType = "Full time" | "Part-time" | "Freelancer";
type StudyTitle =
  | "Diploma di maturità"
  | "Laurea Triennale"
  | "Laurea Magistrale"
  | "Altro";
type ExperienceLevel = "0-2 anni" | "3-5 anni" | "6-10 anni" | "10+ anni";

type RatedCad = {
  nome: string;
  livello: number;
};

type SupabaseCad = {
  name?: string;
  rating?: number;
};

type SelectedProvinceEntry = {
  id?: string;
  region?: string;
  province?: string;
};

type SupabaseDesigner = {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  birth_date?: string | null;
  study_title?: StudyTitle | null;
  study_title_other?: string | null;
  experience?: ExperienceLevel | null;
  collaboration_type?:
    | "Dipendente full time"
    | "Dipendente part-time"
    | "Freelancer partita IVA"
    | null;
  budget_range?: string | null;
  selected_region?: string | null;
  selected_province_entries?: SelectedProvinceEntry[] | null;
  is_all_italy?: boolean | null;
  is_remote?: boolean | null;
  sectors?: string[] | null;
  sector_other?: string | null;
  cad_skills?: SupabaseCad[] | null;
  custom_cad_skills?: SupabaseCad[] | null;
  email?: string | null;
  whatsapp?: string | null;
  linkedin?: string | null;
  created_at?: string | null;
  profile_status?: string | null;
};

type Designer = {
  id: string;
  nome: string;
  cognome: string;
  dataNascita: string;
  titoloStudio: StudyTitle | "Perito";
  titoloStudioAltro?: string;
  esperienza: ExperienceLevel;
  tipologia: CollaborationType;
  rangeEconomico: string;
  regioni: string[];
  province: string[];
  selectedRegionRaw?: string;
  settori: string[];
  altroSettore?: string;
  cadPrincipali: RatedCad[];
  altroCad?: RatedCad[];
  email: string;
  whatsapp: string;
  linkedin?: string;
  isRemote?: boolean;
  isAllItaly?: boolean;
  createdAt?: string;
  status?: string;
};

type ApiResponse = {
  success: boolean;
  designers?: SupabaseDesigner[];
  message?: string;
  deletedIds?: string[];
};

const cadOptions = [
  "SolidWorks",
  "Inventor",
  "PTC Creo",
  "CATIA",
  "AutoCAD",
  "Solid Edge",
  "Modeling",
  "NX",
  "Altro",
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
  "Altro",
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

const allRegionsAlphabetical = Object.keys(regionProvinceMap).sort((a, b) =>
  a.localeCompare(b, "it")
);

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeStudyTitle(title: Designer["titoloStudio"]) {
  if (title === "Perito") return "Diploma di maturità";
  return title;
}

function formatItalianDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function normalizeDesignerType(
  type: SupabaseDesigner["collaboration_type"]
): CollaborationType {
  if (type === "Freelancer partita IVA") return "Freelancer";
  if (type === "Dipendente part-time") return "Part-time";
  return "Full time";
}

function deriveDesignerRegions(
  selectedRegion?: string | null,
  selectedProvinces?: string[] | null,
  isAllItaly?: boolean | null
) {
  if (isAllItaly) return allRegionsAlphabetical;
  if (selectedRegion?.trim()) return [selectedRegion.trim()];

  const provinces = (selectedProvinces ?? []).map(normalizeText);

  const matchedRegions = Object.entries(regionProvinceMap)
    .filter(([, provinceList]) =>
      provinceList.some((provinceName) => provinces.includes(normalizeText(provinceName)))
    )
    .map(([region]) => region);

  return matchedRegions;
}

function mapCadItems(items?: SupabaseCad[] | null): RatedCad[] {
  return (items ?? [])
    .filter((item) => (item.name ?? "").trim() !== "" && Number(item.rating) > 0)
    .map((item) => ({
      nome: String(item.name).trim(),
      livello: Number(item.rating),
    }));
}

function extractProvinceNames(entries?: SelectedProvinceEntry[] | null): string[] {
  return (entries ?? [])
    .map((item) => item?.province?.trim() || "")
    .filter(Boolean);
}

function mapSupabaseDesignerToAdminDesigner(item: SupabaseDesigner): Designer {
  const provinceEntries = item.selected_province_entries ?? [];
  const provinceNames = extractProvinceNames(provinceEntries);

  return {
    id: item.user_id,
    nome: item.first_name?.trim() || "",
    cognome: item.last_name?.trim() || "",
    dataNascita: item.birth_date?.trim() || "",
    titoloStudio: (item.study_title || "Altro") as Designer["titoloStudio"],
    titoloStudioAltro: item.study_title_other?.trim() || undefined,
    esperienza: (item.experience || "0-2 anni") as ExperienceLevel,
    tipologia: normalizeDesignerType(item.collaboration_type),
    rangeEconomico: item.budget_range?.trim() || "",
    regioni: deriveDesignerRegions(item.selected_region, provinceNames, item.is_all_italy),
    province: item.is_all_italy ? [] : provinceNames,
    selectedRegionRaw: item.selected_region?.trim() || undefined,
    settori: item.sectors ?? [],
    altroSettore: item.sector_other?.trim() || undefined,
    cadPrincipali: mapCadItems(item.cad_skills),
    altroCad: mapCadItems(item.custom_cad_skills),
    email: item.email?.trim() || "",
    whatsapp: item.whatsapp?.trim() || "",
    linkedin: item.linkedin?.trim() || undefined,
    isRemote: Boolean(item.is_remote),
    isAllItaly: Boolean(item.is_all_italy),
    createdAt: item.created_at || undefined,
    status: item.profile_status || undefined,
  };
}

async function safeReadJson<T>(response: Response): Promise<T | null> {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "soft";
}) {
  const classes =
    tone === "primary"
      ? "border border-teal-700 bg-teal-700 text-white"
      : tone === "soft"
      ? "border border-teal-200 bg-teal-50 text-teal-800"
      : "border border-neutral-200 bg-neutral-100 text-neutral-700";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium leading-none ${classes}`}
    >
      {children}
    </span>
  );
}

function FilterField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-1.5 block text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AdminProgettistiPage() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCad, setSelectedCad] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedStudyTitle, setSelectedStudyTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDesigner, setActiveDesigner] = useState<Designer | null>(null);
  const [expandedZoneDesignerIds, setExpandedZoneDesignerIds] = useState<string[]>([]);

  const provinceOptions = selectedRegion ? regionProvinceMap[selectedRegion] ?? [] : [];

  const loadDesigners = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await fetch("/api/admin/progettisti", {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await safeReadJson<ApiResponse>(response);

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Errore nel caricamento progettisti.");
        }

        setDesigners((data.designers ?? []).map(mapSupabaseDesignerToAdminDesigner));
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Impossibile caricare i progettisti dal CRM."
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadDesigners();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDesigner(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredDesigners = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    const normalizedSelectedRegion = normalizeText(selectedRegion);
    const normalizedSelectedProvince = normalizeText(selectedProvince);

    const filtered = designers.filter((designer) => {
      const fullName = `${designer.nome} ${designer.cognome}`.toLowerCase();

      const allDesignerSectors = [
        ...designer.settori,
        ...(designer.altroSettore ? [designer.altroSettore] : []),
      ];

      const allDesignerCad = [
        ...designer.cadPrincipali.map((item) => item.nome),
        ...(designer.altroCad ?? []).map((item) => item.nome),
      ];

      const designerStudyTitleNormalized = normalizeStudyTitle(designer.titoloStudio);

      const regionFromProvinces = Object.entries(regionProvinceMap)
        .filter(([, provinceList]) =>
          designer.province.some((province) =>
            provinceList.some(
              (mappedProvince) => normalizeText(mappedProvince) === normalizeText(province)
            )
          )
        )
        .map(([region]) => region);

      const matchSearch = !term || fullName.includes(term);
      const matchExperience = !selectedExperience || designer.esperienza === selectedExperience;
      const matchType = !selectedType || designer.tipologia === selectedType;
      const matchRegion =
        !selectedRegion ||
        designer.isAllItaly ||
        normalizeText(designer.selectedRegionRaw) === normalizedSelectedRegion ||
        designer.regioni.some((region) => normalizeText(region) === normalizedSelectedRegion) ||
        regionFromProvinces.some((region) => normalizeText(region) === normalizedSelectedRegion);
      const matchProvince =
        !selectedProvince ||
        designer.isAllItaly ||
        designer.province.some(
          (province) => normalizeText(province) === normalizedSelectedProvince
        );
      const matchCad =
        !selectedCad ||
        (selectedCad === "Altro"
          ? (designer.altroCad ?? []).length > 0
          : allDesignerCad.includes(selectedCad));
      const matchSector =
        !selectedSector ||
        (selectedSector === "Altro"
          ? Boolean(designer.altroSettore)
          : allDesignerSectors.includes(selectedSector));
      const matchStudy =
        !selectedStudyTitle || designerStudyTitleNormalized === selectedStudyTitle;

      return (
        matchSearch &&
        matchExperience &&
        matchType &&
        matchRegion &&
        matchProvince &&
        matchCad &&
        matchSector &&
        matchStudy
      );
    });

    /*
     * Quando viene applicato un filtro geografico:
     * 1. prima i progettisti realmente disponibili nella provincia/regione scelta;
     * 2. dopo i profili legacy che avevano selezionato "Tutta Italia".
     *
     * "Tutta Italia" continua quindi a essere incluso nei risultati, ma non viene
     * più equiparato a una disponibilità territoriale specifica nell'ordinamento.
     */
    if (selectedRegion || selectedProvince) {
      return [...filtered].sort((a, b) => {
        const geographicPriority = (designer: Designer) => {
          if (designer.isAllItaly) return 1;

          if (selectedProvince) {
            const hasExactProvince = designer.province.some(
              (province) => normalizeText(province) === normalizedSelectedProvince
            );
            return hasExactProvince ? 0 : 2;
          }

          const regionFromProvinces = Object.entries(regionProvinceMap)
            .filter(([, provinceList]) =>
              designer.province.some((province) =>
                provinceList.some(
                  (mappedProvince) =>
                    normalizeText(mappedProvince) === normalizeText(province)
                )
              )
            )
            .map(([region]) => region);

          const hasExactRegion =
            normalizeText(designer.selectedRegionRaw) === normalizedSelectedRegion ||
            designer.regioni.some(
              (region) => normalizeText(region) === normalizedSelectedRegion
            ) ||
            regionFromProvinces.some(
              (region) => normalizeText(region) === normalizedSelectedRegion
            );

          return hasExactRegion ? 0 : 2;
        };

        return geographicPriority(a) - geographicPriority(b);
      });
    }

    return filtered;
  }, [
    designers,
    searchValue,
    selectedExperience,
    selectedType,
    selectedRegion,
    selectedProvince,
    selectedCad,
    selectedSector,
    selectedStudyTitle,
  ]);

  const toggleZoneExpansion = (designerId: string) => {
    setExpandedZoneDesignerIds((prev) =>
      prev.includes(designerId)
        ? prev.filter((currentId) => currentId !== designerId)
        : [...prev, designerId]
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((currentId) => currentId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      window.alert("Seleziona almeno un progettista da eliminare.");
      return;
    }

    const confirmed = window.confirm(
      `Confermi l'eliminazione di ${selectedIds.length} progettista/i dal CRM?`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setLoadError("");

      const idsToDelete = [...selectedIds];

      const response = await fetch("/api/admin/progettisti", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      const data = await safeReadJson<ApiResponse>(response);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Errore durante l'eliminazione dei progettisti.");
      }

      /*
       * Non nascondiamo semplicemente il progettista dalla UI.
       * Rileggiamo il database: se la DELETE non fosse realmente avvenuta,
       * il progettista tornerebbe immediatamente e vedremmo l'errore.
       */
      setSelectedIds([]);

      if (activeDesigner && idsToDelete.includes(activeDesigner.id)) {
        setActiveDesigner(null);
      }

      await loadDesigners();

      const verificationResponse = await fetch("/api/admin/progettisti", {
        method: "GET",
        cache: "no-store",
      });

      const verificationData =
        await safeReadJson<ApiResponse>(verificationResponse);

      if (!verificationResponse.ok || !verificationData?.success) {
        throw new Error(
          verificationData?.message ||
            "Impossibile verificare la cancellazione del progettista."
        );
      }

      const remainingIds = (verificationData.designers ?? []).map(
        (designer) => designer.user_id
      );

      const stillPresent = idsToDelete.filter((id) =>
        remainingIds.includes(id)
      );

      if (stillPresent.length > 0) {
        throw new Error(
          "La cancellazione non è stata completata: il progettista risulta ancora presente nel database."
        );
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Errore imprevisto durante l'eliminazione."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchValue("");
    setSelectedExperience("");
    setSelectedType("");
    setSelectedRegion("");
    setSelectedProvince("");
    setSelectedCad("");
    setSelectedSector("");
    setSelectedStudyTitle("");
  };

  return (
    <section className="-mt-2 min-w-0 space-y-3 sm:-mt-4 sm:space-y-4 md:-mt-4">
      <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="text-xs text-neutral-500">
            {isLoading ? "Caricamento in corso..." : isDeleting ? "Eliminazione in corso..." : ""}
          </div>
          <Badge tone="soft">Admin progettisti</Badge>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <FilterField label="Cerca progettista" className="w-full min-[1280px]:w-[220px]">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Nome e cognome"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-teal-700"
            />
          </FilterField>

          <FilterField label="Esperienza" className="w-full min-[1280px]:w-auto">
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full min-[1280px]:w-auto min-w-[150px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700"
            >
              <option value="">Tutte</option>
              <option value="0-2 anni">0-2 anni</option>
              <option value="3-5 anni">3-5 anni</option>
              <option value="6-10 anni">6-10 anni</option>
              <option value="10+ anni">10+ anni</option>
            </select>
          </FilterField>

          <FilterField label="Contratto" className="w-full min-[1280px]:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full min-[1280px]:w-auto min-w-[132px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700"
            >
              <option value="">Tutte</option>
              <option value="Full time">Full time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelancer">Freelancer</option>
            </select>
          </FilterField>

          <FilterField label="Regione" className="w-full min-[1280px]:w-auto">
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedProvince("");
              }}
              className="w-full min-[1280px]:w-auto min-w-[185px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700"
            >
              <option value="">Tutte</option>
              {allRegionsAlphabetical.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FilterField>

          <div className="w-full min-[1280px]:w-auto">
            {selectedRegion ? (
              <FilterField label="Provincia" className="w-full min-[1280px]:w-auto">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full min-[1280px]:w-auto min-w-[185px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700"
                >
                  <option value="">Tutte</option>
                  {provinceOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FilterField>
            ) : null}
          </div>

          <FilterField label="CAD" className="w-full min-[1280px]:w-auto">
            <select
              value={selectedCad}
              onChange={(e) => setSelectedCad(e.target.value)}
              className="w-full min-[1280px]:w-auto min-w-[132px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700"
            >
              <option value="">Tutti</option>
              {cadOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Settori" className="w-full min-[1280px]:w-auto">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full min-[1280px]:w-auto min-w-[190px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700"
            >
              <option value="">Tutti</option>
              {sectorOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Studio" className="w-full min-[1280px]:w-auto">
            <select
              value={selectedStudyTitle}
              onChange={(e) => setSelectedStudyTitle(e.target.value)}
              className="w-full min-[1280px]:w-auto min-w-[170px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700"
            >
              <option value="">Tutti</option>
              <option value="Diploma di maturità">Diploma di maturità</option>
              <option value="Laurea Triennale">Laurea Triennale</option>
              <option value="Laurea Magistrale">Laurea Magistrale</option>
              <option value="Altro">Altro</option>
            </select>
          </FilterField>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-sm text-neutral-500">
            {filteredDesigners.length} progettisti trovati su {designers.length} presenti nel CRM scouting
          </div>

          <button
            onClick={resetFilters}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
          >
            Reset filtri
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          Errore caricamento CRM: {loadError}
        </div>
      ) : null}

      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Lista progettisti</h2>

          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Eliminazione..." : "Cancella"}
          </button>
        </div>

        <div className="p-4">
          <div className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 lg:grid lg:grid-cols-[42px_1.2fr_0.8fr_1fr_1.05fr_1.25fr_1.15fr] lg:gap-3 lg:px-2 lg:pb-3">
            <div className="text-center">Sel.</div>
            <div className="text-center">Progettista</div>
            <div className="text-center">Esperienza</div>
            <div className="text-center">Contratto</div>
            <div className="text-center">Zone operative</div>
            <div className="text-center">CAD</div>
            <div className="text-center">Settori</div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
              Caricamento progettisti dal database in corso...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDesigners.map((designer) => {
                const cadCompleti = [...designer.cadPrincipali, ...(designer.altroCad ?? [])];
                const settoriCompleti = [
                  ...designer.settori,
                  ...(designer.altroSettore ? [designer.altroSettore] : []),
                ];
                const titoloStudioDaMostrare =
                  designer.titoloStudio === "Altro" && designer.titoloStudioAltro?.trim()
                    ? designer.titoloStudioAltro
                    : normalizeStudyTitle(designer.titoloStudio);
                const isZoneExpanded = expandedZoneDesignerIds.includes(designer.id);
                const hasMoreThanTwelveProvinces =
                  !designer.isAllItaly && designer.province.length > 12;

                const visibleProvinceItems =
                  designer.isAllItaly || isZoneExpanded
                    ? designer.province
                    : designer.province.slice(0, 12);

                const zoneOperative = designer.isAllItaly
                  ? ["Tutta Italia", ...(designer.isRemote ? ["Remote"] : [])]
                  : [
                      ...visibleProvinceItems,
                      ...(designer.isRemote ? ["Remote"] : []),
                    ];

                return (
                  <div
                    key={designer.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveDesigner(designer)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveDesigner(designer);
                      }
                    }}
                    className="cursor-pointer rounded-2xl border border-neutral-200 bg-white p-3 transition hover:border-teal-300 hover:shadow-sm sm:p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[42px_1.2fr_0.8fr_1fr_1.05fr_1.25fr_1.15fr] lg:items-start">
                      <div
                        className="pt-1 text-center"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(designer.id)}
                          onChange={() => toggleSelection(designer.id)}
                          className="h-4 w-4 rounded border-neutral-300 text-teal-700 focus:ring-teal-700"
                        />
                      </div>

                      <div className="text-center">
                        <p className="text-base font-semibold text-neutral-900">
                          {designer.nome} {designer.cognome}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {formatItalianDate(designer.dataNascita) || "Non indicata"}
                        </p>
                        <div className="mt-2 flex flex-wrap justify-center gap-2">
                          <Badge tone="soft">{titoloStudioDaMostrare || "Titolo non indicato"}</Badge>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Esperienza
                        </p>
                        <p className="text-sm text-neutral-700">{designer.esperienza || "Non indicata"}</p>
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Contratto
                        </p>
                        <div className="flex flex-col items-center gap-2">
                          <Badge tone={designer.tipologia === "Freelancer" ? "primary" : "neutral"}>
                            {designer.tipologia}
                          </Badge>
                          <p className="text-sm text-neutral-700">
                            {designer.rangeEconomico || "Range non indicato"}
                          </p>
                        </div>
                      </div>

                      <div className="relative text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Zone operative
                        </p>

                        <div
                          className={`flex flex-wrap justify-center gap-2 ${
                            hasMoreThanTwelveProvinces ? "pb-8" : ""
                          }`}
                        >
                          {zoneOperative.length > 0 ? (
                            zoneOperative.map((item) => (
                              <Badge key={`${designer.id}-${item}`} tone="soft">
                                {item}
                              </Badge>
                            ))
                          ) : (
                            <Badge tone="soft">Non indicate</Badge>
                          )}
                        </div>

                        {hasMoreThanTwelveProvinces ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleZoneExpansion(designer.id);
                            }}
                            onKeyDown={(event) => event.stopPropagation()}
                            className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                            aria-label={
                              isZoneExpanded
                                ? "Riduci province visualizzate"
                                : "Mostra tutte le province"
                            }
                            title={
                              isZoneExpanded
                                ? "Riduci province visualizzate"
                                : "Mostra tutte le province"
                            }
                          >
                            <span
                              aria-hidden="true"
                              className={`transition-transform duration-200 ${
                                isZoneExpanded ? "rotate-180" : ""
                              }`}
                            >
                              ↓
                            </span>
                          </button>
                        ) : null}
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          CAD
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {cadCompleti.length > 0 ? (
                            cadCompleti.map((item) => (
                              <Badge
                                key={`${item.nome}-${item.livello}`}
                                tone={designer.altroCad?.some((cad) => cad.nome === item.nome) ? "soft" : "neutral"}
                              >
                                {item.nome} · {item.livello}/5
                              </Badge>
                            ))
                          ) : (
                            <Badge tone="soft">Nessun CAD assegnato</Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Settori industriali
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {settoriCompleti.length > 0 ? (
                            settoriCompleti.map((item) => (
                              <Badge
                                key={item}
                                tone={designer.altroSettore === item ? "soft" : "neutral"}
                              >
                                {item}
                              </Badge>
                            ))
                          ) : (
                            <Badge tone="soft">Nessun settore indicato</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDesigners.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
                  Nessun progettista presente nel CRM scouting con i filtri selezionati.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {activeDesigner && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-4"
          onClick={() => setActiveDesigner(null)}
        >
          <div
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {activeDesigner.nome} {activeDesigner.cognome}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatItalianDate(activeDesigner.dataNascita) || "Data di nascita non indicata"}
                </p>
                {activeDesigner.createdAt ? (
                  <p className="mt-1 text-xs text-neutral-400">
                    Inserito il {new Date(activeDesigner.createdAt).toLocaleString("it-IT")}
                  </p>
                ) : null}
              </div>

              <button
                onClick={() => setActiveDesigner(null)}
                className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
                aria-label="Chiudi finestra contatti"
              >
                Chiudi
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Email</p>
                <p className="mt-1 break-all text-sm text-neutral-900">{activeDesigner.email || "Non indicata"}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">WhatsApp</p>
                <p className="mt-1 text-sm text-neutral-900">{activeDesigner.whatsapp || "Non indicato"}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">LinkedIn</p>
                <p className="mt-1 break-all text-sm text-neutral-900">
                  {activeDesigner.linkedin || "Non indicato"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}