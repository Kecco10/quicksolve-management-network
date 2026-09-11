"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled =
    email.trim() === "" || password.trim() === "" || isLoading;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isDisabled) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess("Login eseguito correttamente. Reindirizzamento in corso...");
    router.push("/progettista/dashboard");
    router.refresh();
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm md:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-between bg-emerald-950 p-8 text-white md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
                QuickSolve
              </p>

              <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
                Area progettisti
              </h1>

              <p className="mt-4 max-w-sm text-base leading-7 text-emerald-50/90">
                Accedi per aggiornare profilo, competenze e disponibilità.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Accesso riservato
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-50/90">
                  Questa area è dedicata esclusivamente ai progettisti registrati
                  sulla piattaforma.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Aziende
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-50/90">
                  Le aziende non devono accedere al portale: possono inviare una
                  nuova richiesta in qualsiasi momento.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 md:hidden">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-900">
                  QuickSolve
                </p>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">
                  Area progettisti
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Accedi per aggiornare profilo, competenze e disponibilità.
                </p>
              </div>

              <div className="mb-8 hidden md:block">
                <p className="text-sm font-medium text-slate-500">
                  Accesso riservato ai progettisti
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Accedi
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-900"
                    placeholder="nome@email.it"
                    required
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-emerald-900 transition hover:text-emerald-700"
                    >
                      Password dimenticata?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-24 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-900"
                      placeholder="Inserisci password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Nascondi password" : "Mostra password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? "Nascondi" : "Mostra"}
                    </button>
                  </div>
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                {success ? (
                  <p className="text-sm text-green-700">{success}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="w-full rounded-2xl bg-emerald-950 px-5 py-3.5 text-base font-semibold text-white transition enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLoading ? "Accesso in corso..." : "Accedi"}
                </button>
              </form>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  Sei un’azienda?{" "}
                  <Link
                    href="/azienda"
                    className="font-semibold text-emerald-900 transition hover:text-emerald-700"
                  >
                    Invia una nuova richiesta
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}