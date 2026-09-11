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
      .from("company_contact_requests")
      .select("id, company_request_id, request_code, designer_ids, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      requests: data ?? [],
    });
  } catch (error) {
    console.error("GET admin company contact requests:", error);

    return NextResponse.json(
      { error: "Impossibile caricare i profili richiesti dalle aziende." },
      { status: 500 }
    );
  }
}
