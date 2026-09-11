"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getCheckoutDesignerZone } from "@/lib/checkout-location-display";

type CommercialPlanId = "go" | "plus" | "pro";

type CommercialPlan = {
  id: CommercialPlanId;
  name: string;
  includedContacts: number;
  price: number;
  tagline: string;
  badge?: string;
};

type Designer = {
  id: string;
  percentage: number;
  age: number | null;
  studyTitle: string;
  studyTitleOther: string;
  experience: string;
  collaborationType: string;
  budgetRange: string;
  selectedRegion: string;
  selectedProvinceEntries: Array<{
    id?: string;
    region?: string;
    province?: string;
  }>;
  isRemote: boolean;
  cadSkills: Array<{ name: string; rating: number }>;
  customCadSkills: Array<{ name: string; rating: number }>;
  sectors: string[];
  sectorOther: string;
};

type SelectionData = {
  selection: {
    token: string;
    requestCode: string;
    companyName: string;
    contactEmail: string;
    requestProvince: string;
  };
  designers: Designer[];
};

const EXTRA_CONTACT_PRICE = 19;

const commercialPlans: CommercialPlan[] = [
  {
    id: "go",
    name: "QuickSolve Go",
    includedContacts: 5,
    price: 79,
    tagline: "Per una ricerca mirata e una selezione rapida.",
  },
  {
    id: "plus",
    name: "QuickSolve Plus",
    includedContacts: 10,
    price: 129,
    tagline: "Più scelta, più confronto, più convenienza per contatto.",
    badge: "Più scelto",
  },
  {
    id: "pro",
    name: "QuickSolve Pro",
    includedContacts: 20,
    price: 199,
    tagline: "La soluzione più conveniente per ricerche ampie e continuative.",
  },
];

function uniqueStrings(values: string[]) {
  return Array.from(
    new Map(
      values
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => [value.toLowerCase(), value])
    ).values()
  );
}


function getDesignerZone(designer: Designer, requestedProvince: string) {
  return getCheckoutDesignerZone({
    selectedProvinceEntries: designer.selectedProvinceEntries,
    selectedRegion: designer.selectedRegion,
    isRemote: designer.isRemote,
    requestedProvince,
  });
}

function getDesignerStudyTitle(designer: Designer) {
  if (
    designer.studyTitle.toLowerCase() === "altro" &&
    designer.studyTitleOther.trim()
  ) {
    return designer.studyTitleOther.trim();
  }

  return designer.studyTitle || "Non specificato";
}

function getDesignerCad(designer: Designer) {
  return [...designer.cadSkills, ...designer.customCadSkills].filter(
    (item) => item.name?.trim() && Number(item.rating) > 0
  );
}

function getDesignerSectors(designer: Designer) {
  return uniqueStrings([
    ...designer.sectors,
    ...(designer.sectorOther.trim() ? [designer.sectorOther.trim()] : []),
  ]);
}

export default function AssistedSelectionPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params?.token === "string" ? params.token : "";

  const [data, setData] = useState<SelectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedPlanId, setSelectedPlanId] =
    useState<CommercialPlanId | null>(null);
  const [selectedDesignerIds, setSelectedDesignerIds] = useState<string[]>([]);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (!token) return;

    async function loadSelection() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(`/api/assisted-selections/${token}`, {
          cache: "no-store",
        });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.error || "Selezione non disponibile.");
        }

        setData(json);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Selezione non disponibile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSelection();
  }, [token]);

  const matchResults = data?.designers ?? [];
  const selectedPlan = useMemo(
    () => commercialPlans.find((plan) => plan.id === selectedPlanId) ?? null,
    [selectedPlanId]
  );

  const selectedDesignerCount = selectedDesignerIds.length;
  const isIndividualUnlock = matchResults.length > 0 && matchResults.length < 5;
  const extraContactsCount = selectedPlan
    ? Math.max(0, selectedDesignerCount - selectedPlan.includedContacts)
    : 0;

  const purchaseTotal = isIndividualUnlock
    ? selectedDesignerCount * EXTRA_CONTACT_PRICE
    : selectedPlan
    ? selectedPlan.price + extraContactsCount * EXTRA_CONTACT_PRICE
    : 0;

  const canContinueToUnlock = isIndividualUnlock
    ? selectedDesignerCount > 0
    : selectedPlan !== null &&
      selectedDesignerCount >= selectedPlan.includedContacts;

  function selectCommercialPlan(plan: CommercialPlan) {
    if (matchResults.length < plan.includedContacts) return;
    setSelectedPlanId(plan.id);
    setSelectedDesignerIds([]);
    setCheckoutError("");
  }

  function toggleDesignerSelection(designerId: string) {
    if (!selectedPlan && !isIndividualUnlock) return;

    setSelectedDesignerIds((current) =>
      current.includes(designerId)
        ? current.filter((id) => id !== designerId)
        : [...current, designerId]
    );
  }

  async function startCheckout() {
    if (!data || !canContinueToUnlock || isStartingCheckout) return;

    try {
      setCheckoutError("");
      setIsStartingCheckout(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan?.id ?? null,
          selectedDesignerIds,
          requestCode: data.selection.requestCode,
          contactEmail: data.selection.contactEmail || null,
          isIndividualUnlock,
          assistedSelectionToken: data.selection.token,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.url) {
        throw new Error(json?.error || "Impossibile avviare il pagamento.");
      }

      window.location.href = json.url;
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Impossibile avviare il pagamento."
      );
      setIsStartingCheckout(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <section className="space-y-8">
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  Analisi dei profili in corso...
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Stiamo caricando i progettisti selezionati per la tua richiesta.
                </p>
              </div>
            ) : loadError || !data ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  Selezione non disponibile
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {loadError || "Il link non è più valido."}
                </p>
              </div>
            ) : matchResults.length > 0 ? (
              <>
                <div className="grid gap-4 lg:grid-cols-3">
                  {commercialPlans.map((plan) => {
                    const isAvailable =
                      matchResults.length >= plan.includedContacts;
                    const isSelected = selectedPlanId === plan.id;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => selectCommercialPlan(plan)}
                        disabled={!isAvailable}
                        className={`relative flex min-h-[330px] flex-col rounded-3xl border p-6 text-left transition ${
                          isAvailable
                            ? isSelected
                              ? "border-2 border-emerald-900 bg-emerald-50 shadow-md"
                              : "border-2 border-slate-400 bg-white hover:-translate-y-0.5 hover:border-emerald-800 hover:shadow-md"
                            : "cursor-not-allowed border-2 border-slate-400 bg-slate-50 opacity-40"
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute right-5 top-5 rounded-full bg-emerald-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                            {plan.badge}
                          </span>
                        )}

                        <p className="pr-24 text-2xl font-bold text-slate-900">
                          {plan.name}
                        </p>
                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">
                          {plan.tagline}
                        </p>

                        <div className="mt-6">
                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold tracking-tight text-slate-950">
                              €{plan.price}
                            </span>
                            <span className="pb-1 text-sm text-slate-500">+ IVA</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-emerald-950">
                            {plan.includedContacts} contatti inclusi
                          </p>
                        </div>

                        <div className="mt-6 space-y-2 text-sm text-slate-700">
                          <p>✓ Scegli liberamente i profili più interessanti</p>
                          <p>✓ Contatti diretti, senza commissioni successive</p>
                          {plan.id === "go" && (
                            <>
                              <p>✓ Ideale per una prima ricerca mirata</p>
                              <p>✓ Solo €15,80 per contatto incluso</p>
                            </>
                          )}
                          {plan.id === "plus" && (
                            <>
                              <p>✓ Più confronto tra profili compatibili</p>
                              <p>✓ Solo €12,90 per contatto incluso</p>
                            </>
                          )}
                          {plan.id === "pro" && (
                            <>
                              <p>✓ Massima libertà di selezione</p>
                              <p>✓ Solo €9,95 per contatto incluso</p>
                            </>
                          )}
                          <p>✓ Contatti extra a €{EXTRA_CONTACT_PRICE} + IVA ciascuno</p>
                        </div>

                        <div className="mt-auto pt-6">
                          <span
                            className={`flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold ${
                              isAvailable
                                ? isSelected
                                  ? "bg-emerald-950 text-white"
                                  : "border border-emerald-900 text-emerald-950"
                                : "border border-slate-300 text-slate-500"
                            }`}
                          >
                            {isAvailable
                              ? isSelected
                                ? "Piano selezionato"
                                : `Scegli ${plan.name.replace("QuickSolve ", "")}`
                              : "Non disponibile per questa ricerca"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-center sm:px-5">
                  <p className="text-sm font-bold leading-5 text-emerald-950">
                    Nessuna success fee e commissione su assunzione.
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-slate-700">
                    Seleziona i progettisti, sblocca i contatti che vuoi approfondire. Il database è aggiornato continuamente con nuovi profili e disponibilità.
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-5 text-emerald-950">
                    Per esigenze superiori a 20 contatti o pacchetti dedicati,{" "}
                    <a
                      href="mailto:francesco.nanni@quicksolve.it"
                      className="underline decoration-emerald-700 underline-offset-2 transition hover:text-emerald-700"
                    >
                      contattaci
                    </a>
                    : possiamo costruire una soluzione su misura da esperti nel settore.
                  </p>
                </div>

                {isIndividualUnlock && (
                  <div className="rounded-2xl border-2 border-emerald-800 bg-emerald-50 px-4 py-3 text-center">
                    <p className="text-sm font-bold text-emerald-950">
                      Sblocco singolo disponibile
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-700">
                      Questa ricerca ha prodotto {matchResults.length}{" "}
                      {matchResults.length === 1
                        ? "profilo compatibile"
                        : "profili compatibili"}.
                      Puoi selezionare e sbloccare quelli che vuoi a €{EXTRA_CONTACT_PRICE} + IVA per contatto.
                    </p>
                  </div>
                )}

                {selectedPlan ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-900">
                          {selectedPlan.name}
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-slate-900">
                          Scegli i progettisti da sbloccare
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Seleziona almeno {selectedPlan.includedContacts} profili.
                          Puoi aggiungerne altri a €{EXTRA_CONTACT_PRICE} + IVA ciascuno.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-5 py-3 text-left sm:text-right">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          Selezionati
                        </p>
                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {selectedDesignerCount}
                          <span className="text-sm font-medium text-slate-500">
                            {" "} / {selectedPlan.includedContacts} inclusi
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[...matchResults]
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((designer) => {
                      const cad = getDesignerCad(designer);
                      const sectors = getDesignerSectors(designer);
                      const isSelected = selectedDesignerIds.includes(designer.id);
                      const canSelect = selectedPlan !== null || isIndividualUnlock;

                      return (
                        <button
                          key={designer.id}
                          type="button"
                          onClick={() => toggleDesignerSelection(designer.id)}
                          disabled={!canSelect}
                          className={`relative flex w-full self-start flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                            !canSelect
                              ? "cursor-default border-slate-200 opacity-65"
                              : isSelected
                              ? "border-emerald-700 bg-emerald-100 shadow-md ring-2 ring-emerald-300"
                              : "border-slate-200 hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-stretch gap-2 p-3 pb-2">
                            <div className={`relative flex min-w-0 flex-1 items-center rounded-xl px-3 py-2 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                  Contratto / collaborazione
                                </p>
                                <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                                  {designer.collaborationType || "Non specificato"}
                                </p>
                                <p className="mt-0.5 truncate text-xs font-medium text-emerald-800">
                                  {designer.budgetRange || "Range economico non specificato"}
                                </p>
                              </div>
                            </div>

                            <div className="flex w-[82px] shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-950 px-2 py-2 text-center text-white">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
                                Match
                              </p>
                              <p className="mt-0.5 text-xl font-bold">
                                {designer.percentage}%
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                            <div className={`rounded-xl px-3 py-2.5 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <p className="text-xs text-slate-500">Età</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {designer.age !== null
                                  ? `${designer.age} anni`
                                  : "Non disponibile"}
                              </p>
                            </div>

                            <div className={`rounded-xl px-3 py-2.5 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <p className="text-xs text-slate-500">Zona operativa</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {getDesignerZone(designer, data.selection.requestProvince)}
                              </p>
                            </div>

                            <div className={`rounded-xl px-3 py-2.5 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <p className="text-xs text-slate-500">Titolo di studio</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {getDesignerStudyTitle(designer)}
                              </p>
                            </div>

                            <div className={`rounded-xl px-3 py-2.5 ${isSelected ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <p className="text-xs text-slate-500">Esperienza</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {designer.experience || "Non specificata"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4 border-t border-slate-100 p-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Software CAD
                              </p>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {cad.length > 0 ? (
                                  cad.map((software) => (
                                    <div
                                      key={`${software.name}-${software.rating}`}
                                      className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-emerald-950"
                                    >
                                      <p className="text-xs font-semibold">
                                        {software.name}
                                      </p>
                                      <p
                                        className="mt-0.5 whitespace-nowrap text-[11px] tracking-[0.08em] text-amber-500"
                                        aria-label={`${software.rating} stelle su 5`}
                                        title={`${software.rating}/5`}
                                      >
                                        {"★".repeat(software.rating)}
                                        <span className="text-slate-300">
                                          {"★".repeat(5 - software.rating)}
                                        </span>
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-sm text-slate-500">
                                    Non specificati
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Settori di esperienza
                              </p>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {sectors.length > 0 ? (
                                  sectors.map((sector) => (
                                    <span
                                      key={sector}
                                      className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                                    >
                                      {sector}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-slate-500">
                                    Non specificati
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>

                {(selectedPlan || isIndividualUnlock) && (
                  <div className="sticky bottom-4 z-20 rounded-3xl border border-emerald-900/10 bg-white/95 p-5 shadow-xl backdrop-blur">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {selectedDesignerCount} profili selezionati
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {isIndividualUnlock ? (
                            <>€{EXTRA_CONTACT_PRICE} + IVA per ogni contatto selezionato</>
                          ) : selectedPlan ? (
                            <>
                              {selectedPlan.includedContacts} inclusi nel piano
                              {extraContactsCount > 0
                                ? ` · ${extraContactsCount} extra × €${EXTRA_CONTACT_PRICE}`
                                : ""}
                            </>
                          ) : null}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="sm:text-right">
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                            Totale
                          </p>
                          <p className="text-2xl font-bold text-slate-950">
                            €{purchaseTotal}{" "}
                            <span className="text-sm font-medium text-slate-500">
                              + IVA
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={startCheckout}
                          disabled={!canContinueToUnlock || isStartingCheckout}
                          className="rounded-2xl bg-emerald-950 px-6 py-3 font-semibold text-white transition enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isStartingCheckout
                            ? "Apertura pagamento..."
                            : canContinueToUnlock
                            ? "Continua →"
                            : isIndividualUnlock
                            ? "Seleziona almeno 1 profilo"
                            : `Seleziona almeno ${selectedPlan?.includedContacts ?? 0} profili`}
                        </button>
                      </div>
                    </div>
                    {checkoutError && (
                      <p className="mt-3 text-center text-sm font-medium text-red-600">
                        {checkoutError}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  Nessun progettista con compatibilità pari o superiore al 70%
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Al momento i profili della proposta non risultano più disponibili.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
