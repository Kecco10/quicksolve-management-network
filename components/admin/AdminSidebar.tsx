"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin/progettisti", label: "Progettisti" },
  { href: "/admin/richieste", label: "Richieste aziende" },
  { href: "/admin/matching", label: "Matching" },
  { href: "/admin/crm", label: "Panoramica CRM" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [unreadRequests, setUnreadRequests] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUnreadRequests() {
      try {
        const response = await fetch("/api/admin/request-notifications", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setUnreadRequests(
            typeof data?.unreadCount === "number" ? data.unreadCount : 0
          );
        }
      } catch {}
    }

    async function markRequestsAsSeen() {
      setUnreadRequests(0);
      try {
        await fetch("/api/admin/request-notifications", {
          method: "POST",
          cache: "no-store",
        });
      } catch {}
    }

    if (pathname === "/admin/richieste") {
      void markRequestsAsSeen();
      return () => { cancelled = true; };
    }

    void loadUnreadRequests();
    const intervalId = window.setInterval(loadUnreadRequests, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [pathname]);

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-neutral-200 md:bg-white">
      <div className="flex h-20 items-center border-b border-neutral-200 px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/crm" className="inline-flex shrink-0">
            <Image
              src="/quicksolve-logo.png"
              alt="QuickSolve"
              width={140}
              height={36}
              priority
              className="h-auto w-auto max-h-9"
            />
          </Link>
          <h2 className="text-lg font-semibold text-neutral-900">CRM interno</h2>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isRequestsItem = item.href === "/admin/richieste";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isRequestsItem) setUnreadRequests(0);
              }}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-teal-700 text-white"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <span>{item.label}</span>

              {isRequestsItem && unreadRequests > 0 ? (
                <span
                  className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    isActive ? "bg-white text-teal-700" : "bg-red-600 text-white"
                  }`}
                >
                  {unreadRequests > 99 ? "99+" : unreadRequests}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}