"use client";

import React, { useEffect, useMemo, useState } from "react";

type RawRecord = Record<string, unknown>;

type SecondaryRole = {
  family: string;
  role: string;
  other_role?: string | null;
};

type GeographicArea = {
  region: string;
  province: string;
};

type CompanyRequest = {
  id: string;
  requestCode: string;
  companyName: string;
  roleFamily: string;
  primaryRole: string;
  otherRole: string;
  sectors: string[];
  otherSector: string;
  region: string;
  province: string;
  dailyRateBand: string;
  status: string;
};

type ManagerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primaryRoleFamily: string;
  primaryRole: string;
  otherRole: string;
  secondaryRoles: SecondaryRole[];
  geographicAreas: GeographicArea[];
  regions: string[];
  provinces: string[];
  sectors: string[];
  otherSector: string;
  dailyRateBand: string;
  assignmentTypes: string[];
  availableFrom: string;
  profileStatus: string;
  isSearchActive: boolean;
};

type MatchResult = {
  manager: ManagerProfile;
  matchedRole: string;
  matchedRoleFamily: string;
  matchedAs: "Ruolo primario" | "Ruolo secondario";
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "si", "sì"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return fallback;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter(Boolean);
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseSecondaryRoles(value: unknown): SecondaryRole[] {
  if (!Array.isArray(value)) return [];

  const roles: SecondaryRole[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const raw = item as RawRecord;
    const family = asString(raw.family);
    const role = asString(raw.role);
    const otherRole = asString(raw.other_role);

    if (!family || !role) continue;

    roles.push({
      family,
      role,
      other_role: otherRole || null,
    });
  }

  return roles;
}

function parseGeographicAreas(value: unknown): GeographicArea[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const raw = item as RawRecord;
      const region = asString(raw.region);
      const province = asString(raw.province);

      if (!region && !province) return null;

      return { region, province };
    })
    .filter((item): item is GeographicArea => item !== null);
}

function displayRole(role: string, otherRole: string) {
  return role === "Altro" && otherRole ? otherRole : role;
}

function mapRequest(raw: RawRecord): CompanyRequest {
  return {
    id: asString(raw.id) || String(raw.id ?? ""),
    requestCode: asString(raw.request_code) || "—",
    companyName: asString(raw.company_name) || "Azienda non indicata",
    roleFamily: asString(raw.role_family),
    primaryRole: asString(raw.primary_role),
    otherRole: asString(raw.other_role),
    sectors: asStringArray(raw.sectors),
    otherSector: asString(raw.other_sector),
    region: asString(raw.region),
    province: asString(raw.province),
    dailyRateBand: asString(raw.daily_rate_band),
    status: asString(raw.status) || "new",
  };
}

function mapManager(raw: RawRecord): ManagerProfile {
  const geographicAreas = parseGeographicAreas(raw.geographic_areas);

  const regions = uniqueStrings([
    ...asStringArray(raw.regions),
    asString(raw.region),
    ...geographicAreas.map((item) => item.region),
  ].filter(Boolean));

  const provinces = uniqueStrings([
    ...asStringArray(raw.provinces),
    asString(raw.province),
    ...geographicAreas.map((item) => item.province),
  ].filter(Boolean));

  return {
    id: asString(raw.id) || asString(raw.user_id),
    firstName: asString(raw.first_name),
    lastName: asString(raw.last_name),
    email: asString(raw.email),
    phone: asString(raw.whatsapp_phone) || asString(raw.whatsapp),
    primaryRoleFamily: asString(raw.primary_role_family),
    primaryRole: asString(raw.primary_role),
    otherRole: asString(raw.other_role),
    secondaryRoles: parseSecondaryRoles(raw.secondary_roles),
    geographicAreas,
    regions,
    provinces,
    sectors: asStringArray(raw.sectors),
    otherSector: asString(raw.other_sector),
    dailyRateBand: asString(raw.daily_rate_band),
    assignmentTypes: asStringArray(raw.assignment_types),
    availableFrom: asString(raw.available_from),
    profileStatus: asString(raw.status) || asString(raw.profile_status),
    isSearchActive: asBoolean(raw.profile_visibility_enabled, true),
  };
}

function getRoleMatch(
  request: CompanyRequest,
  manager: ManagerProfile
): Omit<MatchResult, "manager"> | null {
  const requestedRole = normalize(
    displayRole(request.primaryRole, request.otherRole)
  );

  if (!requestedRole) return null;

  const managerPrimaryRole = displayRole(
    manager.primaryRole,
    manager.otherRole
  );

  if (normalize(managerPrimaryRole) === requestedRole) {
    return {
      matchedRole: managerPrimaryRole,
      matchedRoleFamily: manager.primaryRoleFamily,
      matchedAs: "Ruolo primario",
    };
  }

  for (const secondary of manager.secondaryRoles) {
    const secondaryRole = displayRole(
      secondary.role,
      secondary.other_role ?? ""
    );

    if (normalize(secondaryRole) === requestedRole) {
      return {
        matchedRole: secondaryRole,
        matchedRoleFamily: secondary.family,
        matchedAs: "Ruolo secondario",
      };
    }
  }

  return null;
}

function isGeographicallyCompatible(
  request: CompanyRequest,
  manager: ManagerProfile
) {
  const requestProvince = normalize(request.province);
  const requestRegion = normalize(request.region);

  /*
   * Regola Management:
   * - se abbiamo la provincia sia nella richiesta sia nel profilo, usiamo
   *   la provincia come corrispondenza più precisa;
   * - per i profili legacy senza provincia, usiamo la regione;
   * - se la richiesta non ha provincia, usiamo la regione.
   */
  if (requestProvince && manager.provinces.length > 0) {
    return manager.provinces.some(
      (province) => normalize(province) === requestProvince
    );
  }

  if (requestRegion) {
    return manager.regions.some(
      (region) => normalize(region) === requestRegion
    );
  }

  return false;
}

function getMatches(
  request: CompanyRequest,
  managers: ManagerProfile[]
): MatchResult[] {
  return managers
    .filter((manager) => manager.isSearchActive)
    .filter((manager) => isGeographicallyCompatible(request, manager))
    .map((manager) => {
      const roleMatch = getRoleMatch(request, manager);

      return roleMatch
        ? {
            manager,
            ...roleMatch,
          }
        : null;
    })
    .filter((item): item is MatchResult => item !== null)
    .sort((a, b) => {
      if (a.matchedAs !== b.matchedAs) {
        return a.matchedAs === "Ruolo primario" ? -1 : 1;
      }

      return `${a.manager.lastName} ${a.manager.firstName}`.localeCompare(
        `${b.manager.lastName} ${b.manager.firstName}`,
        "it"
      );
    });
}

function formatDate(value: string) {
  if (!value) return "Non indicata";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function formatArea(request: CompanyRequest) {
  return [request.province, request.region].filter(Boolean).join(", ") || "Non indicata";
}

function formatManagerArea(manager: ManagerProfile) {
  const provinces = uniqueStrings([
    ...manager.provinces,
    ...manager.geographicAreas.map((area) => area.province),
  ].filter(Boolean));

  return provinces.length > 0 ? provinces.join(", ") : "Non indicata";
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green";
}) {
  const classes =
    tone === "blue"
      ? "border border-[#9ebbd8] bg-[#eef3f8] text-[#0d3158]"
      : tone === "green"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none ${classes}`}
    >
      {children}
    </span>
  );
}

export default function AdminMatchingPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [managers, setManagers] = useState<ManagerProfile[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [requestsResponse, managersResponse] = await Promise.all([
          fetch("/api/company-requests", { cache: "no-store" }),
          fetch("/api/admin/managers", { cache: "no-store" }),
        ]);

        const requestsData = await requestsResponse.json();
        const managersData = await managersResponse.json();

        if (!requestsResponse.ok) {
          throw new Error(
            requestsData?.error || "Impossibile caricare le richieste aziende."
          );
        }

        if (!managersResponse.ok) {
          throw new Error(
            managersData?.error ||
              managersData?.message ||
              "Impossibile caricare i manager."
          );
        }

        const rawRequests = Array.isArray(requestsData?.requests)
          ? requestsData.requests
          : [];

        const rawManagers = Array.isArray(managersData?.managers)
          ? managersData.managers
          : Array.isArray(managersData?.profiles)
          ? managersData.profiles
          : [];

        setRequests(
          rawRequests
            .map((item: RawRecord) => mapRequest(item))
            .filter((item: CompanyRequest) => item.status !== "archived")
        );

        setManagers(
          rawManagers.map((item: RawRecord) => mapManager(item))
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore nel caricamento dei dati di matching."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const matchesByRequest = useMemo(() => {
    const result = new Map<string, MatchResult[]>();

    for (const request of requests) {
      result.set(request.id, getMatches(request, managers));
    }

    return result;
  }, [requests, managers]);

  return (
    <section className="-mt-2 min-w-0 space-y-3 sm:-mt-4 sm:space-y-4 md:-mt-4">
      <div className="overflow-hidden rounded-3xl border border-[#d7e1ec] bg-white shadow-sm">
        <div className="border-b border-[#d7e1ec] px-4 py-4 sm:px-5">
          <h1 className="text-lg font-semibold text-[#071b33]">
            Matching aziende / manager
          </h1>
        </div>

        <div className="hidden border-b border-[#d7e1ec] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:grid lg:grid-cols-[1.2fr_1.35fr_0.9fr_1.35fr_1fr] lg:gap-6">
          <div className="text-center">Azienda</div>
          <div className="text-center">Ruolo richiesto</div>
          <div className="text-center">Area</div>
          <div className="text-center">Settori</div>
          <div className="text-center">Budget</div>
        </div>

        {error ? (
          <div className="m-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="m-4 rounded-2xl border border-[#d7e1ec] bg-[#eef3f8] px-4 py-3 text-sm text-[#0d3158]">
            Caricamento richieste e manager...
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="space-y-3 p-4">
            {requests.map((request) => {
              const matches = matchesByRequest.get(request.id) ?? [];
              const isOpen = selectedRequestId === request.id;
              const requestedRole = displayRole(
                request.primaryRole,
                request.otherRole
              );

              const requestSectors = uniqueStrings([
                ...request.sectors,
                ...(request.otherSector ? [request.otherSector] : []),
              ]);

              return (
                <div
                  key={request.id}
                  className="overflow-hidden rounded-2xl border border-[#d7e1ec] bg-white transition hover:border-[#9ebbd8] hover:shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRequestId((current) =>
                        current === request.id ? null : request.id
                      )
                    }
                    className="w-full p-3 text-left sm:p-4"
                  >
                    <div className="grid gap-5 lg:grid-cols-[1.2fr_1.35fr_0.9fr_1.35fr_1fr] lg:items-start lg:gap-6">
                      <div className="text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 lg:hidden">
                          Azienda
                        </p>
                        <p className="font-semibold text-[#071b33]">
                          {request.companyName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {request.requestCode}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 lg:hidden">
                          Ruolo richiesto
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {requestedRole || "Non indicato"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {request.roleFamily || "Famiglia non indicata"}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 lg:hidden">
                          Area
                        </p>
                        <Badge tone="blue">{formatArea(request)}</Badge>
                      </div>

                      <div className="text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 lg:hidden">
                          Settori
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {requestSectors.length > 0 ? (
                            requestSectors.map((sector) => (
                              <Badge key={`${request.id}-${sector}`}>
                                {sector}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">
                              Non indicati
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 lg:hidden">
                          Budget
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {request.dailyRateBand || "Non indicato"}
                        </p>
                      </div>

                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-[#d7e1ec] bg-[#f8fafc] px-3 py-3 sm:px-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                          Manager disponibili
                        </p>
                      </div>

                      <div className="space-y-2">
                        {matches.map((match, index) => {
                          const manager = match.manager;
                          const managerSectors = uniqueStrings([
                            ...manager.sectors,
                            ...(manager.otherSector ? [manager.otherSector] : []),
                          ]);

                          return (
                            <div
                              key={`${request.id}-${manager.id || index}`}
                              className="rounded-xl border border-[#d7e1ec] bg-white px-3 py-3 sm:px-4 xl:px-5"
                            >
                              <div className="relative pl-11 xl:pl-14">
                                <div className="absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef3f8] text-[11px] font-bold text-[#0d3158] xl:left-2">
                                  {index + 1}
                                </div>
                                <div className="grid gap-5 xl:grid-cols-[1.2fr_1.35fr_0.9fr_1.35fr_1fr] xl:items-center xl:gap-6">

                                <div className="min-w-0 text-center">
                                  <div className="flex flex-wrap items-center justify-center gap-2">
                                    <p className="truncate text-sm font-semibold text-[#071b33]">
                                      {[manager.firstName, manager.lastName]
                                        .filter(Boolean)
                                        .join(" ") || "Manager"}
                                    </p>
                                  </div>

                                  <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                                    <p className="truncate">
                                      {manager.email || "Email non indicata"}
                                    </p>
                                    <p className="truncate">
                                      {manager.phone || "Telefono non indicato"}
                                    </p>
                                  </div>
                                </div>

                                <div className="min-w-0 text-center">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                    {match.matchedAs}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {match.matchedRole}
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {match.matchedRoleFamily || "—"}
                                  </p>
                                </div>

                                <div className="min-w-0 text-center">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                    Area
                                  </p>
                                  <p className="mt-1 text-sm text-slate-700">
                                    {formatManagerArea(manager)}
                                  </p>
                                </div>

                                <div className="min-w-0 text-center">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                    Settori
                                  </p>
                                  <p className="mt-1 text-sm text-slate-700">
                                    {managerSectors.length > 0
                                      ? managerSectors.join(", ")
                                      : "Non indicati"}
                                  </p>
                                </div>

                                <div className="min-w-0 text-center">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                    Disponibilità
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {manager.dailyRateBand || "Tariffa non indicata"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    Da: {formatDate(manager.availableFrom)}
                                  </p>
                                </div>
                              </div>
                              </div>
                            </div>
                          );
                        })}

                        {matches.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-[#9ebbd8] bg-white px-4 py-8 text-center">
                            <p className="text-sm font-semibold text-[#0d3158]">
                              Nessun manager disponibile
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Non risultano profili attivi con area geografica e
                              ruolo compatibili con questa richiesta.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#9ebbd8] bg-[#eef3f8] px-4 py-10 text-center text-sm text-[#0d3158]">
                Non ci sono richieste aziendali attive da elaborare.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
