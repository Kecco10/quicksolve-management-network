"use client";

import { useEffect, useMemo, useState } from "react";

type CompanyRequest = Record<string, any> & {
  id: number;
  request_code: string;
  company_name: string;
  company_type?: string;
  other_company_type?: string;
  company_size?: string;
  company_sector?: string;
  other_company_sector?: string;

  contact_first_name?: string;
  contact_last_name?: string;
  contact_role?: string;
  contact_email?: string;
  contact_phone?: string;

  request_reason?: string;
  other_request_reason?: string;
  request_objective?: string;

  role_family?: string;
  primary_role?: string;
  other_role?: string;
  secondary_roles?: unknown[];

  experience_band?: string;
  managerial_experience_band?: string;
  people_managed_band?: string;
  pnl_band?: string;
  competencies?: string[];
  other_competency?: string;

  production_types?: string[];
  sectors?: string[];
  other_sector?: string;
  methodologies?: string[];
  other_methodology?: string;

  region?: string;
  province?: string;
  travel_required?: boolean;

  assignment_types?: string[];
  days_per_week?: number;
  start_date?: string;
  daily_rate_band?: string;
  required_certifications?: string[];
  required_languages?: string[];
  final_notes?: string;

  status: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  new: "Nuova",
  in_review: "In lavorazione",
  matched: "Matching",
  closed: "Chiusa",
  archived: "Archiviata",
};

const experienceLabels: Record<string, string> = {
  less_than_6: "Meno di 6 anni",
  "6_10": "6–10 anni",
  "11_20": "11–20 anni",
  over_20: "Oltre 20 anni",
};

const managerialExperienceLabels: Record<string, string> = {
  less_than_3: "Meno di 3 anni",
  "3_10": "3–10 anni",
  over_10: "Oltre 10 anni",
};

function show(value: unknown) {
  if (Array.isArray(value)) {
    return value.length
      ? value
          .map((item) => {
            if (item && typeof item === "object") {
              const record = item as Record<string, unknown>;

              return [
                record.family,
                record.role,
                record.other_role,
              ]
                .filter(Boolean)
                .join(" · ");
            }

            return String(item);
          })
          .filter(Boolean)
          .join(", ")
      : "—";
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  if (value === true) return "Sì";
  if (value === false) return "No";

  return value ? String(value) : "—";
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("it-IT");
}

function formatExperience(value: unknown) {
  if (!value) return "—";

  const normalized = String(value);

  return experienceLabels[normalized] ?? normalized;
}

function formatManagerialExperience(value: unknown) {
  if (!value) return "—";

  const normalized = String(value);

  return managerialExperienceLabels[normalized] ?? normalized;
}

function formatCompanyType(request: CompanyRequest) {
  if (
    request.company_type === "Altro" &&
    request.other_company_type
  ) {
    return request.other_company_type;
  }

  return show(request.company_type);
}

function formatCompanySector(request: CompanyRequest) {
  if (
    request.company_sector === "Altro" &&
    request.other_company_sector
  ) {
    return request.other_company_sector;
  }

  return show(request.company_sector);
}

function formatRequestReason(request: CompanyRequest) {
  if (
    request.request_reason === "Altro" &&
    request.other_request_reason
  ) {
    return request.other_request_reason;
  }

  return show(request.request_reason);
}

function formatRole(request: CompanyRequest) {
  if (
    request.primary_role === "Altro" &&
    request.other_role
  ) {
    return request.other_role;
  }

  return show(request.primary_role);
}

function formatArea(request: CompanyRequest) {
  return show(request.province || request.region);
}

function formatSectors(request: CompanyRequest) {
  const sectors = Array.isArray(request.sectors)
    ? [...request.sectors]
    : [];

  if (request.other_sector) {
    sectors.push(request.other_sector);
  }

  return show(sectors);
}

function DetailCard({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: unknown;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl bg-slate-50 p-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 break-words font-medium text-slate-900">
        {show(value)}
      </div>
    </div>
  );
}

export default function RequestsAdminPage() {
  const [items, setItems] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] =
    useState<CompanyRequest | null>(null);

  async function loadRequests() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/company-requests", {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = "/admin";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Errore durante il caricamento."
        );
      }

      setItems(data.requests ?? []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Errore durante il caricamento."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((request) => {
      const searchableText = [
        request.request_code,
        request.company_name,
        request.company_type,
        request.other_company_type,
        request.company_size,
        request.company_sector,
        request.other_company_sector,
        request.contact_first_name,
        request.contact_last_name,
        request.contact_role,
        request.contact_email,
        request.primary_role,
        request.other_role,
        request.role_family,
        request.region,
        request.province,
        request.request_reason,
        request.other_request_reason,
        request.daily_rate_band,
        ...(request.sectors ?? []),
        ...(request.competencies ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      const matchesStatus =
        status === "all" || request.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [items, query, status]);

  async function changeStatus(
    request: CompanyRequest,
    nextStatus: string
  ) {
    const response = await fetch("/api/company-requests", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: request.id,
        status: nextStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Aggiornamento non riuscito.");
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === request.id ? data.request : item
      )
    );

    if (selected?.id === request.id) {
      setSelected(data.request);
    }
  }

  async function deleteRequest(request: CompanyRequest) {
    const confirmed = window.confirm(
      `Eliminare definitivamente la richiesta ${request.request_code} di ${request.company_name}?`
    );

    if (!confirmed) return;

    const response = await fetch("/api/company-requests", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: [request.id],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Eliminazione non riuscita.");
      return;
    }

    setItems((current) =>
      current.filter((item) => item.id !== request.id)
    );

    if (selected?.id === request.id) {
      setSelected(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#164873]">
            CRM
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Richieste aziende
          </h1>

          <p className="mt-2 text-slate-600">
            Richieste manager inviate dal sito QuickSolve Management
            Network.
          </p>
        </div>

        <div className="w-fit rounded-2xl bg-[#eef3f8] px-5 py-3 font-bold text-[#071b33]">
          {items.length} richieste
        </div>
      </div>

      <div className="mt-7 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca azienda, codice RQ, ruolo, area, settore..."
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0b2340]"
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
        >
          <option value="all">Tutti gli stati</option>
          <option value="new">Nuove</option>
          <option value="in_review">In lavorazione</option>
          <option value="matched">Matching</option>
          <option value="closed">Chiuse</option>
          <option value="archived">Archiviate</option>
        </select>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-slate-500">
          Caricamento richieste...
        </p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Azienda</th>
                  <th className="px-5 py-4">Ruolo</th>
                  <th className="px-5 py-4">Area</th>
                  <th className="px-5 py-4">Settori</th>
                  <th className="px-5 py-4">Tariffa</th>
                  <th className="px-5 py-4">Stato</th>

                  <th
                    className="w-12 px-3 py-4"
                    aria-label="Elimina"
                  />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => setSelected(request)}
                    className="cursor-pointer transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">
                        {request.company_name}
                      </div>

                      <div className="mt-1 text-xs font-medium text-slate-500">
                        {request.request_code}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {formatRole(request)}
                      </div>

                      <div className="text-xs text-slate-500">
                        {show(request.role_family)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {formatArea(request)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="max-w-[230px] leading-relaxed">
                        {formatSectors(request)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {show(request.daily_rate_band)}
                      </div>
                    </td>

                    <td
                      className="px-5 py-4"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <select
                        value={request.status}
                        onChange={(event) =>
                          void changeStatus(
                            request,
                            event.target.value
                          )
                        }
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold"
                      >
                        <option value="new">Nuova</option>
                        <option value="in_review">
                          In lavorazione
                        </option>
                        <option value="matched">Matching</option>
                        <option value="closed">Chiusa</option>
                        <option value="archived">
                          Archiviata
                        </option>
                      </select>
                    </td>

                    <td
                      className="px-3 py-4 text-right align-top"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void deleteRequest(request)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-700"
                        aria-label={`Elimina richiesta ${request.request_code}`}
                        title="Elimina richiesta"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Nessuna richiesta trovata.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-5"
          onMouseDown={() => setSelected(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl md:p-8"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#164873]">
                  {statusLabels[selected.status] || selected.status}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selected.company_name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-50"
              >
                Chiudi
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span>
                Codice richiesta:{" "}
                <strong className="text-slate-700">
                  {selected.request_code}
                </strong>
              </span>

              <span>
                Ricevuta il:{" "}
                <strong className="text-slate-700">
                  {formatDate(selected.created_at)}
                </strong>
              </span>
            </div>

            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Azienda
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <DetailCard
                  label="Tipologia azienda"
                  value={formatCompanyType(selected)}
                />

                <DetailCard
                  label="Dimensione azienda"
                  value={selected.company_size}
                />

                <DetailCard
                  label="Settore azienda"
                  value={formatCompanySector(selected)}
                  wide
                />
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Referente
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <DetailCard
                  label="Nome e cognome"
                  value={[
                    selected.contact_first_name,
                    selected.contact_last_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />

                <DetailCard
                  label="Ruolo referente"
                  value={selected.contact_role}
                />

                <DetailCard
                  label="Email"
                  value={selected.contact_email}
                />

                <DetailCard
                  label="Telefono"
                  value={selected.contact_phone}
                />
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Esigenza
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <DetailCard
                  label="Motivo richiesta"
                  value={formatRequestReason(selected)}
                />

                <DetailCard
                  label="Obiettivo"
                  value={selected.request_objective}
                  wide
                />
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Manager ricercato
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <DetailCard
                  label="Ruoli secondari"
                  value={selected.secondary_roles}
                  wide
                />

                <DetailCard
                  label="Esperienza lavorativa"
                  value={formatExperience(
                    selected.experience_band
                  )}
                />

                <DetailCard
                  label="Esperienza manageriale"
                  value={formatManagerialExperience(
                    selected.managerial_experience_band
                  )}
                />

                <DetailCard
                  label="Persone gestite"
                  value={selected.people_managed_band}
                />

                <DetailCard
                  label="P&L / budget"
                  value={selected.pnl_band}
                />

                <DetailCard
                  label="Competenze"
                  value={selected.competencies}
                  wide
                />

                {selected.other_competency && (
                  <DetailCard
                    label="Altra competenza"
                    value={selected.other_competency}
                    wide
                  />
                )}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Contesto dell&apos;incarico
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <DetailCard
                  label="Tipi produzione"
                  value={selected.production_types}
                />

                <DetailCard
                  label="Metodologie"
                  value={selected.methodologies}
                />

                {selected.other_methodology && (
                  <DetailCard
                    label="Altra metodologia"
                    value={selected.other_methodology}
                  />
                )}

                <DetailCard
                  label="Trasferte richieste"
                  value={selected.travel_required}
                />
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Modalità dell&apos;incarico
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <DetailCard
                  label="Tipi incarico"
                  value={selected.assignment_types}
                />

                <DetailCard
                  label="Giorni/settimana"
                  value={selected.days_per_week}
                />

                <DetailCard
                  label="Avvio"
                  value={formatDate(selected.start_date)}
                />

                <DetailCard
                  label="Certificazioni richieste"
                  value={selected.required_certifications}
                />

                <DetailCard
                  label="Lingue richieste"
                  value={selected.required_languages}
                />

                <DetailCard
                  label="Note"
                  value={selected.final_notes}
                  wide
                />
              </div>
            </section>

            {selected.status !== "archived" && (
              <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    void changeStatus(selected, "archived")
                  }
                  className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Archivia richiesta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}