import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Opportunità per Progettisti Meccanici",
  description:
    "Entra gratuitamente nella rete QuickSolve Engineering Network e renditi disponibile per opportunità professionali e collaborazioni nella progettazione meccanica.",

  alternates: {
    canonical: "https://engineering.quicksolve.it/progettista",
  },

  openGraph: {
    title:
      "Opportunità per Progettisti Meccanici | QuickSolve Engineering Network",
    description:
      "Registrati gratuitamente nella rete QuickSolve Engineering Network e renditi disponibile per opportunità professionali nella progettazione meccanica.",
    url: "https://engineering.quicksolve.it/progettista",
    type: "website",
  },
};

export default function ProgettistaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}