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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage("Inserisci email e password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

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

      router.replace("/manager/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Errore durante l'accesso. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
              QuickSolve Management Network
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Accedi alla tua area manager
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Inserisci le credenziali utilizzate durante la registrazione.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-700"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-900/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="nome@azienda.it"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-900/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="La tua password"
              />
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-600">
              Non sei ancora registrato?
            </p>

            <Link
              href="/manager"
              className="mt-2 inline-flex text-sm font-semibold text-emerald-900 transition hover:text-emerald-700"
            >
              Crea il tuo profilo manager
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
