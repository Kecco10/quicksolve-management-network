"use client";

import { useEffect, useMemo, useState } from "react";

type CompanyRequest = Record<string, any> & {
  id: number;
  request_code: string;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  primary_role: string;
  region: string;
  province: string;
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

function show(value: unknown) {
  if (Array.isArray(value)) {
    return value.length
      ? value
          .map((item) => {
            if (
              item &&
              typeof item === "object"
            ) {
              const record =
                item as Record<
                  string,
                  unknown
                >;

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

export default function RequestsAdminPage() {
  const [items, setItems] = useState<
    CompanyRequest[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [selected, setSelected] =
    useState<CompanyRequest | null>(
      null
    );

  async function loadRequests() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/company-requests",
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href =
          "/admin";
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Errore durante il caricamento."
        );
      }

      setItems(
        data.requests ?? []
      );
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

  const filteredRequests =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return items.filter(
        (request) => {
          const searchableText = [
            request.request_code,
            request.company_name,
            request.contact_first_name,
            request.contact_last_name,
            request.contact_email,
            request.primary_role,
            request.region,
            request.province,
            request.request_reason,
          ]
            .join(" ")
            .toLowerCase();

          const matchesQuery =
            !normalizedQuery ||
            searchableText.includes(
              normalizedQuery
            );

          const matchesStatus =
            status === "all" ||
            request.status === status;

          return (
            matchesQuery &&
            matchesStatus
          );
        }
      );
    }, [items, query, status]);

  async function changeStatus(
    request: CompanyRequest,
    nextStatus: string
  ) {
    const response = await fetch(
      "/api/company-requests",
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          id: request.id,
          status: nextStatus,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      alert(
        data.error ||
          "Aggiornamento non riuscito."
      );
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === request.id
          ? data.request
          : item
      )
    );

    if (
      selected?.id === request.id
    ) {
      setSelected(data.request);
    }
  }

  async function deleteRequest(
    request: CompanyRequest
  ) {
    const confirmed =
      window.confirm(
        `Eliminare definitivamente la richiesta ${request.request_code}?`
      );

    if (!confirmed) return;

    const response = await fetch(
      "/api/company-requests",
      {
        method: "DELETE",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          ids: [request.id],
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      alert(
        data.error ||
          "Eliminazione non riuscita."
      );
      return;
    }

    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== request.id
      )
    );

    setSelected(null);
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
            Richieste manager inviate
            dal sito QuickSolve
            Management Network.
          </p>
        </div>

        <div className="w-fit rounded-2xl bg-[#eef3f8] px-5 py-3 font-bold text-[#071b33]">
          {items.length} richieste
        </div>

      </div>

      <div className="mt-7 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">

        <input
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="Cerca codice, azienda, referente, ruolo, territorio..."
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0b2340]"
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
        >
          <option value="all">
            Tutti gli stati
          </option>

          <option value="new">
            Nuove
          </option>

          <option value="in_review">
            In lavorazione
          </option>

          <option value="matched">
            Matching
          </option>

          <option value="closed">
            Chiuse
          </option>

          <option value="archived">
            Archiviate
          </option>
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

            <table className="w-full min-w-[950px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">
                    Codice
                  </th>

                  <th className="px-5 py-4">
                    Azienda
                  </th>

                  <th className="px-5 py-4">
                    Manager ricercato
                  </th>

                  <th className="px-5 py-4">
                    Territorio
                  </th>

                  <th className="px-5 py-4">
                    Stato
                  </th>

                  <th className="px-5 py-4 text-right">
                    Azioni
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredRequests.map(
                  (request) => (
                    <tr
                      key={request.id}
                      className="transition hover:bg-slate-50/70"
                    >

                      <td className="px-5 py-4">

                        <div className="font-bold text-[#0b2340]">
                          {
                            request.request_code
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          {new Date(
                            request.created_at
                          ).toLocaleDateString(
                            "it-IT"
                          )}
                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <div className="font-bold text-slate-900">
                          {
                            request.company_name
                          }
                        </div>

                        <div className="text-slate-500">
                          {
                            request.contact_first_name
                          }{" "}
                          {
                            request.contact_last_name
                          }
                        </div>

                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {
                          request.primary_role
                        }
                      </td>

                      <td className="px-5 py-4">
                        {request.province}
                        {request.region
                          ? `, ${request.region}`
                          : ""}
                      </td>

                      <td className="px-5 py-4">

                        <select
                          value={
                            request.status
                          }
                          onChange={(
                            event
                          ) =>
                            void changeStatus(
                              request,
                              event.target
                                .value
                            )
                          }
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold"
                        >
                          <option value="new">
                            Nuova
                          </option>

                          <option value="in_review">
                            In lavorazione
                          </option>

                          <option value="matched">
                            Matching
                          </option>

                          <option value="closed">
                            Chiusa
                          </option>

                          <option value="archived">
                            Archiviata
                          </option>
                        </select>

                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            setSelected(
                              request
                            )
                          }
                          className="font-bold text-[#164873] hover:underline"
                        >
                          Apri
                        </button>

                      </td>

                    </tr>
                  )
                )}

                {filteredRequests.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Nessuna richiesta
                      trovata.
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
          onMouseDown={() =>
            setSelected(null)
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl md:p-8"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-sm font-bold text-[#164873]">
                  {
                    selected.request_code
                  }{" "}
                  ·{" "}
                  {statusLabels[
                    selected.status
                  ] || selected.status}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    selected.company_name
                  }
                </h2>

                <p className="text-slate-500">
                  {
                    selected.contact_first_name
                  }{" "}
                  {
                    selected.contact_last_name
                  }{" "}
                  ·{" "}
                  {
                    selected.contact_email
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
              >
                Chiudi
              </button>

            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">

              {[
                [
                  "Tipologia azienda",
                  selected.company_type,
                ],
                [
                  "Dimensione",
                  selected.company_size,
                ],
                [
                  "Settore azienda",
                  selected.company_sector,
                ],
                [
                  "Referente",
                  `${selected.contact_first_name} ${selected.contact_last_name}`,
                ],
                [
                  "Ruolo referente",
                  selected.contact_role,
                ],
                [
                  "Telefono",
                  selected.contact_phone,
                ],
                [
                  "Motivo richiesta",
                  selected.request_reason,
                ],
                [
                  "Obiettivo",
                  selected.request_objective,
                ],
                [
                  "Famiglia ruolo",
                  selected.role_family,
                ],
                [
                  "Ruolo principale",
                  selected.primary_role,
                ],
                [
                  "Ruoli secondari",
                  selected.secondary_roles,
                ],
                [
                  "Esperienza",
                  selected.experience_band,
                ],
                [
                  "Esperienza manageriale",
                  selected.managerial_experience_band,
                ],
                [
                  "Persone gestite",
                  selected.people_managed_band,
                ],
                [
                  "P&L",
                  selected.pnl_band,
                ],
                [
                  "Competenze",
                  selected.competencies,
                ],
                [
                  "Tipi produzione",
                  selected.production_types,
                ],
                [
                  "Settori",
                  selected.sectors,
                ],
                [
                  "Metodologie",
                  selected.methodologies,
                ],
                [
                  "Territorio",
                  `${selected.province}, ${selected.region}`,
                ],
                [
                  "Trasferte richieste",
                  selected.travel_required,
                ],
                [
                  "Tipi incarico",
                  selected.assignment_types,
                ],
                [
                  "Giorni/settimana",
                  selected.days_per_week,
                ],
                [
                  "Avvio",
                  selected.start_date,
                ],
                [
                  "Tariffa",
                  selected.daily_rate_band,
                ],
                [
                  "Certificazioni",
                  selected.required_certifications,
                ],
                [
                  "Lingue",
                  selected.required_languages,
                ],
                [
                  "Note",
                  selected.final_notes,
                ],
              ].map(
                ([label, value]) => (
                  <div
                    key={
                      label as string
                    }
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </div>

                    <div className="mt-1 break-words font-medium text-slate-900">
                      {show(value)}
                    </div>
                  </div>
                )
              )}

            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-3">

              {selected.status !==
                "archived" && (
                <button
                  type="button"
                  onClick={() =>
                    void changeStatus(
                      selected,
                      "archived"
                    )
                  }
                  className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700"
                >
                  Archivia
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  void deleteRequest(
                    selected
                  )
                }
                className="rounded-2xl border border-red-200 px-5 py-3 font-bold text-red-700 transition hover:bg-red-50"
              >
                Elimina
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}