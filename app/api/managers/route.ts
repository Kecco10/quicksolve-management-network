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

type ManagerSignupPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  experience_band?: string;
  primary_role_family?: string;
  primary_role?: string;
  other_role?: string;
  region?: string;
  province?: string;
  privacy_acknowledged?: boolean;
  privacy_version?: string;
  profile_visibility_consent?: boolean;
  profile_visibility_version?: string;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    const body = (await request.json()) as ManagerSignupPayload;

    const firstName = cleanString(body.first_name);
    const lastName = cleanString(body.last_name);
    const email = cleanString(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const experienceLabel = cleanString(body.experience_band);
    const primaryRoleFamily = cleanString(body.primary_role_family);
    const primaryRole = cleanString(body.primary_role);
    const otherRole = cleanString(body.other_role);
    const region = cleanString(body.region);
    const province = cleanString(body.province);
    const privacyVersion = cleanString(body.privacy_version);
    const visibilityVersion = cleanString(body.profile_visibility_version);

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !experienceLabel ||
      !primaryRoleFamily ||
      !primaryRole ||
      !region ||
      !province
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

    const experienceBand = EXPERIENCE_MAP[experienceLabel];

    if (!experienceBand) {
      return NextResponse.json(
        { message: "Fascia di esperienza non valida." },
        { status: 400 }
      );
    }

    if (body.privacy_acknowledged !== true || !privacyVersion) {
      return NextResponse.json(
        { message: "Devi confermare di aver letto l'informativa privacy." },
        { status: 400 }
      );
    }

    if (body.profile_visibility_consent !== true || !visibilityVersion) {
      return NextResponse.json(
        { message: "È necessario esprimere il consenso alla visibilità del profilo." },
        { status: 400 }
      );
    }

    /*
     * Creiamo l'utente dal server con chiave privilegiata.
     * email_confirm: true mantiene l'accesso immediato, senza email
     * di conferma, coerentemente con il flusso attuale.
     */
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
          { message: "Esiste già un account associato a questa email." },
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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("manager_profiles")
      .insert({
        user_id: createdUserId,
        first_name: firstName,
        last_name: lastName,
        email,
        experience_band: experienceBand,
        primary_role_family: primaryRoleFamily,
        primary_role: primaryRole,
        other_role: otherRole || null,
        region,
        province,
        profile_completion: 25,
        profile_visibility_enabled: true,
      })
      .select("id")
      .single();

    if (profileError || !profile) {
      console.error("Manager profile creation error:", profileError);

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      createdUserId = null;

      return NextResponse.json(
        { message: "Non è stato possibile creare il profilo manager." },
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
      console.error("Manager consent creation error:", consentError);

      /*
       * Evitiamo di lasciare una registrazione incompleta:
       * cancellando l'utente Auth, il profilo viene rimosso per cascade
       * e il trigger/foreign key rimuove anche i dati collegati.
       */
      await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      createdUserId = null;

      return NextResponse.json(
        { message: "Non è stato possibile registrare i consensi." },
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
        console.error("Manager signup cleanup error:", cleanupError);
      }
    }

    return NextResponse.json(
      { message: "Si è verificato un errore imprevisto durante la registrazione." },
      { status: 500 }
    );
  }
}
