"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function ManagerLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isDisabled =
    email.trim() === "" || password.trim() === "" || isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDisabled) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        setErrorMessage("Email o password non corretti.");
        return;
      }

      const response = await fetch("/api/manager/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        await supabase.auth.signOut();

        if (response.status === 404) {
          setErrorMessage(
            "Questo account non risulta associato a un profilo manager."
          );
          return;
        }

        setErrorMessage("Non è stato possibile accedere alla dashboard.");
        return;
      }

      setSuccessMessage(
        "Login eseguito correttamente. Reindirizzamento in corso..."
      );
      router.replace("/manager/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Errore durante l'accesso. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm md:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-between bg-[#071b33] p-8 text-white md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9ebbd8]">
                QuickSolve
              </p>

              <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
                Area manager
              </h1>

              <p className="mt-4 max-w-sm text-base leading-7 text-white/90">
                Accedi per aggiornare profilo, competenze e disponibilità.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9ebbd8]">
                  Accesso riservato
                </p>
                <p className="mt-3 text-sm leading-6 text-white/90">
                  Questa area è dedicata esclusivamente ai manager registrati
                  sulla piattaforma.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9ebbd8]">
                  Aziende
                </p>
                <p className="mt-3 text-sm leading-6 text-white/90">
                  Le aziende non devono accedere al portale: possono inviare una
                  nuova richiesta in qualsiasi momento.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 md:hidden">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0b2340]">
                  QuickSolve
                </p>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">
                  Area manager
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Accedi per aggiornare profilo, competenze e disponibilità.
                </p>
              </div>

              <div className="mb-8 hidden md:block">
                <p className="text-sm font-medium text-slate-500">
                  Accesso riservato ai manager
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
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b2340] disabled:cursor-not-allowed disabled:bg-slate-100"
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
                      className="text-sm font-medium text-[#0b2340] transition hover:text-[#164873]"
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
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-24 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b2340] disabled:cursor-not-allowed disabled:bg-slate-100"
                      placeholder="Inserisci password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isSubmitting}
                      aria-label={
                        showPassword ? "Nascondi password" : "Mostra password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                    >
                      {showPassword ? "Nascondi" : "Mostra"}
                    </button>
                  </div>
                </div>

                {errorMessage ? (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                ) : null}

                {successMessage ? (
                  <p className="text-sm text-[#164873]">{successMessage}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="w-full rounded-2xl bg-[#071b33] px-5 py-3.5 text-base font-semibold text-white transition enabled:hover:bg-[#12385f] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? "Accesso in corso..." : "Accedi"}
                </button>
              </form>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  Non sei ancora registrato?{" "}
                  <Link
                    href="/manager"
                    className="font-semibold text-[#0b2340] transition hover:text-[#164873]"
                  >
                    Crea il tuo profilo manager
                  </Link>
                </p>
              </div>

              <div className="mt-3 text-center">
                <Link
                  href="/"
                  className="text-sm font-medium text-slate-500 transition hover:text-[#0b2340]"
                >
                  Torna alla home
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
