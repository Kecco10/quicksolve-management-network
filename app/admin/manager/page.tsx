"use client";

import { useEffect, useMemo, useState } from "react";
import {
  dailyRateOptions,
  regionOptions,
  regionProvinceMap,
  roleOptions as catalogueRoleOptions,
  sectorOptions as catalogueSectorOptions,
} from "@/lib/management-options";

type Manager = Record<string, any> & {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  birth_date?: string;
  study_title?: string;
  primary_role?: string;
  primary_role_family?: string;
  other_role?: string;
  secondary_roles?: unknown[];
  sectors?: string[];
  daily_rate_band?: string;
  profile_status?: "registered" | "qualified" | "contracted";
  updated_at?: string;
};

const statusLabel: Record<string, string> = {
  registered: "Registrato",
  qualified: "Qualificato",
  contracted: "Contrattualizzato",
};

const experienceLabel: Record<string, string> = {
  less_than_6: "Meno di 6 anni",
  "6_10": "6–10 anni",
  "11_20": "11–20 anni",
  over_20: "Oltre 20 anni",
};

const managerialExperienceLabel: Record<string, string> = {
  less_than_3: "Meno di 3 anni",
  "3_10": "3–10 anni",
  over_10: "Oltre 10 anni",
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

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatExperience(value: unknown) {
  if (!value) return "—";

  const normalized = String(value);

  return experienceLabel[normalized] ?? normalized;
}

function formatManagerialExperience(value: unknown) {
  if (!value) return "—";

  const normalized = String(value);

  return managerialExperienceLabel[normalized] ?? normalized;
}

function getSecondaryRoleNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      const record = item as Record<string, unknown>;

      const role =
        typeof record.role === "string"
          ? record.role.trim()
          : "";

      const otherRole =
        typeof record.other_role === "string"
          ? record.other_role.trim()
          : "";

      if (role === "Altro" && otherRole) {
        return otherRole;
      }

      return role || otherRole;
    })
    .filter(Boolean);
}

function getManagerRoleNames(manager: Manager): string[] {
  const primaryRole =
    manager.primary_role === "Altro" && manager.other_role
      ? String(manager.other_role).trim()
      : String(manager.primary_role ?? "").trim();

  return [
    primaryRole,
    ...getSecondaryRoleNames(manager.secondary_roles),
  ].filter(Boolean);
}

export default function ManagersAdminPage() {
  const [items, setItems] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [rateFilter, setRateFilter] = useState("all");
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

  const roleOptions = useMemo(
    () =>
      [
        ...new Set([
          ...catalogueRoleOptions,
          ...items.flatMap((item) => getManagerRoleNames(item)),
        ]),
      ]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "it")),
    [items]
  );

  const sectorFilterOptions = useMemo(
    () =>
      [
        ...new Set([
          ...catalogueSectorOptions.filter((item) => item !== "Altro"),
          ...items.flatMap((item) => item.sectors ?? []),
          ...items.map((item) => item.other_sector ?? "").filter(Boolean),
        ]),
      ].sort((a, b) => a.localeCompare(b, "it")),
    [items]
  );

  const rateOptions = useMemo(
    () =>
      [
        ...new Set([
          ...dailyRateOptions,
          ...items.map((item) => item.daily_rate_band ?? "").filter(Boolean),
        ]),
      ],
    [items]
  );

  const provinceOptions = useMemo(
    () =>
      regionFilter === "all"
        ? []
        : regionProvinceMap[regionFilter] ?? [],
    [regionFilter]
  );

  const filteredManagers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((manager) => {
      const fullName = `${manager.first_name ?? ""} ${manager.last_name ?? ""}`
        .trim()
        .toLowerCase();
      const area = manager.province || manager.region || "";

      const matchesQuery =
        !normalizedQuery || fullName.includes(normalizedQuery);
      const matchesRole =
        roleFilter === "all" ||
        getManagerRoleNames(manager).includes(roleFilter);
      const matchesArea = areaFilter === "all" || area === areaFilter;
      const matchesSector =
        sectorFilter === "all" || (manager.sectors ?? []).includes(sectorFilter);
      const matchesRate =
        rateFilter === "all" || manager.daily_rate_band === rateFilter;

      return (
        matchesQuery &&
        matchesRole &&
        matchesRegion &&
        matchesProvince &&
        matchesSector &&
        matchesRate
      );
    });
  }, [items, query, roleFilter, areaFilter, sectorFilter, rateFilter]);

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

    if (selected?.user_id === manager.user_id) {
      setSelected(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nome manager"
          className="min-w-0 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0b2340]"
        />

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="all">Ruolo</option>
          {roleOptions.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>

        <select
          value={regionFilter}
          onChange={(event) => {
            setRegionFilter(event.target.value);
            setProvinceFilter("all");
          }}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#164873]"
        >
          <option value="all">Regione</option>
          {regionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={provinceFilter}
          disabled={regionFilter === "all"}
          onChange={(event) => setProvinceFilter(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#164873] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="all">
            {regionFilter === "all" ? "Prima la regione" : "Provincia"}
          </option>
          {provinceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={sectorFilter}
          onChange={(event) => setSectorFilter(event.target.value)}
          className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="all">Settori</option>
          {sectorOptions.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>

        <select
          value={rateFilter}
          onChange={(event) => setRateFilter(event.target.value)}
          className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tariffa</option>
          {rateOptions.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
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
            <table className="w-full min-w-[1100px] text-left text-sm">
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
                    Settori
                  </th>

                  <th className="px-5 py-4">
                    Tariffa
                  </th>

                  <th className="px-5 py-4">
                    Stato
                  </th>

                  <th
                    className="w-12 px-3 py-4"
                    aria-label="Elimina"
                  />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredManagers.map((manager) => (
                  <tr
                    key={manager.user_id}
                    onClick={() => setSelected(manager)}
                    className="cursor-pointer transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">
                        {manager.first_name}{" "}
                        {manager.last_name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {formatDate(manager.birth_date)}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        {show(manager.study_title)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {getManagerRoleNames(manager).map(
                          (role, index) => (
                            <div
                              key={`${role}-${index}`}
                              className="font-semibold text-slate-900"
                            >
                              {role}
                            </div>
                          )
                        )}

                        {getManagerRoleNames(manager).length === 0 && (
                          <div className="text-slate-500">—</div>
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
                      <div className="max-w-[230px] leading-relaxed">
                        {show(manager.sectors)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {show(manager.daily_rate_band)}
                      </div>
                    </td>

                    <td
                      className="px-5 py-4"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
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

                    <td
                      className="px-3 py-4 text-right align-top"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void deleteManager(manager)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-700"
                        aria-label={`Elimina ${manager.first_name ?? ""} ${manager.last_name ?? ""}`}
                        title="Elimina manager"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredManagers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
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

            <div className="mt-7">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Contatti
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </div>

                  <div className="mt-1 break-words font-medium text-slate-900">
                    {show(selected.email)}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    WhatsApp
                  </div>

                  <div className="mt-1 break-words font-medium text-slate-900">
                    {show(selected.whatsapp_phone)}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    LinkedIn
                  </div>

                  <div className="mt-1 break-words font-medium text-slate-900">
                    {show(selected.linkedin_url)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Profilo professionale
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Esperienza lavorativa",
                    formatExperience(
                      selected.experience_band
                    ),
                  ],
                  [
                    "Esperienza manageriale",
                    formatManagerialExperience(
                      selected.managerial_experience_band
                    ),
                  ],
                  [
                    "Competenze",
                    selected.competencies,
                  ],
                  [
                    "Altra competenza",
                    selected.other_competency,
                  ],
                  [
                    "Metodologie",
                    selected.methodologies,
                  ],
                  [
                    "Altra metodologia",
                    selected.other_methodology,
                  ],
                  [
                    "Tipi produzione",
                    selected.production_types,
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
            </div>

            <div className="mt-7">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Disponibilità e incarico
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {[
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
                    formatDate(selected.available_from),
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
            </div>

            <div className="mt-7">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#164873]">
                Qualifiche e informazioni aggiuntive
              </h3>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "RC professionale",
                    selected.professional_insurance,
                  ],
                  [
                    "Massimale RC",
                    selected.insurance_limit,
                  ],
                  [
                    "Certificazioni",
                    selected.certifications,
                  ],
                  [
                    "Lingue",
                    selected.languages,
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}