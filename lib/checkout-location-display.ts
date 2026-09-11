type ProvinceEntry = {
  province?: string;
};

const PROVINCE_CAPITAL_COORDS: Record<string, [number, number]> = {
  Agrigento: [37.3111, 13.5765],
  Alessandria: [44.912, 8.615],
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
  Catania: [37.5079, 15.083],
  Catanzaro: [38.9098, 16.5877],
  Chieti: [42.351, 14.1675],
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
  Isernia: [41.596, 14.2332],
  "L'Aquila": [42.3498, 13.3995],
  "La Spezia": [44.1025, 9.8241],
  Latina: [41.4676, 12.9037],
  Lecce: [40.3515, 18.175],
  Lecco: [45.8566, 9.3977],
  Livorno: [43.5485, 10.3106],
  Lodi: [45.3138, 9.5037],
  Lucca: [43.8429, 10.5027],
  Macerata: [43.3007, 13.453],
  Mantova: [45.1564, 10.7914],
  Massa: [44.0354, 10.1393],
  Matera: [40.6663, 16.6043],
  Messina: [38.1938, 15.554],
  Milano: [45.4642, 9.19],
  Modena: [44.6471, 10.9252],
  "Monza e Brianza": [45.5845, 9.2744],
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
  Piacenza: [45.0526, 9.693],
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
  Savona: [44.3075, 8.481],
  Siena: [43.3188, 11.3308],
  Siracusa: [37.0755, 15.2866],
  Sondrio: [46.1699, 9.8788],
  Taranto: [40.4644, 17.247],
  Teramo: [42.6589, 13.7044],
  Terni: [42.5636, 12.6427],
  Torino: [45.0703, 7.6869],
  Trapani: [38.0176, 12.5365],
  Trento: [46.0748, 11.1217],
  Treviso: [45.6669, 12.243],
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

const DISPLAY_RADIUS_KM = 80;

function normalizeGeo(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const PROVINCE_ALIASES: Record<string, string> = {
  [normalizeGeo("Forlì-Cesena")]: "Forlì",
  [normalizeGeo("Forli-Cesena")]: "Forlì",
  [normalizeGeo("Massa-Carrara")]: "Massa",
  [normalizeGeo("Pesaro-Urbino")]: "Pesaro e Urbino",
  [normalizeGeo("Verbano Cusio Ossola")]: "Verbano-Cusio-Ossola",
  [normalizeGeo("Barletta Andria Trani")]: "Barletta-Andria-Trani",
  [normalizeGeo("Monza Brianza")]: "Monza e Brianza",
};

const CANONICAL_PROVINCES = new Map(
  Object.keys(PROVINCE_CAPITAL_COORDS).map((province) => [
    normalizeGeo(province),
    province,
  ])
);

function canonicalProvinceName(value: string) {
  const normalized = normalizeGeo(value);
  if (!normalized) return "";

  return (
    PROVINCE_ALIASES[normalized] ??
    CANONICAL_PROVINCES.get(normalized) ??
    value.trim()
  );
}

function provinceDistanceKm(a: string, b: string) {
  const first = PROVINCE_CAPITAL_COORDS[canonicalProvinceName(a)];
  const second = PROVINCE_CAPITAL_COORDS[canonicalProvinceName(b)];

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

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = normalizeGeo(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getCheckoutDesignerZone({
  selectedProvinceEntries,
  selectedRegion,
  isRemote,
  requestedProvince,
}: {
  selectedProvinceEntries: Array<ProvinceEntry | string>;
  selectedRegion: string;
  isRemote: boolean;
  requestedProvince: string;
}) {
  const designerProvinces = uniqueStrings(
    selectedProvinceEntries
      .map((entry) =>
        typeof entry === "string"
          ? entry.trim()
          : typeof entry?.province === "string"
          ? entry.province.trim()
          : ""
      )
      .filter(Boolean)
  );

  const requested = canonicalProvinceName(requestedProvince);

  const designerProvincesWithDistance = requested
    ? designerProvinces
        .map((province) => ({
          province,
          distance: provinceDistanceKm(requested, province),
        }))
        .filter(
          (item): item is { province: string; distance: number } =>
            item.distance !== null
        )
        .sort((a, b) => a.distance - b.distance)
    : [];

  const visibleProvinces = requested
    ? designerProvincesWithDistance
        .filter((item) => item.distance <= DISPLAY_RADIUS_KM)
        .map((item) => item.province)
    : designerProvinces;

  const nearestProvince =
    requested && designerProvincesWithDistance.length > 0
      ? designerProvincesWithDistance[0].province
      : "";

  let location = "";

  if (visibleProvinces.length > 0) {
    location = visibleProvinces.join(", ");
  } else if (nearestProvince) {
    location = nearestProvince;
  } else if (requested && isRemote) {
    location = "Remote";
  } else if (requested) {
    location = "Zona non specificata";
  } else if (designerProvinces.length > 0) {
    location = designerProvinces.join(", ");
  } else {
    location = selectedRegion || "Zona non specificata";
  }

  if (isRemote && location !== "Remote") {
    return `${location} · Remote`;
  }

  return location;
}
