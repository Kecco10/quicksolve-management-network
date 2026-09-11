import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type RatedCad = {
  nome: string;
  livello: number;
};

type CreateCompanyRequestPayload = {
  companyName?: string;
  companyType?: string;
  companyTypeOther?: string;
  companySize?: string;
  companySector?: string;
  companySectorOther?: string;
  contactName?: string;
  contactRole?: string;
  contactPhone?: string;
  contactEmail?: string;
  employmentType?: string;
  experienceLevel?: string;
  jobDescription?: string;
  employeeEconomicRange?: string;
  freelanceEconomicRange?: string;
  experienceSectors?: string[];
  otherSectorText?: string;
  cadSkills?: { name?: string; selected?: boolean }[];
  otherSoftwareText?: string;
  selectedRegion?: string;
  selectedProvince?: string;
  isRemote?: boolean;
  workModes?: string[];
  note?: string;
  privacyAcknowledged?: boolean;
  privacyVersion?: string;
  termsAccepted?: boolean;
  termsVersion?: string;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "si", "sì", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value === 1;
  return false;
}

function normalizeTipologia(value: unknown) {
  const normalized = cleanString(value).toLowerCase();
  if (normalized.includes("freelance") || normalized.includes("partita iva")) return "Freelancer";
  if (normalized.includes("part-time") || normalized.includes("part time")) return "Part-time";
  return "Full time";
}

function normalizeEsperienza(value: unknown) {
  const normalized = cleanString(value).toLowerCase();
  if (normalized.includes("responsabile ufficio tecnico") || normalized.includes("resp. ufficio tecnico")) return "Resp. ufficio tecnico";
  if (normalized.includes("senior")) return "Senior";
  if (normalized.includes("middle")) return "Middle";
  return "Junior";
}

function normalizeCompanySize(value: unknown) {
  const normalized = cleanString(value).toLowerCase();
  if (normalized.includes("grande") || normalized.includes("250-999") || normalized.includes("oltre 1000")) return "Grande impresa";
  if (normalized.includes("media") || normalized.includes("50-249")) return "Media impresa";
  if (normalized.includes("piccola") || normalized.includes("1-9") || normalized.includes("10-49")) return "Piccola impresa";
  return "Piccola impresa";
}

function normalizeCadSkills(value: unknown): RatedCad[] {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((item) => {
      if (typeof item === "string") {
        const nome = cleanString(item);
        return nome ? { nome, livello: 5 } : null;
      }

      if (!item || typeof item !== "object") return null;

      const source = item as Record<string, unknown>;
      // Some older payloads may omit "selected" because the array already
      // contains only the selected CADs. Treat those entries as selected.
      if (source.selected !== undefined && !toBoolean(source.selected)) return null;

      const nome = cleanString(source.name ?? source.nome ?? source.label ?? source.software ?? source.cad);
      const livelloRaw = source.livello ?? source.level ?? source.rating ?? source.valore ?? 5;
      const livello = typeof livelloRaw === "number" ? livelloRaw : Number(livelloRaw);

      if (!nome) return null;
      return { nome, livello: Number.isFinite(livello) ? livello : 5 };
    })
    .filter((item): item is RatedCad => Boolean(item));

  return normalized.filter(
    (item, index, array) =>
      array.findIndex((candidate) => candidate.nome.toLowerCase() === item.nome.toLowerCase()) === index
  );
}

function normalizeRatedCadList(value: unknown): RatedCad[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const nome = cleanString(source.nome ?? source.name ?? source.label ?? source.software ?? source.cad);
      const livelloRaw = source.livello ?? source.level ?? source.rating ?? source.valore ?? 5;
      const livello = typeof livelloRaw === "number" ? livelloRaw : typeof livelloRaw === "string" ? Number(livelloRaw) : 5;
      if (!nome) return null;
      return { nome, livello: Number.isFinite(livello) ? livello : 5 };
    })
    .filter((item): item is RatedCad => Boolean(item));
}

function normalizeBudgetRange(value: unknown) {
  const normalized = cleanString(value);
  if (!normalized) return "";

  const aliases: Record<string, string> = {
    "60.000+ €": "> 60.000 €",
    "50+ €/h": "> 50 €/h",
  };

  return aliases[normalized] ?? normalized;
}

function pickBudgetRange(body: CreateCompanyRequestPayload, tipologia: string) {
  if (tipologia === "Freelancer") {
    return normalizeBudgetRange(body.freelanceEconomicRange) || normalizeBudgetRange(body.employeeEconomicRange);
  }
  return normalizeBudgetRange(body.employeeEconomicRange) || normalizeBudgetRange(body.freelanceEconomicRange);
}

function buildZonaOperativa(isRemote: boolean, regione: string, provincia: string) {
  const presence = provincia || regione;
  if (isRemote && presence) return `Remoto + Presenza (${presence})`;
  if (isRemote) return "Remoto";
  return presence;
}

function buildNextRequestCode(currentRequests: { codice: string | null }[]) {
  const maxNumber = currentRequests.reduce((max, item) => {
    const current = Number(String(item.codice ?? "").replace(/\D/g, ""));
    return Number.isFinite(current) && current > max ? current : max;
  }, 0);
  return `RQ-${String(maxNumber + 1).padStart(3, "0")}`;
}

function adminUnauthorized() {
  return NextResponse.json(
    { error: "Accesso amministratore non autorizzato." },
    { status: 401 }
  );
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return adminUnauthorized();
  }

  const { data, error } = await supabase
    .from("company_requests")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Errore nel caricamento delle richieste.", details: error.message },
      { status: 500 }
    );
  }

  const requests = data ?? [];
  const requestIds = requests
    .map((item) => Number(item.id))
    .filter((id) => Number.isFinite(id));

  if (requestIds.length === 0) {
    return NextResponse.json({ requests: [] });
  }

  const { data: paidPurchases, error: paidPurchasesError } = await supabase
    .from("purchases")
    .select(
      "id, request_id, plan_id, selected_count, paid_at, stripe_checkout_session_id, pdf_storage_path"
    )
    .eq("status", "paid")
    .in("request_id", requestIds)
    .order("paid_at", { ascending: false });

  if (paidPurchasesError) {
    return NextResponse.json(
      {
        error: "Errore nel caricamento dello stato pagamenti.",
        details: paidPurchasesError.message,
      },
      { status: 500 }
    );
  }

  const latestPaidPurchaseByRequest = new Map<number, Record<string, unknown>>();

  for (const purchase of paidPurchases ?? []) {
    const requestId = Number(purchase.request_id);
    if (!Number.isFinite(requestId) || latestPaidPurchaseByRequest.has(requestId)) {
      continue;
    }

    latestPaidPurchaseByRequest.set(requestId, purchase as Record<string, unknown>);
  }

  const enrichedRequests = requests.map((item) => {
    const paidPurchase = latestPaidPurchaseByRequest.get(Number(item.id));
    const stripeSessionId = cleanString(
      paidPurchase?.stripe_checkout_session_id
    );

    return {
      ...item,
      completed: Boolean(paidPurchase),
      completed_at: paidPurchase?.paid_at ?? null,
      completed_purchase_id: paidPurchase?.id ?? null,
      completed_plan_id: paidPurchase?.plan_id ?? null,
      completed_selected_count: paidPurchase?.selected_count ?? null,
      pdf_storage_path: paidPurchase?.pdf_storage_path ?? null,
      purchase_pdf_url: stripeSessionId
        ? `/api/purchases/pdf?session_id=${encodeURIComponent(stripeSessionId)}`
        : null,
    };
  });

  return NextResponse.json({ requests: enrichedRequests });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCompanyRequestPayload;

    const companyName = cleanString(body.companyName);
    const companyType = cleanString(body.companyType);
    const companyTypeOther = cleanString(body.companyTypeOther);
    const companySize = normalizeCompanySize(body.companySize);
    const companySector = cleanString(body.companySector);
    const companySectorOther = cleanString(body.companySectorOther);
    const contactName = cleanString(body.contactName);
    const contactRole = cleanString(body.contactRole);
    const contactPhone = cleanString(body.contactPhone);
    const contactEmail = cleanString(body.contactEmail);
    const employmentType = cleanString(body.employmentType);
    const tipologia = normalizeTipologia(employmentType);
    const esperienza = normalizeEsperienza(body.experienceLevel);
    const employeeRange = cleanString(body.employeeEconomicRange);
    const freelanceRange = cleanString(body.freelanceEconomicRange);
    const budgetRange = pickBudgetRange(body, tipologia);
    const jobDescription = cleanString(body.jobDescription);
    const regione = cleanString(body.selectedRegion);
    const provincia = cleanString(body.selectedProvince);
    const isRemote = toBoolean(body.isRemote) || (Array.isArray(body.workModes) && body.workModes.includes("Remoto"));
    const zonaOperativa = buildZonaOperativa(isRemote, regione, provincia);
    const selectedSectors = Array.isArray(body.experienceSectors)
      ? body.experienceSectors.map(cleanString).filter(Boolean)
      : [];

    const companySectorValue = cleanString(body.companySector);
    const companySectorOtherValue = cleanString(body.companySectorOther);
    const otherSectorValue = cleanString(body.otherSectorText);

    // These are two different fields in the request form:
    // 1) companySector = the company's own sector
    // 2) experienceSectors/otherSectorText = sectors requested for the profile
    const settorePrincipale =
      companySectorValue === "Altro"
        ? companySectorOtherValue || "Altro"
        : companySectorValue || "Non indicato";

    const requestedSectors = [
      ...selectedSectors,
      otherSectorValue,
    ]
      .map(cleanString)
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);
    const cadRichiesti = normalizeCadSkills(body.cadSkills);
    const altroCad = normalizeRatedCadList(body.otherSoftwareText ? [{ nome: body.otherSoftwareText, livello: 5 }] : []);
    const note = cleanString(body.note) || null;
    const privacyAcknowledged = body.privacyAcknowledged === true;
    const privacyVersion = cleanString(body.privacyVersion);
    const termsAccepted = body.termsAccepted === true;
    const termsVersion = cleanString(body.termsVersion);

    if (!privacyAcknowledged || !privacyVersion || !termsAccepted || !termsVersion) {
      return NextResponse.json(
        {
          error: "Privacy e Condizioni di utilizzo non accettate.",
          details: "È necessario prendere visione dell'Informativa Privacy e accettare le Condizioni di utilizzo prima dell'invio.",
        },
        { status: 400 }
      );
    }

    if (!companyName || !contactName || !contactEmail || !contactPhone || !employmentType || !jobDescription) {
      return NextResponse.json(
        {
          error: "Campi obbligatori mancanti.",
          details: "companyName, contactName, contactEmail, contactPhone, employmentType e jobDescription sono obbligatori.",
        },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(contactEmail)) {
      return NextResponse.json(
        {
          error: "Email referente non valida.",
          details: "Inserisci un indirizzo email valido prima di inviare la richiesta.",
        },
        { status: 400 }
      );
    }

    const { data: currentRequests, error: codeError } = await supabase
      .from("company_requests")
      .select("codice")
      .not("codice", "is", null);

    if (codeError) {
      return NextResponse.json(
        { error: "Errore nella generazione del codice richiesta.", details: codeError.message },
        { status: 500 }
      );
    }

    const payload = {
      codice: buildNextRequestCode((currentRequests ?? []) as { codice: string | null }[]),
      azienda: companyName,
      referente: contactName,
      email: contactEmail,
      telefono: contactPhone,
      linkedin: null,
      datarichiesta: new Date().toISOString(),
      jobtitle: cleanString(body.contactRole) || "Figura tecnica richiesta",
      tipologia,
      budgetrange: budgetRange,
      esperienza,
      regione,
      provincia,
      isremote: isRemote,
      zonaoperativa: zonaOperativa,
      // Company sector and requested experience sectors are intentionally separate.
      settoreprincipale: settorePrincipale,
      altrosettore:
        companySectorValue === "Altro" ? companySectorOtherValue || null : null,
      experience_sectors: requestedSectors,
      cadrichiesti: cadRichiesti,
      altrocad: altroCad,
      companysize: companySize,
      employeerange: cleanString(body.companySize) || null,
      jobdescription: jobDescription,
      note,
      archived: false,
      privacy_version: privacyVersion,
      privacy_acknowledged_at: new Date().toISOString(),
      terms_version: termsVersion,
      terms_accepted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("company_requests")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Errore nel salvataggio della richiesta.", details: error.message, payload },
        { status: 500 }
      );
    }

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Errore nella creazione della richiesta.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return adminUnauthorized();
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((value: unknown) => Number(value)).filter((value: number) => Number.isFinite(value))
      : [];
    const archived = toBoolean(body?.archived);

    if (ids.length === 0) {
      return NextResponse.json({ error: "Nessun ID valido ricevuto." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("company_requests")
      .update({ archived })
      .in("id", ids)
      .select("id, archived");

    if (error) {
      return NextResponse.json(
        { error: "Errore durante l'aggiornamento delle richieste.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, updated: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Errore durante l'aggiornamento delle richieste.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return adminUnauthorized();
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((value: unknown) => Number(value)).filter((value: number) => Number.isFinite(value))
      : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "Nessun ID valido ricevuto." }, { status: 400 });
    }

    const { error } = await supabase.from("company_requests").delete().in("id", ids);

    if (error) {
      return NextResponse.json(
        { error: "Errore durante l'eliminazione delle richieste.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deletedIds: ids });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Errore durante l'eliminazione delle richieste.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}