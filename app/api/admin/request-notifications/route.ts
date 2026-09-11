import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function isAdminAuthorized(request: NextRequest) {
  return request.cookies.get("qs_admin_auth")?.value === "authenticated";
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { data: state, error: stateError } = await supabase
    .from("admin_notification_state")
    .select("last_seen_company_request_id")
    .eq("id", 1)
    .maybeSingle();

  if (stateError) {
    return NextResponse.json(
      { error: "Errore stato notifiche.", details: stateError.message },
      { status: 500 }
    );
  }

  const lastSeenId = Number(state?.last_seen_company_request_id ?? 0);

  const { count, error: countError } = await supabase
    .from("company_requests")
    .select("id", { count: "exact", head: true })
    .gt("id", lastSeenId)
    .eq("archived", false);

  if (countError) {
    return NextResponse.json(
      { error: "Errore conteggio richieste.", details: countError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ unreadCount: count ?? 0 });
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { data: latestRequest, error: latestError } = await supabase
    .from("company_requests")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    return NextResponse.json(
      { error: "Errore ultima richiesta.", details: latestError.message },
      { status: 500 }
    );
  }

  const latestId = Number(latestRequest?.id ?? 0);

  const { error: updateError } = await supabase
    .from("admin_notification_state")
    .upsert(
      {
        id: 1,
        last_seen_company_request_id: latestId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (updateError) {
    return NextResponse.json(
      { error: "Errore aggiornamento notifiche.", details: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, unreadCount: 0 });
}