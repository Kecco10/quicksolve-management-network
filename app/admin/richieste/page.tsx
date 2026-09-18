"use client";

import { useEffect, useMemo, useState } from "react";
import {
  dailyRateOptions,
  regionOptions,
  regionProvinceMap,
  roleOptions as catalogueRoleOptions,
  sectorOptions as catalogueSectorOptions,
} from "@/lib/management-options";

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
  required_certifications?: string[] | string;
  required_languages?: string[] | string;
  final_notes?: string;

  status: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  new: "Nuova",
  in_review: "In lavorazione",
  completed: "Completata",

  // Compatibilità con eventuali vecchie richieste
  matched: "Completata",
  closed: "Completata",

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
          .filter(Boolean)
          .join(", ")
      : "—";
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return JSON.stringify(value);
  }

  if (value === true) return "Sì";
  if (value === false) return "No";

  return value ? String(value) : "—";
}

function formatDate(value: unknown) {
  if (
    !value ||
    typeof value !== "string"
  ) {
    return "—";
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "it-IT"
  );
}

function formatExperience(
  value: unknown
) {
  if (!value) return "—";

  const normalized = String(value);

  return (
    experienceLabels[normalized] ??
    normalized
  );
}

function formatManagerialExperience(
  value: unknown
) {
  if (!value) return "—";

  const normalized = String(value);

  return (
    managerialExperienceLabels[
      normalized
    ] ?? normalized
  );
}

function formatCompanyType(
  request: CompanyRequest
) {
  if (
    request.company_type === "Altro" &&
    request.other_company_type
  ) {
    return request.other_company_type;
  }

  return show(request.company_type);
}

function formatCompanySector(
  request: CompanyRequest
) {
  if (
    request.company_sector === "Altro" &&
    request.other_company_sector
  ) {
    return request.other_company_sector;
  }

  return show(request.company_sector);
}

function formatRequestReason(
  request: CompanyRequest
) {
  if (
    request.request_reason === "Altro" &&
    request.other_request_reason
  ) {
    return request.other_request_reason;
  }

  return show(request.request_reason);
}

function formatRole(
  request: CompanyRequest
) {
  if (
    request.primary_role === "Altro" &&
    request.other_role
  ) {
    return request.other_role;
  }

  return show(request.primary_role);
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

function getRequestRoleNames(
  request: CompanyRequest
): string[] {
  const primaryRole =
    request.primary_role === "Altro" &&
    request.other_role
      ? request.other_role.trim()
      : request.primary_role?.trim() ?? "";

  return [
    primaryRole,
    ...getSecondaryRoleNames(
      request.secondary_roles
    ),
  ].filter(Boolean);
}

function formatArea(
  request: CompanyRequest
) {
  return show(
    request.province || request.region
  );
}

function getAreaValue(
  request: CompanyRequest
) {
  return (
    request.province ||
    request.region ||
    ""
  );
}

function getSectorValues(
  request: CompanyRequest
) {
  const sectors = Array.isArray(
    request.sectors
  )
    ? [...request.sectors]
    : [];

  if (request.other_sector) {
    sectors.push(request.other_sector);
  }

  return sectors;
}

function formatSectors(
  request: CompanyRequest
) {
  return show(getSectorValues(request));
}

function normalizeVisibleStatus(
  status: string
) {
  if (
    status === "matched" ||
    status === "closed"
  ) {
    return "completed";
  }

  return status;
}

function uniqueSorted(
  values: Array<
    string | null | undefined
  >
) {
  return [
    ...new Set(
      values
        .map((value) =>
          value?.trim()
        )
        .filter(
          (value): value is string =>
            Boolean(value)
        )
    ),
  ].sort((a, b) =>
    a.localeCompare(b, "it")
  );
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
  const [items, setItems] =
    useState<CompanyRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [areaFilter, setAreaFilter] =
    useState("");

  const [
    sectorFilter,
    setSectorFilter,
  ] = useState("");

  const [rateFilter, setRateFilter] =
    useState("");

  const [selected, setSelected] =
    useState<CompanyRequest | null>(
      null
    );

  const [
    selectedActiveIds,
    setSelectedActiveIds,
  ] = useState<number[]>([]);

  const [
    selectedArchivedIds,
    setSelectedArchivedIds,
  ] = useState<number[]>([]);

  const [
    archiveOpen,
    setArchiveOpen,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

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
        window.location.href = "/admin";
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

  const activeRequests =
    useMemo(
      () =>
        items.filter(
          (request) =>
            request.status !==
            "archived"
        ),
      [items]
    );

  const archivedRequests =
    useMemo(
      () =>
        items.filter(
          (request) =>
            request.status ===
            "archived"
        ),
      [items]
    );

  const roleOptions = useMemo(
    () =>
      uniqueSorted([
        ...catalogueRoleOptions,
        ...activeRequests.flatMap((request) =>
          getRequestRoleNames(request)
        ),
      ]),
    [activeRequests]
  );

  const sectorFilterOptions = useMemo(
    () =>
      uniqueSorted([
        ...catalogueSectorOptions.filter((item) => item !== "Altro"),
        ...activeRequests.flatMap(
          (request) => request.sectors ?? []
        ),
        ...activeRequests
          .map((request) => request.other_sector ?? "")
          .filter(Boolean),
      ]),
    [activeRequests]
  );

  const rateOptions = useMemo(
    () =>
      uniqueSorted([
        ...dailyRateOptions,
        ...activeRequests
          .map((request) => request.daily_rate_band ?? "")
          .filter(Boolean),
      ]),
    [activeRequests]
  );

  const provinceOptions = useMemo(
    () =>
      regionFilter
        ? regionProvinceMap[regionFilter] ?? []
        : [],
    [regionFilter]
  );

  const filteredRequests =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return activeRequests.filter(
        (request) => {
          const companyName =
            request.company_name
              ?.toLowerCase() ?? "";

          const requestRoles =
            getRequestRoleNames(request);

          const requestSectors =
            getSectorValues(request);

          const matchesQuery =
            !normalizedQuery ||
            companyName.includes(
              normalizedQuery
            );

          const matchesRole =
            !roleFilter ||
            requestRoles.includes(
              roleFilter
            );

          const matchesRegion =
            !regionFilter ||
            request.region === regionFilter;

          const matchesProvince =
            !provinceFilter ||
            request.province === provinceFilter;

          const matchesSector =
            !sectorFilter ||
            requestSectors.includes(
              sectorFilter
            );

          const matchesRate =
            !rateFilter ||
            request.daily_rate_band ===
              rateFilter;

          return (
            matchesQuery &&
            matchesRole &&
            matchesRegion &&
            matchesProvince &&
            matchesSector &&
            matchesRate
          );
        }
      );
    }, [
      activeRequests,
      query,
      roleFilter,
      regionFilter,
      provinceFilter,
      sectorFilter,
      rateFilter,
    ]);

  function toggleActiveSelection(
    id: number
  ) {
    setSelectedActiveIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) => item !== id
            )
          : [...current, id]
    );
  }

  function toggleArchivedSelection(
    id: number
  ) {
    setSelectedArchivedIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) => item !== id
            )
          : [...current, id]
    );
  }

  function toggleAllVisible() {
    const visibleIds =
      filteredRequests.map(
        (request) => request.id
      );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedActiveIds.includes(id)
      );

    if (allSelected) {
      setSelectedActiveIds(
        (current) =>
          current.filter(
            (id) =>
              !visibleIds.includes(id)
          )
      );
    } else {
      setSelectedActiveIds(
        (current) => [
          ...new Set([
            ...current,
            ...visibleIds,
          ]),
        ]
      );
    }
  }

  function toggleAllArchived() {
    const archivedIds =
      archivedRequests.map(
        (request) => request.id
      );

    const allSelected =
      archivedIds.length > 0 &&
      archivedIds.every((id) =>
        selectedArchivedIds.includes(
          id
        )
      );

    if (allSelected) {
      setSelectedArchivedIds([]);
    } else {
      setSelectedArchivedIds(
        archivedIds
      );
    }
  }

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

    const updatedRequest =
      data.requests?.[0] ??
      data.request;

    if (!updatedRequest) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === request.id
          ? updatedRequest
          : item
      )
    );

    if (
      selected?.id === request.id
    ) {
      setSelected(updatedRequest);
    }
  }

  async function archiveSelected() {
    if (
      selectedActiveIds.length === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Archiviare ${
          selectedActiveIds.length
        } ${
          selectedActiveIds.length ===
          1
            ? "richiesta"
            : "richieste"
        }?`
      );

    if (!confirmed) return;

    setActionLoading(true);

    try {
      const response = await fetch(
        "/api/company-requests",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ids: selectedActiveIds,
            status: "archived",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Archiviazione non riuscita."
        );
      }

      const selectedSet = new Set(
        selectedActiveIds
      );

      setItems((current) =>
        current.map((request) =>
          selectedSet.has(request.id)
            ? {
                ...request,
                status: "archived",
              }
            : request
        )
      );

      if (
        selected &&
        selectedSet.has(selected.id)
      ) {
        setSelected(null);
      }

      setSelectedActiveIds([]);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Archiviazione non riuscita."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function restoreSelected() {
    if (
      selectedArchivedIds.length === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Ripristinare ${
          selectedArchivedIds.length
        } ${
          selectedArchivedIds.length ===
          1
            ? "richiesta"
            : "richieste"
        }?`
      );

    if (!confirmed) return;

    setActionLoading(true);

    try {
      const response = await fetch(
        "/api/company-requests",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ids: selectedArchivedIds,
            status: "completed",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Ripristino non riuscito."
        );
      }

      const selectedSet = new Set(
        selectedArchivedIds
      );

      setItems((current) =>
        current.map((request) =>
          selectedSet.has(request.id)
            ? {
                ...request,
                status: "completed",
              }
            : request
        )
      );

      setSelectedArchivedIds([]);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Ripristino non riuscito."
      );
    } finally {
      setActionLoading(false);
    }
  }

  const allVisibleSelected =
    filteredRequests.length > 0 &&
    filteredRequests.every(
      (request) =>
        selectedActiveIds.includes(
          request.id
        )
    );

  const allArchivedSelected =
    archivedRequests.length > 0 &&
    archivedRequests.every(
      (request) =>
        selectedArchivedIds.includes(
          request.id
        )
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Nome azienda"
          className="min-w-0 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0b2340] lg:w-44"
        />

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm lg:w-44"
        >
          <option value="">
            Ruolo
          </option>

          {roleOptions.map((role) => (
            <option
              key={role}
              value={role}
            >
              {role}
            </option>
          ))}
        </select>

        <select
          value={regionFilter}
          onChange={(event) => {
            setRegionFilter(event.target.value);
            setProvinceFilter("");
          }}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#164873]"
        >
          <option value="">Regione</option>
          {regionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={provinceFilter}
          disabled={!regionFilter}
          onChange={(event) => setProvinceFilter(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#164873] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">
            {regionFilter ? "Provincia" : "Prima la regione"}
          </option>
          {provinceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={sectorFilter}
          onChange={(event) =>
            setSectorFilter(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm lg:w-44"
        >
          <option value="">
            Settori
          </option>

          {sectorOptions.map(
            (sector) => (
              <option
                key={sector}
                value={sector}
              >
                {sector}
              </option>
            )
          )}
        </select>

        <select
          value={rateFilter}
          onChange={(event) =>
            setRateFilter(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm lg:w-44"
        >
          <option value="">
            Tariffa
          </option>

          {rateOptions.map((rate) => (
            <option
              key={rate}
              value={rate}
            >
              {rate}
            </option>
          ))}
        </select>

        <div className="lg:ml-auto">
          <button
            type="button"
            disabled={
              selectedActiveIds.length ===
                0 || actionLoading
            }
            onClick={() =>
              void archiveSelected()
            }
            className="rounded-xl bg-[#0b2340] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#12385f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selectedActiveIds.length > 0
              ? `Archivia (${selectedActiveIds.length})`
              : "Archivia"}
          </button>
        </div>
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
        <>
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-12 px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={
                          allVisibleSelected
                        }
                        onChange={
                          toggleAllVisible
                        }
                        aria-label="Seleziona tutte le richieste visibili"
                        className="h-4 w-4 cursor-pointer accent-[#0b2340]"
                      />
                    </th>

                    <th className="px-5 py-4">
                      Azienda
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
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map(
                    (request) => (
                      <tr
                        key={request.id}
                        onClick={() =>
                          setSelected(
                            request
                          )
                        }
                        className="cursor-pointer transition hover:bg-slate-50/70"
                      >
                        <td
                          className="px-4 py-4 text-center"
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedActiveIds.includes(
                              request.id
                            )}
                            onChange={() =>
                              toggleActiveSelection(
                                request.id
                              )
                            }
                            aria-label={`Seleziona ${request.company_name}`}
                            className="h-4 w-4 cursor-pointer accent-[#0b2340]"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">
                            {
                              request.company_name
                            }
                          </div>

                          <div className="mt-1 text-xs font-medium text-slate-500">
                            {
                              request.request_code
                            }
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {getRequestRoleNames(
                              request
                            ).map(
                              (role, index) => (
                                <div
                                  key={`${role}-${index}`}
                                  className="font-semibold text-slate-900"
                                >
                                  {role}
                                </div>
                              )
                            )}

                            {getRequestRoleNames(
                              request
                            ).length === 0 && (
                              <div className="text-slate-500">
                                —
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {formatArea(
                            request
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-[230px] leading-relaxed">
                            {formatSectors(
                              request
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {show(
                              request.daily_rate_band
                            )}
                          </div>
                        </td>

                        <td
                          className="px-5 py-4"
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                        >
                          <select
                            value={normalizeVisibleStatus(
                              request.status
                            )}
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

                            <option value="completed">
                              Completata
                            </option>
                          </select>
                        </td>
                      </tr>
                    )
                  )}

                  {filteredRequests.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={7}
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

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() =>
                setArchiveOpen(
                  (current) =>
                    !current
                )
              }
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">
                  Richieste archiviate
                </span>

                <span className="rounded-full bg-[#eef3f8] px-2.5 py-1 text-xs font-bold text-[#071b33]">
                  {
                    archivedRequests.length
                  }
                </span>
              </div>

              <span className="text-xl text-slate-500">
                {archiveOpen
                  ? "⌃"
                  : "⌄"}
              </span>
            </button>

            {archiveOpen && (
              <div className="border-t border-slate-200">
                <div className="flex justify-end border-b border-slate-100 px-5 py-3">
                  <button
                    type="button"
                    disabled={
                      selectedArchivedIds.length ===
                        0 ||
                      actionLoading
                    }
                    onClick={() =>
                      void restoreSelected()
                    }
                    className="rounded-xl border border-[#0b2340] px-4 py-2 text-sm font-bold text-[#0b2340] transition hover:bg-[#eef3f8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {selectedArchivedIds.length >
                    0
                      ? `Ripristina (${selectedArchivedIds.length})`
                      : "Ripristina"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="w-12 px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={
                              allArchivedSelected
                            }
                            onChange={
                              toggleAllArchived
                            }
                            aria-label="Seleziona tutte le richieste archiviate"
                            className="h-4 w-4 cursor-pointer accent-[#0b2340]"
                          />
                        </th>

                        <th className="px-5 py-4">
                          Azienda
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
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {archivedRequests.map(
                        (request) => (
                          <tr
                            key={
                              request.id
                            }
                            onClick={() =>
                              setSelected(
                                request
                              )
                            }
                            className="cursor-pointer transition hover:bg-slate-50/70"
                          >
                            <td
                              className="px-4 py-4 text-center"
                              onClick={(
                                event
                              ) =>
                                event.stopPropagation()
                              }
                            >
                              <input
                                type="checkbox"
                                checked={selectedArchivedIds.includes(
                                  request.id
                                )}
                                onChange={() =>
                                  toggleArchivedSelection(
                                    request.id
                                  )
                                }
                                aria-label={`Seleziona ${request.company_name}`}
                                className="h-4 w-4 cursor-pointer accent-[#0b2340]"
                              />
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-bold text-slate-900">
                                {
                                  request.company_name
                                }
                              </div>

                              <div className="mt-1 text-xs font-medium text-slate-500">
                                {
                                  request.request_code
                                }
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="space-y-1">
                                {getRequestRoleNames(
                                  request
                                ).map(
                                  (role, index) => (
                                    <div
                                      key={`${role}-${index}`}
                                      className="font-semibold text-slate-900"
                                    >
                                      {role}
                                    </div>
                                  )
                                )}

                                {getRequestRoleNames(
                                  request
                                ).length === 0 && (
                                  <div className="text-slate-500">
                                    —
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              {formatArea(
                                request
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {formatSectors(
                                request
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {show(
                                request.daily_rate_band
                              )}
                            </td>
                          </tr>
                        )
                      )}

                      {archivedRequests.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-8 text-center text-slate-500"
                          >
                            Nessuna
                            richiesta
                            archiviata.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
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
                  {statusLabels[
                    selected.status
                  ] ||
                    selected.status}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    selected.company_name
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-50"
              >
                Chiudi
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span>
                Codice richiesta:{" "}
                <strong className="text-slate-700">
                  {
                    selected.request_code
                  }
                </strong>
              </span>

              <span>
                Ricevuta il:{" "}
                <strong className="text-slate-700">
                  {formatDate(
                    selected.created_at
                  )}
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
                  value={formatCompanyType(
                    selected
                  )}
                />

                <DetailCard
                  label="Dimensione azienda"
                  value={
                    selected.company_size
                  }
                />

                <DetailCard
                  label="Settore azienda"
                  value={formatCompanySector(
                    selected
                  )}
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
                  value={
                    selected.contact_role
                  }
                />

                <DetailCard
                  label="Email"
                  value={
                    selected.contact_email
                  }
                />

                <DetailCard
                  label="Telefono"
                  value={
                    selected.contact_phone
                  }
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
                  value={formatRequestReason(
                    selected
                  )}
                />

                <DetailCard
                  label="Obiettivo"
                  value={
                    selected.request_objective
                  }
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
                  value={
                    selected.people_managed_band
                  }
                />

                <DetailCard
                  label="P&L / budget"
                  value={
                    selected.pnl_band
                  }
                />

                <DetailCard
                  label="Competenze"
                  value={
                    selected.competencies
                  }
                  wide
                />

                {selected.other_competency && (
                  <DetailCard
                    label="Altra competenza"
                    value={
                      selected.other_competency
                    }
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
                  value={
                    selected.production_types
                  }
                />

                <DetailCard
                  label="Metodologie"
                  value={
                    selected.methodologies
                  }
                />

                {selected.other_methodology && (
                  <DetailCard
                    label="Altra metodologia"
                    value={
                      selected.other_methodology
                    }
                  />
                )}

                <DetailCard
                  label="Trasferte richieste"
                  value={
                    selected.travel_required
                  }
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
                  value={
                    selected.assignment_types
                  }
                />

                <DetailCard
                  label="Giorni/settimana"
                  value={
                    selected.days_per_week
                  }
                />

                <DetailCard
                  label="Avvio"
                  value={formatDate(
                    selected.start_date
                  )}
                />

                <DetailCard
                  label="Certificazioni richieste"
                  value={
                    selected.required_certifications
                  }
                />

                <DetailCard
                  label="Lingue richieste"
                  value={
                    selected.required_languages
                  }
                />

                <DetailCard
                  label="Note"
                  value={
                    selected.final_notes
                  }
                  wide
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}