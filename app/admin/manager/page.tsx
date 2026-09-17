"use client";

import { useEffect, useMemo, useState } from "react";

type Manager = Record<string, any> & {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  primary_role?: string;
  primary_role_family?: string;
  profile_status?: "registered" | "qualified" | "contracted";
  profile_visibility_enabled?: boolean;
  updated_at?: string;
};

const statusLabel: Record<string, string> = {
  registered: "Registrato",
  qualified: "Qualificato",
  contracted: "Contrattualizzato",
};

function show(value: unknown) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "—";
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  if (value === true) return "Sì";
  if (value === false) return "No";

  return value ? String(value) : "—";
}

export default function ManagersAdminPage() {
  const [items, setItems] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Manager | null>(null);

  async function loadManagers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/managers", {
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

      setItems(data.managers ?? []);
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
    void loadManagers();
  }, []);

  const filteredManagers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((manager) => {
      const searchableText = [
        manager.first_name,
        manager.last_name,
        manager.email,
        manager.primary_role,
        manager.primary_role_family,
        ...(manager.sectors ?? []),
        ...(manager.competencies ?? []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      const matchesStatus =
        status === "all" ||
        (manager.profile_status || "registered") === status;

      return matchesQuery && matchesStatus;
    });
  }, [items, query, status]);

  async function updateManager(
    manager: Manager,
    patch: Record<string, unknown>
  ) {
    const response = await fetch("/api/admin/managers", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: manager.user_id,
        ...patch,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.error ||
          "Aggiornamento del manager non riuscito."
      );
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.user_id === manager.user_id
          ? data.manager
          : item
      )
    );

    if (selected?.user_id === manager.user_id) {
      setSelected(data.manager);
    }
  }

  async function deleteManager(manager: Manager) {
    const confirmed = window.confirm(
      `Eliminare definitivamente ${manager.first_name ?? ""} ${
        manager.last_name ?? ""
      }?\n\nVerranno eliminati anche l'account Supabase Auth e i consensi collegati.`
    );

    if (!confirmed) return;

    const response = await fetch("/api/admin/managers", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: [manager.user_id],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.error ||
          "Eliminazione del manager non riuscita."
      );
      return;
    }

    setItems((current) =>
      current.filter(
        (item) => item.user_id !== manager.user_id
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
            Manager
          </h1>

          <p className="mt-2 text-slate-600">
            Profili iscritti al QuickSolve Management Network.
          </p>
        </div>

        <div className="w-fit rounded-2xl bg-[#eef3f8] px-5 py-3 font-bold text-[#071b33]">
          {items.length} profili
        </div>
      </div>

      <div className="mt-7 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Cerca nome, email, ruolo, settore, competenza..."
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0b2340]"
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
        >
          <option value="all">
            Tutti gli stati
          </option>

          <option value="registered">
            Registrati
          </option>

          <option value="qualified">
            Qualificati
          </option>

          <option value="contracted">
            Contrattualizzati
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
          Caricamento manager...
        </p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">
                    Manager
                  </th>

                  <th className="px-5 py-4">
                    Ruolo
                  </th>

                  <th className="px-5 py-4">
                    Area
                  </th>

                  <th className="px-5 py-4">
                    Stato
                  </th>

                  <th className="px-5 py-4">
                    Ricerca
                  </th>

                  <th className="px-5 py-4 text-right">
                    Azioni
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredManagers.map((manager) => (
                  <tr
                    key={manager.user_id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">
                        {manager.first_name}{" "}
                        {manager.last_name}
                      </div>

                      <div className="text-slate-500">
                        {manager.email}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {show(manager.primary_role)}
                      </div>

                      <div className="text-xs text-slate-500">
                        {show(
                          manager.primary_role_family
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {show(
                        manager.province ||
                          manager.region
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={
                          manager.profile_status ||
                          "registered"
                        }
                        onChange={(event) =>
                          void updateManager(
                            manager,
                            {
                              profile_status:
                                event.target.value,
                            }
                          )
                        }
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold"
                      >
                        <option value="registered">
                          Registrato
                        </option>

                        <option value="qualified">
                          Qualificato
                        </option>

                        <option value="contracted">
                          Contrattualizzato
                        </option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          void updateManager(
                            manager,
                            {
                              profile_visibility_enabled:
                                manager.profile_visibility_enabled ===
                                false,
                            }
                          )
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          manager.profile_visibility_enabled ===
                          false
                            ? "bg-slate-100 text-slate-600"
                            : "bg-[#e8f0f8] text-[#0b2340]"
                        }`}
                      >
                        {manager.profile_visibility_enabled ===
                        false
                          ? "Pausa"
                          : "Attivo"}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelected(manager)
                        }
                        className="font-bold text-[#164873] hover:underline"
                      >
                        Apri
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredManagers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Nessun manager trovato.
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
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl md:p-8"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#164873]">
                  {
                    statusLabel[
                      selected.profile_status ||
                        "registered"
                    ]
                  }
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selected.first_name}{" "}
                  {selected.last_name}
                </h2>

                <p className="text-slate-500">
                  {selected.email}
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
                  "Ruolo principale",
                  selected.primary_role,
                ],
                [
                  "Famiglia ruolo",
                  selected.primary_role_family,
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
                  "Competenze",
                  selected.competencies,
                ],
                [
                  "Metodologie",
                  selected.methodologies,
                ],
                [
                  "Settori",
                  selected.sectors,
                ],
                [
                  "Tipi produzione",
                  selected.production_types,
                ],
                [
                  "Aree geografiche",
                  selected.geographic_areas,
                ],
                [
                  "Trasferte",
                  selected.travel_available,
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
                  "Disponibile dal",
                  selected.available_from,
                ],
                [
                  "Tariffa giornaliera",
                  selected.daily_rate_band,
                ],
                [
                  "Persone gestite",
                  selected.people_managed_band,
                ],
                [
                  "P&L / budget",
                  selected.pnl_budget_band,
                ],
                [
                  "Fatturato azienda",
                  selected.company_revenue_band,
                ],
                [
                  "P.IVA",
                  selected.vat_active,
                ],
                [
                  "RC professionale",
                  selected.professional_insurance,
                ],
                [
                  "Massimale RC",
                  selected.insurance_limit,
                ],
                [
                  "Titolo di studio",
                  selected.study_title,
                ],
                [
                  "Certificazioni",
                  selected.certifications,
                ],
                [
                  "Lingue",
                  selected.languages,
                ],
                [
                  "WhatsApp",
                  selected.whatsapp_phone,
                ],
                [
                  "LinkedIn",
                  selected.linkedin_url,
                ],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </div>

                  <div className="mt-1 break-words font-medium text-slate-900">
                    {show(value)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  void deleteManager(selected)
                }
                className="rounded-2xl border border-red-200 px-5 py-3 font-bold text-red-700 transition hover:bg-red-50"
              >
                Elimina manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}