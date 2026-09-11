import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type DeletePayload = {
  ids?: unknown[];
};

function normalizeUserIds(values: unknown) {
  if (!Array.isArray(values)) return [];

  return [...new Set(
    values
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean)
  )];
}

export async function GET() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Non autorizzato" },
      { status: 401 }
    );
  }

  const { data, error } = await adminSupabase
    .from("progettista_profiles")
    .select(`
      user_id,
      first_name,
      last_name,
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
      email,
      whatsapp,
      linkedin,
      created_at,
      updated_at,
      profile_status
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Errore caricamento CRM: ${error.message}`,
      },
      { status: 500 }
    );
  }

  // Protezione aggiuntiva contro eventuali righe duplicate.
  const uniqueByUserId = new Map<string, (typeof data)[number]>();

  for (const designer of data ?? []) {
    const userId = typeof designer.user_id === "string" ? designer.user_id : "";
    if (!userId) continue;
    if (!uniqueByUserId.has(userId)) uniqueByUserId.set(userId, designer);
  }

  return NextResponse.json({
    success: true,
    designers: [...uniqueByUserId.values()],
  });
}

export async function DELETE(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Non autorizzato" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as DeletePayload;
    const userIds = normalizeUserIds(body.ids);

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Nessun progettista valido selezionato." },
        { status: 400 }
      );
    }

    const deletedIds: string[] = [];
    const errors: { userId: string; message: string }[] = [];

    for (const userId of userIds) {
      /*
       * 1. Eliminiamo tutte le tracce applicative.
       * progettista_profiles è la tabella canonica.
       */
      const { error: profileError } = await adminSupabase
        .from("progettista_profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) {
        errors.push({
          userId,
          message: `progettista_profiles: ${profileError.message}`,
        });
        continue;
      }

      /*
       * 2. Eliminiamo anche l'eventuale vecchia copia in designer_profiles.
       * La tabella esiste nel progetto come struttura legacy.
       */
      const { error: legacyError } = await adminSupabase
        .from("designer_profiles")
        .delete()
        .eq("user_id", userId);

      // Se la tabella legacy non contiene la riga va bene.
      // Se restituisce un vero errore lo segnaliamo ma continuiamo con Auth.
      if (legacyError) {
        errors.push({
          userId,
          message: `designer_profiles: ${legacyError.message}`,
        });
      }

      /*
       * 3. Hard delete da Supabase Auth.
       * Questo è il passaggio che libera realmente l'email e permette
       * una futura nuova iscrizione con lo stesso indirizzo.
       */
      const { error: authError } = await adminSupabase.auth.admin.deleteUser(
        userId,
        false
      );

      if (authError) {
        errors.push({
          userId,
          message: `Supabase Auth: ${authError.message}`,
        });
        continue;
      }

      deletedIds.push(userId);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: deletedIds.length > 0,
          deletedIds,
          errors,
          message:
            deletedIds.length > 0
              ? "Alcuni progettisti sono stati eliminati, ma alcune operazioni richiedono verifica."
              : "Eliminazione non completata.",
        },
        { status: deletedIds.length > 0 ? 207 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedIds,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Errore imprevisto durante l'eliminazione.",
      },
      { status: 500 }
    );
  }
}