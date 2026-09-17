import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configurazione Supabase mancante."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

const allowedStatuses = new Set([
  "registered",
  "qualified",
  "contracted",
]);

/* ============================================================
   GET
   ============================================================ */

export async function GET(
  request: NextRequest
) {
  const isAdmin =
    await isAdminAuthenticated(request);

  if (!isAdmin) {
    return NextResponse.json(
      {
        error: "Non autorizzato",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("manager_profiles")
      .select("*")
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const uniqueManagers = new Map<
      string,
      Record<string, unknown>
    >();

    for (const manager of data ?? []) {
      const userId =
        typeof manager.user_id === "string"
          ? manager.user_id.trim()
          : "";

      if (!userId) {
        continue;
      }

      if (!uniqueManagers.has(userId)) {
        uniqueManagers.set(
          userId,
          manager
        );
      }
    }

    return NextResponse.json({
      managers: [
        ...uniqueManagers.values(),
      ],
    });
  } catch (error) {
    console.error(
      "GET admin managers:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare i manager.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   PATCH
   ============================================================ */

export async function PATCH(
  request: NextRequest
) {
  const isAdmin =
    await isAdminAuthenticated(request);

  if (!isAdmin) {
    return NextResponse.json(
      {
        error: "Non autorizzato",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const userId =
      typeof body.user_id === "string"
        ? body.user_id.trim()
        : "";

    if (!userId) {
      return NextResponse.json(
        {
          error: "Manager non valido.",
        },
        {
          status: 400,
        }
      );
    }

    const update: Record<
      string,
      unknown
    > = {};

    if (
      typeof body.profile_status ===
      "string"
    ) {
      if (
        !allowedStatuses.has(
          body.profile_status
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Stato manager non valido.",
          },
          {
            status: 400,
          }
        );
      }

      update.profile_status =
        body.profile_status;
    }

    if (
      typeof body.profile_visibility_enabled ===
      "boolean"
    ) {
      update.profile_visibility_enabled =
        body.profile_visibility_enabled;
    }

    if (
      Object.keys(update).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Nessuna modifica valida.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const { data, error } =
      await supabase
        .from("manager_profiles")
        .update(update)
        .eq("user_id", userId)
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      manager: data,
    });
  } catch (error) {
    console.error(
      "PATCH admin manager:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile aggiornare il manager.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   DELETE
   ============================================================ */

export async function DELETE(
  request: NextRequest
) {
  const isAdmin =
    await isAdminAuthenticated(request);

  if (!isAdmin) {
    return NextResponse.json(
      {
        error: "Non autorizzato",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      (await request.json()) as {
        ids?: unknown[];
      };

    const ids = [
      ...new Set(
        (
          Array.isArray(body.ids)
            ? body.ids
            : []
        )
          .filter(
            (
              value
            ): value is string =>
              typeof value ===
              "string"
          )
          .map((value) =>
            value.trim()
          )
          .filter(Boolean)
      ),
    ];

    if (ids.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nessun manager selezionato.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    /*
     * Prima eliminiamo gli eventuali
     * consensi collegati.
     */
    const {
      error: consentError,
    } = await supabase
      .from("manager_consents")
      .delete()
      .in("user_id", ids);

    if (consentError) {
      throw consentError;
    }

    /*
     * Poi il profilo manager.
     */
    const {
      error: profileError,
    } = await supabase
      .from("manager_profiles")
      .delete()
      .in("user_id", ids);

    if (profileError) {
      throw profileError;
    }

    /*
     * Infine Supabase Auth.
     */
    for (const userId of ids) {
      const {
        error: authDeleteError,
      } =
        await supabase.auth.admin.deleteUser(
          userId,
          false
        );

      if (authDeleteError) {
        throw authDeleteError;
      }
    }

    return NextResponse.json({
      ok: true,
      deletedIds: ids,
    });
  } catch (error) {
    console.error(
      "DELETE admin managers:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile eliminare i manager selezionati.",
      },
      {
        status: 500,
      }
    );
  }
}