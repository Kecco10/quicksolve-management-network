import type { Metadata } from "next";
import type { ReactNode } from "react";

import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata: Metadata = {
  title:
    "CRM | QuickSolve Management Network",

  description:
    "Backoffice QuickSolve Management Network",
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}