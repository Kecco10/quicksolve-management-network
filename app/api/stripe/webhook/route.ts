import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase server non configurato: controlla NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function confirmPurchaseFromSession(session: Stripe.Checkout.Session) {
  // Le sessioni generate dalla modalità ?test=N non hanno un purchase reale.
  if (session.metadata?.test_mode === "true") {
    return;
  }

  if (session.payment_status !== "paid") {
    return;
  }

  const purchaseId =
    session.metadata?.purchase_id || session.client_reference_id || null;

  if (!purchaseId) {
    throw new Error(
      `Sessione Stripe ${session.id}: purchase_id mancante nei metadata.`
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select(
      "id, status, stripe_checkout_session_id, total_amount_cents, selected_count"
    )
    .eq("id", purchaseId)
    .maybeSingle();

  if (purchaseError) {
    console.error("Errore lettura purchase:", purchaseError);
    throw new Error("Impossibile verificare l'acquisto QuickSolve.");
  }

  if (!purchase) {
    throw new Error(
      `Acquisto QuickSolve ${purchaseId} non trovato per la sessione ${session.id}.`
    );
  }

  // Verifica che il pagamento ricevuto corrisponda esattamente
  // alla Checkout Session creata per quell'acquisto.
  if (purchase.stripe_checkout_session_id !== session.id) {
    throw new Error(
      `Sessione Stripe non corrispondente per purchase ${purchaseId}.`
    );
  }

  // Verifica anche il totale pagato.
  if (
    typeof session.amount_total === "number" &&
    Number(purchase.total_amount_cents) !== session.amount_total
  ) {
    throw new Error(
      `Importo Stripe non corrispondente per purchase ${purchaseId}: atteso ${purchase.total_amount_cents}, ricevuto ${session.amount_total}.`
    );
  }

  const paidAt = new Date().toISOString();

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // L'operazione è idempotente: se Stripe ritenta il webhook,
  // riportiamo semplicemente il record allo stesso stato "paid".
  const { error: updatePurchaseError } = await supabase
    .from("purchases")
    .update({
      status: "paid",
      stripe_payment_intent_id: paymentIntentId,
      paid_at: paidAt,
      updated_at: paidAt,
    })
    .eq("id", purchaseId);

  if (updatePurchaseError) {
    console.error("Errore aggiornamento purchase:", updatePurchaseError);
    throw new Error("Impossibile confermare il pagamento QuickSolve.");
  }

  // Solo dopo la conferma Stripe rendiamo sbloccabili i progettisti acquistati.
  const { error: unlockError } = await supabase
    .from("purchase_designers")
    .update({
      unlocked_at: paidAt,
    })
    .eq("purchase_id", purchaseId)
    .is("unlocked_at", null);

  if (unlockError) {
    console.error("Errore sblocco purchase_designers:", unlockError);
    throw new Error("Impossibile sbloccare i progettisti acquistati.");
  }
}

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY mancante." },
      { status: 500 }
    );
  }

  if (!stripeWebhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET mancante." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Firma Stripe mancante." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;

  try {
    // IMPORTANTISSIMO: il webhook deve usare il body RAW.
    // Non usare request.json() prima di constructEvent().
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret
    );
  } catch (error) {
    console.error("Firma webhook Stripe non valida:", error);

    return NextResponse.json(
      { error: "Firma webhook non valida." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await confirmPurchaseFromSession(session);
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await confirmPurchaseFromSession(session);
        break;
      }

      default:
        // Gli altri eventi non sono necessari al flusso QuickSolve attuale.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Errore gestione webhook ${event.type}:`, error);

    // Restituiamo 500 così Stripe ritenterà automaticamente l'evento.
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Errore durante la gestione del webhook.",
      },
      { status: 500 }
    );
  }
}
