"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/admin/manager",
    label: "Manager",
  },
  {
    href: "/admin/richieste",
    label: "Richieste aziende",
  },
  {
    href: "/admin/matching",
    label: "Matching",
  },
  {
    href: "/admin/crm",
    label: "Statistiche",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col bg-[#071b33] px-5 py-7 text-white">

      <Link
        href="/admin/manager"
        className="mb-10 block"
      >
        <div className="text-xl font-bold">
          QuickSolve
        </div>

        <div className="mt-1 text-sm font-medium text-[#9ebbd8]">
          Management Network · CRM
        </div>
      </Link>

      <nav className="space-y-2">
        {links.map((item) => {
          const active =
            pathname.startsWith(
              item.href
            );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-white text-[#071b33]"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
        Backoffice interno
        <br />
        QuickSolve Management Network
      </div>

    </aside>
  );
}