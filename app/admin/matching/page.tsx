"use client";

import {
  useEffect,
  useState,
} from "react";

type Manager = {
  user_id: string;
  first_name?: string;
  last_name?: string;
  primary_role?: string;
  profile_status?: string;
  profile_visibility_enabled?: boolean;
};

type CompanyRequest = {
  id: number;
  request_code: string;
  company_name: string;
  primary_role: string;
  province?: string;
  region?: string;
  status: string;
};

export default function MatchingAdminPage() {
  const [managers, setManagers] =
    useState<Manager[]>([]);

  const [requests, setRequests] =
    useState<CompanyRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [
          managersResponse,
          requestsResponse,
        ] = await Promise.all([
          fetch(
            "/api/admin/managers",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/company-requests",
            {
              cache: "no-store",
            }
          ),
        ]);

        if (
          managersResponse.status ===
            401 ||
          requestsResponse.status ===
            401
        ) {
          window.location.href =
            "/admin";

          return;
        }

        const managersData =
          await managersResponse.json();

        const requestsData =
          await requestsResponse.json();

        if (
          !managersResponse.ok
        ) {
          throw new Error(
            managersData.error ||
              "Impossibile caricare i manager."
          );
        }

        if (
          !requestsResponse.ok
        ) {
          throw new Error(
            requestsData.error ||
              "Impossibile caricare le richieste."
          );
        }

        setManagers(
          managersData.managers ??
            []
        );

        setRequests(
          requestsData.requests ??
            []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossibile caricare i dati."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const activeManagers =
    managers.filter(
      (manager) =>
        manager.profile_visibility_enabled !==
        false
    );

  const openRequests =
    requests.filter(
      (request) =>
        ![
          "closed",
          "archived",
        ].includes(
          request.status
        )
    );

  return (
    <div className="mx-auto max-w-7xl">

      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#164873]">
        CRM
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Matching
      </h1>

      <p className="mt-2 max-w-3xl text-slate-600">
        Struttura predisposta per
        l&apos;abbinamento tra richieste
        aziendali e manager. L&apos;algoritmo
        di compatibilità verrà collegato
        in una fase successiva.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-7 grid gap-5 md:grid-cols-3">

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="text-sm font-bold text-slate-500">
            Richieste aperte
          </div>

          <div className="mt-2 text-4xl font-bold text-[#071b33]">
            {loading
              ? "—"
              : openRequests.length}
          </div>

        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="text-sm font-bold text-slate-500">
            Manager disponibili
          </div>

          <div className="mt-2 text-4xl font-bold text-[#071b33]">
            {loading
              ? "—"
              : activeManagers.length}
          </div>

        </div>

        <div className="rounded-3xl border border-[#d7e1ec] bg-[#eef3f8] p-6">

          <div className="text-sm font-bold text-[#164873]">
            Algoritmo compatibilità
          </div>

          <div className="mt-2 text-xl font-bold text-[#071b33]">
            In sospeso
          </div>

          <p className="mt-2 text-sm text-slate-600">
            Nessun punteggio viene
            calcolato in questa fase.
          </p>

        </div>

      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between gap-3">

            <h2 className="text-lg font-bold text-slate-900">
              Richieste da elaborare
            </h2>

            <span className="rounded-full bg-[#eef3f8] px-3 py-1 text-xs font-bold text-[#0b2340]">
              {openRequests.length}
            </span>

          </div>

          <div className="mt-4 space-y-3">

            {openRequests
              .slice(0, 12)
              .map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <div className="font-bold text-slate-900">
                    {
                      request.request_code
                    }{" "}
                    ·{" "}
                    {
                      request.company_name
                    }
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    {
                      request.primary_role
                    }

                    {request.province
                      ? ` · ${request.province}`
                      : ""}

                    {!request.province &&
                    request.region
                      ? ` · ${request.region}`
                      : ""}
                  </div>
                </div>
              ))}

            {!loading &&
              openRequests.length ===
                0 && (
                <p className="py-5 text-sm text-slate-500">
                  Nessuna richiesta
                  aperta.
                </p>
              )}

          </div>

        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between gap-3">

            <h2 className="text-lg font-bold text-slate-900">
              Manager disponibili
            </h2>

            <span className="rounded-full bg-[#eef3f8] px-3 py-1 text-xs font-bold text-[#0b2340]">
              {activeManagers.length}
            </span>

          </div>

          <div className="mt-4 space-y-3">

            {activeManagers
              .slice(0, 12)
              .map((manager) => (
                <div
                  key={
                    manager.user_id
                  }
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <div className="font-bold text-slate-900">
                    {
                      manager.first_name
                    }{" "}
                    {
                      manager.last_name
                    }
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    {manager.primary_role ||
                      "Ruolo non indicato"}

                    {manager.profile_status
                      ? ` · ${manager.profile_status}`
                      : ""}
                  </div>
                </div>
              ))}

            {!loading &&
              activeManagers.length ===
                0 && (
                <p className="py-5 text-sm text-slate-500">
                  Nessun manager
                  disponibile.
                </p>
              )}

          </div>

        </section>

      </div>

      <div className="mt-6 rounded-3xl border border-dashed border-[#9ebbd8] bg-white p-8 text-center">

        <div className="text-lg font-bold text-[#071b33]">
          Area risultati matching
        </div>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Qui verranno mostrati
          compatibilità, ordinamento dei
          manager, eventuali esclusioni e
          selezioni quando definiremo
          l&apos;algoritmo specifico del
          Management Network.
        </p>

      </div>

    </div>
  );
}