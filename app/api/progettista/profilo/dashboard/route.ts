import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Variabili Supabase server mancanti.");
}

const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const [
      profileResult,
      appearancesResult,
      paidPurchasesResult,
    ] = await Promise.all([
      admin
        .from("progettista_profiles")
        .select("is_search_active")
        .eq("user_id", user.id)
        .maybeSingle(),

      admin
        .from("designer_search_appearances")
        .select("id", { count: "exact", head: true })
        .eq("designer_id", user.id),

      admin
        .from("purchases")
        .select("id")
        .eq("status", "paid"),
    ]);

    if (profileResult.error) {
      throw new Error(profileResult.error.message);
    }

    if (appearancesResult.error) {
      throw new Error(appearancesResult.error.message);
    }

    if (paidPurchasesResult.error) {
      throw new Error(paidPurchasesResult.error.message);
    }

    const paidPurchaseIds = (paidPurchasesResult.data ?? []).map((row) =>
      String(row.id)
    );

    let contactUnlocks = 0;

    if (paidPurchaseIds.length > 0) {
      const unlocksResult = await admin
        .from("purchase_designers")
        .select("purchase_id", { count: "exact", head: true })
        .eq("designer_id", user.id)
        .in("purchase_id", paidPurchaseIds);

      if (unlocksResult.error) {
        throw new Error(unlocksResult.error.message);
      }

      contactUnlocks = unlocksResult.count ?? 0;
    }

    return NextResponse.json({
      success: true,
      searchAppearances: appearancesResult.count ?? 0,
      contactUnlocks,
      isSearchActive: profileResult.data?.is_search_active !== false,
    });
  } catch (error) {
    console.error("Errore dashboard progettista:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Errore durante il caricamento della dashboard.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const body = (await request.json()) as {
      isSearchActive?: unknown;
    };

    if (typeof body.isSearchActive !== "boolean") {
      return NextResponse.json(
        { error: "Valore disponibilità non valido." },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from("progettista_profiles")
      .update({
        is_search_active: body.isSearchActive,
      })
      .eq("user_id", user.id)
      .select("is_search_active")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      isSearchActive: data.is_search_active !== false,
    });
  } catch (error) {
    console.error("Errore aggiornamento disponibilità progettista:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile aggiornare la disponibilità.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    /*
     * Prima rimuoviamo i dati operativi del profilo.
     * Le registrazioni economiche/storiche già presenti in purchases e
     * purchase_designers non vengono modificate da questa API.
     */
    const { error: appearancesError } = await admin
      .from("designer_search_appearances")
      .delete()
      .eq("designer_id", user.id);

    if (appearancesError) {
      throw new Error(appearancesError.message);
    }

    const { error: profileError } = await admin
      .from("progettista_profiles")
      .delete()
      .eq("user_id", user.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: authError } = await admin.auth.admin.deleteUser(user.id);

    if (authError) {
      throw new Error(authError.message);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Errore eliminazione account progettista:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile eliminare l'account.",
      },
      { status: 500 }
    );
  }
}
