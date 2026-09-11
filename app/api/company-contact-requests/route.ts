import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configurazione Supabase mancante.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeDesignerIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requestCode =
      typeof body?.requestCode === "string" ? body.requestCode.trim() : "";

    const designerIds = normalizeDesignerIds(body?.designerIds);

    if (!requestCode) {
      return NextResponse.json(
        { error: "Codice richiesta mancante." },
        { status: 400 }
      );
    }

    if (designerIds.length === 0) {
      return NextResponse.json(
        { error: "Seleziona almeno un progettista." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: companyRequest, error: companyRequestError } = await supabase
      .from("company_requests")
      .select("id, codice")
      .eq("codice", requestCode)
      .maybeSingle();

    if (companyRequestError) {
      throw companyRequestError;
    }

    if (!companyRequest) {
      return NextResponse.json(
        { error: "Richiesta aziendale non trovata." },
        { status: 404 }
      );
    }

    const { data: designers, error: designersError } = await supabase
      .from("progettista_profiles")
      .select("user_id, is_search_active")
      .in("user_id", designerIds);

    if (designersError) {
      throw designersError;
    }

    const activeDesignerIds = new Set(
      (designers ?? [])
        .filter((designer) => designer.is_search_active !== false)
        .map((designer) => designer.user_id)
    );

    const containsUnavailableDesigner =
      activeDesignerIds.size !== designerIds.length ||
      designerIds.some((designerId) => !activeDesignerIds.has(designerId));

    if (containsUnavailableDesigner) {
      return NextResponse.json(
        {
          error:
            "Uno o più profili selezionati non sono più disponibili. Aggiorna la ricerca e riprova.",
        },
        { status: 409 }
      );
    }

    const { data: savedRequest, error: saveError } = await supabase
      .from("company_contact_requests")
      .insert({
        company_request_id: companyRequest.id,
        request_code: requestCode,
        designer_ids: designerIds,
        status: "new",
      })
      .select("id, status, created_at")
      .single();

    if (saveError) {
      throw saveError;
    }

    return NextResponse.json({
      ok: true,
      contactRequest: savedRequest,
    });
  } catch (error) {
    console.error("company-contact-requests POST error:", error);

    return NextResponse.json(
      { error: "Impossibile inoltrare la richiesta." },
      { status: 500 }
    );
  }
}
