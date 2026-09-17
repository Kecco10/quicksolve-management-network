"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminHeader() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  async function logout() {
    setLoading(true);

    await fetch(
      "/api/admin-logout",
      {
        method: "POST",
      }
    );

    router.replace("/admin");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-8">

        <div>
          <p className="text-sm font-bold text-[#071b33]">
            CRM Management Network
          </p>

          <p className="hidden text-xs text-slate-500 sm:block">
            Area amministrativa QuickSolve
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          disabled={loading}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading
            ? "Uscita..."
            : "Esci"}
        </button>

      </div>
    </header>
  );
}