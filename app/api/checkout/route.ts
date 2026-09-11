import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  CandidateForMatching,
  CompanyRequestForMatching,
  calculateMatch,
} from "@/lib/matching-engine";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const vatTaxRateId = process.env.STRIPE_IVA_22_TAX_RATE_ID;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PLAN_CONFIG = {
  go: { name: "QuickSolve Go", includedContacts: 5, price: 79 },
  plus: { name: "QuickSolve Plus", includedContacts: 10, price: 129 },
  pro: { name: "QuickSolve Pro", includedContacts: 20, price: 199 },
} as const;

const EXTRA_CONTACT_PRICE = 19;
const VAT_RATE = 0.22;

type PlanId = keyof typeof PLAN_CONFIG;

type CheckoutRequest = {
  planId?: PlanId | null;
  selectedDesignerIds?: string[];
  requestCode?: string | null;
  contactEmail?: string | null;
  isIndividualUnlock?: boolean;
  assistedSelectionToken?: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function calculateCheckout(
  planId: PlanId | null | undefined,
  selectedCount: number
) {
  if (selectedCount < 1) {
    throw new Error("Seleziona almeno un progettista.");
  }

  if (selectedCount < 5) {
    const netAmount = selectedCount * EXTRA_CONTACT_PRICE;

    return {
      planId: "single",
      netAmount,
      description: `Sblocco di ${selectedCount} ${
        selectedCount === 1 ? "contatto progettista" : "contatti progettista"
      }`,
    };
  }

  if (!planId || !(planId in PLAN_CONFIG)) {
    throw new Error("Seleziona un piano valido.");
  }

  const plan = PLAN_CONFIG[planId];

  if (selectedCount < plan.includedContacts) {
    throw new Error(
      `Il piano ${plan.name} richiede almeno ${plan.includedContacts} profili selezionati.`
    );
  }

  const extras = Math.max(0, selectedCount - plan.includedContacts);
  const netAmount = plan.price + extras * EXTRA_CONTACT_PRICE;

  return {
    planId,
    netAmount,
    description:
      extras > 0
        ? `${plan.name} · ${plan.includedContacts} contatti inclusi + ${extras} extra`
        : `${plan.name} · ${plan.includedContacts} contatti inclusi`,
  };
}


type Raw = Record<string, unknown>;

const cleanString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const cleanBoolean = (value: unknown) =>
  typeof value === "boolean"
    ? value
    : typeof value === "number"
    ? value === 1
    : typeof value === "string"
    ? ["true", "1", "si", "sì", "yes"].includes(
        value.trim().toLowerCase()
      )
    : false;

const cleanStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map(cleanString).filter(Boolean) : [];

function normalizeRequestCad(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        const nome = item.trim();
        return nome ? { nome, livello: 5 } : null;
      }

      if (!item || typeof item !== "object") return null;

      const row = item as Raw;
      const nome = cleanString(
        row.nome ?? row.name ?? row.label ?? row.software
      );
      const rawLevel = row.livello ?? row.level ?? row.rating ?? 5;
      const livello =
        typeof rawLevel === "number" ? rawLevel : Number(rawLevel);

      return nome
        ? {
            nome,
            livello: Number.isFinite(livello)
              ? Math.max(1, Math.min(5, livello))
              : 5,
          }
        : null;
    })
    .filter(
      (item): item is { nome: string; livello: number } => Boolean(item)
    );
}

function normalizeCandidateCad(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const row = item as Raw;
      const name = cleanString(
        row.name ?? row.nome ?? row.label ?? row.software
      );
      const rawRating = row.rating ?? row.livello ?? row.level ?? 0;
      const rating =
        typeof rawRating === "number" ? rawRating : Number(rawRating);

      if (!name || !Number.isFinite(rating) || rating <= 0) return null;

      return {
        name,
        rating: Math.min(5, rating),
      };
    })
    .filter(
      (item): item is { name: string; rating: number } => Boolean(item)
    );
}

function normalizeRequestType(value: unknown) {
  const normalized = cleanString(value).toLowerCase();

  if (
    normalized.includes("freelance") ||
    normalized.includes("partita iva")
  ) {
    return "Freelancer" as const;
  }

  if (
    normalized.includes("part-time") ||
    normalized.includes("part time")
  ) {
    return "Part-time" as const;
  }

  return "Full time" as const;
}

function normalizeRequestExperience(value: unknown) {
  const normalized = cleanString(value).toLowerCase();

  if (
    normalized.includes("responsabile") ||
    normalized.includes("resp.")
  ) {
    return "Resp. ufficio tecnico" as const;
  }

  if (normalized.includes("senior")) return "Senior" as const;
  if (normalized.includes("middle")) return "Middle" as const;
  return "Junior" as const;
}

function normalizeCandidateType(value: unknown) {
  const normalized = cleanString(value).toLowerCase();

  if (
    normalized.includes("freelance") ||
    normalized.includes("partita iva")
  ) {
    return "Freelancer partita IVA" as const;
  }

  if (
    normalized.includes("part-time") ||
    normalized.includes("part time")
  ) {
    return "Dipendente part-time" as const;
  }

  return "Dipendente full time" as const;
}

function normalizeCandidateExperience(value: unknown) {
  const normalized = cleanString(value).toLowerCase();

  if (normalized.includes("10+")) return "10+ anni" as const;
  if (normalized.includes("6-10")) return "6-10 anni" as const;
  if (normalized.includes("3-5")) return "3-5 anni" as const;
  return "0-2 anni" as const;
}

function normalizeProvinces(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (!item || typeof item !== "object") return "";
      return cleanString((item as Raw).province);
    })
    .filter(Boolean);
}

function mapCompanyRequestForMatching(
  row: Raw
): CompanyRequestForMatching {
  const sectors = cleanStringArray(row.experience_sectors);

  return {
    id: Number(row.id ?? 0),
    codice: cleanString(row.codice),
    tipologia: normalizeRequestType(row.tipologia),
    budgetRange: cleanString(row.budgetrange),
    esperienza: normalizeRequestExperience(row.esperienza),
    regione: cleanString(row.regione),
    provincia: cleanString(row.provincia),
    isRemote: cleanBoolean(row.isremote),
    experienceSectors: sectors.length
      ? sectors
      : cleanString(row.altrosettore)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    cadRichiesti: normalizeRequestCad(row.cadrichiesti),
    altroCad: normalizeRequestCad(row.altrocad),
  };
}

function mapDesignerForMatching(row: Raw): CandidateForMatching {
  return {
    id: cleanString(row.user_id),
    regioni: [cleanString(row.selected_region)].filter(Boolean),
    province: normalizeProvinces(row.selected_province_entries),
    isRemote: cleanBoolean(row.is_remote),
    isAllItaly: cleanBoolean(row.is_all_italy),
    sectors: cleanStringArray(row.sectors),
    otherSector: cleanString(row.sector_other) || undefined,
    collaborationType: normalizeCandidateType(row.collaboration_type),
    experience: normalizeCandidateExperience(row.experience),
    budgetRange: cleanString(row.budget_range),
    cadSkills: normalizeCandidateCad(row.cad_skills),
    customCadSkills: normalizeCandidateCad(row.custom_cad_skills),
  };
}

export async function POST(request: Request) {
  let purchaseId: string | null = null;

  try {
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe non è configurato: manca STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    if (!vatTaxRateId) {
      return NextResponse.json(
        { error: "IVA non configurata: manca STRIPE_IVA_22_TAX_RATE_ID." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const body = (await request.json()) as CheckoutRequest;

    const selectedDesignerIds = Array.isArray(body.selectedDesignerIds)
      ? [...new Set(body.selectedDesignerIds.map(String).filter(Boolean))]
      : [];

    const selectedCount = selectedDesignerIds.length;
    const checkout = calculateCheckout(body.planId, selectedCount);

    const netAmountCents = Math.round(checkout.netAmount * 100);
    const vatAmountCents = Math.round(netAmountCents * VAT_RATE);
    const totalAmountCents = netAmountCents + vatAmountCents;

    const origin = new URL(request.url).origin;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Supabase server non configurato: controlla NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 }
      );
    }

    const requestCode = body.requestCode?.trim();

    if (!requestCode) {
      return NextResponse.json(
        { error: "Codice richiesta aziendale mancante." },
        { status: 400 }
      );
    }

    if (!selectedDesignerIds.every(isUuid)) {
      return NextResponse.json(
        { error: "Uno o più progettisti selezionati non sono validi." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Recuperiamo la richiesta reale dal database.
    // L'email usata per Stripe viene presa dal database, non dal browser.
    const { data: companyRequest, error: requestError } = await supabase
      .from("company_requests")
      .select(`
        id,
        codice,
        email,
        tipologia,
        budgetrange,
        esperienza,
        regione,
        provincia,
        isremote,
        experience_sectors,
        altrosettore,
        cadrichiesti,
        altrocad
      `)
      .eq("codice", requestCode)
      .maybeSingle();

    if (requestError) {
      console.error("Errore lettura company_requests:", requestError);
      throw new Error("Impossibile verificare la richiesta aziendale.");
    }

    if (!companyRequest) {
      return NextResponse.json(
        { error: "Richiesta aziendale non trovata." },
        { status: 404 }
      );
    }

    const assistedSelectionToken = body.assistedSelectionToken?.trim() || "";

    /*
     * SELEZIONE ASSISTITA:
     * se il checkout arriva da un link assistito, gli ID selezionati devono
     * appartenere ESATTAMENTE alla shortlist salvata per quella richiesta.
     * Il browser non può quindi aggiungere UUID arbitrari.
     */
    if (assistedSelectionToken) {
      const { data: assistedSelection, error: assistedSelectionError } =
        await supabase
          .from("assisted_selections")
          .select(
            `
              id,
              company_request_id,
              token,
              is_active,
              assisted_selection_designers (
                designer_id
              )
            `
          )
          .eq("token", assistedSelectionToken)
          .maybeSingle();

      if (assistedSelectionError) {
        console.error(
          "Errore verifica selezione assistita nel checkout:",
          assistedSelectionError
        );
        throw new Error("Impossibile verificare la selezione assistita.");
      }

      if (!assistedSelection || assistedSelection.is_active === false) {
        return NextResponse.json(
          { error: "La selezione assistita non è più disponibile." },
          { status: 404 }
        );
      }

      if (Number(assistedSelection.company_request_id) !== Number(companyRequest.id)) {
        return NextResponse.json(
          {
            error:
              "La selezione assistita non appartiene a questa richiesta aziendale.",
          },
          { status: 400 }
        );
      }

      const allowedDesignerIds = new Set(
        Array.isArray(assistedSelection.assisted_selection_designers)
          ? assistedSelection.assisted_selection_designers
              .map((item: unknown) => {
                if (!item || typeof item !== "object") return "";
                return cleanString((item as Raw).designer_id);
              })
              .filter(Boolean)
          : []
      );

      const containsDesignerOutsideSelection = selectedDesignerIds.some(
        (designerId) => !allowedDesignerIds.has(designerId)
      );

      if (containsDesignerOutsideSelection) {
        console.warn(
          "Checkout assistito bloccato: UUID fuori dalla shortlist salvata",
          {
            requestId: companyRequest.id,
            requestCode: companyRequest.codice,
            selectedDesignerIds,
          }
        );

        return NextResponse.json(
          {
            error:
              "Uno o più progettisti selezionati non appartengono alla selezione assistita QuickSolve.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * SICUREZZA CHECKOUT:
     * non basta che l'UUID esista. Ogni progettista selezionato deve
     * risultare ancora un match valido (>= 70%) per QUESTA richiesta,
     * usando lo stesso matching-engine della pagina risultati.
     */
    const { data: designers, error: designersError } = await supabase
      .from("progettista_profiles")
      .select(`
        user_id,
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
        is_search_active
      `)
      .in("user_id", selectedDesignerIds)
      .eq("is_search_active", true);

    if (designersError) {
      console.error("Errore verifica progettisti:", designersError);
      throw new Error("Impossibile verificare i progettisti selezionati.");
    }

    const designersById = new Map<string, Raw>();

    for (const row of designers ?? []) {
      const raw = row as Raw;
      const userId = cleanString(raw.user_id);
      if (userId && !designersById.has(userId)) {
        designersById.set(userId, raw);
      }
    }

    if (
      designersById.size !== selectedDesignerIds.length ||
      selectedDesignerIds.some((id) => !designersById.has(id))
    ) {
      return NextResponse.json(
        { error: "Uno o più progettisti selezionati non sono disponibili." },
        { status: 400 }
      );
    }

    const requestForMatching = mapCompanyRequestForMatching(
      companyRequest as Raw
    );

    const invalidDesignerIds: string[] = [];

    for (const designerId of selectedDesignerIds) {
      const rawDesigner = designersById.get(designerId);

      if (!rawDesigner) {
        invalidDesignerIds.push(designerId);
        continue;
      }

      const candidate = mapDesignerForMatching(rawDesigner);

      // Stessa esclusione applicata dall'API di matching.
      if (candidate.isAllItaly) {
        invalidDesignerIds.push(designerId);
        continue;
      }

      const breakdown = calculateMatch(requestForMatching, candidate);

      // Stessa soglia applicata dall'API di matching.
      if (breakdown.percentage < 70) {
        invalidDesignerIds.push(designerId);
      }
    }

    if (invalidDesignerIds.length > 0) {
      console.warn(
        "Checkout bloccato: progettisti non compatibili con la richiesta",
        {
          requestId: companyRequest.id,
          requestCode: companyRequest.codice,
          invalidDesignerIds,
        }
      );

      return NextResponse.json(
        {
          error:
            "Uno o più progettisti selezionati non appartengono più ai match validi di questa richiesta. Aggiorna i risultati e riprova.",
        },
        { status: 400 }
      );
    }

    // 1) Creiamo l'acquisto PENDING prima di andare su Stripe.
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        request_id: companyRequest.id,
        company_email: companyRequest.email || body.contactEmail?.trim() || null,
        plan_id: checkout.planId,
        selected_count: selectedCount,
        net_amount_cents: netAmountCents,
        vat_amount_cents: vatAmountCents,
        total_amount_cents: totalAmountCents,
        currency: "eur",
        status: "pending",
      })
      .select("id")
      .single();

    if (purchaseError || !purchase) {
      console.error("Errore creazione purchase:", purchaseError);
      throw new Error("Impossibile creare l'ordine QuickSolve.");
    }

    purchaseId = String(purchase.id);

    // 2) Registriamo esattamente quali progettisti fanno parte dell'acquisto.
    const { error: purchaseDesignersError } = await supabase
      .from("purchase_designers")
      .insert(
        selectedDesignerIds.map((designerId) => ({
          purchase_id: purchaseId,
          designer_id: designerId,
        }))
      );

    if (purchaseDesignersError) {
      console.error(
        "Errore creazione purchase_designers:",
        purchaseDesignersError
      );

      await supabase.from("purchases").delete().eq("id", purchaseId);
      purchaseId = null;

      throw new Error("Impossibile registrare i progettisti selezionati.");
    }

    // 3) Creiamo la sessione Stripe collegandola al nostro purchase_id.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email:
        companyRequest.email?.trim() || body.contactEmail?.trim() || undefined,
      customer_creation: "always",
      billing_address_collection: "required",
      tax_id_collection: {
        enabled: true,
      },
      line_items: [
        {
          quantity: 1,
          tax_rates: [vatTaxRateId],
          price_data: {
            currency: "eur",
            unit_amount: netAmountCents,
            product_data: {
              name: "QuickSolve Engineering Network",
              description: checkout.description,
            },
          },
        },
      ],
      client_reference_id: purchaseId,
      metadata: {
        purchase_id: purchaseId,
        request_id: String(companyRequest.id),
        request_code: String(companyRequest.codice ?? ""),
        plan_id: checkout.planId,
        selected_count: String(selectedCount),
        net_amount_cents: String(netAmountCents),
        ...(assistedSelectionToken
          ? { assisted_selection_token: assistedSelectionToken }
          : {}),
      },
      success_url: `${origin}/azienda/pagamento-completato?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: assistedSelectionToken
        ? `${origin}/azienda/selezione/${encodeURIComponent(
            assistedSelectionToken
          )}?payment=annullato`
        : `${origin}/azienda?payment=annullato`,
    });

    if (!session.url) {
      throw new Error("Stripe non ha restituito un URL di pagamento.");
    }

    // 4) Salviamo l'ID della sessione Stripe nel nostro ordine.
    const { error: sessionUpdateError } = await supabase
      .from("purchases")
      .update({
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchaseId);

    if (sessionUpdateError) {
      console.error(
        "Errore salvataggio stripe_checkout_session_id:",
        sessionUpdateError
      );
      throw new Error("Impossibile completare la preparazione del pagamento.");
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    /*
     * Se qualcosa fallisce dopo aver creato un purchase ma prima di
     * completare correttamente la sessione, lasciamo il record PENDING
     * quando Stripe potrebbe essere già stato creato. Il webhook e una
     * futura procedura di pulizia potranno riconciliarlo.
     */
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Errore durante la creazione del pagamento.",
      },
      { status: 500 }
    );
  }
}
