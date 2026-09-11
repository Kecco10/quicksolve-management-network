import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://engineering.quicksolve.it"),

  title: {
    default: "QuickSolve Engineering Network | Progettazione Meccanica",
    template: "%s | QuickSolve Engineering Network",
  },

  description:
    "QuickSolve Engineering Network mette in contatto aziende e progettisti meccanici qualificati attraverso un sistema sviluppato per individuare i profili compatibili con le esigenze di ogni progetto.",

  applicationName: "QuickSolve Engineering Network",

  verification: {
    google: "2TgoGhAkwolL_jvKy3UQhKWImUPaJvO31xw5iYI2MSM",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://engineering.quicksolve.it",
    siteName: "QuickSolve Engineering Network",
    title: "QuickSolve Engineering Network | Progettazione Meccanica",
    description:
      "Il network italiano che mette in contatto aziende e progettisti meccanici qualificati.",
  },

  twitter: {
    card: "summary",
    title: "QuickSolve Engineering Network | Progettazione Meccanica",
    description:
      "Il network italiano che mette in contatto aziende e progettisti meccanici qualificati.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
