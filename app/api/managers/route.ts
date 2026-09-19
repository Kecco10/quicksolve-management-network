import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseSecretKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const EXPERIENCE_MAP: Record<string, string> = {
  "Meno di 6 anni": "less_than_6",
  "6–10 anni": "6_10",
  "6-10 anni": "6_10",
  "11–20 anni": "11_20",
  "11-20 anni": "11_20",
  "Oltre 20 anni": "over_20",
};

const MANAGERIAL_EXPERIENCE_MAP: Record<string, string> = {
  "Meno di 3 anni": "less_than_3",
  "3–10 anni": "3_10",
  "3-10 anni": "3_10",
  "Oltre 10 anni": "over_10",
};

type SecondaryRole = {
  family?: string;
  role?: string;
};

type GeographicArea = {
  region?: string;
  province?: string;
};

type ManagerSignupPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;

  whatsapp_phone?: string;
  birth_date?: string;
  linkedin_url?: string;

  experience_band?: string;
  managerial_experience_band?: string;

  primary_role_family?: string;
  primary_role?: string;
  other_role?: string;
  secondary_roles?: SecondaryRole[];

  methodologies?: string[];
  other_methodology?: string;

  company_revenue_band?: string;
  people_managed_band?: string;
  pnl_budget_band?: string;

  production_types?: string[];
  sectors?: string[];
  other_sector?: string;

  region?: string;
  province?: string;
  regions?: string[];
  provinces?: string[];
  geographic_areas?: GeographicArea[];
  travel_available?: boolean;

  assignment_types?: string[];
  days_per_week?: number;
  available_from?: string;

  vat_active?: boolean;
  professional_insurance?: boolean;
  insurance_limit?: string;
  certifications?: string;
  languages?: string;
  study_title?: string;

  daily_rate_band?: string;

  privacy_acknowledged?: boolean;
  privacy_version?: string;
  profile_visibility_consent?: boolean;
  profile_visibility_version?: string;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(cleanString).filter(Boolean);
}

function cleanSecondaryRoles(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const role = item as SecondaryRole;
      const family = cleanString(role.family);
      const roleName = cleanString(role.role);

      if (!family || !roleName) return null;

      return {
        family,
        role: roleName,
      };
    })
    .filter((item): item is { family: string; role: string } => Boolean(item))
    .slice(0, 2);
}

function cleanGeographicAreas(value: unknown) {
  if (!Array.isArray(value)) return [];

  const unique = new Map<string, { region: string; province: string }>();

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const area = item as GeographicArea;
    const region = cleanString(area.region);
    const province = cleanString(area.province);

    if (!region || !province) continue;

    unique.set(`${region}::${province}`, { region, province });
  }

  return Array.from(unique.values());
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    const body = (await request.json()) as ManagerSignupPayload;

    const firstName = cleanString(body.first_name);
    const lastName = cleanString(body.last_name);
    const email = cleanString(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    const whatsappPhone = cleanString(body.whatsapp_phone);
    const birthDate = cleanString(body.birth_date);
    const linkedinUrl = cleanString(body.linkedin_url);

    const experienceLabel = cleanString(body.experience_band);
    const managerialExperienceLabel = cleanString(
      body.managerial_experience_band
    );
    const managerialExperienceBand =
      MANAGERIAL_EXPERIENCE_MAP[managerialExperienceLabel];

    const primaryRoleFamily = cleanString(body.primary_role_family);
    const primaryRole = cleanString(body.primary_role);
    const otherRole = cleanString(body.other_role);
    const secondaryRoles = cleanSecondaryRoles(body.secondary_roles);

    const methodologies = cleanStringArray(body.methodologies);
    const otherMethodology = cleanString(body.other_methodology);

    const companyRevenueBand = cleanString(body.company_revenue_band);
    const peopleManagedBand = cleanString(body.people_managed_band);
    const pnlBudgetBand = cleanString(body.pnl_budget_band);

    const productionTypes = cleanStringArray(body.production_types);
    const sectors = cleanStringArray(body.sectors);
    const otherSector = cleanString(body.other_sector);

    const geographicAreas = cleanGeographicAreas(body.geographic_areas);
    const regions =
      geographicAreas.length > 0
        ? Array.from(new Set(geographicAreas.map((item) => item.region)))
        : cleanStringArray(body.regions);
    const provinces =
      geographicAreas.length > 0
        ? geographicAreas.map((item) => item.province)
        : cleanStringArray(body.provinces);

    const region =
      geographicAreas[0]?.region || cleanString(body.region);
    const province =
      geographicAreas[0]?.province || cleanString(body.province);

    const assignmentTypes = cleanStringArray(body.assignment_types);
    const daysPerWeek = Number(body.days_per_week);
    const availableFrom = cleanString(body.available_from);

    const vatActive = body.vat_active === true;
    const professionalInsurance =
      body.professional_insurance === true;
    const insuranceLimit = cleanString(body.insurance_limit);

    const certifications = cleanString(body.certifications);
    const languages = cleanString(body.languages);
    const studyTitle = cleanString(body.study_title);
    const dailyRateBand = cleanString(body.daily_rate_band);

    const privacyVersion = cleanString(body.privacy_version);
    const visibilityVersion = cleanString(
      body.profile_visibility_version
    );

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !whatsappPhone ||
      !birthDate ||
      !experienceLabel ||
      !managerialExperienceBand ||
      !primaryRoleFamily ||
      !primaryRole ||
      geographicAreas.length === 0 ||
      methodologies.length === 0 ||
      !companyRevenueBand ||
      !peopleManagedBand ||
      !pnlBudgetBand ||
      productionTypes.length === 0 ||
      (sectors.length === 0 && !otherSector) ||
      assignmentTypes.length === 0 ||
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 5 ||
      !availableFrom ||
      !studyTitle ||
      !dailyRateBand
    ) {
      return NextResponse.json(
        { message: "Compila tutti i campi obbligatori." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Inserisci un indirizzo email valido." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "La password deve contenere almeno 6 caratteri." },
        { status: 400 }
      );
    }

    if (!isIsoDate(birthDate)) {
      return NextResponse.json(
        { message: "Data di nascita non valida." },
        { status: 400 }
      );
    }

    if (!isIsoDate(availableFrom)) {
      return NextResponse.json(
        { message: "Data di disponibilità non valida." },
        { status: 400 }
      );
    }

    const experienceBand = EXPERIENCE_MAP[experienceLabel];

    if (!experienceBand) {
      return NextResponse.json(
        { message: "Fascia di esperienza non valida." },
        { status: 400 }
      );
    }

    if (!vatActive) {
      return NextResponse.json(
        {
          message:
            "Per registrarti al Management Network è necessaria una P.IVA attiva.",
        },
        { status: 400 }
      );
    }

    if (professionalInsurance && !insuranceLimit) {
      return NextResponse.json(
        {
          message:
            "Indica il massimale della RC professionale.",
        },
        { status: 400 }
      );
    }

    if (body.privacy_acknowledged !== true || !privacyVersion) {
      return NextResponse.json(
        {
          message:
            "Devi confermare di aver letto l'informativa privacy.",
        },
        { status: 400 }
      );
    }

    if (
      body.profile_visibility_consent !== true ||
      !visibilityVersion
    ) {
      return NextResponse.json(
        {
          message:
            "È necessario esprimere il consenso alla visibilità del profilo.",
        },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          network: "management",
        },
      });

    if (authError || !authData.user) {
      const message = authError?.message?.toLowerCase() || "";

      if (
        message.includes("already") ||
        message.includes("registered") ||
        message.includes("exists")
      ) {
        return NextResponse.json(
          {
            message:
              "Esiste già un account associato a questa email.",
          },
          { status: 409 }
        );
      }

      console.error("Manager auth creation error:", authError);

      return NextResponse.json(
        { message: "Non è stato possibile creare l'account." },
        { status: 500 }
      );
    }

    createdUserId = authData.user.id;

    const now = new Date().toISOString();

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("manager_profiles")
        .insert({
          user_id: createdUserId,
          first_name: firstName,
          last_name: lastName,
          email,

          whatsapp_phone: whatsappPhone,
          birth_date: birthDate,
          linkedin_url: linkedinUrl || null,

          experience_band: experienceBand,
          managerial_experience_band: managerialExperienceBand,

          primary_role_family: primaryRoleFamily,
          primary_role: primaryRole,
          other_role: otherRole || null,
          secondary_roles: secondaryRoles,

          methodologies,
          other_methodology: otherMethodology || null,

          company_revenue_band: companyRevenueBand,
          people_managed_band: peopleManagedBand,
          pnl_budget_band: pnlBudgetBand,

          production_types: productionTypes,
          sectors,
          other_sector: otherSector || null,

          region,
          province,
          regions,
          provinces,
          geographic_areas: geographicAreas,
          travel_available: body.travel_available === true,

          assignment_types: assignmentTypes,
          days_per_week: daysPerWeek,
          available_from: availableFrom,

          vat_active: true,
          professional_insurance: professionalInsurance,
          insurance_limit:
            professionalInsurance && insuranceLimit
              ? insuranceLimit
              : null,

          certifications: certifications || null,
          languages: languages || null,
          study_title: studyTitle,

          daily_rate_band: dailyRateBand,

          profile_completion: 100,
          profile_visibility_enabled: true,
          profile_status: "registered",
          last_profile_update_at: now,
        })
        .select("id")
        .single();

    if (profileError || !profile) {
      console.error(
        "Manager profile creation error:",
        profileError
      );

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      createdUserId = null;

      return NextResponse.json(
        {
          message:
            "Non è stato possibile creare il profilo manager.",
        },
        { status: 500 }
      );
    }

    const { error: consentError } = await supabaseAdmin
      .from("manager_consents")
      .insert([
        {
          user_id: createdUserId,
          manager_profile_id: profile.id,
          consent_type: "privacy_registration",
          accepted: true,
          document_version: privacyVersion,
        },
        {
          user_id: createdUserId,
          manager_profile_id: profile.id,
          consent_type: "profile_visibility",
          accepted: true,
          document_version: visibilityVersion,
        },
      ]);

    if (consentError) {
      console.error(
        "Manager consent creation error:",
        consentError
      );

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      createdUserId = null;

      return NextResponse.json(
        {
          message:
            "Non è stato possibile registrare i consensi.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        manager_profile_id: profile.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected manager signup error:", error);

    if (createdUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      } catch (cleanupError) {
        console.error(
          "Manager signup cleanup error:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "Si è verificato un errore imprevisto durante la registrazione.",
      },
      { status: 500 }
    );
  }
}
