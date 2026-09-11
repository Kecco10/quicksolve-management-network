import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cerchi un Progettista Meccanico?",
  description:
    "Inserisci la tua richiesta su QuickSolve Engineering Network e individua progettisti meccanici compatibili con le esigenze tecniche e operative del tuo progetto.",

  alternates: {
    canonical: "https://engineering.quicksolve.it/azienda",
  },

  openGraph: {
    title:
      "Cerchi un Progettista Meccanico? | QuickSolve Engineering Network",
    description:
      "QuickSolve Engineering Network aiuta le aziende a individuare progettisti meccanici compatibili con le esigenze del progetto.",
    url: "https://engineering.quicksolve.it/azienda",
    type: "website",
  },
};

export default function AziendaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}