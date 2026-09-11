import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type StudyTitle =
  | "Diploma di maturità"
  | "Laurea Triennale"
  | "Laurea Magistrale"
  | "Altro";

type ExperienceLevel = "0-2 anni" | "3-5 anni" | "6-10 anni" | "10+ anni";

type CollaborationType =
  | "Dipendente full time"
  | "Dipendente part-time"
  | "Freelancer partita IVA";

type CadSkill = { name: string; rating: number };
type CustomCadSkill = { name: string; rating: number };

type SelectedProvinceEntry = {
  id: string;
  region: string;
  province: string;
};

type IncomingDesignerPayload = {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  birthDate?: string;
  birth_date?: string;
  studyTitle?: StudyTitle;
  study_title?: StudyTitle;
  studyTitleOther?: string;
  study_title_other?: string;
  experience?: ExperienceLevel;
  collaborationType?: CollaborationType;
  collaboration_type?: CollaborationType;
  budgetRange?: string;
  budget_range?: string;
  selectedRegion?: string;
  selected_region?: string;

  // Canonical field used by the dashboard and by new registrations.
  selectedProvinceEntries?: Array<SelectedProvinceEntry | string>;
  selected_province_entries?: Array<SelectedProvinceEntry | string>;

  // Legacy field supported so old registration pages/records still work.
  selectedProvinces?: string[];
  selected_provinces?: string[];

  isAllItaly?: boolean;
  is_all_italy?: boolean;
  isRemote?: boolean;
  is_remote?: boolean;
  sectors?: string[];
  sectorOther?: string;
  sector_other?: string;
  cadSkills?: CadSkill[];
  cad_skills?: CadSkill[];
  customCadSkills?: CustomCadSkill[];
  custom_cad_skills?: CustomCadSkill[];
  email?: string;
  whatsapp?: string;
  linkedin?: string;
  password?: string;
  profileStatus?: string;
  profile_status?: string;
  privacy_acknowledged?: boolean;
  privacy_version?: string;
  terms_accepted?: boolean;
  terms_version?: string;
};

function pickString(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string") return value.trim();
  }
  return undefined;
}

function pickBoolean(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

function pickStringArray(...values: Array<unknown>) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return undefined;
}

function pickCadSkills(...values: Array<unknown>) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is CadSkill =>
          typeof item === "object" &&
          item !== null &&
          "name" in item &&
          "rating" in item &&
          typeof (item as CadSkill).name === "string" &&
          typeof (item as CadSkill).rating === "number" &&
          (item as CadSkill).rating > 0
      );
    }
  }
  return undefined;
}

function pickCustomCadSkills(...values: Array<unknown>) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is CustomCadSkill =>
          typeof item === "object" &&
          item !== null &&
          "name" in item &&
          "rating" in item &&
          typeof (item as CustomCadSkill).name === "string" &&
          typeof (item as CustomCadSkill).rating === "number" &&
          (item as CustomCadSkill).rating > 0
      );
    }
  }
  return undefined;
}

function stableProvinceId(region: string, province: string) {
  return `province-${region}-${province}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeProvinceEntries(
  values: unknown[],
  fallbackRegion: string
): SelectedProvinceEntry[] {
  const normalized = values
    .map((item): SelectedProvinceEntry | null => {
      if (typeof item === "string") {
        const province = item.trim();
        if (!province) return null;

        return {
          id: stableProvinceId(fallbackRegion, province),
          region: fallbackRegion,
          province,
        };
      }

      if (!item || typeof item !== "object") return null;

      const source = item as Record<string, unknown>;
      const province =
        typeof source.province === "string" ? source.province.trim() : "";
      const region =
        typeof source.region === "string" && source.region.trim()
          ? source.region.trim()
          : fallbackRegion;

      if (!province) return null;

      const id =
        typeof source.id === "string" && source.id.trim()
          ? source.id.trim()
          : stableProvinceId(region, province);

      return { id, region, province };
    })
    .filter((item): item is SelectedProvinceEntry => Boolean(item));

  const seen = new Set<string>();
  return normalized.filter((item) => {
    const key = `${item.region.toLowerCase()}::${item.province.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pickProvinceEntries(
  body: IncomingDesignerPayload,
  selectedRegion: string
) {
  const canonical =
    body.selected_province_entries ?? body.selectedProvinceEntries;

  if (Array.isArray(canonical)) {
    return normalizeProvinceEntries(canonical, selectedRegion);
  }

  const legacy =
    pickStringArray(body.selected_provinces, body.selectedProvinces) ?? [];

  return normalizeProvinceEntries(legacy, selectedRegion);
}

function normalizeProfilePayload(body: IncomingDesignerPayload) {
  const selectedRegion =
    pickString(body.selected_region, body.selectedRegion) || "";

  const isAllItaly =
    pickBoolean(body.is_all_italy, body.isAllItaly) ?? false;

  const provinceEntries = isAllItaly
    ? []
    : pickProvinceEntries(body, selectedRegion);

  return {
    first_name: pickString(body.first_name, body.firstName),
    last_name: pickString(body.last_name, body.lastName),
    birth_date: pickString(body.birth_date, body.birthDate),
    study_title: pickString(body.study_title, body.studyTitle),
    study_title_other:
      pickString(body.study_title_other, body.studyTitleOther) || "",
    experience: pickString(body.experience),
    collaboration_type:
      pickString(body.collaboration_type, body.collaborationType),
    budget_range: pickString(body.budget_range, body.budgetRange),
    selected_region: isAllItaly ? "" : selectedRegion,
    selected_province_entries: provinceEntries,
    is_all_italy: isAllItaly,
    is_remote: pickBoolean(body.is_remote, body.isRemote) ?? false,
    sectors: pickStringArray(body.sectors) ?? [],
    sector_other: pickString(body.sector_other, body.sectorOther) || "",
    cad_skills: pickCadSkills(body.cad_skills, body.cadSkills) ?? [],
    custom_cad_skills:
      pickCustomCadSkills(body.custom_cad_skills, body.customCadSkills) ?? [],
    email: pickString(body.email),
    whatsapp: pickString(body.whatsapp),
    linkedin: pickString(body.linkedin) || "",
    profile_status:
      pickString(body.profile_status, body.profileStatus) || "In attesa",
  };
}

function removeUndefined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Non autorizzato" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("progettista_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, profile: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body: IncomingDesignerPayload = await request.json();

  const email = pickString(body.email);
  const password = pickString(body.password);
  const privacyAcknowledged = body.privacy_acknowledged === true;
  const privacyVersion = pickString(body.privacy_version);
  const termsAccepted = body.terms_accepted === true;
  const termsVersion = pickString(body.terms_version);

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email e password sono obbligatorie." },
      { status: 400 }
    );
  }

  if (!privacyAcknowledged || !privacyVersion || !termsAccepted || !termsVersion) {
    return NextResponse.json(
      {
        success: false,
        message: "Devi prendere visione dell'Informativa Privacy e accettare le Condizioni di utilizzo.",
      },
      { status: 400 }
    );
  }

  const normalizedProfile = normalizeProfilePayload(body);

  if (
    !normalizedProfile.first_name ||
    !normalizedProfile.last_name ||
    !normalizedProfile.birth_date ||
    !normalizedProfile.study_title ||
    !normalizedProfile.experience ||
    !normalizedProfile.collaboration_type ||
    !normalizedProfile.budget_range ||
    !normalizedProfile.email ||
    !normalizedProfile.whatsapp
  ) {
    return NextResponse.json(
      { success: false, message: "Dati profilo mancanti o non validi." },
      { status: 400 }
    );
  }

  if (
    !normalizedProfile.is_all_italy &&
    !normalizedProfile.is_remote &&
    normalizedProfile.selected_province_entries.length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Seleziona almeno una provincia, Tutta Italia oppure la disponibilità Remote.",
      },
      { status: 400 }
    );
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return NextResponse.json(
      { success: false, message: authError.message },
      { status: 400 }
    );
  }

  const userId = authData.user?.id;

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Impossibile creare l'utente." },
      { status: 500 }
    );
  }

  const acceptedAt = new Date().toISOString();

  const insertPayload = {
    user_id: userId,
    ...normalizedProfile,
    privacy_version: privacyVersion,
    privacy_acknowledged_at: acceptedAt,
    terms_version: termsVersion,
    terms_accepted_at: acceptedAt,
    updated_at: acceptedAt,
  };

  const { data, error } = await supabase
    .from("progettista_profiles")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, profile: data },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Non autorizzato" },
      { status: 401 }
    );
  }

  const body: IncomingDesignerPayload = await request.json();
  const normalizedProfile = normalizeProfilePayload(body);

  const updatePayload = removeUndefined({
    ...normalizedProfile,
    updated_at: new Date().toISOString(),
  });

  const { data, error } = await supabase
    .from("progettista_profiles")
    .update(updatePayload)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, profile: data });
}