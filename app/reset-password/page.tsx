"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.trim().length >= 6;

  const isDisabled =
    !isRecoveryReady ||
    !passwordValid ||
    !passwordsMatch ||
    confirmPassword.trim() === "" ||
    isLoading;

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      setError("");
      setIsCheckingLink(true);

      try {
        const code = searchParams.get("code");

        // Arrivo dal link di recupero Supabase
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          if (!mounted) return;

          setIsRecoveryReady(true);
          setIsCheckingLink(false);

          // Rimuoviamo il codice dalla barra indirizzi
          window.history.replaceState(
            {},
            document.title,
            "/reset-password"
          );

          return;
        }

        // Se il codice è già stato scambiato,
        // verifichiamo se esiste una sessione valida.
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          throw new Error("Sessione di recupero non disponibile.");
        }

        if (!mounted) return;

        setIsRecoveryReady(true);
        setIsCheckingLink(false);
      } catch (err) {
        console.error("Errore verifica recovery:", err);

        if (!mounted) return;

        setIsRecoveryReady(false);
        setIsCheckingLink(false);

        setError(
          "Il link di recupero non è valido oppure è scaduto. Richiedi un nuovo link."
        );
      }
    }

    prepareRecoverySession();

    return () => {
      mounted = false;
    };
  }, [searchParams, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isDisabled) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess("Password aggiornata correttamente.");

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1800);
    } catch (err) {
      console.error("Errore aggiornamento password:", err);

      setError(
        "Non è stato possibile aggiornare la password. Richiedi un nuovo link di recupero e riprova."
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
              Imposta una nuova password
            </h1>

            <p className="mt-3 text-base leading-7 text-slate-600">
              Scegli una nuova password per il tuo account progettista.
            </p>
          </div>

          {isCheckingLink ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-900" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Verifica del link di recupero...
              </p>
            </div>
          ) : !isRecoveryReady ? (
            <div className="space-y-5">
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <p className="text-base leading-7 text-red-700">
                  {error ||
                    "Il link di recupero non è valido oppure è scaduto."}
                </p>
              </div>

              <Link
                href="/forgot-password"
                className="block w-full rounded-2xl bg-emerald-950 px-5 py-3.5 text-center font-semibold text-white transition hover:bg-emerald-900"
              >
                Richiedi un nuovo link
              </Link>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-emerald-900 transition hover:text-emerald-700"
                >
                  Torna al login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nuova password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-24 text-slate-900 outline-none transition focus:border-emerald-900"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? "Nascondi" : "Mostra"}
                  </button>
                </div>

                {password.length > 0 && !passwordValid ? (
                  <p className="mt-2 text-sm text-red-600">
                    La password deve contenere almeno 6 caratteri.
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Conferma nuova password
                </label>

                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ripeti la nuova password"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-900"
                  required
                />

                {confirmPassword.length > 0 && !passwordsMatch ? (
                  <p className="mt-2 text-sm text-red-600">
                    Le password non coincidono.
                  </p>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-medium text-emerald-800">
                    {success}
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    Reindirizzamento al login...
                  </p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isDisabled}
                className="w-full rounded-2xl bg-emerald-950 px-5 py-3.5 font-semibold text-white transition enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading
                  ? "Aggiornamento in corso..."
                  : "Salva nuova password"}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-emerald-900 transition hover:text-emerald-700"
                >
                  Torna al login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function ResetPasswordLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-900" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Caricamento...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}