export default function StatisticsAdminPage() {
  return (
    <div className="mx-auto max-w-7xl">

      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#164873]">
        CRM
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Statistiche
      </h1>

      <p className="mt-2 text-slate-600">
        Area statistiche del QuickSolve
        Management Network.
      </p>

      <div className="mt-7 min-h-[420px] rounded-3xl border border-dashed border-slate-300 bg-white p-8">

        <div className="flex min-h-[350px] items-center justify-center">

          <div className="max-w-lg text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef3f8] text-xl font-bold text-[#0b2340]">
              —
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Statistiche da definire
            </h2>

            <p className="mt-2 leading-6 text-slate-500">
              La sezione è già
              predisposta nel CRM. I
              KPI e le elaborazioni
              verranno aggiunti in una
              fase successiva.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}