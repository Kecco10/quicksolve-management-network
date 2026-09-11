type PaymentCompletedPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function PaymentCompletedPage({
  searchParams,
}: PaymentCompletedPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id?.trim();

  const downloadHref = sessionId
    ? `/api/purchases/pdf?session_id=${encodeURIComponent(sessionId)}`
    : null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-900">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-950">
            Pagamento completato
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Il pagamento è stato ricevuto.
          </p>

          {downloadHref ? (
            <a
              href={downloadHref}
              className="mt-7 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-emerald-950 px-6 py-3 font-semibold text-white transition hover:bg-emerald-900"
            >
              Scarica i profili acquistati
            </a>
          ) : (
            <p className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Non è stato possibile identificare la sessione di pagamento.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}