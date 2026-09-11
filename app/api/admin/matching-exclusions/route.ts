import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variabili NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function parsePayload(value: unknown) {
  if (!value || typeof value !== "object") return null;

  const body = value as Record<string, unknown>;
  const requestId = Number(body.request_id);
  const designerId =
    typeof body.designer_id === "string" ? body.designer_id.trim() : "";

  if (!Number.isInteger(requestId) || requestId <= 0 || !designerId) {
    return null;
  }

  return {
    request_id: requestId,
    designer_id: designerId,
  };
}

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
  }

  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("matching_exclusions")
      .select("request_id, designer_id")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      exclusions: data ?? [],
    });
  } catch (error) {
    console.error("GET matching exclusions:", error);
    return NextResponse.json(
      { error: "Impossibile caricare le esclusioni del matching." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
  }

  try {
    const payload = parsePayload(await request.json());

    if (!payload) {
      return NextResponse.json(
        { error: "request_id o designer_id non validi." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { error } = await supabase
      .from("matching_exclusions")
      .upsert(payload, {
        onConflict: "request_id,designer_id",
        ignoreDuplicates: true,
      });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST matching exclusion:", error);
    return NextResponse.json(
      { error: "Impossibile salvare l'esclusione del progettista." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 401 }
    );
  }

  try {
    const payload = parsePayload(await request.json());

    if (!payload) {
      return NextResponse.json(
        { error: "request_id o designer_id non validi." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { error } = await supabase
      .from("matching_exclusions")
      .delete()
      .eq("request_id", payload.request_id)
      .eq("designer_id", payload.designer_id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE matching exclusion:", error);
    return NextResponse.json(
      { error: "Impossibile ripristinare il progettista." },
      { status: 500 }
    );
  }
}
