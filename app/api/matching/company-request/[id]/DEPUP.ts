import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  CandidateForMatching,
  CompanyRequestForMatching,
  summarizeMatches,
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
  typeof v === "boolean" ? v :
  typeof v === "number" ? v === 1 :
  typeof v === "string" ? ["true","1","si","sì","yes"].includes(v.trim().toLowerCase()) :
  false;
const sa = (v: unknown) => Array.isArray(v) ? v.map(s).filter(Boolean) : [];

function cad(v: unknown) {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    if (typeof item === "string") return item.trim() ? { nome: item.trim(), livello: 5 } : null;
    if (!item || typeof item !== "object") return null;
    const r = item as Raw;
    const nome = s(r.nome ?? r.name ?? r.label ?? r.software);
    const rawLevel = r.livello ?? r.level ?? r.rating ?? 5;
    const livello = typeof rawLevel === "number" ? rawLevel : Number(rawLevel);
    return nome ? { nome, livello: Number.isFinite(livello) ? Math.max(1, Math.min(5, livello)) : 5 } : null;
  }).filter((x): x is { nome: string; livello: number } => Boolean(x));
}

function candidateCad(v: unknown) {
  return cad(v).map((x) => ({ name: x.nome, rating: x.livello }));
}

function requestType(v: unknown) {
  const n = s(v).toLowerCase();
  if (n.includes("freelance") || n.includes("partita iva")) return "Freelancer" as const;
  if (n.includes("part-time") || n.includes("part time")) return "Part-time" as const;
  return "Full time" as const;
}
function requestExp(v: unknown) {
  const n = s(v).toLowerCase();
  if (n.includes("responsabile") || n.includes("resp.")) return "Resp. ufficio tecnico" as const;
  if (n.includes("senior")) return "Senior" as const;
  if (n.includes("middle")) return "Middle" as const;
  return "Junior" as const;
}
function candidateType(v: unknown) {
  const n = s(v).toLowerCase();
  if (n.includes("freelance") || n.includes("partita iva")) return "Freelancer partita IVA" as const;
  if (n.includes("part-time") || n.includes("part time")) return "Dipendente part-time" as const;
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
  return v.map((item) => {
    if (typeof item === "string") return item.trim();
    if (!item || typeof item !== "object") return "";
    return s((item as Raw).province);
  }).filter(Boolean);
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
    experienceSectors: sectors.length ? sectors : s(r.altrosettore).split(",").map((x) => x.trim()).filter(Boolean),
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
      return NextResponse.json({ error: "ID richiesta non valido." }, { status: 400 });
    }

    const [requestResult, designersResult] = await Promise.all([
      supabase.from("company_requests").select("*").eq("id", requestId).single(),
      supabase.from("progettista_profiles").select(`
        user_id,
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
        profile_status
      `),
    ]);

    if (requestResult.error || !requestResult.data) {
      return NextResponse.json(
        { error: "Richiesta non trovata.", details: requestResult.error?.message },
        { status: 404 }
      );
    }

    if (designersResult.error) {
      return NextResponse.json(
        { error: "Errore nel calcolo delle compatibilità.", details: designersResult.error.message },
        { status: 500 }
      );
    }

    const requestForMatching = mapRequest(requestResult.data as Raw);

    const uniqueCandidates = new Map<string, CandidateForMatching>();

    for (const row of designersResult.data ?? []) {
      const candidate = mapCandidate(row as Raw);
      if (!candidate.id) continue;

      // Un progettista deve essere conteggiato una sola volta.
      // user_id è l'identificativo canonico del profilo.
      if (!uniqueCandidates.has(candidate.id)) {
        uniqueCandidates.set(candidate.id, candidate);
      }
    }

    const candidates = [...uniqueCandidates.values()];

    return NextResponse.json(summarizeMatches(requestForMatching, candidates));
  } catch (error) {
    return NextResponse.json(
      { error: "Errore nel calcolo dei match.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}