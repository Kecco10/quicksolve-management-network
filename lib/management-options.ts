export const roleFamilies = {
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
  PROGETTI: ["Project Manager", "Program Manager", "PMO Manager"],
  "AREA COMMERCIALE": ["Marketing", "Commerciale"],
  "FUNZIONI DI SUPPORTO": [
    "CFO / Direttore Amministrativo",
    "Controller Industriale",
    "IT / Digital Manufacturing Manager",
    "HR Manager / Direttore del Personale",
    "Altro",
  ],
} as const;

export const sectorOptions = [
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
] as const;

export const dailyRateOptions = [
  "Fino a 400 € / giorno",
  "500 € / giorno",
  "600 € / giorno",
  "700 € / giorno",
  "800 € / giorno",
] as const;

export const regionProvinceMap: Record<string, string[]> = {
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

export const regionOptions = Object.keys(regionProvinceMap);

export const roleOptions = Array.from(
  new Set(
    Object.values(roleFamilies)
      .flat()
      .filter((role) => role !== "Altro")
  )
).sort((a, b) => a.localeCompare(b, "it"));
