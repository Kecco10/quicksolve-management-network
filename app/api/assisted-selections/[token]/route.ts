import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  calculateMatch,
  type CandidateForMatching,
  type CompanyRequestForMatching,
} from "@/lib/matching-engine";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Configurazione Supabase server mancante.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

type RawRecord = Record<string, unknown>;

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
  return Array.isArray(value) ? value.map(asString).filter(Boolean) : [];
}

function normalizeCad(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as RawRecord;
      const name = asString(
        source.name ?? source.nome ?? source.label ?? source.software ?? source.cad
      );
      const rawRating =
        source.rating ?? source.livello ?? source.level ?? source.valore ?? 0;
      const rating =
        typeof rawRating === "number" ? rawRating : Number(rawRating);

      if (!name || !Number.isFinite(rating) || rating <= 0) return null;

      return {
        name,
        rating: Math.max(1, Math.min(5, rating)),
      };
    })
    .filter(
      (item): item is { name: string; rating: number } => Boolean(item)
    );
}

function normalizeRequiredCad(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim() ? { nome: item.trim(), livello: 5 } : null;
      }

      if (!item || typeof item !== "object") return null;
      const source = item as RawRecord;
      const nome = asString(
        source.nome ?? source.name ?? source.label ?? source.software ?? source.cad
      );
      const rawLevel =
        source.livello ?? source.level ?? source.rating ?? source.valore ?? 5;
      const livello =
        typeof rawLevel === "number" ? rawLevel : Number(rawLevel);

      if (!nome) return null;

      return {
        nome,
        livello: Number.isFinite(livello)
          ? Math.max(1, Math.min(5, livello))
          : 5,
      };
    })
    .filter(
      (item): item is { nome: string; livello: number } => Boolean(item)
    );
}

function normalizeRequestType(value: unknown) {
  const normalized = asString(value).toLowerCase();

  if (
    normalized.includes("freelance") ||
    normalized.includes("partita iva")
  ) {
    return "Freelancer" as const;
  }

  if (
    normalized.includes("part-time") ||
    normalized.includes("part time")
  ) {
    return "Part-time" as const;
  }

  return "Full time" as const;
}

function normalizeRequestExperience(value: unknown) {
  const normalized = asString(value).toLowerCase();

  if (
    normalized.includes("responsabile") ||
    normalized.includes("resp.")
  ) {
    return "Resp. ufficio tecnico" as const;
  }

  if (normalized.includes("senior")) return "Senior" as const;
  if (normalized.includes("middle")) return "Middle" as const;
  return "Junior" as const;
}

function normalizeCandidateType(value: unknown) {
  const normalized = asString(value).toLowerCase();

  if (
    normalized.includes("freelance") ||
    normalized.includes("partita iva")
  ) {
    return "Freelancer partita IVA" as const;
  }

  if (
    normalized.includes("part-time") ||
    normalized.includes("part time")
  ) {
    return "Dipendente part-time" as const;
  }

  return "Dipendente full time" as const;
}

function normalizeCandidateExperience(value: unknown) {
  const normalized = asString(value).toLowerCase();

  if (normalized.includes("10+")) return "10+ anni" as const;
  if (normalized.includes("6-10")) return "6-10 anni" as const;
  if (normalized.includes("3-5")) return "3-5 anni" as const;
  return "0-2 anni" as const;
}

function normalizeProvinces(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (!item || typeof item !== "object") return "";
      return asString((item as RawRecord).province);
    })
    .filter(Boolean);
}

function mapCompanyRequest(
  raw: RawRecord
): CompanyRequestForMatching {
  const sectors = asStringArray(raw.experience_sectors);

  return {
    id: Number(raw.id ?? 0),
    codice: asString(raw.codice),
    tipologia: normalizeRequestType(raw.tipologia),
    budgetRange: asString(raw.budgetrange),
    esperienza: normalizeRequestExperience(raw.esperienza),
    regione: asString(raw.regione),
    provincia: asString(raw.provincia),
    isRemote: asBoolean(raw.isremote),
    experienceSectors: sectors.length
      ? sectors
      : asString(raw.altrosettore)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    cadRichiesti: normalizeRequiredCad(raw.cadrichiesti),
    altroCad: normalizeRequiredCad(raw.altrocad),
  };
}

function mapCandidate(raw: RawRecord): CandidateForMatching {
  return {
    id: asString(raw.user_id),
    regioni: [asString(raw.selected_region)].filter(Boolean),
    province: normalizeProvinces(raw.selected_province_entries),
    isRemote: asBoolean(raw.is_remote),
    isAllItaly: asBoolean(raw.is_all_italy),
    sectors: asStringArray(raw.sectors),
    otherSector: asString(raw.sector_other) || undefined,
    collaborationType: normalizeCandidateType(raw.collaboration_type),
    experience: normalizeCandidateExperience(raw.experience),
    budgetRange: asString(raw.budget_range),
    cadSkills: normalizeCad(raw.cad_skills),
    customCadSkills: normalizeCad(raw.custom_cad_skills),
  };
}

function calculateAge(birthDate: string) {
  if (!birthDate) return null;

  const date = new Date(`${birthDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getUTCFullYear() - date.getUTCFullYear();

  const monthDifference = today.getUTCMonth() - date.getUTCMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getUTCDate() < date.getUTCDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { error: "Link selezione non valido." },
        { status: 400 }
      );
    }

    const { data: selection, error: selectionError } = await supabase
      .from("assisted_selections")
      .select(
        `
          id,
          company_request_id,
          token,
          is_active,
          assisted_selection_designers (
            designer_id
          )
        `
      )
      .eq("token", token)
      .maybeSingle();

    if (selectionError) {
      console.error("Errore lettura selezione assistita:", selectionError);
      return NextResponse.json(
        { error: "Impossibile caricare la selezione." },
        { status: 500 }
      );
    }

    if (!selection || selection.is_active === false) {
      return NextResponse.json(
        { error: "Questa selezione non è più disponibile." },
        { status: 404 }
      );
    }

    const designerIds = Array.isArray(selection.assisted_selection_designers)
      ? selection.assisted_selection_designers
          .map((item: any) => asString(item?.designer_id))
          .filter(Boolean)
      : [];

    const { data: companyRequest, error: requestError } = await supabase
      .from("company_requests")
      .select(
        `
          id,
          codice,
          azienda,
          email,
          tipologia,
          budgetrange,
          esperienza,
          regione,
          provincia,
          isremote,
          experience_sectors,
          altrosettore,
          cadrichiesti,
          altrocad
        `
      )
      .eq("id", selection.company_request_id)
      .maybeSingle();

    if (requestError || !companyRequest) {
      console.error("Errore lettura richiesta selezione assistita:", requestError);
      return NextResponse.json(
        { error: "Richiesta aziendale non disponibile." },
        { status: 404 }
      );
    }

    if (designerIds.length === 0) {
      return NextResponse.json({
        selection: {
          token,
          requestCode: companyRequest.codice,
          companyName: companyRequest.azienda,
          requestProvince: asString(companyRequest.provincia),
        },
        designers: [],
      });
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("progettista_profiles")
      .select(
        `
          user_id,
          birth_date,
          study_title,
          study_title_other,
          experience,
          collaboration_type,
          budget_range,
          selected_region,
          selected_province_entries,
          is_all_italy,
          is_remote,
          sectors,
          sector_other,
          cad_skills,
          custom_cad_skills,
          is_search_active
        `
      )
      .in("user_id", designerIds)
      .eq("is_search_active", true);

    if (profilesError) {
      console.error(
        "Errore lettura progettisti selezione assistita:",
        profilesError
      );
      return NextResponse.json(
        { error: "Impossibile caricare i profili selezionati." },
        { status: 500 }
      );
    }

    const requestForMatching = mapCompanyRequest(companyRequest as RawRecord);

    const designers = (profiles ?? [])
      .map((profile: RawRecord) => {
        const candidate = mapCandidate(profile);
        if (candidate.isAllItaly) return null;

        const match = calculateMatch(requestForMatching, candidate);

        if (match.percentage < 70) return null;

        return {
          id: candidate.id,
          percentage: match.percentage,
          age: calculateAge(asString(profile.birth_date)),
          studyTitle: asString(profile.study_title),
          studyTitleOther: asString(profile.study_title_other),
          experience: asString(profile.experience),
          collaborationType: asString(profile.collaboration_type),
          budgetRange: asString(profile.budget_range),
          selectedRegion: asString(profile.selected_region),
          selectedProvinceEntries: Array.isArray(profile.selected_province_entries)
            ? profile.selected_province_entries
            : [],
          isRemote: asBoolean(profile.is_remote),
          cadSkills: normalizeCad(profile.cad_skills),
          customCadSkills: normalizeCad(profile.custom_cad_skills),
          sectors: asStringArray(profile.sectors),
          sectorOther: asString(profile.sector_other),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.percentage - a.percentage);

    return NextResponse.json({
      selection: {
        token,
        requestCode: asString(companyRequest.codice),
        companyName: asString(companyRequest.azienda),
        contactEmail: asString(companyRequest.email),
        requestProvince: asString(companyRequest.provincia),
      },
      designers,
    });
  } catch (error) {
    console.error("GET public assisted selection error:", error);

    return NextResponse.json(
      { error: "Errore interno del server." },
      { status: 500 }
    );
  }
}
