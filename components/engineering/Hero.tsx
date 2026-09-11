export default function Hero() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">

      <h1 className="text-6xl font-bold text-slate-900">
        QuickSolve
      </h1>

      <h2 className="text-3xl text-blue-700 mt-3 font-semibold">
        Engineering Network
      </h2>

      <p className="mt-6 max-w-2xl text-gray-600 text-xl">
        Il primo network italiano dedicato esclusivamente
        alla progettazione meccanica.
      </p>

      <div className="mt-12 flex gap-6">

        <button className="bg-blue-700 text-white px-8 py-4 rounded-xl">
          👷 Sono un progettista
        </button>

        <button className="border-2 border-blue-700 text-blue-700 px-8 py-4 rounded-xl">
          🏭 Sono un'azienda
        </button>

      </div>

    </main>
  );
}