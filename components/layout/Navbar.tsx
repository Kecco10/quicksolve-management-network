export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">
            QuickSolve
          </h1>
          <p className="text-sm text-gray-500">
            Engineering Network
          </p>
        </div>

        <nav className="flex gap-6">
          <a href="#" className="hover:text-blue-700">Home</a>
          <a href="#" className="hover:text-blue-700">Progettisti</a>
          <a href="#" className="hover:text-blue-700">Aziende</a>
        </nav>
      </div>
    </header>
  );
}