export type CollaborationType = "Full time" | "Part-time" | "Freelancer";
export type ExperienceLevel =
  | "Junior"
  | "Middle"
  | "Senior"
  | "Resp. ufficio tecnico";

export type CandidateCollaboration =
  | "Dipendente full time"
  | "Dipendente part-time"
  | "Freelancer partita IVA";

export type CandidateExperience =
  | "0-2 anni"
  | "3-5 anni"
  | "6-10 anni"
  | "10+ anni";

export type RatedCad = {
  nome: string;
  livello: number;
};

export type CompanyRequestForMatching = {
  id: number;
  codice: string;
  tipologia: CollaborationType;
  budgetRange: string;
  esperienza: ExperienceLevel;
  regione: string;
  provincia: string;
  isRemote: boolean;
  experienceSectors: string[];
  cadRichiesti: RatedCad[];
  altroCad: RatedCad[];
};

export type CandidateForMatching = {
  id: string;
  regioni: string[];
  province: string[];
  isRemote: boolean;
  isAllItaly: boolean;
  sectors: string[];
  otherSector?: string;
  collaborationType: CandidateCollaboration;
  experience: CandidateExperience;
  budgetRange: string;
  cadSkills: { name: string; rating: number }[];
  customCadSkills: { name: string; rating: number }[];
};

export type MatchBreakdown = {
  regionScore: number;
  sectorScore: number;
  seniorityScore: number;
  softwareScore: number;
  contractScore: number;
  budgetScore: number;
  totalScore: number;
  percentage: number;
};

export type MatchBandSummary = {
  total: number;
  bands: {
    "70_79": number;
    "80_89": number;
    "90_plus": number;
  };
  internalAlternatives: number;
  searchStatus: "matches_found" | "search_in_progress";
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
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function canonicalProvince(value: string) {
  const normalized = normalize(value);

  const aliases: Record<string, string> = {
    "forli-cesena": "Forlì",
    "forli cesena": "Forlì",
    "reggio nell'emilia": "Reggio Emilia",
    "reggio emilia": "Reggio Emilia",
    "pesaro urbino": "Pesaro e Urbino",
    "pesaro e urbino": "Pesaro e Urbino",
    "monza brianza": "Monza e Brianza",
    "monza e brianza": "Monza e Brianza",
    "verbano cusio ossola": "Verbano-Cusio-Ossola",
    "barletta andria trani": "Barletta-Andria-Trani",
    "laquila": "L'Aquila",
    "l aquila": "L'Aquila",
  };

  if (aliases[normalized]) return aliases[normalized];

  const direct = Object.keys(PROVINCE_CAPITAL_COORDS).find(
    (province) => normalize(province) === normalized
  );

  return direct ?? value.trim();
}

function provinceDistanceKm(a: string, b: string) {
  const first = PROVINCE_CAPITAL_COORDS[canonicalProvince(a)];
  const second = PROVINCE_CAPITAL_COORDS[canonicalProvince(b)];

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

function getNearestProvinceDistance(
  requestProvince: string,
  candidateProvinces: string[]
) {
  const distances = candidateProvinces
    .filter(Boolean)
    .map((province) => provinceDistanceKm(requestProvince, province))
    .filter((distance): distance is number => distance !== null);

  if (distances.length === 0) return null;
  return Math.min(...distances);
}

function calculateProvinceDistanceScore(
  distanceKm: number,
  requestType: CollaborationType
) {
  if (distanceKm <= 0) return 30;
  if (distanceKm <= 80) return 25;

  // Regola concordata:
  // 81-150 km conserva 10/30 solo per i Freelancer.
  // Per Full time e Part-time oltre 80 km il punteggio zona è 0.
  if (requestType === "Freelancer" && distanceKm <= 150) return 10;

  return 0;
}

/* COLLABORAZIONE: filtro di compatibilità, NON punteggio */
export function isCollaborationCompatible(
  request: CompanyRequestForMatching,
  candidate: CandidateForMatching
) {
  const requestIsFreelancer = request.tipologia === "Freelancer";
  const candidateIsFreelancer =
    candidate.collaborationType === "Freelancer partita IVA";

  return requestIsFreelancer === candidateIsFreelancer;
}

export function calculateAvailabilityPenalty(
  request: CompanyRequestForMatching,
  candidate: CandidateForMatching
) {
  if (request.tipologia === "Freelancer") return 0;

  const isFullPartMismatch =
    (request.tipologia === "Full time" &&
      candidate.collaborationType === "Dipendente part-time") ||
    (request.tipologia === "Part-time" &&
      candidate.collaborationType === "Dipendente full time");

  return isFullPartMismatch ? -5 : 0;
}

/* ZONA - MAX 30 */
export function calculateLocationScore(
  request: CompanyRequestForMatching,
  candidate: CandidateForMatching
) {
  if (candidate.isAllItaly) return 0;

  const requestProvince = canonicalProvince(request.provincia);
  const candidateProvinces = uniqueStrings(candidate.province.map(canonicalProvince));

  const sameProvince =
    Boolean(requestProvince) &&
    candidateProvinces.some(
      (province) => normalize(province) === normalize(requestProvince)
    );

  // Remote + provincia: logica dedicata invariata.
  if (request.isRemote && requestProvince && candidate.isRemote) {
    if (sameProvince) return 30;

    const nearestDistance = getNearestProvinceDistance(
      requestProvince,
      candidateProvinces
    );

    if (nearestDistance === null) return 10;
    if (nearestDistance <= 80) return 25;
    if (nearestDistance <= 150) return 15;
    return 10;
  }

  // Richiesta esclusivamente Remote, senza provincia/regione.
  if (
    request.isRemote &&
    !request.provincia.trim() &&
    !request.regione.trim()
  ) {
    return candidate.isRemote ? 30 : 0;
  }

  if (sameProvince) return 30;

  // Se esiste una provincia richiesta, la provincia è il riferimento primario.
  if (requestProvince) {
    const nearestDistance = getNearestProvinceDistance(
      requestProvince,
      candidateProvinces
    );

    if (nearestDistance !== null) {
      return calculateProvinceDistanceScore(
        nearestDistance,
        request.tipologia
      );
    }

    return 0;
  }

  // Fallback solo quando la richiesta non contiene una provincia valida.
  const sameRegion =
    Boolean(request.regione) &&
    candidate.regioni.some(
      (region) => normalize(region) === normalize(request.regione)
    );

  if (sameRegion) return 17;

  if (!request.isRemote && candidate.isRemote) return 4;

  return 0;
}

/* ESPERIENZA - MAX 20 */
export function calculateExperienceScore(
  request: CompanyRequestForMatching,
  candidate: CandidateForMatching
) {
  const table: Record<
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

  return table[request.esperienza]?.[candidate.experience] ?? 0;
}

/* SETTORI - MAX 15 */
export function calculateSectorScore(
  request: CompanyRequestForMatching,
  candidate: CandidateForMatching
) {
  const requested = uniqueStrings(request.experienceSectors);
  const candidateSectors = uniqueStrings([
    ...candidate.sectors,
    ...(candidate.otherSector ? [candidate.otherSector] : []),
  ]);

  if (requested.length === 0 || candidateSectors.length === 0) return 0;

  const candidateNormalized = new Set(candidateSectors.map(normalize));
  const matches = requested.filter((sector) =>
    candidateNormalized.has(normalize(sector))
  ).length;

  if (matches === requested.length) return 15;
  if (matches >= 2) return 12;
  if (matches === 1) return 10;

  if (candidateSectors.length >= 3) return 7;
  if (candidateSectors.length === 2) return 5;
  return 0;
}

/* CAD - MAX 20 */
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


function scoreRequiredSoftware(
  required: RatedCad,
  candidate: CandidateForMatching
) {
  const allSkills = [
    ...(candidate.cadSkills ?? []),
    ...(candidate.customCadSkills ?? []),
  ].filter((skill) => skill.rating > 0);

  const requiredName = canonicalCadName(required.nome);

  /*
   * 1) Corrispondenza esatta:
   * vale per QUALSIASI software richiesto, parametrico o non parametrico.
   * Se lo stesso software compare sia tra i CAD standard sia tra gli "Altro",
   * prendiamo il rating migliore.
   */
  const exactSkills = allSkills.filter(
    (skill) => canonicalCadName(skill.name) === requiredName
  );

  if (exactSkills.length > 0) {
    return Math.max(
      ...exactSkills.map((skill) =>
        exactSoftwareScore(Math.max(0, Math.min(5, skill.rating)))
      )
    );
  }

  /*
   * 2) Trasferibilità SOLO tra CAD parametrici.
   * Se l'azienda richiede SolidWorks / Inventor / Creo / CATIA /
   * Solid Edge / NX / Fusion 360 e manca l'esatto, può valere il
   * miglior altro parametrico posseduto dal progettista.
   */
  if (isParametric3d(required.nome)) {
    const parametricAlternatives = allSkills.filter((skill) =>
      isParametric3d(skill.name)
    );

    if (parametricAlternatives.length > 0) {
      return Math.max(
        ...parametricAlternatives.map((skill) =>
          alternativeParametricScore(
            Math.max(0, Math.min(5, skill.rating))
          )
        )
      );
    }
  }

  /*
   * 3) Software non parametrici/specifici (AutoCAD, Modeling, Blender,
   * Revit, ecc.) vengono confrontati singolarmente.
   * Se manca il software esatto: 0 punti.
   *
   * Anche per una richiesta parametrica, se il progettista possiede
   * solo software non parametrici: 0 punti.
   */
  return 0;
}

export function calculateCadScore(
  request: CompanyRequestForMatching,
  candidate: CandidateForMatching
) {
  const required = [...request.cadRichiesti, ...request.altroCad];

  if (required.length === 0) return 0;

  const perSoftwareScores = required.map((requiredSoftware) =>
    scoreRequiredSoftware(requiredSoftware, candidate)
  );

  const average =
    perSoftwareScores.reduce((sum, score) => sum + score, 0) /
    perSoftwareScores.length;

  return Math.round(average);
}

/* BUDGET - MAX 15 */
function budgetNumbers(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/€/g, "")
    .replace(/\s/g, "");

  const raw = normalized.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];

  return raw.map((n) => (n >= 1000 ? n / 1000 : n));
}

function annualBudgetBand(value: string) {
  const n = normalize(value);
  const numbers = budgetNumbers(value);

  if ((n.includes(">") || n.includes("oltre") || n.includes("+")) &&
      numbers.some((x) => x >= 60)) return 5;

  const first = numbers[0];
  const second = numbers[1];

  if (first === 18 && second === 24) return 0;
  if (first === 24 && second === 30) return 1;
  if (first === 30 && second === 40) return 2;
  if (first === 40 && second === 50) return 3;
  if (first === 50 && second === 60) return 4;
  if (first !== undefined && first >= 60 && second === undefined) return 5;

  return null;
}

function hourlyBudgetBand(value: string) {
  const n = normalize(value);
  const numbers = budgetNumbers(value);

  if ((n.includes(">") || n.includes("oltre") || n.includes("+")) &&
      numbers.some((x) => x >= 50)) return 4;

  const first = numbers[0];
  const second = numbers[1];

  if (first === 15 && second === 20) return 0;
  if (first === 20 && second === 30) return 1;
  if (first === 30 && second === 40) return 2;
  if (first === 40 && second === 50) return 3;
  if (first !== undefined && first >= 50 && second === undefined) return 4;

  return null;
}

export function calculateBudgetScore(
  request: CompanyRequestForMatching,
  candidate: CandidateForMatching
) {
  const requestBand =
    request.tipologia === "Freelancer"
      ? hourlyBudgetBand(request.budgetRange)
      : annualBudgetBand(request.budgetRange);

  const candidateBand =
    request.tipologia === "Freelancer"
      ? hourlyBudgetBand(candidate.budgetRange)
      : annualBudgetBand(candidate.budgetRange);

  if (requestBand === null || candidateBand === null) return 0;

  if (candidateBand === requestBand) return 15;

  // Richiesta economica del progettista inferiore alla disponibilità aziendale.
  if (candidateBand < requestBand) return 10;

  // Progettista una fascia sopra il budget aziendale.
  if (candidateBand === requestBand + 1) return 8;

  // Progettista almeno due fasce sopra il budget aziendale.
  return 0;
}

/*
 * Compatibilità retroattiva:
 * il contratto non assegna più punti. L'export resta disponibile
 * per non rompere eventuali import esistenti.
 */
export function calculateContractScore(
  _request: CompanyRequestForMatching,
  _candidate: CandidateForMatching
) {
  return 0;
}

/* TOTALE DEFINITIVO: 30 + 20 + 20 + 15 + 15 = 100 */
export function calculateMatch(
  request: CompanyRequestForMatching,
  candidate: CandidateForMatching
): MatchBreakdown & { availabilityPenalty: number } {
  // Profili legacy "Tutta Italia" e pool contrattuali incompatibili
  // non devono entrare nei risultati.
  if (candidate.isAllItaly || !isCollaborationCompatible(request, candidate)) {
    return {
      regionScore: 0,
      sectorScore: 0,
      seniorityScore: 0,
      softwareScore: 0,
      contractScore: 0,
      budgetScore: 0,
      availabilityPenalty: 0,
      totalScore: 0,
      percentage: 0,
    };
  }

  const regionScore = calculateLocationScore(request, candidate);
  const sectorScore = calculateSectorScore(request, candidate);
  const seniorityScore = calculateExperienceScore(request, candidate);
  const softwareScore = calculateCadScore(request, candidate);
  const budgetScore = calculateBudgetScore(request, candidate);
  const availabilityPenalty = calculateAvailabilityPenalty(request, candidate);

  // Budget 0/15 = candidato escluso automaticamente dal matching.
  if (budgetScore === 0) {
    return {
      regionScore,
      sectorScore,
      seniorityScore,
      softwareScore,
      contractScore: 0,
      budgetScore,
      availabilityPenalty,
      totalScore: 0,
      percentage: 0,
    };
  }

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
    contractScore: 0,
    budgetScore,
    availabilityPenalty,
    totalScore,
    percentage: totalScore,
  };
}

export function summarizeMatches(
  request: CompanyRequestForMatching,
  candidates: CandidateForMatching[]
): MatchBandSummary {
  const scores = candidates
    .filter((candidate) => !candidate.isAllItaly)
    .filter((candidate) => isCollaborationCompatible(request, candidate))
    .map((candidate) => calculateMatch(request, candidate).percentage);

  const band70 = scores.filter(
    (score) => score >= 70 && score < 80
  ).length;

  const band80 = scores.filter(
    (score) => score >= 80 && score < 90
  ).length;

  const band90 = scores.filter((score) => score >= 90).length;

  const internalAlternatives = scores.filter(
    (score) => score >= 60 && score < 70
  ).length;

  const total = band70 + band80 + band90;

  return {
    total,
    bands: {
      "70_79": band70,
      "80_89": band80,
      "90_plus": band90,
    },
    internalAlternatives,
    searchStatus:
      total > 0 ? "matches_found" : "search_in_progress",
  };
}
