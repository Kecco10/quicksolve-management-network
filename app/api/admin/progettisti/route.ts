import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const adminSupabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type DeletePayload = {
  ids?: unknown[];
};

function normalizeUserIds(values: unknown) {
  if (!Array.isArray(values)) return [];

  return [
    ...new Set(
      values
        .map((value) =>
          typeof value === "string" ? value.trim() : ""
        )
        .filter(Boolean)
    ),
  ];
}

/* ============================================================
   GET
   ============================================================ */

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated(request);

  if (!isAdmin) {
    return NextResponse.json(
      {
        success: false,
        message: "Non autorizzato",
      },
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

  const uniqueDesigners = new Map<
    string,
    NonNullable<typeof data>[number]
  >();

  for (const designer of data ?? []) {
    const userId =
      typeof designer.user_id === "string"
        ? designer.user_id.trim()
        : "";

    if (!userId) continue;

    if (!uniqueDesigners.has(userId)) {
      uniqueDesigners.set(userId, designer);
    }
  }

  return NextResponse.json({
    success: true,
    designers: [...uniqueDesigners.values()],
  });
}

/* ============================================================
   DELETE
   ============================================================ */

export async function DELETE(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated(request);

  if (!isAdmin) {
    return NextResponse.json(
      {
        success: false,
        message: "Non autorizzato",
      },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as DeletePayload;

    const userIds = normalizeUserIds(body.ids);

    if (userIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Nessun progettista valido selezionato.",
        },
        { status: 400 }
      );
    }

    const {
      data: existingProfiles,
      error: existingError,
    } = await adminSupabase
      .from("progettista_profiles")
      .select("user_id, email")
      .in("user_id", userIds);

    if (existingError) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Errore verifica progettisti: ${existingError.message}`,
        },
        { status: 500 }
      );
    }

    const existingIds = [
      ...new Set(
        (existingProfiles ?? [])
          .map((profile) =>
            typeof profile.user_id === "string"
              ? profile.user_id.trim()
              : ""
          )
          .filter(Boolean)
      ),
    ];

    if (existingIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nessun progettista corrispondente trovato nel database.",
        },
        { status: 404 }
      );
    }

    const {
      data: deletedProfiles,
      error: profileDeleteError,
    } = await adminSupabase
      .from("progettista_profiles")
      .delete()
      .in("user_id", existingIds)
      .select("user_id");

    if (profileDeleteError) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Errore cancellazione progettista_profiles: ${profileDeleteError.message}`,
        },
        { status: 500 }
      );
    }

    const deletedProfileIds = [
      ...new Set(
        (deletedProfiles ?? [])
          .map((profile) =>
            typeof profile.user_id === "string"
              ? profile.user_id.trim()
              : ""
          )
          .filter(Boolean)
      ),
    ];

    const notDeleted = existingIds.filter(
      (id) => !deletedProfileIds.includes(id)
    );

    if (notDeleted.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Una o più righe non sono state eliminate da progettista_profiles.",
          notDeleted,
        },
        { status: 500 }
      );
    }

    await adminSupabase
      .from("designer_profiles")
      .delete()
      .in("user_id", existingIds);

    for (const userId of existingIds) {
      const { error: authDeleteError } =
        await adminSupabase.auth.admin.deleteUser(
          userId,
          false
        );

      if (authDeleteError) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Profilo CRM eliminato, ma eliminazione Supabase Auth fallita: ${authDeleteError.message}`,
            deletedIds: deletedProfileIds,
          },
          { status: 500 }
        );
      }
    }

    const {
      data: remainingProfiles,
      error: verifyError,
    } = await adminSupabase
      .from("progettista_profiles")
      .select("user_id")
      .in("user_id", existingIds);

    if (verifyError) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Errore verifica finale: ${verifyError.message}`,
        },
        { status: 500 }
      );
    }

    if ((remainingProfiles ?? []).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cancellazione non completata: il progettista risulta ancora presente nel database.",
          remainingProfiles,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedIds: deletedProfileIds,
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
