import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  CandidateForMatching,
  CompanyRequestForMatching,
  calculateMatch,
} from "@/lib/matching-engine";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Raw = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const b = (v: unknown) =>
  typeof v === "boolean"
    ? v
    : typeof v === "number"
    ? v === 1
    : typeof v === "string"
    ? ["true", "1", "si", "sì", "yes"].includes(v.trim().toLowerCase())
    : false;
const sa = (v: unknown) => (Array.isArray(v) ? v.map(s).filter(Boolean) : []);

function cad(v: unknown) {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (typeof item === "string")
        return item.trim() ? { nome: item.trim(), livello: 5 } : null;
      if (!item || typeof item !== "object") return null;
      const r = item as Raw;
      const nome = s(r.nome ?? r.name ?? r.label ?? r.software);
      const rawLevel = r.livello ?? r.level ?? r.rating ?? 5;
      const livello = typeof rawLevel === "number" ? rawLevel : Number(rawLevel);
      return nome
        ? {
            nome,
            livello: Number.isFinite(livello)
              ? Math.max(1, Math.min(5, livello))
              : 5,
          }
        : null;
    })
    .filter((x): x is { nome: string; livello: number } => Boolean(x));
}

function candidateCad(v: unknown) {
  if (!Array.isArray(v)) return [];

  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const r = item as Raw;
      const name = s(r.name ?? r.nome ?? r.label ?? r.software);
      const rawRating = r.rating ?? r.livello ?? r.level ?? 0;
      const rating =
        typeof rawRating === "number" ? rawRating : Number(rawRating);

      if (!name || !Number.isFinite(rating) || rating <= 0) return null;

      return { name, rating: Math.min(5, rating) };
    })
    .filter(
      (item): item is { name: string; rating: number } => Boolean(item)
    );
}

function requestType(v: unknown) {
  const n = s(v).toLowerCase();
  if (n.includes("freelance") || n.includes("partita iva"))
    return "Freelancer" as const;
  if (n.includes("part-time") || n.includes("part time"))
    return "Part-time" as const;
  return "Full time" as const;
}

function requestExp(v: unknown) {
  const n = s(v).toLowerCase();
  if (n.includes("responsabile") || n.includes("resp."))
    return "Resp. ufficio tecnico" as const;
  if (n.includes("senior")) return "Senior" as const;
  if (n.includes("middle")) return "Middle" as const;
  return "Junior" as const;
}

function candidateType(v: unknown) {
  const n = s(v).toLowerCase();
  if (n.includes("freelance") || n.includes("partita iva"))
    return "Freelancer partita IVA" as const;
  if (n.includes("part-time") || n.includes("part time"))
    return "Dipendente part-time" as const;
  return "Dipendente full time" as const;
}

function candidateExp(v: unknown) {
  const n = s(v).toLowerCase();
  if (n.includes("10+")) return "10+ anni" as const;
  if (n.includes("6-10")) return "6-10 anni" as const;
  if (n.includes("3-5")) return "3-5 anni" as const;
  return "0-2 anni" as const;
}

function provinces(v: unknown) {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (!item || typeof item !== "object") return "";
      return s((item as Raw).province);
    })
    .filter(Boolean);
}

function mapRequest(r: Raw): CompanyRequestForMatching {
  const sectors = sa(r.experience_sectors);

  return {
    id: Number(r.id ?? 0),
    codice: s(r.codice),
    tipologia: requestType(r.tipologia),
    budgetRange: s(r.budgetrange),
    esperienza: requestExp(r.esperienza),
    regione: s(r.regione),
    provincia: s(r.provincia),
    isRemote: b(r.isremote),
    experienceSectors: sectors.length
      ? sectors
      : s(r.altrosettore)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
    cadRichiesti: cad(r.cadrichiesti),
    altroCad: cad(r.altrocad),
  };
}

function mapCandidate(r: Raw): CandidateForMatching {
  return {
    id: s(r.user_id),
    regioni: [s(r.selected_region)].filter(Boolean),
    province: provinces(r.selected_province_entries),
    isRemote: b(r.is_remote),
    isAllItaly: b(r.is_all_italy),
    sectors: sa(r.sectors),
    otherSector: s(r.sector_other) || undefined,
    collaborationType: candidateType(r.collaboration_type),
    experience: candidateExp(r.experience),
    budgetRange: s(r.budget_range),
    cadSkills: candidateCad(r.cad_skills),
    customCadSkills: candidateCad(r.custom_cad_skills),
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const requestId = Number(id);

    if (!Number.isFinite(requestId)) {
      return NextResponse.json(
        { error: "ID richiesta non valido." },
        { status: 400 }
      );
    }

    const [requestResult, designersResult] = await Promise.all([
      supabase
        .from("company_requests")
        .select("*")
        .eq("id", requestId)
        .single(),

      supabase.from("progettista_profiles").select(`
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
        profile_status,
        is_search_active
      `)
        .eq("is_search_active", true),
    ]);

    if (requestResult.error || !requestResult.data) {
      return NextResponse.json(
        {
          error: "Richiesta non trovata.",
          details: requestResult.error?.message,
        },
        { status: 404 }
      );
    }

    if (designersResult.error) {
      return NextResponse.json(
        {
          error: "Errore nel calcolo delle compatibilità.",
          details: designersResult.error.message,
        },
        { status: 500 }
      );
    }

    const requestForMatching = mapRequest(requestResult.data as Raw);

    const uniqueRows = new Map<string, Raw>();

    for (const row of designersResult.data ?? []) {
      const raw = row as Raw;
      const userId = s(raw.user_id);
      if (!userId) continue;

      if (!uniqueRows.has(userId)) {
        uniqueRows.set(userId, raw);
      }
    }

    const matches = [...uniqueRows.values()]
      .map((raw) => {
        const candidate = mapCandidate(raw);

        // I vecchi profili "Tutta Italia" restano esclusi finché
        // il progettista non aggiorna la propria zona operativa.
        if (candidate.isAllItaly) return null;

        const breakdown = calculateMatch(requestForMatching, candidate);

        if (breakdown.percentage < 80) return null;

        return {
          percentage: breakdown.percentage,
          candidate: {
            id: candidate.id,

            // Dati professionali anonimi necessari alla card aziendale.
            // Nome, cognome, email e telefono NON vengono restituiti.
            birth_date: s(raw.birth_date),
            study_title: s(raw.study_title),
            study_title_other: s(raw.study_title_other),
            experience: candidate.experience,
            collaboration_type: candidate.collaborationType,
            budget_range: candidate.budgetRange,
            selected_region: s(raw.selected_region),
            selected_province_entries: Array.isArray(
              raw.selected_province_entries
            )
              ? raw.selected_province_entries
              : [],
            is_remote: candidate.isRemote,
            cad_skills: candidate.cadSkills,
            custom_cad_skills: candidate.customCadSkills,
            sectors: candidate.sectors,
            sector_other: candidate.otherSector ?? "",
          },
        };
      })
      .filter(
        (
          match
        ): match is NonNullable<typeof match> => match !== null
      )
      .sort((a, b) => b.percentage - a.percentage);

    if (matches.length > 0) {
      const appearanceRows = matches.map((match) => ({
        request_id: requestId,
        designer_id: match.candidate.id,
      }));

      const { error: appearanceError } = await supabase
        .from("designer_search_appearances")
        .upsert(appearanceRows, {
          onConflict: "request_id,designer_id",
          ignoreDuplicates: true,
        });

      if (appearanceError) {
        console.error(
          "Errore registrazione presenze nelle ricerche:",
          appearanceError
        );
      }
    }

    return NextResponse.json({
      total: matches.length,
      searchStatus: matches.length > 0 ? "matches_found" : "search_in_progress",
      matches,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Errore nel calcolo dei match.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
