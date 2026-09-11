import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";

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

function normalizeDesignerIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    )
  );
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated(request);

    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const requestIdRaw = request.nextUrl.searchParams.get("request_id");

    let query = supabase
      .from("assisted_selections")
      .select(
        `
          id,
          company_request_id,
          token,
          is_active,
          created_at,
          updated_at,
          assisted_selection_designers (
            designer_id
          )
        `
      )
      .order("updated_at", { ascending: false });

    if (requestIdRaw) {
      const requestId = Number(requestIdRaw);

      if (!Number.isInteger(requestId) || requestId <= 0) {
        return NextResponse.json(
          { error: "ID richiesta non valido." },
          { status: 400 }
        );
      }

      query = query.eq("company_request_id", requestId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Errore caricamento selezioni assistite:", error);
      return NextResponse.json(
        { error: "Errore nel caricamento delle selezioni assistite." },
        { status: 500 }
      );
    }

    const selections = (data ?? []).map((selection: any) => ({
      id: selection.id,
      companyRequestId: selection.company_request_id,
      token: selection.token,
      isActive: selection.is_active !== false,
      createdAt: selection.created_at,
      updatedAt: selection.updated_at,
      designerIds: Array.isArray(selection.assisted_selection_designers)
        ? selection.assisted_selection_designers
            .map((item: any) => item?.designer_id)
            .filter(Boolean)
        : [],
    }));

    if (requestIdRaw) {
      return NextResponse.json({
        selection: selections[0] ?? null,
      });
    }

    return NextResponse.json({ selections });
  } catch (error) {
    console.error("GET assisted selections error:", error);

    return NextResponse.json(
      { error: "Errore interno del server." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated(request);

    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    const companyRequestId = Number(body?.companyRequestId);
    const designerIds = normalizeDesignerIds(body?.designerIds);

    if (!Number.isInteger(companyRequestId) || companyRequestId <= 0) {
      return NextResponse.json(
        { error: "Richiesta aziendale non valida." },
        { status: 400 }
      );
    }

    if (designerIds.length === 0) {
      return NextResponse.json(
        { error: "Seleziona almeno un progettista da proporre." },
        { status: 400 }
      );
    }

    const { data: companyRequest, error: companyRequestError } = await supabase
      .from("company_requests")
      .select("id")
      .eq("id", companyRequestId)
      .maybeSingle();

    if (companyRequestError) {
      console.error(
        "Errore verifica richiesta per selezione assistita:",
        companyRequestError
      );

      return NextResponse.json(
        { error: "Errore nella verifica della richiesta aziendale." },
        { status: 500 }
      );
    }

    if (!companyRequest) {
      return NextResponse.json(
        { error: "Richiesta aziendale non trovata." },
        { status: 404 }
      );
    }

    /*
     * Regola fondamentale:
     * un progettista Non attivo non può essere salvato nella proposta.
     * La stessa verifica verrà ripetuta anche quando il link pubblico sarà aperto
     * e nel checkout.
     */
    const { data: activeDesigners, error: activeDesignersError } = await supabase
      .from("progettista_profiles")
      .select("user_id")
      .in("user_id", designerIds)
      .eq("is_search_active", true);

    if (activeDesignersError) {
      console.error(
        "Errore verifica progettisti attivi selezione assistita:",
        activeDesignersError
      );

      return NextResponse.json(
        { error: "Errore nella verifica dei progettisti selezionati." },
        { status: 500 }
      );
    }

    const activeDesignerIds = new Set(
      (activeDesigners ?? [])
        .map((designer: any) => designer?.user_id)
        .filter(Boolean)
    );

    const unavailableDesignerIds = designerIds.filter(
      (designerId) => !activeDesignerIds.has(designerId)
    );

    if (unavailableDesignerIds.length > 0) {
      return NextResponse.json(
        {
          error:
            "Uno o più progettisti selezionati non sono più attivi nelle ricerche. Aggiorna il matching e riprova.",
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const { data: selection, error: selectionError } = await supabase
      .from("assisted_selections")
      .upsert(
        {
          company_request_id: companyRequestId,
          is_active: true,
          updated_at: now,
        },
        {
          onConflict: "company_request_id",
        }
      )
      .select("id, company_request_id, token, is_active, created_at, updated_at")
      .single();

    if (selectionError || !selection) {
      console.error(
        "Errore creazione/aggiornamento selezione assistita:",
        selectionError
      );

      return NextResponse.json(
        { error: "Impossibile salvare la selezione assistita." },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from("assisted_selection_designers")
      .delete()
      .eq("selection_id", selection.id);

    if (deleteError) {
      console.error(
        "Errore pulizia progettisti selezione assistita:",
        deleteError
      );

      return NextResponse.json(
        { error: "Impossibile aggiornare i progettisti della selezione." },
        { status: 500 }
      );
    }

    const rows = designerIds.map((designerId) => ({
      selection_id: selection.id,
      designer_id: designerId,
    }));

    const { error: insertError } = await supabase
      .from("assisted_selection_designers")
      .insert(rows);

    if (insertError) {
      console.error(
        "Errore salvataggio progettisti selezione assistita:",
        insertError
      );

      return NextResponse.json(
        { error: "Impossibile salvare i progettisti della selezione." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      selection: {
        id: selection.id,
        companyRequestId: selection.company_request_id,
        token: selection.token,
        isActive: selection.is_active !== false,
        createdAt: selection.created_at,
        updatedAt: selection.updated_at,
        designerIds,
      },
    });
  } catch (error) {
    console.error("POST assisted selections error:", error);

    return NextResponse.json(
      { error: "Errore interno del server." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated(request);

    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    const companyRequestId = Number(body?.companyRequestId);
    const isActive = body?.isActive;

    if (!Number.isInteger(companyRequestId) || companyRequestId <= 0) {
      return NextResponse.json(
        { error: "Richiesta aziendale non valida." },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Stato selezione non valido." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("assisted_selections")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("company_request_id", companyRequestId)
      .select("id, company_request_id, token, is_active, created_at, updated_at")
      .maybeSingle();

    if (error) {
      console.error("Errore aggiornamento stato selezione assistita:", error);

      return NextResponse.json(
        { error: "Impossibile aggiornare lo stato della selezione." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Selezione assistita non trovata." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      selection: {
        id: data.id,
        companyRequestId: data.company_request_id,
        token: data.token,
        isActive: data.is_active !== false,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error("PATCH assisted selections error:", error);

    return NextResponse.json(
      { error: "Errore interno del server." },
      { status: 500 }
    );
  }
}
