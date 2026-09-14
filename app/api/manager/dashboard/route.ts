import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function adminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configurazione Supabase mancante.");
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanSecondaryRoles(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const family = cleanString(raw.family);
      const role = cleanString(raw.role);
      if (!family || !role) return null;
      return { family, role };
    })
    .filter(
      (item): item is { family: string; role: string } => item !== null
    )
    .slice(0, 2);
}

function cleanGeographicAreas(value: unknown) {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const region = cleanString(raw.region);
      const province = cleanString(raw.province);
      if (!region || !province) return null;

      const key = `${region.toLowerCase()}::${province.toLowerCase()}`;
      if (seen.has(key)) return null;
      seen.add(key);

      return { region, province };
    })
    .filter(
      (item): item is { region: string; province: string } => item !== null
    );
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
    }

    const admin = adminClient();

    const { data: profile, error } = await admin
      .from("manager_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Manager dashboard GET error:", error);
      return NextResponse.json(
        { error: "Impossibile caricare il profilo." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profilo manager non trovato." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile,
      searchAppearances: 0,
      companySelections: 0,
      isSearchActive: profile.profile_visibility_enabled !== false,
    });
  } catch (error) {
    console.error("Manager dashboard GET unexpected error:", error);
    return NextResponse.json(
      { error: "Errore imprevisto durante il caricamento." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const admin = adminClient();

    if (
      Object.keys(body).length === 1 &&
      typeof body.isSearchActive === "boolean"
    ) {
      const { error } = await admin
        .from("manager_profiles")
        .update({
          profile_visibility_enabled: body.isSearchActive,
          last_profile_update_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Manager visibility PATCH error:", error);
        return NextResponse.json(
          { error: "Impossibile aggiornare la disponibilità." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        isSearchActive: body.isSearchActive,
      });
    }

    const geographicAreas = cleanGeographicAreas(body.geographic_areas);
    const secondaryRoles = cleanSecondaryRoles(body.secondary_roles);
    const competencies = cleanStringArray(body.competencies);
    const methodologies = cleanStringArray(body.methodologies);
    const productionTypes = cleanStringArray(body.production_types);
    const sectors = cleanStringArray(body.sectors);
    const assignmentTypes = cleanStringArray(body.assignment_types);

    const daysPerWeek = Number(body.days_per_week);

    if (
      !cleanString(body.first_name) ||
      !cleanString(body.last_name) ||
      !cleanString(body.whatsapp_phone) ||
      !cleanString(body.birth_date) ||
      !cleanString(body.experience_band) ||
      !cleanString(body.managerial_experience_band) ||
      !cleanString(body.primary_role_family) ||
      !cleanString(body.primary_role) ||
      competencies.length === 0 ||
      methodologies.length === 0 ||
      !cleanString(body.company_revenue_band) ||
      !cleanString(body.people_managed_band) ||
      !cleanString(body.pnl_budget_band) ||
      productionTypes.length === 0 ||
      sectors.length === 0 ||
      geographicAreas.length === 0 ||
      assignmentTypes.length === 0 ||
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 5 ||
      !cleanString(body.available_from) ||
      !cleanString(body.study_title) ||
      !cleanString(body.daily_rate_band)
    ) {
      return NextResponse.json(
        { error: "Compila tutti i campi obbligatori del profilo." },
        { status: 400 }
      );
    }

    if (body.vat_active !== true) {
      return NextResponse.json(
        { error: "Il network è riservato a professionisti con P.IVA attiva." },
        { status: 400 }
      );
    }

    if (
      body.professional_insurance === true &&
      !cleanString(body.insurance_limit)
    ) {
      return NextResponse.json(
        { error: "Indica il massimale della RC professionale." },
        { status: 400 }
      );
    }

    const regions = Array.from(
      new Set(geographicAreas.map((item) => item.region))
    );
    const provinces = geographicAreas.map((item) => item.province);

    const updatePayload = {
      first_name: cleanString(body.first_name),
      last_name: cleanString(body.last_name),
      whatsapp_phone: cleanString(body.whatsapp_phone),
      birth_date: cleanString(body.birth_date),
      linkedin_url: cleanString(body.linkedin_url) || null,

      experience_band: cleanString(body.experience_band),
      managerial_experience_band: cleanString(body.managerial_experience_band),

      primary_role_family: cleanString(body.primary_role_family),
      primary_role: cleanString(body.primary_role),
      other_role: cleanString(body.other_role) || null,
      secondary_roles: secondaryRoles,

      competencies,
      other_competency: cleanString(body.other_competency) || null,
      methodologies,
      other_methodology: cleanString(body.other_methodology) || null,

      company_revenue_band: cleanString(body.company_revenue_band),
      people_managed_band: cleanString(body.people_managed_band),
      pnl_budget_band: cleanString(body.pnl_budget_band),

      production_types: productionTypes,
      sectors,
      other_sector: cleanString(body.other_sector) || null,

      region: geographicAreas[0]?.region ?? "",
      province: geographicAreas[0]?.province ?? "",
      regions,
      provinces,
      geographic_areas: geographicAreas,
      travel_available: body.travel_available === true,

      assignment_types: assignmentTypes,
      days_per_week: daysPerWeek,
      available_from: cleanString(body.available_from),

      vat_active: true,
      professional_insurance: body.professional_insurance === true,
      insurance_limit:
        body.professional_insurance === true
          ? cleanString(body.insurance_limit) || null
          : null,
      certifications: cleanString(body.certifications) || null,
      languages: cleanString(body.languages) || null,
      study_title: cleanString(body.study_title),

      daily_rate_band: cleanString(body.daily_rate_band),

      profile_completion: 100,
      last_profile_update_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("manager_profiles")
      .update(updatePayload)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("Manager dashboard profile PATCH error:", error);
      return NextResponse.json(
        { error: "Impossibile salvare le modifiche." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error("Manager dashboard PATCH unexpected error:", error);
    return NextResponse.json(
      { error: "Errore imprevisto durante il salvataggio." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
    }

    const admin = adminClient();

    const { error: consentError } = await admin
      .from("manager_consents")
      .delete()
      .eq("user_id", user.id);

    if (consentError) {
      console.error("Manager consent DELETE error:", consentError);
      return NextResponse.json(
        { error: "Impossibile eliminare i consensi del profilo." },
        { status: 500 }
      );
    }

    const { error: profileError } = await admin
      .from("manager_profiles")
      .delete()
      .eq("user_id", user.id);

    if (profileError) {
      console.error("Manager profile DELETE error:", profileError);
      return NextResponse.json(
        { error: "Impossibile eliminare il profilo." },
        { status: 500 }
      );
    }

    const { error: authError } = await admin.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error("Manager auth DELETE error:", authError);
      return NextResponse.json(
        { error: "Profilo eliminato, ma non è stato possibile eliminare l'account Auth." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manager dashboard DELETE unexpected error:", error);
    return NextResponse.json(
      { error: "Errore imprevisto durante l'eliminazione." },
      { status: 500 }
    );
  }
}
