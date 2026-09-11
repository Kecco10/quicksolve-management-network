"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isDisabled = email.trim() === "" || isLoading;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isDisabled) return;

    setError("");
    setIsLoading(true);

    try {
      const redirectTo =
        `${window.location.origin}/auth/callback?next=/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });

      if (resetError) {
        console.error("Errore recupero password:", resetError);
        throw resetError;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Errore recupero password:", err);

      setError(
        "Non è stato possibile inviare l'email di recupero. Riprova tra qualche minuto."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-900">
              QuickSolve
            </p>

            <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Password dimenticata?
            </h1>

            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
              Inserisci l&apos;email associata al tuo account progettista.
              Ti invieremo un link per impostare una nuova password.
            </p>
          </div>

          {!submitted ? (
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
                  placeholder="nome@email.it"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-900"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isDisabled}
                  className="rounded-2xl bg-emerald-950 px-5 py-3.5 font-semibold text-white transition enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLoading
                    ? "Invio in corso..."
                    : "Invia link di recupero"}
                </button>

                <Link
                  href="/login"
                  className="rounded-2xl border border-slate-300 px-5 py-3.5 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Torna al login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                <p className="text-base leading-7 text-slate-700">
                  Se l&apos;indirizzo inserito è associato a un account,
                  riceverai a breve un&apos;email con le istruzioni per
                  reimpostare la password.
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Controlla anche la cartella spam o posta indesiderata.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/login"
                  className="rounded-2xl bg-emerald-950 px-5 py-3.5 text-center font-semibold text-white transition hover:bg-emerald-900"
                >
                  Torna al login
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setError("");
                  }}
                  className="rounded-2xl border border-slate-300 px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Inserisci un&apos;altra email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}