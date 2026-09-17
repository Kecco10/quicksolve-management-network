import {
  NextRequest,
  NextResponse,
} from "next/server";

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

function normalizeText(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeStringArray(
  value: unknown
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item
      ): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSecondaryRoles(
  value: unknown
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item
      ): item is Record<
        string,
        unknown
      > =>
        Boolean(item) &&
        typeof item === "object"
    )
    .map((item) => ({
      family:
        normalizeText(item.family),

      role:
        normalizeText(item.role),

      other_role:
        normalizeText(
          item.other_role
        ) || null,
    }))
    .filter(
      (item) =>
        item.family &&
        item.role
    )
    .slice(0, 2);
}

function createRequestCode() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomCode =
    crypto.randomUUID()
      .slice(0, 6)
      .toUpperCase();

  return `QMN-${date}-${randomCode}`;
}

/* ============================================================
   GET — CRM
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
    const supabase =
      getSupabaseAdmin();

    const { data, error } =
      await supabase
        .from(
          "management_company_requests"
        )
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      requests: data ?? [],
    });
  } catch (error) {
    console.error(
      "GET management company requests:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare le richieste.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   POST — FORM AZIENDA
   ============================================================ */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const payload = {
      request_code:
        createRequestCode(),

      company_name:
        normalizeText(
          body.company_name
        ),

      company_type:
        normalizeText(
          body.company_type
        ),

      other_company_type:
        normalizeText(
          body.other_company_type
        ) || null,

      company_size:
        normalizeText(
          body.company_size
        ),

      company_sector:
        normalizeText(
          body.company_sector
        ),

      other_company_sector:
        normalizeText(
          body.other_company_sector
        ) || null,

      contact_first_name:
        normalizeText(
          body.contact_first_name
        ),

      contact_last_name:
        normalizeText(
          body.contact_last_name
        ),

      contact_role:
        normalizeText(
          body.contact_role
        ),

      contact_email:
        normalizeText(
          body.contact_email
        ).toLowerCase(),

      contact_phone:
        normalizeText(
          body.contact_phone
        ),

      request_reason:
        normalizeText(
          body.request_reason
        ),

      other_request_reason:
        normalizeText(
          body.other_request_reason
        ) || null,

      request_objective:
        normalizeText(
          body.request_objective
        ),

      role_family:
        normalizeText(
          body.role_family
        ),

      primary_role:
        normalizeText(
          body.primary_role
        ),

      other_role:
        normalizeText(
          body.other_role
        ) || null,

      secondary_roles:
        normalizeSecondaryRoles(
          body.secondary_roles
        ),

      experience_band:
        normalizeText(
          body.experience_band
        ),

      managerial_experience_band:
        normalizeText(
          body.managerial_experience_band
        ),

      people_managed_band:
        normalizeText(
          body.people_managed_band
        ),

      pnl_band:
        normalizeText(
          body.pnl_band
        ),

      competencies:
        normalizeStringArray(
          body.competencies
        ),

      other_competency:
        normalizeText(
          body.other_competency
        ) || null,

      production_types:
        normalizeStringArray(
          body.production_types
        ),

      sectors:
        normalizeStringArray(
          body.sectors
        ),

      other_sector:
        normalizeText(
          body.other_sector
        ) || null,

      methodologies:
        normalizeStringArray(
          body.methodologies
        ),

      other_methodology:
        normalizeText(
          body.other_methodology
        ) || null,

      region:
        normalizeText(
          body.region
        ),

      province:
        normalizeText(
          body.province
        ),

      travel_required:
        body.travel_required === true,

      assignment_types:
        normalizeStringArray(
          body.assignment_types
        ),

      days_per_week:
        Number(
          body.days_per_week
        ),

      start_date:
        normalizeText(
          body.start_date
        ),

      daily_rate_band:
        normalizeText(
          body.daily_rate_band
        ),

      required_certifications:
        normalizeText(
          body.required_certifications
        ) || null,

      required_languages:
        normalizeText(
          body.required_languages
        ) || null,

      final_notes:
        normalizeText(
          body.final_notes
        ) || null,

      privacy_acknowledged:
        body.privacy_acknowledged ===
        true,

      status: "new",
    };

    const requiredStrings = [
      payload.company_name,
      payload.company_type,
      payload.company_size,
      payload.company_sector,
      payload.contact_first_name,
      payload.contact_last_name,
      payload.contact_role,
      payload.contact_email,
      payload.contact_phone,
      payload.request_reason,
      payload.request_objective,
      payload.role_family,
      payload.primary_role,
      payload.experience_band,
      payload.managerial_experience_band,
      payload.people_managed_band,
      payload.pnl_band,
      payload.region,
      payload.province,
      payload.start_date,
      payload.daily_rate_band,
    ];

    const invalid =
      requiredStrings.some(
        (value) => !value
      ) ||
      payload.competencies.length ===
        0 ||
      payload.production_types.length ===
        0 ||
      payload.sectors.length === 0 ||
      payload.methodologies.length ===
        0 ||
      payload.assignment_types.length ===
        0 ||
      !Number.isInteger(
        payload.days_per_week
      ) ||
      payload.days_per_week < 1 ||
      payload.days_per_week > 5 ||
      !payload.privacy_acknowledged;

    if (invalid) {
      return NextResponse.json(
        {
          error:
            "Compila tutti i campi obbligatori.",
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
        .from(
          "management_company_requests"
        )
        .insert(payload)
        .select(
          `
          id,
          request_code,
          status,
          created_at
        `
        )
        .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        ok: true,
        request: data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST management company request:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile salvare la richiesta.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   PATCH — STATO CRM
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

    const id = Number(body.id);

    const status =
      normalizeText(body.status);

    const allowedStatuses =
      new Set([
        "new",
        "in_review",
        "matched",
        "closed",
        "archived",
      ]);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !allowedStatuses.has(status)
    ) {
      return NextResponse.json(
        {
          error: "Dati non validi.",
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
        .from(
          "management_company_requests"
        )
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      request: data,
    });
  } catch (error) {
    console.error(
      "PATCH management company request:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile aggiornare la richiesta.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   DELETE — CRM
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
          .map(Number)
          .filter(
            (value) =>
              Number.isInteger(value) &&
              value > 0
          )
      ),
    ];

    if (ids.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nessuna richiesta selezionata.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const { error } =
      await supabase
        .from(
          "management_company_requests"
        )
        .delete()
        .in("id", ids);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      deletedIds: ids,
    });
  } catch (error) {
    console.error(
      "DELETE management company requests:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile eliminare le richieste.",
      },
      {
        status: 500,
      }
    );
  }
}