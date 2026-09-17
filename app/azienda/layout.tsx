import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cerchi un Temporary Manager?",
  description:
    "Inserisci la tua richiesta su QuickSolve Management Network e descrivi il profilo manageriale, il contesto aziendale e le esigenze dell'incarico.",

  alternates: {
    canonical: "https://management.quicksolve.it/azienda",
  },

  openGraph: {
    title:
      "Cerchi un Temporary Manager? | QuickSolve Management Network",
    description:
      "QuickSolve Management Network aiuta le aziende a individuare manager compatibili con le esigenze organizzative, operative e strategiche dell'incarico.",
    url: "https://management.quicksolve.it/azienda",
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