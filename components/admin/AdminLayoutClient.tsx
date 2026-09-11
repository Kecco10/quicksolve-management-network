"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

const mobileAdminLinks = [
  { href: "/admin/progettisti", label: "Progettisti" },
  { href: "/admin/richieste", label: "Richieste" },
  { href: "/admin/matching", label: "Matching" },
];

export default function AdminLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] text-neutral-900">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f6f2] text-neutral-900">
      <div className="flex min-h-screen">
        {/* Desktop: sidebar originale, invariata */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminHeader />

          {/* Mobile: navigazione compatta. Da lg in su non esiste visivamente. */}
          <nav className="border-b border-neutral-200 bg-white lg:hidden">
            <div className="flex w-full gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {mobileAdminLinks.map((item) => {
                const active = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-teal-700 text-white"
                        : "border border-neutral-200 bg-white text-neutral-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}