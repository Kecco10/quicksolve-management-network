import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type DesignerProfile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  study_title: string | null;
  study_title_other: string | null;
  experience: string | null;
  collaboration_type: string | null;
  budget_range: string | null;
  whatsapp: string | null;
  email: string | null;
  linkedin: string | null;
  sector_other: string | null;
  is_remote: boolean | null;
  selected_region: string | null;
  sectors: unknown;
  cad_skills: unknown;
  custom_cad_skills: unknown;
  selected_province_entries: unknown;
};

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Configurazione Supabase server incompleta.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value.trim();

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function listFromUnknown(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const name =
            record.name ??
            record.label ??
            record.software ??
            record.sector ??
            record.province ??
            record.value;

          const rating =
            record.rating ?? record.level ?? record.stars ?? record.score;

          if (name && rating) {
            return `${cleanText(name)} (${cleanText(rating)}/5)`;
          }

          if (name) return cleanText(name);
        }

        return cleanText(item);
      })
      .filter(Boolean);
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        if (typeof val === "number") return `${key} (${val}/5)`;
        if (typeof val === "boolean") return val ? key : "";
        if (typeof val === "string" && val.trim()) {
          return val === key ? key : `${key}: ${val}`;
        }
        return key;
      })
      .filter(Boolean);
  }

  return [cleanText(value)].filter(Boolean);
}

function safeFilenamePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function wrapText(
  text: string,
  maxWidth: number,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontSize: number
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);

    if (width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function GET(request: Request) {
  try {
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe non configurato." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id")?.trim();

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Sessione di pagamento non valida." },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Il pagamento non risulta completato." },
        { status: 403 }
      );
    }

    const purchaseId =
      session.metadata?.purchase_id || session.client_reference_id || null;

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Acquisto QuickSolve non identificabile." },
        { status: 404 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select(
        "id, request_id, company_email, plan_id, selected_count, status, stripe_checkout_session_id, paid_at, pdf_storage_path"
      )
      .eq("id", purchaseId)
      .maybeSingle();

    if (purchaseError) {
      console.error("Errore lettura purchase PDF:", purchaseError);
      throw new Error("Impossibile verificare l'acquisto.");
    }

    if (
      !purchase ||
      purchase.status !== "paid" ||
      purchase.stripe_checkout_session_id !== session.id
    ) {
      return NextResponse.json(
        { error: "Acquisto non autorizzato al download." },
        { status: 403 }
      );
    }

    const { data: companyRequest, error: companyRequestError } = await supabase
      .from("company_requests")
      .select("id, codice, azienda, referente, email, jobtitle, tipologia")
      .eq("id", purchase.request_id)
      .maybeSingle();

    if (companyRequestError) {
      console.error("Errore lettura company request PDF:", companyRequestError);
      throw new Error("Impossibile recuperare la richiesta aziendale.");
    }

    const requestLabel =
      cleanText(companyRequest?.codice) ||
      String(purchase.request_id ?? purchase.id);

    const filename = `QuickSolve_Richiesta_${safeFilenamePart(
      requestLabel
    )}_Profili-acquistati.pdf`;

    // Se il PDF e gia stato archiviato, restituiamo esattamente quella copia.
    if (purchase.pdf_storage_path) {
      const { data: storedPdf, error: storedPdfError } = await supabase.storage
        .from("purchase-pdfs")
        .download(purchase.pdf_storage_path);

      if (!storedPdfError && storedPdf) {
        const storedBytes = Buffer.from(await storedPdf.arrayBuffer());

        return new NextResponse(storedBytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "private, no-store, max-age=0",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      console.error(
        "PDF archiviato non leggibile, verra rigenerato:",
        storedPdfError
      );
    }

    const { data: purchasedRows, error: purchasedRowsError } = await supabase
      .from("purchase_designers")
      .select("designer_id, unlocked_at")
      .eq("purchase_id", purchase.id)
      .not("unlocked_at", "is", null);

    if (purchasedRowsError) {
      console.error(
        "Errore lettura purchase_designers PDF:",
        purchasedRowsError
      );
      throw new Error("Impossibile recuperare i profili acquistati.");
    }

    const designerIds = (purchasedRows ?? []).map((row) =>
      String(row.designer_id)
    );

    if (!designerIds.length) {
      return NextResponse.json(
        { error: "Nessun profilo sbloccato per questo acquisto." },
        { status: 404 }
      );
    }

    const { data: designers, error: designersError } = await supabase
      .from("progettista_profiles")
      .select(
        "user_id, first_name, last_name, birth_date, study_title, study_title_other, experience, collaboration_type, budget_range, whatsapp, email, linkedin, sector_other, is_remote, selected_region, sectors, cad_skills, custom_cad_skills, selected_province_entries"
      )
      .in("user_id", designerIds);

    if (designersError) {
      console.error("Errore lettura progettisti PDF:", designersError);
      throw new Error("Impossibile recuperare i dati dei progettisti.");
    }

    const designerById = new Map(
      ((designers ?? []) as DesignerProfile[]).map((designer) => [
        String(designer.user_id),
        designer,
      ])
    );

    const orderedDesigners = designerIds
      .map((id) => designerById.get(id))
      .filter((designer): designer is DesignerProfile => Boolean(designer));

    const pdf = await PDFDocument.create();
    pdf.setTitle("QuickSolve - Profili acquistati");
    pdf.setAuthor("QuickSolve Engineering Network");
    pdf.setCreator("QuickSolve Engineering Network");

    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Logo ufficiale già presente in public/quicksolve-logo.png
    const logoPath = path.join(process.cwd(), "public", "quicksolve-logo.png");
    const logoBytes = await readFile(logoPath);
    const logoImage = await pdf.embedPng(logoBytes);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    const dark = rgb(0.06, 0.09, 0.14);
    const muted = rgb(0.35, 0.4, 0.47);
    const green = rgb(0.02, 0.36, 0.25);
    const lightGreen = rgb(0.92, 0.98, 0.95);
    const lineColor = rgb(0.86, 0.88, 0.9);

    let page = pdf.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const ensureSpace = (heightNeeded: number) => {
      if (y - heightNeeded >= margin) return;

      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    };

    const drawWrapped = (
      text: string,
      x: number,
      size: number,
      maxWidth: number,
      bold = false,
      color = dark,
      lineHeight = size * 1.35
    ) => {
      const font = bold ? fontBold : fontRegular;
      const lines = wrapText(text, maxWidth, font, size);

      ensureSpace(lines.length * lineHeight + 4);

      for (const line of lines) {
        page.drawText(line, {
          x,
          y,
          size,
          font,
          color,
        });
        y -= lineHeight;
      }
    };

    const drawField = (label: string, value: string | string[]) => {
      const displayValue = Array.isArray(value)
        ? value.filter(Boolean).join(", ")
        : value;

      if (!displayValue) return;

      ensureSpace(48);

      drawWrapped(label.toUpperCase(), margin, 8, contentWidth, true, muted, 11);
      drawWrapped(displayValue, margin, 10.5, contentWidth, false, dark, 15);
      y -= 5;
    };

    // Copertina
    page.drawRectangle({
      x: 0,
      y: pageHeight - 170,
      width: pageWidth,
      height: 170,
      color: lightGreen,
    });

    // Stessa copertina di prima: cambia soltanto l'intestazione.
    const logoMaxWidth = 260;
    const logoMaxHeight = 100;
    const logoScale = Math.min(
      logoMaxWidth / logoImage.width,
      logoMaxHeight / logoImage.height
    );
    const logoWidth = logoImage.width * logoScale;
    const logoHeight = logoImage.height * logoScale;

    page.drawImage(logoImage, {
      x: margin,
      y: pageHeight - 35 - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });

    y = pageHeight - 225;

    drawWrapped("Profili acquistati", margin, 24, contentWidth, true, dark, 31);

    if (companyRequest?.codice) {
      drawWrapped(
        `Richiesta: ${cleanText(companyRequest.codice)}`,
        margin,
        11,
        contentWidth,
        false,
        muted,
        16
      );
    }

    if (companyRequest?.azienda) {
      drawWrapped(
        `Azienda: ${cleanText(companyRequest.azienda)}`,
        margin,
        11,
        contentWidth,
        false,
        muted,
        16
      );
    }

    drawWrapped(
      `Profili sbloccati: ${orderedDesigners.length}`,
      margin,
      11,
      contentWidth,
      false,
      muted,
      16
    );

    if (purchase.paid_at) {
      const date = new Date(purchase.paid_at);
      drawWrapped(
        `Pagamento confermato: ${date.toLocaleString("it-IT", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Europe/Rome",
        })}`,
        margin,
        11,
        contentWidth,
        false,
        muted,
        16
      );
    }

    y -= 12;

    drawWrapped(
      "I dati di contatto contenuti in questo documento sono resi disponibili esclusivamente per finalita professionali connesse alla richiesta QuickSolve indicata.",
      margin,
      9.5,
      contentWidth,
      false,
      muted,
      14
    );

    // Un profilo per pagina per chiarezza.
    orderedDesigners.forEach((designer, index) => {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;

      const fullName = [designer.first_name, designer.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      page.drawText(`Profilo ${index + 1} di ${orderedDesigners.length}`, {
        x: margin,
        y,
        size: 9,
        font: fontBold,
        color: green,
      });

      y -= 28;

      drawWrapped(
        fullName || "Progettista QuickSolve",
        margin,
        21,
        contentWidth,
        true,
        dark,
        28
      );

      y -= 4;

      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 1,
        color: lineColor,
      });

      y -= 22;

      drawField("Email", cleanText(designer.email));
      drawField("WhatsApp / Telefono", cleanText(designer.whatsapp));
      drawField("LinkedIn", cleanText(designer.linkedin));

      drawField(
        "Titolo di studio",
        [
          cleanText(designer.study_title),
          cleanText(designer.study_title_other),
        ]
          .filter(Boolean)
          .join(" - ")
      );

      drawField("Esperienza", cleanText(designer.experience));
      drawField(
        "Contratto / collaborazione",
        cleanText(designer.collaboration_type)
      );
      drawField("Fascia economica", cleanText(designer.budget_range));

      const locationParts = [
        cleanText(designer.selected_region),
        ...listFromUnknown(designer.selected_province_entries),
        designer.is_remote ? "Disponibile da remoto" : "",
      ].filter(Boolean);

      drawField("Zona / disponibilita", locationParts);

      const sectors = [
        ...listFromUnknown(designer.sectors),
        cleanText(designer.sector_other),
      ].filter(Boolean);

      drawField("Settori", sectors);

      const cad = [
        ...listFromUnknown(designer.cad_skills),
        ...listFromUnknown(designer.custom_cad_skills),
      ].filter(Boolean);

      drawField("Software CAD", cad);

      page.drawText(`QuickSolve Engineering Network - Profilo acquistato`, {
        x: margin,
        y: 28,
        size: 7.5,
        font: fontRegular,
        color: muted,
      });
    });

    const bytes = await pdf.save();
    const pdfBuffer = Buffer.from(bytes);

    // Archivia una copia privata e permanente nel CRM/Supabase Storage.
    // Il percorso e univoco per acquisto, quindi acquisti successivi non
    // sovrascrivono i dossier precedenti.
    const storagePath = `${purchase.request_id}/${purchase.id}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("purchase-pdfs")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Errore archiviazione PDF acquisto:", uploadError);
      throw new Error("Pagamento valido, ma non e stato possibile archiviare il PDF.");
    }

    const { error: savePathError } = await supabase
      .from("purchases")
      .update({
        pdf_storage_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (savePathError) {
      console.error("Errore salvataggio percorso PDF:", savePathError);
      throw new Error("PDF creato ma non collegato correttamente all'acquisto.");
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Errore generazione PDF profili acquistati:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Errore durante la generazione del PDF.",
      },
      { status: 500 }
    );
  }
}
