"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin-login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Accesso non riuscito."
        );
      }

      router.replace(
        "/admin/manager"
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Accesso non riuscito."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">

      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl md:grid-cols-[0.9fr_1.1fr]">

        <section className="bg-[#071b33] p-8 text-white md:p-10">

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9ebbd8]">
            QuickSolve
          </p>

          <h1 className="mt-5 text-3xl font-bold">
            Management Network
          </h1>

          <p className="mt-4 leading-7 text-slate-300">
            CRM interno per la gestione
            di manager, richieste aziende
            e matching.
          </p>

        </section>

        <section className="p-8 md:p-10">

          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#164873]">
            Area riservata
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Accesso CRM
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </span>

              <input
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                required
                autoComplete="username"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0b2340] focus:ring-2 focus:ring-[#0b2340]/10"
              />

            </label>

            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0b2340] focus:ring-2 focus:ring-[#0b2340]/10"
              />

            </label>

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#0b2340] px-5 py-3.5 font-bold text-white transition hover:bg-[#12385f] disabled:opacity-50"
            >
              {loading
                ? "Accesso..."
                : "Accedi"}
            </button>

          </form>

        </section>

      </div>

    </main>
  );
}