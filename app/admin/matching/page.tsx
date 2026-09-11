"use client";

import React, { useEffect, useMemo, useState } from "react";

type CollaborationType = "Full time" | "Part-time" | "Freelancer";
type ExperienceLevel =
  | "Junior"
  | "Middle"
  | "Senior"
  | "Resp. ufficio tecnico";

type CandidateCollaboration =
  | "Dipendente full time"
  | "Dipendente part-time"
  | "Freelancer partita IVA";

type CandidateExperience = "0-2 anni" | "3-5 anni" | "6-10 anni" | "10+ anni";

type RatedCad = {
  nome: string;
  livello: number;
};

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
  jobDescription: string;
  note?: string;
  archived?: boolean;
};

type CandidateCadSkill = {
  name: string;
  rating: number;
};

type CandidateProfile = {
  id: string;
  nome: string;
  cognome: string;
  birthDate: string;
  email: string;
  telefono: string;
  linkedin?: string;
  studyTitle?: string;
  studyTitleOther?: string;
  regioni: string[];
  province: string[];
  isRemote: boolean;
  isAllItaly: boolean;
  sectors: string[];
  otherSector?: string;
  collaborationType: CandidateCollaboration;
  experience: CandidateExperience;
  budgetRange: string;
  cadSkills: CandidateCadSkill[];
  customCadSkills: CandidateCadSkill[];
  profileStatus: string;
  isSearchActive: boolean;
};


type RawRecord = Record<string, unknown>;

type MatchBreakdown = {
  regionScore: number;
  sectorScore: number;
  seniorityScore: number;
  softwareScore: number;
  budgetScore: number;
  availabilityPenalty: number;
  totalScore: number;
  percentage: number;
};

type MatchResult = {
  candidate: CandidateProfile;
  breakdown: MatchBreakdown;
};

const regionAdjacencyMap: Record<string, string[]> = {
  Abruzzo: ["Marche", "Lazio", "Molise"],
  Basilicata: ["Puglia", "Calabria", "Campania"],
  Calabria: ["Basilicata"],
  Campania: ["Lazio", "Molise", "Puglia", "Basilicata"],
  "Emilia-Romagna": ["Lombardia", "Veneto", "Liguria", "Piemonte", "Toscana", "Marche"],
  "Friuli-Venezia Giulia": ["Veneto"],
  Lazio: ["Toscana", "Umbria", "Marche", "Abruzzo", "Molise", "Campania"],
  Liguria: ["Piemonte", "Emilia-Romagna", "Toscana"],
  Lombardia: ["Piemonte", "Emilia-Romagna", "Veneto", "Trentino-Alto Adige"],
  Marche: ["Emilia-Romagna", "Toscana", "Umbria", "Lazio", "Abruzzo"],
  Molise: ["Abruzzo", "Lazio", "Campania", "Puglia"],
  Piemonte: ["Valle d'Aosta", "Lombardia", "Emilia-Romagna", "Liguria"],
  Puglia: ["Molise", "Campania", "Basilicata"],
  Sardegna: [],
  Sicilia: [],
  Toscana: ["Liguria", "Emilia-Romagna", "Marche", "Umbria", "Lazio"],
  "Trentino-Alto Adige": ["Lombardia", "Veneto"],
  Umbria: ["Toscana", "Marche", "Lazio"],
  "Valle d'Aosta": ["Piemonte"],
  Veneto: ["Friuli-Venezia Giulia", "Trentino-Alto Adige", "Lombardia", "Emilia-Romagna"],
};


const PROVINCE_CAPITAL_COORDS: Record<string, [number, number]> = {
  Agrigento: [37.3111, 13.5765],
  Alessandria: [44.9120, 8.6150],
  Ancona: [43.6158, 13.5189],
  Arezzo: [43.4633, 11.8796],
  "Ascoli Piceno": [42.8536, 13.5749],
  Asti: [44.9008, 8.2064],
  Avellino: [40.9144, 14.7906],
  Bari: [41.1171, 16.8719],
  "Barletta-Andria-Trani": [41.2277, 16.2952],
  Belluno: [46.1425, 12.2167],
  Benevento: [41.1298, 14.7826],
  Bergamo: [45.6983, 9.6773],
  Biella: [45.5629, 8.0583],
  Bologna: [44.4949, 11.3426],
  Bolzano: [46.4983, 11.3548],
  Brescia: [45.5416, 10.2118],
  Brindisi: [40.6327, 17.9418],
  Cagliari: [39.2238, 9.1217],
  Caltanissetta: [37.4901, 14.0629],
  Campobasso: [41.5603, 14.6627],
  Caserta: [41.0747, 14.3323],
  Catania: [37.5079, 15.0830],
  Catanzaro: [38.9098, 16.5877],
  Chieti: [42.3510, 14.1675],
  Como: [45.8081, 9.0852],
  Cosenza: [39.2983, 16.2536],
  Cremona: [45.1332, 10.0227],
  Crotone: [39.0808, 17.1271],
  Cuneo: [44.3845, 7.5427],
  Enna: [37.5676, 14.2794],
  Fermo: [43.1606, 13.7181],
  Ferrara: [44.8381, 11.6198],
  Firenze: [43.7696, 11.2558],
  Foggia: [41.4621, 15.5446],
  Forlì: [44.2227, 12.0407],
  Frosinone: [41.6396, 13.3412],
  Genova: [44.4056, 8.9463],
  Gorizia: [45.9413, 13.6215],
  Grosseto: [42.7635, 11.1124],
  Imperia: [43.8897, 8.0395],
  Isernia: [41.5960, 14.2332],
  "L'Aquila": [42.3498, 13.3995],
  "La Spezia": [44.1025, 9.8241],
  Latina: [41.4676, 12.9037],
  Lecce: [40.3515, 18.1750],
  Lecco: [45.8566, 9.3977],
  Livorno: [43.5485, 10.3106],
  Lodi: [45.3138, 9.5037],
  Lucca: [43.8429, 10.5027],
  Macerata: [43.3007, 13.4530],
  Mantova: [45.1564, 10.7914],
  Massa: [44.0354, 10.1393],
  Matera: [40.6663, 16.6043],
  Messina: [38.1938, 15.5540],
  Milano: [45.4642, 9.1900],
  Modena: [44.6471, 10.9252],
  "Monza e Brianza": [45.5845, 9.2744],
  Monza: [45.5845, 9.2744],
  Napoli: [40.8518, 14.2681],
  Novara: [45.4451, 8.6187],
  Nuoro: [40.3202, 9.3264],
  Oristano: [39.9036, 8.5926],
  Padova: [45.4064, 11.8768],
  Palermo: [38.1157, 13.3615],
  Parma: [44.8015, 10.3279],
  Pavia: [45.1847, 9.1582],
  Perugia: [43.1107, 12.3908],
  "Pesaro e Urbino": [43.9102, 12.9133],
  Pescara: [42.4618, 14.2161],
  Piacenza: [45.0526, 9.6930],
  Pisa: [43.7228, 10.4017],
  Pistoia: [43.9335, 10.9177],
  Pordenone: [45.9564, 12.6615],
  Potenza: [40.6404, 15.8056],
  Prato: [43.8777, 11.1022],
  Ragusa: [36.9269, 14.7255],
  Ravenna: [44.4184, 12.2035],
  "Reggio Calabria": [38.1113, 15.6473],
  "Reggio Emilia": [44.6983, 10.6312],
  Rieti: [42.4045, 12.8567],
  Rimini: [44.0678, 12.5695],
  Roma: [41.9028, 12.4964],
  Rovigo: [45.0703, 11.7901],
  Salerno: [40.6824, 14.7681],
  Sassari: [40.7259, 8.5557],
  Savona: [44.3075, 8.4810],
  Siena: [43.3188, 11.3308],
  Siracusa: [37.0755, 15.2866],
  Sondrio: [46.1699, 9.8788],
  Taranto: [40.4644, 17.2470],
  Teramo: [42.6589, 13.7044],
  Terni: [42.5636, 12.6427],
  Torino: [45.0703, 7.6869],
  Trapani: [38.0176, 12.5365],
  Trento: [46.0748, 11.1217],
  Treviso: [45.6669, 12.2430],
  Trieste: [45.6495, 13.7768],
  Udine: [46.0711, 13.2346],
  Varese: [45.8206, 8.8251],
  Venezia: [45.4408, 12.3155],
  "Verbano-Cusio-Ossola": [45.9214, 8.5513],
  Vercelli: [45.3238, 8.4237],
  Verona: [45.4384, 10.9916],
  "Vibo Valentia": [38.6751, 16.1009],
  Vicenza: [45.5455, 11.5354],
  Viterbo: [42.4207, 12.1077],
};

function provinceDistanceKm(a: string, b: string) {
  const first = PROVINCE_CAPITAL_COORDS[a];
  const second = PROVINCE_CAPITAL_COORDS[b];

  if (!first || !second) return null;

  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(second[0] - first[0]);
  const dLon = toRad(second[1] - first[1]);

  const lat1 = toRad(first[0]);
  const lat2 = toRad(second[0]);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

const PARAMETRIC_3D = new Set([
  "solidworks",
  "inventor",
  "ptc creo",
  "creo",
  "catia",
  "solid edge",
  "nx",
  "fusion 360",
]);


function normalize(value: string) {
  return value.trim().toLowerCase();
}

function canonicalCadName(value: string) {
  const normalized = normalize(value)
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const compact = normalized.replace(/\s+/g, "");

  if (
    compact === "fusion" ||
    compact === "fusion360" ||
    compact === "autodeskfusion" ||
    compact === "autodeskfusion360"
  ) {
    return "fusion 360";
  }

  if (compact === "revit" || compact === "autodeskrevit") return "revit";
  if (compact === "blender") return "blender";

  return normalized;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "1", "si", "sì", "yes"].includes(value.trim().toLowerCase());
  }
  return false;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map(asString).filter(Boolean)
    : [];
}

function normalizeGeo(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const CANONICAL_PROVINCES = new Map<string, string>(
  Object.keys(PROVINCE_CAPITAL_COORDS).map((province) => [
    normalizeGeo(province),
    province,
  ])
);

const PROVINCE_ALIASES: Record<string, string> = {
  [normalizeGeo("Forlì-Cesena")]: "Forlì",
  [normalizeGeo("Forli-Cesena")]: "Forlì",
  [normalizeGeo("Massa-Carrara")]: "Massa",
  [normalizeGeo("Pesaro-Urbino")]: "Pesaro e Urbino",
  [normalizeGeo("Verbano Cusio Ossola")]: "Verbano-Cusio-Ossola",
  [normalizeGeo("Barletta Andria Trani")]: "Barletta-Andria-Trani",
  [normalizeGeo("Monza Brianza")]: "Monza e Brianza",
};

const CANONICAL_REGIONS = new Map<string, string>(
  Object.keys(regionAdjacencyMap).map((region) => [normalizeGeo(region), region])
);

function canonicalProvinceName(value: unknown) {
  const raw = asString(value);
  if (!raw) return "";

  const key = normalizeGeo(raw);
  return PROVINCE_ALIASES[key] ?? CANONICAL_PROVINCES.get(key) ?? "";
}

function canonicalRegionName(value: unknown) {
  const raw = asString(value);
  if (!raw) return "";
  return CANONICAL_REGIONS.get(normalizeGeo(raw)) ?? "";
}

function collectArrayValues(raw: RawRecord, keys: string[]) {
  const values: unknown[] = [];

  for (const key of keys) {
    const value = raw[key];
    if (Array.isArray(value)) values.push(...value);
  }

  return values;
}

function containsAllItaly(value: unknown): boolean {
  if (typeof value === "string") {
    return normalizeGeo(value) === normalizeGeo("Tutta Italia");
  }

  if (Array.isArray(value)) {
    return value.some(containsAllItaly);
  }

  if (value && typeof value === "object") {
    return Object.values(value as RawRecord).some(containsAllItaly);
  }

  return false;
}

function normalizeProvinceArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value
      .map((item) => {
        if (typeof item === "string") {
          return canonicalProvinceName(item);
        }

        if (!item || typeof item !== "object") return "";

        const source = item as RawRecord;

        // Prima usiamo esclusivamente campi semanticamente di provincia.
        const explicitProvince = canonicalProvinceName(
          source.province ?? source.provincia
        );
        if (explicitProvince) return explicitProvince;

        // Alcune versioni storiche salvavano il nome in nome/name/label.
        // Il valore viene accettato SOLO se corrisponde realmente a una provincia.
        return canonicalProvinceName(
          source.nome ?? source.name ?? source.label
        );
      })
      .filter(Boolean)
  );
}

function normalizeRegionsFromProvinceEntries(value: unknown) {
  if (!Array.isArray(value)) return [];

  return uniqueStrings(
    value
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const source = item as RawRecord;
        return canonicalRegionName(source.region ?? source.regione);
      })
      .filter(Boolean)
  );
}

function getFirst(raw: RawRecord, keys: string[]) {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeCadArray(value: unknown): RatedCad[] {
  if (!Array.isArray(value)) return [];

  const mapped = value
    .map((item) => {
      if (typeof item === "string") {
        const nome = item.trim();
        return nome ? { nome, livello: 5 } : null;
      }

      if (!item || typeof item !== "object") return null;
      const source = item as RawRecord;
      const nome = asString(source.nome ?? source.name ?? source.label ?? source.software ?? source.cad);
      const livelloRaw = source.livello ?? source.level ?? source.rating ?? source.valore ?? 5;
      const livello = typeof livelloRaw === "number" ? livelloRaw : Number(livelloRaw);

      if (!nome) return null;
      return {
        nome,
        livello: Number.isFinite(livello) ? Math.max(1, Math.min(5, livello)) : 5,
      };
    })
    .filter((item): item is RatedCad => Boolean(item));

  const deduped = new Map<string, RatedCad>();
  for (const item of mapped) {
    const key = normalize(item.nome);
    const current = deduped.get(key);
    if (!current || item.livello > current.livello) deduped.set(key, item);
  }
  return [...deduped.values()];
}

function normalizeCandidateCadArray(value: unknown): CandidateCadSkill[] {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const source = item as RawRecord;
      const name = asString(
        source.name ??
          source.nome ??
          source.label ??
          source.software ??
          source.cad
      );

      const rawRating =
        source.rating ??
        source.livello ??
        source.level ??
        source.valore ??
        0;

      const rating =
        typeof rawRating === "number" ? rawRating : Number(rawRating);

      // rating 0 = software NON selezionato.
      if (!name || !Number.isFinite(rating) || rating <= 0) return null;

      return {
        name,
        rating: Math.min(5, rating),
      };
    })
    .filter(
      (item): item is CandidateCadSkill => Boolean(item)
    );

  const deduped = new Map<string, CandidateCadSkill>();

  for (const skill of normalized) {
    const key = normalize(skill.name);
    const current = deduped.get(key);

    if (!current || skill.rating > current.rating) {
      deduped.set(key, skill);
    }
  }

  return [...deduped.values()];
}

function normalizeRequestType(value: unknown): CollaborationType {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("freelance") || normalized.includes("partita iva")) return "Freelancer";
  if (normalized.includes("part-time") || normalized.includes("part time")) return "Part-time";
  return "Full time";
}

function normalizeRequestExperience(value: unknown): ExperienceLevel {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("responsabile") || normalized.includes("resp.")) {
    return "Resp. ufficio tecnico";
  }
  if (normalized.includes("senior")) return "Senior";
  if (normalized.includes("middle")) return "Middle";
  return "Junior";
}

function normalizeCandidateCollaboration(value: unknown): CandidateCollaboration {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("freelance") || normalized.includes("partita iva")) {
    return "Freelancer partita IVA";
  }
  if (normalized.includes("part-time") || normalized.includes("part time")) {
    return "Dipendente part-time";
  }
  return "Dipendente full time";
}

function normalizeCandidateExperience(value: unknown): CandidateExperience {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("10+")) return "10+ anni";
  if (normalized.includes("6-10")) return "6-10 anni";
  if (normalized.includes("3-5")) return "3-5 anni";
  return "0-2 anni";
}

function normalizeBudgetLabel(value: unknown) {
  const raw = asString(value);
  const aliases: Record<string, string> = {
    "60.000+ €": "> 60.000 €",
    "50+ €/h": "> 50 €/h",
  };
  return aliases[raw] ?? raw;
}

function mapRequestFromApi(raw: RawRecord): CompanyRequest {
  // Fonte unica e canonica dei settori richiesti al progettista.
  // NON usare altrosettore: quel campo appartiene al settore dell'azienda.
  const requestedSectors = uniqueStrings(
    asStringArray(
      getFirst(raw, ["experience_sectors", "experienceSectors"])
    )
  );

  const companyOtherSector = asString(
    getFirst(raw, ["altrosettore", "altroSettore", "altro_settore"])
  );

  return {
    id: Number(getFirst(raw, ["id"]) ?? 0),
    codice: asString(getFirst(raw, ["codice"])) || "RQ-000",
    azienda: asString(getFirst(raw, ["azienda", "companyName", "company_name"])),
    referente: asString(getFirst(raw, ["referente", "contactName", "contact_name"])),
    email: asString(getFirst(raw, ["email", "contactEmail", "contact_email"])),
    telefono: asString(getFirst(raw, ["telefono", "contactPhone", "contact_phone"])),
    linkedin: asString(getFirst(raw, ["linkedin"])) || undefined,
    dataRichiesta: asString(getFirst(raw, ["datarichiesta", "dataRichiesta", "created_at"])),
    jobTitle: asString(getFirst(raw, ["jobtitle", "jobTitle", "job_title"])),
    tipologia: normalizeRequestType(getFirst(raw, ["tipologia", "employmentType"])),
    budgetRange: normalizeBudgetLabel(getFirst(raw, ["budgetrange", "budgetRange", "budget_range"])),
    esperienza: normalizeRequestExperience(getFirst(raw, ["esperienza", "experienceLevel"])),
    regione:
      canonicalRegionName(
        getFirst(raw, ["regione", "selectedRegion", "selected_region"])
      ) ||
      asString(getFirst(raw, ["regione", "selectedRegion", "selected_region"])),
    provincia:
      canonicalProvinceName(
        getFirst(raw, ["provincia", "selectedProvince", "selected_province"])
      ) ||
      asString(getFirst(raw, ["provincia", "selectedProvince", "selected_province"])),
    isRemote: ["is_remote", "isRemote", "isremote"].some((key) =>
      asBoolean(raw[key])
    ),
    zonaOperativa: asString(getFirst(raw, ["zonaoperativa", "zonaOperativa", "zona_operativa"])),
    settorePrincipale: asString(getFirst(raw, ["settoreprincipale", "settorePrincipale", "settore_principale"])),
    altroSettore: companyOtherSector || undefined,
    experienceSectors: requestedSectors,
    cadRichiesti: normalizeCadArray(getFirst(raw, ["cadrichiesti", "cadRichiesti", "cad_richiesti"])),
    altroCad: normalizeCadArray(getFirst(raw, ["altrocad", "altroCad", "altro_cad"])),
    jobDescription: asString(getFirst(raw, ["jobdescription", "jobDescription", "job_description"])),
    note: asString(getFirst(raw, ["note"])) || undefined,
    archived: asBoolean(getFirst(raw, ["archived"])),
  };
}

function mapDesignerFromApi(raw: RawRecord): CandidateProfile {
  const provinceEntries = collectArrayValues(raw, [
    "selected_province_entries",
    "selectedProvinceEntries",
    "selectedProvinces",
    "selected_provinces",
    "province",
    "province_entries",
  ]);

  const parsedProvinces = normalizeProvinceArray(provinceEntries);
  const regionsFromProvinceEntries =
    normalizeRegionsFromProvinceEntries(provinceEntries);

  const directRegions = collectArrayValues(raw, ["regioni", "regions"])
    .map(canonicalRegionName)
    .filter(Boolean);

  const selectedRegion = canonicalRegionName(
    getFirst(raw, ["selected_region", "selectedRegion", "regione"])
  );

  const legacyAllItaly =
    asBoolean(getFirst(raw, ["is_all_italy", "isAllItaly"])) ||
    containsAllItaly(getFirst(raw, ["selected_region", "selectedRegion", "regione"])) ||
    containsAllItaly(provinceEntries) ||
    containsAllItaly(getFirst(raw, ["regioni", "regions"]));

  return {
    id: asString(getFirst(raw, ["user_id", "id"])),
    nome: asString(getFirst(raw, ["first_name", "firstName", "nome"])),
    cognome: asString(getFirst(raw, ["last_name", "lastName", "cognome"])),
    birthDate: asString(getFirst(raw, ["birth_date", "birthDate", "dataNascita"])),
    email: asString(getFirst(raw, ["email"])),
    telefono: asString(getFirst(raw, ["whatsapp", "telefono"])),
    linkedin: asString(getFirst(raw, ["linkedin"])) || undefined,
    studyTitle: asString(getFirst(raw, ["study_title", "studyTitle", "titoloStudio"])) || undefined,
    studyTitleOther: asString(getFirst(raw, ["study_title_other", "studyTitleOther", "titoloStudioAltro"])) || undefined,
    regioni: uniqueStrings([
      selectedRegion,
      ...regionsFromProvinceEntries,
      ...directRegions,
    ].filter(Boolean)),
    province: parsedProvinces,
    isRemote: asBoolean(getFirst(raw, ["is_remote", "isRemote"])),
    isAllItaly: legacyAllItaly,
    sectors: uniqueStrings(asStringArray(getFirst(raw, ["sectors", "settori"]))),
    otherSector: asString(getFirst(raw, ["sector_other", "sectorOther", "altroSettore"])) || undefined,
    collaborationType: normalizeCandidateCollaboration(getFirst(raw, ["collaboration_type", "collaborationType", "tipologia"])),
    experience: normalizeCandidateExperience(getFirst(raw, ["experience", "esperienza"])),
    budgetRange: normalizeBudgetLabel(getFirst(raw, ["budget_range", "budgetRange"])),
    cadSkills: normalizeCandidateCadArray(getFirst(raw, ["cad_skills", "cadSkills", "cadPrincipali"])),
    customCadSkills: normalizeCandidateCadArray(getFirst(raw, ["custom_cad_skills", "customCadSkills", "altroCad"])),
    profileStatus: asString(getFirst(raw, ["profile_status", "profileStatus"])) || "In attesa",
    isSearchActive: (() => {
      const rawValue = getFirst(raw, ["is_search_active", "isSearchActive"]);
      return rawValue === undefined ? true : asBoolean(rawValue);
    })(),
  };
}

function sortRequestsByCodeDesc(requests: CompanyRequest[]) {
  return [...requests].sort((a, b) => {
    const aNumber = Number(a.codice.replace(/\D/g, ""));
    const bNumber = Number(b.codice.replace(/\D/g, ""));
    return bNumber - aNumber;
  });
}

function getNearestProvinceDistance(
  requestProvince: string,
  candidate: CandidateProfile
) {
  const candidateProvinces = candidate.province.filter(Boolean);
  if (!requestProvince || candidateProvinces.length === 0) return null;

  const distances = candidateProvinces
    .map((province) => ({
      province,
      distance: provinceDistanceKm(requestProvince, province),
    }))
    .filter(
      (item): item is { province: string; distance: number } =>
        item.distance !== null
    );

  if (distances.length === 0) return null;

  return distances.reduce((best, item) =>
    item.distance < best.distance ? item : best
  );
}

function calculateProvinceDistanceScore(
  distanceKm: number,
  requestType: CollaborationType
) {
  /*
   * Rating geografico basato SOLO sulla distanza tra province,
   * senza alcuna distinzione di regione.
   *
   * FREELANCER:
   * 0 km / stessa provincia   = 30/30
   * fino a 80 km              = 25/30
   * oltre 80 e fino a 150 km  = 10/30
   * oltre 150 km              = 0/30
   *
   * DIPENDENTI (Full time / Part-time):
   * 0 km / stessa provincia   = 30/30
   * fino a 80 km              = 25/30
   * oltre 80 km               = 0/30
   */
  if (distanceKm <= 0) return 30;
  if (distanceKm <= 80) return 25;

  if (requestType === "Freelancer" && distanceKm <= 150) return 10;

  return 0;
}

function calculateLocationScore(request: CompanyRequest, candidate: CandidateProfile) {
  // La disponibilità legacy "Tutta Italia" resta un valore intermedio.
  if (candidate.isAllItaly) return 15;

  const requestProvince = canonicalProvinceName(request.provincia);
  const requestRegion = canonicalRegionName(request.regione);

  const hasExactProvince =
    Boolean(requestProvince) &&
    candidate.province.some(
      (province) => normalizeGeo(province) === normalizeGeo(requestProvince)
    );

  /*
   * REMOTE + ZONA:
   * - stessa provincia + Remote = 30/30
   * - provincia diversa fino a 80 km + Remote = 25/30
   * - provincia diversa 81-150 km + Remote = 15/30
   * - provincia diversa oltre 150 km + Remote = 10/30
   * - solo Remote, senza una provincia del progettista confrontabile = 10/30
   * - richiesta esclusivamente Remote, senza provincia/regione = 30/30
   */
  if (request.isRemote && requestProvince && candidate.isRemote) {
    if (hasExactProvince) return 30;

    const nearest = getNearestProvinceDistance(requestProvince, candidate);
    if (!nearest) return 10;
    if (nearest.distance <= 80) return 25;
    if (nearest.distance <= 150) return 15;
    return 10;
  }

  if (request.isRemote && !requestProvince && !requestRegion && candidate.isRemote) {
    return 30;
  }

  if (hasExactProvince) return 30;

  // Da qui in poi il punteggio geografico ignora completamente le regioni
  // e considera esclusivamente la distanza dalla provincia richiesta.
  if (requestProvince) {
    const nearest = getNearestProvinceDistance(requestProvince, candidate);
    if (nearest) {
      return calculateProvinceDistanceScore(
        nearest.distance,
        request.tipologia
      );
    }
  }

  // Fallback solo per record legacy senza provincia disponibile.
  if (!requestProvince && requestRegion) {
    const sameRegion = candidate.regioni.some(
      (region) => normalizeGeo(region) === normalizeGeo(requestRegion)
    );
    if (sameRegion) return 17;
  }

  // La sola disponibilità Remote non sostituisce una compatibilità territoriale
  // quando l'azienda non ha richiesto Remote.
  if (!request.isRemote && candidate.isRemote) return 4;

  return 0;
}

function calculateExperienceScore(
  request: CompanyRequest,
  candidate: CandidateProfile
) {
  /*
   * Matrice esperienza (max 20 punti).
   * Il punteggio dipende direttamente dalla combinazione tra il livello
   * richiesto dall'azienda e gli anni di esperienza del progettista.
   *
   *                         0-2   3-5   6-10   10+
   * Junior                  20    15     5      0
   * Middle                   5    12    20     12
   * Senior                   0     5    15     20
   * Resp. ufficio tecnico    0     0    10     20
   */
  const experienceMatrix: Record<
    ExperienceLevel,
    Record<CandidateExperience, number>
  > = {
    Junior: {
      "0-2 anni": 20,
      "3-5 anni": 15,
      "6-10 anni": 5,
      "10+ anni": 0,
    },
    Middle: {
      "0-2 anni": 5,
      "3-5 anni": 12,
      "6-10 anni": 20,
      "10+ anni": 12,
    },
    Senior: {
      "0-2 anni": 0,
      "3-5 anni": 5,
      "6-10 anni": 15,
      "10+ anni": 20,
    },
    "Resp. ufficio tecnico": {
      "0-2 anni": 0,
      "3-5 anni": 0,
      "6-10 anni": 10,
      "10+ anni": 20,
    },
  };

  return experienceMatrix[request.esperienza]?.[candidate.experience] ?? 0;
}

function isCollaborationCompatible(
  request: CompanyRequest,
  candidate: CandidateProfile
) {
  const requestIsFreelancer = request.tipologia === "Freelancer";
  const candidateIsFreelancer =
    candidate.collaborationType === "Freelancer partita IVA";

  // Freelancer e dipendenti appartengono a due bacini distinti.
  // Il profilo non entra proprio nel matching se la tipologia non coincide.
  return requestIsFreelancer === candidateIsFreelancer;
}

function calculateAvailabilityPenalty(
  request: CompanyRequest,
  candidate: CandidateProfile
) {
  // Per i freelancer non applichiamo alcuna penalità full-time / part-time.
  if (request.tipologia === "Freelancer") return 0;

  const isFullPartMismatch =
    (request.tipologia === "Full time" &&
      candidate.collaborationType === "Dipendente part-time") ||
    (request.tipologia === "Part-time" &&
      candidate.collaborationType === "Dipendente full time");

  return isFullPartMismatch ? -5 : 0;
}

function calculateSectorScore(
  request: CompanyRequest,
  candidate: CandidateProfile
) {
  const requested = uniqueStrings(request.experienceSectors);

  const candidateSectors = uniqueStrings([
    ...candidate.sectors,
    ...(candidate.otherSector ? [candidate.otherSector] : []),
  ]);

  if (requested.length === 0 || candidateSectors.length === 0) return 0;

  const requestedNormalized = requested.map(normalize);
  const candidateNormalized = candidateSectors.map(normalize);

  const matchedCount = requestedNormalized.filter((sector) =>
    candidateNormalized.includes(sector)
  ).length;

  // Tutti i settori richiesti presenti: compatibilità piena.
  // Se l'azienda richiede un solo settore e il progettista lo possiede, vale 15/15.
  if (matchedCount === requestedNormalized.length) return 15;

  // Richiesta multisettore: premiamo il numero di esperienze pertinenti.
  if (matchedCount >= 2) return 12;
  if (matchedCount === 1) return 10;

  // Nessuna corrispondenza diretta: valorizziamo solo la trasversalità.
  if (candidateSectors.length >= 3) return 7;
  if (candidateSectors.length === 2) return 5;

  return 0;
}

function isParametric3d(name: string) {
  return PARAMETRIC_3D.has(canonicalCadName(name));
}

function exactSoftwareScore(rating: number) {
  if (rating >= 5) return 20;
  if (rating >= 4) return 17;
  if (rating >= 3) return 13;
  if (rating >= 2) return 8;
  if (rating >= 1) return 4;
  return 0;
}

function alternativeParametricScore(rating: number) {
  if (rating >= 5) return 16;
  if (rating >= 4) return 13;
  if (rating >= 3) return 7;
  if (rating >= 2) return 4;
  if (rating >= 1) return 1;
  return 0;
}


type CadComparison = {
  required: RatedCad;
  matchedSkill: CandidateCadSkill | null;
  relation: "Esatto" | "Altro parametrico" | "Nessuna competenza";
  score: number;
};

function getBestCadComparison(
  required: RatedCad,
  candidateSkills: CandidateCadSkill[]
): CadComparison {
  const validSkills = candidateSkills.filter((skill) => skill.rating > 0);

  if (validSkills.length === 0) {
    return {
      required,
      matchedSkill: null,
      relation: "Nessuna competenza",
      score: 0,
    };
  }

  const requiredName = canonicalCadName(required.nome);

  /*
   * Prima scegliamo SEMPRE il software esatto.
   * Gli alias storici di Fusion 360 vengono ricondotti allo stesso nome.
   * Se esistono più occorrenze equivalenti, usiamo quella col rating migliore.
   */
  const exactSkills = validSkills.filter(
    (skill) => canonicalCadName(skill.name) === requiredName
  );

  if (exactSkills.length > 0) {
    const bestExact = exactSkills.reduce((best, skill) =>
      skill.rating > best.rating ? skill : best
    );

    return {
      required,
      matchedSkill: bestExact,
      relation: "Esatto",
      score: exactSoftwareScore(
        Math.max(0, Math.min(5, bestExact.rating))
      ),
    };
  }

  /*
   * Solo se il software RICHIESTO è parametrico accettiamo un altro
   * CAD parametrico come competenza trasferibile.
   */
  if (isParametric3d(required.nome)) {
    const parametricSkills = validSkills.filter((skill) =>
      isParametric3d(skill.name)
    );

    if (parametricSkills.length > 0) {
      const bestParametric = parametricSkills.reduce((best, skill) => {
        const score = alternativeParametricScore(
          Math.max(0, Math.min(5, skill.rating))
        );
        return score > best.score ? { skill, score } : best;
      }, { skill: parametricSkills[0], score: -1 });

      return {
        required,
        matchedSkill: bestParametric.skill,
        relation: "Altro parametrico",
        score: bestParametric.score,
      };
    }
  }

  /*
   * AutoCAD, Modeling, Blender, Revit e gli altri software specifici
   * non sono intercambiabili: senza corrispondenza esatta valgono 0.
   */
  return {
    required,
    matchedSkill: null,
    relation: "Nessuna competenza",
    score: 0,
  };
}

function scoreSingleRequiredCad(
  required: RatedCad,
  candidateSkills: CandidateCadSkill[]
) {
  return getBestCadComparison(required, candidateSkills).score;
}

function calculateCadScore(
  request: CompanyRequest,
  candidate: CandidateProfile
) {
  const required = [
    ...request.cadRichiesti,
    ...(request.altroCad ?? []),
  ];

  if (required.length === 0) return 0;

  const candidateSkills = [
    ...candidate.cadSkills,
    ...candidate.customCadSkills,
  ];

  const averageScore =
    required.reduce(
      (sum, requiredCad) =>
        sum + scoreSingleRequiredCad(requiredCad, candidateSkills),
      0
    ) / required.length;

  return Math.round(averageScore);
}

const ANNUAL_BUDGET_BANDS = [
  "18.000 - 24.000 €",
  "24.000 - 30.000 €",
  "30.000 - 40.000 €",
  "40.000 - 50.000 €",
  "50.000 - 60.000 €",
  "> 60.000 €",
] as const;

const HOURLY_BUDGET_BANDS = [
  "15 - 20 €/h",
  "20 - 30 €/h",
  "30 - 40 €/h",
  "40 - 50 €/h",
  "> 50 €/h",
] as const;

function canonicalBudgetBandLabel(value: string) {
  const normalized = normalizeBudgetLabel(value);

  const aliases: Record<string, string> = {
    "60.000 €+": "> 60.000 €",
    "60.000+ €": "> 60.000 €",
    "50 €/h+": "> 50 €/h",
    "50+ €/h": "> 50 €/h",
  };

  return aliases[normalized] ?? normalized;
}

function getBudgetBandIndex(
  value: string,
  requestType: CollaborationType
) {
  const label = canonicalBudgetBandLabel(value);
  const bands =
    requestType === "Freelancer"
      ? HOURLY_BUDGET_BANDS
      : ANNUAL_BUDGET_BANDS;

  return bands.findIndex((band) => band === label);
}

function calculateBudgetScore(
  request: CompanyRequest,
  candidate: CandidateProfile
) {
  const requestedIndex = getBudgetBandIndex(
    request.budgetRange,
    request.tipologia
  );
  const expectedIndex = getBudgetBandIndex(
    candidate.budgetRange,
    request.tipologia
  );

  if (requestedIndex < 0 || expectedIndex < 0) return 0;

  if (expectedIndex === requestedIndex) return 15;

  // Il progettista richiede meno della disponibilità economica aziendale.
  if (expectedIndex < requestedIndex) return 10;

  // Il progettista richiede una fascia in più rispetto al budget aziendale.
  if (expectedIndex === requestedIndex + 1) return 8;

  // Il progettista richiede almeno due fasce in più: incompatibile.
  return 0;
}

function calculateMatch(
  request: CompanyRequest,
  candidate: CandidateProfile
): MatchBreakdown {
  const regionScore = calculateLocationScore(request, candidate);
  const sectorScore = calculateSectorScore(request, candidate);
  const seniorityScore = calculateExperienceScore(request, candidate);
  const softwareScore = calculateCadScore(request, candidate);
  const budgetScore = calculateBudgetScore(request, candidate);
  const availabilityPenalty = calculateAvailabilityPenalty(request, candidate);

  const totalScore = Math.max(
    0,
    regionScore +
      sectorScore +
      seniorityScore +
      softwareScore +
      budgetScore +
      availabilityPenalty
  );

  return {
    regionScore,
    sectorScore,
    seniorityScore,
    softwareScore,
    budgetScore,
    availabilityPenalty,
    totalScore,
    percentage: totalScore
  };
}

function getTopMatches(
  request: CompanyRequest,
  candidates: CandidateProfile[]
): MatchResult[] {
  return candidates
    // Un progettista disattivato non deve comparire in alcun matching.
    .filter((candidate) => candidate.isSearchActive)
    // I profili legacy con "Tutta Italia" restano esclusi dal matching finché
    // il progettista non aggiorna la propria disponibilità geografica.
    .filter((candidate) => !candidate.isAllItaly)
    .filter((candidate) => isCollaborationCompatible(request, candidate))
    .map((candidate) => ({
      candidate,
      breakdown: calculateMatch(request, candidate),
    }))
    // Budget 0/15 = candidato escluso automaticamente dal matching.
    .filter((item) => item.breakdown.budgetScore > 0)
    .filter((item) => item.breakdown.percentage >= 80)
    .sort((a, b) => {
      if (b.breakdown.totalScore !== a.breakdown.totalScore) {
        return b.breakdown.totalScore - a.breakdown.totalScore;
      }
      if (b.breakdown.regionScore !== a.breakdown.regionScore) {
        return b.breakdown.regionScore - a.breakdown.regionScore;
      }
      if (b.breakdown.sectorScore !== a.breakdown.sectorScore) {
        return b.breakdown.sectorScore - a.breakdown.sectorScore;
      }
      if (b.breakdown.softwareScore !== a.breakdown.softwareScore) {
        return b.breakdown.softwareScore - a.breakdown.softwareScore;
      }
      return b.breakdown.seniorityScore - a.breakdown.seniorityScore;
    });
}

function formatCandidateContract(type: CandidateCollaboration) {
  if (type === "Freelancer partita IVA") return "Freelancer";
  if (type === "Dipendente part-time") return "Part-time";
  return "Full time";
}

function formatCandidateZones(candidate: CandidateProfile) {
  if (candidate.isAllItaly) {
    return candidate.isRemote ? "Tutta Italia, Remote" : "Tutta Italia";
  }
  const geographicZones = candidate.province.length > 0
    ? uniqueStrings(candidate.province)
    : uniqueStrings(candidate.regioni);
  const zones = [...geographicZones];
  if (candidate.isRemote) zones.push("Remote");
  return zones.length > 0 ? uniqueStrings(zones).join(", ") : "Non indicata";
}

function formatBirthDate(value: string) {
  if (!value) return "Data non indicata";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}-${month}-${year}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
    .format(parsed).replaceAll("/", "-");
}

function formatCadList(skills: CandidateCadSkill[]) {
  return skills.length > 0 ? skills.map((skill) => `${skill.name} ${skill.rating}/5`).join(", ") : "Non indicato";
}

function formatRequiredCadList(skills: RatedCad[]) {
  return skills.length > 0 ? skills.map((skill) => `${skill.nome} ${skill.livello}/5`).join(", ") : "Non indicato";
}

function formatList(values: string[]) {
  const unique = uniqueStrings(values);
  return unique.length > 0 ? unique.join(", ") : "Non indicato";
}

function candidateExperienceClass(value: CandidateExperience) {
  if (value === "0-2 anni" || value === "3-5 anni") return "Junior";
  if (value === "6-10 anni") return "Middle";
  return "Senior";
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "soft" | "success";
}) {
  const classes =
    tone === "primary"
      ? "border border-teal-700 bg-teal-700 text-white"
      : tone === "soft"
      ? "border border-teal-200 bg-teal-50 text-teal-800"
      : tone === "success"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border border-neutral-200 bg-neutral-100 text-neutral-700";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium leading-none ${classes}`}
    >
      {children}
    </span>
  );
}

function ScoreCard({
  label,
  score,
  max,
  onClick,
}: {
  label: string;
  score: number;
  max: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-center transition hover:border-teal-300 hover:bg-teal-50/40 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
      title={`Confronta ${label}`}
    >
      <div className="flex min-h-[36px] flex-col items-center justify-center">
        <p className="w-full truncate whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
          {label}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-sm font-bold leading-none text-neutral-900">
          {score}/{max}
        </p>
      </div>
    </button>
  );
}

type ComparisonKey =
  | "Zona"
  | "Settori"
  | "Esperienza"
  | "CAD"
  | "Budget";

type ComparisonState = {
  key: ComparisonKey;
  request: CompanyRequest;
  match: MatchResult;
} | null;

type ComparisonRow = {
  label: string;
  company: string;
  designer: string;
};

type ComparisonDetails = {
  summary: string;
  rows: ComparisonRow[];
};

function getLocationComparison(
  request: CompanyRequest,
  candidate: CandidateProfile
): ComparisonDetails {
  const score = calculateLocationScore(request, candidate);
  const requestProvince = canonicalProvinceName(request.provincia);
  const requestRegion = canonicalRegionName(request.regione);

  const exactProvince =
    Boolean(requestProvince) &&
    candidate.province.some(
      (province) => normalizeGeo(province) === normalizeGeo(requestProvince)
    );

  const companyZone = [
    requestProvince || requestRegion || "",
    request.isRemote ? "Remote" : "",
  ]
    .filter(Boolean)
    .join(" + ") || "Non indicata";

  const designerZone = formatCandidateZones(candidate);

  if (candidate.isAllItaly) {
    return {
      summary: `Copertura territoriale: Tutta Italia · ${score}/30`,
      rows: [
        {
          label: "Zona",
          company: companyZone,
          designer: designerZone,
        },
        {
          label: "Punteggio zona",
          company: "—",
          designer: `${score}/30`,
        },
      ],
    };
  }

  if (request.isRemote && requestProvince && candidate.isRemote) {
    const nearest = getNearestProvinceDistance(requestProvince, candidate);
    return {
      summary: exactProvince
        ? `${requestProvince} + Remote compatibili · 30/30`
        : nearest
        ? `Remote compatibile · ${requestProvince} ↔ ${nearest.province} · ${Math.round(
            nearest.distance
          )} km · ${score}/30`
        : `Solo Remote, provincia non disponibile · ${score}/30`,
      rows: [
        {
          label: "Zona",
          company: companyZone,
          designer: designerZone,
        },
        ...(nearest && !exactProvince
          ? [
              {
                label: "Distanza",
                company: "—",
                designer: `${Math.round(nearest.distance)} km`,
              },
            ]
          : []),
        {
          label: "Punteggio zona",
          company: "—",
          designer: `${score}/30`,
        },
      ],
    };
  }

  if (
    request.isRemote &&
    !requestProvince &&
    !requestRegion &&
    candidate.isRemote
  ) {
    return {
      summary: "Remote compatibile · 30/30",
      rows: [
        {
          label: "Zona",
          company: companyZone,
          designer: designerZone,
        },
        {
          label: "Punteggio zona",
          company: "—",
          designer: "30/30",
        },
      ],
    };
  }

  if (exactProvince) {
    return {
      summary: `${requestProvince} = ${requestProvince} · 30/30`,
      rows: [
        {
          label: "Zona",
          company: companyZone,
          designer: designerZone,
        },
        {
          label: "Punteggio zona",
          company: "—",
          designer: "30/30",
        },
      ],
    };
  }

  if (requestProvince) {
    const nearest = getNearestProvinceDistance(requestProvince, candidate);

    if (nearest) {
      return {
        summary: `${requestProvince} ↔ ${nearest.province} · ${Math.round(
          nearest.distance
        )} km · ${score}/30`,
        rows: [
          {
            label: "Provincia azienda",
            company: requestProvince,
            designer: "—",
          },
          {
            label: "Provincia progettista",
            company: "—",
            designer: nearest.province,
          },
          {
            label: "Distanza",
            company: "—",
            designer: `${Math.round(nearest.distance)} km`,
          },
          {
            label: "Punteggio zona",
            company: "—",
            designer: `${score}/30`,
          },
        ],
      };
    }
  }

  if (!requestProvince && requestRegion) {
    return {
      summary: `Provincia non disponibile · fallback territoriale · ${score}/30`,
      rows: [
        {
          label: "Zona",
          company: companyZone,
          designer: designerZone,
        },
        {
          label: "Punteggio zona",
          company: "—",
          designer: `${score}/30`,
        },
      ],
    };
  }

  if (!request.isRemote && candidate.isRemote) {
    return {
      summary: `Disponibilità Remote senza corrispondenza geografica · ${score}/30`,
      rows: [
        {
          label: "Zona",
          company: companyZone,
          designer: designerZone,
        },
        {
          label: "Punteggio zona",
          company: "—",
          designer: `${score}/30`,
        },
      ],
    };
  }

  return {
    summary: `Nessuna corrispondenza territoriale · ${score}/30`,
    rows: [
      {
        label: "Zona",
        company: companyZone,
        designer: designerZone,
      },
      {
        label: "Punteggio zona",
        company: "—",
        designer: `${score}/30`,
      },
    ],
  };
}

function getSectorComparison(
  request: CompanyRequest,
  candidate: CandidateProfile
): ComparisonDetails {
  const requested = uniqueStrings(request.experienceSectors);
  const candidateSectors = uniqueStrings([
    ...candidate.sectors,
    ...(candidate.otherSector ? [candidate.otherSector] : []),
  ]);

  const normalizedCandidate = candidateSectors.map(normalize);
  const matched = requested.filter((sector) =>
    normalizedCandidate.includes(normalize(sector))
  );

  let summary = "";
  if (matched.length > 0) {
    summary = `${matched.length}/${requested.length} settori richiesti`;
  } else if (candidateSectors.length >= 3) {
    summary = "0 coincidenti · esperienza in 3+ settori";
  } else if (candidateSectors.length >= 2) {
    summary = "0 coincidenti · esperienza in 2 settori";
  } else {
    summary = "0 settori coincidenti";
  }

  return {
    summary,
    rows: [
      {
        label: "Settori richiesti",
        company: formatList(requested),
        designer: "—",
      },
      {
        label: "Settori progettista",
        company: "—",
        designer: formatList(candidateSectors),
      },
      {
        label: "Corrispondenze dirette",
        company: formatList(matched),
        designer: formatList(matched),
      },
    ],
  };
}

function getExperienceComparison(
  request: CompanyRequest,
  candidate: CandidateProfile
): ComparisonDetails {
  const requestClass =
    request.esperienza === "Resp. ufficio tecnico"
      ? "Senior / Responsabile"
      : request.esperienza;

  const designerClass = candidateExperienceClass(candidate.experience);

  return {
    summary: `${requestClass} ↔ ${designerClass}`,
    rows: [
      {
        label: "Classe",
        company: requestClass,
        designer: designerClass,
      },
      {
        label: "Esperienza dichiarata",
        company: request.esperienza,
        designer: candidate.experience,
      },
    ],
  };
}

function getCadComparisons(
  request: CompanyRequest,
  candidate: CandidateProfile
): ComparisonDetails {
  const required = [
    ...request.cadRichiesti,
    ...(request.altroCad ?? []),
  ];

  const candidateSkills = [
    ...candidate.cadSkills,
    ...candidate.customCadSkills,
  ];

  const comparisons = required.map((requiredCad) =>
    getBestCadComparison(requiredCad, candidateSkills)
  );

  const summary =
    comparisons.length === 1
      ? comparisons[0].matchedSkill
        ? `${comparisons[0].required.nome} ↔ ${comparisons[0].matchedSkill.name}`
        : `${comparisons[0].required.nome} ↔ nessuna competenza`
      : `${comparisons.length} software richiesti · media punteggi`;

  return {
    summary,
    rows:
      comparisons.length > 0
        ? comparisons.map((item) => ({
            label: item.required.nome,
            company: `${item.required.nome} ${item.required.livello}/5`,
            designer: item.matchedSkill
              ? `${item.matchedSkill.name} ${item.matchedSkill.rating}/5 · ${item.relation} · ${item.score}/20`
              : `Nessuna competenza · 0/20`,
          }))
        : [
            {
              label: "Software",
              company: "Non indicato",
              designer: formatCadList(candidateSkills),
            },
          ],
  };
}

function getBudgetComparison(
  request: CompanyRequest,
  candidate: CandidateProfile
): ComparisonDetails {
  const requestedIndex = getBudgetBandIndex(
    request.budgetRange,
    request.tipologia
  );
  const expectedIndex = getBudgetBandIndex(
    candidate.budgetRange,
    request.tipologia
  );

  let relation = "Fascia non interpretabile";

  if (requestedIndex >= 0 && expectedIndex >= 0) {
    const bandDifference = Math.abs(requestedIndex - expectedIndex);

    if (bandDifference === 0) {
      relation = "Stessa fascia · 15/15";
    } else if (bandDifference === 1) {
      relation = "1 fascia di differenza · 8/15";
    } else {
      relation = "2 o più fasce di differenza · 0/15";
    }
  }

  return {
    summary: relation,
    rows: [
      {
        label: "Fascia budget",
        company: request.budgetRange || "Non indicato",
        designer: candidate.budgetRange || "Non indicato",
      },
      {
        label: "Confronto",
        company: relation,
        designer: relation,
      },
    ],
  };
}

function getComparisonDetails(
  key: ComparisonKey,
  request: CompanyRequest,
  candidate: CandidateProfile
): ComparisonDetails {
  switch (key) {
    case "Zona":
      return getLocationComparison(request, candidate);
    case "Settori":
      return getSectorComparison(request, candidate);
    case "Esperienza":
      return getExperienceComparison(request, candidate);
    case "CAD":
      return getCadComparisons(request, candidate);
    case "Budget":
      return getBudgetComparison(request, candidate);
  }
}


function getSimpleComparisonValues(
  key: ComparisonKey,
  request: CompanyRequest,
  candidate: CandidateProfile
): { company: string; designer: string } {
  switch (key) {
    case "Zona":
      return {
        company: [
          canonicalProvinceName(request.provincia) ||
            canonicalRegionName(request.regione) ||
            "",
          request.isRemote ? "Remote" : "",
        ]
          .filter(Boolean)
          .join(" + ") || "Non indicata",
        designer: formatCandidateZones(candidate),
      };

    case "Settori":
      return {
        company:
          request.experienceSectors.length > 0
            ? request.experienceSectors.join(", ")
            : "Non indicati",
        designer:
          uniqueStrings([
            ...candidate.sectors,
            ...(candidate.otherSector ? [candidate.otherSector] : []),
          ]).join(", ") || "Non indicati",
      };

    case "Esperienza":
      return {
        company: request.esperienza || "Non indicata",
        designer: candidate.experience || "Non indicata",
      };

    case "CAD": {
      const requestedCad = [
        ...request.cadRichiesti,
        ...(request.altroCad ?? []),
      ];

      const designerCad = [
        ...candidate.cadSkills,
        ...candidate.customCadSkills,
      ].filter((skill) => skill.rating > 0);

      return {
        company:
          requestedCad.length > 0
            ? uniqueStrings(requestedCad.map((skill) => skill.nome)).join(", ")
            : "Non indicati",
        designer:
          designerCad.length > 0
            ? designerCad
                .map((skill) => `${skill.name} ${skill.rating}/5`)
                .join(", ")
            : "Non indicati",
      };
    }

    case "Budget":
      return {
        company: request.budgetRange || "Non indicato",
        designer: candidate.budgetRange || "Non indicato",
      };
  }
}

export default function AdminMatchingPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CompanyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState<ComparisonState>(null);
  const [excludedMatches, setExcludedMatches] = useState<string[]>([]);
  const [savingExclusionKeys, setSavingExclusionKeys] = useState<string[]>([]);
  const [companyRequestedDesignerIds, setCompanyRequestedDesignerIds] = useState<
    Record<number, string[]>
  >({});


  const excludedMatchKey = (requestId: number, candidateId: string) =>
    `${requestId}:${candidateId}`;

  useEffect(() => {
    async function loadExcludedMatches() {
      try {
        const response = await fetch("/api/admin/matching-exclusions", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Errore nel caricamento delle esclusioni matching."
          );
        }

        const keys = Array.isArray(data?.exclusions)
          ? data.exclusions
              .map((item: RawRecord) => {
                const requestId = Number(item.request_id);
                const candidateId = asString(item.designer_id);
                return requestId && candidateId
                  ? excludedMatchKey(requestId, candidateId)
                  : "";
              })
              .filter(Boolean)
          : [];

        setExcludedMatches(keys);
      } catch (err) {
        console.error("Impossibile caricare le esclusioni matching:", err);
      }
    }

    loadExcludedMatches();
  }, []);

  useEffect(() => {
    async function loadCompanyRequestedProfiles() {
      try {
        const response = await fetch("/api/admin/company-contact-requests", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Errore nel caricamento dei profili richiesti."
          );
        }

        const mapped: Record<number, string[]> = {};

        if (Array.isArray(data?.requests)) {
          for (const item of data.requests) {
            const companyRequestId = Number(item?.company_request_id);
            const designerIds = Array.isArray(item?.designer_ids)
              ? item.designer_ids.filter(
                  (designerId: unknown): designerId is string =>
                    typeof designerId === "string" && Boolean(designerId.trim())
                )
              : [];

            if (!companyRequestId) continue;

            mapped[companyRequestId] = Array.from(
              new Set([...(mapped[companyRequestId] ?? []), ...designerIds])
            );
          }
        }

        setCompanyRequestedDesignerIds(mapped);
      } catch (err) {
        console.error("Impossibile caricare i profili richiesti dall'azienda:", err);
      }
    }

    loadCompanyRequestedProfiles();
  }, []);

  const getVisibleMatchesForRequest = (request: CompanyRequest) => {
    const allMatches = getTopMatches(request, candidates);
    const requestedDesignerIds = companyRequestedDesignerIds[request.id] ?? [];

    if (requestedDesignerIds.length === 0) {
      return allMatches;
    }

    return allMatches.filter((match) =>
      requestedDesignerIds.includes(match.candidate.id)
    );
  };

  const createPurchaseProposalPdf = async (request: CompanyRequest) => {
    const selectedMatches = getVisibleMatchesForRequest(request).filter(
      (match) =>
        !excludedMatches.includes(
          excludedMatchKey(request.id, match.candidate.id)
        )
    );

    if (selectedMatches.length === 0) {
      window.alert(
        "Non ci sono progettisti da inserire nella proposta. Mantieni almeno un profilo non escluso."
      );
      return;
    }

    const cleanPdfText = (value: string) =>
      value
        .replace(/[–—]/g, "-")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const escapePdfText = (value: string) =>
      cleanPdfText(value)
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");

    const wrapText = (value: string, maxChars: number) => {
      const words = cleanPdfText(value).split(" ").filter(Boolean);
      const lines: string[] = [];
      let current = "";

      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (next.length <= maxChars) {
          current = next;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      }

      if (current) lines.push(current);
      return lines.length > 0 ? lines : [""];
    };

    const winAnsiEncode = (value: string) => {
      const bytes: number[] = [];

      for (const char of value) {
        if (char === "€") {
          bytes.push(128);
          continue;
        }

        const code = char.charCodeAt(0);
        bytes.push(code <= 255 ? code : 63);
      }

      return new Uint8Array(bytes);
    };

    const concatBytes = (chunks: Uint8Array[]) => {
      const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(total);
      let cursor = 0;
      for (const chunk of chunks) {
        result.set(chunk, cursor);
        cursor += chunk.length;
      }
      return result;
    };

    let logoBytes: Uint8Array;
    try {
      const logoResponse = await fetch(
        "/quicksolve-engineering-network-logo.jpg",
        { cache: "force-cache" }
      );
      if (!logoResponse.ok) throw new Error("Logo non disponibile");
      logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
    } catch (error) {
      console.error(error);
      window.alert(
        "Impossibile caricare il logo QuickSolve per il PDF. Verifica che il file quicksolve-engineering-network-logo.jpg sia presente nella cartella public."
      );
      return;
    }

    const pageWidth = 595;
    const pageHeight = 842;
    const left = 52;
    const right = 52;
    const bottom = 52;
    const normalSize = 10.5;
    const lineHeight = 15;
    const logoWidth = 130; // circa 46 mm: 50% della bozza precedente
    const logoHeight = Math.round(logoWidth * (581 / 1171));
    const logoX = pageWidth - right - logoWidth;
    const logoY = pageHeight - 34 - logoHeight;

    type PdfLine = {
      text: string;
      size?: number;
      bold?: boolean;
      gapBefore?: number;
      gapAfter?: number;
    };

    const pageLines: PdfLine[][] = selectedMatches.map((match, pageIndex) => {
      const candidate = match.candidate;
      const sectors = uniqueStrings([
        ...candidate.sectors,
        ...(candidate.otherSector ? [candidate.otherSector] : []),
      ]);
      const cadSkills = [
        ...candidate.cadSkills,
        ...candidate.customCadSkills,
      ].filter((skill) => skill.rating > 0 && skill.name.trim());

      const title =
        candidate.studyTitle === "Altro" && candidate.studyTitleOther
          ? candidate.studyTitleOther
          : candidate.studyTitle || "Non indicato";

      const lines: PdfLine[] = [];

      if (pageIndex === 0) {
        lines.push(
          {
            text: "CONDIZIONI ECONOMICHE:",
            size: 11,
            bold: true,
            gapAfter: 4,
          },
          {
            text:
              "QuickSolve offre un servizio di visibilità, matching e facilitazione all'avvio della collaborazione con i professionisti della rete compatibili con la richiesta dell'azienda.",
            gapAfter: 3,
          },
          {
            text: "Il servizio prevede una fee una tantum di 490 € + IVA.",
            gapAfter: 14,
          }
        );
      }

      lines.push(
        {
          text: `${candidate.nome} ${candidate.cognome} - Match ${match.breakdown.percentage}%`,
          size: 13,
          bold: true,
          gapAfter: 7,
        },
        { text: `Data di nascita: ${formatBirthDate(candidate.birthDate)}` },
        { text: `Titolo di studio: ${title}` },
        { text: `Email: ${candidate.email || "Non indicata"}` },
        { text: `Telefono / WhatsApp: ${candidate.telefono || "Non indicato"}` }
      );

      if (candidate.linkedin) {
        lines.push({ text: `LinkedIn: ${candidate.linkedin}` });
      }

      lines.push(
        {
          text: `Modalità di collaborazione: ${candidate.collaborationType || "Non indicata"}`,
        },
        { text: `Esperienza: ${candidate.experience || "Non indicata"}` },
        { text: `Range economico: ${candidate.budgetRange || "Non indicato"}` },
        {
          text: `Regioni: ${
            candidate.regioni.length > 0
              ? uniqueStrings(candidate.regioni).join(", ")
              : "Non indicate"
          }`,
        },
        {
          text: `Province: ${
            candidate.province.length > 0
              ? uniqueStrings(candidate.province).join(", ")
              : "Non indicate"
          }`,
        },
        {
          text: `Settori: ${
            sectors.length > 0 ? sectors.join(", ") : "Non indicati"
          }`,
          gapAfter: 10,
        },
        {
          text: "Software CAD e livello di conoscenza",
          size: 11,
          bold: true,
          gapAfter: 5,
        }
      );

      if (cadSkills.length > 0) {
        cadSkills.forEach((skill) => {
          lines.push({ text: `${skill.name}: ${skill.rating}/5` });
        });
      } else {
        lines.push({ text: "Non indicati" });
      }

      return lines;
    });

    const contentStreams = pageLines.map((lines, pageIndex) => {
      const commands: string[] = [];

      // Logo QuickSolve in alto a destra, su ogni pagina.
      commands.push(
        `q ${logoWidth} 0 0 ${logoHeight} ${logoX} ${logoY} cm /Logo Do Q`
      );

      let cursorY = pageIndex === 0 ? logoY - 28 : logoY - 22;

      for (const line of lines) {
        const size = line.size ?? normalSize;
        const gapBefore = line.gapBefore ?? 0;
        const gapAfter = line.gapAfter ?? 0;
        const wrapped = wrapText(
          line.text,
          size >= 13 ? 66 : size >= 11 ? 82 : 94
        );

        cursorY -= gapBefore;

        for (const wrappedLine of wrapped) {
          if (cursorY < bottom + lineHeight) break;
          const font = line.bold ? "F2" : "F1";
          commands.push(
            `BT /${font} ${size} Tf ${left} ${cursorY} Td (${escapePdfText(
              wrappedLine
            )}) Tj ET`
          );
          cursorY -= lineHeight;
        }

        cursorY -= gapAfter;
      }

      const footer =
        `QuickSolve Engineering Network - ${request.codice || `RQ-${request.id}`} - ` +
        `Pagina ${pageIndex + 1}/${pageLines.length}`;
      commands.push(
        `BT /F1 8 Tf ${left} 28 Td (${escapePdfText(footer)}) Tj ET`
      );

      return winAnsiEncode(commands.join("\n"));
    });

    const catalogObjectNumber = 1;
    const pagesObjectNumber = 2;
    let nextObjectNumber = 3;
    const pageObjectNumbers: number[] = [];
    const contentObjectNumbers: number[] = [];

    pageLines.forEach(() => {
      pageObjectNumbers.push(nextObjectNumber++);
      contentObjectNumbers.push(nextObjectNumber++);
    });

    const fontRegularObjectNumber = nextObjectNumber++;
    const fontBoldObjectNumber = nextObjectNumber++;
    const logoObjectNumber = nextObjectNumber++;
    const objectCount = nextObjectNumber;

    const objectBodies = new Map<number, Uint8Array>();
    const encode = (value: string) => winAnsiEncode(value);

    objectBodies.set(
      catalogObjectNumber,
      encode(`<< /Type /Catalog /Pages ${pagesObjectNumber} 0 R >>`)
    );
    objectBodies.set(
      pagesObjectNumber,
      encode(
        `<< /Type /Pages /Count ${pageLines.length} /Kids [` +
          pageObjectNumbers.map((n) => `${n} 0 R`).join(" ") +
          "] >>"
      )
    );

    pageLines.forEach((_, pageIndex) => {
      const pageObjectNumber = pageObjectNumbers[pageIndex];
      const contentObjectNumber = contentObjectNumbers[pageIndex];
      const stream = contentStreams[pageIndex];

      objectBodies.set(
        pageObjectNumber,
        encode(
          `<< /Type /Page /Parent ${pagesObjectNumber} 0 R ` +
            `/MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
            `/Resources << /Font << /F1 ${fontRegularObjectNumber} 0 R /F2 ${fontBoldObjectNumber} 0 R >> ` +
            `/XObject << /Logo ${logoObjectNumber} 0 R >> >> ` +
            `/Contents ${contentObjectNumber} 0 R >>`
        )
      );

      objectBodies.set(
        contentObjectNumber,
        concatBytes([
          encode(`<< /Length ${stream.length} >>\nstream\n`),
          stream,
          encode("\nendstream"),
        ])
      );
    });

    objectBodies.set(
      fontRegularObjectNumber,
      encode(
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
      )
    );
    objectBodies.set(
      fontBoldObjectNumber,
      encode(
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
      )
    );

    objectBodies.set(
      logoObjectNumber,
      concatBytes([
        encode(
          `<< /Type /XObject /Subtype /Image /Width 1171 /Height 581 ` +
            `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBytes.length} >>\nstream\n`
        ),
        logoBytes,
        encode("\nendstream"),
      ])
    );

    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let offset = 0;

    const pushBytes = (bytes: Uint8Array) => {
      chunks.push(bytes);
      offset += bytes.length;
    };
    const pushText = (value: string) => pushBytes(encode(value));

    pushText("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    for (let objectNumber = 1; objectNumber < objectCount; objectNumber += 1) {
      offsets[objectNumber] = offset;
      pushText(`${objectNumber} 0 obj\n`);
      pushBytes(objectBodies.get(objectNumber) ?? encode("<<>>"));
      pushText("\nendobj\n");
    }

    const xrefOffset = offset;
    pushText(`xref\n0 ${objectCount}\n`);
    pushText("0000000000 65535 f \n");

    for (let objectNumber = 1; objectNumber < objectCount; objectNumber += 1) {
      pushText(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`);
    }

    pushText(
      `trailer\n<< /Size ${objectCount} /Root ${catalogObjectNumber} 0 R >>\n` +
        `startxref\n${xrefOffset}\n%%EOF`
    );

    const pdfBytes = concatBytes(chunks);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeCode = (request.codice || `RQ-${request.id}`).replace(
      /[^a-zA-Z0-9_-]/g,
      "-"
    );

    anchor.href = url;
    anchor.download = `proposta-QuickSolve-${safeCode}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleExcludedMatch = async (
    requestId: number,
    candidateId: string
  ) => {
    const key = excludedMatchKey(requestId, candidateId);
    if (savingExclusionKeys.includes(key)) return;

    const wasExcluded = excludedMatches.includes(key);

    // Aggiornamento immediato dell'interfaccia; in caso di errore viene annullato.
    setExcludedMatches((prev) =>
      wasExcluded
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
    setSavingExclusionKeys((prev) => [...prev, key]);

    try {
      const response = await fetch("/api/admin/matching-exclusions", {
        method: wasExcluded ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          designer_id: candidateId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Errore nel salvataggio dello stato del progettista."
        );
      }
    } catch (err) {
      // Rollback se Supabase/API non salva.
      setExcludedMatches((prev) =>
        wasExcluded
          ? prev.includes(key)
            ? prev
            : [...prev, key]
          : prev.filter((item) => item !== key)
      );
      console.error("Errore aggiornamento esclusione matching:", err);
    } finally {
      setSavingExclusionKeys((prev) =>
        prev.filter((item) => item !== key)
      );
    }
  };

  useEffect(() => {
    async function loadMatchingData() {
      try {
        setLoading(true);
        setError("");

        const [requestsResponse, designersResponse] = await Promise.all([
          fetch("/api/company-requests", { cache: "no-store" }),
          fetch("/api/admin/progettisti", { cache: "no-store" }),
        ]);

        const requestsData = await requestsResponse.json();
        const designersData = await designersResponse.json();

        if (!requestsResponse.ok) {
          throw new Error(
            requestsData?.error || "Errore nel caricamento delle richieste."
          );
        }

        if (!designersResponse.ok) {
          throw new Error(
            designersData?.message || "Errore nel caricamento dei progettisti."
          );
        }

        const mappedRequests = Array.isArray(requestsData?.requests)
          ? (requestsData.requests as RawRecord[])
              .map(mapRequestFromApi)
              .filter((request) => !request.archived)
          : [];

        const mappedCandidates = Array.isArray(designersData?.designers)
          ? (designersData.designers as RawRecord[]).map(mapDesignerFromApi)
          : [];

        setRequests(sortRequestsByCodeDesc(mappedRequests));
        setCandidates(mappedCandidates);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore nel caricamento dei dati matching."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMatchingData();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (comparison) { setComparison(null); return; }
      setSelectedRequest(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [comparison]);

  const selectedMatches = useMemo(() => {
    if (!selectedRequest) return [];

    const allMatches = getTopMatches(selectedRequest, candidates);
    const requestedDesignerIds =
      companyRequestedDesignerIds[selectedRequest.id] ?? [];

    if (requestedDesignerIds.length === 0) {
      return allMatches;
    }

    return allMatches.filter((match) =>
      requestedDesignerIds.includes(match.candidate.id)
    );
  }, [selectedRequest, candidates, companyRequestedDesignerIds]);

  return (
    <section className="-mt-2 min-w-0 space-y-3 sm:-mt-4 sm:space-y-4 md:-mt-4">
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-4 py-4">
          <h1 className="text-lg font-semibold text-neutral-900">
            Compatibilità aziende/progettisti
          </h1>
        </div>

        <div className="hidden border-b border-neutral-200 px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 lg:grid lg:grid-cols-[1.2fr_0.9fr_1.05fr_0.8fr_0.9fr_1.1fr] lg:gap-4">
          <div className="text-center">Progetto</div>
          <div className="text-center">Settore</div>
          <div className="text-center">Contratto</div>
          <div className="text-center">Esperienza</div>
          <div className="text-center">Zona</div>
          <div className="text-center">Software</div>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mx-4 mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            Caricamento richieste e progettisti...
          </div>
        )}

        <div className="space-y-3 p-4">
          {requests.map((request) => {
            const cadCompleti = [...request.cadRichiesti, ...(request.altroCad ?? [])];
            const isOpen = selectedRequest?.id === request.id;
            const matches = isOpen ? selectedMatches : [];

            return (
              <div
                key={request.id}
                className="rounded-2xl border border-neutral-200 bg-white transition hover:border-teal-300 hover:shadow-sm"
              >
                <div className="p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRequest((prev) => (prev?.id === request.id ? null : request))
                    }
                    className="w-full rounded-2xl text-left"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_1.05fr_0.8fr_0.9fr_1.1fr] lg:items-start">
                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Progetto
                        </p>
                        <p className="text-base font-semibold text-neutral-900">{request.azienda || "Azienda non indicata"}</p>
                        <p className="mt-1 text-sm text-neutral-500">{request.codice}</p>
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Settore
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {uniqueStrings(
                            request.experienceSectors.filter(Boolean)
                          ).map((sector) => (
                            <Badge
                              key={`${request.id}-${sector}`}
                              tone="soft"
                            >
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Contratto
                        </p>
                        <div className="flex flex-col items-center gap-2">
                          <Badge tone={request.tipologia === "Freelancer" ? "primary" : "neutral"}>
                            {request.tipologia}
                          </Badge>
                          <p className="text-sm text-neutral-700">{request.budgetRange || "Budget non indicato"}</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Esperienza
                        </p>
                        <p className="text-sm text-neutral-700">{request.esperienza || "Non indicata"}</p>
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Zona
                        </p>
                        <div className="flex justify-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {(request.provincia || request.regione) && (
                              <Badge tone="soft">
                                {request.provincia || request.regione}
                              </Badge>
                            )}
                            {request.isRemote && (
                              <Badge tone="success">Remote</Badge>
                            )}
                            {!request.provincia &&
                              !request.regione &&
                              !request.isRemote && (
                                <Badge tone="soft">Non indicata</Badge>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 lg:hidden">
                          Software
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {cadCompleti.length > 0 ? (
                            uniqueStrings(cadCompleti.map((item) => item.nome)).map((cadName) => (
                              <Badge key={`${request.id}-${cadName}`}>
                                {cadName}
                              </Badge>
                            ))
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-neutral-200 px-4 pb-2.5 pt-2.5">
                    <div className="space-y-1.5">
                      {matches.map((match, index) => {
                        const isExcluded = excludedMatches.includes(
                          excludedMatchKey(request.id, match.candidate.id)
                        );
                        const isCompanyRequested = (
                          companyRequestedDesignerIds[request.id] ?? []
                        ).includes(match.candidate.id);

                        return (
                        <div
                          key={`${request.id}-${match.candidate.id}`}
                          className={`relative rounded-lg border px-2.5 py-1.5 transition ${
                            isExcluded
                              ? "border-neutral-100 bg-neutral-50 opacity-25"
                              : isCompanyRequested
                              ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                              : "border-neutral-200 bg-neutral-50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleExcludedMatch(request.id, match.candidate.id)
                            }
                            disabled={savingExclusionKeys.includes(
                              excludedMatchKey(request.id, match.candidate.id)
                            )}
                            className={`absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold leading-none transition disabled:cursor-wait ${
                              isExcluded
                                ? "border-neutral-400 bg-white text-neutral-700 hover:bg-neutral-50"
                                : "border-neutral-300 bg-white text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                            }`}
                            title={
                              isExcluded
                                ? "Ripristina nella selezione"
                                : "Escludi dalla selezione"
                            }
                            aria-label={
                              isExcluded
                                ? "Ripristina nella selezione"
                                : "Escludi dalla selezione"
                            }
                          >
                            ×
                          </button>

                          <div className="grid min-w-0 gap-2 xl:grid-cols-[28px_minmax(245px,0.9fr)_minmax(500px,2fr)] xl:items-center">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[11px] font-bold text-neutral-700">
                              {index + 1}
                            </div>

                            <div className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                                  <p className="truncate text-sm font-semibold text-neutral-900">
                                    {match.candidate.nome} {match.candidate.cognome}
                                  </p>
                                  <span className="shrink-0 text-[11px] text-neutral-500">
                                    {formatBirthDate(match.candidate.birthDate)}
                                  </span>
                                  {isCompanyRequested && !isExcluded ? (
                                    <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                      Richiesto dall&apos;azienda
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-0.5 text-[10px] leading-4 text-neutral-600">
                                  <p className="truncate">
                                    Mail: {match.candidate.email || "Non indicata"}
                                  </p>
                                  <p className="truncate">
                                    Telefono:{" "}
                                    {match.candidate.telefono ? (
                                      <a
                                        href={`https://wa.me/${match.candidate.telefono.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(event) => event.stopPropagation()}
                                        className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
                                        title="Apri WhatsApp"
                                      >
                                        {match.candidate.telefono}
                                      </a>
                                    ) : (
                                      "Non indicato"
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-center">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.08em] text-teal-700">
                                  Compatibilità
                                </p>
                                <p className="text-lg font-bold leading-none text-teal-800">
                                  {match.breakdown.percentage}%
                                </p>
                              </div>
                            </div>

                            <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
                              <ScoreCard label="Zona" score={match.breakdown.regionScore} max={30} onClick={() => setComparison({ key: "Zona", request, match })} />
                              <ScoreCard label="Esperienza" score={match.breakdown.seniorityScore} max={20} onClick={() => setComparison({ key: "Esperienza", request, match })} />
                              <ScoreCard label="CAD" score={match.breakdown.softwareScore} max={20} onClick={() => setComparison({ key: "CAD", request, match })} />
                              <ScoreCard label="Settori" score={match.breakdown.sectorScore} max={15} onClick={() => setComparison({ key: "Settori", request, match })} />
                              <ScoreCard label="Budget" score={match.breakdown.budgetScore} max={15} onClick={() => setComparison({ key: "Budget", request, match })} />
                            </div>
                          </div>
                        </div>
                        );
                      })}

                      {matches.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
                          Nessun progettista del CRM supera la soglia minima di compatibilità per questa richiesta.
                        </div>
                      )}

                      {matches.length > 0 && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => createPurchaseProposalPdf(request)}
                            disabled={
                              matches.filter(
                                (match) =>
                                  !excludedMatches.includes(
                                    excludedMatchKey(request.id, match.candidate.id)
                                  )
                              ).length === 0
                            }
                            className="w-full rounded-xl bg-teal-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                          >
                            Crea proposta acquisto
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {requests.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
              Nessuna richiesta disponibile nel CRM matching. Inserisci prima richieste aziendali e progettisti reali.
            </div>
          )}
        </div>
      </div>

      {comparison && (() => {
        const scoreMap: Record<ComparisonKey, { score: number; max: number }> = {
          Zona: { score: comparison.match.breakdown.regionScore, max: 30 },
          Settori: { score: comparison.match.breakdown.sectorScore, max: 15 },
          Esperienza: { score: comparison.match.breakdown.seniorityScore, max: 20 },
          CAD: { score: comparison.match.breakdown.softwareScore, max: 20 },
          Budget: { score: comparison.match.breakdown.budgetScore, max: 15 },
        };

        const selectedScore = scoreMap[comparison.key];
        const values = getSimpleComparisonValues(
          comparison.key,
          comparison.request,
          comparison.match.candidate
        );

        return (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:items-center sm:p-4"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setComparison(null);
            }}
          >
            <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-2xl">
              <div className="relative border-b border-neutral-200 px-5 py-4 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-600">
                  {comparison.key}
                </p>
                <p className="mt-1 text-3xl font-bold text-teal-800">
                  {selectedScore.score}/{selectedScore.max}
                </p>

                <button
                  type="button"
                  onClick={() => setComparison(null)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-xl text-neutral-500 transition hover:bg-neutral-100"
                  aria-label="Chiudi"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 divide-y divide-neutral-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    Azienda
                  </p>
                  <p className="mt-3 text-base font-semibold leading-6 text-neutral-900">
                    {values.company}
                  </p>
                </div>

                <div className="p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    Progettista
                  </p>
                  <p className="mt-3 text-base font-semibold leading-6 text-neutral-900">
                    {values.designer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}