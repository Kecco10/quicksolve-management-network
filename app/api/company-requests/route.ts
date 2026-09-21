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

    const companyName =
      normalizeText(body.company_name);

    const companyType =
      normalizeText(body.company_type);

    const otherCompanyType =
      normalizeText(
        body.other_company_type
      ) || null;

    const companySize =
      normalizeText(body.company_size);

    const companySector =
      normalizeText(body.company_sector);

    const otherCompanySector =
      normalizeText(
        body.other_company_sector
      ) || null;

    const contactFirstName =
      normalizeText(
        body.contact_first_name
      );

    const contactLastName =
      normalizeText(
        body.contact_last_name
      );

    const contactRole =
      normalizeText(body.contact_role);

    const contactEmail =
      normalizeText(
        body.contact_email
      ).toLowerCase();

    const contactPhone =
      normalizeText(body.contact_phone);

    const requestReason =
      normalizeText(body.request_reason);

    const otherRequestReason =
      normalizeText(
        body.other_request_reason
      ) || null;

    const requestObjective =
      normalizeText(
        body.request_objective
      );

    const roleFamily =
      normalizeText(body.role_family);

    const primaryRole =
      normalizeText(body.primary_role);

    const otherRole =
      normalizeText(
        body.other_role
      ) || null;

    const secondaryRoles =
      normalizeSecondaryRoles(
        body.secondary_roles
      );

    const experienceBands =
      normalizeStringArray(
        body.experience_bands ?? body.experience_band
      );

    const managerialExperienceBands =
      normalizeStringArray(
        body.managerial_experience_bands ?? body.managerial_experience_band
      );

    const peopleManagedBand =
      normalizeText(
        body.people_managed_band
      );

    const pnlBand =
      normalizeText(body.pnl_band);

    const productionTypes =
      normalizeStringArray(
        body.production_types
      );

    const sectors =
      normalizeStringArray(
        body.sectors
      );

    const otherSector =
      normalizeText(
        body.other_sector
      ) || null;

    const methodologies =
      normalizeStringArray(
        body.methodologies
      );

    const otherMethodology =
      normalizeText(
        body.other_methodology
      ) || null;

    const region =
      normalizeText(body.region);

    const province =
      normalizeText(body.province);

    const travelRequirements =
      normalizeStringArray(
        body.travel_requirements
      );

    const travelRequired =
      travelRequirements.length > 0 ||
      body.travel_required === true;

    const assignmentTypes =
      normalizeStringArray(
        body.assignment_types
      );

    const daysPerWeek =
      Number(body.days_per_week);

    const startDate =
      normalizeText(body.start_date);

    const dailyRateBand =
      normalizeText(
        body.daily_rate_band
      );

    const requiredCertifications =
      normalizeText(
        body.required_certifications
      ) || null;

    const requiredLanguages =
      normalizeText(
        body.required_languages
      ) || null;

    const finalNotes =
      normalizeText(
        body.final_notes
      ) || null;

    const privacyAcknowledged =
      body.privacy_acknowledged === true;

    const privacyVersion =
      normalizeText(body.privacy_version);

    const termsAccepted =
      body.terms_accepted === true;

    const termsVersion =
      normalizeText(body.terms_version);

    const requiredStrings = [
      companyName,
      companyType,
      companySize,
      companySector,
      contactFirstName,
      contactLastName,
      contactRole,
      contactEmail,
      contactPhone,
      requestReason,
      requestObjective,
      roleFamily,
      primaryRole,

      peopleManagedBand,
      pnlBand,
      region,
      province,
      startDate,
      dailyRateBand,
    ];

    const invalid =
      requiredStrings.some(
        (value) => !value
      ) ||
      experienceBands.length === 0 ||
      managerialExperienceBands.length === 0 ||
      productionTypes.length === 0 ||
      sectors.length === 0 ||
      methodologies.length === 0 ||
      assignmentTypes.length === 0 ||
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 5 ||
      !privacyAcknowledged ||
      !privacyVersion ||
      !termsAccepted ||
      !termsVersion;

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

    const {
      data: requestCode,
      error: requestCodeError,
    } = await supabase.rpc(
      "next_management_request_code"
    );

    if (
      requestCodeError ||
      typeof requestCode !== "string" ||
      !requestCode
    ) {
      console.error(
        "Errore generazione codice richiesta:",
        requestCodeError
      );

      throw new Error(
        "Impossibile generare il codice richiesta."
      );
    }

    const payload = {
      request_code: requestCode,

      company_name: companyName,

      company_type: companyType,

      other_company_type:
        otherCompanyType,

      company_size: companySize,

      company_sector: companySector,

      other_company_sector:
        otherCompanySector,

      contact_first_name:
        contactFirstName,

      contact_last_name:
        contactLastName,

      contact_role: contactRole,

      contact_email: contactEmail,

      contact_phone: contactPhone,

      request_reason: requestReason,

      other_request_reason:
        otherRequestReason,

      request_objective:
        requestObjective,

      role_family: roleFamily,

      primary_role: primaryRole,

      other_role: otherRole,

      secondary_roles: secondaryRoles,

      experience_band:
        experienceBands.join(" | "),

      managerial_experience_band:
        managerialExperienceBands.join(" | "),

      people_managed_band:
        peopleManagedBand,

      pnl_band: pnlBand,

      production_types:
        productionTypes,

      sectors,

      other_sector: otherSector,

      methodologies,

      other_methodology:
        otherMethodology,

      region,

      province,

      travel_required:
        travelRequired,

      travel_requirements:
        travelRequirements,

      assignment_types:
        assignmentTypes,

      days_per_week: daysPerWeek,

      start_date: startDate,

      daily_rate_band:
        dailyRateBand,

      required_certifications:
        requiredCertifications,

      required_languages:
        requiredLanguages,

      final_notes: finalNotes,

      privacy_acknowledged:
        privacyAcknowledged,

      privacy_version:
        privacyVersion,

      terms_accepted:
        termsAccepted,

      terms_version:
        termsVersion,

      legal_accepted_at:
        new Date().toISOString(),

      status: "new",
    };

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
   PATCH — STATO / ARCHIVIAZIONE CRM
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

    const status =
      normalizeText(body.status);

    const allowedStatuses =
      new Set([
        "new",
        "in_review",
        "completed",
        "archived",
      ]);

    if (
      !allowedStatuses.has(status)
    ) {
      return NextResponse.json(
        {
          error:
            "Stato non valido.",
        },
        {
          status: 400,
        }
      );
    }

    let ids: number[] = [];

    if (Array.isArray(body.ids)) {
      ids = [
        ...new Set(
          body.ids
            .map(Number)
            .filter(
              (value) =>
                Number.isInteger(
                  value
                ) &&
                value > 0
            )
        ),
      ];
    } else {
      const id = Number(body.id);

      if (
        Number.isInteger(id) &&
        id > 0
      ) {
        ids = [id];
      }
    }

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
        .in("id", ids)
        .select("*");

    if (error) {
      throw error;
    }

    const updatedRequests =
      data ?? [];

    return NextResponse.json({
      ok: true,
      requests: updatedRequests,
      request:
        updatedRequests.length === 1
          ? updatedRequests[0]
          : null,
    });
  } catch (error) {
    console.error(
      "PATCH management company request:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile aggiornare le richieste.",
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
              Number.isInteger(
                value
              ) &&
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